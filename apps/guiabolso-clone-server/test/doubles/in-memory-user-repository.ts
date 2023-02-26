import { UserData } from "@/usecases/ports";

export class InMemoryUserRepository {
    private readonly _data: UserData[]

    constructor (data: UserData[]) {
        this._data = data
    }

    async findAll() {
        // return this._data
        return [
            {
                name: 'any name',
                email: 'any@mail.com',
                password: 'validpassword',
            }
        ]
    }

    async findByEmail(email: string) {
        return {
            name: 'any name',
            email: 'any@mail.com',
            password: 'validpassword',
        }

    }

}