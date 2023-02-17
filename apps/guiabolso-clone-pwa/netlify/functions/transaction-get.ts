import { Handler } from "@netlify/functions";
import * as TransactionRepository from '../repositories/transactionRepository'
import { Transaction } from "../types";

const handler :Handler = async (event, context) => {
    const transactionId = event.queryStringParameters?.id
    const transaction: Transaction | null = await TransactionRepository.getById(transactionId)
    
    return {
        statusCode: 200,
        body: JSON.stringify(transaction),
    };
}

export { handler };