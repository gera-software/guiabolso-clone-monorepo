import { Handler } from "@netlify/functions";
import * as CreditCardInvoiceRepository from '../repositories/creditCardInvoiceRepository'
import { CreditCardInvoice } from "../types";

const handler :Handler = async (event, context) => {
    const accountId = event.queryStringParameters?.accountId

    const invoices: CreditCardInvoice[] = await CreditCardInvoiceRepository.fetchByAccount(accountId)
    
    return {
        statusCode: 200,
        body: JSON.stringify(invoices),
    };
}

export { handler };