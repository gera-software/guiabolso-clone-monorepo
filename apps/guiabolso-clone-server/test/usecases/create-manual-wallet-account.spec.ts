import { User } from "@/entities"
import { InvalidNameError } from "@/entities/errors"

describe('Create manual wallet account use case', () => {
    test('should not create account if name is invalid', async () => {
        // const name = ''
        // const balance = 0
        // const imageUrl = 'valid image url'

        // const user = User.create({
        //     name: 'user name',
        //     email: 'user email',
        //     password: 'user password',
        // }).value as User

        // const createManualWalletRequest = {
        //     name,
        //     balance,
        //     imageUrl,
        //     user
        // }

        // const accountRepository = new InMemoryAccountRepository([])
        // const sut = new CreateManualWalletAccount(accountRepository)
        // const response = (await sut.perform(createManualWalletRequest)).value as Error
        // expect(response).toBeInstanceOf(InvalidNameError)
    })
})