import { VALIDATION, AGE_RATINGS } from '../constants.js';

export function validateMovie(movieData, file) {
    const errors = [];
    const DESCRIPTION_MIN = VALIDATION.DESCRIPTION.MIN_LENGTH;
    const DESCRIPTION_MAX = VALIDATION.DESCRIPTION.MAX_LENGTH;
    const VALID_AGE_RATINGS = AGE_RATINGS;
    const CURRENT_YEAR = VALIDATION.DATES.CURRENT_YEAR;
    const MIN_YEAR = VALIDATION.DATES.MIN_YEAR;

    // Required fields - Title
    if (!movieData.title?.trim()) {
        errors.push({
            type: 'emptyFields',
            details: { fields: 'title' }
        });
    }

    // Title Capitalization (if available)
    if (movieData.title && !startsWithCapital(movieData.title)) {
        errors.push({ type: 'titleCapitalization' });
    }

    // Required fields - Description
    if (!movieData.description?.trim()) {
        errors.push({
            type: 'emptyFields',
            details: { fields: 'description' }
        });
    }

    // Description Length (if available)
    if (movieData.description) {
        const descriptionLength = movieData.description.trim().length;
        if (descriptionLength < DESCRIPTION_MIN || descriptionLength > DESCRIPTION_MAX) {
            errors.push({
                type: 'descriptionLength',
                details: {
                    min: DESCRIPTION_MIN,
                    max: DESCRIPTION_MAX,
                    current: descriptionLength
                }
            });
        }
    }

    // Required fields - Release Date
    if (!movieData.releaseDate) {
        errors.push({
            type: 'emptyFields',
            details: { fields: 'release date' }
        });
    }

    // Valid Date (if available)
    if (movieData.releaseDate) {
        const releaseDate = new Date(movieData.releaseDate);
        const releaseYear = releaseDate.getFullYear();

        if (isNaN(releaseDate.getTime())) {
            errors.push({ type: 'invalidDate' });
        } else if (releaseYear < MIN_YEAR || releaseYear > CURRENT_YEAR + 5) {
            errors.push({
                type: 'invalidDate',
                details: {
                    min: MIN_YEAR,
                    max: CURRENT_YEAR + 5
                }
            });
        }
    }

    // Required fields - Age Rating
    if (!movieData.ageRating) {
        errors.push({
            type: 'emptyFields',
            details: { fields: 'age rating' }
        });
    }

    // Valid Age Rating (if available)
    if (movieData.ageRating && !VALID_AGE_RATINGS.includes(movieData.ageRating)) {
        errors.push({
            type: 'invalidAgeRating',
            details: {
                validValues: VALID_AGE_RATINGS.join(', ')
            }
        });
    }

    // Required fields - Genre
    if (!movieData.genre || (Array.isArray(movieData.genre) && movieData.genre.length === 0)) {
        errors.push({
            type: 'emptyFields',
            details: { fields: 'genre' }
        });
    }

    // Required fields - Country
    if (!movieData.countryOfProduction || (Array.isArray(movieData.countryOfProduction) && movieData.countryOfProduction.length === 0)) {
        errors.push({
            type: 'emptyFields',
            details: { fields: 'country of production' }
        });
    }

    // Required fields - Poster
    if (!file) {
        errors.push({ type: 'missingPoster' });
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

function startsWithCapital(str) {
    if (!str || str.length === 0) return false;
    return /^[A-Z]/.test(str.trim());
}