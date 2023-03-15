import { Either } from "@/shared";
import { TransactionData, UseCase } from "@/usecases/ports";
import { UnregisteredTransactionError } from "@/usecases/errors";
import { RemoveManualTransactionFromWallet } from "@/usecases/remove-manual-transaction-from-wallet";

export class RemoveManualTransaction implements UseCase {
    private readonly removeManualTransactionFromWallet: RemoveManualTransactionFromWallet

    constructor(removeManualTransactionFromWallet: RemoveManualTransactionFromWallet) {
        this.removeManualTransactionFromWallet = removeManualTransactionFromWallet
    }
    
    async perform(id: string): Promise<Either<UnregisteredTransactionError, TransactionData>> {
        return this.removeManualTransactionFromWallet.perform(id)
    }

}