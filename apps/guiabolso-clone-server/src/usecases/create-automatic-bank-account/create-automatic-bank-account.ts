import { Either, left, right } from "@/shared";
import { AccountRepository, BankAccountData, InstitutionRepository, UseCase, UserRepository } from "@/usecases/ports";
import { UnregisteredInstitutionError, UnregisteredUserError } from "@/usecases/errors";
import { AutomaticBankAccount, Institution, User } from "@/entities";

export class CreateAutomaticBankAccount implements UseCase {
    private readonly accountRepo: AccountRepository
    private readonly userRepo: UserRepository
    private readonly institutionRepo: InstitutionRepository


    constructor(accountRepo: AccountRepository, userRepo: UserRepository,  institutionRepo: InstitutionRepository) {
        this.accountRepo = accountRepo
        this.userRepo = userRepo
        this.institutionRepo = institutionRepo
    }

    async perform(accountData: BankAccountData): Promise<Either<any, BankAccountData>> {
        const foundUserData = await this.userRepo.findUserById(accountData.userId)
        if(!foundUserData) {
            return left(new UnregisteredUserError())
        }

        const userOrError = User.create(foundUserData)
        if(userOrError.isLeft()) {
            return left(userOrError.value)
        }

        const user = userOrError.value as User

        let institution: Institution = null
        if(accountData.institution && accountData.institution.id) {
            const foundInstitutionData = await this.institutionRepo.findById(accountData.institution.id)
            if(!foundInstitutionData) {
                return left(new UnregisteredInstitutionError('Instituição não encontrada'))
            }
            accountData.institution = foundInstitutionData

            const institutionOrError = Institution.create(foundInstitutionData)
            if(institutionOrError.isLeft()) {
                return left(institutionOrError.value)
            }

            institution = institutionOrError.value as Institution
        }

        const bankOrError = AutomaticBankAccount.create({
            name: accountData.name,
            balance: accountData.balance,
            imageUrl: accountData.imageUrl,
            user,
            institution,
            providerAccountId: accountData.providerAccountId,
            providerItemId: accountData.synchronization.providerItemId,
            createdAt: accountData.synchronization.createdAt,
            syncStatus: accountData.synchronization.syncStatus,
            lastSyncAt: accountData.synchronization.lastSyncAt,
            mergeStatus: accountData.synchronization.mergeStatus,
        }) 

        if(bankOrError.isLeft()) {
            return left(bankOrError.value)
        }

        const addedAccount = await this.accountRepo.add(accountData)

        return right(addedAccount)
    }

}