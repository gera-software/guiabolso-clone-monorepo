import { left } from "@/shared";
import { AccountRepository, FinancialDataProvider, UseCase } from "@/usecases/ports";

export class ConnectAutomaticAccounts implements UseCase {
    private readonly financialDataProvider: FinancialDataProvider
    private readonly createAutomaticBankAccount: UseCase
    private readonly createAutomaticCreditCardAccount: UseCase

    constructor(financialDataProvider: FinancialDataProvider, createAutomaticBankAccount: UseCase, createAutomaticCreditCardAccount: UseCase) {
        this.financialDataProvider = financialDataProvider
        this.createAutomaticBankAccount = createAutomaticBankAccount
        this.createAutomaticCreditCardAccount = createAutomaticCreditCardAccount
    }

    async perform(request: { itemId: string }): Promise<any> {
        const accountsOrError = await this.financialDataProvider.getAccountsByItemId(request.itemId)
        
        if(accountsOrError.isLeft()) {
            return left(accountsOrError.value)
        }
        
        throw new Error();
    }

}