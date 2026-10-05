import React, { useEffect, useState, useCallback } from "react";
import { FileService } from "../services/FileService";

/**
 * DrivePicker Component
 * Allows users to pick files from Google Drive and import them
 * 
 * @param {Object} props
 * @param {function} props.onSuccess - Called when file is successfully imported
 * @param {function} props.onError - Called when import fails
 * @param {function} props.onLoadingChange - Called when loading state changes
 * @param {function} props.onPickerOpen - Called when picker opens
 * @param {function} props.onPickerClose - Called when picker closes
 * @param {React.ReactNode} props.children - Custom trigger element
 * @param {string} props.className - Additional CSS classes for default button
 */
const Drivepicker = ({ 
  onSuccess, 
  onError, 
  onLoadingChange,
  onPickerOpen,
  onPickerClose,
  children,
  className = ""
}) => {
  const [pickerApiLoaded, setPickerApiLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load Picker API
  useEffect(() => {
    // Check if already loaded
    if (window.gapi?.client?.picker) {
      setPickerApiLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.onload = () => {
      window.gapi.load("picker", () => {
        setPickerApiLoaded(true);
      });
    };
    script.onerror = () => {
      console.error("Failed to load Google Picker API");
      onError?.(new Error("Failed to load Google Picker API"));
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, [onError]);

  // Update loading state
  const updateLoading = useCallback((loading) => {
    setIsLoading(loading);
    onLoadingChange?.(loading);
  }, [onLoadingChange]);

  // Handle file pick from Drive
  const handleFilePick = useCallback(async (file) => {
    try {
      updateLoading(true);

      // Try both possible storage keys for the access token
      const accessToken = localStorage.getItem("googleAccessToken") || localStorage.getItem("accessToken");
      if (!accessToken) {
        throw new Error("Google access token not found. Please re-authenticate with Google.");
      }

      const result = await FileService.importFromDrive(
        file.id,
        file.name,
        file.mimeType,
        accessToken
      );

      // Parse result if it's a string
      let parsedResult = result;
      if (typeof result === 'string') {
        try {
          parsedResult = JSON.parse(result);
        } catch {
          parsedResult = { success: true, message: result };
        }
      }

      onSuccess?.({
        success: true,
        fileName: file.name,
        fileId: parsedResult.fileId || file.id,
        gcsPath: parsedResult.gcsPath,
        mimeType: file.mimeType,
        importedAt: new Date(),
        ...parsedResult
      });

    } catch (error) {
      console.error("Error importing from Drive:", error);
      onError?.(error);
    } finally {
      updateLoading(false);
    }
  }, [onSuccess, onError, updateLoading]);

  // Create and show picker
  const createPicker = useCallback(() => {
    // Try both possible storage keys for the access token
    const token = localStorage.getItem("googleAccessToken") || localStorage.getItem("accessToken");
    
    if (!pickerApiLoaded) {
      console.error("Picker not loaded");
      onError?.(new Error("Google Picker is not loaded yet. Please try again."));
      return;
    }

    if (!token) {
      console.error("No access token");
      onError?.(new Error("No Google access token. Please sign in with Google first."));
      return;
    }

    try {
      // Create views
      const filesView = new window.google.picker.DocsView()
        .setLabel("My Drive")
        .setIncludeFolders(false);

      const foldersView = new window.google.picker.DocsView()
        .setMimeTypes("application/vnd.google-apps.folder")
        .setLabel("Folders")
        .setSelectFolderEnabled(true);

      // Build picker
      const picker = new window.google.picker.PickerBuilder()
        .setOAuthToken(token)
        .setAppId("401600007874")
        .addView(filesView)
        .addView(foldersView)
        .setCallback((data) => {
          if (data.action === window.google.picker.Action.PICKED) {
            const file = data.docs[0];
            console.log("Selected file from Drive:", file.name);
            handleFilePick(file);
          } else if (data.action === window.google.picker.Action.CANCEL) {
            onPickerClose?.();
          }
        })
        .build();

      picker.setVisible(true);
      onPickerOpen?.();

    } catch (error) {
      console.error("Error creating picker:", error);
      onError?.(error);
    }
  }, [pickerApiLoaded, handleFilePick, onPickerOpen, onPickerClose, onError]);

  // Render custom children or default button
  if (children) {
    return (
      <div onClick={createPicker} style={{ cursor: isLoading ? 'wait' : 'pointer' }}>
        {typeof children === 'function' 
          ? children({ isLoading, pickerReady: pickerApiLoaded })
          : children
        }
      </div>
    );
  }

  return (
    <button 
      onClick={createPicker}
      disabled={isLoading || !pickerApiLoaded}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Importing...</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C6.477 2 1.545 6.932 1.545 13s4.932 11 11 11c6.351 0 10.545-4.461 10.545-10.739 0-.747-.082-1.461-.235-2.151h-10.31z" />
          </svg>
          <span>Import from Drive</span>
        </>
      )}
    </button>
  );
};

/**
 * Custom hook for using Drive Picker
 * Provides more control over the picker lifecycle
 */
export const useDrivePicker = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [pickerReady, setPickerReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (window.gapi?.client?.picker) {
      setPickerReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.onload = () => {
      window.gapi.load("picker", () => {
        setPickerReady(true);
      });
    };
    script.onerror = () => {
      setError(new Error("Failed to load Google Picker API"));
    };
    document.body.appendChild(script);
  }, []);

  const openPicker = useCallback((callbacks = {}) => {
    const { onSuccess, onError, onCancel } = callbacks;
    // Try both possible storage keys for the access token
    const token = localStorage.getItem("googleAccessToken") || localStorage.getItem("accessToken");

    if (!pickerReady) {
      onError?.(new Error("Picker not ready"));
      return;
    }

    if (!token) {
      onError?.(new Error("No Google access token. Please sign in with Google first."));
      return;
    }

    const filesView = new window.google.picker.DocsView()
      .setLabel("My Drive")
      .setIncludeFolders(false);

    const picker = new window.google.picker.PickerBuilder()
      .setOAuthToken(token)
      .setAppId("401600007874")
      .addView(filesView)
      .setCallback(async (data) => {
        if (data.action === window.google.picker.Action.PICKED) {
          const file = data.docs[0];
          setIsLoading(true);
          
          try {
            const accessToken = localStorage.getItem("googleAccessToken") || localStorage.getItem("accessToken");
            const result = await FileService.importFromDrive(
              file.id,
              file.name,
              file.mimeType,
              accessToken
            );
            
            onSuccess?.({
              fileName: file.name,
              fileId: file.id,
              mimeType: file.mimeType,
              ...result
            });
          } catch (err) {
            onError?.(err);
          } finally {
            setIsLoading(false);
          }
        } else if (data.action === window.google.picker.Action.CANCEL) {
          onCancel?.();
        }
      })
      .build();

    picker.setVisible(true);
  }, [pickerReady]);

  return {
    openPicker,
    isLoading,
    pickerReady,
    error
  };
};

export default Drivepicker;
