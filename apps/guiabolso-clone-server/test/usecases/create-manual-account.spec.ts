import { CreateManualAccount } from "@/usecases/create-manual-account"
import { CreateManualBankAccount } from "@/usecases/create-manual-bank-account"
import { CreateManualCreditCardAccount } from "@/usecases/create-manual-credit-card-account"
import { CreateManualWalletAccount } from "@/usecases/create-manual-wallet-account"
import { AccountData, BankAccountData, CreditCardAccountData, CreditCardInfoData, InstitutionData, WalletAccountData } from "@/usecases/ports"
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
            const createManualCreditCardAccount = new CreateManualCreditCardAccount(accountRepository, userRepository, institutionRepository)
            
            const sut = new CreateManualAccount(createManualWalletAccount, createManualBankAccount, createManualCreditCardAccount)
            const response = (await sut.perform(createManualWalletRequest)).value as AccountData
    
            const addedAccount = await accountRepository.exists(response.id)
            expect(addedAccount).toBeTruthy()
            expect(response.syncType).toBe(syncType)
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
            const createManualCreditCardAccount = new CreateManualCreditCardAccount(accountRepository, userRepository, institutionRepository)
            
            const sut = new CreateManualAccount(createManualWalletAccount, createManualBankAccount, createManualCreditCardAccount)

            const response = (await sut.perform(createManualBankRequest)).value as AccountData
    
            const addedAccount = await accountRepository.exists(response.id)
            expect(addedAccount).toBeTruthy()
            expect(response.id).toBeTruthy()
            expect(response.syncType).toBe(syncType)
            expect(response.type).toBe(type)
            expect(response.institution).toEqual(institution)
        })
    })
    
    describe('manual credit card account', () => {
        test('should create manual credit card account if all params are valid', async () => {
            const type = 'CREDIT_CARD'
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
            const creditCardInfo: CreditCardInfoData = {
                brand: "master card",
                creditLimit: 100000,
                availableCreditLimit: 50000,
                closeDay: 3,
                dueDay: 10
            }
    
            const createManualCreditCardRequest: CreditCardAccountData = {
                type,
                syncType,
                name,
                balance,
                userId,
                imageUrl,
                institution,
                creditCardInfo,
            }
    
            const accountRepository = new InMemoryAccountRepository([])
            const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
            const institutionRepository = new InMemoryInstitutionRepository([institution])
            const createManualWalletAccount = new CreateManualWalletAccount(accountRepository, userRepository)
            const createManualBankAccount = new CreateManualBankAccount(accountRepository, userRepository, institutionRepository)
            const createManualCreditCardAccount = new CreateManualCreditCardAccount(accountRepository, userRepository, institutionRepository)
            
            const sut = new CreateManualAccount(createManualWalletAccount, createManualBankAccount, createManualCreditCardAccount)
            const response = (await sut.perform(createManualCreditCardRequest)).value as AccountData
    
            const addedAccount = await accountRepository.exists(response.id)
            expect(addedAccount).toBeTruthy()
            expect(response.id).toBeTruthy()
            expect(response.syncType).toBe(syncType)
            expect(response.type).toBe(type)
            expect(response.institution).toEqual(institution)
            expect(response.creditCardInfo).toEqual(creditCardInfo)
        })
    })
})