import { Handler } from "@netlify/functions";
import * as AccountRepository from '../repositories/accountRepository'
import { Account } from "../types";

const handler :Handler = async (event, context) => {
    const accountId = event.queryStringParameters?.id
    const account: Account | null = await AccountRepository.getById(accountId)
    
    return {
        statusCode: 200,
        body: JSON.stringify(account),
    };
}

export { handler };