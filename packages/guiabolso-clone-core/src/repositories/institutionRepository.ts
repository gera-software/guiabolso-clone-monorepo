import { connect, disconnect } from "../config/database";
import { Schema, model } from 'mongoose';
import { Institution } from '../types'

const schema = new Schema<Institution>({
    pluggyConnectorId: { type: Number, required: false },
    name: String,
    imageUrl: { type: String, required: false },
    primaryColor: { type: String, required: false },
    type: String,
});

const InstitutionModel = model<Institution>('institutions', schema);


export async function fetchAll(): Promise<Institution[]> {
    await connect();
    const result = await InstitutionModel.find();
    await disconnect();
    return result;
}

export async function updateAll(institution: Institution[]): Promise<Boolean> {
    const operations = institution.map((institution) => ({
        updateOne: {
            filter: { pluggyConnectorId: institution.pluggyConnectorId },
            update: institution,
            upsert: true,
        },
    }));

    await connect();
    const result = await InstitutionModel.bulkWrite(operations);
    await disconnect();
    console.log(result)
    return result.ok === 1;
}
