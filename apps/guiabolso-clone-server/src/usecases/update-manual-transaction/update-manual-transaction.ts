import { Either, left } from "@/shared";
import { CategoryData, CategoryRepository, TransactionData, TransactionRepository, TransactionRequest, UpdateAccountRepository, UseCase, UserRepository } from "@/usecases/ports";
import { UnregisteredAccountError, UnregisteredCategoryError, UnregisteredTransactionError, UnregisteredUserError } from "@/usecases/errors";
import { InvalidTransactionError, InvalidAmountError, InvalidNameError, InvalidEmailError, InvalidPasswordError, InvalidBalanceError, InvalidCreditCardError, InvalidCreditCardInvoiceError } from "@/entities/errors";
import { TransactionToUpdateData } from "@/usecases/update-manual-transaction/ports";
import { UpdateManualTransactionFromWallet } from "@/usecases/update-manual-transaction-from-wallet";
import { UpdateManualTransactionFromBank } from "@/usecases/update-manual-transaction-from-bank";
import { UpdateManualTransactionFromCreditCard } from "@/usecases/update-manual-transaction-from-credit-card";

export class UpdateManualTransaction implements UseCase {
    private readonly userRepo: UserRepository
    private readonly accountRepo: UpdateAccountRepository
    private readonly transactionRepo: TransactionRepository
    private readonly categoryRepo: CategoryRepository
    private readonly updateManualTransactionFromWallet: UpdateManualTransactionFromWallet
    private readonly updateManualTransactionFromBank: UpdateManualTransactionFromBank
    private readonly updateManualTransactionFromCreditCard: UpdateManualTransactionFromCreditCard

    constructor(userRepository: UserRepository, accountRepository: UpdateAccountRepository, transactionRepository: TransactionRepository, categoryRepository: CategoryRepository, updateManualTransactionFromWallet: UpdateManualTransactionFromWallet, updateManualTransactionFromBank: UpdateManualTransactionFromBank, updateManualTransactionFromCreditCard: UpdateManualTransactionFromCreditCard) {
        this.userRepo = userRepository
        this.accountRepo = accountRepository
        this.transactionRepo = transactionRepository
        this.categoryRepo = categoryRepository
        this.updateManualTransactionFromWallet = updateManualTransactionFromWallet
        this.updateManualTransactionFromBank = updateManualTransactionFromBank
        this.updateManualTransactionFromCreditCard = updateManualTransactionFromCreditCard
    }

    async perform(request: TransactionRequest): Promise<Either<UnregisteredCategoryError | InvalidTransactionError | InvalidAmountError | UnregisteredTransactionError | UnregisteredAccountError | UnregisteredUserError | InvalidNameError | InvalidEmailError | InvalidPasswordError | InvalidBalanceError | InvalidCreditCardError | InvalidCreditCardInvoiceError, TransactionData>> {
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

        const transactionToUpdate: TransactionToUpdateData =  {
            oldTransactionData,
            newTransaction: {
                user: foundUserData,
                account: foundAccountData,
                category: foundCategory,
                amount: request.amount,
                description: request.description,
                date: request.date,
                comment: request.comment,
                ignored: request.ignored
            }
        }

        switch(foundAccountData.type) {
            case 'WALLET':
                return this.updateManualTransactionFromWallet.perform(transactionToUpdate)
            case 'BANK':
                return this.updateManualTransactionFromBank.perform(transactionToUpdate)
            case 'CREDIT_CARD':
                return this.updateManualTransactionFromCreditCard.perform(transactionToUpdate)
        }
    }

}