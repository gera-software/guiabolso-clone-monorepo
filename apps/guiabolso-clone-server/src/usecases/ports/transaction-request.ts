export interface TransactionRequest {
    id?: string,
    accountId: string,
    categoryId?: string,
    amount: number,
    description?: string,
    descriptionOriginal?: string,
    date: Date,
    type: string,
    comment?: string,
    ignored?: boolean,
}