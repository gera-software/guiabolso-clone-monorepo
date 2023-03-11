import { Transaction, User, WalletAccount } from "@/entities"
import { InvalidTransactionError } from "@/entities/errors"
import { left, right } from "@/shared"
import { AccountRepository, TransactionData, UseCase, UserRepository } from "@/usecases/ports"
import { UnregisteredAccountError, UnregisteredUserError } from "@/usecases/errors"

export class AddManualTransactionToWallet implements UseCase {
    private readonly accountRepo: AccountRepository
    private readonly userRepo: UserRepository

    constructor(userRepository: UserRepository, accountRepository: AccountRepository) {
        this.userRepo = userRepository
        this.accountRepo = accountRepository
    }

    async perform(request: TransactionData): Promise<any> {
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
        // TODO salva transação no banco
        return right(request)

    }

}