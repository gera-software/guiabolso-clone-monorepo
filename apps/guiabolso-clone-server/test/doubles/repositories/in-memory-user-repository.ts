import { UserData, UserRepository } from "@/usecases/ports"

export class InMemoryUserRepository implements UserRepository {
    private readonly _data: UserData[]
    private idCounter: number = 0

    constructor (data: UserData[]) {
        this._data = data
    }

    public get data() {
        return this._data
    }

    public async exists(user: UserData): Promise<boolean> {
        const found = await this.findUserByEmail(user.email)
        if(found) {
            return true
        }

        return false
    }

    public async findUserByEmail(email: string): Promise<UserData | null> {
        const user = this.data.find(user => user.email == email)
        return user || null
    }

    public async findUserById(id: string): Promise<UserData | null> {
        const user = this.data.find(user => user.id == id)
        return user || null
    }

    public async add(userData: UserData): Promise<UserData> {
        userData.id = this.idCounter.toString()
        this.idCounter++
        this.data.push({...userData})
        return userData
    }

    public async verifyEmail(id: string): Promise<void> {
        const user = this.data.find(user => user.id == id)
        if(user) {
            user.isVerified = true
        }
    }

}