import { Either, left, right } from "@/shared"
import { CategoryData, CategoryRepository, TransactionData, TransactionRepository, TransactionRequest, UpdateAccountRepository, UseCase, UserRepository } from "@/usecases/ports"
import { Category, User, BankTransaction, BankAccount } from "@/entities"
import { UnregisteredAccountError, UnregisteredCategoryError, UnregisteredTransactionError, UnregisteredUserError } from "@/usecases/errors"
import { InvalidAmountError, InvalidBalanceError, InvalidEmailError, InvalidNameError, InvalidPasswordError, InvalidTransactionError } from "@/entities/errors"

export class UpdateManualTransactionFromBank implements UseCase {
    private readonly transactionRepo: TransactionRepository
    private readonly categoryRepo: CategoryRepository
    private readonly accountRepo: UpdateAccountRepository
    private readonly userRepo: UserRepository

    constructor(transactionRepository: TransactionRepository, categoryRepository: CategoryRepository, accountRepository: UpdateAccountRepository, userRepository: UserRepository) {
        this.transactionRepo = transactionRepository
        this.categoryRepo = categoryRepository
        this.accountRepo = accountRepository
        this.userRepo = userRepository
    }

    private async createTransaction(transaction: TransactionRequest | TransactionData): Promise<Either<UnregisteredCategoryError | InvalidTransactionError | InvalidAmountError, BankTransaction>> {
        let foundCategory: CategoryData = null
        let category: Category = null
        
        const categoryId = (transaction as TransactionRequest).categoryId || (transaction as TransactionData).category?.id
        if(categoryId) {
            foundCategory = await this.categoryRepo.findById(categoryId)
            if(!foundCategory) {
                return left(new UnregisteredCategoryError())
            }
            category = Category.create(foundCategory).value as Category
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

    private async createBankAccount(accountId: string): Promise<Either<UnregisteredAccountError | UnregisteredUserError | InvalidNameError | InvalidEmailError | InvalidPasswordError | InvalidBalanceError, BankAccount>> {
        const foundAccountData = await this.accountRepo.findById(accountId)
        if(!foundAccountData) {
            return left(new UnregisteredAccountError())
        }

        const foundUserData = await this.userRepo.findUserById(foundAccountData.userId)
        if(!foundUserData) {
            return left(new UnregisteredUserError())
        }

        const userOrError = User.create(foundUserData)
        if(userOrError.isLeft()) {
            return left(userOrError.value)
        }

        const user = userOrError.value as User

        const accountOrError = BankAccount.create({ 
            name: foundAccountData.name, 
            balance: foundAccountData.balance, 
            imageUrl: foundAccountData.imageUrl, 
            user 
        })
        if(accountOrError.isLeft()) {
            return left(accountOrError.value)
        }

        return right(accountOrError.value as BankAccount)
    }

    async perform(request: TransactionRequest): Promise<Either<UnregisteredCategoryError | InvalidTransactionError | InvalidAmountError | UnregisteredTransactionError | UnregisteredAccountError | UnregisteredUserError | InvalidNameError | InvalidEmailError | InvalidPasswordError | InvalidBalanceError, TransactionData>> {
        const oldTransactionData = await this.transactionRepo.findById(request.id)

        if(!oldTransactionData) {
            return left(new UnregisteredTransactionError())
        }

        const oldTransactionOrError = await this.createTransaction(oldTransactionData)
        const newTransactionOrError = await this.createTransaction(request)

        if(oldTransactionOrError.isLeft()) {
            return left(oldTransactionOrError.value)
        }

        if(newTransactionOrError.isLeft()) {
            return left(newTransactionOrError.value)
        }

        const oldTransaction = oldTransactionOrError.value as BankTransaction
        const newTransaction = newTransactionOrError.value as BankTransaction

        const accountOrError = await this.createBankAccount(request.accountId)
        if(accountOrError.isLeft()) {
            return left(accountOrError.value)
        }

        const bankAccount = accountOrError.value as BankAccount

        bankAccount.removeTransaction(oldTransaction)
        bankAccount.addTransaction(newTransaction)

        const category = await this.categoryRepo.findById(request.categoryId)

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
            category,
        }

        const result = await this.transactionRepo.update(transactionData)

        await this.accountRepo.updateBalance(request.accountId, bankAccount.balance.value)

        return(right(result))

    }

}