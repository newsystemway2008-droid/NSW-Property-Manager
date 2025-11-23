
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { UserRole } from '../types';
import { ChevronDownIcon, Bars3Icon } from './icons';

interface HeaderProps {
    currentUserRole: UserRole;
    setCurrentUserRole: (role: UserRole) => void;
    onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUserRole, setCurrentUserRole, onMenuClick }) => {
    const { language, setLanguage, t } = useLanguage();

    return (
        <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center z-20">
            <div className="flex items-center">
                <button onClick={onMenuClick} className="md:hidden mr-4 text-gray-600 dark:text-gray-300">
                    <Bars3Icon className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400 hidden sm:block">{t('appName')}</h1>
            </div>

            <div className="flex items-center space-x-4">
                {/* Language Switcher */}
                <div className="relative">
                    <select
                        id="language-switcher"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as 'en' | 'bn')}
                        className="appearance-none bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 pl-3 pr-8 text-sm leading-5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="en">English</option>
                        <option value="bn">বাংলা</option>
                    </select>
                     <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                        <ChevronDownIcon className="h-4 w-4"/>
                    </div>
                </div>

                {/* Role Switcher */}
                <div className="relative">
                     <select
                        id="role-switcher"
                        value={currentUserRole}
                        onChange={(e) => setCurrentUserRole(e.target.value as UserRole)}
                        className="appearance-none bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 pl-3 pr-8 text-sm leading-5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value={UserRole.USER}>{t('user')}</option>
                        <option value={UserRole.ADMIN}>{t('admin')}</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                        <ChevronDownIcon className="h-4 w-4"/>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
