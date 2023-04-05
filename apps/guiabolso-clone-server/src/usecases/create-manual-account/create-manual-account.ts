import { AccountData, UseCase } from "@/usecases/ports";

export class CreateManualAccount implements UseCase {
    private readonly createManualWalletAccount: UseCase

    constructor(createManualWalletAccount: UseCase) {
        this.createManualWalletAccount = createManualWalletAccount
    }

    async perform(request: AccountData): Promise<any> {
        return this.createManualWalletAccount.perform(request)
    }

}