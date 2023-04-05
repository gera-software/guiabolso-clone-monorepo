import { Amount, User, WalletAccount } from "@/entities";
import { InvalidBalanceError, InvalidEmailError, InvalidNameError, InvalidPasswordError } from "@/entities/errors";
import { Either, left, right } from "@/shared";
import { AccountData, AccountRepository, UseCase, UserRepository, WalletAccountData } from "@/usecases/ports";
import { UnregisteredUserError } from "@/usecases/errors";

export class CreateManualWalletAccount implements UseCase {
    private readonly accountRepo: AccountRepository
    private readonly userRepo: UserRepository

    constructor(accountRepo: AccountRepository, userRepo: UserRepository) {
        this.accountRepo = accountRepo
        this.userRepo = userRepo
    }

    async perform(accountData: WalletAccountData): Promise<Either<InvalidNameError | InvalidEmailError | InvalidPasswordError | InvalidBalanceError | UnregisteredUserError, AccountData>> {

        const foundUserData = await this.userRepo.findUserById(accountData.userId)
        if(!foundUserData) {
            return left(new UnregisteredUserError())
        }

        const userOrError = User.create(foundUserData)
        if(userOrError.isLeft()) {
            return left(userOrError.value)
        }

        const user = userOrError.value as User

        const walletOrError = WalletAccount.create({
            name: accountData.name,
            balance: accountData.balance,
            imageUrl: accountData.imageUrl,
            user,
        }) 

        if(walletOrError.isLeft()) {
            return left(walletOrError.value)
        }

        const addedAccount = await this.accountRepo.add(accountData)

        return right(addedAccount)
    }
}