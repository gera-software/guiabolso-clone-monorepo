import { TokenData, TokenRepository } from "@/usecases/ports";

export class InMemoryTokenRepository implements TokenRepository {
    private readonly _data: TokenData[]
    private idCounter: number = 0

    constructor(data: TokenData[]) {
        this._data = data
    }

    public get data() {
        return this._data
    }

    async update(token: TokenData): Promise<TokenData> {
        this._data.push(token)
        return token
    }

}