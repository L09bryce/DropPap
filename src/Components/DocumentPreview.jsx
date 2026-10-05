import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDownload, FiShare2, FiX, FiFile, FiImage, FiFilm, FiMusic, FiCode, FiFileText, FiArchive, FiDatabase } from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';
import { FileService } from '../services/FileService';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

const API_BASE_URL = 'http://localhost:8081';

const DocumentPreview = ({ file, onClose, onShare, onDownload }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [textContent, setTextContent] = useState(null);
  const [docxHtml, setDocxHtml] = useState(null);
  const [xlsxData, setXlsxData] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);

  const fileType = useMemo(() => getFileType(file?.name || ''), [file?.name]);
  const fileExt = useMemo(() => getFileExtension(file?.name || ''), [file?.name]);

  // Fetch signed URL for GCS files or use direct URL
  useEffect(() => {
    const fetchPreviewUrl = async () => {
      if (!file) return;

      // If file already has a URL, use it
      if (file.url) {
        setPreviewUrl(file.url);
        return;
      }

      // If file has gcsPath, get signed URL
      if (file.gcsPath) {
        try {
          const signedUrl = await FileService.getSignedUrl(file.gcsPath);
          setPreviewUrl(signedUrl);
        } catch (err) {
          console.error('Failed to get signed URL:', err);
          // Fallback to legacy download endpoint
          const token = localStorage.getItem('token');
          setPreviewUrl(`${API_BASE_URL}/download?fileId=${encodeURIComponent(file.id || file.fileID)}&fileName=${encodeURIComponent(file.name || file.fileName)}${token ? `&token=${encodeURIComponent(token)}` : ''}`);
        }
        return;
      }

      // Fallback to legacy download endpoint
      if (file.id || file.fileID) {
        const token = localStorage.getItem('token');
        setPreviewUrl(`${API_BASE_URL}/download?fileId=${encodeURIComponent(file.id || file.fileID)}&fileName=${encodeURIComponent(file.name || file.fileName)}${token ? `&token=${encodeURIComponent(token)}` : ''}`);
      }
    };

    fetchPreviewUrl();
  }, [file]);

  // For file types that don't need async loading (docx, pptx, unknown, etc.), 
  // immediately set loading to false
  useEffect(() => {
    if (!file) return;

    const type = getFileType(file.name || file.fileName);

    if (type === 'text' || type === 'code') {
      // Attempt to fetch text content
      fetchTextContent();
    } else if (type === 'docx') {
      fetchDocxContent();
    } else if (type === 'pptx') {
      fetchPptxContent();
    } else if (type === 'spreadsheet') {
      fetchXlsxContent();
    } else if (type !== 'image' && type !== 'pdf' && type !== 'video' && type !== 'audio') {
      // For non-loadable types (archive, unknown), stop loading immediately
      setLoading(false);
    } else if (type === 'video' || type === 'audio') {
      // Media elements handle their own loading via onLoadedData
      // But set a timeout fallback
      const timeout = setTimeout(() => setLoading(false), 3000);
      return () => clearTimeout(timeout);
    } else {
      // For image and pdf, set a timeout fallback so they don't spin forever
      const timeout = setTimeout(() => {
        setLoading(false);
        if (!error) setError(null); // Don't override existing errors
      }, 10000);
      return () => clearTimeout(timeout);
    }
  }, [file, previewUrl]);

  const fetchTextContent = async () => {
    try {
      // Wait for preview URL to be ready
      if (!previewUrl) {
        const timeout = setTimeout(fetchTextContent, 100);
        return () => clearTimeout(timeout);
      }

      const response = await fetch(previewUrl);
      if (response.ok) {
        const text = await response.text();
        setTextContent(text);
      } else {
        setError('Could not load file content');
      }
    } catch (err) {
      console.error('Failed to fetch text content:', err);
      setError('Could not load file content');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocxContent = async () => {
    try {
      // Wait for preview URL to be ready
      if (!previewUrl) {
        const timeout = setTimeout(fetchDocxContent, 100);
        return () => clearTimeout(timeout);
      }

      const response = await fetch(previewUrl);
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setDocxHtml(result.value);
      } else {
        setError('Could not load DOCX content');
      }
    } catch (err) {
      console.error('Failed to fetch DOCX content:', err);
      setError('Could not load DOCX content');
    } finally {
      setLoading(false);
    }
  };

  const fetchXlsxContent = async () => {
    try {
      // Wait for preview URL to be ready
      if (!previewUrl) {
        const timeout = setTimeout(fetchXlsxContent, 100);
        return () => clearTimeout(timeout);
      }

      const response = await fetch(previewUrl);
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        
        const sheetsData = [];
        workbook.SheetNames.forEach((sheetName) => {
          const sheet = workbook.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });
          sheetsData.push({
            name: sheetName,
            rows: data,
            cols: data.length > 0 ? Object.keys(data[0]) : []
          });
        });
        
        setXlsxData(sheetsData);
      } else {
        setError('Could not load XLSX content');
      }
    } catch (err) {
      console.error('Failed to fetch XLSX content:', err);
      setError('Could not load XLSX content');
    } finally {
      setLoading(false);
    }
  };

  const fetchPptxContent = async () => {
    // PPTX files cannot be easily previewed in browser
    // Just stop loading and show the download prompt
    setLoading(false);
  };

  // Theme classes
  const bgClass = {
    light: 'bg-white',
    dark: 'bg-gray-900',
    'dark-blue': 'bg-slate-900',
  }[theme];

  const headerBg = {
    light: 'bg-gradient-to-r from-gray-50 to-white border-gray-200',
    dark: 'bg-gradient-to-r from-gray-800 to-gray-850 border-gray-700',
    'dark-blue': 'bg-gradient-to-r from-slate-800 to-slate-850 border-slate-700',
  }[theme];

  const textClass = {
    light: 'text-gray-800',
    dark: 'text-gray-100',
    'dark-blue': 'text-slate-100',
  }[theme];

  const subtextClass = {
    light: 'text-gray-500',
    dark: 'text-gray-400',
    'dark-blue': 'text-slate-400',
  }[theme];

  const contentBg = {
    light: 'bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50',
    dark: 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900',
    'dark-blue': 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900',
  }[theme];

  const btnClass = {
    light: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
    dark: 'text-gray-400 hover:bg-gray-700 hover:text-gray-100',
    'dark-blue': 'text-slate-400 hover:bg-slate-700 hover:text-slate-100',
  }[theme];

  const cardBg = {
    light: 'bg-white/80 backdrop-blur-sm border-gray-200/60',
    dark: 'bg-gray-800/80 backdrop-blur-sm border-gray-600/60',
    'dark-blue': 'bg-slate-800/80 backdrop-blur-sm border-slate-600/60',
  }[theme];

  const FileTypeIcon = ({ type, size = 48 }) => {
    const iconProps = { size, strokeWidth: 1.5 };
    switch (type) {
      case 'image': return <FiImage {...iconProps} className="text-emerald-500" />;
      case 'video': return <FiFilm {...iconProps} className="text-purple-500" />;
      case 'audio': return <FiMusic {...iconProps} className="text-pink-500" />;
      case 'pdf': return <FiFileText {...iconProps} className="text-red-500" />;
      case 'docx': return <FiFileText {...iconProps} className="text-blue-500" />;
      case 'pptx': return <FiFileText {...iconProps} className="text-orange-500" />;
      case 'spreadsheet': return <FiDatabase {...iconProps} className="text-green-500" />;
      case 'archive': return <FiArchive {...iconProps} className="text-yellow-600" />;
      case 'text': case 'code': return <FiCode {...iconProps} className="text-cyan-500" />;
      default: return <FiFile {...iconProps} className="text-gray-400" />;
    }
  };

  const getTypeLabel = (type, ext) => {
    const labels = {
      image: 'Image',
      video: 'Video',
      audio: 'Audio',
      pdf: 'PDF Document',
      docx: 'Word Document',
      pptx: 'PowerPoint Presentation',
      spreadsheet: 'Spreadsheet',
      archive: 'Archive',
      text: 'Text File',
      code: 'Source Code',
    };
    return labels[type] || `${ext.toUpperCase()} File`;
  };

  const getTypeColor = (type) => {
    const colors = {
      image: 'from-emerald-500/20 to-teal-500/20',
      video: 'from-purple-500/20 to-violet-500/20',
      audio: 'from-pink-500/20 to-rose-500/20',
      pdf: 'from-red-500/20 to-orange-500/20',
      docx: 'from-blue-500/20 to-indigo-500/20',
      pptx: 'from-orange-500/20 to-amber-500/20',
      spreadsheet: 'from-green-500/20 to-emerald-500/20',
      archive: 'from-yellow-500/20 to-amber-500/20',
      text: 'from-cyan-500/20 to-blue-500/20',
      code: 'from-cyan-500/20 to-indigo-500/20',
    };
    return colors[type] || 'from-gray-500/20 to-slate-500/20';
  };

  const renderPreview = () => {
    switch (fileType) {
      case 'image':
        return (
          <div className="flex items-center justify-center w-full h-full p-4">
            <motion.img
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              src={previewUrl}
              alt={file.name}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onLoad={() => setLoading(false)}
              onError={() => {
                setError('Could not load image preview');
                setLoading(false);
              }}
            />
          </div>
        );

      case 'pdf':
        return (
          <div className="w-full h-full p-2">
            <iframe
              src={previewUrl}
              className="w-full h-full border-none rounded-lg"
              title={`Preview: ${file.name}`}
              onLoad={() => setLoading(false)}
              onError={() => {
                setError('Could not load PDF preview');
                setLoading(false);
              }}
            />
          </div>
        );

      case 'video':
        return (
          <div className="flex items-center justify-center w-full h-full p-4">
            <motion.video
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              controls
              className="max-w-full max-h-full rounded-lg shadow-2xl"
              onLoadedData={() => setLoading(false)}
              onError={() => {
                setError('Could not load video');
                setLoading(false);
              }}
            >
              <source src={previewUrl} />
              Your browser does not support video playback.
            </motion.video>
          </div>
        );

      case 'audio':
        return (
          <div className="flex flex-col items-center justify-center w-full h-full p-8 gap-8">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className={`w-40 h-40 rounded-full bg-gradient-to-br ${getTypeColor('audio')} flex items-center justify-center shadow-xl`}
            >
              <FiMusic size={56} className="text-pink-500" />
            </motion.div>
            <p className={`${textClass} text-lg font-medium`}>{file.name}</p>
            <audio
              controls
              className="w-full max-w-md"
              onLoadedData={() => setLoading(false)}
              onError={() => {
                setError('Could not load audio');
                setLoading(false);
              }}
            >
              <source src={previewUrl} />
              Your browser does not support audio playback.
            </audio>
          </div>
        );

      case 'text':
      case 'code':
        return (
          <div className="w-full h-full p-4 overflow-auto">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`max-w-5xl mx-auto rounded-xl border ${cardBg} overflow-hidden`}
            >
              <div className={`px-4 py-3 border-b ${theme === 'light' ? 'border-gray-200 bg-gray-50' : theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-slate-700 bg-slate-800'} flex items-center gap-2`}>
                <FiCode size={16} className="text-cyan-500" />
                <span className={`text-sm font-mono ${subtextClass}`}>{file.name}</span>
              </div>
              <pre className={`p-6 text-sm font-mono ${textClass} whitespace-pre-wrap break-words overflow-auto max-h-[70vh] leading-relaxed`}>
                {textContent || 'No content available'}
              </pre>
            </motion.div>
          </div>
        );

      case 'docx':
        return (
          <div className="w-full h-full p-4 overflow-auto">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`max-w-5xl mx-auto rounded-xl border ${cardBg} overflow-hidden`}
            >
              <div className={`px-4 py-3 border-b ${theme === 'light' ? 'border-gray-200 bg-gray-50' : theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-slate-700 bg-slate-800'} flex items-center gap-2`}>
                <FiFileText size={16} className="text-blue-500" />
                <span className={`text-sm font-mono ${subtextClass}`}>{file.name}</span>
              </div>
              <div className={`p-6 ${textClass} prose prose-sm max-w-none overflow-auto max-h-[70vh]`} dangerouslySetInnerHTML={{ __html: docxHtml || '' }} />
            </motion.div>
          </div>
        );

      case 'pptx':
        return (
          <div className="flex items-center justify-center w-full h-full p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={`max-w-md w-full rounded-2xl border ${cardBg} p-10 text-center`}
            >
              {/* Animated icon background */}
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, 2, -2, 0],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className={`w-28 h-28 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${getTypeColor('pptx')} flex items-center justify-center`}
              >
                <FiFileText size={48} className="text-orange-500" />
              </motion.div>

              <h3 className={`${textClass} text-xl font-bold mb-2`}>
                PowerPoint Presentation
              </h3>

              <p className={`${subtextClass} text-sm mb-1`}>
                {file.name}
              </p>

              {file.size && (
                <p className={`${subtextClass} text-xs mb-6`}>
                  {formatFileSize(file.size)}
                </p>
              )}

              <p className={`${subtextClass} text-sm mb-6`}>
                PowerPoint files are best viewed in Microsoft Office or compatible applications.
                Download to view all slides and features.
              </p>

              <div className="flex gap-3 justify-center">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onDownload}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl font-medium text-sm shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-shadow"
                >
                  <FiDownload size={16} />
                  Download File
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onShare}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm border transition ${theme === 'light'
                      ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    }`}
                >
                  <FiShare2 size={16} />
                  Share
                </motion.button>
              </div>
            </motion.div>
          </div>
        );

      case 'spreadsheet':
        if (xlsxData.length === 0) {
          return (
            <div className="flex items-center justify-center w-full h-full">
              <p className={textClass}>No data available</p>
            </div>
          );
        }
        return (
          <div className="w-full h-full p-4 overflow-auto">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-full"
            >
              {xlsxData.map((sheet, sheetIdx) => (
                <div key={sheetIdx} className="mb-8">
                  <h3 className={`text-lg font-semibold ${textClass} mb-4`}>{sheet.name}</h3>
                  <div className="overflow-x-auto rounded-lg border" style={{
                    borderColor: theme === 'light' ? '#e5e7eb' : theme === 'dark' ? '#374151' : '#475569'
                  }}>
                    <table className="w-full">
                      <thead>
                        <tr className={theme === 'light' ? 'bg-gray-50' : theme === 'dark' ? 'bg-gray-800' : 'bg-slate-800'}>
                          {sheet.cols.map((col) => (
                            <th 
                              key={col} 
                              className={`px-4 py-2 text-left text-sm font-semibold ${textClass} border-r`}
                              style={{
                                borderColor: theme === 'light' ? '#e5e7eb' : theme === 'dark' ? '#374151' : '#475569'
                              }}
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sheet.rows.slice(0, 100).map((row, rowIdx) => (
                          <tr 
                            key={rowIdx} 
                            className={rowIdx % 2 === 0 
                              ? (theme === 'light' ? 'bg-white' : theme === 'dark' ? 'bg-gray-900' : 'bg-slate-900')
                              : (theme === 'light' ? 'bg-gray-50' : theme === 'dark' ? 'bg-gray-800' : 'bg-slate-800')
                            }
                          >
                            {sheet.cols.map((col) => (
                              <td 
                                key={`${rowIdx}-${col}`} 
                                className={`px-4 py-2 text-sm ${textClass} border-r`}
                                style={{
                                  borderColor: theme === 'light' ? '#e5e7eb' : theme === 'dark' ? '#374151' : '#475569'
                                }}
                              >
                                {row[col] || ''}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {sheet.rows.length > 100 && (
                    <p className={`text-xs ${subtextClass} mt-2`}>
                      Showing 100 of {sheet.rows.length} rows
                    </p>
                  )}
                </div>
              ))}
            </motion.div>
          </div>
        );

      // For file types that can't be previewed inline (archive, unknown)
      default:
        return (
          <div className="flex items-center justify-center w-full h-full p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={`max-w-md w-full rounded-2xl border ${cardBg} p-10 text-center`}
            >
              {/* Animated icon background */}
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, 2, -2, 0],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className={`w-28 h-28 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${getTypeColor(fileType)} flex items-center justify-center`}
              >
                <FileTypeIcon type={fileType} size={48} />
              </motion.div>

              <h3 className={`${textClass} text-xl font-bold mb-2`}>
                {getTypeLabel(fileType, fileExt)}
              </h3>

              <p className={`${subtextClass} text-sm mb-1`}>
                {file.name}
              </p>

              {file.size && (
                <p className={`${subtextClass} text-xs mb-6`}>
                  {formatFileSize(file.size)}
                </p>
              )}

              <p className={`${subtextClass} text-sm mb-6`}>
                This file type cannot be previewed in the browser.
                Download it to open with the appropriate application.
              </p>

              <div className="flex gap-3 justify-center">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onDownload}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-shadow"
                >
                  <FiDownload size={16} />
                  Download File
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onShare}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm border transition ${theme === 'light'
                      ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    }`}
                >
                  <FiShare2 size={16} />
                  Share
                </motion.button>
              </div>
            </motion.div>
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`flex flex-col h-full ${bgClass} rounded-xl overflow-hidden`}
    >
      {/* Header */}
      <div className={`flex items-center justify-between px-6 py-4 border-b ${headerBg}`}>
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getTypeColor(fileType)} flex items-center justify-center shrink-0`}>
            <FileTypeIcon type={fileType} size={20} />
          </div>
          <div className="min-w-0">
            <h2 className={`${textClass} font-semibold truncate text-base`}>{file.name}</h2>
            <div className={`flex items-center gap-2 ${subtextClass} text-xs mt-0.5`}>
              <span className="uppercase font-medium tracking-wider">{fileExt}</span>
              {file.size && (
                <>
                  <span className="opacity-40">•</span>
                  <span>{formatFileSize(file.size)}</span>
                </>
              )}
              {file.createdAt && (
                <>
                  <span className="opacity-40">•</span>
                  <span>{formatDate(file.createdAt)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 ml-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onDownload}
            className={`p-2.5 rounded-lg transition-colors ${btnClass}`}
            title="Download"
          >
            <FiDownload size={18} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onShare}
            className={`p-2.5 rounded-lg transition-colors ${btnClass}`}
            title="Share"
          >
            <FiShare2 size={18} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className={`p-2.5 rounded-lg transition-colors ${btnClass}`}
            title="Close"
          >
            <FiX size={18} />
          </motion.button>
        </div>
      </div>

      {/* Preview Content */}
      <div className={`flex-1 overflow-auto ${contentBg} relative`}>
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center z-10"
            >
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 border-r-blue-300"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-2 rounded-full border-2 border-transparent border-t-indigo-400 border-l-indigo-300"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FileTypeIcon type={fileType} size={20} />
                  </div>
                </div>
                <p className={`${textClass} text-sm font-medium`}>Loading preview...</p>
                <p className={`${subtextClass} text-xs mt-1`}>{file.name}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-0 flex items-center justify-center z-10"
          >
            <div className={`max-w-sm w-full mx-4 rounded-2xl border ${cardBg} p-8 text-center`}>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                <FiX size={28} className="text-red-500" />
              </div>
              <p className="text-red-500 font-semibold mb-2">{error}</p>
              <p className={`text-sm ${subtextClass} mb-6`}>
                Try downloading the file instead
              </p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onDownload}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium text-sm mx-auto shadow-lg shadow-blue-500/25"
              >
                <FiDownload size={16} />
                Download
              </motion.button>
            </div>
          </motion.div>
        )}

        {!error && renderPreview()}
      </div>
    </motion.div>
  );
};

// ─── Utilities ──────────────────────────────

const getFileExtension = (filename) => {
  if (!filename) return '';
  return filename.split('.').pop().toLowerCase();
};

const getFileType = (filename) => {
  const ext = getFileExtension(filename);
  const types = {
    image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff'],
    pdf: ['pdf'],
    docx: ['docx', 'doc'],
    pptx: ['pptx', 'ppt'],
    spreadsheet: ['xlsx', 'xls', 'csv'],
    video: ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'],
    audio: ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'],
    archive: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'],
    text: ['txt', 'md', 'rtf', 'log'],
    code: ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'h', 'css', 'html', 'json', 'xml', 'yaml', 'yml', 'sql', 'sh', 'bash', 'rb', 'go', 'rs', 'php', 'swift', 'kt'],
  };

  for (const [type, exts] of Object.entries(types)) {
    if (exts.includes(ext)) return type;
  }
  return 'unknown';
};

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

const formatDate = (date) => {
  if (!date) return 'Unknown';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default DocumentPreview;
