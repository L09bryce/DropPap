import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiFile, FiRefreshCw, FiTrash2, FiMoreVertical } from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';

const DeletedFilesView = ({ items = [], onRestore, onPermanentDelete }) => {
  const { theme } = useTheme();
  const [hoveredId, setHoveredId] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpenId && !event.target.closest('.file-menu')) {
        setMenuOpenId(null);
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

  return (
    <div className={`${bgClass} p-8`}>
      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-center py-16 ${secondaryTextClass}`}
        >
          <FiTrash2 className="mx-auto text-5xl mb-4 opacity-50" />
          <p className="text-lg font-medium">Trash is empty</p>
          <p className="text-sm">Deleted files will appear here</p>
        </motion.div>
      ) : (
        <>
          <div className={`mb-6 p-4 rounded-lg ${theme === 'light' ? 'bg-yellow-50 border border-yellow-200' : 'bg-yellow-900/20 border border-yellow-800'}`}>
            <p className={`text-sm ${theme === 'light' ? 'text-yellow-800' : 'text-yellow-200'}`}>
              Files in trash will be automatically deleted after 30 days
            </p>
          </div>

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
                className={`border rounded-lg p-6 cursor-pointer transition ${cardBgClass} opacity-75`}
              >
                {/* Icon */}
                <div className="flex justify-between items-start mb-4">
                  <div className="text-4xl">
                    <FiFile size={32} className="text-gray-400" />
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
                      {menuOpenId === (item.id || index) && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className={`absolute right-0 top-full mt-1 w-44 ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-gray-700 border-gray-600'} border rounded-lg shadow-lg py-1 z-50`}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRestore?.(item);
                              setMenuOpenId(null);
                            }}
                            className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 ${theme === 'light' ? 'hover:bg-gray-100 text-gray-700' : 'hover:bg-gray-600 text-gray-200'}`}
                          >
                            <FiRefreshCw size={16} />
                            Restore
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onPermanentDelete?.(item);
                              setMenuOpenId(null);
                            }}
                            className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 text-red-600 ${theme === 'light' ? 'hover:bg-red-50' : 'hover:bg-red-900/20'}`}
                          >
                            <FiTrash2 size={16} />
                            Delete Forever
                          </button>
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>

                {/* Name */}
                <h3 className={`font-semibold ${textClass} truncate mb-2 text-sm line-through opacity-70`}>
                  {item.name || item.fileName}
                </h3>

                {/* Details */}
                <div className={`text-xs ${secondaryTextClass} space-y-1`}>
                  {item.size && (
                    <p>{formatFileSize(item.size)}</p>
                  )}
                  <p>Deleted: {formatDate(item.deletedAt)}</p>
                </div>

                {/* Quick action buttons */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRestore?.(item);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition"
                  >
                    <FiRefreshCw size={12} />
                    Restore
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPermanentDelete?.(item);
                    }}
                    className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 transition"
                  >
                    <FiTrash2 size={12} />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </>
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

export default DeletedFilesView;
