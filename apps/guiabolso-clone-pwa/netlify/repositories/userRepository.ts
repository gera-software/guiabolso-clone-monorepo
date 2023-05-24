import { connect, disconnect } from "../config/database";
import { Schema, model } from 'mongoose';
import { User } from '../types'

const schema = new Schema<User>({
    name: String,
    email: String,
});

const UserModel = model<User>('users', schema);

export async function getById(id: any): Promise<User | null> {
    await connect();
    const result = await UserModel.findById(id);
    await disconnect();
    return result;
}


/**
 * Creates a user
 * @returns 
 */
export async function create(user: User ): Promise<User | null> {
    await connect();
    const doc = new UserModel(user);
    const result = await doc.save();
    await disconnect();

    return result;
}

