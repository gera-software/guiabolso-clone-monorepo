import { PluggyConnectWidgetCreateToken } from "@/usecases/pluggy-connect-widget-create-token";
import { PluggyConnectWidgetCreateTokenController } from "@/web-controllers";
import { Controller } from "@/web-controllers/ports";
import { makeFinancialDataProvider } from "@/main/factories"

export const makePluggyConnectWidgetCreateTokenController = (): Controller => {
    const financialDataProvider = makeFinancialDataProvider()
    const usecase = new PluggyConnectWidgetCreateToken(financialDataProvider)
    const controller = new PluggyConnectWidgetCreateTokenController(usecase)

    return controller
}