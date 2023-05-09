import { left, right } from "@/shared";
import { AccountData, FinancialDataProvider, UpdateAccountRepository, UseCase } from "@/usecases/ports";
import { UnexpectedError, UnregisteredAccountError } from "@/usecases/errors";
import { InvalidAccountError } from "@/entities/errors";

export class SyncAutomaticBankAccount implements UseCase {
    private readonly financialDataProvider: FinancialDataProvider
    private readonly accountRepo: UpdateAccountRepository
    
    constructor(accountRepository: UpdateAccountRepository, financialDataProvider: FinancialDataProvider) {
        this.accountRepo = accountRepository
        this.financialDataProvider = financialDataProvider
    }
    
    async perform(accountId: string): Promise<any> {
        const foundAccountData = await this.accountRepo.findById(accountId)

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

        const accounts = accountsOrError.value as AccountData[]

        const accountDataToSync = accounts.find(account => account.providerAccountId === foundAccountData.providerAccountId)

        if(!accountDataToSync) {
            return left(new UnexpectedError('data provider item does not have the requested account'))
        }

        await this.accountRepo.updateBalance(accountId, accountDataToSync.balance)

        const updatedAccount = await this.accountRepo.findById(accountId)
        return right(updatedAccount)
    }
    
}