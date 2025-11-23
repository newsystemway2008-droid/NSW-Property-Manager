export enum PropertyType {
  HOUSE = 'House',
  SHOP = 'Shop',
  LAND = 'Land',
  APARTMENT = 'Apartment',
  COMMERCIAL = 'Commercial',
}

export enum PropertyStatus {
  VACANT = 'Vacant',
  RENTED = 'Rented',
}

export enum TransactionType {
  INCOME = 'Income',
  EXPENSE = 'Expense',
}

export enum PaymentMode {
    CASH = 'Cash',
    BANK_TRANSFER = 'Bank Transfer',
    CREDIT_CARD = 'Credit Card',
}

export enum UserRole {
    USER = 'User',
    ADMIN = 'Admin'
}

export enum ExpenseCategory {
  DEPRECATION = 'Deprecation',
  CLEANING_MAINTENANCE = 'CleaningMaintenance',
  TAXES = 'Taxes',
  AUTO_TRAVEL = 'AutoAndTravel',
  OTHER = 'Other',
  REPAIRS = 'Repairs',
}

export enum InclusiveCharge {
  LIGHT_BILL = 'Light Bill',
  GOVERNMENT_TAXES = 'Government Taxes',
  WATER_CHARGES = 'Water Charges',
  MAINTENANCE_CHARGES = 'Maintenance Charges',
}

export interface Tenant {
  id: string;
  propertyId: string;
  name: string;
  mobile: string;
  email?: string;
  leaseStartDate: string;
  leaseEndDate: string;
  leaseTerm?: string;
  renewalDate?: string;
  leaseAmount: number;
  paymentDueDay: number;
  deposit?: number;
  inclusiveCharges?: InclusiveCharge[];
  photo?: string;
}

export interface Document {
  id: string;
  propertyId?: string; // A document can belong to a property
  tenantId?: string; // OR a tenant
  name: string;
  type: string;
  fileId: string; // Reference to IndexedDB
  uploadedAt: string;
}

export interface Transaction {
  id:string;
  propertyId: string;
  type: TransactionType;
  description: string;
  amount: number;
  date: string;
  paymentMode?: PaymentMode;
  tenantName?: string;
  remarks?: string;
  receipts?: string[]; // base64 encoded images
  category?: ExpenseCategory;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  type: PropertyType;
  ownerId: string;
  status: PropertyStatus;
  photos?: string[];
  expectedRent?: number;
  unitNumber?: string;
}

export interface Owner {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  photo?: string;
}