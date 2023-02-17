import { Handler } from "@netlify/functions";

const handler :Handler = async (event, context) => {
 
    const sdk = require('api')('@pluggy/v1.0#jc5kqtl9irzchd');

    try {
        const result = await sdk.authCreate({
            clientId: process.env.VITE_PLUGGY_CLIENT_ID,
            clientSecret: process.env.VITE_PLUGGY_CLIENT_SECRET
        })
        console.log(result.data)
        return {
            statusCode: 200,
            body: JSON.stringify(result.data),
        };

    } catch(err) {
        console.error(err)
        return {
            statusCode: 400,
            body: JSON.stringify(err),
        };
    }




}

export { handler };