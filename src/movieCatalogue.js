import { database } from './database.js';

const collection = database.collection('movies');

export async function addMovie(movie) {
    const result = await collection.insertOne(movie);
    return result.insertedId;
}

export async function getMovie(movieId) {
    return await collection.findOne({ _id: movieId });
}

export async function getMovies() {
    return await collection.find().toArray();
}

export async function getMoviesPaginated(skip, limit) {
    return await collection.find().skip(skip).limit(limit).toArray();
}

export async function getMoviesByActor(actorId) {
    return await collection.find({ actors: { $elemMatch: { actorId: actorId } } }).toArray();
}

export async function getTotalNumberOfMovies() {
    return await collection.countDocuments();
}