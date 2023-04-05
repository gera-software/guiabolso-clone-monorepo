import { CreateManualAccount } from "@/usecases/create-manual-account"
import { CreateManualBankAccount } from "@/usecases/create-manual-bank-account"
import { CreateManualWalletAccount } from "@/usecases/create-manual-wallet-account"
import { AccountData, BankAccountData, InstitutionData, WalletAccountData } from "@/usecases/ports"
import { InMemoryAccountRepository, InMemoryInstitutionRepository, InMemoryUserRepository } from "@test/doubles/repositories"

describe('Create manual account use case', () => {

    describe('manual wallet account', () => {
        test('should create manual wallet account if all params are valid', async () => {
            const type = 'WALLET'
            const syncType = 'MANUAL'
            const name = 'valid account'
            const balance = 678
            const imageUrl = 'valid image url'
            const userId = 'valid user id'
    
            const createManualWalletRequest: WalletAccountData = {
                type,
                syncType,
                name,
                balance,
                imageUrl,
                userId,
            }
    
            const accountRepository = new InMemoryAccountRepository([])
            const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
            const institutionRepository = new InMemoryInstitutionRepository([])
            const createManualWalletAccount = new CreateManualWalletAccount(accountRepository, userRepository)
            const createManualBankAccount = new CreateManualBankAccount(accountRepository, userRepository, institutionRepository)
            const sut = new CreateManualAccount(createManualWalletAccount, createManualBankAccount)

            const response = (await sut.perform(createManualWalletRequest)).value as AccountData
    
            const addedAccount = await accountRepository.exists(response.id)
            expect(addedAccount).toBeTruthy()
            expect(response.type).toBe(type)
            expect(response.id).toBeTruthy()
        })
    })

    describe('manual bank account', () => {
        test('should create manual bank account if all params are valid', async () => {
            const type = 'BANK'
            const syncType = 'MANUAL'
            const name = 'valid account'
            const balance = 670
            const imageUrl = 'valid image url'
            const userId = 'valid user id'
            const institution: InstitutionData = {
                id: 'id 0',
                name: 'institution name',
                type: 'PERSONAL_BANK',
                imageUrl: 'url',
                primaryColor: 'color',
                providerConnectorId: 'valid id'
            }
    
            const createManualBankRequest: BankAccountData = {
                type,
                syncType,
                name,
                balance,
                userId,
                imageUrl,
                institution,
            }
    
            const accountRepository = new InMemoryAccountRepository([])
            const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
            const institutionRepository = new InMemoryInstitutionRepository([institution])
            const createManualWalletAccount = new CreateManualWalletAccount(accountRepository, userRepository)
            const createManualBankAccount = new CreateManualBankAccount(accountRepository, userRepository, institutionRepository)
            
            const sut = new CreateManualAccount(createManualWalletAccount, createManualBankAccount)

            const response = (await sut.perform(createManualBankRequest)).value as AccountData
    
            const addedAccount = await accountRepository.exists(response.id)
            expect(addedAccount).toBeTruthy()
            expect(response.id).toBeTruthy()
            expect(response.type).toBe(type)
            expect(response.institution).toEqual(institution)
        })
    })
    
})