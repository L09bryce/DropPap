import { FileService } from './FileService';

// Chunk size: 5MB
const CHUNK_SIZE = 5 * 1024 * 1024;

// Threshold for chunked upload (5MB)
const CHUNKED_UPLOAD_THRESHOLD = 5 * 1024 * 1024;

/**
 * GCS Upload Service
 * Smart upload service that automatically chooses between simple and chunked upload
 * based on file size. Provides progress tracking and abort capability.
 */
export const GcsUploadService = {
  // Store active upload sessions for abort capability
  _activeSessions: new Map(),

  /**
   * Upload a file to GCS with automatic chunking for large files
   * @param {File} file - The file to upload
   * @param {string} folderName - Optional folder name
   * @param {function} onProgress - Progress callback (0-100)
   * @returns {Promise<{success, fileId, gcsPath, fileName, fileSize}>}
   */
  uploadFile: async (file, folderName = null, onProgress = null) => {
    // Check quota first
    try {
      const isExceeded = await FileService.isQuotaExceeded();
      if (isExceeded) {
        const quotaStatus = await FileService.getQuotaStatus();
        const error = new Error('Storage quota exceeded');
        error.code = 'QUOTA_EXCEEDED';
        error.quotaInfo = quotaStatus;
        throw error;
      }
    } catch (error) {
      if (error.code === 'QUOTA_EXCEEDED') {
        throw error;
      }
      // If quota check fails, continue with upload (backend will reject if needed)
      console.warn('Quota check failed, continuing with upload:', error.message);
    }

    // Choose upload method based on file size
    if (file.size < CHUNKED_UPLOAD_THRESHOLD) {
      return GcsUploadService._simpleUpload(file, folderName, onProgress);
    } else {
      return GcsUploadService._chunkedUpload(file, folderName, onProgress);
    }
  },

  /**
   * Simple upload for small files (< 5MB)
   */
  _simpleUpload: async (file, folderName, onProgress) => {
    try {
      const result = await FileService.uploadToGcs(file, folderName, onProgress);
      return {
        success: true,
        fileId: result.fileId,
        gcsPath: result.gcsPath,
        fileName: result.fileName || file.name,
        fileSize: result.fileSize || file.size,
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Chunked upload for large files (>= 5MB)
   */
  _chunkedUpload: async (file, folderName, onProgress) => {
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    let uploadedBytes = 0;
    let sessionId = null;

    try {
      // 1. Initialize chunked upload
      const initResult = await FileService.initiateChunkedUpload(
        file.name,
        file.size,
        totalChunks
      );

      sessionId = initResult.sessionId;
      const fileId = initResult.fileId;

      // Store session for potential abort
      GcsUploadService._activeSessions.set(sessionId, {
        aborted: false,
        file: file.name,
      });

      // 2. Upload chunks
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        // Check if upload was aborted
        const session = GcsUploadService._activeSessions.get(sessionId);
        if (session?.aborted) {
          throw new Error('Upload cancelled by user');
        }

        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        await FileService.uploadChunk(sessionId, chunkIndex, chunk);

        // Update progress
        uploadedBytes += chunk.size;
        if (onProgress) {
          const percent = Math.round((uploadedBytes / file.size) * 100);
          onProgress(percent);
        }
      }

      // 3. Finalize upload
      const finalResult = await FileService.finalizeChunkedUpload(sessionId, folderName);

      // Clean up session
      GcsUploadService._activeSessions.delete(sessionId);

      return {
        success: true,
        fileId: fileId,
        gcsPath: finalResult.gcsPath,
        fileName: finalResult.fileName || file.name,
        fileSize: finalResult.fileSize || file.size,
      };

    } catch (error) {
      // Clean up session on error
      if (sessionId) {
        GcsUploadService._activeSessions.delete(sessionId);
      }
      throw error;
    }
  },

  /**
   * Abort an active upload
   * @param {string} sessionId - The session ID to abort
   */
  abortUpload: (sessionId) => {
    const session = GcsUploadService._activeSessions.get(sessionId);
    if (session) {
      session.aborted = true;
    }
  },

  /**
   * Upload multiple files with individual progress tracking
   * @param {File[]} files - Array of files to upload
   * @param {string} folderName - Optional folder name
   * @param {function} onFileProgress - Callback for individual file progress (fileIndex, progress)
   * @param {function} onFileComplete - Callback when a file completes (fileIndex, result)
   * @param {function} onFileError - Callback when a file fails (fileIndex, error)
   * @returns {Promise<Array<{success, fileId, gcsPath, fileName, fileSize, error?}>>}
   */
  uploadMultiple: async (files, folderName = null, onFileProgress = null, onFileComplete = null, onFileError = null) => {
    const results = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        const result = await GcsUploadService.uploadFile(
          file,
          folderName,
          (progress) => {
            if (onFileProgress) {
              onFileProgress(i, progress);
            }
          }
        );

        results.push(result);
        
        if (onFileComplete) {
          onFileComplete(i, result);
        }

      } catch (error) {
        const errorResult = {
          success: false,
          fileName: file.name,
          fileSize: file.size,
          error: error.message,
          errorCode: error.code,
        };

        results.push(errorResult);

        if (onFileError) {
          onFileError(i, error);
        }

        // If quota exceeded, stop uploading remaining files
        if (error.code === 'QUOTA_EXCEEDED') {
          // Mark remaining files as skipped
          for (let j = i + 1; j < files.length; j++) {
            results.push({
              success: false,
              fileName: files[j].name,
              fileSize: files[j].size,
              error: 'Skipped due to quota exceeded',
              errorCode: 'SKIPPED',
            });
          }
          break;
        }
      }
    }

    return results;
  },

  /**
   * Get the chunk size used for uploads
   */
  getChunkSize: () => CHUNK_SIZE,

  /**
   * Get the threshold for chunked uploads
   */
  getChunkedThreshold: () => CHUNKED_UPLOAD_THRESHOLD,
};

export default GcsUploadService;
