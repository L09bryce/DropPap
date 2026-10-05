import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiShare2, FiUser, FiChevronDown, FiCheck, FiLoader, FiUsers, FiAlertCircle, FiGlobe } from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';
import { FileService } from '../services/FileService';

/**
 * ShareModal - A modal component for sharing files with other users
 * 
 * Features:
 * - Email input for individual sharing
 * - "Share to All" button for Dean/HOD users (role=2)
 * - Shows department member count before sharing
 * - Loading states during operations
 * - Success/error feedback with animations
 */
const ShareModal = ({ 
  isOpen, 
  onClose, 
  file, 
  onShare,
  userRole = 0,
  userEmail = '',
  onShareToAll
}) => {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [accessLevel, setAccessLevel] = useState('VIEW');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isShareAllLoading, setIsShareAllLoading] = useState(false);
  const [isFetchingMembers, setIsFetchingMembers] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Department members state
  const [departmentMembers, setDepartmentMembers] = useState({ count: 0, members: [] });
  const [showMembersList, setShowMembersList] = useState(false);
  
  const modalRef = useRef(null);
  const emailInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Check if user is Dean or HOD (role 1 = HOD, role 2 = DEAN)
  const isHOD = userRole === 1;
  const isDean = userRole === 2;
  const isDeanOrHOD = isHOD || isDean;
  
  // Get the appropriate label for share to all button
  const getShareToAllLabel = () => {
    if (isDean) return 'Share to School';
    if (isHOD) return 'Share to Department';
    return 'Share to All';
  };

  // Focus email input when modal opens
  useEffect(() => {
    if (isOpen && emailInputRef.current) {
      setTimeout(() => emailInputRef.current?.focus(), 100);
    }
    // Reset state when modal opens
    if (isOpen) {
      setEmail('');
      setAccessLevel('VIEW');
      setError('');
      setSuccess(false);
      setSuccessMessage('');
      setShowMembersList(false);
      
      // Fetch department members if Dean/HOD
      if (isDeanOrHOD && userEmail) {
        fetchDepartmentMembers();
      }
    }
  }, [isOpen, isDeanOrHOD, userEmail]);

  // Fetch department members count
  const fetchDepartmentMembers = async () => {
    setIsFetchingMembers(true);
    try {
      const result = await FileService.getDepartmentMembers(userEmail);
      setDepartmentMembers(result);
    } catch (error) {
      console.error('Error fetching department members:', error);
      setDepartmentMembers({ count: 0, members: [] });
    } finally {
      setIsFetchingMembers(false);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Theme-based styles
  const overlayClass = 'bg-black/50 backdrop-blur-sm';
  
  const modalBgClass = {
    light: 'bg-white',
    dark: 'bg-gray-800',
    'dark-blue': 'bg-slate-800',
  }[theme];

  const textClass = {
    light: 'text-gray-900',
    dark: 'text-gray-100',
    'dark-blue': 'text-slate-100',
  }[theme];

  const secondaryTextClass = {
    light: 'text-gray-600',
    dark: 'text-gray-400',
    'dark-blue': 'text-slate-400',
  }[theme];

  const inputBgClass = {
    light: 'bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    dark: 'bg-gray-700 border-gray-600 focus:border-blue-400 focus:ring-blue-400',
    'dark-blue': 'bg-slate-700 border-slate-600 focus:border-blue-400 focus:ring-blue-400',
  }[theme];

  const dropdownBgClass = {
    light: 'bg-white border-gray-200',
    dark: 'bg-gray-700 border-gray-600',
    'dark-blue': 'bg-slate-700 border-slate-600',
  }[theme];

  const hoverBgClass = {
    light: 'hover:bg-gray-100',
    dark: 'hover:bg-gray-600',
    'dark-blue': 'hover:bg-slate-600',
  }[theme];

  const cardBgClass = {
    light: 'bg-gray-50 border-gray-200',
    dark: 'bg-gray-700/50 border-gray-600',
    'dark-blue': 'bg-slate-700/50 border-slate-600',
  }[theme];

  const accessLevels = [
    { value: 'VIEW', label: 'Can view', description: 'View and download files' },
    { value: 'EDITOR', label: 'Can edit', description: 'View, download, and edit files' },
  ];

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Handle individual share
  const handleShare = async () => {
    setError('');
    
    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      await onShare(file, email, accessLevel);
      setSuccess(true);
      setSuccessMessage(`Shared with ${email}`);
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Share error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to share file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle share to all department members
  const handleShareToAll = async () => {
    if (!isDeanOrHOD) {
      setError('Only Dean/HOD can share to all department members');
      return;
    }

    if (departmentMembers.count === 0) {
      setError('No department members found to share with');
      return;
    }

    setIsShareAllLoading(true);
    setError('');

    try {
      await onShareToAll(file, accessLevel);
      setSuccess(true);
      setSuccessMessage(`Shared with ${departmentMembers.count} department members`);
      
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Share to all error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to share to department. Please try again.');
    } finally {
      setIsShareAllLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleShare();
    }
  };

  const fileName = file?.name || file?.fileName || 'Unknown file';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${overlayClass}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`w-full max-w-md rounded-xl shadow-2xl ${modalBgClass}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <FiShare2 className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
                <div>
                  <h2 className={`text-lg font-semibold ${textClass}`}>Share File</h2>
                  <p className={`text-sm ${secondaryTextClass} truncate max-w-[250px]`}>
                    {fileName}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition ${hoverBgClass} ${secondaryTextClass}`}
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Success State */}
              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-8"
                >
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                    <FiCheck className="text-green-600 dark:text-green-400" size={32} />
                  </div>
                  <p className={`text-lg font-medium ${textClass}`}>File Shared!</p>
                  <p className={`text-sm ${secondaryTextClass}`}>{successMessage}</p>
                </motion.div>
              ) : (
                <>
                  {/* Share to All Section (Dean/HOD only) */}
                  {isDeanOrHOD && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-xl border ${cardBgClass}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {isDean ? (
                            <FiGlobe className="text-indigo-600 dark:text-indigo-400" size={20} />
                          ) : (
                            <FiUsers className="text-purple-600 dark:text-purple-400" size={20} />
                          )}
                          <span className={`font-medium ${textClass}`}>{getShareToAllLabel()}</span>
                        </div>
                        {isFetchingMembers ? (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <FiLoader className="animate-spin" size={14} />
                            <span>Loading...</span>
                          </div>
                        ) : (
                          <span className={`text-sm px-2 py-1 rounded-full ${
                            isDean 
                              ? (theme === 'light' ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-900/30 text-indigo-400')
                              : (theme === 'light' ? 'bg-purple-100 text-purple-700' : 'bg-purple-900/30 text-purple-400')
                          }`}>
                            {departmentMembers.count} members
                          </span>
                        )}
                      </div>
                      
                      {/* Show members list toggle */}
                      {departmentMembers.count > 0 && (
                        <button
                          onClick={() => setShowMembersList(!showMembersList)}
                          className={`text-sm ${secondaryTextClass} hover:underline mb-3 flex items-center gap-1`}
                        >
                          <FiChevronDown 
                            className={`transition-transform ${showMembersList ? 'rotate-180' : ''}`} 
                            size={14} 
                          />
                          {showMembersList ? 'Hide members' : 'Show members'}
                        </button>
                      )}
                      
                      {/* Members list */}
                      <AnimatePresence>
                        {showMembersList && departmentMembers.members.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-3 max-h-32 overflow-y-auto"
                          >
                            <div className={`text-xs space-y-1 p-2 rounded-lg ${
                              theme === 'light' ? 'bg-gray-100' : 'bg-gray-800/50'
                            }`}>
                              {departmentMembers.members.map((member, idx) => (
                                <div key={idx} className={`${secondaryTextClass} truncate`}>
                                  {member}
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Share to All Button */}
                      <button
                        onClick={handleShareToAll}
                        disabled={isShareAllLoading || isFetchingMembers || departmentMembers.count === 0}
                        className={`w-full py-2.5 px-4 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                          departmentMembers.count === 0
                            ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed text-gray-500 dark:text-gray-400'
                            : isDean
                              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                              : 'bg-purple-600 hover:bg-purple-700 text-white'
                        } disabled:opacity-50`}
                      >
                        {isShareAllLoading ? (
                          <>
                            <FiLoader className="animate-spin" size={18} />
                            <span>Sharing to {departmentMembers.count} members...</span>
                          </>
                        ) : isFetchingMembers ? (
                          <>
                            <FiLoader className="animate-spin" size={18} />
                            <span>Fetching members...</span>
                          </>
                        ) : (
                          <>
                            {isDean ? <FiGlobe size={18} /> : <FiUsers size={18} />}
                            <span>{getShareToAllLabel()} ({departmentMembers.count} members)</span>
                          </>
                        )}
                      </button>
                    </motion.div>
                  )}

                  {/* Divider (only if Dean/HOD) */}
                  {isDeanOrHOD && (
                    <div className="flex items-center gap-4">
                      <div className={`flex-1 h-px ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'}`} />
                      <span className={`text-sm ${secondaryTextClass}`}>or share individually</span>
                      <div className={`flex-1 h-px ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'}`} />
                    </div>
                  )}

                  {/* Individual Share Section */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${textClass}`}>
                      Share with
                    </label>
                    <div className="relative">
                      <FiUser className={`absolute left-3 top-1/2 -translate-y-1/2 ${secondaryTextClass}`} size={18} />
                      <input
                        ref={emailInputRef}
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError('');
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter email address"
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border outline-none transition ${inputBgClass} ${textClass}`}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Access Level Dropdown */}
                  <div ref={dropdownRef}>
                    <label className={`block text-sm font-medium mb-2 ${textClass}`}>
                      Access level
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition ${inputBgClass} ${textClass}`}
                        disabled={isLoading || isShareAllLoading}
                      >
                        <span>
                          {accessLevels.find(l => l.value === accessLevel)?.label}
                        </span>
                        <FiChevronDown 
                          className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                          size={18} 
                        />
                      </button>

                      <AnimatePresence>
                        {isDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`absolute w-full mt-2 rounded-lg border shadow-lg overflow-hidden z-10 ${dropdownBgClass}`}
                          >
                            {accessLevels.map((level) => (
                              <button
                                key={level.value}
                                onClick={() => {
                                  setAccessLevel(level.value);
                                  setIsDropdownOpen(false);
                                }}
                                className={`w-full px-4 py-3 text-left transition ${hoverBgClass} ${
                                  accessLevel === level.value ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className={`font-medium ${textClass}`}>{level.label}</p>
                                    <p className={`text-xs ${secondaryTextClass}`}>{level.description}</p>
                                  </div>
                                  {accessLevel === level.value && (
                                    <FiCheck className="text-blue-600 dark:text-blue-400" size={18} />
                                  )}
                                </div>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2"
                    >
                      <FiAlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0" size={18} />
                      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </motion.div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            {!success && (
              <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={onClose}
                  className={`px-4 py-2 rounded-lg transition ${hoverBgClass} ${textClass}`}
                  disabled={isLoading || isShareAllLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleShare}
                  disabled={isLoading || !email.trim()}
                  className={`px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? (
                    <>
                      <FiLoader className="animate-spin" size={18} />
                      Sharing...
                    </>
                  ) : (
                    <>
                      <FiShare2 size={18} />
                      Share
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShareModal;
