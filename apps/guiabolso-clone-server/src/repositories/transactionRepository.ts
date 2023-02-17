import { connect, disconnect } from "../config/database";
import { Schema, model, Types, PipelineStage } from 'mongoose';
import { AccountSyncType, Category, CurrencyCodes, Transaction, TransactionSummary, TransactionType } from '../types'
import schema from "./schemas/transactionSchema";

const TransactionModel = model<Transaction>('transactions', schema);

/**
 * Get a not deleted transaction by id
 * @param id 
 * @returns 
 */
export async function getById(id: any): Promise<Transaction | null> {
    await connect();
    const result = await TransactionModel.findOne({ _id: id, _isDeleted: { $ne: true } });
    await disconnect();
    return result;
}

/**
 * Logical deletion of a transaction
 * @param id
 * @returns 
 */
export async function remove(id: any): Promise<Transaction | null> {
    await connect();
    const result = await TransactionModel.findOneAndUpdate({ _id: id }, { _isDeleted: true });
    await disconnect();
    return result;
}

/**
 * Fetch all (not deleted) transactions by account id in a given month
 * @param id 
 * @returns 
 */
export async function fetchByAccount(id: any, monthField: string, yearField: string, transactionType = 'ALL'): Promise<TransactionSummary[]> {
    await connect();

    const year = parseInt(yearField)
    const month = parseInt(monthField)

    const firstDay = new Date(`${year}-${(''+month).padStart(2, '0')}-01T00:00:00Z`)
    const lastDay = (month === 12) ? ( new Date(`${year + 1}-01-01T00:00:00Z`) ) : ( new Date(`${year}-${(''+(month + 1)).padStart(2, '0')}-01T00:00:00Z`) )
    
    console.log('FIRST DAY', firstDay.toISOString(),'LAST DAY', lastDay.toISOString())

    const types: string[] = transactionType == 'ALL' ? ['EXPENSE', 'INCOME'] : [transactionType]

    const result = await TransactionModel.aggregate([
            { $match: { 
                accountId: new Types.ObjectId(id), 
                _isDeleted: { $ne: true }, 
                date: { $gte: firstDay, $lt: lastDay },
                type: { $in: types },
              }
            },
            { $lookup: { 
                from: 'accounts', 
                localField: 'accountId', 
                foreignField: '_id', 
                as: 'account' 
                }
            },
            { $unwind: { 'path': '$account' } },
            { $project: {
                    _id: 1,
                    description: 1,
                    descriptionOriginal: 1,
                    amount: 1,
                    currencyCode: 1,
                    date: 1,
                    plainDate: 1,
                    creditCardDate: 1,
                    plainCreditCardDate: 1,
                    category: 1,
                    type: 1,
                    status: 1,
                    ignored: 1,
                    account: {
                        _id: 1,
                        name: 1,
                        type: 1,
                        imageUrl: 1
                    },
                    creditCardInvoiceId: 1,
                }
            },
            { $sort: { date: -1 } }
          ]) as TransactionSummary[];

    await disconnect();
    return result;
}

/**
 * Fetch all (not deleted) transactions by user id in a given month
 * @param id 
 * @returns 
 */
export async function fetchByUser(id: any, monthField: string, yearField: string, limit = 0, transactionType = 'ALL'): Promise<TransactionSummary[]> {
    
    await connect();

    const year = parseInt(yearField)
    const month = parseInt(monthField)

    const firstDay = new Date(`${year}-${(''+month).padStart(2, '0')}-01T00:00:00Z`)
    const lastDay = (month === 12) ? ( new Date(`${year + 1}-01-01T00:00:00Z`) ) : ( new Date(`${year}-${(''+(month + 1)).padStart(2, '0')}-01T00:00:00Z`) )
    
    console.log('FIRST DAY', firstDay.toISOString(),'LAST DAY', lastDay.toISOString())

    const types: string[] = transactionType == 'ALL' ? ['EXPENSE', 'INCOME'] : [transactionType]

    const pipeline: PipelineStage[] = []
    pipeline.push(
        { $match: { 
            userId: new Types.ObjectId(id), 
            _isDeleted: { $ne: true }, 
            date: { $gte: firstDay, $lt: lastDay },
            type: { $in: types },
         }
        },
        { $lookup: { 
            from: 'accounts', 
            localField: 'accountId', 
            foreignField: '_id', 
            as: 'account' 
            }
        },
        { $unwind: { 'path': '$account' } },
        { $project: {
                _id: 1,
                description: 1,
                descriptionOriginal: 1,
                amount: 1,
                currencyCode: 1,
                date: 1,
                plainDate: 1,
                creditCardDate: 1,
                plainCreditCardDate: 1,
                category: 1,
                type: 1,
                status: 1,
                ignored: 1,
                account: {
                    _id: 1,
                    name: 1,
                    type: 1,
                    imageUrl: 1
                },
                creditCardInvoiceId: 1,
            }
        },
        { $sort: { date: -1 } },
    )

    if(limit > 0) {
        pipeline.push({ $limit: limit })
    }

    const result = await TransactionModel.aggregate(pipeline) as TransactionSummary[];

    await disconnect();
    return result;
}

/**
 * Fetch all (not deleted) transactions linked to an credit card invoice
 * @param id 
 * @returns 
 */
export async function fetchByCreditCardInvoice(id: any): Promise<Transaction[]> {
    await connect();

    const result = await TransactionModel.aggregate([
            { $match: { 
                creditCardInvoiceId: new Types.ObjectId(id), 
                _isDeleted: { $ne: true }, 
              }
            },
            { $lookup: { 
                from: 'accounts', 
                localField: 'accountId', 
                foreignField: '_id', 
                as: 'account' 
                }
            },
            { $unwind: { 'path': '$account' } },
            { $project: {
                    _id: 1,
                    description: 1,
                    descriptionOriginal: 1,
                    amount: 1,
                    currencyCode: 1,
                    date: 1,
                    plainDate: 1,
                    creditCardDate: 1,
                    plainCreditCardDate: 1,
                    category: 1,
                    type: 1,
                    status: 1,
                    ignored: 1,
                    account: {
                        _id: 1,
                        name: 1,
                        type: 1,
                        imageUrl: 1
                    },
                    creditCardInvoiceId: 1,
                }
            },
            { $sort: { creditCardDate: -1 } }
          ]) as Transaction[];

    await disconnect();
    return result;
}

/**
 * Creates a transaction
 * @param transaction 
 * @returns 
 */
export async function create(transaction: Transaction | null): Promise<Transaction | null> {
    console.log('CREATE', transaction)
    await connect();
    const doc = new TransactionModel(transaction);
    const result = await doc.save();
    console.log('RESULT', result)
    await disconnect();

    return result;
}

/**
 * Replace one transaction
 * @param transaction 
 * @returns 
 */
export async function replaceOne(transaction: Transaction): Promise<Transaction | null> {
    await connect();
    const result = await TransactionModel.findOneAndReplace({ _id: transaction?._id }, transaction);
    await disconnect();

    return result;
}

export async function updateOne(transaction: Transaction): Promise<Transaction | null> {
    await connect();
    const doc = await TransactionModel.findById(transaction._id);

    if(doc) {
        doc.description = transaction.description
        doc.amount = transaction.amount
        doc.date = transaction.date
        doc.creditCardDate = transaction.creditCardDate
        doc.plainCreditCardDate = transaction.plainCreditCardDate
        doc.category = transaction.category
        doc.accountId = transaction.accountId
        doc.type = transaction.type
        doc.creditCardInvoiceId = transaction.creditCardInvoiceId,
        doc.comment = transaction.comment
        doc.ignored = transaction.ignored
        await doc.save();
    }

    await disconnect();

    return doc;
}

export async function findOneAndUpdate(transaction: Transaction): Promise<Transaction | null> {
    await connect();
    const filter = { _id: new Types.ObjectId(transaction._id?.toString()) }
    const update = {
        description: transaction.description,
        amount: transaction.amount,
        date: transaction.date,
        creditCardDate: transaction.creditCardDate,
        plainCreditCardDate: transaction.plainCreditCardDate,
        category: transaction.category,
        accountId: transaction.accountId,
        type: transaction.type,
        creditCardInvoiceId: transaction.creditCardInvoiceId,
        comment: transaction.comment,
        ignored: transaction.ignored,
    }
    const doc = await TransactionModel.findOneAndUpdate(filter, update );

    await disconnect();

    return doc;
}

export async function batchUpdate(transactions: Transaction[]) {
    await connect();
    console.log(transactions[0])

    const updateArray = transactions.map(transaction => ({
        updateOne: {
            filter: { pluggyTransactionId: transaction.pluggyTransactionId },
            // If you were using the MongoDB driver directly, you'd need to do
            // `update: { $set: { title: ... } }` but mongoose adds $set for
            // you.
            update: transaction,
            upsert: true,
          } 
    }))

    await TransactionModel.bulkWrite(
        updateArray
      ).then(res => {
        console.log(res.result);
      });

    await disconnect();
}

interface SpendingByCategory {
    _id: string,
    category: Category,
    totalAmount: number,
}

export async function fetchSpendingsByCategories(id: any, monthField: string, yearField: string, transactionType: string): Promise<SpendingByCategory[]> {
    await connect();
    const year = parseInt(yearField)
    const month = parseInt(monthField)

    const firstDay = new Date(`${year}-${(''+month).padStart(2, '0')}-01T00:00:00Z`)
    const lastDay = (month === 12) ? ( new Date(`${year + 1}-01-01T00:00:00Z`) ) : ( new Date(`${year}-${(''+(month + 1)).padStart(2, '0')}-01T00:00:00Z`) )
    
    console.log('FIRST DAY', firstDay.toISOString(),'LAST DAY', lastDay.toISOString())

    const types: string[] = transactionType == 'ALL' ? ['EXPENSE', 'INCOME'] : [transactionType]

    const result = await TransactionModel.aggregate([
            { $match: { 
                userId: new Types.ObjectId(id), 
                _isDeleted: { $ne: true }, 
                ignored: { $ne: true }, 
                "category.ignored": false , 
                date: { $gte: firstDay, $lt: lastDay },
                type: { $in: types }, 
                } 
            },
            {
                $group :
                  {
                    _id : "$category._id",
                    category: { $first: "$category" },
                    totalAmount: { $sum: "$amount" }
                  }
            },
            {
                $set: {
                    totalAmount: { $abs: "$totalAmount" }
                }
            },
            { $sort: { totalAmount: -1 } }
          ]) as SpendingByCategory[];
    
    await disconnect();
    return result;
}
