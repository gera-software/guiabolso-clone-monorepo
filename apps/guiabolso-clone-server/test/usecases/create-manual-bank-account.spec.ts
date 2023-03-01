import { InvalidNameError } from "@/entities/errors"
import { CreateManualBankAccount } from "@/usecases/create-manual-bank-account"
import { BankAccountData, InstitutionData } from "@/usecases/ports"
import { InMemoryAccountRepository, InMemoryUserRepository } from "@test/doubles/repositories"

describe('Create manual bank account use case', () => {
    test('should not create account if name is invalid', async () => {
        const name = ''
        const balance = 0
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
            name,
            balance,
            userId,
            imageUrl,
            institution,
        }

        const accountRepository = new InMemoryAccountRepository([])
        const userRepository = new InMemoryUserRepository([{ id: userId, name: 'any name', email: 'any@email.com', password: '123' }])
        const sut = new CreateManualBankAccount(accountRepository, userRepository)
        const response = (await sut.perform(createManualBankRequest)).value as Error
        expect(response).toBeInstanceOf(InvalidNameError)
    })
})