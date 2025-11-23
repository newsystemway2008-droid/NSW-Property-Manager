import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Owner } from '../types';
import { UserCircleIcon } from '../components/icons';

const OwnerProfile: React.FC = () => {
    const { owner, setOwner } = useData();
    const { t } = useLanguage();
    const [formData, setFormData] = useState<Owner>(owner);
    const [showSuccess, setShowSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setFormData(owner);
    }, [owner]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    setFormData(prev => ({ ...prev, photo: reader.result as string}));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePhoto = () => {
        setFormData(prev => {
            const { photo, ...rest } = prev;
            return rest;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setOwner(formData);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">{t('ownerProfileTitle')}</h1>
            
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Photo Section */}
                    <div className="md:col-span-1 flex flex-col items-center">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('ownerPhoto')}</h2>
                        <div className="relative">
                            {formData.photo ? (
                                <img src={formData.photo} alt="Owner" className="w-32 h-32 rounded-full object-cover shadow-md" />
                            ) : (
                                <UserCircleIcon className="w-32 h-32 text-gray-300 dark:text-gray-600" />
                            )}
                        </div>
                        <div className="mt-4 space-y-2 flex flex-col items-center">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="text-sm font-medium text-primary-600 hover:text-primary-500"
                            >
                                {formData.photo ? t('changePhoto') : t('uploadPhoto')}
                            </button>
                            {formData.photo && (
                                <button
                                    type="button"
                                    onClick={handleRemovePhoto}
                                    className="text-sm font-medium text-red-600 hover:text-red-500"
                                >
                                    {t('removePhoto')}
                                </button>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handlePhotoUpload}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>
                    
                    {/* Form Fields Section */}
                    <div className="md:col-span-2 space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('ownerName')}</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('ownerPhone')}</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('ownerEmail')}</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('ownerAddress')}</label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            />
                        </div>
                    </div>
                    
                    <div className="md:col-span-3 flex justify-end pt-2">
                        <button type="submit" className="bg-primary-600 text-white px-6 py-2 rounded-lg shadow hover:bg-primary-700 transition-colors">
                            {t('save')}
                        </button>
                    </div>
                </form>
            </div>
             {showSuccess && (
                <div className="mt-4 p-4 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-200 rounded-md">
                    {t('profileUpdated')}
                </div>
            )}
        </div>
    );
};

export default OwnerProfile;