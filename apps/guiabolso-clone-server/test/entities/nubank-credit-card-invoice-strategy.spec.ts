import { NubankCreditCardInvoiceStrategy } from "@/entities"

describe("Nubank credit card invoice strategy entity", () => {
    let sut: NubankCreditCardInvoiceStrategy
    
    beforeAll(() => {
        sut = new NubankCreditCardInvoiceStrategy()
    })

    describe('calculate invoice due date from transaction', () => {

        describe('due date on start of month', () => {
            test('transactions before closing date should belong to current month\'s invoice', () => {
                const validClosingDate = new Date('2023-10-25')
                const validDueDate = new Date('2023-11-01')
                
                const creditCardCloseDay = validClosingDate.getUTCDate()
                const creditCardDueDay = validDueDate.getUTCDate()
                const transactionDate = new Date('2023-10-24')
                const { invoiceDueDate, invoiceClosingDate } = sut.calculateInvoiceDatesFromTransaction(transactionDate, creditCardCloseDay, creditCardDueDay)
                expect(invoiceDueDate).toEqual(validDueDate)
                expect(invoiceClosingDate).toEqual(validClosingDate)
            })

            test('transactions on closing date should belong to next month\'s invoice', () => {
                const validClosingDate = new Date('2023-11-25')
                const validDueDate = new Date('2023-12-01')
    
                const creditCardCloseDay = validClosingDate.getUTCDate()
                const creditCardDueDay = validDueDate.getUTCDate()
                const transactionDate = new Date('2023-10-25')
                const { invoiceDueDate, invoiceClosingDate } = sut.calculateInvoiceDatesFromTransaction(transactionDate, creditCardCloseDay, creditCardDueDay)
                expect(invoiceDueDate).toEqual(validDueDate)
                expect(invoiceClosingDate).toEqual(validClosingDate)
            })
    
            test('transactions after closing date should belong to next month\'s invoice', () => {
                const validClosingDate = new Date('2023-11-25')
                const validDueDate = new Date('2023-12-01')
    
                const creditCardCloseDay = validClosingDate.getUTCDate()
                const creditCardDueDay = validDueDate.getUTCDate()
                const transactionDate = new Date('2023-10-26')
                const { invoiceDueDate, invoiceClosingDate } = sut.calculateInvoiceDatesFromTransaction(transactionDate, creditCardCloseDay, creditCardDueDay)
                expect(invoiceDueDate).toEqual(validDueDate)
                expect(invoiceClosingDate).toEqual(validClosingDate)
            })
        })

        describe('due date on middle of month', () => {
            test('transactions before closing date should belong to current month\'s invoice', () => {
                const validClosingDate = new Date('2023-01-03')
                const validDueDate = new Date('2023-01-10')

                const creditCardCloseDay = validClosingDate.getUTCDate()
                const creditCardDueDay = validDueDate.getUTCDate()
                const transactionDate = new Date('2023-01-02')
                const { invoiceDueDate, invoiceClosingDate } = sut.calculateInvoiceDatesFromTransaction(transactionDate, creditCardCloseDay, creditCardDueDay)
                expect(invoiceDueDate).toEqual(validDueDate)
                expect(invoiceClosingDate).toEqual(validClosingDate)
            })

            test('transactions on closing date should belong to next month\'s invoice', () => {
                const validClosingDate = new Date('2023-02-03')
                const validDueDate = new Date('2023-02-10')
    
                const creditCardCloseDay = validClosingDate.getUTCDate()
                const creditCardDueDay = validDueDate.getUTCDate()
                const transactionDate = new Date('2023-01-03')
                const { invoiceDueDate, invoiceClosingDate } = sut.calculateInvoiceDatesFromTransaction(transactionDate, creditCardCloseDay, creditCardDueDay)
                expect(invoiceDueDate).toEqual(validDueDate)
                expect(invoiceClosingDate).toEqual(validClosingDate)
            })
    
            test('transactions after closing date should belong to next month\'s invoice', () => {
                const validClosingDate = new Date('2023-02-03')
                const validDueDate = new Date('2023-02-10')

                const creditCardCloseDay = validClosingDate.getUTCDate()
                const creditCardDueDay = validDueDate.getUTCDate()
                const transactionDate = new Date('2023-01-04')
                const { invoiceDueDate, invoiceClosingDate } = sut.calculateInvoiceDatesFromTransaction(transactionDate, creditCardCloseDay, creditCardDueDay)
                expect(invoiceDueDate).toEqual(validDueDate)
                expect(invoiceClosingDate).toEqual(validClosingDate)
            })
        })

        describe('due date on end of month', () => {
            test('transactions before closing date should belong to current month\'s invoice', () => {
                const validClosingDate = new Date('2023-01-20')
                const validDueDate = new Date('2023-01-27')
    
                const creditCardCloseDay = validClosingDate.getUTCDate()
                const creditCardDueDay = validDueDate.getUTCDate()
                const transactionDate = new Date('2023-01-19')
                const { invoiceDueDate, invoiceClosingDate } = sut.calculateInvoiceDatesFromTransaction(transactionDate, creditCardCloseDay, creditCardDueDay)
                expect(invoiceDueDate).toEqual(validDueDate)
                expect(invoiceClosingDate).toEqual(validClosingDate)
            })

            test('transactions on closing date should belong to next month\'s invoice', () => {
                const validClosingDate = new Date('2023-02-20')
                const validDueDate = new Date('2023-02-27')
    
                const creditCardCloseDay = validClosingDate.getUTCDate()
                const creditCardDueDay = validDueDate.getUTCDate()
                const transactionDate = new Date('2023-01-20')
                const { invoiceDueDate, invoiceClosingDate } = sut.calculateInvoiceDatesFromTransaction(transactionDate, creditCardCloseDay, creditCardDueDay)
                expect(invoiceDueDate).toEqual(validDueDate)
                expect(invoiceClosingDate).toEqual(validClosingDate)
            })
    
            test('transactions after closing date should belong to next month\'s invoice', () => {
                const validClosingDate = new Date('2023-02-20')
                const validDueDate = new Date('2023-02-27')
    
                const creditCardCloseDay = validClosingDate.getUTCDate()
                const creditCardDueDay = validDueDate.getUTCDate()
                const transactionDate = new Date('2023-01-21')
                const { invoiceDueDate, invoiceClosingDate } = sut.calculateInvoiceDatesFromTransaction(transactionDate, creditCardCloseDay, creditCardDueDay)
                expect(invoiceDueDate).toEqual(validDueDate)
                expect(invoiceClosingDate).toEqual(validClosingDate)
            })
        })

        describe('at the end of the year', () => {
            test('transactions before closing date should belong to current month\'s invoice', () => {
                const validClosingDate = new Date('2023-11-25')
                const validDueDate = new Date('2023-12-01')
    
                const creditCardCloseDay = validClosingDate.getUTCDate()
                const creditCardDueDay = validDueDate.getUTCDate()
                const transactionDate = new Date('2023-11-24')
                const { invoiceDueDate, invoiceClosingDate } = sut.calculateInvoiceDatesFromTransaction(transactionDate, creditCardCloseDay, creditCardDueDay)
                expect(invoiceDueDate).toEqual(validDueDate)
                expect(invoiceClosingDate).toEqual(validClosingDate)
            })

            test('transactions on closing date should belong to next month\'s invoice', () => {
                const validClosingDate = new Date('2023-12-25')
                const validDueDate = new Date('2024-01-01')
    
                const creditCardCloseDay = validClosingDate.getUTCDate()
                const creditCardDueDay = validDueDate.getUTCDate()
                const transactionDate = new Date('2023-11-25')
                const { invoiceDueDate, invoiceClosingDate } = sut.calculateInvoiceDatesFromTransaction(transactionDate, creditCardCloseDay, creditCardDueDay)
                expect(invoiceDueDate).toEqual(validDueDate)
                expect(invoiceClosingDate).toEqual(validClosingDate)
            })
    
            test('transactions after closing date should belong to next month\'s invoice', () => {
                const validClosingDate = new Date('2023-12-25')
                const validDueDate = new Date('2024-01-01')

                const creditCardCloseDay = validClosingDate.getUTCDate()
                const creditCardDueDay = validDueDate.getUTCDate()
                const transactionDate = new Date('2023-11-26')
                const { invoiceDueDate, invoiceClosingDate } = sut.calculateInvoiceDatesFromTransaction(transactionDate, creditCardCloseDay, creditCardDueDay)
                expect(invoiceDueDate).toEqual(validDueDate)
                expect(invoiceClosingDate).toEqual(validClosingDate)
            })

            test('transactions before closing date should belong to current month\'s invoice (2)', () => {
                const validClosingDate = new Date('2023-12-25')
                const validDueDate = new Date('2024-01-01')

                const creditCardCloseDay = validClosingDate.getUTCDate()
                const creditCardDueDay = validDueDate.getUTCDate()
                const transactionDate = new Date('2023-12-24')
                const { invoiceDueDate, invoiceClosingDate } = sut.calculateInvoiceDatesFromTransaction(transactionDate, creditCardCloseDay, creditCardDueDay)
                expect(invoiceDueDate).toEqual(validDueDate)
                expect(invoiceClosingDate).toEqual(validClosingDate)
            })

            test('transactions on closing date should belong to next month\'s invoice (2)', () => {
                const validClosingDate = new Date('2024-01-25')
                const validDueDate = new Date('2024-02-01')
    
                const creditCardCloseDay = validClosingDate.getUTCDate()
                const creditCardDueDay = validDueDate.getUTCDate()
                const transactionDate = new Date('2023-12-25')
                const { invoiceDueDate, invoiceClosingDate } = sut.calculateInvoiceDatesFromTransaction(transactionDate, creditCardCloseDay, creditCardDueDay)
                expect(invoiceDueDate).toEqual(validDueDate)
                expect(invoiceClosingDate).toEqual(validClosingDate)
            })
    
            test('transactions after closing date should belong to next month\'s invoice (2)', () => {
                const validClosingDate = new Date('2024-01-25')
                const validDueDate = new Date('2024-02-01')

                const creditCardCloseDay = validClosingDate.getUTCDate()
                const creditCardDueDay = validDueDate.getUTCDate()
                const transactionDate = new Date('2023-12-26')
                const { invoiceDueDate, invoiceClosingDate } = sut.calculateInvoiceDatesFromTransaction(transactionDate, creditCardCloseDay, creditCardDueDay)
                expect(invoiceDueDate).toEqual(validDueDate)
                expect(invoiceClosingDate).toEqual(validClosingDate)
            })
        })
    })
})