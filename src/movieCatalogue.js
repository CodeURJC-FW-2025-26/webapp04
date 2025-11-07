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
