import { Category, CreditCardAccount, CreditCardInvoice, CreditCardTransaction, User } from "@/entities"
import { left, right } from "@/shared"
import { TransactionToAddData } from "@/usecases/add-manual-transaction/ports"
import { UseCase, UpdateAccountRepository, TransactionRepository, TransactionData, CreditCardInvoiceRepository } from "@/usecases/ports"

export class AddManualTransactionToCreditCard implements UseCase {
    private readonly accountRepo: UpdateAccountRepository
    private readonly transactionRepo: TransactionRepository
    private readonly creditCardInvoiceRepo: CreditCardInvoiceRepository

    constructor(accountRepository: UpdateAccountRepository, transactionRepository: TransactionRepository, creditCardInvoiceRepository: CreditCardInvoiceRepository) {
        this.accountRepo = accountRepository
        this.transactionRepo = transactionRepository
        this.creditCardInvoiceRepo = creditCardInvoiceRepository
    }

    async perform(request: TransactionToAddData) {
        const userData = request.user
        const accountData = request.account
        const categoryData = request.category

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
            creditCardInfo: accountData.creditCardInfo,
        })
        if(accountOrError.isLeft()) {
            return left(accountOrError.value)
        }

        const creditCardAccount = accountOrError.value as CreditCardAccount

        let category: Category = null
        if(categoryData) {
            category = Category.create(categoryData).value as Category
        }

        const { invoiceClosingDate, invoiceDueDate } = creditCardAccount.calculateInvoiceDatesFromTransaction(request.date)

        // Find or create invoice
        let invoiceData = await this.creditCardInvoiceRepo.findByDueDate(invoiceDueDate)
        if(!invoiceData) {
            invoiceData = await this.creditCardInvoiceRepo.add({
                dueDate: invoiceDueDate,
                closeDate: invoiceClosingDate,
                amount: 0,
                userId: userData.id,
                accountId: accountData.id,
                _isDeleted: false
            })
        }
        const invoiceOrError = CreditCardInvoice.create({
            closeDate: invoiceData.closeDate,
            dueDate: invoiceData.dueDate,
            amount: invoiceData.amount,
            account: creditCardAccount
        })
        if(invoiceOrError.isLeft()) {
            return left(invoiceOrError.value)
        }
        
        const transactionOrError = CreditCardTransaction.create({
            amount: request.amount,
            description: request.description,
            transactionDate: invoiceDueDate, // Na tela de transações, elas aparecem no dia de vencimento da fatura. Muitos economistas determinam que uma despesa somente é uma despesa no momento em que ela é paga.
            invoiceDate: request.date, // Na tela de detalhes da fatura, a transação aparece na data original
            category: category,
            comment: request.comment,
            ignored: request.ignored,
        })

        if(transactionOrError.isLeft()) {
            return left(transactionOrError.value)
        }

        const invoice = invoiceOrError.value as CreditCardInvoice

        const transaction = transactionOrError.value as CreditCardTransaction

        invoice.addTransaction(transaction)
        
        // CreditCardTransaction.addTransaction(transaction)

        const transactionData: TransactionData = {
            accountId: accountData.id,
            accountType: creditCardAccount.type,
            syncType: creditCardAccount.syncType,
            userId: accountData.userId,
            amount: transaction.amount.value,
            description: transaction.description,
            date: transaction.date,
            invoiceDate: transaction.invoiceDate,
            type: transaction.type,
            comment: transaction.comment,
            ignored: transaction.ignored,
            category: categoryData ?? null,
            _isDeleted: false,
        }

        const addedTransaction = await this.transactionRepo.add(transactionData)

        await this.creditCardInvoiceRepo.updateAmount(invoiceData.id, invoice.amount.value)
        // await this.accountRepo.updateBalance(accountData.id, bankAccount.balance.value)
        
        return right(addedTransaction)

    }

}