import { MongodbInstitutionRepository } from "@/external/repositories/mongodb"
import { InstitutionRepository } from "@/usecases/ports"

export const makeInstitutionRepository = (): InstitutionRepository => {
    return new MongodbInstitutionRepository()
}