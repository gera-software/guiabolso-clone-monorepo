import { CategoryData, CategoryRepository, TransactionRequest, UpdateAccountRepository, UseCase, UserRepository } from "@/usecases/ports";
import { left } from "@/shared";
import { UnregisteredAccountError, UnregisteredUserError, UnregisteredCategoryError } from "@/usecases/errors"
import { TransactionToAddData } from "@/usecases/add-manual-transaction/ports";

export class AddManualTransaction implements UseCase {
    private readonly accountRepo: UpdateAccountRepository
    private readonly userRepo: UserRepository
    private readonly categoryRepo: CategoryRepository
    

    private addManualTransactionToWallet: UseCase
    private addManualTransactionToBank: UseCase
    private addManualTransactionToCreditCard: UseCase

    constructor(userRepository: UserRepository, accountRepository: UpdateAccountRepository, categoryRepository: CategoryRepository, addManualTransactionToWallet: UseCase, addManualTransactionToBank: UseCase, addManualTransactionToCreditCard: UseCase) {
        this.userRepo = userRepository
        this.accountRepo = accountRepository
        this.categoryRepo = categoryRepository

        
        this.addManualTransactionToWallet = addManualTransactionToWallet
        this.addManualTransactionToBank = addManualTransactionToBank
        this.addManualTransactionToCreditCard = addManualTransactionToCreditCard
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

        let foundCategoryData: CategoryData = null
        if(request.categoryId) {
            foundCategoryData = await this.categoryRepo.findById(request.categoryId)
            if(!foundCategoryData) {
                return left(new UnregisteredCategoryError())
            }
        }

        const transactionToAddData: TransactionToAddData = {
            user: foundUserData, 
            account: foundAccountData, 
            category: foundCategoryData, 
            amount: request.amount,
            description: request.description,
            date: request.date,
            comment: request.comment,
            ignored: request.ignored,
        }

        switch(foundAccountData.type) {
            case 'WALLET':
                return this.addManualTransactionToWallet.perform(transactionToAddData)
            case 'BANK':
                return this.addManualTransactionToBank.perform(transactionToAddData)
            case 'CREDIT_CARD':
                return this.addManualTransactionToCreditCard.perform(transactionToAddData)
        }

    }

}