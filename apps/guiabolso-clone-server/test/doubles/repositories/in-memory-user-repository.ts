import { UserData } from "@/usecases/ports";

export class InMemoryUserRepository {
    private readonly _data: UserData[]
    private idCounter: number = 0

    constructor (data: UserData[]) {
        this._data = data
    }

    public get data() {
        return this._data
    }

    public async findAll(): Promise<UserData[]> {
        return this.data
    }

    public async findByEmail(email: string): Promise<UserData | null> {
        const user = this.data.find(user => user.email == email)
        return user || null
    }

    public async add(userData: UserData): Promise<UserData> {
        userData.id = this.idCounter.toString()
        this.idCounter++
        this.data.push(userData)

        return userData
    }

}