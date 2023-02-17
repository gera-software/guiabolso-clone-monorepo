import { Handler } from "@netlify/functions";
import * as AccountRepository from '../repositories/accountRepository'
import { Account, AccountSummaryDTO } from "../types";

const handler :Handler = async (event, context) => {

  const userId = event.queryStringParameters?.id

    const accounts: AccountSummaryDTO[] = await AccountRepository.fetchByUserId(userId)
    
    return {
        statusCode: 200,
        body: JSON.stringify(accounts),
    };
}

export { handler };