import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081';
const GCS_API_URL = `${API_BASE_URL}/api/gcs`;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Add interceptor to set Authorization header dynamically on each request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const FileService = {
  // Fetch all files for the current user
  fetchFiles: async (userId = null) => {
    try {
      const response = await axiosInstance.get('/fetchFiles');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching files:', error);
      return [];
    }
  },

  // Create a new folder
  createFolder: async (folderName) => {
    try {
      const response = await axiosInstance.post('/createFolder', null, {
        params: { folderName }
      });
      // Return the folder data from the backend response
      return {
        id: response.data.id || Date.now().toString(),
        name: response.data.name || folderName,
        type: 'folder',
        isFolder: true,
        createdAt: response.data.createdAt || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  },

  // Fetch all folders for the current user
  fetchFolders: async () => {
    try {
      const files = await FileService.fetchFiles();
      return files.filter(file => file.type === 'folder' || file.isFolder === true) || [];
    } catch (error) {
      console.error('Error fetching folders:', error);
      return [];
    }
  },

  // Fetch activities/notifications (Note: backend doesn't have activities endpoint, this is mock for now)
  fetchActivities: async () => {
    try {
      // Mock activities since backend doesn't have this endpoint yet
      return [
        {
          id: '1',
          type: 'upload',
          message: 'Files uploaded successfully',
          timestamp: new Date(),
          read: false,
        }
      ];
    } catch (error) {
      console.error('Error fetching activities:', error);
      return [];
    }
  },

  // Mark activity as read (Note: backend doesn't have this endpoint yet)
  markActivityAsRead: async (activityId) => {
    try {
      // Mock implementation since backend doesn't have this endpoint yet
      console.log(`Marked activity ${activityId} as read`);
      return { success: true };
    } catch (error) {
      console.error('Error marking activity as read:', error);
      throw error;
    }
  },

  // Upload file
  uploadFile: async (file, folderName = null) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (folderName) {
        formData.append('folderName', folderName);
      }

      const response = await axiosInstance.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  // Delete file
  deleteFile: async (fileName, fileID) => {
    try {
      const response = await axiosInstance.delete('/delete', {
        params: { fileName, fileID }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  },

  // Share file
  shareFile: async (email, accessLevel, fileName) => {
    try {
      const response = await axiosInstance.post('/share', null, {
        params: { email, accessLevel, fileName }
      });
      return response.data;
    } catch (error) {
      console.error('Error sharing file:', error);
      throw error;
    }
  },

  // Fetch files shared with the current user
  fetchSharedWithMe: async () => {
    try {
      const response = await axiosInstance.get('/fetchSharedWithMe');
      return (response.data || []).map((file) => ({
        id: file.fileID,
        fileID: file.fileID,
        name: file.fileName,
        fileName: file.fileName,
        size: file.fileSize,
        fileSize: file.fileSize,
        createdAt: file.uploadDate,
        uploadDate: file.uploadDate,
        gcsPath: file.gcsPath,
        storageType: file.storageType,
        shareID: file.shareID,
        sharedBy: file.sharedBy,
        accessLevel: file.accessLevel,
        isShared: true,
        type: 'file'
      }));
    } catch (error) {
      console.error('Error fetching shared files:', error);
      return [];
    }
  },

  // Fetch files the current user has shared with others
  fetchSharedByMe: async () => {
    try {
      const response = await axiosInstance.get('/fetchSharedByMe');
      return (response.data || []).map((file) => ({
        id: file.fileID,
        fileID: file.fileID,
        name: file.fileName,
        fileName: file.fileName,
        size: file.fileSize,
        fileSize: file.fileSize,
        createdAt: file.uploadDate,
        uploadDate: file.uploadDate,
        shareID: file.shareID,
        sharedWith: file.sharedWith,
        accessLevel: file.accessLevel,
        type: 'file'
      }));
    } catch (error) {
      console.error('Error fetching shared by me files:', error);
      return [];
    }
  },

  // Fetch folder contents
  fetchFolderContents: async (folderId) => {
    try {
      const response = await axiosInstance.get('/fetchFolderContents', {
        params: { folderId }
      });
      return (response.data || []).map((item) => ({
        ...item,
        type: item.type === 'folder' ? 'folder' : 'file'
      }));
    } catch (error) {
      console.error('Error fetching folder contents:', error);
      return [];
    }
  },

  // Download file
  downloadFile: async (fileId, fileName) => {
    try {
      const response = await axiosInstance.get('/download', {
        params: { fileId, fileName },
        responseType: 'blob'
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'download');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  },

  // Get a preview blob URL for a file (used by DocumentPreview)
  getPreviewBlobUrl: async (fileId, fileName) => {
    try {
      const response = await axiosInstance.get('/download', {
        params: { fileId, fileName },
        responseType: 'blob'
      });
      return window.URL.createObjectURL(new Blob([response.data]));
    } catch (error) {
      console.error('Error getting preview URL:', error);
      throw error;
    }
  },

  // ============================================
  // GCS Upload Methods
  // ============================================

  /**
   * Simple upload to GCS (for files < 5MB)
   * @param {File} file - File to upload
   * @param {string} folderName - Optional folder name
   * @param {function} onProgress - Progress callback (0-100)
   * @returns {Promise<{success, fileId, gcsPath, fileName, fileSize}>}
   */
  uploadToGcs: async (file, folderName = null, onProgress = null) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (folderName) {
        formData.append('folderName', folderName);
      }

      const response = await axiosInstance.post(`${GCS_API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading to GCS:', error);
      // Check for quota exceeded
      if (error.response?.status === 413 || error.response?.data?.message?.includes('quota')) {
        const quotaError = new Error('Storage quota exceeded');
        quotaError.code = 'QUOTA_EXCEEDED';
        quotaError.quotaInfo = error.response?.data?.quotaInfo;
        throw quotaError;
      }
      throw error;
    }
  },

  /**
   * Initialize a chunked upload session
   * @param {string} fileName - Name of the file
   * @param {number} fileSize - Total file size in bytes
   * @param {number} totalChunks - Number of chunks
   * @returns {Promise<{success, sessionId, fileId, totalChunks, chunkSize}>}
   */
  initiateChunkedUpload: async (fileName, fileSize, totalChunks) => {
    try {
      const response = await axiosInstance.post(`${GCS_API_URL}/initiate-chunked-upload`, null, {
        params: { fileName, fileSize, totalChunks }
      });
      return response.data;
    } catch (error) {
      console.error('Error initiating chunked upload:', error);
      // Check for quota exceeded
      if (error.response?.status === 413 || error.response?.data?.message?.includes('quota')) {
        const quotaError = new Error('Storage quota exceeded');
        quotaError.code = 'QUOTA_EXCEEDED';
        quotaError.quotaInfo = error.response?.data?.quotaInfo;
        throw quotaError;
      }
      throw error;
    }
  },

  /**
   * Upload a single chunk
   * @param {string} sessionId - Upload session ID
   * @param {number} chunkIndex - Index of this chunk (0-based)
   * @param {Blob} chunk - The chunk data
   * @returns {Promise<{success, sessionId, chunkIndex, chunkSize, processed}>}
   */
  uploadChunk: async (sessionId, chunkIndex, chunk) => {
    try {
      const formData = new FormData();
      formData.append('sessionId', sessionId);
      formData.append('chunkIndex', chunkIndex);
      formData.append('chunk', chunk);

      const response = await axiosInstance.post(`${GCS_API_URL}/upload-chunk`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading chunk:', error);
      throw error;
    }
  },

  /**
   * Finalize a chunked upload
   * @param {string} sessionId - Upload session ID
   * @param {string} folderName - Optional folder name
   * @returns {Promise<{success, message, sessionId, fileName, fileSize}>}
   */
  finalizeChunkedUpload: async (sessionId, folderName = null) => {
    try {
      const response = await axiosInstance.post(`${GCS_API_URL}/finalize-chunked-upload`, null, {
        params: { sessionId, folderName }
      });
      return response.data;
    } catch (error) {
      console.error('Error finalizing chunked upload:', error);
      throw error;
    }
  },

  /**
   * Get upload status for a session
   * @param {string} sessionId - Upload session ID
   * @returns {Promise<{sessionId, fileName, fileSize, totalChunks, uploadedBytes, progress, completed}>}
   */
  getUploadStatus: async (sessionId) => {
    try {
      const response = await axiosInstance.get(`${GCS_API_URL}/upload-status/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting upload status:', error);
      throw error;
    }
  },

  // ============================================
  // GCS Download / Preview Methods
  // ============================================

  /**
   * Get a signed URL for file download/preview
   * @param {string} gcsPath - GCS path of the file
   * @returns {Promise<string>} - Signed URL
   */
  getSignedUrl: async (gcsPath) => {
    try {
      const response = await axiosInstance.get(`${GCS_API_URL}/download-url`, {
        params: { path: gcsPath }
      });
      return response.data?.downloadUrl || response.data;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      throw error;
    }
  },

  /**
   * Prepare download (get file metadata + signed URL)
   * @param {string} gcsPath - GCS path of the file
   * @returns {Promise<{success, gcsPath, downloadUrl, fileName, fileSize, contentType}>}
   */
  prepareDownload: async (gcsPath) => {
    try {
      const response = await axiosInstance.get(`${GCS_API_URL}/prepare-download`, {
        params: { path: gcsPath }
      });
      return response.data;
    } catch (error) {
      console.error('Error preparing download:', error);
      throw error;
    }
  },

  // ============================================
  // Quota Methods
  // ============================================

  /**
   * Get user's quota status
   * @returns {Promise<{usedBytes, maxBytes, usedPercentage, remaining, alerts}>}
   */
  getQuotaStatus: async () => {
    try {
      const response = await axiosInstance.get(`${GCS_API_URL}/quota/status`);
      return response.data;
    } catch (error) {
      console.error('Error getting quota status:', error);
      throw error;
    }
  },

  /**
   * Check if quota is exceeded
   * @returns {Promise<boolean>}
   */
  isQuotaExceeded: async () => {
    try {
      const response = await axiosInstance.get(`${GCS_API_URL}/quota/exceeded`);
      return response.data?.exceeded || false;
    } catch (error) {
      console.error('Error checking quota:', error);
      return false;
    }
  },

  // ============================================
  // Google Drive Import
  // ============================================

  /**
   * Import a file from Google Drive
   * @param {string} fileId - Google Drive file ID
   * @param {string} fileName - File name
   * @param {string} mimeType - MIME type
   * @param {string} accessToken - Google OAuth access token
   * @returns {Promise<{success, message, fileName, fileId}>}
   */
  importFromDrive: async (fileId, fileName, mimeType, accessToken) => {
    try {
      const response = await axiosInstance.post('/downloadDrive', {
        fileId,
        fileName,
        mimeType,
        accessToken
      });
      return response.data;
    } catch (error) {
      console.error('Error importing from Drive:', error);
      throw error;
    }
  },

  // ============================================
  // File Edit (Google Docs Integration)
  // ============================================

  /**
   * Start editing a .docx file by exporting to Google Drive and opening in Google Docs
   * @param {string} fileId - File UUID
   * @param {string} accessToken - Google OAuth access token
   * @param {string} email - User email for permission check
   * @returns {Promise<{editUrl, googleFileId}>}
   */
  editFile: async (fileId, accessToken, email) => {
    try {
      const response = await axiosInstance.post(`/files/${fileId}/edit`, {
        accessToken,
        email
      });
      return response.data;
    } catch (error) {
      console.error('Error starting file edit:', error);
      throw error;
    }
  },

  /**
   * Sync changes from Google Docs back to the system
   * @param {string} fileId - Original file UUID
   * @param {string} googleFileId - Google Drive file ID
   * @param {string} accessToken - Google OAuth access token
   * @returns {Promise<{success, message}>}
   */
  syncFile: async (fileId, googleFileId, accessToken) => {
    try {
      const response = await axiosInstance.post('/files/sync', {
        fileId,
        googleFileId,
        accessToken
      });
      return response.data;
    } catch (error) {
      console.error('Error syncing file:', error);
      throw error;
    }
  },

  // ============================================
  // Share to All (Dean/HOD only)
  // ============================================

  /**
   * Get department members count and list (Dean/HOD only)
   * @param {string} email - User's email
   * @returns {Promise<{count: number, members: string[]}>}
   */
  getDepartmentMembers: async (email) => {
    try {
      const response = await axiosInstance.get('/getDepartmentMembers', {
        params: { email }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting department members:', error);
      return { count: 0, members: [] };
    }
  },

  /**
   * Share a file to all users in the department (Dean/HOD only)
   * @param {string} email - Sender's email
   * @param {string} accessLevel - Access level (VIEW, EDITOR, OWNER)
   * @param {string} fileName - File name to share
   * @returns {Promise<string>}
   */
  shareToAll: async (email, accessLevel, fileName) => {
    try {
      const response = await axiosInstance.post('/sharetoAll', null, {
        params: { email, accessLevel, fileName }
      });
      return response.data;
    } catch (error) {
      console.error('Error sharing to all:', error);
      throw error;
    }
  },

  // ============================================
  // Deleted Files Management
  // ============================================

  /**
   * Move file to trash (soft delete)
   * @param {string} fileName - File name
   * @param {string} fileID - File UUID
   * @returns {Promise<{success, message}>}
   */
  moveToTrash: async (fileName, fileID) => {
    try {
      const response = await axiosInstance.post('/moveToTrash', null, {
        params: { fileName, fileID }
      });
      return response.data;
    } catch (error) {
      console.error('Error moving to trash:', error);
      throw error;
    }
  },

  /**
   * Fetch all deleted files for current user
   * @returns {Promise<Array>}
   */
  fetchDeletedFiles: async () => {
    try {
      const response = await axiosInstance.get('/fetchDeletedFiles');
      return (response.data || []).map((file) => ({
        id: file.fileID,
        fileID: file.fileID,
        name: file.fileName,
        fileName: file.fileName,
        size: file.fileSize,
        fileSize: file.fileSize,
        deletedAt: file.deletedAt,
        gcsPath: file.gcsPath,
        type: 'file'
      }));
    } catch (error) {
      console.error('Error fetching deleted files:', error);
      return [];
    }
  },

  /**
   * Restore a file from trash
   * @param {string} fileID - File UUID
   * @returns {Promise<{success, message}>}
   */
  restoreFile: async (fileID) => {
    try {
      const response = await axiosInstance.post('/restoreFile', null, {
        params: { fileID }
      });
      return response.data;
    } catch (error) {
      console.error('Error restoring file:', error);
      throw error;
    }
  },

  /**
   * Permanently delete a file
   * @param {string} fileName - File name
   * @param {string} fileID - File UUID
   * @returns {Promise<string>}
   */
  permanentDelete: async (fileName, fileID) => {
    try {
      const response = await axiosInstance.delete('/permanentDelete', {
        params: { fileName, fileID }
      });
      return response.data;
    } catch (error) {
      console.error('Error permanently deleting:', error);
      throw error;
    }
  },

  // ============================================
  // Folder Management
  // ============================================

  /**
   * Get files inside a specific folder
   * @param {string} folderName - Folder name
   * @returns {Promise<Array>}
   */
  getFilesInFolder: async (folderName) => {
    try {
      const response = await axiosInstance.get('/fetchFilesInFolder', {
        params: { folderName }
      });
      return (response.data || []).map((file) => ({
        id: file.fileID,
        fileID: file.fileID,
        name: file.fileName,
        fileName: file.fileName,
        size: file.fileSize,
        fileSize: file.fileSize,
        createdAt: file.uploadDate,
        gcsPath: file.gcsPath,
        type: 'file'
      }));
    } catch (error) {
      console.error('Error fetching folder contents:', error);
      return [];
    }
  },

  /**
   * Add/move a file to a folder
   * @param {string} fileID - File UUID
   * @param {string} folderName - Target folder name
   * @returns {Promise<{success, message}>}
   */
  addFileToFolder: async (fileID, folderName) => {
    try {
      const response = await axiosInstance.post('/addFileToFolder', null, {
        params: { fileID, folderName }
      });
      return response.data;
    } catch (error) {
      console.error('Error adding file to folder:', error);
      throw error;
    }
  },

  /**
   * Delete a folder and optionally its contents
   * @param {string} folderName - Folder name
   * @param {boolean} deleteContents - Whether to delete files inside
   * @returns {Promise<{success, message}>}
   */
  deleteFolder: async (folderName, deleteContents = false) => {
    try {
      const response = await axiosInstance.delete('/deleteFolder', {
        params: { folderName, deleteContents }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting folder:', error);
      throw error;
    }
  },

  /**
   * Get all folders for the current user
   * @returns {Promise<Array>}
   */
  fetchAllFolders: async () => {
    try {
      const response = await axiosInstance.get('/fetchAllFolders');
      return (response.data || []).map((folder) => ({
        id: folder.id || folder.fileID || folder.folderName,
        name: folder.name || folder.folderName || folder.fileName,
        createdAt: folder.createdAt || folder.uploadDate,
        fileCount: folder.fileCount || 0,
        type: 'folder',
        isFolder: true
      }));
    } catch (error) {
      console.error('Error fetching folders:', error);
      return [];
    }
  },

  /**
   * Get user role (to check if Dean/HOD)
   * @param {string} email - User email
   * @returns {Promise<number>} - Role value (2 = Dean/HOD)
   */
  getUserRole: async (email) => {
    try {
      const response = await axiosInstance.get('/getUserRole', {
        params: { email }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting user role:', error);
      return 0;
    }
  },

  // ============================================
  // Department Files (Files shared by HOD/Dean)
  // ============================================

  /**
   * Fetch files shared to the department by HOD/Dean
   * @returns {Promise<Array>} - Array of department-shared files
   */
  fetchDepartmentFiles: async () => {
    try {
      const response = await axiosInstance.get('/fetchDepartmentFiles');
      return (response.data || []).map((file) => ({
        id: file.fileID,
        fileID: file.fileID,
        name: file.fileName,
        fileName: file.fileName,
        size: file.fileSize,
        fileSize: file.fileSize,
        createdAt: file.uploadDate,
        uploadDate: file.uploadDate,
        gcsPath: file.gcsPath,
        storageType: file.storageType,
        shareID: file.shareID,
        sharedBy: file.sharedBy,
        accessLevel: file.accessLevel,
        isDepartmentShared: true,
        type: 'file'
      }));
    } catch (error) {
      console.error('Error fetching department files:', error);
      return [];
    }
  },
};
