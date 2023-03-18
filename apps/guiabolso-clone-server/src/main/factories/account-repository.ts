import { MongodbAccountRepository } from "@/external/repositories/mongodb"
import { UpdateAccountRepository } from "@/usecases/ports"

export const makeAccountRepository = (): UpdateAccountRepository => {
    return new MongodbAccountRepository()
}