import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiX, FiTrash2, FiZap, FiCheck } from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Format file size to human readable string
 */
const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 10) / 10 + ' ' + sizes[i];
};

/**
 * QuotaExceededModal Component
 * Shows when user's storage quota is exceeded with upgrade options
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {function} props.onClose - Called when modal is closed
 * @param {number} props.currentUsage - Current usage in bytes
 * @param {number} props.maxQuota - Maximum quota in bytes
 * @param {function} props.onUpgrade - Called when user clicks upgrade
 * @param {function} props.onDeleteFiles - Called when user wants to delete files
 */
const QuotaExceededModal = ({
  isOpen,
  onClose,
  currentUsage = 0,
  maxQuota = 5 * 1024 * 1024 * 1024, // 5GB default
  onUpgrade,
  onDeleteFiles,
}) => {
  const { theme } = useTheme();

  const usagePercent = maxQuota > 0 ? Math.min((currentUsage / maxQuota) * 100, 100) : 0;

  // Theme classes
  const bgClass = {
    light: 'bg-white',
    dark: 'bg-gray-800',
    'dark-blue': 'bg-slate-800',
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

  const cardBg = {
    light: 'bg-gray-50 border-gray-200',
    dark: 'bg-gray-700 border-gray-600',
    'dark-blue': 'bg-slate-700 border-slate-600',
  }[theme];

  const plans = [
    {
      name: 'Free Plan',
      storage: '5 GB',
      price: 'Current',
      current: true,
      features: ['5 GB Storage', 'Basic Support', 'File Sharing'],
    },
    {
      name: 'Pro Plan',
      storage: '100 GB',
      price: '$9.99/mo',
      current: false,
      recommended: true,
      features: ['100 GB Storage', 'Priority Support', 'Advanced Sharing', 'Version History'],
    },
    {
      name: 'Business',
      storage: '1 TB',
      price: '$24.99/mo',
      current: false,
      features: ['1 TB Storage', '24/7 Support', 'Team Features', 'Admin Controls', 'API Access'],
    },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl z-50 ${bgClass}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <FiAlertTriangle className="text-amber-500" size={20} />
                </div>
                <div>
                  <h2 className={`text-lg font-semibold ${textClass}`}>
                    Storage Limit Reached
                  </h2>
                  <p className={`text-sm ${subtextClass}`}>
                    Upgrade to continue uploading files
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${subtextClass}`}
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Usage Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${textClass}`}>
                    Storage Used
                  </span>
                  <span className={`text-sm ${subtextClass}`}>
                    {formatFileSize(currentUsage)} of {formatFileSize(maxQuota)}
                  </span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${usagePercent}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className={`h-full rounded-full ${
                      usagePercent >= 100
                        ? 'bg-red-500'
                        : usagePercent >= 80
                        ? 'bg-amber-500'
                        : 'bg-blue-500'
                    }`}
                  />
                </div>
                <p className="mt-2 text-sm text-red-500 font-medium">
                  You've used {usagePercent.toFixed(1)}% of your storage quota
                </p>
              </div>

              {/* Plans */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {plans.map((plan, index) => (
                  <motion.div
                    key={plan.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative rounded-xl border p-4 ${cardBg} ${
                      plan.recommended
                        ? 'ring-2 ring-blue-500 border-blue-500'
                        : ''
                    }`}
                  >
                    {plan.recommended && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                        <FiZap size={12} />
                        Recommended
                      </div>
                    )}

                    <div className="text-center mb-4 pt-2">
                      <h3 className={`font-semibold ${textClass}`}>{plan.name}</h3>
                      <p className="text-2xl font-bold text-blue-500 mt-1">
                        {plan.storage}
                      </p>
                      <p className={`text-sm ${subtextClass}`}>
                        {plan.current ? (
                          <span className="text-green-500">Current Plan</span>
                        ) : (
                          plan.price
                        )}
                      </p>
                    </div>

                    <ul className="space-y-2 mb-4">
                      {plan.features.map((feature, i) => (
                        <li
                          key={i}
                          className={`flex items-center gap-2 text-sm ${subtextClass}`}
                        >
                          <FiCheck
                            size={14}
                            className={plan.current ? 'text-gray-400' : 'text-green-500'}
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {!plan.current && (
                      <button
                        onClick={() => onUpgrade?.(plan.name)}
                        className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-all ${
                          plan.recommended
                            ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                            : `border ${
                                theme === 'light'
                                  ? 'border-gray-300 hover:bg-gray-100 text-gray-700'
                                  : 'border-gray-600 hover:bg-gray-700 text-gray-300'
                              }`
                        }`}
                      >
                        {plan.recommended ? 'Upgrade Now' : 'Select Plan'}
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Alternative actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={onDeleteFiles}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    theme === 'light'
                      ? 'text-gray-600 hover:bg-gray-100'
                      : 'text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  <FiTrash2 size={16} />
                  Delete Files to Free Space
                </button>
                <button
                  onClick={onClose}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    theme === 'light'
                      ? 'text-gray-600 hover:bg-gray-100'
                      : 'text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default QuotaExceededModal;
