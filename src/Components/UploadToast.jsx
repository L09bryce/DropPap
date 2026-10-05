import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiCheck, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Format file size to human readable string
 */
const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Upload Toast Component
 * Shows upload progress for multiple files in a toast notification
 * 
 * @param {Object} props
 * @param {Array} props.uploads - Array of upload objects
 * @param {function} props.onClose - Called when toast is dismissed
 * @param {function} props.onCancel - Called when a specific upload is cancelled
 */
const UploadToast = ({ uploads = [], onClose, onCancel }) => {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(true);
  const [autoClose, setAutoClose] = useState(false);

  // Check if all uploads are complete
  const allComplete = uploads.length > 0 && uploads.every(
    (u) => u.status === 'done' || u.status === 'error'
  );
  
  const completedCount = uploads.filter((u) => u.status === 'done').length;
  const errorCount = uploads.filter((u) => u.status === 'error').length;
  const totalCount = uploads.length;

  // Auto-close after all uploads complete
  useEffect(() => {
    if (allComplete && !autoClose) {
      setAutoClose(true);
      const timer = setTimeout(() => {
        onClose?.();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [allComplete, autoClose, onClose]);

  // Theme classes
  const bgClass = {
    light: 'bg-white border-gray-200',
    dark: 'bg-gray-800 border-gray-700',
    'dark-blue': 'bg-slate-800 border-slate-700',
  }[theme];

  const textClass = {
    light: 'text-gray-900',
    dark: 'text-gray-100',
    'dark-blue': 'text-slate-100',
  }[theme];

  const subtextClass = {
    light: 'text-gray-500',
    dark: 'text-gray-400',
    'dark-blue': 'text-slate-400',
  }[theme];

  const hoverClass = {
    light: 'hover:bg-gray-100',
    dark: 'hover:bg-gray-700',
    'dark-blue': 'hover:bg-slate-700',
  }[theme];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'done':
        return <FiCheck className="text-green-500" size={16} />;
      case 'error':
        return <FiX className="text-red-500" size={16} />;
      case 'uploading':
        return (
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        );
      default:
        return <div className="w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600" />;
    }
  };

  const getStatusText = (upload) => {
    switch (upload.status) {
      case 'done':
        return formatFileSize(upload.fileSize) + ' done';
      case 'error':
        return upload.error || 'Failed';
      case 'uploading':
        return `${upload.progress}%`;
      default:
        return 'Waiting';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={`fixed bottom-4 right-4 w-80 rounded-xl border shadow-2xl z-50 overflow-hidden ${bgClass}`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-4 py-3 cursor-pointer ${hoverClass}`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <FiUpload className="text-blue-500" size={20} />
              {allComplete && errorCount === 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center"
                >
                  <FiCheck size={8} className="text-white" />
                </motion.div>
              )}
            </div>
            <div>
              <p className={`text-sm font-medium ${textClass}`}>
                {allComplete
                  ? `${completedCount} of ${totalCount} uploaded`
                  : `Uploading ${totalCount} file${totalCount > 1 ? 's' : ''}`}
              </p>
              {errorCount > 0 && (
                <p className="text-xs text-red-500">
                  {errorCount} failed
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className={`p-1 rounded ${hoverClass}`}
            >
              {isExpanded ? <FiChevronDown size={16} /> : <FiChevronUp size={16} />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose?.();
              }}
              className={`p-1 rounded ${hoverClass}`}
            >
              <FiX size={16} />
            </button>
          </div>
        </div>

        {/* Progress bar for overall progress */}
        {!allComplete && (
          <div className="h-1 bg-gray-200 dark:bg-gray-700">
            <motion.div
              className="h-full bg-blue-500"
              initial={{ width: 0 }}
              animate={{
                width: `${
                  uploads.reduce((acc, u) => acc + (u.progress || 0), 0) / totalCount
                }%`,
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}

        {/* File list */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="max-h-64 overflow-y-auto">
                {uploads.map((upload, index) => (
                  <motion.div
                    key={upload.id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center gap-3 px-4 py-2 border-t ${
                      theme === 'light' ? 'border-gray-100' : 'border-gray-700'
                    }`}
                  >
                    {/* Status icon */}
                    <div className="flex-shrink-0">
                      {getStatusIcon(upload.status)}
                    </div>

                    {/* File info */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${textClass}`}>
                        {upload.fileName}
                      </p>
                      {upload.status === 'uploading' && (
                        <div className="mt-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-blue-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${upload.progress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Status text */}
                    <div className="flex-shrink-0">
                      <span
                        className={`text-xs ${
                          upload.status === 'error'
                            ? 'text-red-500'
                            : upload.status === 'done'
                            ? 'text-green-500'
                            : subtextClass
                        }`}
                      >
                        {getStatusText(upload)}
                      </span>
                    </div>

                    {/* Cancel button for uploading files */}
                    {upload.status === 'uploading' && onCancel && (
                      <button
                        onClick={() => onCancel(upload.id)}
                        className={`p-1 rounded ${hoverClass}`}
                        title="Cancel upload"
                      >
                        <FiX size={14} className="text-gray-400" />
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Auto-close indicator */}
        {allComplete && autoClose && (
          <motion.div
            className="h-1 bg-green-500"
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: 5, ease: 'linear' }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default UploadToast;
