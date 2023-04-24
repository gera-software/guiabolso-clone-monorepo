import { left, right } from "@/shared";
import { AccountData, FinancialDataProvider, InstitutionRepository, UseCase } from "@/usecases/ports";

export class ConnectAutomaticAccounts implements UseCase {
    private readonly financialDataProvider: FinancialDataProvider
    private readonly createAutomaticBankAccount: UseCase
    private readonly createAutomaticCreditCardAccount: UseCase
    private readonly institutionRepo: InstitutionRepository

    constructor(financialDataProvider: FinancialDataProvider, createAutomaticBankAccount: UseCase, createAutomaticCreditCardAccount: UseCase, institutionRepository: InstitutionRepository) {
        this.financialDataProvider = financialDataProvider
        this.createAutomaticBankAccount = createAutomaticBankAccount
        this.createAutomaticCreditCardAccount = createAutomaticCreditCardAccount
        this.institutionRepo = institutionRepository
    }

    async perform(request: { itemId: string }): Promise<any> {
        const accountsOrError = await this.financialDataProvider.getAccountsByItemId(request.itemId)
        
        if(accountsOrError.isLeft()) {
            return left(accountsOrError.value)
        }

        const accounts = accountsOrError.value as AccountData[] 


        // update institutions list
        const providerConnectorId: number = +accounts[0].institution.providerConnectorId
        const institution = await this.financialDataProvider.getInstitution(providerConnectorId)


        const results = []
        for(let i = 0; i < accounts.length; i++) {
            let res
            switch(accounts[i].type) {
                case 'BANK':
                    res = await this.createAutomaticBankAccount.perform(accounts[i])
                    break
                case 'CREDIT_CARD':
                    res = await this.createAutomaticCreditCardAccount.perform(accounts[i])
                    break
            }

            if(res && res.isRight()) {
                results.push(res.value)
            } else {
                // results.push(res.value)
            }
        }

        return right(results)
    }

}