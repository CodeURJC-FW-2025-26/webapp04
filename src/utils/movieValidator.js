import { VALIDATION, AGE_RATINGS } from '../constants.js';

export function validateMovie(movieData) {
    const errors = [];
    const DESCRIPTION_MIN = VALIDATION.DESCRIPTION.MIN_LENGTH;
    const DESCRIPTION_MAX = VALIDATION.DESCRIPTION.MAX_LENGTH;
    const VALID_AGE_RATINGS = AGE_RATINGS;
    const CURRENT_YEAR = VALIDATION.DATES.CURRENT_YEAR;
    const MIN_YEAR = VALIDATION.DATES.MIN_YEAR;

    // Required fields - Title
    if (!movieData.title?.trim()) {
        errors.push({
            field: 'title',
            type: 'emptyFields',
            message: 'Title is required'
        });
    }

    // Title Capitalization (if available)
    if (movieData.title && !startsWithCapital(movieData.title)) {
        errors.push({
            field: 'title',
            type: 'titleCapitalization',
            message: 'Title must start with a capital letter'
        });
    }

    // Required fields - Description
    if (!movieData.description?.trim()) {
        errors.push({
            field: 'description',
            type: 'emptyFields',
            message: 'Description is required'
        });
    }

    // Description Length (if available)
    if (movieData.description) {
        const descriptionLength = movieData.description.trim().length;
        if (descriptionLength < DESCRIPTION_MIN || descriptionLength > DESCRIPTION_MAX) {
            errors.push({
                field: 'description',
                type: 'descriptionLength',
                message: `Description must be between ${DESCRIPTION_MIN} and ${DESCRIPTION_MAX} characters`
            });
        }
    }

    // Required fields - Release Date
    if (!movieData.releaseDate) {
        errors.push({
            field: 'releaseDate',
            type: 'emptyFields',
            message: 'Release date is required'
        });
    }

    // Valid Date (if available)
    if (movieData.releaseDate) {
        const releaseDate = new Date(movieData.releaseDate);
        const releaseYear = releaseDate.getFullYear();

        if (isNaN(releaseDate.getTime())) {
            errors.push({
                field: 'releaseDate',
                type: 'invalidDate',
                message: 'Please provide a valid date'
            });
        } else if (releaseYear < MIN_YEAR || releaseYear > CURRENT_YEAR + 5) {
            errors.push({
                field: 'releaseDate',
                type: 'invalidDate',
                message: `Release date must be between ${MIN_YEAR} and ${CURRENT_YEAR + 5}`
            });
        }
    }

    // Required fields - Age Rating
    if (!movieData.ageRating) {
        errors.push({
            field: 'ageRating',
            type: 'emptyFields',
            message: 'Age rating is required'
        });
    }

    // Valid Age Rating (if available)
    if (movieData.ageRating && !VALID_AGE_RATINGS.includes(movieData.ageRating)) {
        errors.push({
            field: 'ageRating',
            type: 'invalidAgeRating',
            message: `Age rating must be one of the following: ${VALID_AGE_RATINGS.join(', ')}`
        });
    }

    // Required fields - Genre
    if (!movieData.genre || (Array.isArray(movieData.genre) && movieData.genre.length === 0)) {
        errors.push({
            field: 'genre',
            type: 'emptyFields',
            message: 'At least one genre must be selected'
        });
    }

    // Required fields - Country
    if (!movieData.countryOfProduction || (Array.isArray(movieData.countryOfProduction) && movieData.countryOfProduction.length === 0)) {
        errors.push({
            field: 'countryOfProduction',
            type: 'emptyFields',
            message: 'At least one country of production must be selected'
        });
    }

    // Poster is optional, no error if missing

    return {
        isValid: errors.length === 0,
        errors
    };
}

function startsWithCapital(str) {
    if (!str || str.length === 0) return false;
    return /^[A-Z]/.test(str.trim());
}