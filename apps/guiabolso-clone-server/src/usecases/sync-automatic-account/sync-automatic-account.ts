import { InvalidAccountError } from "@/entities/errors";
import { Either } from "@/shared";
import { AccountData, AccountRepository, UseCase } from "@/usecases/ports";
import { SyncAutomaticBankAccount } from "@/usecases/sync-automatic-bank-account";
import { DataProviderError, UnregisteredAccountError, UnexpectedError } from "@/usecases/errors";

export class SyncAutomaticAccount implements UseCase {
    private readonly accountRepo: AccountRepository
    private readonly syncAutomaticBankAccount: SyncAutomaticBankAccount

    constructor(accountRepository: AccountRepository, syncAutomaticBankAccount: SyncAutomaticBankAccount) {
        this.accountRepo = accountRepository
        this.syncAutomaticBankAccount = syncAutomaticBankAccount
    }

    async perform(accountId: string): Promise<Either<DataProviderError | UnregisteredAccountError | InvalidAccountError | UnexpectedError, AccountData>> {
        return this.syncAutomaticBankAccount.perform(accountId)
        // return left(new UnregisteredAccountError())
    }

}