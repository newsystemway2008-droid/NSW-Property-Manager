import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { View } from '../App';
import { Tenant, InclusiveCharge, PropertyStatus, Document } from '../types';
import { ChevronLeftIcon, PhoneIcon, InformationCircleIcon, UserCircleIcon, PhotoIcon, XMarkIcon, TrashIcon } from '../components/icons';
import { addFile, deleteFile } from '../utils/db';

interface AddTenantProps {
    propertyId?: string;
    tenantId?: string;
    setView: (view: View) => void;
}

const AddTenant: React.FC<AddTenantProps> = ({ propertyId, tenantId, setView }) => {
    const { tenants, setTenants, properties, setProperties, documents, setDocuments } = useData();
    const { t } = useLanguage();

    const [tenantData, setTenantData] = useState<Partial<Tenant>>({});
    const [newDocs, setNewDocs] = useState<File[]>([]);
    const [docsToRemove, setDocsToRemove] = useState<Document[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isEditMode = !!tenantId;
    const currentTenant = isEditMode ? tenants.find(t => t.id === tenantId) : null;
    const currentPropertyId = propertyId || currentTenant?.propertyId;
    const tenantDocuments = documents.filter(d => d.tenantId === tenantId);
    
    useEffect(() => {
        if (isEditMode && currentTenant) {
            setTenantData(currentTenant);
        } else {
            setTenantData({
                leaseStartDate: new Date().toISOString().split('T')[0],
                paymentDueDay: 1,
                inclusiveCharges: []
            })
        }
    }, [tenantId, tenants]);
    

    const handleChange = (field: keyof Tenant, value: any) => {
        setTenantData(prev => ({ ...prev, [field]: value }));
    };

    const handleChargeToggle = (charge: InclusiveCharge) => {
        const currentCharges = tenantData.inclusiveCharges || [];
        const newCharges = currentCharges.includes(charge)
            ? currentCharges.filter(c => c !== charge)
            : [...currentCharges, charge];
        handleChange('inclusiveCharges', newCharges);
    };
    
    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    handleChange('photo', reader.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePhoto = () => {
        handleChange('photo', undefined);
        if(fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files) setNewDocs(prev => [...prev, ...Array.from(e.target.files!)]);
    };
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); e.stopPropagation(); setIsDragging(false);
        if (e.dataTransfer.files) setNewDocs(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
    };
    const removeNewDoc = (index: number) => setNewDocs(prev => prev.filter((_, i) => i !== index));
    const markDocForRemoval = (doc: Document) => setDocsToRemove(prev => [...prev, doc]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenantData.name || !tenantData.mobile || !tenantData.leaseStartDate || !tenantData.leaseEndDate || !tenantData.leaseAmount || !tenantData.paymentDueDay || !currentPropertyId) {
            setError('Please fill in all required fields.');
            return;
        }
        setError('');
        
        // 1. Handle document file operations
        await Promise.all(docsToRemove.map(doc => deleteFile(doc.fileId)));
        
        const uploadedDocs: Document[] = await Promise.all(newDocs.map(async file => {
            const fileId = await addFile(file);
            return {
                id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                tenantId: tenantId || `tenant_${Date.now()}`, // temp id for new tenant
                name: file.name,
                type: file.type,
                fileId,
                uploadedAt: new Date().toISOString(),
            }
        }));

        // 2. Handle Tenant data
        if (isEditMode && currentTenant) {
            const updatedTenant = { ...currentTenant, ...tenantData };
            setTenants(prev => prev.map(t => t.id === tenantId ? updatedTenant : t));
            
            // Update documents state
            const remainingDocs = documents.filter(d => !docsToRemove.some(rem => rem.id === d.id));
            setDocuments([...remainingDocs, ...uploadedDocs]);

        } else {
            const newTenantId = `tenant_${Date.now()}`;
            const newTenant: Tenant = {
                ...tenantData,
                id: newTenantId,
                propertyId: currentPropertyId,
            } as Tenant;
            
            uploadedDocs.forEach(d => d.tenantId = newTenantId); // Assign final tenantId

            setTenants(prev => [...prev, newTenant]);
            setDocuments(prev => [...prev, ...uploadedDocs]);
            
            // Update property status
            setProperties(prev => prev.map(p => 
                p.id === currentPropertyId ? { ...p, status: PropertyStatus.RENTED } : p
            ));
        }
        
        handleBack();
    };

    const handleBack = () => {
        setView({ page: 'propertyDetail', propertyId: currentPropertyId! });
    };

    const formTitle = isEditMode ? t('editTenant') : t('addTenant');

    return (
        <div className="max-w-2xl mx-auto">
             <div className="flex items-center mb-6">
                <button onClick={handleBack} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mr-4">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{formTitle}</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md space-y-6">
                {error && <p className="text-red-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-md text-sm">{error}</p>}
                
                {/* Photo Upload and basic info */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('tenantPhoto')}</label>
                    <div className="mt-2 flex items-center gap-4">
                        {tenantData.photo ? (
                            <img src={tenantData.photo} alt="Tenant" className="w-20 h-20 rounded-full object-cover"/>
                        ) : (
                            <UserCircleIcon className="w-20 h-20 text-gray-300 dark:text-gray-600" />
                        )}
                        <div className="flex flex-col gap-2">
                             <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm font-medium text-primary-600 hover:text-primary-500">{t('uploadPhoto')}</button>
                             {tenantData.photo && <button type="button" onClick={handleRemovePhoto} className="text-sm font-medium text-red-600 hover:text-red-500">{t('removePhoto')}</button>}
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                    </div>
                </div>
                
                {/* Name, Mobile, Email */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('tenantNameLabel')}</label>
                    <input type="text" id="name" value={tenantData.name || ''} onChange={(e) => handleChange('name', e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" required />
                </div>
                <div className="relative">
                    <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('mobile')}</label>
                    <input type="tel" id="mobile" value={tenantData.mobile || ''} onChange={(e) => handleChange('mobile', e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" required />
                    <PhoneIcon className="absolute right-3 top-9 w-5 h-5 text-gray-400" />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('emailOptional')}</label>
                    <input type="email" id="email" value={tenantData.email || ''} onChange={(e) => handleChange('email', e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                </div>

                {/* Lease Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="leaseStartDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('leaseStartDate')}</label>
                        <input type="date" id="leaseStartDate" value={tenantData.leaseStartDate || ''} onChange={(e) => handleChange('leaseStartDate', e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" required />
                    </div>
                    <div>
                        <label htmlFor="leaseEndDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('leaseEndDate')}</label>
                        <input type="date" id="leaseEndDate" value={tenantData.leaseEndDate || ''} onChange={(e) => handleChange('leaseEndDate', e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" required />
                    </div>
                </div>

                {/* Lease Term and Renewal Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="leaseTerm" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('leaseTerm')}</label>
                        <input
                            type="text"
                            id="leaseTerm"
                            value={tenantData.leaseTerm || ''}
                            onChange={(e) => handleChange('leaseTerm', e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="renewalDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('renewalDate')}</label>
                        <input
                            type="date"
                            id="renewalDate"
                            value={tenantData.renewalDate || ''}
                            onChange={(e) => handleChange('renewalDate', e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                    </div>
                </div>

                {/* Rent Amount and Due Day */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="leaseAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('leaseAmount')}</label>
                        <input type="number" id="leaseAmount" value={tenantData.leaseAmount || ''} onChange={(e) => handleChange('leaseAmount', parseFloat(e.target.value))} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" required />
                    </div>
                    <div className="relative">
                        <label htmlFor="paymentDueDay" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('paymentDueDay')}</label>
                         <select id="paymentDueDay" value={tenantData.paymentDueDay || 1} onChange={(e) => handleChange('paymentDueDay', parseInt(e.target.value))} className="mt-1 block w-full appearance-none px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" required>
                            {Array.from({length: 31}, (_, i) => i + 1).map(day => <option key={day} value={day}>{day}</option>)}
                        </select>
                        <InformationCircleIcon className="absolute right-3 top-9 w-5 h-5 text-gray-400" title="Day of the month rent is due"/>
                    </div>
                </div>

                {/* Deposit */}
                <div>
                    <label htmlFor="deposit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('depositOptional')}</label>
                    <input type="number" id="deposit" value={tenantData.deposit || ''} onChange={(e) => handleChange('deposit', parseFloat(e.target.value))} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                </div>

                {/* Inclusive Charges */}
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('rentInclusiveCharges')}</label>
                    <div className="mt-2 flex flex-wrap gap-3">
                        {Object.values(InclusiveCharge).map(charge => (
                             <button key={charge} type="button" onClick={() => handleChargeToggle(charge)} className={`px-3 py-2 text-sm rounded-full border transition-colors ${tenantData.inclusiveCharges?.includes(charge) ? 'bg-primary-600 text-white border-primary-600' : 'bg-transparent border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                {t(charge.replace(/\s/g, '') as any)}
                             </button>
                        ))}
                    </div>
                </div>

                {/* DID Document Upload Section */}
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('uploadDidDocument')}</label>
                    <div onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop} className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 ${isDragging ? 'border-primary-500' : 'border-dashed'} rounded-md`}>
                        <div className="space-y-1 text-center">
                            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400"/>
                            <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                <label htmlFor="did-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none">
                                    <span>{t('selectFile')}</span>
                                    <input id="did-upload" name="did-upload" type="file" className="sr-only" multiple onChange={handleFileChange}/>
                                </label>
                                <p className="pl-1">{t('dragAndDrop')}</p>
                            </div>
                        </div>
                    </div>

                    {(tenantDocuments.length > 0 || newDocs.length > 0) && (
                        <div className="mt-4">
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('didDocumentsPreview')}</h3>
                            <div className="mt-2 space-y-2">
                                {/* Existing Docs */}
                                {tenantDocuments.filter(d => !docsToRemove.some(rem => rem.id === d.id)).map((doc) => (
                                    <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                                        <span className="text-sm truncate">{doc.name}</span>
                                        <button type="button" onClick={() => markDocForRemoval(doc)} className="text-red-500 hover:text-red-700">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {/* New Docs */}
                                {newDocs.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/50 rounded-md">
                                        <span className="text-sm truncate">{file.name}</span>
                                        <button type="button" onClick={() => removeNewDoc(index)} className="text-red-500 hover:text-red-700">
                                            <XMarkIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                 <div className="pt-4">
                     <button type="submit" className="w-full bg-gradient-to-r from-primary-600 to-purple-600 text-white py-3 px-4 rounded-lg shadow-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-opacity">
                        {t('save')}
                     </button>
                 </div>
            </form>
        </div>
    );
};
export default AddTenant;