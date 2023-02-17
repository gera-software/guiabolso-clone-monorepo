import { Handler } from "@netlify/functions";
import * as TransactionRepository from '../repositories/transactionRepository'

type Item = {
    _id: String,
    name: String,
    iconName: String, 
    primaryColor: String,
    amount: number,
    percent: number,
} 

const handler :Handler = async (event, context) => {
    const userId = event.queryStringParameters?.id
    const monthField = event.queryStringParameters?.month
    const yearField = event.queryStringParameters?.year
    const transactionType = event.queryStringParameters?.transactionType
    const spendingsByCategories = await TransactionRepository.fetchSpendingsByCategories(userId, monthField, yearField, transactionType)

    const items: Item[] = []

    const totalAmount = spendingsByCategories.reduce((accumulator, item) => accumulator + item.totalAmount, 0)

    const slices: Item[] = spendingsByCategories.map(item => ({
        _id: item._id,
        name: item.category.name,
        iconName: item.category.iconName,
        primaryColor: item.category.primaryColor,
        amount: item.totalAmount,
        percent: +(item.totalAmount / totalAmount * 100).toFixed(2),
    }))

    return {
        statusCode: 200,
        body: JSON.stringify(slices),
    };
}

export { handler };