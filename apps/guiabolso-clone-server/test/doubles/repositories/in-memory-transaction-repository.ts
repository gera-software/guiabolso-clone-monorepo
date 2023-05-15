import { TransactionRequest, TransactionRepository, TransactionData } from "@/usecases/ports";

export class InMemoryTransactionRepository implements TransactionRepository {
    private readonly _data: TransactionData[]
    private idCounter: number = 0

    constructor(data: TransactionData[]) {
        this._data = data
    }

    public get data() {
        return this._data
    }

    async add(transaction: TransactionData): Promise<TransactionData> {
        transaction.id = this.idCounter.toString()
        this.idCounter++
        this.data.push(transaction)
        return transaction
    }

    async findById(id: string): Promise<TransactionData> {
        const transaction = this.data.find(transaction => transaction.id == id)
        return transaction || null
    }

    async exists(id: string): Promise<boolean> {
        const found = await this.findById(id)
        if(!found || found._isDeleted) {
            return false
        }

        return true
    }

    async remove(id: string): Promise<TransactionData> {
        const transaction = await this.findById(id)

        if(!transaction || transaction._isDeleted) {
            return null
        }

        transaction._isDeleted = true

        return transaction
    }
    
    async update(transaction: TransactionData): Promise<TransactionData> {
        const transactionToUpdate = await this.findById(transaction.id)

        transactionToUpdate.amount = transaction.amount
        transactionToUpdate.description = transaction.description
        transactionToUpdate.descriptionOriginal = transaction.descriptionOriginal
        transactionToUpdate.date = transaction.date
        transactionToUpdate.invoiceDate = transaction.invoiceDate
        transactionToUpdate.invoiceId = transaction.invoiceId,
        transactionToUpdate.type = transaction.type
        transactionToUpdate.comment = transaction.comment
        transactionToUpdate.ignored = transaction.ignored
        transactionToUpdate.category = transaction.category


        return transactionToUpdate
    }

    async mergeTransactions(transactions: TransactionData[]): Promise<{ upsertedIds: string[], modifiedCount: number }> {

        const transactionsData = transactions.map((transaction, index) => ({
            id: ''+index,
            accountId: transaction.accountId,
            accountType: transaction.accountType,
            syncType: transaction.syncType,
            userId: transaction.userId,
            amount: transaction.amount,
            descriptionOriginal: transaction.descriptionOriginal,
            date: transaction.date,
            // invoiceDate: transaction.invoiceDate ?? null,
            // invoiceId: transaction.invoiceId ? transaction.invoiceId : null,
            type: transaction.type,
            providerId: transaction.providerId,
            // description: transaction.description,
            // comment: transaction.comment,
            // ignored: transaction.ignored,
            // _isDeleted: transaction._isDeleted,
        }))

        this._data.push(...transactionsData)

        return {
            upsertedIds: transactionsData.map(transaction => transaction.id),
            modifiedCount: 0,
        }
    }

}