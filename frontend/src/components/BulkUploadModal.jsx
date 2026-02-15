import React, { useState } from 'react';
import './BulkUploadModal.css';

const BulkUploadModal = ({ isOpen, onClose, onUpload, role }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState(null);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setMessage(null);
    };

    const handleUpload = async () => {
        if (!file) {
            setMessage({ type: 'error', text: 'Please select a file first.' });
            return;
        }

        setUploading(true);
        try {
            await onUpload(file);
            setMessage({ type: 'success', text: 'Upload successful!' });
            setTimeout(() => {
                onClose();
                setFile(null);
                setMessage(null);
            }, 1500);
        } catch (error) {
            setMessage({ type: 'error', text: 'Upload failed. Please check the file format.' });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bulk-modal-overlay">
            <div className="bulk-modal-content">
                <div className="bulk-modal-header">
                    <h3>Bulk Upload {role}s</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                <div className="bulk-modal-body">
                    <div className="instruction-text">
                        Upload a CSV file with the following columns (include a header row): <br />
                        {role === 'Student' && <strong>Name, DOB(dd/mm/yyyy), Class, Section, Parent Email, Parent Mobile</strong>}
                        {role === 'Faculty' && <strong>Name, DOB(dd/mm/yyyy), Mobile, Email, Citizenship, Gender</strong>}
                        {role === 'Admin' && <strong>Name, DOB(dd/mm/yyyy), Gender, Email(Optional), Mobile, Citizenship</strong>}
                    </div>

                    <div className="file-drop-area">
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            id="file-upload"
                        />
                        <label htmlFor="file-upload">
                            <i className="fas fa-cloud-upload-alt"></i>
                            <span>{file ? file.name : "Choose a CSV file"}</span>
                        </label>
                    </div>

                    {message && (
                        <div className={`message ${message.type}`}>
                            {message.text}
                        </div>
                    )}
                </div>
                <div className="bulk-modal-footer">
                    <button className="cancel-btn" onClick={onClose} disabled={uploading}>Cancel</button>
                    <button
                        className="upload-btn"
                        onClick={handleUpload}
                        disabled={!file || uploading}
                    >
                        {uploading ? <><i className="fas fa-spinner fa-spin"></i> Uploading...</> : 'Upload'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BulkUploadModal;
