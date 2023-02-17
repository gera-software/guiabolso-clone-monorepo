import { model, Schema, Types } from "mongoose";
import { connect, disconnect } from "../config/database";
import { CalendarBill } from "../types";

// _id: Types.ObjectId,
const schema = new Schema<CalendarBill>({
    dueDate: Date,
    description: String,
    amount: Number,
    status: String,
    type: String,
    userId: Types.ObjectId,
    _isDeleted: Boolean,
});

const CalendarBillModel = model<CalendarBill>('bills', schema);

export async function fetchByUser(id: any, monthField: string, yearField: string, limit = 0): Promise<CalendarBill[]> {
    await connect();

    const year = parseInt(yearField)
    const month = parseInt(monthField)

    const firstDay = new Date(`${year}-${(''+month).padStart(2, '0')}-01T00:00:00Z`)
    const lastDay = (month === 12) ? ( new Date(`${year + 1}-01-01T00:00:00Z`) ) : ( new Date(`${year}-${(''+(month + 1)).padStart(2, '0')}-01T00:00:00Z`) )
    
    console.log('FIRST DAY', firstDay.toISOString(),'LAST DAY', lastDay.toISOString())

    const result = await CalendarBillModel.find(
        { userId: new Types.ObjectId(id), _isDeleted: { $ne: true }, dueDate: { $gte: firstDay, $lt: lastDay } }
    ).sort({ dueDate: -1 })
    .limit(limit)

    await disconnect();
    return result;
}

export async function create(bill: CalendarBill | null): Promise<CalendarBill | null> {
    await connect();
    const doc = new CalendarBillModel(bill);
    const result = await doc.save();
    await disconnect();

    return result;
}

export async function getById(id: any): Promise<CalendarBill | null> {
    await connect();
    const result = await CalendarBillModel.findOne({ _id: id, _isDeleted: { $ne: true } });
    await disconnect();
    return result;
}

export async function updateOne(bill: CalendarBill): Promise<CalendarBill | null> {
    await connect();
    const doc = await CalendarBillModel.findById(bill._id);

    if(doc) {
        doc.description = bill.description
        doc.amount = bill.amount
        doc.dueDate = bill.dueDate
        doc.status = bill.status
        await doc.save();
    }

    await disconnect();

    return doc;
}

export async function remove(id: any): Promise<CalendarBill | null> {
    await connect();
    const doc = await CalendarBillModel.findById(id);

    if(doc) {
        doc._isDeleted = true
        await doc.save();
    }

    await disconnect();

    return doc;
}
