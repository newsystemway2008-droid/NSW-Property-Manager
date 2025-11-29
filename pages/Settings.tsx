import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';
import { Theme } from '../types';

const Settings: React.FC = () => {
    const { t } = useLanguage();
    const { theme, setTheme } = useTheme();
    const { clearAllData } = useData();

    const handleClearData = () => {
        if (window.confirm(t('clearDataConfirmation'))) {
            clearAllData().then(() => {
                alert(t('dataCleared'));
            });
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('settingsTitle')}</h1>

            {/* Theme Settings */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">{t('appTheme')}</h2>
                <div className="flex flex-col sm:flex-row gap-4">
                    {(Object.values(Theme) as Theme[]).map((themeValue) => (
                        <button
                            key={themeValue}
                            onClick={() => setTheme(themeValue)}
                            className={`flex-1 text-center px-4 py-2 rounded-md border-2 transition-colors ${
                                theme === themeValue
                                    ? 'bg-primary-600 text-white border-primary-600'
                                    : 'bg-transparent border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            {t(`theme${themeValue.charAt(0).toUpperCase() + themeValue.slice(1)}` as any)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Data Management */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">{t('dataManagement')}</h2>
                <div className="flex flex-col sm:flex-row justify-between items-center bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800/50">
                     <div>
                        <h3 className="font-semibold text-red-800 dark:text-red-200">{t('clearAllData')}</h3>
                        <p className="text-sm text-red-600 dark:text-red-300 mt-1">{t('confirmDelete')}</p>
                    </div>
                    <button
                        onClick={handleClearData}
                        className="mt-3 sm:mt-0 bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 transition-colors w-full sm:w-auto"
                    >
                        {t('clearAllData')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
