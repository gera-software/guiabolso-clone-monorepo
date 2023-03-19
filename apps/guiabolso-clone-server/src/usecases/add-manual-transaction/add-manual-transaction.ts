import { CategoryData, CategoryRepository, TransactionData, TransactionRequest, UpdateAccountRepository, UseCase, UserRepository } from "@/usecases/ports";
import { AddManualTransactionToWallet } from "@/usecases/add-manual-transaction-to-wallet";
import { InvalidAmountError, InvalidBalanceError, InvalidEmailError, InvalidNameError, InvalidPasswordError, InvalidTransactionError } from "@/entities/errors";
import { Either, left } from "@/shared";
import { UnregisteredAccountError, UnregisteredUserError, UnregisteredCategoryError } from "@/usecases/errors"
import { Category, User } from "@/entities";
import { TransactionToAddData } from "./ports";

export class AddManualTransaction implements UseCase {
    private readonly accountRepo: UpdateAccountRepository
    private readonly userRepo: UserRepository
    private readonly categoryRepo: CategoryRepository
    

    private addManualTransactionToWallet: UseCase
    private addManualTransactionToBank: UseCase

    constructor(userRepository: UserRepository, accountRepository: UpdateAccountRepository, categoryRepository: CategoryRepository, addManualTransactionToWallet: UseCase, addManualTransactionToBank: UseCase, ) {
        this.userRepo = userRepository
        this.accountRepo = accountRepository
        this.categoryRepo = categoryRepository

        
        this.addManualTransactionToWallet = addManualTransactionToWallet
        this.addManualTransactionToBank = addManualTransactionToBank
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
        // if(request.categoryId) {
            foundCategoryData = await this.categoryRepo.findById(request.categoryId)
            if(!foundCategoryData) {
                return left(new UnregisteredCategoryError())
            }
        // }

        const transactionToAddData: TransactionToAddData = {
            userData: foundUserData, 
            accountData: foundAccountData, 
            categoryData: foundCategoryData, 
            amount: request.amount,
            description: request.description,
            date: request.date,
            comment: request.comment,
            ignored: request.ignored,
        }

        switch(foundAccountData.type) {
            case 'WALLET':
                return this.addManualTransactionToWallet.perform(transactionToAddData)
        }
        

        // return this.addManualTransactionToWallet.perform(request)
    }

}