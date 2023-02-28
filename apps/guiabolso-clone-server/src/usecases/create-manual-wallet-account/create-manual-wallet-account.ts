import { Amount, User } from "@/entities";
import { InvalidBalanceError, InvalidNameError } from "@/entities/errors";
import { left, right } from "@/shared";
import { AccountData, AccountRepository, UseCase, UserRepository, WalletAccountData } from "@/usecases/ports";
import { InvalidUserError } from "../errors";

export class CreateManualWalletAccount implements UseCase {
    private readonly accountRepo: AccountRepository
    private readonly userRepo: UserRepository

    constructor(accountRepo: AccountRepository, userRepo: UserRepository) {
        this.accountRepo = accountRepo
        this.userRepo = userRepo
    }

    async perform(accountData: WalletAccountData): Promise<any> {

        if(!accountData.name) {
            return left(new InvalidNameError())
        }

        const balanceOrError = Amount.create(accountData.balance)
        if(balanceOrError.isLeft()){
            return left(new InvalidBalanceError())
        }

        // const userOrError = await this.userRepo.findUserById(accountData.userId)
        return left(new InvalidUserError())

        // return right()
    }
}