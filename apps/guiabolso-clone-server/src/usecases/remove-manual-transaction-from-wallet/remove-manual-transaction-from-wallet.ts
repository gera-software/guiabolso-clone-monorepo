import { Either, right } from "@/shared"
import { TransactionData, TransactionRepository, UpdateAccountRepository, UseCase, UserRepository } from "@/usecases/ports"
import { WalletTransaction, User, ManualWalletAccount } from "@/entities"

export class RemoveManualTransactionFromWallet implements UseCase {
    private readonly transactionRepo: TransactionRepository
    private readonly accountRepo: UpdateAccountRepository
    private readonly userRepo: UserRepository

    constructor(transactionRepository: TransactionRepository, accountRepository: UpdateAccountRepository, userRepository: UserRepository) {
        this.transactionRepo = transactionRepository
        this.accountRepo = accountRepository
        this.userRepo = userRepository
    }

    async perform(id: string): Promise<Either<null, TransactionData>> {

        const removedTransaction = await this.transactionRepo.remove(id)

        const foundAccountData = await this.accountRepo.findById(removedTransaction.accountId)
        const foundUserData = await this.userRepo.findUserById(foundAccountData.userId)

        const userOrError = User.create(foundUserData)

        const user = userOrError.value as User

        const accountOrError = ManualWalletAccount.create({ 
            name: foundAccountData.name, 
            balance: foundAccountData.balance, 
            imageUrl: foundAccountData.imageUrl, 
            user 
        })

        const walletAccount = accountOrError.value as ManualWalletAccount

        const transactionOrError = WalletTransaction.create({
            amount: removedTransaction.amount,
            description: removedTransaction.description,
            date: removedTransaction.date,
            category: null,
            comment: removedTransaction.comment,
            ignored: removedTransaction.ignored,
        })

        const transaction = transactionOrError.value as WalletTransaction

        walletAccount.removeTransaction(transaction)

        await this.accountRepo.updateBalance(removedTransaction.accountId, walletAccount.balance.value)

        return right(removedTransaction)
    }

}