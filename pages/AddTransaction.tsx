
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { View } from '../App';
import { Transaction, TransactionType, PaymentMode, ExpenseCategory } from '../types';
import { translations } from '../constants';
import { ChevronLeftIcon, PhotoIcon, XMarkIcon } from '../components/icons';

interface AddTransactionProps {
    type: TransactionType;
    propertyId?: string;
    setView: (view: View) => void;
}

const AddTransaction: React.FC<AddTransactionProps> = ({ type, propertyId, setView }) => {
    const { properties, setTransactions, tenants } = useData();
    const { t } = useLanguage();

    const [selectedPropertyId, setSelectedPropertyId] = useState(propertyId || '');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState<ExpenseCategory | ''>('');
    const [paymentMode, setPaymentMode] = useState<PaymentMode | ''>('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [tenantName, setTenantName] = useState('');
    const [remarks, setRemarks] = useState('');
    const [receipts, setReceipts] = useState<string[]>([]);
    const [error, setError] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    
    const propertyTenants = tenants.filter(t => t.propertyId === selectedPropertyId);

    const handleFileChange = (files: FileList | null) => {
        if (!files) return;
        const newReceipts: string[] = [];
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        
        Array.from(files).forEach(file => {
            if (allowedTypes.includes(file.type)) {
                const reader = new FileReader();
                reader.onload = () => {
                    if (typeof reader.result === 'string') {
                        newReceipts.push(reader.result);
                        if (newReceipts.length === files.length) {
                             setReceipts(prev => [...prev, ...newReceipts]);
                        }
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    };
    
    const removeReceipt = (index: number) => {
        setReceipts(prev => prev.filter((_, i) => i !== index));
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPropertyId || !amount || !paymentMode || !date) {
            setError('Please fill in all required fields.');
            return;
        }
        if (type === TransactionType.EXPENSE && !category) {
            setError('Please select an expense category.');
            return;
        }
        setError('');

        const newTransaction: Transaction = {
            id: `tx_${Date.now()}`,
            propertyId: selectedPropertyId,
            type,
            description: `${type} for ${properties.find(p=>p.id === selectedPropertyId)?.name || ''}`,
            amount: parseFloat(amount),
            date,
            paymentMode,
            tenantName,
            remarks,
            receipts: receipts.length > 0 ? receipts : undefined,
            category: type === TransactionType.EXPENSE ? category as ExpenseCategory : undefined,
        };
        
        setTransactions(prev => [...prev, newTransaction]);

        if (propertyId) {
             setView({ page: 'propertyDetail', propertyId: propertyId });
        } else {
            setView({ page: 'dashboard' });
        }
    };
    
    const handleBack = () => {
        if (propertyId) {
             setView({ page: 'propertyDetail', propertyId: propertyId });
        } else {
            setView({ page: 'dashboard' });
        }
    }
    
    const dateLabel = type === TransactionType.INCOME ? t('dateReceived') : t('datePayment');

    return (
        <div className="max-w-2xl mx-auto">
             <div className="flex items-center mb-6">
                <button onClick={handleBack} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mr-4">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {type === TransactionType.INCOME ? t('addIncome') : t('addExpense')}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md space-y-6">
                {error && <p className="text-red-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-md text-sm">{error}</p>}
                
                <div>
                    <label htmlFor="property" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('property')}</label>
                    <select 
                        id="property" 
                        value={selectedPropertyId} 
                        onChange={e => setSelectedPropertyId(e.target.value)}
                        disabled={!!propertyId}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700"
                        required
                    >
                        <option value="" disabled>{t('selectProperty')}</option>
                        {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>

                {type === TransactionType.EXPENSE && (
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('category')}</label>
                        <select 
                            id="category" 
                            value={category} 
                            onChange={e => setCategory(e.target.value as ExpenseCategory)} 
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            required
                        >
                            <option value="" disabled>{t('selectCategory')}</option>
                            {Object.values(ExpenseCategory).map(cat => (
                                <option key={cat} value={cat}>
                                    {t(`expenseCategory${cat}` as keyof typeof translations.en)}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('amount')}</label>
                    <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" required/>
                </div>

                <div>
                    <label htmlFor="paymentMode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('paymentMode')}</label>
                    <select id="paymentMode" value={paymentMode} onChange={e => setPaymentMode(e.target.value as PaymentMode)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" required>
                        <option value="" disabled>{t('selectPaymentMode')}</option>
                        <option value={PaymentMode.CASH}>{t('paymentModeCash')}</option>
                        <option value={PaymentMode.BANK_TRANSFER}>{t('paymentModeBank')}</option>
                        <option value={PaymentMode.CREDIT_CARD}>{t('paymentModeCard')}</option>
                    </select>
                </div>
                
                 <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{dateLabel}</label>
                    <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" required/>
                </div>
                
                {type === TransactionType.INCOME && (
                 <div>
                    <label htmlFor="tenant" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('tenant')}</label>
                     <select id="tenant" value={tenantName} onChange={e => setTenantName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                        <option value="">{t('selectTenant')}</option>
                        {propertyTenants.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                    </select>
                </div>
                )}
                
                 <div>
                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('remarksOptional')}</label>
                    <textarea id="remarks" value={remarks} onChange={e => setRemarks(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                </div>
                
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('attachProof')}</label>
                    <div onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop} className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 ${isDragging ? 'border-primary-500' : 'border-dashed'} rounded-md`}>
                        <div className="space-y-1 text-center">
                            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400"/>
                            <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                <label htmlFor="receipt-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none">
                                    <span>{t('uploadPhotos')}</span>
                                    <input id="receipt-upload" name="receipt-upload" type="file" className="sr-only" multiple accept="image/*" onChange={(e) => handleFileChange(e.target.files)}/>
                                </label>
                                <p className="pl-1">{t('dragAndDrop')}</p>
                            </div>
                        </div>
                    </div>

                    {receipts.length > 0 && (
                        <div className="mt-4">
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('receiptsPreview')}</h3>
                            <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                {receipts.map((receipt, index) => (
                                    <div key={index} className="relative group">
                                        <img src={receipt} alt={`Receipt Preview ${index}`} className="h-24 w-full object-cover rounded-md" />
                                        <button type="button" onClick={() => removeReceipt(index)} className="absolute top-0 right-0 m-1 p-0.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                            <XMarkIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                 
                 <div className="pt-4">
                     <button type="submit" className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors">
                        {t('save')}
                     </button>
                 </div>
            </form>
        </div>
    );
};

export default AddTransaction;