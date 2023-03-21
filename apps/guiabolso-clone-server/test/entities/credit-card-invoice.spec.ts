import { CreditCardAccount, CreditCardInvoice, Institution, User } from "@/entities"

describe("Credit Card Invoice entity", () => {
    const accountName = 'valid name'
    const accountBalance = 300
    const imageUrl = 'valid image url'
    const creditCardInfo = {
        brand: 'Master Card',
        creditLimit: 100000,
        availableCreditLimit: 50000,
        closeDay: 3,
        dueDay: 10,
    }
    const user = User.create({
        name: 'user name',
        email: 'user@email.com',
        password: 'user password',
    }).value as User

    const institution = Institution.create({
        id: 'valid id', 
        name: 'valid name', 
        type: "PERSONAL_BANK", 
        imageUrl: 'valid url', 
        primaryColor: 'valid color', 
        providerConnectorId: 'valid id'
    }).value as Institution

    const closeDate = new Date('2023-02-10')
    const dueDate = new Date('2023-02-03')
    const amount = 6000

    test("should create an invoice with valid fields", () => {
        const account: CreditCardAccount = CreditCardAccount.create({name: accountName, balance: accountBalance, imageUrl, user, institution, creditCardInfo}).value as CreditCardAccount
        const validInvoice = {
            closeDate,
            dueDate,
            amount,
            account,
        }
        const response = CreditCardInvoice.create(validInvoice).value as CreditCardInvoice
        expect(response.closeDate.toISOString()).toEqual(closeDate.toISOString())
        expect(response.dueDate.toISOString()).toEqual(dueDate.toISOString())
        expect(response.amount.value).toEqual(amount)
        expect(response.account.name).toEqual(account.name)
    }) 
})