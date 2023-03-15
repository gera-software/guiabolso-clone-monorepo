import { Either, left, right } from "@/shared"
import { TransactionRepository, UpdateAccountRepository, UseCase, UserRepository } from "@/usecases/ports"
import { UnregisteredTransactionError } from "@/usecases/errors"
import { Transaction, User, WalletAccount } from "@/entities"

export class RemoveManualTransactionFromWallet implements UseCase {
    private readonly transactionRepo: TransactionRepository
    private readonly accountRepo: UpdateAccountRepository
    private readonly userRepo: UserRepository

    constructor(transactionRepository: TransactionRepository, accountRepository: UpdateAccountRepository, userRepository: UserRepository) {
        this.transactionRepo = transactionRepository
        this.accountRepo = accountRepository
        this.userRepo = userRepository
    }

    async perform(id: string): Promise<Either<UnregisteredTransactionError, any>> {

        const removedTransaction = await this.transactionRepo.remove(id)

        if(!removedTransaction) {
            return left(new UnregisteredTransactionError())
        }

        const foundAccountData = await this.accountRepo.findById(removedTransaction.accountId)
        const foundUserData = await this.userRepo.findUserById(foundAccountData.userId)

        const userOrError = User.create(foundUserData)

        const user = userOrError.value as User

        const accountOrError = WalletAccount.create({ 
            name: foundAccountData.name, 
            balance: foundAccountData.balance, 
            imageUrl: foundAccountData.imageUrl, 
            user 
        })

        const walletAccount = accountOrError.value as WalletAccount

        const transactionOrError = Transaction.create({
            amount: removedTransaction.amount,
            description: removedTransaction.description,
            descriptionOriginal: removedTransaction.descriptionOriginal,
            date: removedTransaction.date,
            category: null,
            comment: removedTransaction.comment,
            ignored: removedTransaction.ignored,
        })

        const transaction = transactionOrError.value as Transaction

        walletAccount.removeTransaction(transaction)

        await this.accountRepo.updateBalance(removedTransaction.accountId, walletAccount.balance.value)

        return right(removedTransaction)
    }

}