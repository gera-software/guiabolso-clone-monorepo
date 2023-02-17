import { Handler } from "@netlify/functions";
import { Synchronization } from "../types";
import * as SynchronizationService from "../services/synchronizationService";


const handler: Handler = async (event, context) => {
    if (!event.body) {
        return {
            statusCode: 400,
        };
    }

    const sync = JSON.parse(event.body) as Synchronization;

    try {
        let result: Synchronization | null | undefined = null

        result = await SynchronizationService.updateStatus(sync)
       
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

}

export { handler };