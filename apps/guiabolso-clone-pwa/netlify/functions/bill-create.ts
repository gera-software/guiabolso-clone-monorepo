import { Handler } from "@netlify/functions";
import * as CalendarBillRepository from "../repositories/calendarBillRepository";
import { CalendarBill } from "../types";

const handler: Handler = async (event, context) => {
    if (!event.body) {
        return {
            statusCode: 400,
        };
    }

    const bill = JSON.parse(event.body) as CalendarBill;
    let doc: CalendarBill | null;
    try {
        doc = await CalendarBillRepository.create(bill);
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify(err),
        };
    }

    return {
        statusCode: 200,
        body: JSON.stringify(bill),
    };
};

export { handler };
