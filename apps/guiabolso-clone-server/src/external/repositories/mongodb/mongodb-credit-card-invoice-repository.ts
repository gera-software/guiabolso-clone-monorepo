import { CreditCardInvoiceData, CreditCardInvoiceRepository } from "@/usecases/ports";
import { ObjectId } from "mongodb";
import { MongoHelper } from "@/external/repositories/mongodb/helper";

export type MongodbCreditCardInvoice = {
    _id?: ObjectId,
    dueDate: Date,
    closeDate: Date,
    amount: number,
    userId: ObjectId,
    accountId: ObjectId,
    _isDeleted: boolean,
}

export class MongodbCreditCardInvoiceRepository implements CreditCardInvoiceRepository {

    async add(invoice: CreditCardInvoiceData): Promise<CreditCardInvoiceData> {
        const invoiceCollection = MongoHelper.getCollection('invoices')

        const invoiceClone: MongodbCreditCardInvoice = {
            dueDate: invoice.dueDate,
            closeDate: invoice.closeDate,
            amount: invoice.amount,
            userId: new ObjectId(invoice.userId),
            accountId: new ObjectId(invoice.accountId),
            _isDeleted: !!invoice._isDeleted
        }

        const { insertedId } = await invoiceCollection.insertOne(invoiceClone)

        return this.findById(insertedId.toString())

    }
    
    async findById(id: string): Promise<CreditCardInvoiceData> {
        const invoiceCollection = MongoHelper.getCollection('invoices')
        const invoice = await invoiceCollection.findOne<MongodbCreditCardInvoice>({ _id: new ObjectId(id) })
        if(invoice) {
            return this.withApplicationId(invoice)
        }
        return null
    }
    
    async findByDueDate(date: Date, accountId: string): Promise<CreditCardInvoiceData> {
        const invoiceCollection = MongoHelper.getCollection('invoices')

        const invoice = await invoiceCollection.findOne<MongodbCreditCardInvoice>({ 
            $and: [
                { accountId: new ObjectId(accountId) },
                { $expr: { $eq: [{ $year: "$dueDate" }, date.getFullYear()] } },
                { $expr: { $eq: [{ $month: "$dueDate" }, date.getUTCMonth() + 1] } },
            ]
        });

        if(invoice) {
            return this.withApplicationId(invoice)
        }
        return null
    }
    
    async getLastClosedInvoice(accountId: string): Promise<CreditCardInvoiceData> {
        const invoiceCollection = MongoHelper.getCollection('invoices')

        // const c = new Date()
        const currentDate = new Date()
        // const currentDate = new Date(Date.UTC(c.getFullYear(), c.getMonth(), c.getDate()))
        // console.log('c DATE', c.toISOString())
        // console.log('CURRENT DATE', currentDate.toISOString())

        const result = await invoiceCollection.aggregate([
            {
                $match: { 
                    accountId: new ObjectId(accountId),
                    closeDate: { $lte: currentDate } 
                }
            },
            {
                $sort: { closeDate: -1 }
            }, 
            {
                $limit: 1
            }
        ]).toArray() as MongodbCreditCardInvoice[]

        console.log(result)

        if(result.length) {
            return this.withApplicationId(result[0])
        }
        
        return null
    }
    
    async exists(id: string): Promise<boolean> {
        const result = await this.findById(id)
        if(result != null) {
            return true
        }
        return false
    }
    
    async updateAmount(id: string, amount: number): Promise<void> {
        const invoiceCollection = MongoHelper.getCollection('invoices')

        const updateDoc = {
            $set: {
              amount,
            },
        };

        await invoiceCollection.updateOne({ _id: new ObjectId(id) }, updateDoc)
    }

    private withApplicationId(dbInvoice: MongodbCreditCardInvoice): CreditCardInvoiceData {
        return {
            id: dbInvoice._id.toString(),
            dueDate: dbInvoice.dueDate,
            closeDate: dbInvoice.closeDate,
            amount: dbInvoice.amount,
            userId: dbInvoice.userId.toString(),
            accountId: dbInvoice.accountId.toString(),
            _isDeleted: !!dbInvoice._isDeleted,  
        }
    }
    
}