import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { BellIcon, PlusIcon } from '../components/icons';

const Reminders: React.FC = () => {
    const { t } = useLanguage();
    const { reminders } = useData();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('remindersTitle')}</h1>
                <button className="bg-primary-600 text-white px-4 py-2 rounded-lg shadow hover:bg-primary-700 transition-colors flex items-center gap-2">
                    <PlusIcon className="w-5 h-5"/>
                    {t('addReminder')}
                </button>
            </div>

            {reminders.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <BellIcon className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600" />
                    <p className="mt-4 text-gray-500 dark:text-gray-400">{t('noReminders')}</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    {/* Reminder list will go here */}
                </div>
            )}
        </div>
    );
};

export default Reminders;
