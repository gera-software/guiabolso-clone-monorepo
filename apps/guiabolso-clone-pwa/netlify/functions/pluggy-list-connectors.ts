import { Handler } from "@netlify/functions";

const handler :Handler = async (event, context) => {
 
    const pluggy = require('pluggy-sdk');

    let connectors;

    try {
        const client = new pluggy.PluggyClient({
            clientId: process.env.VITE_PLUGGY_CLIENT_ID,
            clientSecret: process.env.VITE_PLUGGY_CLIENT_SECRET,
        });

        connectors = await client.fetchConnectors()
        console.log(connectors);

    } catch(err) {
        console.error(err)
        return {
            statusCode: 400,
            body: JSON.stringify(err),
        };
    }

    return {
        statusCode: 200,
        body: JSON.stringify(connectors),
    };


}

export { handler };