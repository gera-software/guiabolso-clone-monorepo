import { Either, left, right } from "@/shared";
import { AccountData, CreditCardInvoiceRepository, FinancialDataProvider, InstitutionRepository, TransactionData, TransactionRepository, UpdateAccountRepository, UseCase, UserData, UserRepository } from "@/usecases/ports";
import { UnexpectedError, UnregisteredAccountError, UnregisteredInstitutionError } from "@/usecases/errors";
import { InvalidAccountError, InvalidBalanceError, InvalidCreditCardError, InvalidEmailError, InvalidInstitutionError, InvalidNameError, InvalidPasswordError, InvalidTypeError } from "@/entities/errors";
import { AccountType, AutomaticCreditCardAccount, Institution, ManualCreditCardAccount, NubankCreditCardInvoiceStrategy, User } from "@/entities";

export class SyncAutomaticCreditCardAccount implements UseCase {
    private readonly financialDataProvider: FinancialDataProvider
    private readonly accountRepo: UpdateAccountRepository
    private readonly userRepo: UserRepository
    private readonly institutionRepo: InstitutionRepository
    private readonly transactionRepo: TransactionRepository
    private readonly invoiceRepo: CreditCardInvoiceRepository
    
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
            },
            new NubankCreditCardInvoiceStrategy()
        )
        if(accountOrError.isLeft()) {
            return left(accountOrError.value)
        }

        return right(accountOrError.value as AutomaticCreditCardAccount)
    }

    private async findOrCreateInvoice(invoiceDueDate: Date, invoiceClosingDate: Date, accountData: AccountData) {
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

        return invoiceData
    }
    
    async perform(accountId: string): Promise<any> {
        const foundAccountData = await this.accountRepo.findById(accountId)

        if(!foundAccountData) {
            return left(new UnregisteredAccountError())
        }

        if(!foundAccountData.providerAccountId || !foundAccountData.synchronization?.providerItemId) {
            return left(new InvalidAccountError())
        }

        const dataProviderAccountsOrError = await this.financialDataProvider.getAccountsByItemId(foundAccountData.synchronization.providerItemId)

        if(dataProviderAccountsOrError.isLeft()) {
            return left(dataProviderAccountsOrError.value)
        }

        const accounts = dataProviderAccountsOrError.value as AccountData[]

        const accountDataToSync = accounts.find(account => account.providerAccountId === foundAccountData.providerAccountId)

        if(!accountDataToSync) {
            return left(new UnexpectedError('data provider item does not have the requested account'))
        }

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
            const { id: invoiceId } = await this.findOrCreateInvoice(invoiceDueDate, invoiceClosingDate, foundAccountData)

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

        await this.accountRepo.updateSynchronizationStatus(accountId, { lastSyncAt: new Date() })

        const updatedAccount = await this.accountRepo.findById(accountId)
        return right(updatedAccount)
    }

}