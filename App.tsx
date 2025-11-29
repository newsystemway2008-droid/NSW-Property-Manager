import React, { useState } from 'react';
import { DataProvider } from './contexts/DataContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import PropertiesList from './pages/PropertiesList';
import PropertyDetails from './pages/PropertyDetails';
import AddTransaction from './pages/AddTransaction';
import OwnerProfile from './pages/OwnerProfile';
import AdminPanel from './pages/AdminPanel';
import Header from './components/Header';
import { UserRole, TransactionType, Transaction } from './types';
import AddTenant from './pages/AddTenant';
import Reminders from './pages/Reminders';
import Settings from './pages/Settings';

export type View =
    | { page: 'dashboard' }
    | { page: 'properties' }
    | { page: 'reminders' }
    | { page: 'settings' }
    | { page: 'profile' }
    | { page: 'admin' }
    | { page: 'propertyDetail'; propertyId: string }
    | { page: 'addTransaction'; type: TransactionType; propertyId?: string }
    | { page: 'editTransaction'; transaction: Transaction }
    | { page: 'addTenant'; propertyId?: string }
    | { page: 'editTenant'; tenantId: string };

const App: React.FC = () => {
    const [view, setView] = useState<View>({ page: 'dashboard' });
    const [currentUserRole, setCurrentUserRole] = useState<UserRole>(UserRole.USER);
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const renderPage = () => {
        switch (view.page) {
            case 'dashboard':
                return <Dashboard setView={setView} />;
            case 'properties':
                return <PropertiesList setView={setView} />;
            case 'reminders':
                return <Reminders />;
            case 'settings':
                return <Settings />;
            case 'propertyDetail':
                return <PropertyDetails propertyId={view.propertyId} setView={setView} />;
            case 'addTransaction':
                return <AddTransaction type={view.type} propertyId={view.propertyId} setView={setView} />;
            case 'editTransaction':
                return <AddTransaction transactionToEdit={view.transaction} setView={setView} />;
            case 'addTenant':
                return <AddTenant propertyId={view.propertyId} setView={setView} />;
            case 'editTenant':
                return <AddTenant tenantId={view.tenantId} setView={setView} />;
            case 'profile':
                return <OwnerProfile />;
            case 'admin':
                return <AdminPanel />;
            default:
                return <Dashboard setView={setView} />;
        }
    };

    return (
        <LanguageProvider>
            <DataProvider>
                <ThemeProvider>
                    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex text-gray-800 dark:text-gray-200">
                        <Sidebar 
                            currentPage={view.page} 
                            setView={setView}
                            currentUserRole={currentUserRole}
                            isOpen={isSidebarOpen}
                            setIsOpen={setSidebarOpen}
                        />
                        <div className="flex-1 flex flex-col transition-all duration-300 ml-0 md:ml-64">
                             <Header 
                                currentUserRole={currentUserRole}
                                setCurrentUserRole={setCurrentUserRole}
                                onMenuClick={() => setSidebarOpen(!isSidebarOpen)}
                             />
                            <main className="p-4 sm:p-6 lg:p-8 flex-1">
                                {renderPage()}
                            </main>
                             <footer className="text-center py-4 px-4 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold">Develop By New System Way</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500">Revealing Possibilities in IT & Create A New Way</p>
                            </footer>
                        </div>
                    </div>
                </ThemeProvider>
            </DataProvider>
        </LanguageProvider>
    );
};

export default App;
