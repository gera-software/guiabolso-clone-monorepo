import { TokenData } from "./token-data";

export interface TokenRepository {
    update(token: TokenData): Promise<TokenData>
}