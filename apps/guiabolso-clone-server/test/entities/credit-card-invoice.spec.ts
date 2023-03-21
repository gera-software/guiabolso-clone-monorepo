import { Category, CreditCardAccount, CreditCardInvoice, CreditCardTransaction, Institution, TransactionType, User } from "@/entities"
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

    describe('add transaction', () => {

        test('should add a transaction (expense) and update invoice total amount', () => {
            const account: CreditCardAccount = CreditCardAccount.create({name: accountName, balance: accountBalance, imageUrl, user, institution, creditCardInfo}).value as CreditCardAccount
            
            const closeDate = new Date('2023-02-03')
            const dueDate = new Date('2023-02-10')

            const validInvoice = {
                closeDate: new Date(closeDate),
                dueDate: new Date(dueDate),
                amount,
                account,
            }

            const creditCardInvoice = CreditCardInvoice.create(validInvoice).value as CreditCardInvoice

            const transactionAmount = -1900
            const description = 'transaction description'
            const transactionDate = new Date('2023-02-10')
            const invoiceDate = new Date('2023-01-23')
            const type: TransactionType = 'EXPENSE'
            const comment = 'comentario válido'
            const ignored = true
            const transaction = CreditCardTransaction.create({ amount: transactionAmount, description, transactionDate, invoiceDate, comment, ignored }).value as CreditCardTransaction
            
            creditCardInvoice.addTransaction(transaction)
            expect(creditCardInvoice.amount.value).toBe(amount + transactionAmount)
        })

        test('should add a transaction (income) and update invoice total amount', () => {
            const account: CreditCardAccount = CreditCardAccount.create({name: accountName, balance: accountBalance, imageUrl, user, institution, creditCardInfo}).value as CreditCardAccount
            
            const closeDate = new Date('2023-02-03')
            const dueDate = new Date('2023-02-10')

            const validInvoice = {
                closeDate: new Date(closeDate),
                dueDate: new Date(dueDate),
                amount,
                account,
            }

            const creditCardInvoice = CreditCardInvoice.create(validInvoice).value as CreditCardInvoice

            const transactionAmount = 1900
            const description = 'transaction description'
            const transactionDate = new Date('2023-02-10')
            const invoiceDate = new Date('2023-01-23')
            const type: TransactionType = 'INCOME'
            const comment = 'comentario válido'
            const ignored = true
            const transaction = CreditCardTransaction.create({ amount: transactionAmount, description, transactionDate, invoiceDate, comment, ignored }).value as CreditCardTransaction
            
            creditCardInvoice.addTransaction(transaction)
            expect(creditCardInvoice.amount.value).toBe(amount + transactionAmount)
        })

        test('should add a transaction category "pagamento de cartão", but not update invoice balance', () => {
            const account: CreditCardAccount = CreditCardAccount.create({name: accountName, balance: accountBalance, imageUrl, user, institution, creditCardInfo}).value as CreditCardAccount
            
            const closeDate = new Date('2023-02-03')
            const dueDate = new Date('2023-02-10')

            const validInvoice = {
                closeDate: new Date(closeDate),
                dueDate: new Date(dueDate),
                amount,
                account,
            }

            const creditCardInvoice = CreditCardInvoice.create(validInvoice).value as CreditCardInvoice

            const transactionAmount = 1900
            const description = 'transaction description'
            const transactionDate = new Date('2023-02-10')
            const invoiceDate = new Date('2023-01-23')
            const type: TransactionType = 'INCOME'
            const comment = 'comentario válido'
            const ignored = true
            const category = Category.create({name: 'Pagamento de cartão', group: 'any group', iconName: 'icon name', primaryColor: 'primary color', ignored: true }).value as Category
            const transaction = CreditCardTransaction.create({ amount: transactionAmount, description, transactionDate, invoiceDate, category, comment, ignored }).value as CreditCardTransaction
            
            creditCardInvoice.addTransaction(transaction)
            expect(creditCardInvoice.amount.value).toBe(amount)
        })

    })

    describe('remove transaction', () => {
        test('should remove a transaction (expense) and update invoice total amount', () => {
            const account: CreditCardAccount = CreditCardAccount.create({name: accountName, balance: accountBalance, imageUrl, user, institution, creditCardInfo}).value as CreditCardAccount
            
            const closeDate = new Date('2023-02-03')
            const dueDate = new Date('2023-02-10')

            const validInvoice = {
                closeDate: new Date(closeDate),
                dueDate: new Date(dueDate),
                amount,
                account,
            }

            const creditCardInvoice = CreditCardInvoice.create(validInvoice).value as CreditCardInvoice

            const transactionAmount = -1900
            const description = 'transaction description'
            const transactionDate = new Date('2023-02-10')
            const invoiceDate = new Date('2023-01-23')
            const type: TransactionType = 'EXPENSE'
            const comment = 'comentario válido'
            const ignored = true
            const transaction = CreditCardTransaction.create({ amount: transactionAmount, description, transactionDate, invoiceDate, comment, ignored }).value as CreditCardTransaction
            
            creditCardInvoice.removeTransaction(transaction)
            expect(creditCardInvoice.amount.value).toBe(amount - transactionAmount)
        })

        test('should remove a transaction (income) and update invoice total amount', () => {
            const account: CreditCardAccount = CreditCardAccount.create({name: accountName, balance: accountBalance, imageUrl, user, institution, creditCardInfo}).value as CreditCardAccount
            
            const closeDate = new Date('2023-02-03')
            const dueDate = new Date('2023-02-10')

            const validInvoice = {
                closeDate: new Date(closeDate),
                dueDate: new Date(dueDate),
                amount,
                account,
            }

            const creditCardInvoice = CreditCardInvoice.create(validInvoice).value as CreditCardInvoice

            const transactionAmount = 1900
            const description = 'transaction description'
            const transactionDate = new Date('2023-02-10')
            const invoiceDate = new Date('2023-01-23')
            const type: TransactionType = 'INCOME'
            const comment = 'comentario válido'
            const ignored = true
            const transaction = CreditCardTransaction.create({ amount: transactionAmount, description, transactionDate, invoiceDate, comment, ignored }).value as CreditCardTransaction
            
            creditCardInvoice.removeTransaction(transaction)
            expect(creditCardInvoice.amount.value).toBe(amount - transactionAmount)
        })

        test('should remove a transaction category "pagamento de cartão", but not update invoice balance', () => {
            const account: CreditCardAccount = CreditCardAccount.create({name: accountName, balance: accountBalance, imageUrl, user, institution, creditCardInfo}).value as CreditCardAccount
            
            const closeDate = new Date('2023-02-03')
            const dueDate = new Date('2023-02-10')

            const validInvoice = {
                closeDate: new Date(closeDate),
                dueDate: new Date(dueDate),
                amount,
                account,
            }

            const creditCardInvoice = CreditCardInvoice.create(validInvoice).value as CreditCardInvoice

            const transactionAmount = 1900
            const description = 'transaction description'
            const transactionDate = new Date('2023-02-10')
            const invoiceDate = new Date('2023-01-23')
            const type: TransactionType = 'INCOME'
            const comment = 'comentario válido'
            const ignored = true
            const category = Category.create({name: 'Pagamento de cartão', group: 'any group', iconName: 'icon name', primaryColor: 'primary color', ignored: true }).value as Category
            const transaction = CreditCardTransaction.create({ amount: transactionAmount, description, transactionDate, invoiceDate, category, comment, ignored }).value as CreditCardTransaction
            
            creditCardInvoice.removeTransaction(transaction)
            expect(creditCardInvoice.amount.value).toBe(amount)
        })
    })
})