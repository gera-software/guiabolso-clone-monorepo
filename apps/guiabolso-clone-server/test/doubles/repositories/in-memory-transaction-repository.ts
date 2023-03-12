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
    
}