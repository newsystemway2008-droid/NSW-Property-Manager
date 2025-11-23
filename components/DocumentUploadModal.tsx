import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Document } from '../types';
import { XMarkIcon, PaperClipIcon } from './icons';
import { addFile } from '../utils/db';

interface DocumentUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    propertyId: string;
}

const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({ isOpen, onClose, propertyId }) => {
    const { setDocuments } = useData();
    const { t } = useLanguage();
    
    const [files, setFiles] = useState<File[]>([]);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (selectedFiles) {
            setFiles(Array.from(selectedFiles));
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (files.length === 0) {
            setError('Please select at least one file to upload.');
            return;
        }
        setError('');

        try {
            const newDocuments: Document[] = await Promise.all(
                files.map(async (file) => {
                    const fileId = await addFile(file);
                    return {
                        id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                        propertyId,
                        name: file.name,
                        type: file.type,
                        fileId,
                        uploadedAt: new Date().toISOString(),
                    };
                })
            );
            
            setDocuments(prev => [...prev, ...newDocuments]);
            handleClose();
        } catch (error) {
            console.error("Failed to save files to DB.", error);
            setError('Failed to process one or more files.');
        }
    };

    const handleClose = () => {
        setFiles([]);
        setError('');
        onClose();
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md transform transition-all">
                <div className="p-6">
                    <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('uploadDocument')}</h2>
                        <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        
                        <div>
                            <label htmlFor="docFile-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('documentFile')}</label>
                            <div className="mt-1 flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md">
                                <PaperClipIcon className="w-5 h-5 text-gray-400 mr-2"/>
                                <span className="flex-1 text-gray-600 dark:text-gray-300 truncate">
                                    {files.length > 0 ? `${files.length} file(s) selected` : t('selectFile')}
                                </span>
                                <label htmlFor="docFile-input" className="cursor-pointer text-sm font-medium text-primary-600 hover:text-primary-500 ml-2">
                                    <span>Browse</span>
                                    <input id="docFile-input" type="file" multiple className="sr-only" onChange={handleFileChange} />
                                </label>
                            </div>
                            {files.length > 0 && (
                                <ul className="mt-2 text-xs text-gray-500 dark:text-gray-400 list-disc list-inside space-y-1 max-h-24 overflow-y-auto">
                                    {files.map(f => <li key={f.name} className="truncate">{f.name}</li>)}
                                </ul>
                            )}
                        </div>

                        <div className="flex justify-end pt-4 space-x-2">
                            <button type="button" onClick={handleClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg shadow hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                                {t('cancel')}
                            </button>
                            <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-lg shadow hover:bg-primary-700 transition-colors">
                                {t('save')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DocumentUploadModal;
