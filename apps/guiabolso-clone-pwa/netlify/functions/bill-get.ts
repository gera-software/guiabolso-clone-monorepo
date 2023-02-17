import { Handler } from "@netlify/functions";
import * as CalendarBillRepository from '../repositories/calendarBillRepository'
import { CalendarBill } from "../types";

const handler :Handler = async (event, context) => {
    const billId = event.queryStringParameters?.id
    const bill: CalendarBill | null = await CalendarBillRepository.getById(billId)
    
    return {
        statusCode: 200,
        body: JSON.stringify(bill),
    };
}

export { handler };