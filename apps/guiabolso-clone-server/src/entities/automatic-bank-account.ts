import { AccountSynchonization, AccountType, Amount, AutomaticAccount, Institution, ManualBankAccount, SyncType, User } from "@/entities";
import { Either, left, right } from "@/shared";
import { InvalidNameError, InvalidBalanceError, InvalidInstitutionError, InvalidAccountError } from "@/entities/errors";

export class AutomaticBankAccount implements AutomaticAccount {
    public readonly name: string;
    public readonly balance: Amount;
    public readonly imageUrl?: string;
    public readonly user: User;
    public readonly type: AccountType = 'BANK';
    public readonly syncType: SyncType = 'AUTOMATIC';
    public readonly institution: Institution

    public readonly providerAccountId: string;
    public readonly synchonization: AccountSynchonization;

    private constructor(account: {name: string, balance: Amount, imageUrl?: string, user: User, institution?: Institution, providerAccountId: string, providerItemId: string, createdAt: Date}) {
        this.name = account.name
        this.balance = account.balance
        this.imageUrl = account.imageUrl
        this.user = account.user
        this.institution = account.institution
        this.providerAccountId = account.providerAccountId
        this.synchonization = {
            providerItemId: account.providerItemId,
            createdAt: account.createdAt,
        }
    }

    public static create(account: { name: string, balance: number, imageUrl?: string, user: User, institution: Institution, providerAccountId: string, providerItemId: string, createdAt: Date}): Either<InvalidNameError | InvalidBalanceError | InvalidInstitutionError | InvalidAccountError, AutomaticBankAccount>  {
        const { name, balance, imageUrl, user, institution, providerAccountId, providerItemId, createdAt } = account
        
        if(!name) {
            return left(new InvalidNameError())
        }

        const balanceOrError = Amount.create(balance) 
        if(balanceOrError.isLeft()) {
            return left(new InvalidBalanceError())
        }
        
        const amount = balanceOrError.value as Amount

        if(!institution) {
            return left(new InvalidInstitutionError())
        }
        
        if(!providerAccountId) {
            return left(new InvalidAccountError("providerAccountId is required"))
        }
        
        if(!providerItemId) {
            return left(new InvalidAccountError("providerItemId is required"))
        }
        
        if(!createdAt) {
            return left(new InvalidAccountError("createdAt is required"))
        }

        return right(new AutomaticBankAccount({name, balance: amount, imageUrl, user, institution, providerAccountId, providerItemId, createdAt}))

    }

}