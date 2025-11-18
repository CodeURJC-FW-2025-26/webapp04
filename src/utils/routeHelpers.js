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

// Movie Helpers
export function addReleaseYearToMovies(movies) {
    return movies.map(movie => ({
        ...movie,
        releaseYear: extractYear(movie.releaseDate)
    }));
}

export function ensureArray(value) {
    return Array.isArray(value) ? value : [value];
}

// File Helpers
export async function deletePosterFile(posterFilename) {
    if (!posterFilename) return;
    
    try {
        const posterPath = path.join(POSTER_FOLDER, posterFilename);
        await fs.unlink(posterPath);
    } catch (error) {
        console.error('Could not delete poster file:', error);
    }
}

export async function deletePortraitFile(portraitFilename) {
    if (!portraitFilename) return;
    
    try {
        const portraitPath = path.join(ACTOR_FOLDER, portraitFilename);
        await fs.unlink(portraitPath);
    } catch (error) {
        console.error('Could not delete portrait file:', error);
    }
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