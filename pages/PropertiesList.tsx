import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Property, PropertyType, PropertyStatus } from '../types';
import { HomeIcon, BuildingStorefrontIcon, MapPinIcon, BuildingOfficeIcon, DotsVerticalIcon } from '../components/icons';
import { View } from '../App';
import PropertyFormModal from '../components/PropertyFormModal';
// FIX: Import getFile to fetch images from IndexedDB, and deleteFiles for cascade deletion.
import { deleteFiles, getFile } from '../utils/db';


interface PropertiesListProps {
    setView: (view: View) => void;
}

// FIX: Added a helper component to asynchronously load and display an image from IndexedDB.
const ImageFromDb: React.FC<{ fileId: string; alt: string; className: string }> = ({ fileId, alt, className }) => {
    const [imageUrl, setImageUrl] = useState<string>('https://via.placeholder.com/400x200');

    useEffect(() => {
        let isMounted = true;
        let objectUrl: string | undefined;

        const fetchImage = async () => {
            const file = await getFile(fileId);
            if (isMounted && file) {
                objectUrl = URL.createObjectURL(file);
                setImageUrl(objectUrl);
            }
        };
        fetchImage();
        return () => { 
            isMounted = false; 
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [fileId]);

    return <img src={imageUrl} alt={alt} className={className} />;
};


const PropertiesList: React.FC<PropertiesListProps> = ({ setView }) => {
    const { properties, setProperties, transactions, setTransactions, documents, setDocuments, tenants, setTenants } = useData();
    const { t } = useLanguage();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [propertyToEdit, setPropertyToEdit] = useState<Property | null>(null);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);

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
    
    const handleEdit = (property: Property) => {
        setPropertyToEdit(property);
        setIsModalOpen(true);
        setOpenMenuId(null);
    };

    const handleDelete = async (propertyId: string) => {
        if (window.confirm(`${t('areYouSure')}\n${t('confirmDelete')}`)) {
            const propertyToDelete = properties.find(p => p.id === propertyId);
            if (!propertyToDelete) return;

            // Find all related data for cascade delete
            const propertyTenants = tenants.filter(t => t.propertyId === propertyId);
            const propertyDocs = documents.filter(doc => doc.propertyId === propertyId);
            const tenantDocs = documents.filter(doc => propertyTenants.some(pt => pt.id === doc.tenantId));
            
            const docFileIdsToDelete = [...propertyDocs, ...tenantDocs].map(d => d.fileId);
            const photoFileIdsToDelete = propertyToDelete.photoFileIds || [];

            // Delete files from IndexedDB
            const allFileIdsToDelete = [...docFileIdsToDelete, ...photoFileIdsToDelete];
            if (allFileIdsToDelete.length > 0) {
                await deleteFiles(allFileIdsToDelete);
            }

            // Delete records from state
            setProperties(prev => prev.filter(p => p.id !== propertyId));
            setTransactions(prev => prev.filter(tx => tx.propertyId !== propertyId));
            setTenants(prev => prev.filter(t => t.propertyId !== propertyId));
            setDocuments(prev => prev.filter(doc => doc.propertyId !== propertyId && !propertyTenants.some(pt => pt.id === doc.tenantId)));
        }
        setOpenMenuId(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('propertiesTitle')}</h1>
                <button 
                    onClick={() => {
                        setPropertyToEdit(null);
                        setIsModalOpen(true);
                    }}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg shadow hover:bg-primary-700 transition-colors">
                    {t('addProperty')}
                </button>
            </div>

            <PropertyFormModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                propertyToEdit={propertyToEdit} 
            />

            {properties.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <p className="text-gray-500 dark:text-gray-400">{t('noProperties')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map(property => (
                        <div key={property.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden group">
                            <div className="relative">
                                {/* FIX: Use `photoFileIds` from the Property type and the `ImageFromDb` component to render images from IndexedDB. This replaces the incorrect use of a non-existent `photos` property. */}
                                <div onClick={() => setView({ page: 'propertyDetail', propertyId: property.id })} className="cursor-pointer">
                                    {property.photoFileIds && property.photoFileIds.length > 0 ? (
                                        <ImageFromDb 
                                            fileId={property.photoFileIds[0]}
                                            alt={property.name}
                                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                            <HomeIcon className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                                        </div>
                                    )}
                                </div>
                                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
                                
                                {/* Actions Menu Button */}
                                <div className="absolute top-2 right-2">
                                    <button 
                                        onClick={() => setOpenMenuId(openMenuId === property.id ? null : property.id)}
                                        className="p-1.5 bg-black/40 rounded-full text-white hover:bg-black/60 transition-colors"
                                    >
                                        <DotsVerticalIcon className="w-5 h-5" />
                                    </button>
                                    
                                    {/* Actions Menu Dropdown */}
                                    {openMenuId === property.id && (
                                        <div ref={menuRef} className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-700 rounded-md shadow-lg z-10 text-sm">
                                            <button 
                                                onClick={() => handleEdit(property)}
                                                className="block w-full text-left px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                                            >
                                                {t('edit')}
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(property.id)}
                                                className="block w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                                            >
                                                {t('delete')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="absolute top-3 left-3 bg-black/50 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1.5 pointer-events-none">
                                    {getPropertyTypeIcon(property.type)}
                                    <span>{getPropertyTypeName(property.type)}</span>
                                </div>
                                <div className="absolute bottom-4 left-4 text-white pointer-events-none">
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
    );
};

export default PropertiesList;