import { Handler } from "@netlify/functions";
import * as TransactionRepository from '../repositories/transactionRepository'
import { Transaction, TransactionSummary } from "../types";

const handler :Handler = async (event, context) => {
    const userId = event.queryStringParameters?.id
    const monthField = event.queryStringParameters?.month ?? ''
    const yearField = event.queryStringParameters?.year ?? ''
    const limit = +(event.queryStringParameters?.limit ?? 0)
    const transactionType = event.queryStringParameters?.transactionType ?? 'ALL'

    const transactions: TransactionSummary[] = await TransactionRepository.fetchByUser(userId, monthField, yearField, limit, transactionType)
    
    return {
        statusCode: 200,
        body: JSON.stringify(transactions),
    };
}

export { handler };