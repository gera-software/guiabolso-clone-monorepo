import { PluggyDataProvider } from "@/external/financial-data-provider"
import { ListAvailableAutomaticInstitutions } from "@/usecases/list-available-automatic-institutions"
import { ListAvailableAutomaticInstitutionsController } from "@/web-controllers"
import { Controller } from "@/web-controllers/ports"

export const makeListAvailableAutomaticInstitutionsController = (): Controller => {
    const clientId = process.env.PLUGGY_CLIENT_ID
    const clientSecret = process.env.PLUGGY_CLIENT_SECRET
    const financialDataProvider = new PluggyDataProvider(clientId, clientSecret)
    const usecase = new ListAvailableAutomaticInstitutions(financialDataProvider)
    const controller = new ListAvailableAutomaticInstitutionsController(usecase)
    return controller
}