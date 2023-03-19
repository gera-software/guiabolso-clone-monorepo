import { Category, BankTransaction, User, BankAccount } from "@/entities"
import { Either, left, right } from "@/shared"
import { TransactionRepository, UseCase, TransactionData, UpdateAccountRepository } from "@/usecases/ports"
import { InvalidAmountError, InvalidBalanceError, InvalidEmailError, InvalidNameError, InvalidPasswordError, InvalidTransactionError } from "@/entities/errors"
import { TransactionToAddData } from "@/usecases/add-manual-transaction/ports"

export class AddManualTransactionToBank implements UseCase {
    private readonly accountRepo: UpdateAccountRepository
    private readonly transactionRepo: TransactionRepository

    constructor(accountRepository: UpdateAccountRepository, transactionRepository: TransactionRepository) {
        this.accountRepo = accountRepository
        this.transactionRepo = transactionRepository
    }

    async perform(request: TransactionToAddData): Promise<Either<InvalidNameError | InvalidEmailError | InvalidPasswordError | InvalidBalanceError | InvalidTransactionError | InvalidAmountError, TransactionData>> {
        const { userData, accountData, categoryData } = request

        const userOrError = User.create(userData)
        if(userOrError.isLeft()) {
            return left(userOrError.value)
        }

        const user = userOrError.value as User

        const accountOrError = BankAccount.create({ 
            name: accountData.name, 
            balance: accountData.balance, 
            imageUrl: accountData.imageUrl, 
            user 
        })
        if(accountOrError.isLeft()) {
            return left(accountOrError.value)
        }

        const bankAccount = accountOrError.value as BankAccount

        let category: Category = null
        if(categoryData) {
            category = Category.create(categoryData).value as Category
        }

        const transactionOrError = BankTransaction.create({
            amount: request.amount,
            description: request.description,
            date: request.date,
            category,
            comment: request.comment,
            ignored: request.ignored,
        })

        if(transactionOrError.isLeft()) {
            return left(transactionOrError.value)
        }

        const transaction = transactionOrError.value as BankTransaction

        bankAccount.addTransaction(transaction)

        const transactionData: TransactionData = {
            accountId: accountData.id,
            accountType: bankAccount.type,
            syncType: bankAccount.syncType,
            userId: accountData.userId,
            amount: transaction.amount.value,
            description: transaction.description,
            date: transaction.date,
            type: transaction.type,
            comment: transaction.comment,
            ignored: transaction.ignored,
            category: categoryData ?? null,
            _isDeleted: false,
        }

        const addedTransaction = await this.transactionRepo.add(transactionData)

        await this.accountRepo.updateBalance(accountData.id, bankAccount.balance.value)
        
        return right(addedTransaction)
    }

}