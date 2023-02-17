import { Handler } from "@netlify/functions";
import * as InstitutionRepository from '../repositories/institutionRepository'
import { Institution } from "../types";

const handler :Handler = async (event, context) => {
  
    const institutions: Institution[] = await InstitutionRepository.fetchAll()
    
    return {
        statusCode: 200,
        body: JSON.stringify(institutions),
    };
}

export { handler };