import { Either, left } from "@/shared";
import { CategoryData, CategoryRepository, TransactionData, TransactionRepository, TransactionRequest, UpdateAccountRepository, UseCase, UserRepository } from "@/usecases/ports";
import { UnregisteredAccountError, UnregisteredCategoryError, UnregisteredTransactionError, UnregisteredUserError } from "@/usecases/errors";
import { UpdateManualTransactionFromWallet } from "@/usecases/update-manual-transaction-from-wallet";
import { InvalidTransactionError, InvalidAmountError, InvalidNameError, InvalidEmailError, InvalidPasswordError, InvalidBalanceError } from "@/entities/errors";

export class UpdateManualTransaction implements UseCase {
    private readonly userRepo: UserRepository
    private readonly accountRepo: UpdateAccountRepository
    private readonly transactionRepo: TransactionRepository
    private readonly categoryRepo: CategoryRepository
    private readonly updateManualTransactionFromWallet: UpdateManualTransactionFromWallet

    constructor(userRepository: UserRepository, accountRepository: UpdateAccountRepository, transactionRepository: TransactionRepository, categoryRepository: CategoryRepository, updateManualTransactionFromWallet: UpdateManualTransactionFromWallet) {
        this.userRepo = userRepository
        this.accountRepo = accountRepository
        this.transactionRepo = transactionRepository
        this.categoryRepo = categoryRepository
        this.updateManualTransactionFromWallet = updateManualTransactionFromWallet
    }

    async perform(request: TransactionRequest): Promise<Either<UnregisteredCategoryError | InvalidTransactionError | InvalidAmountError | UnregisteredTransactionError | UnregisteredAccountError | UnregisteredUserError | InvalidNameError | InvalidEmailError | InvalidPasswordError | InvalidBalanceError, TransactionData>> {
        const oldTransactionData = await this.transactionRepo.findById(request.id)

        if(!oldTransactionData) {
            return left(new UnregisteredTransactionError())
        }

        const foundAccountData = await this.accountRepo.findById(oldTransactionData.accountId)
        if(!foundAccountData) {
            return left(new UnregisteredAccountError())
        }

        const foundUserData = await this.userRepo.findUserById(foundAccountData.userId)
        if(!foundUserData) {
            return left(new UnregisteredUserError())
        }

        let foundCategory: CategoryData = null
        if(request.categoryId) {
            foundCategory = await this.categoryRepo.findById(request.categoryId)
            if(!foundCategory) {
                return left(new UnregisteredCategoryError())
            }
        }

        
        return this.updateManualTransactionFromWallet.perform(request)
    }

}