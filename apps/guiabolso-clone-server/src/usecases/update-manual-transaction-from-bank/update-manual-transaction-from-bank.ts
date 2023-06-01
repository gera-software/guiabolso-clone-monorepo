import { Either, left, right } from "@/shared"
import { AccountData, TransactionData, TransactionRepository, UpdateAccountRepository, UseCase, UserData } from "@/usecases/ports"
import { Category, User, BankTransaction, ManualBankAccount } from "@/entities"
import { InvalidAmountError, InvalidBalanceError, InvalidEmailError, InvalidNameError, InvalidPasswordError, InvalidTransactionError } from "@/entities/errors"
import { TransactionToUpdateData } from "@/usecases/update-manual-transaction/ports"
import { TransactionToAddData } from "@/usecases/add-manual-transaction/ports"

export class UpdateManualTransactionFromBank implements UseCase {
    private readonly transactionRepo: TransactionRepository
    private readonly accountRepo: UpdateAccountRepository

    constructor(transactionRepository: TransactionRepository, accountRepository: UpdateAccountRepository) {
        this.transactionRepo = transactionRepository
        this.accountRepo = accountRepository
    }

    private async createTransaction(transaction: TransactionToAddData | TransactionData): Promise<Either<InvalidTransactionError | InvalidAmountError, BankTransaction>> {
        let category: Category = null
        
        if(transaction.category) {
            category = Category.create(transaction.category).value as Category
        }

        const transactionOrError = BankTransaction.create({
            amount: transaction.amount,
            description: transaction.description,
            date: transaction.date,
            category,
            comment: transaction.comment,
            ignored: transaction.ignored,
        })

        if(transactionOrError.isLeft()) {
            return left(transactionOrError.value)
        }

        return right(transactionOrError.value as BankTransaction) 
    }

    private async createBankAccount(accountData: AccountData, userData: UserData): Promise<Either<InvalidNameError | InvalidEmailError | InvalidPasswordError | InvalidBalanceError, ManualBankAccount>> {
        const userOrError = User.create(userData)
        if(userOrError.isLeft()) {
            return left(userOrError.value)
        }

        const user = userOrError.value as User

        const accountOrError = ManualBankAccount.create({ 
            name: accountData.name, 
            balance: accountData.balance, 
            imageUrl: accountData.imageUrl, 
            user 
        })
        if(accountOrError.isLeft()) {
            return left(accountOrError.value)
        }

        return right(accountOrError.value as ManualBankAccount)
    }

    async perform(request: TransactionToUpdateData): Promise<Either<InvalidTransactionError | InvalidAmountError | InvalidNameError | InvalidEmailError | InvalidPasswordError | InvalidBalanceError, TransactionData>> {
        const { oldTransactionData } = request

        const oldTransactionOrError = await this.createTransaction(oldTransactionData)
        const newTransactionOrError = await this.createTransaction(request.newTransaction)

        if(oldTransactionOrError.isLeft()) {
            return left(oldTransactionOrError.value)
        }

        if(newTransactionOrError.isLeft()) {
            return left(newTransactionOrError.value)
        }

        const oldTransaction = oldTransactionOrError.value as BankTransaction
        const newTransaction = newTransactionOrError.value as BankTransaction

        const accountOrError = await this.createBankAccount(request.newTransaction.account, request.newTransaction.user)
        if(accountOrError.isLeft()) {
            return left(accountOrError.value)
        }

        const bankAccount = accountOrError.value as ManualBankAccount

        bankAccount.removeTransaction(oldTransaction)
        bankAccount.addTransaction(newTransaction)

        const transactionData: TransactionData = {
            id: oldTransactionData.id,
            accountId: oldTransactionData.accountId,
            accountType: oldTransactionData.accountType,
            syncType: oldTransactionData.syncType,
            userId: oldTransactionData.userId,
            amount: newTransaction.amount.value,
            description: newTransaction.description,
            date: newTransaction.date,
            type: newTransaction.type,
            comment: newTransaction.comment,
            ignored: newTransaction.ignored,
            category: request.newTransaction.category ?? null,
        }

        const result = await this.transactionRepo.updateManual(transactionData)

        await this.accountRepo.updateBalance(request.oldTransactionData.accountId, bankAccount.balance.value)

        return(right(result))

    }

}