import { database } from './database.js';

const collection = database.collection('actors');

export async function addActor(actor) {
    const result = await collection.insertOne(actor);
    return result.insertedId;
}

export async function getActor(actorId) {
    return await collection.findOne({ _id: actorId });
}

export async function getActors() {
    return await collection.find().toArray();
}
