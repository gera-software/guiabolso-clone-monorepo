import { Either, left, right } from "@/shared";
import { AccountData, CreditCardInvoiceRepository, FinancialDataProvider, InstitutionRepository, TransactionData, TransactionRepository, UpdateAccountRepository, UseCase, UserData, UserRepository } from "@/usecases/ports";
import { DataProviderError, UnexpectedError, UnregisteredAccountError, UnregisteredInstitutionError } from "@/usecases/errors";
import { InvalidAccountError, InvalidBalanceError, InvalidCreditCardError, InvalidEmailError, InvalidInstitutionError, InvalidNameError, InvalidPasswordError, InvalidTypeError } from "@/entities/errors";
import { AccountType, AutomaticCreditCardAccount, Institution, NubankCreditCardInvoiceStrategy, User } from "@/entities";

export class SyncAutomaticCreditCardAccount implements UseCase {
    private readonly financialDataProvider: FinancialDataProvider
    private readonly accountRepo: UpdateAccountRepository
    private readonly userRepo: UserRepository
    private readonly institutionRepo: InstitutionRepository
    private readonly transactionRepo: TransactionRepository
    private readonly invoiceRepo: CreditCardInvoiceRepository

    private readonly invoicesIdLookupTable = new Map<Date, string>();
    
    constructor(accountRepository: UpdateAccountRepository, userRepository: UserRepository, institutionRepository: InstitutionRepository, transactionRepository: TransactionRepository, invoiceRepository: CreditCardInvoiceRepository, financialDataProvider: FinancialDataProvider) {
        this.accountRepo = accountRepository
        this.userRepo = userRepository
        this.institutionRepo = institutionRepository
        this.transactionRepo = transactionRepository
        this.invoiceRepo = invoiceRepository
        this.financialDataProvider = financialDataProvider
    }

    private async createCreditCardAccount(accountData: AccountData, userData: UserData): Promise<Either<InvalidNameError | InvalidEmailError | InvalidPasswordError | InvalidBalanceError | InvalidCreditCardError | InvalidInstitutionError | InvalidAccountError | UnregisteredInstitutionError | InvalidTypeError, AutomaticCreditCardAccount>> {
        const userOrError = User.create(userData)
        if(userOrError.isLeft()) {
            return left(userOrError.value)
        }

        const user = userOrError.value as User

        let institution: Institution = null
        if(accountData.institution && accountData.institution.id) {
            const foundInstitutionData = await this.institutionRepo.findById(accountData.institution.id)
            if(!foundInstitutionData) {
                return left(new UnregisteredInstitutionError())
            }
            accountData.institution = foundInstitutionData

            const institutionOrError = Institution.create(foundInstitutionData)
            if(institutionOrError.isLeft()) {
                return left(institutionOrError.value)
            }

            institution = institutionOrError.value as Institution
        }

        const accountOrError = AutomaticCreditCardAccount.create(
            { 
                name: accountData.name, 
                balance: accountData.balance, 
                imageUrl: accountData.imageUrl, 
                user,
                institution,
                creditCardInfo: accountData.creditCardInfo,
                providerAccountId: accountData.providerAccountId, 
                providerItemId: accountData.synchronization.providerItemId, 
                createdAt: accountData.synchronization.createdAt,
                syncStatus: accountData.synchronization.syncStatus,
                lastSyncAt: accountData.synchronization.lastSyncAt,
            },
            new NubankCreditCardInvoiceStrategy()
        )
        if(accountOrError.isLeft()) {
            return left(accountOrError.value)
        }

        return right(accountOrError.value as AutomaticCreditCardAccount)
    }

    private async getInvoiceId(invoiceDueDate: Date, invoiceClosingDate: Date, accountData: AccountData) {
        if(this.invoicesIdLookupTable.has(invoiceDueDate)) {
            return this.invoicesIdLookupTable.get(invoiceDueDate)
        }

        let invoiceData = await this.invoiceRepo.findByDueDate(invoiceDueDate, accountData.id)
        if(!invoiceData) {
            invoiceData = await this.invoiceRepo.add({
                dueDate: invoiceDueDate,
                closeDate: invoiceClosingDate,
                amount: 0,
                userId: accountData.userId,
                accountId: accountData.id,
                _isDeleted: false
            })
        }

        this.invoicesIdLookupTable.set(invoiceDueDate, invoiceData.id)
        return invoiceData.id
    }
    
    async perform(accountId: string): Promise<Either<UnregisteredAccountError | InvalidAccountError | DataProviderError | UnexpectedError | InvalidNameError | InvalidEmailError | InvalidPasswordError | InvalidBalanceError | InvalidCreditCardError | InvalidInstitutionError | UnregisteredInstitutionError | InvalidTypeError, AccountData>> {
        console.time('syn-credit-card')
        const foundAccountData = await this.accountRepo.findById(accountId)

        if(!foundAccountData) {
            return left(new UnregisteredAccountError())
        }

        if(!foundAccountData.providerAccountId || !foundAccountData.synchronization?.providerItemId) {
            return left(new InvalidAccountError())
        }

        // TODO create getAccountByProviderAccountId?
        const dataProviderAccountsOrError = await this.financialDataProvider.getAccountsByItemId(foundAccountData.synchronization.providerItemId)

        if(dataProviderAccountsOrError.isLeft()) {
            return left(dataProviderAccountsOrError.value)
        }

        const accounts = dataProviderAccountsOrError.value as AccountData[]

        const accountDataToSync = accounts.find(account => account.providerAccountId === foundAccountData.providerAccountId)

        if(!accountDataToSync) {
            return left(new UnexpectedError('data provider item does not have the requested account'))
        }
        // TODO verificar status de sincronização da account, em caso de insucesso interromper o fluxo de atualização e importação das transações

        await this.accountRepo.updateBalance(accountId, accountDataToSync.balance)
        await this.accountRepo.updateCreditCardInfo(accountId, accountDataToSync.creditCardInfo)


        const userData = await this.userRepo.findUserById(foundAccountData.userId)

        const accountOrError = await this.createCreditCardAccount(foundAccountData, userData)
        if(accountOrError.isLeft()) {
            return left(accountOrError.value)
        }

        const creditCardAccount = accountOrError.value as AutomaticCreditCardAccount

        // merge transactions
        const transactionRequestsOrError = await this.financialDataProvider.getTransactionsByProviderAccountId(accountId, accountDataToSync.type as AccountType, {
            providerAccountId: accountDataToSync.providerAccountId,
            from: undefined
        })
        if(transactionRequestsOrError.isLeft()) {
            return left(transactionRequestsOrError.value)
        }

        const transactionRequests = transactionRequestsOrError.value

        const transactionsData: TransactionData[] = []
        for(let i = 0; i < transactionRequests.length; i++) {
            const transaction = transactionRequests[i]
            const { invoiceDueDate, invoiceClosingDate } = creditCardAccount.calculateInvoiceDatesFromTransaction(transaction.date)
            const invoiceId = await this.getInvoiceId(invoiceDueDate, invoiceClosingDate, foundAccountData)

            transactionsData.push({
                id: transaction.id,
                accountId: transaction.accountId,
                accountType: foundAccountData.type,
                syncType: foundAccountData.syncType,
                userId: foundAccountData.userId,
                // category: CategoryData,
                amount: transaction.amount,
                // description: string,
                descriptionOriginal: transaction.descriptionOriginal,
                date: invoiceDueDate,
                invoiceDate: transaction.date,
                invoiceId: invoiceId,
                type: transaction.amount >= 0 ? 'INCOME' : 'EXPENSE',
                // comment?: string,
                // ignored?: boolean,
                // _isDeleted?: boolean,
                providerId: transaction.providerId,
            })
        }
        

        await this.transactionRepo.mergeTransactions(transactionsData)

        // recalculate invoices amounts
        const invoicesAmount = await this.transactionRepo.recalculateInvoicesAmount(Object.values(Object.fromEntries(this.invoicesIdLookupTable)))
        await this.invoiceRepo.batchUpdateAmount(invoicesAmount)

        const synchronization = {
            syncStatus: accountDataToSync.synchronization.syncStatus,
            lastSyncAt: accountDataToSync.synchronization.lastSyncAt,
        }
        await this.accountRepo.updateSynchronizationStatus(accountId, synchronization)

        const updatedAccount = await this.accountRepo.findById(accountId)
        console.timeEnd('syn-credit-card')
        return right(updatedAccount)
    }

}