
/**
 * @deprecated
 */

import { Handler } from "@netlify/functions";
import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  accountId: mongoose.SchemaTypes.ObjectId,
  date: Date,
  description: String,
  value: Number,
  categoryId: mongoose.SchemaTypes.ObjectId,
  comment: String,
});

const Transaction = mongoose.model('transactions', TransactionSchema);

const mongoUri = process.env.VITE_MONGO_URI || 'mongodb://localhost:27017/guiabolso'

const handler :Handler = async (event, context) => {
  console.log('[connecting] ' + mongoUri)
  await mongoose.connect(mongoUri);

  const currentDate = new Date()
  const currentYear = '' + currentDate.getFullYear()
  const currentMonth = (currentDate.getMonth() + 1).toString()
  
  const year = parseInt(event.queryStringParameters?.year ?? currentYear)
  const month = parseInt(event.queryStringParameters?.month ?? currentMonth) 

  const firstDay = new Date(`${year}-${month}-01-01T00:00:00Z`)
  const lastDay = (month === 12) ? ( new Date(`${year + 1}-01-01-01T00:00:00Z`) ) : ( new Date(`${year}-${month + 1}-01-01T00:00:00Z`) )

  const transactions = await Transaction.aggregate([
    { $match: { date: { $gte: firstDay, $lt: lastDay } } },
    { $lookup: { from: 'accounts', localField: 'accountId', foreignField: '_id', as: 'account' } },
    { $lookup: { from: 'categories', localField: 'categoryId', foreignField: '_id', as: 'category' } },
    { $sort: { date: -1 } }
  ]);

  await mongoose.disconnect()

  return {
    statusCode: 200,
    body: JSON.stringify(transactions),
  };
};

export { handler };