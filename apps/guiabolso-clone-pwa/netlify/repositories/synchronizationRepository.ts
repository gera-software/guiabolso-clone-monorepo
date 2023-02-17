import { connect, disconnect } from "../config/database";
import { Schema, Types, model } from 'mongoose';
import { Synchronization } from '../types'

const schema = new Schema<Synchronization>({
    _id: Types.ObjectId,
    pluggyItemId: String,
    itemStatus: String,
    syncStatus: String,
    createdAt: Date,
    lastSyncAt: Date,
    userId: Types.ObjectId,
});

const SynchronizationModel = model<Synchronization>('synchronizations', schema);

export async function fetchByUserId(id: any): Promise<Synchronization[]> {
    await connect();
    const result = await SynchronizationModel.find({ userId: new Types.ObjectId(id) })
    await disconnect();
    return result;
}

export async function getById(id: any): Promise<Synchronization | null> {
    await connect();
    const result = await SynchronizationModel.findById(id);
    await disconnect();
    return result;
}

export async function updateOne(sync: Synchronization): Promise<Synchronization | null> {
    await connect();
    const doc = await SynchronizationModel.findById(sync._id);

    if(doc) {
        doc.itemStatus = sync.itemStatus
        doc.lastSyncAt = sync.lastSyncAt
        doc.syncStatus = sync.syncStatus
        await doc.save();
    }

    await disconnect();

    return doc;
}
