import { Either, right } from "@/shared"
import { TransactionData, TransactionRepository, UpdateAccountRepository, UseCase, UserRepository } from "@/usecases/ports"
import { BankTransaction, User, ManualBankAccount } from "@/entities"

export class RemoveManualTransactionFromBank implements UseCase {
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

        const accountOrError = ManualBankAccount.create({ 
            name: foundAccountData.name, 
            balance: foundAccountData.balance, 
            imageUrl: foundAccountData.imageUrl, 
            user 
        })

        const bankAccount = accountOrError.value as ManualBankAccount

        const transactionOrError = BankTransaction.create({
            amount: removedTransaction.amount,
            description: removedTransaction.description,
            date: removedTransaction.date,
            category: null,
            comment: removedTransaction.comment,
            ignored: removedTransaction.ignored,
        })

        const transaction = transactionOrError.value as BankTransaction

        bankAccount.removeTransaction(transaction)

        await this.accountRepo.updateBalance(removedTransaction.accountId, bankAccount.balance.value)

        return right(removedTransaction)
    }

}