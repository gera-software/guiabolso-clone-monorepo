/**
 * @deprecated
 */

import { Handler } from "@netlify/functions";

const handler :Handler = async (event, context) => {
 
    console.log(event.queryStringParameters)
    const pluggy = require('pluggy-sdk');

    let transactions;

    try {
        const client = new pluggy.PluggyClient({
            clientId: process.env.VITE_PLUGGY_CLIENT_ID,
            clientSecret: process.env.VITE_PLUGGY_CLIENT_SECRET,
        });

        transactions = await client.fetchTransactions(
            event.queryStringParameters?.accountId ?? '',
            {
                from: '2022-11-01',
                pageSize: 5,
                page: 4
            })  
        console.log(transactions);

    } catch(err) {
        console.error(err)
        return {
            statusCode: 400,
            body: JSON.stringify(err),
        };
    }

    return {
        statusCode: 200,
        body: JSON.stringify(transactions),
    };


}

export { handler };