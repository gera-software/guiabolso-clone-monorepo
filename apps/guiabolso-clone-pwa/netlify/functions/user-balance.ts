import { Handler } from "@netlify/functions";
import * as AccountRepository from '../repositories/accountRepository'

const handler :Handler = async (event, context) => {

  const userId = event.queryStringParameters?.id

    const balance = await AccountRepository.fetchUserBalance(userId)
    
    return {
        statusCode: 200,
        body: JSON.stringify(balance),
    };
}

export { handler };