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

export async function searchActors(query) {
    return await collection
        .find({
            name: { $regex: query, $options: 'i' }  // Case-insensitive
        })
        .limit(10)
        .toArray();
}

export async function updateActor(slug, updatedActor) {
    try {
        // Regenerar slug si cambió el nombre
        if (updatedActor.name) {
            updatedActor.slug = createActorSlug(updatedActor.name);
        }

        const result = await collection.findOneAndUpdate(
            { slug: slug },
            { $set: updatedActor },
            { returnDocument: 'after' }
        );

        if (!result) {
            throw new Error('Actor not found for update');
        }

        return result;
    } catch (error) {
        console.error('Error in updateActor:', error);
        throw error;
    }
}