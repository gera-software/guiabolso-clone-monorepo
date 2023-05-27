import { Handler } from "@netlify/functions";
import PluggyDataProvider from "../config/pluggyDataProvider";
import * as SynchronizationRepository from '../repositories/synchronizationRepository'
import { Synchronization, SyncStatus } from "../types";

const handler :Handler = async (event, context) => {
 
    // console.log(event.queryStringParameters)
    // const userId = event.queryStringParameters?.userId ?? ''


    // const results: Synchronization[] = await SynchronizationRepository.fetchByUserId(userId)
    
    // const dataProvider = new PluggyDataProvider()

    // // TODO loop
    // const item = await dataProvider.updateItem(results[0].pluggyItemId)
    // console.log(item)

    // results[0].itemStatus = item.status
    // results[0].syncStatus = SyncStatus.PREPARING
    // await SynchronizationRepository.updateOne(results[0])



    // let item;


    // try {
    //     const client = new pluggy.PluggyClient({
    //         clientId: process.env.VITE_PLUGGY_CLIENT_ID,
    //         clientSecret: process.env.VITE_PLUGGY_CLIENT_SECRET,
    //     });

    //     item = await client.fetchItem(event.queryStringParameters?.itemId ?? '')  
    //     console.log(item);

    // } catch(err) {
    //     console.error(err)
    //     return {
    //         statusCode: 400,
    //         body: JSON.stringify(err),
    //     };
    // }

    return {
        statusCode: 418,
        body: JSON.stringify({}),
    };


}

export { handler };