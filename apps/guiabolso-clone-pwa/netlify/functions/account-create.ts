import { Handler } from "@netlify/functions";
import * as AccountRepository from "../repositories/accountRepository";
import { Account } from "../types";

const handler: Handler = async (event, context) => {

    if (!event.body) {
        return {
            statusCode: 400,
        };
    }

    // interface Account {
    //     _id?: String,
    //     name: String,
    //     imageUrl?: String,
    //     syncType: AccountSyncType,
    //     pluggyAccountId?: string,
    //     balance: Number,
    //     currencyCode: CurrencyCodes,
    //     type: AccountType,
    //     userId: String,
    //     accountOwner?: AccountOwner,
    //     syncId?: String,
    //     sync?: Synchronization,
    //     creditData?: CreditData,
    // }
    const account = JSON.parse(event.body) as Account;
    let doc: Account | null;
    try {
        doc = await AccountRepository.create(account);
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify(err),
        };
    }

    return {
        statusCode: 200,
        body: JSON.stringify(doc),
    };
}

export { handler };
