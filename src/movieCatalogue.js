import { database } from './database.js';
import { createMovieSlug } from './utils/slugify.js';

const collection = database.collection('movies');
await collection.createIndex({ title: 'text' });
await collection.createIndex({ slug: 1 }, { unique: true });

export async function addMovie(movie) {
    if (!movie.slug && movie.title && movie.releaseYear) {
        movie.slug = createMovieSlug(movie.title, movie.releaseYear);
    }

    const result = await collection.insertOne(movie);
    return result.insertedId;
}

export async function getMovie(movieId) {
    return await collection.findOne({ _id: movieId });
}
export async function getMovieByTitle(movieTitle) {
    return await collection.findOne({ _id: movieTitle });
}

export async function getMovieBySlug(slug) {
    return await collection.findOne({ slug: slug });
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

export async function searchMovies(searchQuery, genre, country, sortBy, sortOrder, skip, limit) {
    const query = {};

    if (searchQuery && searchQuery.trim() !== '') {
        query.title = { $regex: searchQuery, $options: 'i' };
    }

    if (genre && genre !== 'all') {
        query.genre = genre;
    }

    if (country && country !== 'all') {
        query.countryOfProduction = country;
    }

    const sort = {};
    if (sortBy) {
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
        sort.releaseDate = -1;
    }

    const movies = await collection
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray();

    const total = await collection.countDocuments(query);

    return { movies, total };
}

export async function getAllGenres() {
    const movies = await collection.find().toArray();
    const genresSet = new Set();

    movies.forEach(movie => {
        if (Array.isArray(movie.genre)) {
            movie.genre.forEach(g => genresSet.add(g));
        }
    });

    return Array.from(genresSet).sort();
}

export async function getAllCountries() {
    const movies = await collection.find().toArray();
    const countrySet = new Set();

    movies.forEach(movie => {
        if (Array.isArray(movie.countryOfProduction)) {
            movie.countryOfProduction.forEach(g => countrySet.add(g));
        }
    });

    return Array.from(countrySet).sort();
}

export async function deleteMovie(slug) {
    await collection.deleteOne({slug: slug});
}