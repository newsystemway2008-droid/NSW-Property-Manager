import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Property, PropertyType, PropertyStatus } from '../types';
import { XMarkIcon, PhotoIcon, TrashIcon } from './icons';
// FIX: Import IndexedDB utility functions to handle file storage.
import { addFile, deleteFiles, getFile } from '../utils/db';


interface PropertyFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    propertyToEdit?: Property | null;
}

// FIX: Added a helper component to render photo previews from either a local File object or a fileId from IndexedDB.
const PhotoPreview: React.FC<{
    file?: File;
    fileId?: string;
    onRemove: () => void;
}> = ({ file, fileId, onRemove }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        let objectUrl: string | null = null;

        const loadUrl = async () => {
            if (file) {
                objectUrl = URL.createObjectURL(file);
                if (isMounted) setImageUrl(objectUrl);
            } else if (fileId) {
                const dbFile = await getFile(fileId);
                if (dbFile && isMounted) {
                    objectUrl = URL.createObjectURL(dbFile);
                    setImageUrl(objectUrl);
                }
            }
        };

        loadUrl();

        return () => {
            isMounted = false;
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [file, fileId]);

    if (!imageUrl) return null;

    return (
        <div className="relative group">
            <img src={imageUrl} alt="Preview" className="h-24 w-full object-cover rounded-md" />
            <button type="button" onClick={onRemove} className="absolute top-0 right-0 m-1 p-0.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <TrashIcon className="w-4 h-4" />
            </button>
        </div>
    );
};


const PropertyFormModal: React.FC<PropertyFormModalProps> = ({ isOpen, onClose, propertyToEdit }) => {
    const { setProperties, owner } = useData();
    const { t } = useLanguage();
    
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [unitNumber, setUnitNumber] = useState('');
    const [type, setType] = useState<PropertyType | ''>('');
    const [status, setStatus] = useState<PropertyStatus>(PropertyStatus.VACANT);
    const [expectedRent, setExpectedRent] = useState('');
    const [error, setError] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    // FIX: Reworked state to handle file IDs and new File objects instead of base64 strings.
    const [existingPhotoFileIds, setExistingPhotoFileIds] = useState<string[]>([]);
    const [newPhotoFiles, setNewPhotoFiles] = useState<File[]>([]);
    const [removedPhotoFileIds, setRemovedPhotoFileIds] = useState<string[]>([]);


    useEffect(() => {
        if (propertyToEdit) {
            setName(propertyToEdit.name);
            setAddress(propertyToEdit.address);
            setUnitNumber(propertyToEdit.unitNumber || '');
            setType(propertyToEdit.type);
            setStatus(propertyToEdit.status);
            // FIX: Use `photoFileIds` instead of the non-existent `photos` property.
            setExistingPhotoFileIds(propertyToEdit.photoFileIds || []);
            setExpectedRent(propertyToEdit.expectedRent?.toString() || '');
        } else {
            // Reset form for new property
            handleClose(false);
        }
    }, [propertyToEdit, isOpen]);

    // FIX: Handle new files as File objects, not base64 strings.
    const handleFileChange = (files: FileList | null) => {
        if (!files) return;
        const newPhotos: File[] = [];
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        
        Array.from(files).forEach(file => {
            if (allowedTypes.includes(file.type)) {
                newPhotos.push(file);
            }
        });
        setNewPhotoFiles(prev => [...prev, ...newPhotos]);
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        handleFileChange(e.dataTransfer.files);
    };
    
    // FIX: Reworked photo removal logic to handle both existing files (by ID) and newly added files.
    const removeNewPhoto = (index: number) => {
        setNewPhotoFiles(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingPhoto = (fileId: string) => {
        setExistingPhotoFileIds(prev => prev.filter(id => id !== fileId));
        setRemovedPhotoFileIds(prev => [...prev, fileId]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !address || !type) {
            setError('Please fill out all required fields.');
            return;
        }

        // FIX: Handle file operations with IndexedDB before saving property data.
        if (removedPhotoFileIds.length > 0) {
            await deleteFiles(removedPhotoFileIds);
        }
        const newFileIds = await Promise.all(newPhotoFiles.map(file => addFile(file)));
        const finalPhotoFileIds = [...existingPhotoFileIds, ...newFileIds];

        // FIX: Use `photoFileIds` which exists on the Property type, instead of `photos`. This resolves the type error.
        const propertyData = {
            name,
            address,
            unitNumber: unitNumber || undefined,
            type,
            status,
            photoFileIds: finalPhotoFileIds,
            expectedRent: expectedRent ? parseFloat(expectedRent) : undefined,
        };

        if (propertyToEdit) {
            // Update existing property
            setProperties(prev => prev.map(p => p.id === propertyToEdit.id ? { ...p, ...propertyData } : p));
        } else {
            // Add new property
            const newProperty: Property = {
                ...propertyData,
                id: `prop_${Date.now()}`,
                ownerId: owner.id,
            };
            setProperties(prev => [...prev, newProperty]);
        }
        handleClose();
    };

    const handleClose = (shouldTriggerCallback = true) => {
        setName('');
        setAddress('');
        setUnitNumber('');
        setType('');
        setStatus(PropertyStatus.VACANT);
        setExpectedRent('');
        setError('');
        setExistingPhotoFileIds([]);
        setNewPhotoFiles([]);
        setRemovedPhotoFileIds([]);
        if (shouldTriggerCallback) {
            onClose();
        }
    }

    if (!isOpen) return null;

    const modalTitle = propertyToEdit ? t('editProperty') : t('addProperty');
    const submitButtonText = propertyToEdit ? t('save') : t('addProperty');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-full overflow-y-auto transform transition-all">
                <div className="p-6">
                    <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{modalTitle}</h2>
                        <button onClick={() => handleClose()} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        
                        {/* Form fields */}
                        <input type="text" placeholder={t('propertyName')} value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" required />
                        <input type="text" placeholder={t('propertyAddress')} value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" required />
                        <input type="text" placeholder={t('flatShopNumberOptional')} value={unitNumber} onChange={(e) => setUnitNumber(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                        <select value={type} onChange={(e) => setType(e.target.value as PropertyType)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" required>
                            <option value="" disabled>{t('selectType')}</option>
                            <option value={PropertyType.HOUSE}>{t('propertyTypeHouse')}</option>
                            <option value={PropertyType.APARTMENT}>{t('propertyTypeApartment')}</option>
                            <option value={PropertyType.SHOP}>{t('propertyTypeShop')}</option>
                            <option value={PropertyType.COMMERCIAL}>{t('propertyTypeCommercial')}</option>
                            <option value={PropertyType.LAND}>{t('propertyTypeLand')}</option>
                        </select>
                         {propertyToEdit && (
                            <select value={status} onChange={(e) => setStatus(e.target.value as PropertyStatus)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                                <option value={PropertyStatus.VACANT}>{t('statusVacant')}</option>
                                <option value={PropertyStatus.RENTED}>{t('statusRented')}</option>
                            </select>
                         )}
                        <input type="number" placeholder={t('expectedRent')} value={expectedRent} onChange={(e) => setExpectedRent(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                        
                        {/* Photo uploader */}
                        <div onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop} className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 ${isDragging ? 'border-primary-500' : 'border-dashed'} rounded-md`}>
                            <div className="space-y-1 text-center">
                                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400"/>
                                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none">
                                        <span>{t('uploadPhotos')}</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/*" onChange={(e) => handleFileChange(e.target.files)}/>
                                    </label>
                                    <p className="pl-1">{t('dragAndDrop')}</p>
                                </div>
                            </div>
                        </div>

                        {(existingPhotoFileIds.length > 0 || newPhotoFiles.length > 0) && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('photosPreview')}</h3>
                                <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                    {/* FIX: Render previews for both existing and new photos using the helper component. */}
                                    {existingPhotoFileIds.map((fileId) => (
                                        <PhotoPreview key={fileId} fileId={fileId} onRemove={() => removeExistingPhoto(fileId)} />
                                    ))}
                                    {newPhotoFiles.map((file, index) => (
                                        <PhotoPreview key={index} file={file} onRemove={() => removeNewPhoto(index)} />
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end pt-4 space-x-2">
                            <button type="button" onClick={() => handleClose()} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg shadow hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                                {t('cancel')}
                            </button>
                            <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-lg shadow hover:bg-primary-700 transition-colors">
                                {submitButtonText}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PropertyFormModal;