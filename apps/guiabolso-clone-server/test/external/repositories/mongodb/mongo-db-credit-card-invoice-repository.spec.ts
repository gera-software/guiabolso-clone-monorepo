import { MongodbCreditCardInvoiceRepository } from "@/external/repositories/mongodb"
import { MongoHelper } from "@/external/repositories/mongodb/helper"
import { CreditCardInvoiceData } from "@/usecases/ports"
import { ObjectId } from "mongodb"
import * as sinon from 'sinon'

describe('Mongodb Credit Card Invoice repository', () => {
    const validClosingDate = new Date('2023-03-03')
    const validDueDate = new Date('2023-03-10')
    const validUserId = new ObjectId();
    const validAccountId = new ObjectId();

    beforeAll(async () => {
        await MongoHelper.connect(process.env.MONGO_URL)
    })

    afterAll(async () => {
        await MongoHelper.disconnect()
    })

    beforeEach(async () => {
        await MongoHelper.clearCollection('credit_card_invoices')
    })

    test('when invoice is added it should exists', async () => {
        const sut = new MongodbCreditCardInvoiceRepository()
        const invoice: CreditCardInvoiceData = {
            dueDate: validDueDate,
            closeDate: validClosingDate,
            amount: 0,
            userId: validUserId.toString(),
            accountId: validAccountId.toString(),
            _isDeleted: false
        }

        const addedInvoice = await sut.add(invoice)
        expect(addedInvoice.userId).toBe(validUserId.toString())
        expect(addedInvoice.accountId).toBe(validAccountId.toString())

        const exists = await sut.exists(addedInvoice.id)
        expect(exists).toBeTruthy()
    })

    test('when an invoice is not find by id, should return null', async () => {
        const notFoundId = '62f95f4a93d61d8fff971668'
        const sut = new MongodbCreditCardInvoiceRepository()
        const result = await sut.findById(notFoundId)
        expect(result).toBeNull()
    })

    test('when a invoice is find by id, should return the invoice', async () => {
        const sut = new MongodbCreditCardInvoiceRepository()
        const invoice: CreditCardInvoiceData = {
            dueDate: validDueDate,
            closeDate: validClosingDate,
            amount: 0,
            userId: validUserId.toString(),
            accountId: validAccountId.toString(),
            _isDeleted: false
        }
        const addedInvoice = await sut.add(invoice)

        const result = await sut.findById(addedInvoice.id) as CreditCardInvoiceData
        expect(result).not.toBeNull()
        expect(result.id).toBe(addedInvoice.id)
        expect(result.dueDate).toEqual(invoice.dueDate)
        expect(result.closeDate).toEqual(invoice.closeDate)
        expect(result.amount).toBe(invoice.amount)
        expect(result.userId).toBe(invoice.userId)
        expect(result.accountId).toBe(invoice.accountId)
        expect(result._isDeleted).toBe(invoice._isDeleted)
    })

    test('should update amount', async () => {
        const sut = new MongodbCreditCardInvoiceRepository()
        const invoice: CreditCardInvoiceData = {
            dueDate: validDueDate,
            closeDate: validClosingDate,
            amount: 0,
            userId: validUserId.toString(),
            accountId: validAccountId.toString(),
            _isDeleted: false
        }
        const addedInvoice = await sut.add(invoice)
        const newAmount = 4567

        await sut.updateAmount(addedInvoice.id, newAmount)

        const updatedInvoice = await sut.findById(addedInvoice.id)
        expect(updatedInvoice.amount).toBe(newAmount)
    })

    test('should batch update amounts', async () => {
        const sut = new MongodbCreditCardInvoiceRepository()
        const invoice0: CreditCardInvoiceData = {
            dueDate: validDueDate,
            closeDate: validClosingDate,
            amount: 0,
            userId: validUserId.toString(),
            accountId: validAccountId.toString(),
            _isDeleted: false
        }
        const addedInvoice0 = await sut.add(invoice0)
        const newAmount = 4567

        await sut.batchUpdateAmount([
            { invoiceId: addedInvoice0.id, amount: newAmount }
        ])

        const updatedInvoice0 = await sut.findById(addedInvoice0.id)
        expect(updatedInvoice0.amount).toBe(newAmount)
    })

    test('should find invoice by month\'s due date', async () => {
        const sut = new MongodbCreditCardInvoiceRepository()
        const invoice1: CreditCardInvoiceData = {
            dueDate: validDueDate,
            closeDate: validClosingDate,
            amount: 0,
            userId: validUserId.toString(),
            accountId: validAccountId.toString(),
            _isDeleted: false
        }
        const invoice2: CreditCardInvoiceData = {
            dueDate: validDueDate,
            closeDate: validClosingDate,
            amount: 0,
            userId: validUserId.toString(),
            accountId: new ObjectId().toString(),
            _isDeleted: false
        }
        const addedInvoice1 = await sut.add(invoice1)
        const addedInvoice2 = await sut.add(invoice2)

        const result = await sut.findByDueDate(new Date('2023-03-18'), validAccountId.toString())
        expect(result.id).toBe(addedInvoice1.id)
    })

    test('should return null when invoice is not find by month\'s due date', async () => {
        const sut = new MongodbCreditCardInvoiceRepository()

        const result = await sut.findByDueDate(new Date('2023-03-18'), validAccountId.toString())
        expect(result).toBeNull()

    })

    test('should find the last closed invoice', async () => {
        const clock = sinon.useFakeTimers(new Date('2023-03-04'))

        const sut = new MongodbCreditCardInvoiceRepository()
        const invoice1: CreditCardInvoiceData = {
            closeDate: new Date('2023-02-03'),
            dueDate: new Date('2023-02-10'),
            amount: 0,
            userId: validUserId.toString(),
            accountId: validAccountId.toString(),
            _isDeleted: false
        }
        const invoice2: CreditCardInvoiceData = {
            closeDate: new Date('2023-03-03'),
            dueDate: new Date('2023-03-10'),
            amount: 0,
            userId: validUserId.toString(),
            accountId: validAccountId.toString(),
            _isDeleted: false
        }
        const invoice3: CreditCardInvoiceData = {
            closeDate: new Date('2023-04-03'),
            dueDate: new Date('2023-04-10'),
            amount: 0,
            userId: validUserId.toString(),
            accountId: validAccountId.toString(),
            _isDeleted: false
        }
        const addedInvoice1 = await sut.add(invoice1)
        const addedInvoice2 = await sut.add(invoice2)
        const addedInvoice3 = await sut.add(invoice3)

        const result = await sut.getLastClosedInvoice(validAccountId.toString())
        expect(result.id).toBe(addedInvoice2.id)
        clock.restore()
    })

    test('should return null if not find last closed invoice', async () => {
        const sut = new MongodbCreditCardInvoiceRepository()

        const result = await sut.getLastClosedInvoice(validAccountId.toString())
        expect(result).toBeNull()
    })
})