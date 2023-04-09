import { Category, ManualCreditCardAccount, CreditCardInvoice, CreditCardTransaction, User } from "@/entities";
import { InvalidTransactionError, InvalidAmountError, InvalidBalanceError, InvalidEmailError, InvalidNameError, InvalidPasswordError, InvalidCreditCardError, InvalidCreditCardInvoiceError } from "@/entities/errors";
import { Either, left, right } from "@/shared";
import { AccountData, CreditCardInvoiceData, CreditCardInvoiceRepository, TransactionData, TransactionRepository, UpdateAccountRepository, UseCase, UserData } from "@/usecases/ports";
import { TransactionToUpdateData } from "@/usecases/update-manual-transaction/ports";
import { TransactionToAddData } from "@/usecases/add-manual-transaction/ports";

export class UpdateManualTransactionFromCreditCard implements UseCase {
    private readonly transactionRepo: TransactionRepository
    private readonly accountRepo: UpdateAccountRepository
    private readonly creditCardInvoiceRepo: CreditCardInvoiceRepository

    constructor(transactionRepository: TransactionRepository, accountRepository: UpdateAccountRepository, invoiceRepository: CreditCardInvoiceRepository) {
        this.transactionRepo = transactionRepository
        this.accountRepo = accountRepository
        this.creditCardInvoiceRepo = invoiceRepository
    }

    private async createOldTransaction(transaction: TransactionData): Promise<Either<InvalidTransactionError | InvalidAmountError, CreditCardTransaction>> {
        let category: Category = null
        
        if(transaction.category) {
            category = Category.create(transaction.category).value as Category
        }

        const transactionOrError = CreditCardTransaction.create({
            amount: transaction.amount,
            description: transaction.description,
            transactionDate: transaction.date,
            invoiceDate: transaction.invoiceDate,
            category,
            comment: transaction.comment,
            ignored: transaction.ignored,
        })

        if(transactionOrError.isLeft()) {
            return left(transactionOrError.value)
        }

        return right(transactionOrError.value as CreditCardTransaction) 
    }

    private async createNewTransaction(transaction: TransactionToAddData, invoiceDueDate: Date): Promise<Either<InvalidTransactionError | InvalidAmountError, CreditCardTransaction>> {
        let category: Category = null

        if(transaction.category) {
            category = Category.create(transaction.category).value as Category
        }

        const transactionOrError = CreditCardTransaction.create({
            amount: transaction.amount,
            description: transaction.description,
            transactionDate: invoiceDueDate, // Na tela de transações, elas aparecem no dia de vencimento da fatura. Porque muitos economistas determinam que uma despesa somente é uma despesa no momento em que ela é paga.
            invoiceDate: transaction.date, // Na tela de detalhes da fatura, a transação aparece na data original
            category,
            comment: transaction.comment,
            ignored: transaction.ignored,
        })

        if(transactionOrError.isLeft()) {
            return left(transactionOrError.value)
        }

        return right(transactionOrError.value as CreditCardTransaction) 
    }

    private async createCreditCardAccount(accountData: AccountData, userData: UserData): Promise<Either<InvalidNameError | InvalidEmailError | InvalidPasswordError | InvalidBalanceError | InvalidCreditCardError, ManualCreditCardAccount>> {
        const userOrError = User.create(userData)
        if(userOrError.isLeft()) {
            return left(userOrError.value)
        }

        const user = userOrError.value as User

        const accountOrError = ManualCreditCardAccount.create({ 
            name: accountData.name, 
            balance: accountData.balance, 
            imageUrl: accountData.imageUrl, 
            user,
            creditCardInfo: accountData.creditCardInfo
        })
        if(accountOrError.isLeft()) {
            return left(accountOrError.value)
        }

        return right(accountOrError.value as ManualCreditCardAccount)
    }

    private async createOldCreditCardInvoice(creditCardAccount: ManualCreditCardAccount, oldTransactionData: TransactionData): Promise<Either<InvalidCreditCardInvoiceError, CreditCardInvoice>>{
        const oldInvoiceData = await this.creditCardInvoiceRepo.findById(oldTransactionData.invoiceId) 
        const invoiceOrError = CreditCardInvoice.create({
            closeDate: oldInvoiceData.closeDate,
            dueDate: oldInvoiceData.dueDate,
            amount: oldInvoiceData.amount,
            account: creditCardAccount
        })
        if(invoiceOrError.isLeft()) {
            return left(invoiceOrError.value)
        }

        const invoice = invoiceOrError.value as CreditCardInvoice

        return right(invoice)
    }

    private async findOrCreateInvoice(creditCardAccount: ManualCreditCardAccount, newTransaction: TransactionToAddData): Promise<CreditCardInvoiceData> {
        const { invoiceClosingDate, invoiceDueDate } = creditCardAccount.calculateInvoiceDatesFromTransaction(newTransaction.date)

        // Find or create new invoice
        let newInvoiceData = await this.creditCardInvoiceRepo.findByDueDate(invoiceDueDate, newTransaction.account.id)
        if(!newInvoiceData) {
            newInvoiceData = await this.creditCardInvoiceRepo.add({
                dueDate: invoiceDueDate,
                closeDate: invoiceClosingDate,
                amount: 0,
                userId: newTransaction.user.id,
                accountId: newTransaction.account.id,
                _isDeleted: false
            })
        }

        return newInvoiceData
    }

    private createNewCreditCardInvoice(creditCardAccount: ManualCreditCardAccount, newInvoiceData: CreditCardInvoiceData): Either<InvalidCreditCardInvoiceError, CreditCardInvoice> {
        const invoiceOrError = CreditCardInvoice.create({
            closeDate: newInvoiceData.closeDate,
            dueDate: newInvoiceData.dueDate,
            amount: newInvoiceData.amount,
            account: creditCardAccount
        })
        if(invoiceOrError.isLeft()) {
            return left(invoiceOrError.value)
        }

        const invoice = invoiceOrError.value as CreditCardInvoice

        return right(invoice)
    }

    async perform(request: TransactionToUpdateData): Promise<Either<InvalidNameError | InvalidEmailError | InvalidPasswordError | InvalidBalanceError | InvalidCreditCardError | InvalidCreditCardInvoiceError | InvalidTransactionError | InvalidAmountError, TransactionData>> {
        const { oldTransactionData } = request

        const accountOrError = await this.createCreditCardAccount(request.newTransaction.account, request.newTransaction.user)
        if(accountOrError.isLeft()) {
            return left(accountOrError.value)
        }

        const creditCardAccount = accountOrError.value as ManualCreditCardAccount

        const oldInvoiceOrError = await this.createOldCreditCardInvoice(creditCardAccount, oldTransactionData)
        if(oldInvoiceOrError.isLeft()) {
            return left(oldInvoiceOrError.value)
        }
        const oldInvoice = oldInvoiceOrError.value as CreditCardInvoice

        const newInvoiceData = await this.findOrCreateInvoice(creditCardAccount, request.newTransaction)

        const newInvoiceOrError = this.createNewCreditCardInvoice(creditCardAccount, newInvoiceData)
        if(newInvoiceOrError.isLeft()) {
            return left(newInvoiceOrError.value)
        }

        const newInvoice = newInvoiceOrError.value as CreditCardInvoice

        const newTransactionOrError = await this.createNewTransaction(request.newTransaction, newInvoice.dueDate)
        const oldTransactionOrError = await this.createOldTransaction(oldTransactionData)

        if(oldTransactionOrError.isLeft()) {
            return left(oldTransactionOrError.value)
        }

        if(newTransactionOrError.isLeft()) {
            return left(newTransactionOrError.value)
        }

        const oldTransaction = oldTransactionOrError.value as CreditCardTransaction
        const newTransaction = newTransactionOrError.value as CreditCardTransaction

        const transactionData: TransactionData = {
            id: oldTransactionData.id,
            accountId: oldTransactionData.accountId,
            accountType: oldTransactionData.accountType,
            syncType: oldTransactionData.syncType,
            userId: oldTransactionData.userId,
            amount: newTransaction.amount.value,
            description: newTransaction.description,
            date: newTransaction.date,
            invoiceDate: newTransaction.invoiceDate,
            invoiceId: newInvoiceData.id,
            type: newTransaction.type,
            comment: newTransaction.comment,
            ignored: newTransaction.ignored,
            category: request.newTransaction.category ?? null,
        }

        oldInvoice.removeTransaction(oldTransaction)
        await this.creditCardInvoiceRepo.updateAmount(oldTransactionData.invoiceId, oldInvoice.amount.value)
        
        newInvoice.addTransaction(newTransaction)
        await this.creditCardInvoiceRepo.updateAmount(newInvoiceData.id, newInvoice.amount.value)

        creditCardAccount.removeTransaction(oldTransaction)
        creditCardAccount.addTransaction(newTransaction)
        await this.accountRepo.updateAvaliableCreditCardLimit(request.newTransaction.account.id, creditCardAccount.creditCardInfo.availableCreditLimit.value)

        const lastClosedInvoice = await this.creditCardInvoiceRepo.getLastClosedInvoice(request.newTransaction.account.id)
        const lastClosedBalance = lastClosedInvoice?.amount ?? 0
        await this.accountRepo.updateBalance(request.newTransaction.account.id, lastClosedBalance)

        const result = await this.transactionRepo.update(transactionData)
        return(right(result))
    }

}