import { Handler } from "@netlify/functions";
import * as TransactionRepository from '../repositories/transactionRepository'
import { AccountType, Transaction } from "../types";
import * as TransactionService from "../services/transactionService";

const handler :Handler = async (event, context) => {
    const transactionId = event.queryStringParameters?.id

    try {
        const trans = await TransactionRepository.getById(transactionId)
        console.log('REMOVE', trans)

        let result: Transaction | null | undefined
        if(trans) {
            if(trans.accountType === AccountType.WALLET) {
                result = await TransactionService.removeCashTransaction(trans)
            } else if(trans.accountType === AccountType.CREDIT_CARD) {
                result = await TransactionService.removeCreditCardTransaction(trans)
            } else {
                result = await TransactionService.removeCheckingAccountTransaction(trans)
            }

            return {
                statusCode: 200,
                body: JSON.stringify(trans),
            }
        } else {
            return {
                statusCode: 404,
                body: JSON.stringify('Not found'),
            } 
        }

    } catch(err) {
        return {
            statusCode: 500,
            body: JSON.stringify(err),
        }
    }
}

export { handler };