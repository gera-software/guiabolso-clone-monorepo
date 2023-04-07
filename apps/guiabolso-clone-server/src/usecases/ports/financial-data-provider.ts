import { ConnectorData } from "@/usecases/ports";

export interface FinancialDataProvider {
    fetchConnectors(): Promise<ConnectorData[]>
}