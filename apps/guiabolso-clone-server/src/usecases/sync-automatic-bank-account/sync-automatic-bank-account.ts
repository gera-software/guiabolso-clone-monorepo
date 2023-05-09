import { left } from "@/shared";
import { FinancialDataProvider, UpdateAccountRepository, UseCase } from "@/usecases/ports";
import { UnexpectedError, UnregisteredAccountError } from "@/usecases/errors";
import { InvalidAccountError } from "@/entities/errors";

export class SyncAutomaticBankAccount implements UseCase {
    private readonly financialDataProvider: FinancialDataProvider
    private readonly accountRepo: UpdateAccountRepository
    
    constructor(accountRepository: UpdateAccountRepository, financialDataProvider: FinancialDataProvider) {
        this.accountRepo = accountRepository
        this.financialDataProvider = financialDataProvider
    }
    
    async perform(id: string): Promise<any> {
        const foundAccountData = await this.accountRepo.findById(id)

        if(!foundAccountData) {
            return left(new UnregisteredAccountError())
        }

        if(!foundAccountData.providerAccountId || !foundAccountData.synchronization?.providerItemId) {
            return left(new InvalidAccountError())
        }

        const accountsOrError = await this.financialDataProvider.getAccountsByItemId(foundAccountData.synchronization.providerItemId)

        if(accountsOrError.isLeft()) {
            return left(accountsOrError.value)
        }

        return left(new InvalidAccountError())
    }
    
}