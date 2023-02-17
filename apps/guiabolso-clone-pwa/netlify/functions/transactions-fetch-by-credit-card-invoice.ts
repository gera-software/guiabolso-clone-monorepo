import { Handler } from "@netlify/functions";
import * as TransactionRepository from '../repositories/transactionRepository'
import { Transaction, TransactionSummary } from "../types";

const handler :Handler = async (event, context) => {
    const invoiceId = event.queryStringParameters?.id
    const transactions: Transaction[] = await TransactionRepository.fetchByCreditCardInvoice(invoiceId)
    
    return {
        statusCode: 200,
        body: JSON.stringify(transactions),
    };
}

export { handler };