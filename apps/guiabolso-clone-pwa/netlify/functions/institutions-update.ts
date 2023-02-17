import { Handler } from "@netlify/functions";
import * as InstitutionRepository from '../repositories/institutionRepository'
import PluggyDataProvider from '../config/pluggyDataProvider'
import { Institution } from "../types";

const handler: Handler = async (event, context) => {

    let institutions: Institution[];
    let res;

    try {
        const provider = new PluggyDataProvider()
        institutions = await provider.fetchInstitutions()
        console.log(institutions)
        res = await InstitutionRepository.updateAll(institutions)

    } catch (err) {
        console.error(err);

        return {
            statusCode: 400,
            body: JSON.stringify(err),
        };
    }

    return {
        statusCode: 200,
        body: JSON.stringify(res),
    };
};

export { handler };
