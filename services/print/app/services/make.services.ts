import MongoDBManager from "../db/connection";
import Make from "../models/make";

const mongoDBManager = new MongoDBManager();

export async function getmake(id: Object, database: string): Promise<Make> {
    try {
        await mongoDBManager.initConnection(database);
        const makesCollection = mongoDBManager.getCollection('makes');
        const makes: Make = await makesCollection.findOne({ _id: id})
        return makes;
    } catch (error) {
        console.log(error)
    }
}