import mongoose from 'mongoose';

const mongoUri = process.env.VITE_MONGO_URI ?? ''
 
export function connect() {
    console.log('[Mongo] connecting... ' + mongoUri)
    return mongoose.connect(mongoUri)
}
 
export function disconnect() {
    console.log('[Mongo] disconnecting... ' + mongoUri)
    return mongoose.disconnect()
}