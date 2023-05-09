import { left } from "@/shared";
import { UpdateAccountRepository, UseCase } from "@/usecases/ports";
import { UnregisteredAccountError } from "@/usecases/errors";
import { InvalidAccountError } from "@/entities/errors";

export class SyncAutomaticBankAccount implements UseCase {
    private readonly accountRepo: UpdateAccountRepository
    
    constructor(accountRepository: UpdateAccountRepository) {
        this.accountRepo = accountRepository
    }
    
    async perform(id: string): Promise<any> {
        const foundAccountData = await this.accountRepo.findById(id)

        if(!foundAccountData) {
            return left(new UnregisteredAccountError())
        }
        return left(new InvalidAccountError())
    }
    
}