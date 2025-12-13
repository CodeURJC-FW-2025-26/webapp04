import path from 'path';
import fs from 'fs/promises';
import { PATHS } from '../constants.js';

// Constants
const POSTER_FOLDER = PATHS.MOVIE_POSTERS_FULL;
const ACTOR_FOLDER = PATHS.ACTORS_FULL;

// Date Helpers
export function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

export function extractYear(dateString) {
    return dateString ? new Date(dateString).getFullYear() : '';
}

export function calculateAge(birthDate, deathDate = null) {
    const endDate = deathDate ? new Date(deathDate) : new Date();
    const startDate = new Date(birthDate);

    const ageInMilliseconds = endDate - startDate;
    const ageDate = new Date(ageInMilliseconds);

    return Math.abs(ageDate.getUTCFullYear() - 1970);
}

export function ensureArray(value) {
    return Array.isArray(value) ? value : [value];
}

// Movie Helpers
export function addReleaseYearToMovies(movies) {
    return movies.map(movie => ({
        ...movie,
        releaseYear: extractYear(movie.releaseDate)
    }));
}

// Search & Filter Helpers
export function getSearchParams(req) {
    const normalizeParam = (param) => {
        if (!param || param === 'all') return 'all';
        const arr = Array.isArray(param) ? param : [param];
        return arr.filter(Boolean);
    };

    return {
        searchQuery: req.query.q?.trim() || '',
        genre: normalizeParam(req.query.genre),
        country: normalizeParam(req.query.country),
        ageRating: normalizeParam(req.query.ageRating),
        sortBy: req.query.sortBy || 'releaseDate',
        sortOrder: req.query.sortOrder || 'desc'
    };
}