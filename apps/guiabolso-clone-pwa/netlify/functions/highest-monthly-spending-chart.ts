import { Handler, HandlerContext, HandlerEvent } from "@netlify/functions";
import * as DashboardRepository from '../repositories/dashboardRepository'

type item = {
    name: String,
    primaryColor: String,
    amount: number,
} 

const handler :Handler = async (event: HandlerEvent, context: HandlerContext) => {
    //@ts-ignore
    const { identity, user } = context.clientContext;
    console.log(user)
    const userId = event.queryStringParameters?.id
    const monthField = event.queryStringParameters?.month
    const yearField = event.queryStringParameters?.year
    const spendingsByCategories = await DashboardRepository.getHighestMonthlySpendings(userId, monthField, yearField)
    
    const result: item[] = [];

    if(spendingsByCategories.length) {
   
        const first = spendingsByCategories.shift()
        result.push({
            name: first?.category.name ?? '',
            primaryColor: first?.category.primaryColor ?? 'gray',
            amount: Math.abs(first?.totalAmount ?? 0),
        })

        if(spendingsByCategories.length) {
            const second = spendingsByCategories.shift()
            result.push({
                name: second?.category.name ?? '',
                primaryColor: second?.category.primaryColor ?? 'gray',
                amount: Math.abs(second?.totalAmount ?? 0),
            })
        }

        if(spendingsByCategories.length) {
            const third = spendingsByCategories.shift()
            result.push({
                name: third?.category.name ?? '',
                primaryColor: third?.category.primaryColor ?? 'gray',
                amount: Math.abs(third?.totalAmount ?? 0),
            })
        }

        if(spendingsByCategories.length) {
            const others = spendingsByCategories.reduce((accumulator, category) => accumulator + category.totalAmount, 0)
        
            result.push({
                name: 'Outras categorias',
                primaryColor: '#D9D9D9',
                amount: Math.abs(others ?? 0),
            })
        }

    }

    const totalAmount = result.reduce((accumulator, category) => accumulator + category.amount, 0)
    console.log(totalAmount)

    const slices = result.map(category => ({
        percent: +(category.amount / totalAmount * 100).toFixed(2),
        color: category.primaryColor,
        label: category.name
    }))

    return {
        statusCode: 200,
        body: JSON.stringify(slices),
    };
}

export { handler };