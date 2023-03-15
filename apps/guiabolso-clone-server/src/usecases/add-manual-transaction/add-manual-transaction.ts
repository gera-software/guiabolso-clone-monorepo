import { TransactionData, TransactionRequest, UseCase } from "@/usecases/ports";
import { AddManualTransactionToWallet } from "@/usecases/add-manual-transaction-to-wallet";
import { InvalidAmountError, InvalidBalanceError, InvalidEmailError, InvalidNameError, InvalidPasswordError, InvalidTransactionError } from "@/entities/errors";
import { Either } from "@/shared";
import { UnregisteredAccountError, UnregisteredUserError, UnregisteredCategoryError } from "@/usecases/errors"

export class AddManualTransaction implements UseCase {
    private addManualTransactionToWallet: AddManualTransactionToWallet

    constructor(addManualTransactionToWallet: AddManualTransactionToWallet) {
        this.addManualTransactionToWallet = addManualTransactionToWallet
    }

    async perform(request: TransactionRequest): Promise<Either<UnregisteredAccountError | UnregisteredUserError | InvalidNameError | InvalidEmailError | InvalidPasswordError | InvalidBalanceError | UnregisteredCategoryError | InvalidTransactionError | InvalidAmountError, TransactionData>> {
        return this.addManualTransactionToWallet.perform(request)
    }

}