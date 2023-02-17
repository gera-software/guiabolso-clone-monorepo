import { Handler } from "@netlify/functions";
import * as CategoryRepository from '../repositories/categoryRepository'
import { Category } from "../types";

const handler :Handler = async (event, context) => {
  
    const categories: Category[] = await CategoryRepository.fetchAll()
    
    return {
        statusCode: 200,
        body: JSON.stringify(categories),
    };
}

export { handler };