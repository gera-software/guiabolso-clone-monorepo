import { PluggyDataProvider } from "@/external/financial-data-provider"

export const makeFinancialDataProvider = () => {
    const clientId = process.env.PLUGGY_CLIENT_ID
    const clientSecret = process.env.PLUGGY_CLIENT_SECRET
    return new PluggyDataProvider(clientId, clientSecret)
}