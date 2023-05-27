import { InvalidAccountError, InvalidBalanceError, InvalidCreditCardError, InvalidEmailError, InvalidInstitutionError, InvalidNameError, InvalidPasswordError, InvalidTypeError } from "@/entities/errors";
import { Either, left } from "@/shared";
import { AccountData, AccountRepository, UseCase } from "@/usecases/ports";
import { SyncAutomaticBankAccount } from "@/usecases/sync-automatic-bank-account";
import { SyncAutomaticCreditCardAccount } from "@/usecases/sync-automatic-credit-card-account";
import { DataProviderError, UnregisteredAccountError, UnexpectedError, UnregisteredInstitutionError } from "@/usecases/errors";

export class SyncAutomaticAccount implements UseCase {
    private readonly accountRepo: AccountRepository
    private readonly syncAutomaticBankAccount: SyncAutomaticBankAccount
    private readonly syncAutomaticCreditCardAccount: SyncAutomaticCreditCardAccount

    constructor(accountRepository: AccountRepository, syncAutomaticBankAccount: SyncAutomaticBankAccount, syncAutomaticCreditCardAccount: SyncAutomaticCreditCardAccount) {
        this.accountRepo = accountRepository
        this.syncAutomaticBankAccount = syncAutomaticBankAccount
        this.syncAutomaticCreditCardAccount = syncAutomaticCreditCardAccount
    }

    async perform(accountId: string): Promise<Either< UnregisteredAccountError | InvalidAccountError | DataProviderError | UnexpectedError | InvalidNameError | InvalidEmailError | InvalidPasswordError | InvalidBalanceError | InvalidCreditCardError | InvalidInstitutionError | UnregisteredInstitutionError | InvalidTypeError, AccountData>> {
        const accountData = await this.accountRepo.findById(accountId)

        if(!accountData) {
            return left(new UnregisteredAccountError('Conta não encontrada'))
        }

        switch(accountData.type) {
            case 'BANK':
                return this.syncAutomaticBankAccount.perform(accountId)
            case 'CREDIT_CARD':
                return this.syncAutomaticCreditCardAccount.perform(accountId)
        }
    }

}