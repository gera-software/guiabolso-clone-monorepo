import { Category, Transaction, User, WalletAccount } from "@/entities"
import { left, right } from "@/shared"
import { TransactionRequest, TransactionRepository, UseCase, UserRepository, TransactionData, UpdateAccountRepository, CategoryRepository, CategoryData } from "@/usecases/ports"
import { UnregisteredAccountError, UnregisteredCategoryError, UnregisteredUserError } from "@/usecases/errors"

export class AddManualTransactionToWallet implements UseCase {
    private readonly accountRepo: UpdateAccountRepository
    private readonly userRepo: UserRepository
    private readonly transactionRepo: TransactionRepository
    private readonly categoryRepo: CategoryRepository

    constructor(userRepository: UserRepository, accountRepository: UpdateAccountRepository, transactionRepository: TransactionRepository, categoryRepository: CategoryRepository) {
        this.userRepo = userRepository
        this.accountRepo = accountRepository
        this.transactionRepo = transactionRepository
        this.categoryRepo = categoryRepository
    }

    async perform(request: TransactionRequest): Promise<any> {
        const foundAccountData = await this.accountRepo.findById(request.accountId)
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

        const walletAccount = accountOrError.value as WalletAccount

        let foundCategory: CategoryData = null
        let category: Category = null
        if(request.categoryId) {
            foundCategory = await this.categoryRepo.findById(request.categoryId)
            if(!foundCategory) {
                return left(new UnregisteredCategoryError())
            }
            category = Category.create(foundCategory).value as Category
        }


        const transactionOrError = Transaction.create({
            amount: request.amount,
            description: request.description,
            descriptionOriginal: request.descriptionOriginal,
            date: request.date,
            category,
            comment: request.comment,
            ignored: request.ignored,
        })

        if(transactionOrError.isLeft()) {
            return left(transactionOrError.value)
        }

        const transaction = transactionOrError.value as Transaction

        walletAccount.addTransaction(transaction)

        const transactionData: TransactionData = {
            accountId: request.accountId,
            accountType: walletAccount.type,
            syncType: walletAccount.syncType,
            userId: foundAccountData.userId,
            amount: transaction.amount.value,
            description: transaction.description,
            descriptionOriginal: transaction.descriptionOriginal,
            date: transaction.date,
            type: transaction.type,
            comment: transaction.comment,
            ignored: transaction.ignored,
            category: foundCategory,
        }

        const addedTransaction = await this.transactionRepo.add(transactionData)

        await this.accountRepo.updateBalance(request.accountId, walletAccount.balance.value)
        
        return right(addedTransaction)
    }

}