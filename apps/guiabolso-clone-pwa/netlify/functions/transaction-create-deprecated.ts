/**
 * @deprecated
 */

import { Handler } from "@netlify/functions";
import * as TransactionService from "../services/transactionService";
import { Transaction, AccountType } from "../types";

const handler: Handler = async (event, context) => {

    if (!event.body) {
        return {
            statusCode: 400,
        };
    }

    const transaction = JSON.parse(event.body) as Transaction;

    try {
        let result: Transaction | null | undefined = null

        if(transaction.accountType == AccountType.WALLET) {
            result = await TransactionService.addCashTransaction(transaction)
        } else if(transaction.accountType == AccountType.CREDIT_CARD) {
            result = await TransactionService.addCreditCardTransaction(transaction)
        } else {
            result = await TransactionService.addCheckingAccountTransaction(transaction)
        }

        return {
            statusCode: 200,
            body: JSON.stringify(result),
        };
    } catch(err) {
        return {
            statusCode: 500,
            body: JSON.stringify(err),
        };
    }

};

export { handler };
