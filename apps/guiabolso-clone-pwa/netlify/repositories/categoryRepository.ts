import { connect, disconnect } from "../config/database";
import { Schema, model } from 'mongoose';
import { Category } from '../types'

const schema = new Schema<Category>({
    name: String,
    iconName: { type: String, required: false },
    primaryColor: { type: String, required: false },
    group: String,
});

const CategoryModel = model<Category>('categories', schema);


export async function fetchAll(): Promise<Category[]> {
    await connect();
    const result = await CategoryModel.find();
    await disconnect();
    return result;
}
