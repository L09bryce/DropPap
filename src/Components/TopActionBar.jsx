import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiPlus,
  FiSearch,
  FiUser,
  FiLogOut,
  FiSettings,
  FiFolder,
  FiUpload,
  FiHardDrive,
  FiChevronDown,
} from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';

const TopActionBar = ({
  onSearch,
  onNewFolder,
  onUploadFiles,
  onUploadFolder,
  onImportFromDrive,
  onLogout,
  onThemeChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const { theme } = useTheme();
  const newMenuRef = useRef(null);
  const profileMenuRef = useRef(null);
  const themeMenuRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (newMenuRef.current && !newMenuRef.current.contains(e.target)) setShowNewMenu(false);
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) setShowProfileMenu(false);
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target)) setShowThemeMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };

  const bgClass = {
    light: 'bg-white border-gray-200',
    dark: 'bg-gray-800 border-gray-700',
    'dark-blue': 'bg-slate-800 border-slate-700',
  }[theme];

  const textClass = {
    light: 'text-gray-800',
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
      className={`${bgClass} border-b sticky top-0 z-40 ml-64`}
    >
      <div className="flex items-center justify-between gap-4 px-6 py-4">
        {/* New Folder + Upload Dropdown */}
        <div className="relative" ref={newMenuRef}>
          <button
            onClick={() => setShowNewMenu(!showNewMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <FiPlus size={18} />
            New
            <FiChevronDown size={16} />
          </button>

          {showNewMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`absolute left-0 mt-2 w-48 ${menuBgClass} border rounded-lg shadow-lg py-2 z-50`}
            >
              <MenuItem
                icon={<FiFolder size={18} />}
                label="Folder"
                onClick={() => {
                  onNewFolder();
                  setShowNewMenu(false);
                }}
                hoverClass={menuHoverClass}
              />
              <SubmenuItem
                icon={<FiUpload size={18} />}
                label="Upload"
                hoverClass={menuHoverClass}
                items={[
                  {
                    label: 'Document',
                    onClick: () => {
                      onUploadFiles();
                      setShowNewMenu(false);
                    },
                  },
                  {
                    label: 'Folder',
                    onClick: () => {
                      onUploadFolder();
                      setShowNewMenu(false);
                    },
                  },
                ]}
              />
              <MenuItem
                icon={<FiHardDrive size={18} />}
                label="Import from Drive"
                onClick={() => {
                  onImportFromDrive();
                  setShowNewMenu(false);
                }}
                hoverClass={menuHoverClass}
              />
            </motion.div>
          )}
        </div>

        {/* Search Bar */}
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

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition font-bold"
            title="User profile"
          >
            👤
          </button>

          {showProfileMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`absolute right-0 mt-2 w-40 ${menuBgClass} border rounded-lg shadow-lg py-2 z-50`}
            >
              <MenuItem
                icon={<FiUser size={18} />}
                label="Profile"
                onClick={() => {
                  alert('Profile page - Coming Soon');
                  setShowProfileMenu(false);
                }}
                hoverClass={menuHoverClass}
              />
              <MenuItem
                icon={<FiSettings size={18} />}
                label="Settings"
                onClick={() => {
                  alert('Settings - Coming Soon');
                  setShowProfileMenu(false);
                }}
                hoverClass={menuHoverClass}
              />
              <div className="border-t border-gray-300 dark:border-gray-600 my-2"></div>
              <MenuItem
                icon={<FiLogOut size={18} />}
                label="Logout"
                onClick={() => {
                  onLogout();
                  setShowProfileMenu(false);
                }}
                hoverClass={menuHoverClass}
              />
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const MenuItem = ({ icon, label, onClick, hoverClass }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-2 ${hoverClass} transition text-sm text-left`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const SubmenuItem = ({ icon, label, items, hoverClass }) => {
  const [showSubmenu, setShowSubmenu] = useState(false);

  return (
    <div>
      <button
        onClick={() => setShowSubmenu(!showSubmenu)}
        className={`w-full flex items-center justify-between px-4 py-2 ${hoverClass} transition text-sm`}
      >
        <div className="flex items-center gap-3">
          {icon}
          <span>{label}</span>
        </div>
        <FiChevronDown size={14} />
      </button>
      {showSubmenu && (
        <div className="pl-8">
          {items.map((item, idx) => (
            <button
              key={idx}
              onClick={item.onClick}
              className={`w-full text-left px-4 py-2 text-sm ${hoverClass} transition`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopActionBar;
