import { Either, left, right } from "@/shared";
import { AccountData, AccountRepository, FinancialDataProvider, UseCase } from "@/usecases/ports";

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

        const accounts = accountsOrError.value as AccountData[] 

        const results = []
        let res
        for(let i = 0; i < accounts.length; i++) {
            switch(accounts[i].type) {
                case 'BANK':
                    res = await this.createAutomaticBankAccount.perform(accounts[i])
                    if(res.isRight()) {
                        results.push(res.value)
                    }
                    break
                case 'CREDIT_CARD':
                    res = await this.createAutomaticCreditCardAccount.perform(accounts[i])
                    if(res.isRight()) {
                        results.push(res.value)
                    }
                    break
            }
        }

        

        return right(results)
    }

}