import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdHome,
  MdFolderOpen,
  MdNotifications,
  MdHelp,
  MdAdd,
  MdInsertDriveFile,
  MdBusiness,
  MdPeople,
  MdDelete,
} from 'react-icons/md';
import { useTheme } from '../contexts/ThemeContext';

const Sidebar = ({ folders = [], onFolderClick, onCreateFolder, onActivityClick, unreadCount = 0, onSecondarySidebarToggle, onAllFilesClick, onSharedClick, onDeletedFilesClick, onDepartmentClick, onDeleteFolder }) => {
  // activeMenu is ONLY for clicked state
  const [activeMenu, setActiveMenu] = useState(null);
  // hoverMenu is for hover preview (no highlight lock)
  const [hoverMenu, setHoverMenu] = useState(null);

  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const hoverTimeout = useRef(null);
  const { theme } = useTheme();

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName);
      setNewFolderName('');
      setShowNewFolderInput(false);
    }
  };

  const bgClass = {
    light: 'bg-white border-gray-200',
    dark: 'bg-gray-900 border-gray-700',
    'dark-blue': 'bg-slate-900 border-slate-700',
  }[theme];

  const textClass = {
    light: 'text-gray-800',
    dark: 'text-gray-100',
    'dark-blue': 'text-slate-100',
  }[theme];

  const hoverClass = {
    light: 'hover:bg-gray-100',
    dark: 'hover:bg-gray-800',
    'dark-blue': 'hover:bg-slate-800',
  }[theme];

  const activeBgClass = {
    light: 'bg-blue-50 text-blue-600',
    dark: 'bg-gray-800 text-blue-400',
    'dark-blue': 'bg-slate-800 text-blue-400',
  }[theme];

  const currentMenu = activeMenu || hoverMenu;

  useEffect(() => {
    if (onSecondarySidebarToggle) {
      onSecondarySidebarToggle(!!currentMenu);
    }
  }, [currentMenu, onSecondarySidebarToggle]);

  const handleHover = (menu) => {
    clearTimeout(hoverTimeout.current);
    setHoverMenu(menu);
  };

  const handleLeave = () => {
    hoverTimeout.current = setTimeout(() => {
      setHoverMenu(null);
    }, 120); // small delay = smoother UX
  };

  return (
    <div className="fixed top-0 left-0 h-screen z-50 flex" onMouseLeave={handleLeave}>

      {/* Primary Sidebar */}
      <div className={`${bgClass} border-r w-24 h-full flex flex-col items-center py-6`}>
        <div className="mb-8">
          <h2 className={`font-bold text-xl ${textClass}`}>DP</h2>
        </div>

        <nav className="flex-1 w-full flex flex-col gap-6 px-2">

          {/* HOME */}
          <SidebarItem
            icon={<MdHome size={28} />}
            label="Home"
            onMouseEnter={() => handleHover('home')}
            onClick={() => setActiveMenu('home')}
            isActive={activeMenu === 'home'}
            hoverClass={hoverClass}
            activeBgClass={activeBgClass}
            textClass={textClass}
          />

          {/* FOLDERS */}
          <SidebarItem
            icon={<MdFolderOpen size={28} />}
            label="Folders"
            onMouseEnter={() => handleHover('folders')}
            onClick={() => setActiveMenu('folders')}
            isActive={activeMenu === 'folders'}
            hoverClass={hoverClass}
            activeBgClass={activeBgClass}
            textClass={textClass}
          />

          {/* ACTIVITY */}
          <div className="relative flex flex-col items-center w-full">
            <SidebarItem
              icon={<MdNotifications size={28} />}
              label="Activity"
              onClick={() => {
                setActiveMenu(null);
                onActivityClick();
              }}
              hoverClass={hoverClass}
              textClass={textClass}
            />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>

          {/* HELP */}
          <SidebarItem
            icon={<MdHelp size={28} />}
            label="Help"
            onClick={() => setActiveMenu(null)}
            hoverClass={hoverClass}
            textClass={textClass}
          />
        </nav>
      </div>

      {/* SECONDARY SIDEBAR */}
      <AnimatePresence mode="wait">
        {currentMenu && (
          <motion.div
            key={currentMenu}
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 25 }}
            className={`absolute left-24 top-0 w-64 h-full border-r shadow-xl ${bgClass} p-6`}
            onMouseEnter={() => clearTimeout(hoverTimeout.current)}
            onMouseLeave={handleLeave}
          >

            {currentMenu === 'home' && (
              <motion.div layout className="flex flex-col gap-2">
                <h3 className={`text-sm font-bold uppercase mb-4 opacity-70 ${textClass}`}>Home</h3>
                <SubMenuItem icon={<MdInsertDriveFile />} label="All Files" onClick={onAllFilesClick} themeClasses={{ textClass, hoverClass }} />
                <SubMenuItem icon={<MdBusiness />} label="Department" onClick={onDepartmentClick} themeClasses={{ textClass, hoverClass }} />
                <SubMenuItem icon={<MdPeople />} label="Shared with me" onClick={onSharedClick} themeClasses={{ textClass, hoverClass }} />
                <SubMenuItem icon={<MdDelete />} label="Deleted Files" onClick={onDeletedFilesClick} themeClasses={{ textClass, hoverClass }} />
              </motion.div>
            )}

            {currentMenu === 'folders' && (
              <motion.div layout className="flex flex-col gap-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-sm font-bold uppercase opacity-70 ${textClass}`}>Folders</h3>
                  <button
                    onClick={() => setShowNewFolderInput(!showNewFolderInput)}
                    className={`p-1.5 rounded-lg ${hoverClass} transition ${textClass}`}
                  >
                    <MdAdd size={20} />
                  </button>
                </div>

                {showNewFolderInput && (
                  <motion.div layout className="mb-4 bg-black/5 p-3 rounded-lg dark:bg-white/5">
                    <input
                      type="text"
                      placeholder="Folder name"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                      className={`w-full px-3 py-2 rounded-md border text-sm mb-2 outline-none ${theme === 'light'
                        ? 'border-gray-300 bg-white text-gray-800'
                        : 'border-gray-600 bg-gray-800 text-white'
                        }`}
                    />
                    <button onClick={handleCreateFolder} className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Create</button>
                  </motion.div>
                )}

                <div className="flex flex-col gap-1 mt-2">
                  {folders.length > 0 ? (
                    folders.map((folder) => (
                      <div key={folder.id} className="group flex items-center gap-1">
                        <div className="flex-1">
                          <SubMenuItem
                            icon={<MdFolderOpen />}
                            label={folder.name}
                            onClick={() => onFolderClick(folder.id)}
                            themeClasses={{ textClass, hoverClass }}
                          />
                        </div>
                        {onDeleteFolder && (
                          <motion.button
                            initial={{ opacity: 0 }}
                            whileHover={{ scale: 1.1 }}
                            className={`p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity ${hoverClass} text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteFolder(folder);
                            }}
                            title="Delete folder"
                          >
                            <MdDelete size={16} />
                          </motion.button>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className={`text-sm opacity-50 italic ${textClass}`}>No folders yet.</p>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SidebarItem = ({ icon, label, onClick, onMouseEnter, isActive, hoverClass, activeBgClass, textClass }) => {
  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl w-full transition
        ${isActive ? activeBgClass : `${hoverClass} ${textClass}`}`}
    >
      {icon}
      <span className="text-[11px] font-semibold text-center truncate w-full">{label}</span>
    </motion.button>
  );
};

const SubMenuItem = ({ icon, label, onClick, themeClasses }) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ x: 4 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium ${themeClasses.hoverClass} ${themeClasses.textClass}`}
    >
      <span className="opacity-70 text-lg">{icon}</span>
      <span className="truncate">{label}</span>
    </motion.button>
  );
};

export default Sidebar;