import React, { useRef, useState } from 'react'
import { UploadService } from './UploadService';
import './Myfiles.css'

const MyFiles = () => {

    const [progress, setProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleUploadClick = () => {
        fileInputRef.current.click();
    }

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploading(true);
        setProgress(0);

        try {
            await UploadService(file, (percent) => {
                setProgress(percent);
            }); alert('File uploaded successfully!');
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            <div className='upload'>
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />
                <button onClick={handleUploadClick} disabled={uploading}>
                    {uploading ? `Uploading... ${progress}%` : 'Upload file'}
                    Upload file
                </button>

                {uploading &&
                    <div className='progress-bar-container' style={{ width: `${progress}%` }}>
                    </div>}

            </div>
        </div>
    )
}

export default MyFiles
