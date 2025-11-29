import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Property, PropertyStatus, PropertyType, TransactionType } from '../types';
import { View } from '../App';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, BuildingStorefrontIcon, DocumentDuplicateIcon, MapPinIcon, BuildingOfficeIcon, HomeIcon, UserPlusIcon } from '../components/icons';
import { getFile } from '../utils/db';

interface DashboardProps {
    setView: (view: View) => void;
}

const ImageFromDb: React.FC<{ fileId: string; alt: string; className: string }> = ({ fileId, alt, className }) => {
    const [imageUrl, setImageUrl] = useState<string>('https://via.placeholder.com/400x200');

    useEffect(() => {
        let isMounted = true;
        const fetchImage = async () => {
            const file = await getFile(fileId);
            if (isMounted && file) {
                const url = URL.createObjectURL(file);
                setImageUrl(url);
                return () => URL.revokeObjectURL(url);
            }
        };
        fetchImage();
        return () => { isMounted = false; };
    }, [fileId]);

    return <img src={imageUrl} alt={alt} className={className} />;
};

const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
    const { properties, transactions, owner } = useData();
    const { t } = useLanguage();

    const totalIncome = transactions
        .filter(t => t.type === TransactionType.INCOME)
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
        .filter(t => t.type === TransactionType.EXPENSE)
        .reduce((sum, t) => sum + t.amount, 0);

    const now = new Date();
    const currentMonthTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate.getFullYear() === now.getFullYear() && transactionDate.getMonth() === now.getMonth();
    });

    const currentMonthIncome = currentMonthTransactions
        .filter(t => t.type === TransactionType.INCOME)
        .reduce((sum, t) => sum + t.amount, 0);
    
    const currentMonthExpense = currentMonthTransactions
        .filter(t => t.type === TransactionType.EXPENSE)
        .reduce((sum, t) => sum + t.amount, 0);

    const formatCurrency = (amount: number) => {
        // FIX: Cast options to 'any' to allow 'numberingSystem' which is a valid but sometimes untyped property.
        return new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0, numberingSystem: 'latn' } as any).format(amount);
    }

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return t('goodMorning');
        if (hour < 18) return t('goodAfternoon');
        return t('goodEvening');
    };
    
    const getPropertyTypeName = (type: PropertyType) => {
        const map = {
            [PropertyType.HOUSE]: t('propertyTypeHouse'),
            [PropertyType.APARTMENT]: t('propertyTypeApartment'),
            [PropertyType.SHOP]: t('propertyTypeShop'),
            [PropertyType.COMMERCIAL]: t('propertyTypeCommercial'),
            [PropertyType.LAND]: t('propertyTypeLand'),
        };
        return map[type] || type;
    };
    
    const getPropertyTypeIcon = (type: PropertyType) => {
        const className = "w-4 h-4";
         switch (type) {
            case PropertyType.HOUSE: return <HomeIcon className={className} />;
            case PropertyType.APARTMENT: return <BuildingOfficeIcon className={className} />;
            case PropertyType.SHOP: return <BuildingStorefrontIcon className={className} />;
            case PropertyType.COMMERCIAL: return <BuildingStorefrontIcon className={className} />;
            case PropertyType.LAND: return <MapPinIcon className={className} />;
            default: return <BuildingStorefrontIcon className={className} />;
        }
    }


    return (
        <div className="space-y-8">
            <div>
                <p className="text-md text-gray-500 dark:text-gray-400">{t('welcomeBack')}</p>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{getGreeting()}, {owner.name.split(' ')[0]}!</h1>
            </div>

            {/* Stats Container */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full"></div>
                <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-white/10 rounded-full"></div>

                <div className="relative z-10">
                    <h2 className="text-lg font-semibold mb-4 opacity-90">{t('total')}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <InfoCard title={t('income')} value={formatCurrency(totalIncome)} trend="up" />
                        <InfoCard title={t('expense')} value={formatCurrency(totalExpense)} trend="down" />
                    </div>
                    
                    <h2 className="text-lg font-semibold mb-4 opacity-90">{t('currentMonth')}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoCard title={t('income')} value={formatCurrency(currentMonthIncome)} trend="up" />
                        <InfoCard title={t('expense')} value={formatCurrency(currentMonthExpense)} trend="down" />
                    </div>
                </div>
            </div>

            {/* Manage Properties Section */}
            <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">{t('manageProperties')}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ManagementCard icon={<BuildingStorefrontIcon className="w-8 h-8 text-indigo-500"/>} label={t('addProperty')} onClick={() => setView({ page: 'properties' })} />
                    <ManagementCard icon={<ArrowTrendingUpIcon className="w-8 h-8 text-indigo-500"/>} label={t('addIncome')} onClick={() => setView({ page: 'addTransaction', type: TransactionType.INCOME })} />
                    <ManagementCard icon={<ArrowTrendingDownIcon className="w-8 h-8 text-indigo-500"/>} label={t('addExpense')} onClick={() => setView({ page: 'addTransaction', type: TransactionType.EXPENSE })} />
                    <ManagementCard icon={<UserPlusIcon className="w-8 h-8 text-indigo-500"/>} label={t('addTenant')} onClick={() => setView({ page: 'addTenant' })} />
                </div>
            </div>

             {/* Properties Preview Section */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t('properties')}</h2>
                    <button onClick={() => setView({ page: 'properties' })} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                        {t('viewAll')}
                    </button>
                </div>
                {properties.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md flex flex-col items-center justify-center text-center">
                        <DocumentDuplicateIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 font-semibold">{t('noPropertiesDashboard')}</p>
                    </div>
                ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {properties.slice(0, 2).map(property => (
                             <div key={property.id} onClick={() => setView({ page: 'propertyDetail', propertyId: property.id })} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden group cursor-pointer">
                                <div className="relative">
                                    {property.photoFileIds && property.photoFileIds.length > 0 ? (
                                        <ImageFromDb 
                                            fileId={property.photoFileIds[0]} 
                                            alt={property.name}
                                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <img 
                                            src='https://via.placeholder.com/400x200' 
                                            alt={property.name} 
                                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    )}
                                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/60 to-transparent"></div>
                                    <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                        {property.status === PropertyStatus.VACANT ? t('statusVacant') : t('statusRented')}
                                    </div>
                                    <div className="absolute top-3 left-3 bg-black/50 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1.5">
                                        {getPropertyTypeIcon(property.type)}
                                        <span>{getPropertyTypeName(property.type)}</span>
                                    </div>
                                    <div className="absolute bottom-4 left-4 text-white">
                                        <h3 className="font-bold text-lg">{property.unitNumber && `${property.unitNumber}, `}{property.name}</h3>
                                        <div className="flex items-center text-sm opacity-90 gap-1">
                                            <MapPinIcon className="w-4 h-4"/>
                                            <span>{property.address}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper Components specific to Dashboard
interface InfoCardProps {
    title: string;
    value: string;
    trend: 'up' | 'down';
}

const InfoCard: React.FC<InfoCardProps> = ({ title, value, trend }) => (
    <div className="bg-white/95 dark:bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl text-gray-800 dark:text-gray-200 shadow-sm">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">{title}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
            {trend === 'up' 
                ? <ArrowTrendingUpIcon className="w-6 h-6 text-green-500" /> 
                : <ArrowTrendingDownIcon className="w-6 h-6 text-red-500" />
            }
        </div>
    </div>
);

interface ManagementCardProps {
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
}

const ManagementCard: React.FC<ManagementCardProps> = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-lg">
            {icon}
        </div>
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 text-center">{label}</p>
    </button>
);


export default Dashboard;
