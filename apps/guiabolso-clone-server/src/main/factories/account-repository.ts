import { MongodbAccountRepository } from "@/external/repositories/mongodb"
import { AccountRepository } from "@/usecases/ports"

export const makeAccountRepository = (): AccountRepository => {
    return new MongodbAccountRepository()
}