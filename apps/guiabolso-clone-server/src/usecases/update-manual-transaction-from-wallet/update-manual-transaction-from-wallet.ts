import { Either, left, right } from "@/shared"
import { AccountData, TransactionData, TransactionRepository, UpdateAccountRepository, UseCase, UserData } from "@/usecases/ports"
import { Category, WalletTransaction, User, ManualWalletAccount } from "@/entities"
import { InvalidAmountError, InvalidBalanceError, InvalidEmailError, InvalidNameError, InvalidPasswordError, InvalidTransactionError } from "@/entities/errors"
import { TransactionToUpdateData } from "@/usecases/update-manual-transaction/ports"
import { TransactionToAddData } from "@/usecases/add-manual-transaction/ports"

export class UpdateManualTransactionFromWallet implements UseCase {
    private readonly transactionRepo: TransactionRepository
    private readonly accountRepo: UpdateAccountRepository

    constructor(transactionRepository: TransactionRepository, accountRepository: UpdateAccountRepository) {
        this.transactionRepo = transactionRepository
        this.accountRepo = accountRepository
    }

    private async createTransaction(transaction: TransactionToAddData | TransactionData): Promise<Either<InvalidTransactionError | InvalidAmountError, WalletTransaction>> {
        let category: Category = null
        
        if(transaction.category) {
            category = Category.create(transaction.category).value as Category
        }

        const transactionOrError = WalletTransaction.create({
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

        return right(transactionOrError.value as WalletTransaction) 
    }

    private async createWalletAccount(accountData: AccountData, userData: UserData): Promise<Either<InvalidNameError | InvalidEmailError | InvalidPasswordError | InvalidBalanceError, ManualWalletAccount>> {
        const userOrError = User.create(userData)
        if(userOrError.isLeft()) {
            return left(userOrError.value)
        }

        const user = userOrError.value as User

        const accountOrError = ManualWalletAccount.create({ 
            name: accountData.name, 
            balance: accountData.balance, 
            imageUrl: accountData.imageUrl, 
            user 
        })
        if(accountOrError.isLeft()) {
            return left(accountOrError.value)
        }

        return right(accountOrError.value as ManualWalletAccount)
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

        const oldTransaction = oldTransactionOrError.value as WalletTransaction
        const newTransaction = newTransactionOrError.value as WalletTransaction

        const accountOrError = await this.createWalletAccount(request.newTransaction.account, request.newTransaction.user)
        if(accountOrError.isLeft()) {
            return left(accountOrError.value)
        }

        const walletAccount = accountOrError.value as ManualWalletAccount

        walletAccount.removeTransaction(oldTransaction)
        walletAccount.addTransaction(newTransaction)

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

        const result = await this.transactionRepo.update(transactionData)

        await this.accountRepo.updateBalance(request.oldTransactionData.accountId, walletAccount.balance.value)

        return(right(result))

    }

}