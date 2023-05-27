import { Handler } from "@netlify/functions";
import * as UserRepository from '../repositories/userRepository'
import { User } from "../types";

const handler :Handler = async (event, context) => {
  
    // TODO hardcoded id
    const user: User | null = await UserRepository.getById('6371600bc4021d373d3ace59')
    
    return {
        statusCode: 200,
        body: JSON.stringify(user),
    };
}

export { handler };