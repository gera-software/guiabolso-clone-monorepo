import { Handler } from "@netlify/functions";
import * as SynchronizationService from "../services/synchronizationService";

// TODO atualizar account balance
// TODO e se for uma transação de cartão de crédito, tem que inverter os valores...
const handler :Handler = async (event, context) => {

    const accountId = event.queryStringParameters?.accountId ?? ''
    // const pageSize = +(event.queryStringParameters?.pageSize ?? 20)
    const from = event.queryStringParameters?.from ?? '' // 2022-11-01

    let result
    try {
        result = await SynchronizationService.importTransactions(accountId, from)
    } catch(err) {
        console.error(err)
        return {
            statusCode: 400,
            body: JSON.stringify(err),
        };
    }
    
    return {
        statusCode: 200,
        body: JSON.stringify(result),
    };

}

export { handler };