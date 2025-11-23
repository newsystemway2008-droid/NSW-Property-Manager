
import React from 'react';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';

const AdminPanel: React.FC = () => {
    const { properties, transactions, documents, owner } = useData();
    const { t } = useLanguage();

    const allData = {
        owner,
        properties,
        transactions,
        documents,
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('adminPanelTitle')}</h1>
            
            <div className="bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-200 p-4" role="alert">
                <p className="font-bold">{t('warningAdmin')}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">{t('allData')}</h2>
                <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-x-auto text-sm">
                    {JSON.stringify(allData, null, 2)}
                </pre>
            </div>
        </div>
    );
};

export default AdminPanel;
