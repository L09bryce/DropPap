import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DocumentPreview from './DocumentPreview';
import FolderView from './FolderView';

const PreviewModal = ({
  isOpen,
  item,
  onClose,
  onShare,
  onDownload,
  onFileClick,
  onDeleteFile,
  onShareFile,
}) => {
  if (!isOpen || !item) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ 
              duration: 0.35, 
              ease: [0.16, 1, 0.3, 1] 
            }}
            onClick={(e) => e.stopPropagation()}
            className="fixed inset-3 md:inset-6 lg:inset-10 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
            style={{
              boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255,255,255,0.05)',
            }}
          >
            {item.type === 'folder' ? (
              <FolderView
                folder={item}
                onBack={onClose}
                onFileClick={(file) => {
                  onFileClick?.(file);
                }}
                onDeleteFile={onDeleteFile}
                onShareFile={onShareFile}
              />
            ) : (
              <DocumentPreview
                file={item}
                onClose={onClose}
                onShare={() => onShare?.(item)}
                onDownload={() => onDownload?.(item)}
              />
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PreviewModal;
