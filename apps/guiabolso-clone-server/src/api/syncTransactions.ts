import * as SynchronizationService from "../services/synchronizationService";
import { AccountSummaryDTO } from "../types";
import { Request, Response } from 'express'

export default async function(req: Request, res: Response) {
    console.time('SYNC')
    const accountId = req.query.accountId?.toString() ?? ''
    const from = req.query.from?.toString() ?? ''
    console.log('ACCOUNT ID: ', accountId, 'FROM: ', from)

    let result: AccountSummaryDTO | null
    try {
        result = await SynchronizationService.importTransactions(accountId, from)
    } catch(err) {
        console.error(err)
        return res.status(400).json(err)
    }
    
    console.timeEnd('SYNC')
    console.log(process.env.VITE_MONGO_URI)
    return res.status(200).json(result)
}