import { MongodbUserRepository } from "@/external/repositories/mongodb"
import { UserRepository } from "@/usecases/ports"

export const makeUserRepository = (): UserRepository => {
    return new MongodbUserRepository()
}