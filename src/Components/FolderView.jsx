import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiFolder, FiFile, FiMoreVertical } from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';
import { FileService } from '../services/FileService';

const FolderView = ({ folder, onBack, onFileClick, onDeleteFile, onShareFile }) => {
  const { theme } = useTheme();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([folder]);

  useEffect(() => {
    loadFolderContents();
  }, [folder.id]);

  useEffect(() => {
    // Load contents when breadcrumbs change
    const currentFolder = breadcrumbs[breadcrumbs.length - 1];
    if (currentFolder.id !== folder.id) {
      loadFolderContents(currentFolder.id);
    }
  }, [breadcrumbs]);

  const loadFolderContents = async (folderId = folder.id) => {
    setLoading(true);
    setError(null);
    try {
      const contents = await FileService.fetchFolderContents(folderId);
      setItems(contents);
    } catch (err) {
      console.error('Error loading folder contents:', err);
      setError('Failed to load folder contents');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const bgClass = {
    light: 'bg-gray-50',
    dark: 'bg-gray-900',
    'dark-blue': 'bg-slate-950',
  }[theme];

  const cardBgClass = {
    light: 'bg-white border-gray-200 hover:shadow-md',
    dark: 'bg-gray-700 border-gray-600 hover:shadow-lg hover:shadow-gray-900',
    'dark-blue': 'bg-slate-700 border-slate-600 hover:shadow-lg hover:shadow-slate-900',
  }[theme];

  const textClass = {
    light: 'text-gray-800',
    dark: 'text-gray-100',
    'dark-blue': 'text-slate-100',
  }[theme];

  const secondaryTextClass = {
    light: 'text-gray-600',
    dark: 'text-gray-400',
    'dark-blue': 'text-slate-400',
  }[theme];

  const formatDate = (date) => {
    if (!date) return 'Unknown';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleItemClick = (item) => {
    if (item.type === 'folder') {
      setBreadcrumbs([...breadcrumbs, item]);
    } else {
      onFileClick?.(item);
    }
  };

  const handleBreadcrumbClick = (index) => {
    if (index === breadcrumbs.length - 1) return;
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex flex-col h-full ${bgClass}`}
    >
      {/* Header with Back Button */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={onBack}
          className={`flex items-center gap-2 mb-3 px-4 py-2 rounded-lg transition ${theme === 'light'
              ? 'hover:bg-gray-100 text-gray-700'
              : 'hover:bg-gray-700 text-gray-300'
            }`}
        >
          <FiArrowLeft size={18} />
          Back
        </button>

        {/* Breadcrumbs */}
        <div className={`flex items-center gap-1 ${textClass} text-sm flex-wrap`}>
          <span>📁 Folder: </span>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.id || index}>
              {index > 0 && <span className="opacity-50">/</span>}
              <button
                onClick={() => handleBreadcrumbClick(index)}
                className={`hover:underline ${index === breadcrumbs.length - 1 ? 'font-semibold' : 'opacity-75'
                  }`}
              >
                {crumb.name}
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className={textClass}>Loading folder contents...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center text-red-600">
            <p className="font-semibold">{error}</p>
          </div>
        ) : items.length === 0 ? (
          <div className={`text-center ${secondaryTextClass}`}>
            <p className="text-lg font-medium">Folder is empty</p>
          </div>
        ) : (
          <motion.div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {items.map((item, index) => (
              <motion.div
                key={item.id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
                onMouseEnter={() => setHoveredId(item.id || index)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => handleItemClick(item)}
                className={`border rounded-lg p-4 cursor-pointer transition ${cardBgClass}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="text-3xl">
                    {item.type === 'folder' ? (
                      <FiFolder size={28} className="text-blue-500" />
                    ) : (
                      <FiFile size={28} className="text-gray-500" />
                    )}
                  </div>
                  {hoveredId === (item.id || index) && (
                    <div className="relative file-menu">
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(
                            menuOpenId === (item.id || index) ? null : item.id || index
                          );
                        }}
                        className={`p-1 rounded ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-gray-600'
                          }`}
                      >
                        <FiMoreVertical size={16} />
                      </motion.button>

                      {menuOpenId === (item.id || index) && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`absolute right-0 top-full mt-1 w-32 ${theme === 'light'
                              ? 'bg-white border-gray-200'
                              : 'bg-gray-700 border-gray-600'
                            } border rounded-lg shadow-lg py-1 z-50`}
                        >
                          {item.type === 'file' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onShareFile?.(item);
                                setMenuOpenId(null);
                              }}
                              className={`w-full text-left px-3 py-2 text-xs ${theme === 'light'
                                  ? 'hover:bg-gray-100 text-gray-700'
                                  : 'hover:bg-gray-600 text-gray-200'
                                }`}
                            >
                              Share
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteFile?.(item);
                              setMenuOpenId(null);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs text-red-600 ${theme === 'light'
                                ? 'hover:bg-red-50'
                                : 'hover:bg-red-900/20'
                              }`}
                          >
                            Delete
                          </button>
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>

                <h3 className={`font-semibold ${textClass} truncate text-sm mb-2`}>
                  {item.name}
                </h3>

                <div className={`text-xs ${secondaryTextClass} space-y-1`}>
                  {item.type === 'file' && item.size && (
                    <p>{formatFileSize(item.size)}</p>
                  )}
                  <p>{formatDate(item.createdAt)}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export default FolderView;
