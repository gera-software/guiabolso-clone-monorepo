import { connect, disconnect } from "../config/database";
import { Schema, model, Types, PipelineStage } from 'mongoose';
import { CreditCardInvoice } from '../types'
import schema from "./schemas/creditCardInvoiceSchema";

const CreditCardInvoiceModel = model<CreditCardInvoice>('credit_card_invoices', schema);

/**
 * Get a not deleted invoice by account id and dueDate
 * @param id 
 * @returns 
 */
export async function getByDueDate(accountId: string, dueDate: Date): Promise<CreditCardInvoice | null> {
    await connect();
    const result = await CreditCardInvoiceModel.findOne({ accountId: new Types.ObjectId(accountId), dueDate: dueDate, _isDeleted: { $ne: true } });
    await disconnect();
    return result;
}

/**
 * Creates a credit card invoice
 * @param creditCardInvoice 
 * @returns 
 */
export async function create(creditCardInvoice: CreditCardInvoice | null): Promise<CreditCardInvoice | null> {
    // console.log('CREATE', creditCardInvoice)
    await connect();
    const doc = new CreditCardInvoiceModel(creditCardInvoice);
    const result = await doc.save();
    // console.log('RESULT', result)
    await disconnect();

    return result;
}

/**
 * Fetch all (not deleted) invoices by account id
 * @param accountId 
 * @returns 
 */
export async function fetchByAccount(accountId: string): Promise<CreditCardInvoice[]> {
    await connect();

    const result = await CreditCardInvoiceModel.find({ accountId: new Types.ObjectId(accountId), _isDeleted: { $ne: true } })
        .sort({ dueDate: -1 })

    await disconnect();
    return result;
}


/**
 * Get the last (not deleted) closed invoice by account id
 * @param id 
 * @returns 
 */
export async function getLastClosedInvoice(accountId: string): Promise<CreditCardInvoice | null> {
    // TODO bug: devido a diferença de fuso horário entre back e front, ele pode não encontrar a fatura
    await connect();
    const c = new Date()
    const currentDate = new Date(Date.UTC(c.getFullYear(), c.getMonth(), c.getDate()))
    console.log(currentDate.toISOString())
    const result = await CreditCardInvoiceModel.aggregate([
        { 
            $match: { 
                accountId: new Types.ObjectId(accountId), 
                closeDate: { $lte: currentDate }, 
                _isDeleted: { $ne: true } 
            }
        },
        { $sort: { closeDate: -1 } },
        { $limit: 1 },
    ]);
    await disconnect();

    return result.length ? result[0] : null
}
