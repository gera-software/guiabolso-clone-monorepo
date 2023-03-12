import { Transaction, User, WalletAccount } from "@/entities"
import { left, right } from "@/shared"
import { AccountRepository, TransactionRequest, TransactionRepository, UseCase, UserRepository, TransactionData } from "@/usecases/ports"
import { UnregisteredAccountError, UnregisteredUserError } from "@/usecases/errors"

export class AddManualTransactionToWallet implements UseCase {
    private readonly accountRepo: AccountRepository
    private readonly userRepo: UserRepository
    private readonly transactionRepo: TransactionRepository

    constructor(userRepository: UserRepository, accountRepository: AccountRepository, transactionRepository: TransactionRepository) {
        this.userRepo = userRepository
        this.accountRepo = accountRepository
        this.transactionRepo = transactionRepository
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

        const transactionOrError = Transaction.create({
            account: walletAccount,
            amount: request.amount,
            description: request.description,
            descriptionOriginal: request.descriptionOriginal,
            date: request.date,
            type: request.type,
        })

        if(transactionOrError.isLeft()) {
            return left(transactionOrError.value)
        }

        const transaction = transactionOrError.value as Transaction

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
        }

        const addedTransaction = await this.transactionRepo.add(transactionData)
        
        return right(addedTransaction)
    }

}