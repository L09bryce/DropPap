import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import MainContentHeader from './MainContentHeader';
import FileGrid from './FileGrid';
import ActivityPanel from './ActivityPanel';
import PreviewModal from './PreviewModal';
import UploadToast from './UploadToast';
import QuotaExceededModal from './QuotaExceededModal';
import ShareModal from './ShareModal';
import { useDrivePicker } from './Drivepicker';
import DeletedFilesView from './DeletedFilesView';
import FolderView from './FolderView';
import { FileService } from '../services/FileService';
import { GcsUploadService } from '../services/GcsUploadService';
import { useTheme } from '../contexts/ThemeContext';

const HomePage = () => {
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [sharedFiles, setSharedFiles] = useState([]);
  const [deletedFiles, setDeletedFiles] = useState([]);
  const [departmentFiles, setDepartmentFiles] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [isSecondarySidebarOpen, setIsSecondarySidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Current view: 'all' | 'shared' | 'deleted' | 'folder' | 'department'
  const [currentView, setCurrentView] = useState('all');
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderFiles, setFolderFiles] = useState([]);

  // Upload state
  const [uploads, setUploads] = useState([]);
  const [showUploadToast, setShowUploadToast] = useState(false);
  
  // Quota modal state
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [quotaInfo, setQuotaInfo] = useState(null);
  
  // Drive import loading state
  const [driveImportLoading, setDriveImportLoading] = useState(false);

  // Share modal state
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [fileToShare, setFileToShare] = useState(null);

  // User role for share to all
  const [userRole, setUserRole] = useState(0);
  const [userEmail, setUserEmail] = useState('');

  // Edit file state
  const [editingFile, setEditingFile] = useState(null);
  const [editUrl, setEditUrl] = useState(null);

  // Drive Picker hook
  const { openPicker, isLoading: drivePickerLoading, pickerReady } = useDrivePicker();

  // Load initial data
  useEffect(() => {
    loadInitialData();
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      // Get user email from localStorage
      const email = localStorage.getItem('userEmail') || '';
      const cachedRole = localStorage.getItem('userRole');
      
      console.log('Loading user info for email:', email);
      console.log('Cached role:', cachedRole);
      
      setUserEmail(email);
      
      // Use cached role if available, otherwise fetch from API
      if (cachedRole !== null && cachedRole !== undefined) {
        const roleNum = parseInt(cachedRole, 10);
        console.log('Using cached role:', roleNum);
        setUserRole(roleNum);
      } else if (email) {
        const role = await FileService.getUserRole(email);
        console.log('User role fetched from API:', role);
        setUserRole(role);
        // Cache for next time
        localStorage.setItem('userRole', role);
      } else {
        console.log('No user email found in localStorage');
      }
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [fetchedFiles, fetchedFolders, fetchedActivities] = await Promise.all([
        FileService.fetchFiles(),
        FileService.fetchAllFolders(),
        FileService.fetchActivities(),
      ]);

      setFiles(fetchedFiles.map((f) => ({ 
        ...f, 
        type: 'file',
        id: f.fileID || f.id,
        name: f.fileName || f.name,
      })));
      setFolders(fetchedFolders.map((f) => ({ ...f, type: 'folder' })));
      setActivities(fetchedActivities);
    } catch (error) {
      console.error('Error loading data:', error);
      setFiles([]);
      setFolders([]);
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load shared files
  const loadSharedFiles = async () => {
    setIsLoading(true);
    try {
      const fetchedSharedFiles = await FileService.fetchSharedWithMe();
      setSharedFiles(fetchedSharedFiles);
    } catch (error) {
      console.error('Error loading shared files:', error);
      setSharedFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load deleted files
  const loadDeletedFiles = async () => {
    setIsLoading(true);
    try {
      const fetchedDeletedFiles = await FileService.fetchDeletedFiles();
      setDeletedFiles(fetchedDeletedFiles);
    } catch (error) {
      console.error('Error loading deleted files:', error);
      setDeletedFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load files in a folder
  const loadFolderFiles = async (folderName) => {
    setIsLoading(true);
    try {
      const filesInFolder = await FileService.getFilesInFolder(folderName);
      setFolderFiles(filesInFolder);
    } catch (error) {
      console.error('Error loading folder files:', error);
      setFolderFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load department files (shared by HOD/Dean)
  const loadDepartmentFiles = async () => {
    setIsLoading(true);
    try {
      const fetchedDepartmentFiles = await FileService.fetchDepartmentFiles();
      setDepartmentFiles(fetchedDepartmentFiles);
    } catch (error) {
      console.error('Error loading department files:', error);
      setDepartmentFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle view change to "All Files"
  const handleAllFilesClick = async () => {
    setCurrentView('all');
    setCurrentFolder(null);
    setPreviewItem(null);
    setIsPreviewOpen(false);
    setIsLoading(true);
    try {
      const fetchedFiles = await FileService.fetchFiles();
      setFiles(fetchedFiles.map((f) => ({ 
        ...f, 
        type: 'file',
        id: f.fileID || f.id,
        name: f.fileName || f.name,
      })));
    } catch (error) {
      console.error('Error fetching all files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle view change to "Shared with me"
  const handleSharedClick = async () => {
    setCurrentView('shared');
    setCurrentFolder(null);
    setPreviewItem(null);
    setIsPreviewOpen(false);
    await loadSharedFiles();
  };

  // Handle view change to "Deleted Files"
  const handleDeletedFilesClick = async () => {
    setCurrentView('deleted');
    setCurrentFolder(null);
    setPreviewItem(null);
    setIsPreviewOpen(false);
    await loadDeletedFiles();
  };

  // Handle view change to "Department" (files shared by HOD/Dean)
  const handleDepartmentClick = async () => {
    setCurrentView('department');
    setCurrentFolder(null);
    setPreviewItem(null);
    setIsPreviewOpen(false);
    await loadDepartmentFiles();
  };

  // Handle folder click - view folder contents
  const handleFolderClick = async (folderId) => {
    const folder = folders.find(f => f.id === folderId);
    if (folder) {
      setCurrentView('folder');
      setCurrentFolder(folder);
      setPreviewItem(null);
      setIsPreviewOpen(false);
      await loadFolderFiles(folder.name);
    }
  };

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query.toLowerCase());
  };

  // Filter items based on search query and current view
  const getFilteredItems = () => {
    if (currentView === 'shared') {
      return sharedFiles.filter((f) => {
        const name = f.name || f.fileName || '';
        return name.toLowerCase().includes(searchQuery);
      });
    }
    
    if (currentView === 'deleted') {
      return deletedFiles.filter((f) => {
        const name = f.name || f.fileName || '';
        return name.toLowerCase().includes(searchQuery);
      });
    }

    if (currentView === 'department') {
      return departmentFiles.filter((f) => {
        const name = f.name || f.fileName || '';
        return name.toLowerCase().includes(searchQuery);
      });
    }

    if (currentView === 'folder') {
      return folderFiles.filter((f) => {
        const name = f.name || f.fileName || '';
        return name.toLowerCase().includes(searchQuery);
      });
    }
    
    return [
      ...folders.filter((f) => f.name && f.name.toLowerCase().includes(searchQuery)),
      ...files.filter((f) => {
        const name = f.name || f.fileName || '';
        return name.toLowerCase().includes(searchQuery);
      }),
    ];
  };

  const filteredItems = getFilteredItems();

  // Handle create folder
  const handleCreateFolder = async (folderName) => {
    try {
      const newFolder = await FileService.createFolder(folderName);
      setFolders([...folders, { ...newFolder, type: 'folder' }]);

      const activity = {
        id: Date.now().toString(),
        type: 'folder',
        message: `Created folder "${folderName}"`,
        timestamp: new Date(),
        read: false,
      };
      setActivities([activity, ...activities]);
    } catch (error) {
      console.error('Error creating folder:', error);
      alert('Failed to create folder');
    }
  };

  // Handle upload files with GCS and toast notifications
  const handleUploadFiles = (targetFolder = null) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = async (e) => {
      const selectedFiles = Array.from(e.target.files);
      if (selectedFiles.length === 0) return;

      const folderName = targetFolder || (currentView === 'folder' ? currentFolder?.name : null);

      const newUploads = selectedFiles.map((f, i) => ({
        id: `upload-${Date.now()}-${i}`,
        fileName: f.name,
        fileSize: f.size,
        file: f,
        progress: 0,
        status: 'waiting'
      }));

      setUploads(newUploads);
      setShowUploadToast(true);

      for (let i = 0; i < newUploads.length; i++) {
        const upload = newUploads[i];
        
        setUploads(prev => prev.map(u => 
          u.id === upload.id ? { ...u, status: 'uploading' } : u
        ));

        try {
          const result = await GcsUploadService.uploadFile(
            upload.file,
            folderName,
            (progress) => {
              setUploads(prev => prev.map(u =>
                u.id === upload.id ? { ...u, progress } : u
              ));
            }
          );

          setUploads(prev => prev.map(u =>
            u.id === upload.id ? { ...u, status: 'done', progress: 100 } : u
          ));

          const newFile = {
            id: result.fileId,
            fileID: result.fileId,
            name: result.fileName,
            fileName: result.fileName,
            type: 'file',
            size: result.fileSize,
            fileSize: result.fileSize,
            gcsPath: result.gcsPath,
            folderName: folderName,
            createdAt: new Date(),
          };
          
          if (currentView === 'folder' && folderName) {
            setFolderFiles(prev => [newFile, ...prev]);
          } else {
            setFiles(prev => [newFile, ...prev]);
          }

          const activity = {
            id: Date.now().toString() + Math.random(),
            type: 'upload',
            message: `Uploaded "${result.fileName}"${folderName ? ` to ${folderName}` : ''}`,
            timestamp: new Date(),
            read: false,
          };
          setActivities(prev => [activity, ...prev]);

        } catch (error) {
          console.error('Upload failed:', error);

          if (error.code === 'QUOTA_EXCEEDED') {
            setQuotaInfo(error.quotaInfo || {
              usedBytes: 0,
              maxBytes: 5 * 1024 * 1024 * 1024
            });
            setShowQuotaModal(true);
          }

          setUploads(prev => prev.map(u =>
            u.id === upload.id ? { 
              ...u, 
              status: 'error', 
              error: error.code === 'QUOTA_EXCEEDED' ? 'Quota exceeded' : error.message 
            } : u
          ));

          if (error.code === 'QUOTA_EXCEEDED') {
            setUploads(prev => prev.map(u => {
              if (u.status === 'waiting') {
                return { ...u, status: 'error', error: 'Skipped - quota exceeded' };
              }
              return u;
            }));
            break;
          }
        }
      }

      loadInitialData();
    };
    input.click();
  };

  // Handle upload folder
  const handleUploadFolder = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.webkitdirectory = true;
    input.multiple = true;
    input.onchange = async (e) => {
      const selectedFiles = Array.from(e.target.files);
      if (selectedFiles.length === 0) return;

      const folderName = selectedFiles[0]?.webkitRelativePath?.split('/')[0] || 'Uploaded Folder';

      const newUploads = selectedFiles.map((f, i) => ({
        id: `upload-${Date.now()}-${i}`,
        fileName: f.name,
        fileSize: f.size,
        file: f,
        progress: 0,
        status: 'waiting'
      }));

      setUploads(newUploads);
      setShowUploadToast(true);

      for (let i = 0; i < newUploads.length; i++) {
        const upload = newUploads[i];
        
        setUploads(prev => prev.map(u => 
          u.id === upload.id ? { ...u, status: 'uploading' } : u
        ));

        try {
          await GcsUploadService.uploadFile(
            upload.file,
            folderName,
            (progress) => {
              setUploads(prev => prev.map(u =>
                u.id === upload.id ? { ...u, progress } : u
              ));
            }
          );

          setUploads(prev => prev.map(u =>
            u.id === upload.id ? { ...u, status: 'done', progress: 100 } : u
          ));

        } catch (error) {
          if (error.code === 'QUOTA_EXCEEDED') {
            setQuotaInfo(error.quotaInfo);
            setShowQuotaModal(true);
          }
          
          setUploads(prev => prev.map(u =>
            u.id === upload.id ? { ...u, status: 'error', error: error.message } : u
          ));

          if (error.code === 'QUOTA_EXCEEDED') break;
        }
      }

      loadInitialData();
    };
    input.click();
  };

  // Handle import from drive
  const handleImportFromDrive = () => {
    // Check if user has Google access token (try both possible storage keys)
    const googleToken = localStorage.getItem('googleAccessToken');
    const jwtToken = localStorage.getItem('token');
    
    console.log('Import from Drive - Token check:');
    console.log('  Google Access Token:', googleToken ? 'Present' : 'Missing');
    console.log('  JWT Token:', jwtToken ? 'Present' : 'Missing');
    
    if (!googleToken) {
      alert('Please sign in with Google first to import files from Drive.\n\nNote: Regular login does not provide Google Drive access. Use "Sign in with Google" option.');
      return;
    }
    
    if (!jwtToken) {
      alert('Authentication token is missing. Please log in again.');
      return;
    }

    if (!pickerReady) {
      alert('Google Drive Picker is loading. Please try again in a moment.');
      return;
    }

    setDriveImportLoading(true);
    
    openPicker({
      onSuccess: (importedFile) => {
        console.log('Drive import successful:', importedFile);
        setDriveImportLoading(false);
        
        const newFile = {
          id: importedFile.fileId,
          fileID: importedFile.fileId,
          name: importedFile.fileName,
          fileName: importedFile.fileName,
          type: 'file',
          gcsPath: importedFile.gcsPath,
          createdAt: new Date(),
        };
        setFiles(prev => [newFile, ...prev]);

        const activity = {
          id: Date.now().toString(),
          type: 'import',
          message: `Imported "${importedFile.fileName}" from Google Drive`,
          timestamp: new Date(),
          read: false,
        };
        setActivities(prev => [activity, ...prev]);

        loadInitialData();
      },
      onError: (error) => {
        console.error('Drive import failed:', error);
        setDriveImportLoading(false);
        alert(`Failed to import from Google Drive: ${error.message}`);
      },
      onCancel: () => {
        setDriveImportLoading(false);
      }
    });
  };

  // Handle activity mark as read
  const handleMarkActivityAsRead = async (activityId) => {
    try {
      await FileService.markActivityAsRead(activityId);
      setActivities(
        activities.map((a) => (a.id === activityId ? { ...a, read: true } : a))
      );
    } catch (error) {
      console.error('Error marking activity as read:', error);
    }
  };

  // Handle delete file (move to trash)
  const handleDeleteFile = async (file) => {
    const fileName = file.name || file.fileName;
    const fileId = file.id || file.fileID;
    
    if (window.confirm(`Move "${fileName}" to trash?`)) {
      try {
        await FileService.moveToTrash(fileName, fileId);
        
        // Remove from current view
        if (currentView === 'folder') {
          setFolderFiles(prev => prev.filter(f => (f.id || f.fileID) !== fileId));
        } else {
          setFiles(prev => prev.filter(f => (f.id || f.fileID) !== fileId));
        }

        const activity = {
          id: Date.now().toString(),
          type: 'delete',
          message: `Moved "${fileName}" to trash`,
          timestamp: new Date(),
          read: false,
        };
        setActivities([activity, ...activities]);
      } catch (error) {
        console.error('Error moving to trash:', error);
        alert('Failed to move file to trash');
      }
    }
  };

  // Handle restore file from trash
  const handleRestoreFile = async (file) => {
    const fileId = file.id || file.fileID;
    const fileName = file.name || file.fileName;
    
    try {
      await FileService.restoreFile(fileId);
      setDeletedFiles(prev => prev.filter(f => (f.id || f.fileID) !== fileId));

      const activity = {
        id: Date.now().toString(),
        type: 'restore',
        message: `Restored "${fileName}" from trash`,
        timestamp: new Date(),
        read: false,
      };
      setActivities([activity, ...activities]);
      
      // Refresh files
      loadInitialData();
    } catch (error) {
      console.error('Error restoring file:', error);
      alert('Failed to restore file');
    }
  };

  // Handle permanent delete
  const handlePermanentDelete = async (file) => {
    const fileName = file.name || file.fileName;
    const fileId = file.id || file.fileID;
    
    if (window.confirm(`Permanently delete "${fileName}"? This cannot be undone.`)) {
      try {
        await FileService.permanentDelete(fileName, fileId);
        setDeletedFiles(prev => prev.filter(f => (f.id || f.fileID) !== fileId));

        const activity = {
          id: Date.now().toString(),
          type: 'delete',
          message: `Permanently deleted "${fileName}"`,
          timestamp: new Date(),
          read: false,
        };
        setActivities([activity, ...activities]);
      } catch (error) {
        console.error('Error permanently deleting:', error);
        alert('Failed to delete file');
      }
    }
  };

  // Handle share file - opens modal
  const handleShareFile = (file) => {
    setFileToShare(file);
    setShareModalOpen(true);
  };

  // Handle share submit from modal
  const handleShareSubmit = async (file, email, accessLevel) => {
    const fileName = file.name || file.fileName;
    
    await FileService.shareFile(email, accessLevel, fileName);
    
    const activity = {
      id: Date.now().toString(),
      type: 'share',
      message: `Shared "${fileName}" with ${email}`,
      timestamp: new Date(),
      read: false,
    };
    setActivities([activity, ...activities]);
  };

  // Handle share to all (Dean/HOD only)
  const handleShareToAll = async (file, accessLevel) => {
    if (userRole !== 1 && userRole !== 2) {
      alert('Only Dean/HOD can share to all department members');
      return;
    }

    const fileName = file.name || file.fileName;
    
    try {
      await FileService.shareToAll(userEmail, accessLevel, fileName);
      
      const activity = {
        id: Date.now().toString(),
        type: 'share',
        message: `Shared "${fileName}" with entire department`,
        timestamp: new Date(),
        read: false,
      };
      setActivities([activity, ...activities]);
      
      alert('File shared with all department members!');
    } catch (error) {
      console.error('Error sharing to all:', error);
      alert('Failed to share to all');
    }
  };

  // Handle edit file (Google Docs integration)
  const handleEditFile = async (file) => {
    const fileName = file.name || file.fileName;
    const fileId = file.id || file.fileID;
    
    // Check if it's a .docx file
    if (!fileName.toLowerCase().endsWith('.docx')) {
      alert('Only .docx files can be edited in Google Docs');
      return;
    }

    const accessToken = localStorage.getItem('googleAccessToken') || localStorage.getItem('accessToken');
    if (!accessToken) {
      alert('Please sign in with Google to edit files');
      return;
    }

    try {
      const result = await FileService.editFile(fileId, accessToken, userEmail);
      
      if (result === 'unauthorized') {
        alert('You do not have permission to edit this file');
        return;
      }

      // Save the file with googleFileId for later sync
      setEditingFile({
        ...file,
        googleFileId: result.googleFileId
      });

      // If result contains an edit URL, open it
      if (result.editUrl) {
        window.open(result.editUrl, '_blank');
        setEditUrl(result.editUrl);
      }
      
      const activity = {
        id: Date.now().toString(),
        type: 'edit',
        message: `Started editing "${fileName}" in Google Docs`,
        timestamp: new Date(),
        read: false,
      };
      setActivities([activity, ...activities]);
    } catch (error) {
      console.error('Error starting edit:', error);
      alert('Failed to open file for editing');
      setEditingFile(null);
    }
  };

  // Handle sync file after editing
  const handleSyncFile = async () => {
    if (!editingFile) return;
    
    const accessToken = localStorage.getItem('googleAccessToken') || localStorage.getItem('accessToken');
    const fileId = editingFile.id || editingFile.fileID;
    const googleFileId = editingFile.googleFileId;
    
    if (!googleFileId) {
      console.error('No googleFileId found for sync');
      alert('Cannot sync: Google Drive file ID not found');
      return;
    }
    
    try {
      await FileService.syncFile(fileId, googleFileId, accessToken);
      
      const activity = {
        id: Date.now().toString(),
        type: 'sync',
        message: `Synced "${editingFile.name || editingFile.fileName}" from Google Docs`,
        timestamp: new Date(),
        read: false,
      };
      setActivities([activity, ...activities]);
      
      setEditingFile(null);
      setEditUrl(null);
      loadInitialData();
      
      alert('File synced successfully!');
    } catch (error) {
      console.error('Error syncing file:', error);
      alert('Failed to sync file');
    }
  };

  // Handle add file to folder
  const handleAddFileToFolder = async (file, folderName) => {
    const fileId = file.id || file.fileID;
    
    try {
      await FileService.addFileToFolder(fileId, folderName);
      
      // Remove from current view and refresh
      setFiles(prev => prev.filter(f => (f.id || f.fileID) !== fileId));
      
      const activity = {
        id: Date.now().toString(),
        type: 'move',
        message: `Moved "${file.name || file.fileName}" to ${folderName}`,
        timestamp: new Date(),
        read: false,
      };
      setActivities([activity, ...activities]);
    } catch (error) {
      console.error('Error adding file to folder:', error);
      alert('Failed to add file to folder');
    }
  };

  // Handle delete folder
  const handleDeleteFolder = async (folder) => {
    const folderName = folder.name;
    
    const deleteContents = window.confirm(
      `Delete folder "${folderName}" and all its contents?\n\nClick OK to delete contents, or Cancel and then delete to keep files.`
    );
    
    if (window.confirm(`Delete folder "${folderName}"?`)) {
      try {
        await FileService.deleteFolder(folderName, deleteContents);
        setFolders(prev => prev.filter(f => f.name !== folderName));
        
        const activity = {
          id: Date.now().toString(),
          type: 'delete',
          message: `Deleted folder "${folderName}"`,
          timestamp: new Date(),
          read: false,
        };
        setActivities([activity, ...activities]);

        if (currentView === 'folder' && currentFolder?.name === folderName) {
          handleAllFilesClick();
        }
      } catch (error) {
        console.error('Error deleting folder:', error);
        alert('Failed to delete folder');
      }
    }
  };

  // Handle item click (file or folder)
  const handleItemClick = (item) => {
    if (item.type === 'folder') {
      handleFolderClick(item.id);
    } else {
      setPreviewItem(item);
      setIsPreviewOpen(true);
    }
  };

  // Handle close preview
  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setPreviewItem(null);
  };

  // Handle file preview click (when inside a folder view)
  const handleFileInFolderClick = (file) => {
    setPreviewItem(file);
  };

  // Handle download file
  const handleDownloadFile = async (file) => {
    const fileName = file.name || file.fileName;
    const fileId = file.id || file.fileID;
    
    try {
      if (file.gcsPath) {
        const signedUrl = await FileService.getSignedUrl(file.gcsPath);
        const link = document.createElement('a');
        link.href = signedUrl;
        link.download = fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        await FileService.downloadFile(fileId, fileName);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file');
    }
  };

  // Handle cancel upload
  const handleCancelUpload = (uploadId) => {
    setUploads(prev => prev.map(u =>
      u.id === uploadId ? { ...u, status: 'error', error: 'Cancelled' } : u
    ));
  };

  // Handle close upload toast
  const handleCloseUploadToast = () => {
    setShowUploadToast(false);
    setTimeout(() => setUploads([]), 300);
  };

  // Handle quota modal actions
  const handleUpgrade = (planName) => {
    alert(`Upgrade to ${planName} - Coming Soon!`);
    setShowQuotaModal(false);
  };

  const handleDeleteFilesForQuota = () => {
    setShowQuotaModal(false);
    handleDeletedFilesClick();
  };

  // Get current view title
  const getViewTitle = () => {
    switch (currentView) {
      case 'shared':
        return 'Shared with me';
      case 'deleted':
        return 'Deleted Files';
      case 'department':
        return 'Department Files';
      case 'folder':
        return currentFolder?.name || 'Folder';
      default:
        return 'All Files';
    }
  };

  const bgClass = {
    light: 'bg-gray-50',
    dark: 'bg-gray-900',
    'dark-blue': 'bg-slate-950',
  }[theme];

  const unreadCount = activities.filter((a) => !a.read).length;

  return (
    <div className={`${bgClass} h-screen flex flex-col overflow-hidden`}>
      {/* Sidebar */}
      <Sidebar
        folders={folders}
        onFolderClick={handleFolderClick}
        onCreateFolder={handleCreateFolder}
        onActivityClick={() => setIsActivityOpen(!isActivityOpen)}
        unreadCount={unreadCount}
        onSecondarySidebarToggle={setIsSecondarySidebarOpen}
        onAllFilesClick={handleAllFilesClick}
        onSharedClick={handleSharedClick}
        onDeletedFilesClick={handleDeletedFilesClick}
        onDepartmentClick={handleDepartmentClick}
        onDeleteFolder={handleDeleteFolder}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col ${isSecondarySidebarOpen ? 'ml-88' : 'ml-24'} overflow-hidden`}>
        {/* Main Content Header */}
        <MainContentHeader
          title={getViewTitle()}
          onSearch={handleSearch}
          onUploadFiles={handleUploadFiles}
          onUploadFolder={handleUploadFolder}
          onImportFromDrive={handleImportFromDrive}
          onNewFolder={() => {
            const folderName = prompt('Enter folder name:');
            if (folderName) {
              handleCreateFolder(folderName);
            }
          }}
          onThemeChange={toggleTheme}
          showUploadActions={currentView === 'all' || currentView === 'folder'}
          showBackButton={currentView === 'folder'}
          onBack={handleAllFilesClick}
        />

        {/* File Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-y-auto"
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p>Loading files...</p>
              </div>
            </div>
          ) : currentView === 'deleted' ? (
            <DeletedFilesView
              items={filteredItems}
              onRestore={handleRestoreFile}
              onPermanentDelete={handlePermanentDelete}
            />
          ) : (
            <FileGrid
              items={filteredItems}
              onDeleteFile={handleDeleteFile}
              onShareFile={handleShareFile}
              onItemClick={handleItemClick}
              onEditFile={handleEditFile}
              onAddToFolder={handleAddFileToFolder}
              folders={folders}
              currentView={currentView}
            />
          )}
        </motion.div>
      </div>

      {/* Activity Panel */}
      <ActivityPanel
        isOpen={isActivityOpen}
        onClose={() => setIsActivityOpen(false)}
        activities={activities}
        onMarkAsRead={handleMarkActivityAsRead}
      />

      {/* Preview Modal */}
      <PreviewModal
        isOpen={isPreviewOpen}
        item={previewItem}
        onClose={handleClosePreview}
        onShare={handleShareFile}
        onDownload={handleDownloadFile}
        onFileClick={handleFileInFolderClick}
        onDeleteFile={handleDeleteFile}
        onShareFile={handleShareFile}
        onEditFile={handleEditFile}
      />

      {/* Upload Toast */}
      {showUploadToast && uploads.length > 0 && (
        <UploadToast
          uploads={uploads}
          onClose={handleCloseUploadToast}
          onCancel={handleCancelUpload}
        />
      )}

      {/* Quota Exceeded Modal */}
      <QuotaExceededModal
        isOpen={showQuotaModal}
        onClose={() => setShowQuotaModal(false)}
        currentUsage={quotaInfo?.usedBytes || 0}
        maxQuota={quotaInfo?.maxBytes || 5 * 1024 * 1024 * 1024}
        onUpgrade={handleUpgrade}
        onDeleteFiles={handleDeleteFilesForQuota}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => {
          setShareModalOpen(false);
          setFileToShare(null);
        }}
        file={fileToShare}
        onShare={handleShareSubmit}
        userRole={userRole}
        userEmail={userEmail}
        onShareToAll={handleShareToAll}
      />

      {/* Drive Import Loading Toast */}
      {(driveImportLoading || drivePickerLoading) && (
        <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 flex items-center gap-3 z-50 border border-gray-200 dark:border-gray-700">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Importing from Google Drive...</span>
        </div>
      )}

      {/* Edit Sync Banner */}
      <AnimatePresence>
        {editingFile && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white rounded-lg shadow-xl p-4 flex items-center gap-4 z-50"
          >
            <span className="text-sm font-medium">
              Editing "{editingFile.name || editingFile.fileName}" in Google Docs
            </span>
            <button
              onClick={handleSyncFile}
              className="bg-white text-blue-600 px-4 py-1.5 rounded-md text-sm font-medium hover:bg-blue-50 transition"
            >
              Sync Changes
            </button>
            <button
              onClick={() => {
                setEditingFile(null);
                setEditUrl(null);
              }}
              className="text-white/80 hover:text-white"
            >
              Done
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;
