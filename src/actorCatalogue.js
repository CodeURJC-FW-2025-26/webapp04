import { database } from './database.js';
import { createActorSlug } from './utils/slugify.js';

const collection = database.collection('actors');
await collection.createIndex({ slug: 1 }, { unique: true });

export async function addActor(actor) {
    if (!actor.slug && actor.name) {
        actor.slug = createActorSlug(actor.name);
    }

    const result = await collection.insertOne(actor);
    return result.insertedId;
}

export async function getActor(actorId) {
    return await collection.findOne({ _id: actorId });
}

export async function getActorBySlug(slug) {
    return await collection.findOne({ slug: slug });
}

export async function getActors() {
    return await collection.find().toArray();
}