import { connect, disconnect } from "../config/database";
import { Schema, Types, model, Document } from 'mongoose';
import { Account, AccountSummaryDTO } from '../types'


const schema = new Schema<Account>({
    name: String,
    imageUrl: { type: String, required: false },
    syncType: String,
    providerAccountId: { type: String, required: false },
    initialBalance: { type: Number, required: false },
    balance: Number,
    currencyCode: String,
    type: String,
    userId: Types.ObjectId,
    accountOwner: {
        name: String,
        pluggyIdentityId: { type: String, required: false },
        cpf: { type: String, required: false },
    },
    // syncId: { type: Types.ObjectId, required: false },
    institution: {
        _id: { type: Types.ObjectId, required: false },
        pluggyConnectorId: { type: Number, required: false },
        name: String,
        imageUrl: { type: String, required: false },
        primaryColor: { type: String, required: false },
    },
    creditCardInfo: {
        brand: String,
        creditLimit: Number,
        availableCreditLimit: Number,
        closeDay: Number,
        dueDay: Number,
    },
    synchronization: {
        providerItemId: String,
        createdAt: Date,
    },
    _isDeleted: { type: Boolean, required: false },
});

const AccountModel = model<Account>('accounts', schema);

export async function fetchByUserId(id: any): Promise<Account[]> {
    await connect();
    const results = await AccountModel.find({ userId: new Types.ObjectId(id), _isDeleted: { $ne: true } })
    await disconnect();
    return results;
}

export async function getById(id: any): Promise<Account | null> {
    await connect();
    const result = await AccountModel.findById(id);
    await disconnect();
    return result;
}

export async function getSummaryById(id: any): Promise<AccountSummaryDTO | null> {
    await connect();
    const result = await AccountModel.aggregate([
        { $match: { _id: new Types.ObjectId(id) } },
        { $lookup: {
                from: 'synchronizations',
                localField: 'syncId',
                foreignField: '_id',
                as: 'sync',
                
            }
        },
        { $unwind: { path: '$sync', preserveNullAndEmptyArrays: true } },
        { $project: {
                _id: 1,
                name: 1,
                imageUrl: 1,
                syncType: 1,
                balance: 1,
                currencyCode: 1,
                type: 1,
                userId: 1,
                syncId: 1,
                sync: 1,
            }
        },
    ]) as AccountSummaryDTO[];
    
    // const result = await AccountModel.findById(id);
    await disconnect();
    return result[0];
}

/**
 * Creates a account
 * @param account 
 * @returns 
 */
export async function create(account: Account | null): Promise<Account | null> {
    await connect();
    const doc = new AccountModel(account);
    const result = await doc.save();
    await disconnect();

    return result;
}

/**
 * Logical deletion of a account
 * @param id
 * @returns 
 */
export async function remove(id: any): Promise<Account | null> {
    await connect();
    const result = await AccountModel.findOneAndUpdate({ _id: id }, { _isDeleted: true });
    await disconnect();
    return result;
}

export async function addToBalance(accountId: string, amount: number = 0): Promise<Account | null> {
    console.log('add to balance', amount)
    await connect();
    const doc =  await AccountModel.findById(accountId);

    if(doc) {
        doc.balance = doc.balance.valueOf() + amount
        await doc.save();
    }
    await disconnect();

    return doc;
}

export async function subtractFromBalance(accountId: string, amount: number = 0): Promise<Account | null> {
    console.log('subtract from balance', amount)
    await connect();
    const doc =  await AccountModel.findById(accountId);

    if(doc) {
        doc.balance = doc.balance.valueOf() - amount
        await doc.save();
    }
    await disconnect();

    return doc;
}


export async function setBalance(accountId: string, amount: number = 0): Promise<Account | null> {
    await connect();
    const doc =  await AccountModel.findById(accountId);

    if(doc) {
        doc.balance = amount
        await doc.save();
    }
    await disconnect();

    return doc;
}


export async function addToAvailableCreditLimit(accountId: string, amount: number = 0): Promise<Account | null> {
    await connect();
    const doc =  await AccountModel.findById(accountId);

    if(doc?.creditCardInfo?.availableCreditLimit) {
        doc.creditCardInfo.availableCreditLimit = doc.creditCardInfo.availableCreditLimit.valueOf() + amount
        await doc.save();
    }
    await disconnect();

    return doc;
}

export async function subtractFromAvailableCreditLimit(accountId: string, amount: number = 0): Promise<Account | null> {
    await connect();
    const doc =  await AccountModel.findById(accountId);

    if(doc?.creditCardInfo?.availableCreditLimit) {
        doc.creditCardInfo.availableCreditLimit = doc.creditCardInfo.availableCreditLimit.valueOf() - amount
        await doc.save();
    }
    await disconnect();

    return doc;
}

type Balance = {
    balance: number
}

export async function fetchUserBalance(id: any): Promise<Balance[]> {
    await connect();
    const result = await AccountModel.aggregate([
        { $match: { userId: new Types.ObjectId(id), _isDeleted: { $ne: true } } },
        { $group: { 
            _id: '$type',
            total: { $sum: '$balance'}
            } 
        },
    ])
    await disconnect();
    return result;
}
