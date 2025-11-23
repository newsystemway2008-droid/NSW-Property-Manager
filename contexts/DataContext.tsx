
import React, { createContext, useContext } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Property, Transaction, Document, Owner, Tenant } from '../types';

interface DataContextType {
  properties: Property[];
  setProperties: React.Dispatch<React.SetStateAction<Property[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  documents: Document[];
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  owner: Owner;
  setOwner: React.Dispatch<React.SetStateAction<Owner>>;
  tenants: Tenant[];
  setTenants: React.Dispatch<React.SetStateAction<Tenant[]>>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const initialOwner: Owner = {
    id: 'owner_1',
    name: 'John Doe',
    phone: '+61 412 345 678',
    email: 'john.doe@example.com',
    address: '123 Example St, Sydney, NSW 2000'
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useLocalStorage<Property[]>('properties', []);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
  const [documents, setDocuments] = useLocalStorage<Document[]>('documents', []);
  const [tenants, setTenants] = useLocalStorage<Tenant[]>('tenants', []);
  const [owner, setOwner] = useLocalStorage<Owner>('owner', initialOwner);

  return (
    <DataContext.Provider value={{ 
        properties, setProperties, 
        transactions, setTransactions, 
        documents, setDocuments,
        tenants, setTenants,
        owner, setOwner
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
