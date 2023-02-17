import { Handler } from "@netlify/functions";
import mongoose from 'mongoose';
// @deprecated

const InstitutionSchema = new mongoose.Schema({
    pluggyConnectorId: Number,
    name: String,
    imageUrl: String,
    primaryColor: String,
});

const Institution = mongoose.model("institutions", InstitutionSchema);

const mongoUri = process.env.VITE_MONGO_URI || 'mongodb://localhost:27017/guiabolso'

const handler :Handler = async (event, context) => {
    console.log('[connecting] ' + mongoUri)
    await mongoose.connect(mongoUri);
  
    const institutions = await Institution.find()

    await mongoose.disconnect()
    
    return {
        statusCode: 200,
        body: JSON.stringify(institutions),
    };
}

export { handler };