import { User } from "@/entities"
import { InvalidBalanceError, InvalidNameError } from "@/entities/errors"
import { CreateManualWalletAccount } from "@/usecases/create-manual-wallet-account"
import { InvalidUserError } from "@/usecases/errors"
import { AccountData, WalletAccountData } from "@/usecases/ports"
import { InMemoryAccountRepository, InMemoryUserRepository } from "@test/doubles/repositories"

describe('Create manual wallet account use case', () => {
    test('should not create account if name is invalid', async () => {
        const name = ''
        const balance = 0
        const imageUrl = 'valid image url'
        const userId = 'valid user'

        const createManualWalletRequest: WalletAccountData = {
            name,
            balance,
            imageUrl,
            userId,
        }

        const accountRepository = new InMemoryAccountRepository([])
        const userRepository = new InMemoryUserRepository([])
        const sut = new CreateManualWalletAccount(accountRepository, userRepository)
        const response = (await sut.perform(createManualWalletRequest)).value as Error
        expect(response).toBeInstanceOf(InvalidNameError)
    })

    test('should not create account if balance is invalid', async () => {
        const name = 'valid account'
        const balance = 0.67
        const imageUrl = 'valid image url'
        const userId = 'valid user'

        const createManualWalletRequest: WalletAccountData = {
            name,
            balance,
            imageUrl,
            userId,
        }

        const accountRepository = new InMemoryAccountRepository([])
        const userRepository = new InMemoryUserRepository([])
        const sut = new CreateManualWalletAccount(accountRepository, userRepository)
        const response = (await sut.perform(createManualWalletRequest)).value as Error
        expect(response).toBeInstanceOf(InvalidBalanceError)
    })

    test('should not create account if user is invalid', async () => {
        const name = 'valid account'
        const balance = 245
        const imageUrl = 'valid image url'
        const userId = 'invalid user'

        const createManualWalletRequest: WalletAccountData = {
            name,
            balance,
            imageUrl,
            userId,
        }

        const accountRepository = new InMemoryAccountRepository([])
        const userRepository = new InMemoryUserRepository([])
        const sut = new CreateManualWalletAccount(accountRepository, userRepository)
        const response = (await sut.perform(createManualWalletRequest)).value as Error
        expect(response).toBeInstanceOf(InvalidUserError)
    })

    // test('should create account if all params are valid', async () => {
    //     const name = 'valid account'
    //     const balance = 678
    //     const imageUrl = 'valid image url'

    //     const user = User.create({
    //         name: 'user name',
    //         email: 'user email',
    //         password: 'user password',
    //     }).value as User

    //     const createManualWalletRequest = {
    //         name,
    //         balance,
    //         imageUrl,
    //         user
    //     }

    //     const accountRepository = new InMemoryAccountRepository([])
    //     const sut = new CreateManualWalletAccount(accountRepository)
    //     const response = (await sut.perform(createManualWalletRequest)).value as AccountData
    //     expect(response.name).toBe(name)
    //     expect(response.balance).toBe(balance)
    //     expect(response.imageUrl).toBe(imageUrl)
    //     expect(response.userId).toBe(user)
    // })
})