import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheckCircle, FiUpload, FiFolder, FiShare2 } from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';

const ActivityPanel = ({ isOpen, onClose, activities = [], onMarkAsRead }) => {
  const { theme } = useTheme();

  useEffect(() => {
    if (isOpen) {
      activities.forEach((activity) => {
        if (!activity.read) {
          onMarkAsRead(activity.id);
        }
      });
    }
  }, [isOpen, activities, onMarkAsRead]);

  const bgClass = {
    light: 'bg-white',
    dark: 'bg-gray-800',
    'dark-blue': 'bg-slate-800',
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

  const borderClass = {
    light: 'border-gray-200',
    dark: 'border-gray-700',
    'dark-blue': 'border-slate-700',
  }[theme];

  const activityBgClass = {
    light: 'bg-blue-50 border-blue-200',
    dark: 'bg-gray-700 border-gray-600',
    'dark-blue': 'bg-slate-700 border-slate-600',
  }[theme];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'upload':
        return <FiUpload size={20} className="text-green-500" />;
      case 'folder':
        return <FiFolder size={20} className="text-blue-500" />;
      case 'share':
        return <FiShare2 size={20} className="text-purple-500" />;
      default:
        return <FiCheckCircle size={20} className="text-gray-500" />;
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Now';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`fixed right-0 top-0 bottom-0 w-96 ${bgClass} shadow-2xl z-40 flex flex-col border-l ${borderClass}`}
          >
            {/* Header */}
            <div className={`border-b ${borderClass} p-6 flex items-center justify-between`}>
              <h2 className={`text-xl font-bold ${textClass}`}>Activity</h2>
              <button
                onClick={onClose}
                className={`p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition`}
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {activities.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-6 text-center ${secondaryTextClass}`}
                >
                  <p className="font-medium">No activities yet</p>
                  <p className="text-sm">Your recent actions will appear here</p>
                </motion.div>
              ) : (
                <motion.div className="divide-y divide-gray-300 dark:divide-gray-600">
                  {activities.map((activity, index) => (
                    <motion.div
                      key={activity.id || index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 border-l-4 border-blue-500 ${activityBgClass} border`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${textClass}`}>
                            {activity.message}
                          </p>
                          <p className={`text-xs ${secondaryTextClass} mt-1`}>
                            {formatTime(activity.timestamp)}
                          </p>
                        </div>
                        {!activity.read && (
                          <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ActivityPanel;
