import { AccountRepository, AccountData } from "@/usecases/ports";

export class InMemoryAccountRepository implements AccountRepository {
    private readonly _data: AccountData[]
    private idCounter: number = 0

    constructor (data: AccountData[]) {
        this._data = data
    }

    async add(account: AccountData): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async find(id: string): Promise<AccountData> {
        throw new Error("Method not implemented.");
    }
    
    async exists(id: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    public get data() {
        return this._data
    }


}