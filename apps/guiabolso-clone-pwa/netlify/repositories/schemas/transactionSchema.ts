import { Schema, model, Types } from 'mongoose';
import {  Transaction } from '../../types'

const schema = new Schema<Transaction>({
    providerId: { type: String, required: false },
    description: String,
    descriptionOriginal: String,
    amount: Number,
    currencyCode: String,
    date: Date,
    invoiceDate: { type: Date, required: false },
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
    invoiceId: { type: Types.ObjectId, required: false },
    _isDeleted: Boolean,
});

export default schema