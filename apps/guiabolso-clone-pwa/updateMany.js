import mongoose from 'mongoose';
import { Schema, model, Types } from 'mongoose';

import { Temporal, Intl, toTemporalInstant } from '@js-temporal/polyfill';
Date.prototype.toTemporalInstant = toTemporalInstant;

//local
const mongoUri = 'mongodb://localhost:27017/development_guiabolso'

//atlas development
// const mongoUri = 'mongodb+srv://guiabolso:8DdBa34fw6bR3dbR@cluster0.xzm8za1.mongodb.net/development_guiabolso'

//atlas producao
// const mongoUri = 'mongodb+srv://guiabolso:8DdBa34fw6bR3dbR@cluster0.xzm8za1.mongodb.net/production_guiabolso'



const transactionSchema = new Schema({
    pluggyTransactionId: { type: String, required: false },
    description: String,
    descriptionOriginal: String,
    amount: Number,
    currencyCode: String,
    date: Date,
    plainDate: String,
    creditCardDate: { type: Date, required: false },
    plainCreditCardDate: { type: String, required: false },
    category: {
        _id: Types.ObjectId,
        name: String,
        iconName: String,
        primaryColor: String,
        ignored: Boolean,
        group: String,
    },
    type: String,
    syncType: String,
    status: String,
    comment: { type: String, required: false },
    ignored: Boolean,
    accountId: Types.ObjectId,
    accountType: { type: String, required: false },
    userId: Types.ObjectId,
    _isDeleted: Boolean,
});

const TransactionModel = model('transactions', transactionSchema);

console.log('[Mongo] UPDATE MANY TRANSACTIONS connecting... ' + mongoUri)
await mongoose.connect(mongoUri)

const res1 = await TransactionModel.find({});

const newDates = []
const newCreditCardDates = []

for(let i = 0; i< 1; i++) {
    let plainDate = res1[i].date
      .toTemporalInstant()                         // => 2000-01-01T08:00:00Z
      .toZonedDateTimeISO(Temporal.Now.timeZone()) // => 2000-01-01T00:00:00-08:00[America/Los_Angeles]
      .toPlainDate()
      .toString();  

    newDates.push({ _id: res1[i]._id.toString(), plainDate: plainDate })
    console.log(res1[i]._id.toString(), res1[i].date, res1[i].date?.toLocaleString(), plainDate)



    let plainCreditCardDate = null
    if(res1[i].creditCardDate){
        plainCreditCardDate = res1[i].creditCardDate
          .toTemporalInstant()                         // => 2000-01-01T08:00:00Z
          .toZonedDateTimeISO(Temporal.Now.timeZone()) // => 2000-01-01T00:00:00-08:00[America/Los_Angeles]
          .toPlainDate()
          .toString()

        newCreditCardDates.push({ _id: res1[i]._id.toString(), plainCreditCardDate: plainCreditCardDate })

        // console.log(res1[i]._id.toString(), res1[i].creditCardDate, res1[i].creditCardDate?.toLocaleString(), plainCreditCardDate)
    }

}

console.log('[Mongo] disconnecting... ' + mongoUri)
await mongoose.disconnect()



// const a = await batchUpdate(newDates)
// console.log(a)



// const b = await batchUpdate(newCreditCardDates)
// console.log(b)





async function batchUpdate(transactions) {
    await mongoose.connect(mongoUri)

    const updateArray = transactions.map(transaction => ({
        updateOne: {
            filter: { _id: new Types.ObjectId(transaction._id) },
            // If you were using the MongoDB driver directly, you'd need to do
            // `update: { $set: { title: ... } }` but mongoose adds $set for
            // you.
            update: transaction,
            upsert: false,
          } 
    }))

    await TransactionModel.bulkWrite(
        updateArray
      ).then(res => {
        console.log(res);
      });

    await mongoose.disconnect()
}

