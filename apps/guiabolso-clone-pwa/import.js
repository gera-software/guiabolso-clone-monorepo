import mongoose from 'mongoose';
import { Schema, model, Types } from 'mongoose';

const mongoUri = 'mongodb://localhost:27017/guiabolso'

const categorySchema = new Schema({
    name: String,
    iconName: { type: String, required: false },
    primaryColor: { type: String, required: false },
});

const CategoryModel = model('categories', categorySchema);

export async function fetchAllCategories() {
    return await CategoryModel.find();
}



const transactionSchema = new Schema({
    providerId: { type: String, required: false },
    description: String,
    amount: Number,
    currencyCode: String,
    date: Date,
    category: {
        _id: Types.ObjectId,
        name: String,
        iconName: String,
        primaryColor: String
    },
    type: String,
    status: String,
    comment: { type: String, required: false },
    ignored: Boolean,
    accountId: Types.ObjectId,
    userId: Types.ObjectId,
    _isDeleted: Boolean,
});

const TransactionModel = model('transactions', transactionSchema);

console.log('[Mongo] connecting... ' + mongoUri)
await mongoose.connect(mongoUri)

// const categories = await fetchAllCategories();
// console.log(typeof categories[0]._id)
// console.log(categories.length)

//2019, 2020, 2021, 2022
const year = 0
const firstDay = new Date(`${year}-01-01`)
const lastDay = new Date(`${year+1}-01-01`)

const transactions = await TransactionModel.aggregate([
    { $match: { date: { $gte: firstDay, $lt: lastDay } } },
    {
        $lookup:
          {
            from: "categories",
            localField: "categoryId",
            foreignField: "_id",
            as: "category"
          }
    },
    {
        $unwind: '$category',
    },
    { $project: {
        _id: 1,
        accountId: 1,
        date: 1,
        description: 1,
        amount: { $multiply: ['$value', 100] } ,
        currencyCode: 'BRL',
        category: 1,
        comment: 1,
        type:
        { $function:
           {
              body: function(value) {
                 return value < 0 ? 'EXPENSE' : 'INCOME'
              },
              args: [ "$value" ],
              lang: "js"
           }
        },
        status: 'POSTED',
        ignored: {
            $cond: { if: false , then: false, else: false }
        },
        userId: new Types.ObjectId('6371600bc4021d373d3ace59'),
        _isDeleted: {
            $cond: { if: false , then: false, else: false }
        },
      }
    },
    {
        $merge: {
            into: { db:"development_guiabolso", coll: "transactions" },
            whenMatched: 'replace',
        }
    }
])
console.log(transactions)
// console.log(transactions[transactions.length-1])

console.log('[Mongo] disconnecting... ' + mongoUri)
await mongoose.disconnect()
