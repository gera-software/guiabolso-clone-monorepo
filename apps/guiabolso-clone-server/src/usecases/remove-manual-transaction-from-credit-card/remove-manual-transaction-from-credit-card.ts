import { CreditCardAccount, CreditCardInvoice, CreditCardTransaction, User } from "@/entities";
import { left, right } from "@/shared";
import { CreditCardInvoiceRepository, TransactionRepository, UpdateAccountRepository, UseCase, UserRepository } from "@/usecases/ports";

export class RemoveManualTransactionFromCreditCard implements UseCase {
    private readonly accountRepo: UpdateAccountRepository
    private readonly transactionRepo: TransactionRepository
    private readonly userRepo: UserRepository
    private readonly creditCardInvoiceRepo: CreditCardInvoiceRepository

    constructor(transactionRepository: TransactionRepository, accountRepository: UpdateAccountRepository, userRepository: UserRepository, invoiceRepository: CreditCardInvoiceRepository) {
        this.transactionRepo = transactionRepository
        this.accountRepo = accountRepository
        this.userRepo = userRepository
        this.creditCardInvoiceRepo = invoiceRepository
    }

    async perform(id: string): Promise<any> {
        const removedTransaction = await this.transactionRepo.remove(id)

        const foundAccountData = await this.accountRepo.findById(removedTransaction.accountId)
        const foundUserData = await this.userRepo.findUserById(foundAccountData.userId)

        const userOrError = User.create(foundUserData)

        const user = userOrError.value as User

        const accountOrError = CreditCardAccount.create({
            name: foundAccountData.name,
            balance: foundAccountData.balance,
            imageUrl: foundAccountData.imageUrl,
            user,
            creditCardInfo: foundAccountData.creditCardInfo,
        })

        const creditCardAccount = accountOrError.value as CreditCardAccount

        // const { invoiceClosingDate, invoiceDueDate } = creditCardAccount.calculateInvoiceDatesFromTransaction(removedTransaction.invoiceDate)
        console.log('INVOICE ID', removedTransaction.invoiceId)
        let invoiceData = await this.creditCardInvoiceRepo.findById(removedTransaction.invoiceId)
        console.log(invoiceData)
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
            amount: removedTransaction.amount,
            description: removedTransaction.description,
            transactionDate: removedTransaction.date,
            invoiceDate: removedTransaction.invoiceDate,
            category: null,
            comment: removedTransaction.comment,
            ignored: removedTransaction.ignored,
        })

        const transaction = transactionOrError.value as CreditCardTransaction

        const invoice = invoiceOrError.value as CreditCardInvoice

        invoice.removeTransaction(transaction)
        creditCardAccount.removeTransaction(transaction)

        await this.creditCardInvoiceRepo.updateAmount(invoiceData.id, invoice.amount.value)
        await this.accountRepo.updateAvaliableCreditCardLimit(foundAccountData.id, creditCardAccount.creditCardInfo.availableCreditLimit.value)

        const lastClosedInvoice = await this.creditCardInvoiceRepo.getLastClosedInvoice(foundAccountData.id)
        const lastClosedBalance = lastClosedInvoice?.amount ?? 0
        await this.accountRepo.updateBalance(foundAccountData.id, lastClosedBalance)

        return right(removedTransaction)
    }

}