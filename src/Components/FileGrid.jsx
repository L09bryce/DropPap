import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFolder, FiFile, FiMoreVertical, FiEdit2, FiFolderPlus, FiShare2, FiTrash2 } from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';

const FileGrid = ({ 
  items = [], 
  onDeleteFile, 
  onShareFile, 
  onItemClick, 
  onEditFile,
  onAddToFolder,
  folders = [],
  currentView = 'all'
}) => {
  const { theme } = useTheme();
  const [hoveredId, setHoveredId] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [folderMenuOpen, setFolderMenuOpen] = useState(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpenId && !event.target.closest('.file-menu')) {
        setMenuOpenId(null);
        setFolderMenuOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpenId]);

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
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleItemClick = (item) => {
    onItemClick?.(item);
  };

  const isDocxFile = (item) => {
    const name = item.name || item.fileName || '';
    return name.toLowerCase().endsWith('.docx');
  };

  return (
    <div className={`${bgClass} p-8`}>
      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-center py-16 ${secondaryTextClass}`}
        >
          <p className="text-lg font-medium">No files or folders yet</p>
          <p className="text-sm">Create a new folder or upload files to get started</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        >
          {items.map((item, index) => (
            <motion.div
              key={item.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              onMouseEnter={() => setHoveredId(item.id || index)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => handleItemClick(item)}
              className={`border rounded-lg p-6 cursor-pointer transition ${cardBgClass}`}
            >
              {/* Icon */}
              <div className="flex justify-between items-start mb-4">
                <div className="text-4xl">
                  {item.type === 'folder' ? (
                    <FiFolder size={32} className="text-blue-500" />
                  ) : (
                    <FiFile size={32} className="text-gray-500" />
                  )}
                </div>
                {hoveredId === (item.id || index) && (
                  <div className="relative file-menu">
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(menuOpenId === (item.id || index) ? null : (item.id || index));
                      }}
                      className={`p-2 rounded ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-gray-600'}`}
                    >
                      <FiMoreVertical size={20} />
                    </motion.button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {menuOpenId === (item.id || index) && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className={`absolute right-0 top-full mt-1 w-48 ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-gray-700 border-gray-600'} border rounded-lg shadow-lg py-1 z-50`}
                        >
                          {/* Share */}
                          {item.type === 'file' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onShareFile?.(item);
                                setMenuOpenId(null);
                              }}
                              className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 ${theme === 'light' ? 'hover:bg-gray-100 text-gray-700' : 'hover:bg-gray-600 text-gray-200'}`}
                            >
                              <FiShare2 size={16} />
                              Share
                            </button>
                          )}

                          {/* Edit (for .docx files) */}
                          {item.type === 'file' && isDocxFile(item) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditFile?.(item);
                                setMenuOpenId(null);
                              }}
                              className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 ${theme === 'light' ? 'hover:bg-gray-100 text-gray-700' : 'hover:bg-gray-600 text-gray-200'}`}
                            >
                              <FiEdit2 size={16} />
                              Edit in Google Docs
                            </button>
                          )}

                          {/* Add to Folder */}
                          {item.type === 'file' && currentView === 'all' && folders.length > 0 && (
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFolderMenuOpen(folderMenuOpen === (item.id || index) ? null : (item.id || index));
                                }}
                                className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 ${theme === 'light' ? 'hover:bg-gray-100 text-gray-700' : 'hover:bg-gray-600 text-gray-200'}`}
                              >
                                <FiFolderPlus size={16} />
                                Add to Folder
                              </button>

                              {/* Folder submenu */}
                              <AnimatePresence>
                                {folderMenuOpen === (item.id || index) && (
                                  <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className={`absolute left-full top-0 ml-1 w-40 ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-gray-700 border-gray-600'} border rounded-lg shadow-lg py-1`}
                                  >
                                    {folders.map((folder) => (
                                      <button
                                        key={folder.id || folder.name}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onAddToFolder?.(item, folder.name);
                                          setMenuOpenId(null);
                                          setFolderMenuOpen(null);
                                        }}
                                        className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 ${theme === 'light' ? 'hover:bg-gray-100 text-gray-700' : 'hover:bg-gray-600 text-gray-200'}`}
                                      >
                                        <FiFolder size={14} className="text-blue-500" />
                                        {folder.name}
                                      </button>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}

                          {/* Delete */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteFile?.(item);
                              setMenuOpenId(null);
                            }}
                            className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 text-red-600 ${theme === 'light' ? 'hover:bg-red-50' : 'hover:bg-red-900/20'}`}
                          >
                            <FiTrash2 size={16} />
                            Delete
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Name */}
              <h3 className={`font-semibold ${textClass} truncate mb-2 text-sm`}>
                {item.name || item.fileName}
              </h3>

              {/* Details */}
              <div className={`text-xs ${secondaryTextClass} space-y-1`}>
                {item.type === 'file' && item.size && (
                  <p>{formatFileSize(item.size)}</p>
                )}
                <p>{formatDate(item.createdAt || item.uploadDate)}</p>
                {item.isShared && (
                  <p className="text-blue-500 flex items-center gap-1">
                    <FiShare2 size={12} />
                    Shared by {item.sharedBy}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export default FileGrid;
