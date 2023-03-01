import { InvalidNameError } from '@/entities/errors'
import { left } from '@/shared'
import { AccountRepository, UseCase, UserRepository } from '@/usecases/ports'

export class CreateManualBankAccount implements UseCase {
    private readonly accountRepo: AccountRepository
    private readonly userRepo: UserRepository

    constructor(accountRepo: AccountRepository, userRepo: UserRepository) {
        this.accountRepo = accountRepo
        this.userRepo = userRepo
    }

    async perform(request: any): Promise<any> {
        return left(new InvalidNameError())
    }

}