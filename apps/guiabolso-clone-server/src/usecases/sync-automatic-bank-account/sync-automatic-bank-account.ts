import { Either, left, right } from "@/shared";
import { AccountData, FinancialDataProvider, TransactionRepository, UpdateAccountRepository, UseCase } from "@/usecases/ports";
import { DataProviderError, UnexpectedError, UnregisteredAccountError } from "@/usecases/errors";
import { InvalidAccountError } from "@/entities/errors";
import { AccountType, MergeStatus } from "@/entities";

export class SyncAutomaticBankAccount implements UseCase {
    private readonly financialDataProvider: FinancialDataProvider
    private readonly accountRepo: UpdateAccountRepository
    private readonly transactionRepo: TransactionRepository
    
    constructor(accountRepository: UpdateAccountRepository, transactionRepository: TransactionRepository, financialDataProvider: FinancialDataProvider) {
        this.accountRepo = accountRepository
        this.transactionRepo = transactionRepository
        this.financialDataProvider = financialDataProvider
    }
    
    async perform(accountId: string): Promise<Either<UnregisteredAccountError | InvalidAccountError | UnexpectedError | DataProviderError, AccountData>> {
        console.time('sync-bank')
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

        const synchronization = {
            syncStatus: accountDataToSync.synchronization.syncStatus,
            lastSyncAt: accountDataToSync.synchronization.lastSyncAt,
            lastMergeAt: null as Date,
            mergeStatus: null as string,
        }

        if(accountDataToSync.synchronization.syncStatus == 'UPDATED') {
            await this.accountRepo.updateBalance(accountId, accountDataToSync.balance)

            // merge transactions
            const fromDate = new Date(foundAccountData.synchronization.createdAt)
            fromDate.setMonth(foundAccountData.synchronization.createdAt.getMonth() -3)
            fromDate.setUTCDate(1)
            const transactionRequestsOrError = await this.financialDataProvider.getTransactionsByProviderAccountId(accountId, accountDataToSync.type as AccountType, {
                providerAccountId: accountDataToSync.providerAccountId,
                from: fromDate
            })
            if(transactionRequestsOrError.isLeft()) {
                return left(transactionRequestsOrError.value)
            }

            const transactionRequests = transactionRequestsOrError.value

            const transactionsData = transactionRequests.map(transaction => ({
                id: transaction.id,
                accountId: transaction.accountId,
                accountType: foundAccountData.type,
                syncType: foundAccountData.syncType,
                userId: foundAccountData.userId,
                // category: CategoryData,
                amount: transaction.amount,
                // description: string,
                descriptionOriginal: transaction.descriptionOriginal,
                date: transaction.date,
                // invoiceDate: Date,
                // invoiceId: string,
                type: transaction.amount >= 0 ? 'INCOME' : 'EXPENSE',
                // comment?: string,
                // ignored?: boolean,
                // _isDeleted?: boolean,
                providerId: transaction.providerId,
            }))

            await this.transactionRepo.mergeTransactions(transactionsData)


            synchronization.lastMergeAt = new Date()
            synchronization.mergeStatus = 'MERGED'
        }

        await this.accountRepo.updateSynchronizationStatus(accountId, synchronization)
        
        const updatedAccount = await this.accountRepo.findById(accountId)
        console.timeEnd('sync-bank')
        return right(updatedAccount)
    }
    
}