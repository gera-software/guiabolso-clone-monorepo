import { Either, left } from "@/shared";
import { TransactionData, TransactionRepository, UseCase } from "@/usecases/ports";
import { UnregisteredTransactionError } from "@/usecases/errors";
import { InvalidAccountError } from "@/entities/errors";

export class RemoveManualTransaction implements UseCase {
    private readonly transactionRepo: TransactionRepository

    private readonly removeManualTransactionFromWallet: UseCase
    private readonly removeManualTransactionFromBank: UseCase
    private readonly removeManualTransactionFromCreditCard: UseCase

    constructor(transactionRepository: TransactionRepository, removeManualTransactionFromWallet: UseCase, removeManualTransactionFromBank: UseCase, removeManualTransactionFromCreditCard: UseCase) {
        this.transactionRepo = transactionRepository
        this.removeManualTransactionFromWallet = removeManualTransactionFromWallet
        this.removeManualTransactionFromBank = removeManualTransactionFromBank
        this.removeManualTransactionFromCreditCard = removeManualTransactionFromCreditCard
    }
    
    async perform(id: string): Promise<Either<InvalidAccountError | UnregisteredTransactionError, TransactionData>> {
        const transactionData = await this.transactionRepo.findById(id)

        if(!transactionData || transactionData._isDeleted) {
            return left(new UnregisteredTransactionError())
        }

        if(transactionData.syncType != 'MANUAL') {
            return left(new InvalidAccountError('Operação não permitida'))
        }

        switch(transactionData.accountType) {
            case 'WALLET':
                return this.removeManualTransactionFromWallet.perform(id)
            case 'BANK':
                return this.removeManualTransactionFromBank.perform(id)
            case 'CREDIT_CARD':
                return this.removeManualTransactionFromCreditCard.perform(id)
        }

    }

}