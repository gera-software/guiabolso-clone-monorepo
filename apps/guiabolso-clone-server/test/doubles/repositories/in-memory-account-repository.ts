import { AccountRepository, AccountData, UpdateAccountRepository } from "@/usecases/ports";

export class InMemoryAccountRepository implements AccountRepository, UpdateAccountRepository {
    private readonly _data: AccountData[]
    private idCounter: number = 0

    constructor (data: AccountData[]) {
        this._data = data
    }

    public get data() {
        return this._data
    }

    async add(account: AccountData): Promise<AccountData> {
        account.id = this.idCounter.toString()
        this.idCounter++
        this.data.push(account)
        return account
    }

    async findById(id: string): Promise<AccountData> {
        const account = this.data.find(account => account.id == id)
        return account || null
    }

    async exists(id: string): Promise<boolean> {
        const found = await this.findById(id)
        if(found) {
            return true
        }

        return false
    }



    async addToBalance(accountId: string, amount: number): Promise<void> {
        const account = await this.findById(accountId)
        if(account) {
            account.balance += amount
        }
    }


}