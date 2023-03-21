import { CreditCardAccount, CreditCardInvoice, Institution, User } from "@/entities"
import { InvalidCreditCardInvoiceError } from "@/entities/errors"

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

    const closeDate = new Date('2023-02-03')
    const dueDate = new Date('2023-02-10')
    const amount = 6000

    describe('create', () => {
    
        test("should not create an invoice if dueDate is before close date", () => {
            const account: CreditCardAccount = CreditCardAccount.create({name: accountName, balance: accountBalance, imageUrl, user, institution, creditCardInfo}).value as CreditCardAccount
            const validInvoice = {
                closeDate: new Date('2023-03-10'),
                dueDate: new Date('2023-02-28'),
                amount,
                account,
            }
            const response = CreditCardInvoice.create(validInvoice).value as Error
            expect(response).toBeInstanceOf(InvalidCreditCardInvoiceError)
        }) 
    
        test("should not create an invoice if diference between due date and close date is bigger than 10 days", () => {
            const account: CreditCardAccount = CreditCardAccount.create({name: accountName, balance: accountBalance, imageUrl, user, institution, creditCardInfo}).value as CreditCardAccount
            const validInvoice = {
                closeDate: new Date('2023-10-21'),
                dueDate: new Date('2023-11-01'),
                amount,
                account,
            }
            const response = CreditCardInvoice.create(validInvoice).value as Error
            expect(response).toBeInstanceOf(InvalidCreditCardInvoiceError)
        }) 
    
        test("should create an invoice if diference between dueDate and close date is less or equal than 10 days", () => {
            const account: CreditCardAccount = CreditCardAccount.create({name: accountName, balance: accountBalance, imageUrl, user, institution, creditCardInfo}).value as CreditCardAccount
            const validInvoice = {
                closeDate: new Date('2023-10-22'),
                dueDate: new Date('2023-11-01'),
                amount,
                account,
            }
            const response = CreditCardInvoice.create(validInvoice).value as CreditCardInvoice
            expect(response.closeDate).toEqual(new Date('2023-10-22'))
            expect(response.dueDate).toEqual(new Date('2023-11-01'))
            expect(response.amount.value).toEqual(amount)
            expect(response.account.name).toEqual(account.name)
        }) 
    
        test("should create an invoice with valid fields", () => {
            const account: CreditCardAccount = CreditCardAccount.create({name: accountName, balance: accountBalance, imageUrl, user, institution, creditCardInfo}).value as CreditCardAccount
            const validInvoice = {
                closeDate: new Date(closeDate),
                dueDate: new Date(dueDate),
                amount,
                account,
            }
            const response = CreditCardInvoice.create(validInvoice).value as CreditCardInvoice
            expect(response.closeDate).toEqual(new Date(closeDate))
            expect(response.dueDate).toEqual(new Date(dueDate))
            expect(response.amount.value).toEqual(amount)
            expect(response.account.name).toEqual(account.name)
        }) 
    })

    test.todo('should not add a transaction witch date is out of invoice date range (before date, exact date, after date)')
    test.todo('should not add a transaction type "pagamento de cartão" to invoice balance')
    test.todo('should add a transaction (expense, income) and update invoice balance')
    test.todo('should remove a transaction (expense, income) and update invoice balance')
})