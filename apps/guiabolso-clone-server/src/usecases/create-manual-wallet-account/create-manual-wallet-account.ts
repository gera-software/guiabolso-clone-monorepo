import { User } from "@/entities";
import { InvalidNameError } from "@/entities/errors";
import { left } from "@/shared";
import { AccountRepository, UseCase } from "@/usecases/ports";

export class CreateManualWalletAccount implements UseCase {
    private readonly accountRepo: AccountRepository

    constructor(accountRepo: AccountRepository) {
        this.accountRepo = accountRepo
    }

    async perform(wallet: { name: string, balance: number, imageUrl?: string, user: User}): Promise<any> {
        return left(new InvalidNameError())
    }
}