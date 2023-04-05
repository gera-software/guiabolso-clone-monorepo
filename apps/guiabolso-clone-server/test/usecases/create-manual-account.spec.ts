import { CreateManualAccount } from "@/usecases/create-manual-account"
import { CreateManualWalletAccount } from "@/usecases/create-manual-wallet-account"
import { AccountData, WalletAccountData } from "@/usecases/ports"
import { InMemoryAccountRepository, InMemoryUserRepository } from "@test/doubles/repositories"

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
            const createManualWalletAccount = new CreateManualWalletAccount(accountRepository, userRepository)
            const sut = new CreateManualAccount(createManualWalletAccount)

            const response = (await sut.perform(createManualWalletRequest)).value as AccountData
    
            const addedAccount = await accountRepository.exists(response.id)
            expect(addedAccount).toBeTruthy()
            expect(response.id).toBeTruthy()
        })
    })
})