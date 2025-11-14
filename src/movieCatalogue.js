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
    return await collection
        .find()
        .sort({ releaseDate: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();
}

export async function getMoviesByActor(actorId) {
    return await collection
        .find({ actors: { $elemMatch: { actorId: actorId } } })
        .toArray();
}

export async function getTotalNumberOfMovies() {
    return await collection.countDocuments();
}

export async function searchMovies(searchQuery, genre, country, ageRating, sortBy, sortOrder, skip, limit) {
    const query = buildSearchQuery(searchQuery, genre, country, ageRating);
    const sort = buildSortObject(sortBy, sortOrder);

    const [movies, total] = await Promise.all([
        collection.find(query).sort(sort).skip(skip).limit(limit).toArray(),
        collection.countDocuments(query)
    ]);

    return { movies, total };
}

export async function getAllGenres() {
    return await getDistinctArrayValues('genre');
}

export async function getAllCountries() {
    return await getDistinctArrayValues('countryOfProduction');
}

export async function getAllAgeRatings() {
    const ageRatings = await collection.distinct('ageRating');

    return ageRatings
        .map(normalizeAgeRating)
        .filter(Boolean)
        .sort(compareAgeRatings);
}

export async function deleteMovie(slug) {
    const result = await collection.deleteOne({ slug: slug });
    return result.deletedCount > 0;
}

// - - - HELPER FUNCTIONS - - -

function buildSearchQuery(searchQuery, genre, country, ageRating) {
    const query = {};

    if (searchQuery?.trim()) {
        query.title = { $regex: searchQuery, $options: 'i' };
    }

    addArrayFilter(query, 'genre', genre);
    addArrayFilter(query, 'countryOfProduction', country);
    addArrayFilter(query, 'ageRating', ageRating);

    return query;
}

function addArrayFilter(query, field, value) {
    if (!value || value === 'all') {
        return;
    }

    if (Array.isArray(value) && value.length > 0) {
        query[field] = { $in: value };
    } else if (!Array.isArray(value)) {
        query[field] = value;
    }
}

function buildSortObject(sortBy, sortOrder) {
    const sort = {};
    const field = sortBy || 'releaseDate';
    sort[field] = sortOrder === 'desc' ? -1 : 1;
    return sort;
}

async function getDistinctArrayValues(field) {
    const result = await collection.aggregate([
        { $unwind: `$${field}` },
        { $group: { _id: `$${field}` } },
        { $sort: { _id: 1 } }
    ]).toArray();

    return result.map(item => item._id);
}

function normalizeAgeRating(value) {
    const parsed = parseInt(value, 10);

    if (!isNaN(parsed) && String(parsed) === String(value).trim()) {
        return parsed;
    }

    return String(value).trim() || null;
}

function compareAgeRatings(a, b) {
    const aIsNum = typeof a === 'number';
    const bIsNum = typeof b === 'number';

    if (!aIsNum && bIsNum) return -1;
    if (aIsNum && !bIsNum) return 1;

    if (!aIsNum && !bIsNum) {
        return a.localeCompare(b);
    }

    return a - b;
}