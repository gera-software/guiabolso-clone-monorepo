import { Schema, Types } from 'mongoose';
import {  CreditCardInvoice } from '../../types'

const schema = new Schema<CreditCardInvoice>({
    dueDate: Date,
    closeDate: Date,
    amount: Number,
    currencyCode: String,
    userId: Types.ObjectId,
    accountId: Types.ObjectId,
    _isDeleted: Boolean,
});

export default schema