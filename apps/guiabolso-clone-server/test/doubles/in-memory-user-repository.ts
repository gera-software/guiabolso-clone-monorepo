import { UserData } from "@/usecases/ports";

export class InMemoryUserRepository {
    private readonly _data: UserData[]

    constructor (data: UserData[]) {
        this._data = data
    }

}