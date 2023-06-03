import { CategoryData, CategoryRepository, CreditCardInvoiceRepository, MetaTransactionRequest, TransactionData, TransactionRepository, UpdateAccountRepository, UseCase, UserRepository } from "@/usecases/ports";
import { UnregisteredAccountError, UnregisteredCategoryError, UnregisteredTransactionError, UnregisteredUserError } from "@/usecases/errors";
import { left, right } from "@/shared";
import { InvalidAccountError } from "@/entities/errors";

export class UpdateAutomaticTransaction implements UseCase {
    private readonly userRepo: UserRepository
    private readonly accountRepo: UpdateAccountRepository
    private readonly transactionRepo: TransactionRepository
    private readonly categoryRepo: CategoryRepository
    private readonly invoiceRepo: CreditCardInvoiceRepository

    constructor(userRepository: UserRepository, accountRepository: UpdateAccountRepository, transactionRepository: TransactionRepository, categoryRepository: CategoryRepository, creditCardInvoiceRepository: CreditCardInvoiceRepository) {
        this.userRepo = userRepository
        this.accountRepo = accountRepository
        this.transactionRepo = transactionRepository
        this.categoryRepo = categoryRepository
        this.invoiceRepo = creditCardInvoiceRepository
    }

    async perform(request: MetaTransactionRequest): Promise<any> {
        const oldTransactionData = await this.transactionRepo.findById(request.id)

        if(!oldTransactionData) {
            return left(new UnregisteredTransactionError())
        }

        const foundAccountData = await this.accountRepo.findById(oldTransactionData.accountId)
        if(!foundAccountData) {
            return left(new UnregisteredAccountError())
        }
        if(foundAccountData.syncType != 'AUTOMATIC') {
            return left(new InvalidAccountError('Operação não permitida'))
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

        const transactionData: TransactionData = {
            id: oldTransactionData.id,
            description: request.description,
            comment: request.comment,
            ignored: request.ignored,
            category: foundCategory ?? null,
            accountId: null,
            accountType: null,
            syncType: null,
            userId: null,
            amount: null,
            date: null,
            type: null,
        }

        const result = await this.transactionRepo.updateAutomatic(transactionData)
        return(right(result))
    }

}