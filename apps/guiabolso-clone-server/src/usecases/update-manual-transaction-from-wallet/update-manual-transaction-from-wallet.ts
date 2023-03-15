import { Either, left, right } from "@/shared"
import { CategoryData, CategoryRepository, TransactionData, TransactionRepository, TransactionRequest, UpdateAccountRepository, UseCase, UserRepository } from "@/usecases/ports"
import { Category, Transaction, User, WalletAccount } from "@/entities"
import { UnregisteredAccountError, UnregisteredCategoryError, UnregisteredTransactionError, UnregisteredUserError } from "../errors"
import { InvalidAmountError, InvalidBalanceError, InvalidEmailError, InvalidNameError, InvalidPasswordError, InvalidTransactionError } from "@/entities/errors"

export class UpdateManualTransactionFromWallet implements UseCase {
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

    private async createTransaction(transaction: TransactionRequest | TransactionData): Promise<Either<UnregisteredCategoryError | InvalidTransactionError | InvalidAmountError, Transaction>> {
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

        const transactionOrError = Transaction.create({
            amount: transaction.amount,
            description: transaction.description,
            descriptionOriginal: transaction.descriptionOriginal,
            date: transaction.date,
            category,
            comment: transaction.comment,
            ignored: transaction.ignored,
        })

        if(transactionOrError.isLeft()) {
            return left(transactionOrError.value)
        }

        return right(transactionOrError.value as Transaction) 
    }

    private async createWalletAccount(accountId: string): Promise<Either<UnregisteredAccountError | UnregisteredUserError | InvalidNameError | InvalidEmailError | InvalidPasswordError | InvalidBalanceError, WalletAccount>> {
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

        const accountOrError = WalletAccount.create({ 
            name: foundAccountData.name, 
            balance: foundAccountData.balance, 
            imageUrl: foundAccountData.imageUrl, 
            user 
        })
        if(accountOrError.isLeft()) {
            return left(accountOrError.value)
        }

        return right(accountOrError.value as WalletAccount)
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

        const oldTransaction = oldTransactionOrError.value as Transaction
        const newTransaction = newTransactionOrError.value as Transaction

        const accountOrError = await this.createWalletAccount(request.accountId)
        if(accountOrError.isLeft()) {
            return left(accountOrError.value)
        }

        const walletAccount = accountOrError.value as WalletAccount

        walletAccount.removeTransaction(oldTransaction)
        walletAccount.addTransaction(newTransaction)

        const category = await this.categoryRepo.findById(request.categoryId)

        const transactionData: TransactionData = {
            id: oldTransactionData.id,
            accountId: oldTransactionData.accountId,
            accountType: oldTransactionData.accountType,
            syncType: oldTransactionData.syncType,
            userId: oldTransactionData.userId,
            amount: newTransaction.amount.value,
            description: newTransaction.description,
            descriptionOriginal: newTransaction.descriptionOriginal,
            date: newTransaction.date,
            type: newTransaction.type,
            comment: newTransaction.comment,
            ignored: newTransaction.ignored,
            category,
        }

        const result = await this.transactionRepo.update(transactionData)

        await this.accountRepo.updateBalance(request.accountId, walletAccount.balance.value)

        return(right(result))

    }

}