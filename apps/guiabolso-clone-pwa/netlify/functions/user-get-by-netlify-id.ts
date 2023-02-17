import { Handler } from "@netlify/functions";
import * as UserRepository from '../repositories/userRepository'
import { User } from "../types";

const handler :Handler = async (event, context) => {
    const netlifyId = event.queryStringParameters?.netlifyId ?? ''
    const email = decodeURIComponent(event.queryStringParameters?.email ?? '')
    const name = event.queryStringParameters?.name ?? ''

    console.log(netlifyId, email, name)
  
    let user: User | null = await UserRepository.getByNetlifyId(netlifyId)

    if(!user) {
        user = await UserRepository.create({
            name,
            email,
            netlifyId,
        })
    }
    
    return {
        statusCode: 200,
        body: JSON.stringify(user),
    };
}

export { handler };