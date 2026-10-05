import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch,
  FiUpload,
  FiFolder,
  FiChevronDown,
  FiHardDrive,
  FiArrowLeft,
} from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';

const MainContentHeader = ({
  title = 'All Files',
  onSearch,
  onUploadFiles,
  onUploadFolder,
  onImportFromDrive,
  onNewFolder,
  onThemeChange,
  showUploadActions = true,
  showBackButton = false,
  onBack,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showNewMenu, setShowNewMenu] = useState(false);
  const { theme } = useTheme();
  const uploadMenuRef = useRef(null);
  const themeMenuRef = useRef(null);
  const newMenuRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (uploadMenuRef.current && !uploadMenuRef.current.contains(e.target)) {
        setShowUploadMenu(false);
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target)) {
        setShowThemeMenu(false);
      }
      if (newMenuRef.current && !newMenuRef.current.contains(e.target)) {
        setShowNewMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };

  const bgClass = {
    light: 'bg-transparent border-transparent',
    dark: 'bg-transparent border-transparent',
    'dark-blue': 'bg-transparent border-transparent',
  }[theme];

  const textClass = {
    light: 'text-gray-900',
    dark: 'text-gray-100',
    'dark-blue': 'text-slate-100',
  }[theme];

  const inputClass = {
    light: 'bg-gray-100 border-gray-300 text-gray-800 placeholder-gray-500',
    dark: 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400',
    'dark-blue': 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400',
  }[theme];

  const menuBgClass = {
    light: 'bg-white border-gray-200',
    dark: 'bg-gray-700 border-gray-600',
    'dark-blue': 'bg-slate-700 border-slate-600',
  }[theme];

  const menuHoverClass = {
    light: 'hover:bg-gray-100',
    dark: 'hover:bg-gray-600',
    'dark-blue': 'hover:bg-slate-600',
  }[theme];

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`${bgClass} border-b sticky top-0 z-40`}
    >
      <div className="flex flex-col gap-4 px-6 py-4">
        {/* Title Row */}
        <div className="flex items-center gap-3">
          {showBackButton && onBack && (
            <motion.button
              onClick={onBack}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 rounded-lg ${menuHoverClass} transition ${textClass}`}
              title="Back to All Files"
            >
              <FiArrowLeft size={20} />
            </motion.button>
          )}
          <h1 className={`text-2xl font-bold ${textClass}`}>{title}</h1>
        </div>

        {/* Header Row */}
        <div className="flex items-center justify-between gap-4">
          {/* Left Side - New Button with Mini Bar */}
          {showUploadActions && (
          <div className="relative" ref={newMenuRef}>
            <motion.button
              onClick={() => setShowNewMenu(!showNewMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              title="Create new"
              whileTap={{ scale: 0.95 }}
            >
              <motion.span
                className="text-xl font-bold"
                animate={{ rotate: showNewMenu ? 90 : 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                +
              </motion.span>
              New
            </motion.button>

            {/* New Mini Bar */}
            <AnimatePresence>
              {showNewMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className={`absolute left-0 mt-2 w-56 ${menuBgClass} border rounded-lg shadow-lg py-2 z-50`}
                >
                  {/* Upload Section */}
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                      Upload
                    </div>
                    <div className="space-y-1">
                      <MenuItem
                        icon={<FiUpload size={16} />}
                        label="Document"
                        onClick={() => {
                          onUploadFiles();
                          setShowNewMenu(false);
                        }}
                        hoverClass={menuHoverClass}
                        compact
                      />
                      <MenuItem
                        icon={<FiFolder size={16} />}
                        label="Folder"
                        onClick={() => {
                          onUploadFolder();
                          setShowNewMenu(false);
                        }}
                        hoverClass={menuHoverClass}
                        compact
                      />
                    </div>
                  </div>

                  {/* Other Actions */}
                  <div className="px-4 py-2 space-y-1">
                    <MenuItem
                      icon={<FiHardDrive size={16} />}
                      label="Import from Drive"
                      onClick={() => {
                        onImportFromDrive();
                        setShowNewMenu(false);
                      }}
                      hoverClass={menuHoverClass}
                      compact
                    />
                    <MenuItem
                      icon={<FiFolder size={16} className="text-blue-500" />}
                      label="New Folder"
                      onClick={() => {
                        onNewFolder();
                        setShowNewMenu(false);
                      }}
                      hoverClass={menuHoverClass}
                      compact
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          )}

          {/* Center - Search Bar */}
          <div className="flex-1 max-w-md">
            <div className={`flex items-center gap-2 px-4 py-2 border rounded-lg ${inputClass}`}>
              <FiSearch size={18} className="opacity-60" />
              <input
                type="text"
                placeholder="Search file or folder"
                value={searchQuery}
                onChange={handleSearch}
                className="bg-transparent outline-none w-full text-sm"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Switcher */}
            <div className="relative" ref={themeMenuRef}>
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className={`px-3 py-2 rounded-lg ${menuHoverClass} transition text-sm font-medium`}
                title="Change theme"
              >
                🎨
              </button>

              {showThemeMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`absolute right-0 mt-2 w-40 ${menuBgClass} border rounded-lg shadow-lg py-2 z-50`}
                >
                  <MenuItem
                    label="Light Mode"
                    onClick={() => {
                      onThemeChange('light');
                      setShowThemeMenu(false);
                    }}
                    hoverClass={menuHoverClass}
                  />
                  <MenuItem
                    label="Dark Mode"
                    onClick={() => {
                      onThemeChange('dark');
                      setShowThemeMenu(false);
                    }}
                    hoverClass={menuHoverClass}
                  />
                  <MenuItem
                    label="Dark Blue Mode"
                    onClick={() => {
                      onThemeChange('dark-blue');
                      setShowThemeMenu(false);
                    }}
                    hoverClass={menuHoverClass}
                  />
                </motion.div>
              )}
            </div>

            {/* Upload Button with Dropdown */}
            {showUploadActions && (
            <>
            <div className="relative" ref={uploadMenuRef}>
              <button
                onClick={() => setShowUploadMenu(!showUploadMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                <FiUpload size={18} />
                Upload
                <FiChevronDown size={16} />
              </button>

              {showUploadMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`absolute right-0 mt-2 w-48 ${menuBgClass} border rounded-lg shadow-lg py-2 z-50`}
                >
                  <MenuItem
                    icon={<FiUpload size={18} />}
                    label="Files"
                    onClick={() => {
                      onUploadFiles();
                      setShowUploadMenu(false);
                    }}
                    hoverClass={menuHoverClass}
                  />
                  <MenuItem
                    icon={<FiFolder size={18} />}
                    label="Folder"
                    onClick={() => {
                      onUploadFolder();
                      setShowUploadMenu(false);
                    }}
                    hoverClass={menuHoverClass}
                  />
                  <MenuItem
                    icon={<FiHardDrive size={18} />}
                    label="Import from Drive"
                    onClick={() => {
                      onImportFromDrive();
                      setShowUploadMenu(false);
                    }}
                    hoverClass={menuHoverClass}
                  />
                </motion.div>
              )}
            </div>

            {/* New Folder Button */}
            <button
              onClick={onNewFolder}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition font-medium"
              title="Create new folder"
            >
              <FiFolder size={18} />
              New Folder
            </button>
            </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const MenuItem = ({ icon, label, onClick, hoverClass, compact = false }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 ${compact ? 'px-3 py-1.5' : 'px-4 py-2'} ${hoverClass} transition text-sm text-left`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default MainContentHeader;
