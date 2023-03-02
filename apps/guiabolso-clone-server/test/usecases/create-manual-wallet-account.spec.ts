import { InvalidBalanceError, InvalidNameError } from "@/entities/errors"
import { CreateManualWalletAccount } from "@/usecases/create-manual-wallet-account"
import { UnregisteredUserError } from "@/usecases/errors"
import { AccountData, WalletAccountData } from "@/usecases/ports"
import { InMemoryAccountRepository, InMemoryUserRepository } from "@test/doubles/repositories"

describe('Create manual wallet account use case', () => {
    test('should not create account if user is invalid', async () => {
        const type = 'WALLET'
        const name = 'valid account'
        const balance = 245
        const imageUrl = 'valid image url'
        const userId = 'invalid user'

        const createManualWalletRequest: WalletAccountData = {
            type,
            name,
            balance,
            imageUrl,
            userId,
        }

        const accountRepository = new InMemoryAccountRepository([])
        const userRepository = new InMemoryUserRepository([])
        const sut = new CreateManualWalletAccount(accountRepository, userRepository)
        const response = (await sut.perform(createManualWalletRequest)).value as Error
        expect(response).toBeInstanceOf(UnregisteredUserError)
    })
    
    test('should not create account if name is invalid', async () => {
        const type = 'WALLET'
        const name = ''
        const balance = 0
        const imageUrl = 'valid image url'
        const userId = 'valid user id'

        const createManualWalletRequest: WalletAccountData = {
            type,
            name,
            balance,
            imageUrl,
            userId,
        }

        const accountRepository = new InMemoryAccountRepository([])
        const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
        const sut = new CreateManualWalletAccount(accountRepository, userRepository)
        const response = (await sut.perform(createManualWalletRequest)).value as Error
        expect(response).toBeInstanceOf(InvalidNameError)
    })

    test('should not create account if balance is invalid', async () => {
        const type = 'WALLET'
        const name = 'valid account'
        const balance = 0.67
        const imageUrl = 'valid image url'
        const userId = 'valid user id'

        const createManualWalletRequest: WalletAccountData = {
            type,
            name,
            balance,
            imageUrl,
            userId,
        }

        const accountRepository = new InMemoryAccountRepository([])
        const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
        const sut = new CreateManualWalletAccount(accountRepository, userRepository)
        const response = (await sut.perform(createManualWalletRequest)).value as Error
        expect(response).toBeInstanceOf(InvalidBalanceError)
    })

    test('should create account if all params are valid', async () => {
        const type = 'WALLET'
        const name = 'valid account'
        const balance = 678
        const imageUrl = 'valid image url'
        const userId = 'valid user id'

        const createManualWalletRequest: WalletAccountData = {
            type,
            name,
            balance,
            imageUrl,
            userId,
        }

        const accountRepository = new InMemoryAccountRepository([])
        const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
        const sut = new CreateManualWalletAccount(accountRepository, userRepository)
        const response = (await sut.perform(createManualWalletRequest)).value as AccountData

        const addedAccount = await accountRepository.exists(response.id)
        expect(addedAccount).toBeTruthy()
        expect(response.id).toBeTruthy()
    })
})