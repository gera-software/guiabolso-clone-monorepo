import { Either } from "@/shared";
import { TransactionData, TransactionRequest, UseCase } from "@/usecases/ports";
import { UnregisteredAccountError, UnregisteredCategoryError, UnregisteredTransactionError, UnregisteredUserError } from "@/usecases/errors";
import { UpdateManualTransactionFromWallet } from "@/usecases/update-manual-transaction-from-wallet";
import { InvalidTransactionError, InvalidAmountError, InvalidNameError, InvalidEmailError, InvalidPasswordError, InvalidBalanceError } from "@/entities/errors";

export class UpdateManualTransaction implements UseCase {
    private readonly updateManualTransactionFromWallet: UpdateManualTransactionFromWallet

    constructor(updateManualTransactionFromWallet: UpdateManualTransactionFromWallet) {
        this.updateManualTransactionFromWallet = updateManualTransactionFromWallet
    }

    async perform(request: TransactionRequest): Promise<Either<UnregisteredCategoryError | InvalidTransactionError | InvalidAmountError | UnregisteredTransactionError | UnregisteredAccountError | UnregisteredUserError | InvalidNameError | InvalidEmailError | InvalidPasswordError | InvalidBalanceError, TransactionData>> {
        return this.updateManualTransactionFromWallet.perform(request)
    }

}