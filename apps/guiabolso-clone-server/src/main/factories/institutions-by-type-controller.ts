import { ListInstitutionsByType } from "@/usecases/list-institutions-by-type"
import { ListInstitutionsByTypeController } from "@/web-controllers"
import { Controller } from "@/web-controllers/ports"
import { makeInstitutionRepository } from "@/main/factories"

export const makeListInstitutionsByTypeController = (): Controller => {
    const institutionRepository = makeInstitutionRepository()
    const usecase = new ListInstitutionsByType(institutionRepository)
    const controller = new ListInstitutionsByTypeController(usecase)
    return controller
}