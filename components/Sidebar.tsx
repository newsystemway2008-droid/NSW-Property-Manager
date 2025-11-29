import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { View } from '../App';
import { UserRole } from '../types';
import { HomeIcon, BuildingStorefrontIcon, UserCircleIcon, ShieldCheckIcon, ChartBarIcon, BellIcon, Cog6ToothIcon } from './icons';
import { useData } from '../contexts/DataContext';

interface SidebarProps {
    currentPage: View['page'];
    setView: (view: View) => void;
    currentUserRole: UserRole;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setView, currentUserRole, isOpen, setIsOpen }) => {
    const { t } = useLanguage();
    const { owner } = useData();

    const navItems = [
        { id: 'dashboard', label: t('dashboard'), icon: <ChartBarIcon className="w-5 h-5" />, role: [UserRole.USER, UserRole.ADMIN] },
        { id: 'properties', label: t('properties'), icon: <HomeIcon className="w-5 h-5" />, role: [UserRole.USER, UserRole.ADMIN] },
        { id: 'reminders', label: t('reminders'), icon: <BellIcon className="w-5 h-5" />, role: [UserRole.USER, UserRole.ADMIN] },
        { id: 'settings', label: t('settings'), icon: <Cog6ToothIcon className="w-5 h-5" />, role: [UserRole.USER, UserRole.ADMIN] },
        { id: 'profile', label: t('ownerProfile'), icon: <UserCircleIcon className="w-5 h-5" />, role: [UserRole.USER, UserRole.ADMIN] },
        { id: 'admin', label: t('adminPanel'), icon: <ShieldCheckIcon className="w-5 h-5" />, role: [UserRole.ADMIN] },
    ];

    const handleNavClick = (page: View['page']) => {
        setView({ page } as View);
        setIsOpen(false); // Close sidebar on mobile after navigation
    };

    return (
        <>
        <div className={`fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsOpen(false)}></div>
        <aside className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-800 w-64 shadow-lg transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out z-40`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                {owner.photo ? (
                    <img src={owner.photo} alt="Owner" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                    <BuildingStorefrontIcon className="w-8 h-8 text-primary-600 dark:text-primary-400"/>
                )}
                <div>
                    <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">{t('appName')}</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{owner.name}</p>
                </div>
            </div>
            <nav className="mt-6">
                <ul>
                    {navItems.filter(item => item.role.includes(currentUserRole)).map(item => (
                        <li key={item.id} className="px-4 mb-2">
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleNavClick(item.id as View['page']);
                                }}
                                className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                                    currentPage === item.id 
                                    ? 'bg-primary-500 text-white shadow-md' 
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-gray-700'
                                }`}
                            >
                                <span className="mr-3">{item.icon}</span>
                                <span className="font-medium">{item.label}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
        </>
    );
};

export default Sidebar;
