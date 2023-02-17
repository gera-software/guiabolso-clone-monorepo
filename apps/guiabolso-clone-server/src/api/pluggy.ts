import { PluggyClient } from 'pluggy-sdk';

export default async function(itemId: string) {

    const PLUGGY_CLIENT_ID = process.env.VITE_PLUGGY_CLIENT_ID || '';
    const PLUGGY_CLIENT_SECRET = process.env.VITE_PLUGGY_CLIENT_SECRET || '';

    const client = new PluggyClient({
        clientId: PLUGGY_CLIENT_ID,
        clientSecret: PLUGGY_CLIENT_SECRET,
    });

    const accounts = await client.fetchAccounts(itemId);

    return accounts;
}