import { Handler } from "@netlify/functions";
import * as DashboardRepository from '../repositories/dashboardRepository'

const handler :Handler = async (event, context) => {
    const userId = event.queryStringParameters?.id
    const monthField = event.queryStringParameters?.month ?? ''
    const yearField = event.queryStringParameters?.year ?? ''
    const planning = await DashboardRepository.getMonthPlanning(userId, monthField, yearField)

    return {
        statusCode: 200,
        body: JSON.stringify(planning),
    };
}

export { handler };