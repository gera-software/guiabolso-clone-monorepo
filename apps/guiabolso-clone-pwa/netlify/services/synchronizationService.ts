import * as SynchronizationRepository from "../repositories/synchronizationRepository";
import { AccountSummaryDTO, Synchronization, SyncStatus } from "../types";

import * as TransactionRepository from "../repositories/transactionRepository";
import * as AccountRepository from "../repositories/accountRepository";
import pluggy from 'pluggy-sdk'
import PluggyDataProvider from '../config/pluggyDataProvider'
import { AccountSyncType, CurrencyCodes, Transaction, TransactionStatus, TransactionType } from "../types";




// export async function updateStatus(sync: Synchronization) {
//     console.log('UPDATE STATUS: ', sync)
//     return await SynchronizationRepository.updateOne(sync)
// }

// TODO e se for uma transação de cartão de crédito, tem que inverter os valores...
/**
 * Inicia o processo de importação das transações do provedor de dados
 * 
 * - upsert as transações recentes (desde a data da ultima sincronização de uma conta)
 * - atualiza synchronzation status 
 * - atualiza o balanço da conta
 * @param accountId
 * @param from string no formato 'aaaa-mm-dd' representando a data a partir do qual as transações serão importadas
 * @returns 
 */
export async function importTransactions(accountId: string, from: string): Promise<AccountSummaryDTO | null> {

    const account = await AccountRepository.getById(accountId)
    console.log(account)
    console.log(from)

    let pluggyTransactions: pluggy.Transaction[] = [];
    let transactions: Transaction[] = []

    if(account) {
        const pluggyAccountId = account.providerAccountId ?? ''
  
        const provider = new PluggyDataProvider()

        // update balance
        const accountData = await provider.getAccount(pluggyAccountId)
        console.log('PLUGGY ACCOUNT DATA', accountData)
        account.balance =  Math.trunc(accountData.balance * 100)
        await AccountRepository.setBalance(account._id?.toString() ?? '', account.balance.valueOf())

        // update transactions
        pluggyTransactions = await provider.fetchTransactions(pluggyAccountId, from)
        console.log('TRANSACTIONS FOUND: ' + pluggyTransactions.length)

        transactions = pluggyTransactions.map(transaction => ({
            providerId: transaction.id,
            syncType: AccountSyncType.AUTOMATIC,
            descriptionOriginal: transaction.description,
            amount: Math.trunc(transaction.amount * 100),
            currencyCode: CurrencyCodes.BRL,
            date: transaction.date,
            type: transaction.amount >= 0 ? TransactionType.INCOME : TransactionType.EXPENSE,
            status: TransactionStatus.POSTED,
            // ignored: false,
            // _isDeleted: false,
            accountId: account._id,
            userId: account.userId,
        }) as Transaction)

        await TransactionRepository.batchUpdate(transactions)


        // update syncronization status to SYNCED
        // let sync = await SynchronizationRepository.getById(account.syncId)
        // if(sync) {
        //     sync.syncStatus = SyncStatus.SYNCED
        //     sync.lastSyncAt = new Date()
        //     sync = await updateStatus(sync)
            

        // }

        // get account summary
        const accountSummary: AccountSummaryDTO | null = await AccountRepository.getSummaryById(account._id)


        console.log('ACCOUNT SUMMARY', accountSummary)

        return accountSummary
  
    } else {
        throw new Error('Account not found')
    }
}