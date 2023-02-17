import { Handler } from "@netlify/functions";
import PluggyDataProvider from "../config/pluggyDataProvider";

const handler :Handler = async (event, context) => {

    const itemId = event.queryStringParameters?.itemId

    const dataProvider = new PluggyDataProvider()

    const connectToken = await dataProvider.createConnectToken(itemId)

    // console.log(connectToken)

    return {
        statusCode: 200,
        body: JSON.stringify(connectToken),
    };

}

export { handler };