export enum InstitutionType {
    PERSONAL_BANK = 'PERSONAL_BANK',
    BUSINESS_BANK = 'BUSINESS_BANK',
    INVESTMENT = 'INVESTMENT',
}

export interface Institution {
    _id?: String,
    pluggyConnectorId?: Number,
    name: String,
    imageUrl?: String,
    primaryColor?: String,
    type: InstitutionType,
}

export interface Category {
    _id?: string,
    name: string,
    iconName: string,
    primaryColor: string,
    ignored?: boolean,
    group: string,
}

export interface User {
    _id?: String,
    name: String,
    email: String,
    netlifyId: String,
}

export enum AccountSyncType {
    MANUAL = 'MANUAL',
    AUTOMATIC = 'AUTOMATIC'
} 

export enum AccountType {
    WALLET = 'WALLET',
    BANK = 'BANK',
    CREDIT_CARD = 'CREDIT_CARD'
}

export enum CurrencyCodes {
    BRL = 'BRL',
}

export interface AccountOwner {
    name: String,
    pluggyIdentityId?: String,
    cpf?: String,
}

export interface BankData {
    institution: Institution,
} 

export interface CreditData {
    institution: Institution,
    brand: String,
    creditLimit: Number,
    availableCreditLimit: Number,
    closeDay: Number,
    dueDay: Number,
}

export interface AccountDTO {
    _id?: String,
    name: String,
    imageUrl?: String,
    syncType: AccountSyncType,
    pluggyAccountId?: String,
    initialBalance?: Number,
    balance: Number,
    currencyCode: CurrencyCodes,
    type: AccountType,
    userId: String,
    syncId?: String,
    sync?: Synchronization,
    accountOwner?: AccountOwner,
    bankData?: BankData,
    creditData?: CreditData,
    _isDeleted?: Boolean,
}

export interface AccountSummaryDTO {
    _id?: String,
    name: String,
    imageUrl?: String,
    syncType: AccountSyncType,
    balance: Number,
    currencyCode: CurrencyCodes,
    type: AccountType,
    userId: String,
    syncId?: String,
    sync?: Synchronization,
    _isDeleted?: Boolean,
}

export enum TransactionType {
    EXPENSE = 'EXPENSE',
    INCOME = 'INCOME',
}

export enum TransactionStatus {
    PENDING = 'PENDING',
    POSTED = 'POSTED',
}

export interface TransactionRequest {
    _id?: string,
    accountId: string,
    categoryId?: string,
    amount: number,
    date: Date,
    description: string,
    comment?: string,
    ignored?: boolean,
}

export interface Transaction {
    _id?: string,
    pluggyTransactionId?: string,
    description?: string,
    descriptionOriginal?: string,
    amount: number,
    currencyCode: CurrencyCodes,
    date: Date,
    invoiceDate?: Date,//invoiceDate
    category?: Category,
    type: TransactionType,
    syncType: AccountSyncType,
    status: TransactionStatus,
    comment?: string,
    ignored?: boolean,
    accountId: string,
    accountType?: AccountType,
    userId: string,
    creditCardInvoiceId?: string,//invoiceId
    _isDeleted?: boolean,
}

export interface AccountData {
    _id?: String,
    name: String,
    type: AccountType,
    imageUrl?: String,
  }
  
export interface TransactionSummaryDTO {
    _id?: string,
    description?: string,
    descriptionOriginal?: string,
    amount: number,
    currencyCode: CurrencyCodes,
    date: Date,
    category?: Category,
    type: TransactionType,
    status: TransactionStatus,
    ignored: boolean,
    account: AccountData
}

export enum SyncStatus {
    PREPARING = 'PREPARING',
    READY = 'READY',
    IN_PROGRESS = 'IN_PROGRESS',
    SYNCED = 'SYNCED',
}

export interface Synchronization {
    _id?: string,
    pluggyItemId: string,
    itemStatus: string,
    syncStatus: SyncStatus,
    createdAt: Date,
    lastSyncAt: Date,
    userId: string,
}


export enum BillStatus {
    PAID = 'PAID',
    WAITING = 'WAITING'
}

export enum BillType {
    PAYABLE = 'PAYABLE',
    RECEIVABLE = 'RECEIVABLE',
}

export interface CalendarBill {
    _id?: string,
    dueDate: Date,
    description: string,
    amount: number,
    status: BillStatus,
    type: BillType,
    userId: string,
    _isDeleted: boolean,
}

export interface CreditCardInvoice {
    _id?: string,
    dueDate: Date,
    closeDate: Date,
    amount: number,
    currencyCode: CurrencyCodes,
    userId: string,
    accountId: string,
    _isDeleted: boolean,
}


export interface DataProvider {
    fetchInstitutions(): Promise<Institution[]>
}