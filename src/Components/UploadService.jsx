/**
 * @deprecated This service is deprecated. Use GcsUploadService instead.
 * 
 * Migration guide:
 * 1. Import the new service: import { GcsUploadService } from '../services/GcsUploadService';
 * 2. Replace UploadService(file, onProgress) with GcsUploadService.uploadFile(file, folderName, onProgress)
 * 3. The new service returns an object: { success, fileId, gcsPath, fileName, fileSize }
 * 4. The new service automatically handles chunked uploads for large files
 * 
 * This file will be removed in a future version.
 */

import axios from 'axios';

// DEPRECATION WARNING - Log once per session
let deprecationWarned = false;
const warnDeprecation = () => {
  if (!deprecationWarned) {
    console.warn(
      '%c[DEPRECATED] UploadService is deprecated. Use GcsUploadService instead.',
      'color: orange; font-weight: bold;',
      '\nSee migration guide in UploadService.jsx'
    );
    deprecationWarned = true;
  }
};

const chunkSize = 5 * 1024 * 1024;

// Create axios instance with interceptor for JWT token
const uploadAxiosInstance = axios.create({
    baseURL: 'http://localhost:8081',
});

// Add interceptor to set Authorization header dynamically on each request
uploadAxiosInstance.interceptors.request.use(
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

/**
 * @deprecated Use GcsUploadService.uploadFile instead
 */
export const UploadService = async (file, onProgress) => {
    warnDeprecation();
    
    const totalChunks = Math.ceil(file.size / chunkSize);

    // 1. Initialize upload
    const initData = new FormData();
    initData.append('totalChunks', totalChunks);
    initData.append('file', file);

    try {
        const { data: uploadId } = await uploadAxiosInstance.post('/init', initData);

        // 2. Upload each chunk
        for (let i = 0; i < totalChunks; i++) {
            const start = i * chunkSize;
            const end = Math.min(start + chunkSize, file.size);
            const chunkBlob = file.slice(start, end);

            const chunkData = new FormData();
            chunkData.append('uploadId', uploadId);
            chunkData.append('chunkIndex', i);
            chunkData.append('chunk', chunkBlob, file.name);
            chunkData.append('folderName', 'uploads');

            await uploadAxiosInstance.post('/chunk', chunkData);

            const percent = Math.round(((i + 1) / totalChunks) * 100);
            onProgress(percent);
        }

        return uploadId;
    } catch (error) {
        console.error('Upload failed:', error);
        throw error;
    }
};