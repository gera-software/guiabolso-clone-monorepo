export interface TransactionRequest {
    id?: string,
    accountId: string,
    categoryId?: string,
    amount: number,
    description?: string,
    descriptionOriginal?: string,
    date: Date,
    comment?: string,
    ignored?: boolean,
    providerId?: string,
}