import { Handler } from "@netlify/functions";

const handler :Handler = async (event, context) => {

    const payload = JSON.parse(event.body ?? '')
    console.log(payload)

    if(payload.event == 'item/updated') {
        console.log(payload.id, ' updated')
    }

    return {
        statusCode: 200
    };

}

export { handler };