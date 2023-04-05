import { AccountData, UseCase } from "@/usecases/ports";

export class CreateManualAccount implements UseCase {
    private readonly createManualWalletAccount: UseCase
    private readonly createManualBankAccount: UseCase
    private readonly createManualCreditCardAccount: UseCase

    constructor(createManualWalletAccount: UseCase, createManualBankAccount: UseCase, createManualCreditCardAccount: UseCase) {
        this.createManualWalletAccount = createManualWalletAccount
        this.createManualBankAccount = createManualBankAccount
        this.createManualCreditCardAccount = createManualCreditCardAccount
    }

    async perform(request: AccountData): Promise<any> {
        switch(request.type) {
            case 'WALLET':
                return this.createManualWalletAccount.perform(request)
            case 'BANK':
                return this.createManualBankAccount.perform(request)
            case 'CREDIT_CARD':
                return this.createManualCreditCardAccount.perform(request)
        }
    }

}