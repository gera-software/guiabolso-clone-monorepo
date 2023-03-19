import { Either, left } from "@/shared";
import { TransactionData, TransactionRepository, UseCase } from "@/usecases/ports";
import { UnregisteredTransactionError } from "@/usecases/errors";

export class RemoveManualTransaction implements UseCase {
    private readonly transactionRepo: TransactionRepository

    private readonly removeManualTransactionFromWallet: UseCase
    private readonly removeManualTransactionFromBank: UseCase

    constructor(transactionRepository: TransactionRepository, removeManualTransactionFromWallet: UseCase, removeManualTransactionFromBank: UseCase,) {
        this.transactionRepo = transactionRepository
        this.removeManualTransactionFromWallet = removeManualTransactionFromWallet
        this.removeManualTransactionFromBank = removeManualTransactionFromBank
    }
    
    async perform(id: string): Promise<Either<UnregisteredTransactionError, TransactionData>> {
        const transactionData = await this.transactionRepo.findById(id)

        if(!transactionData || transactionData._isDeleted) {
            return left(new UnregisteredTransactionError())
        }

        switch(transactionData.accountType) {
            case 'WALLET':
                return this.removeManualTransactionFromWallet.perform(id)
            case 'BANK':
                return this.removeManualTransactionFromBank.perform(id)
        }

    }

}