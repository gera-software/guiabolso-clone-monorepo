import { AccountData, UseCase } from "@/usecases/ports";

export class CreateManualAccount implements UseCase {
    private readonly createManualWalletAccount: UseCase
    private readonly createManualBankAccount: UseCase

    constructor(createManualWalletAccount: UseCase, createManualBankAccount: UseCase) {
        this.createManualWalletAccount = createManualWalletAccount
        this.createManualBankAccount = createManualBankAccount
    }

    async perform(request: AccountData): Promise<any> {
        switch(request.type) {
            case 'WALLET':
                return this.createManualWalletAccount.perform(request)
            case 'BANK':
                return this.createManualBankAccount.perform(request)
        }
    }

}