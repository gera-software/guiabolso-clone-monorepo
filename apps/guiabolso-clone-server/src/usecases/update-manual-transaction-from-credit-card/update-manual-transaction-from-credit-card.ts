import { BankAccount, BankTransaction, Category, CreditCardAccount, CreditCardInvoice, CreditCardTransaction, User } from "@/entities";
import { InvalidTransactionError, InvalidAmountError, InvalidBalanceError, InvalidEmailError, InvalidNameError, InvalidPasswordError, InvalidCreditCardError, InvalidCreditCardInvoiceError } from "@/entities/errors";
import { Either, left, right } from "@/shared";
import { AccountData, CreditCardInvoiceRepository, TransactionData, TransactionRepository, UpdateAccountRepository, UseCase, UserData } from "@/usecases/ports";
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

    private async createCreditCardAccount(accountData: AccountData, userData: UserData): Promise<Either<InvalidNameError | InvalidEmailError | InvalidPasswordError | InvalidBalanceError | InvalidCreditCardError, CreditCardAccount>> {
        const userOrError = User.create(userData)
        if(userOrError.isLeft()) {
            return left(userOrError.value)
        }

        const user = userOrError.value as User

        const accountOrError = CreditCardAccount.create({ 
            name: accountData.name, 
            balance: accountData.balance, 
            imageUrl: accountData.imageUrl, 
            user,
            creditCardInfo: accountData.creditCardInfo
        })
        if(accountOrError.isLeft()) {
            return left(accountOrError.value)
        }

        return right(accountOrError.value as CreditCardAccount)
    }

    private async createOldCreditCardInvoice(creditCardAccount: CreditCardAccount, oldTransactionData: TransactionData): Promise<Either<InvalidCreditCardInvoiceError, CreditCardInvoice>>{
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

    private async createNewCreditCardInvoice(creditCardAccount: CreditCardAccount, newTransaction: TransactionToAddData): Promise<Either<InvalidCreditCardInvoiceError, CreditCardInvoice>> {
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

    async perform(request: TransactionToUpdateData): Promise<any> {
        const { oldTransactionData } = request

        const accountOrError = await this.createCreditCardAccount(request.newTransaction.account, request.newTransaction.user)
        if(accountOrError.isLeft()) {
            return left(accountOrError.value)
        }

        const creditCardAccount = accountOrError.value as CreditCardAccount

        const oldInvoiceOrError = await this.createOldCreditCardInvoice(creditCardAccount, oldTransactionData)
        if(oldInvoiceOrError.isLeft()) {
            return left(oldInvoiceOrError.value)
        }
        const oldInvoice = oldInvoiceOrError.value as CreditCardInvoice


        const newInvoiceOrError = await this.createNewCreditCardInvoice(creditCardAccount, request.newTransaction)
        if(newInvoiceOrError.isLeft()) {
            return left(newInvoiceOrError.value)
        }

        const newInvoice = newInvoiceOrError.value as CreditCardInvoice

        // TODO create old transaction
        // TODO create new transaction
        const newTransactionOrError = await this.createNewTransaction(request.newTransaction, newInvoice.dueDate)
        const oldTransactionOrError = await this.createOldTransaction(oldTransactionData)

        return left(new InvalidTransactionError())
    }

}