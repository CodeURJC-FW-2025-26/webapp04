import { getMovieByTitle } from '../movieCatalogue.js';

export async function validateMovie(movie) {
    const errors = [];
    const currentYear = new Date().getFullYear();


    if (!movie.title || !movie.title.trim()) {
        errors.push('Title is required.');
    } else {
        const titleTrimmed = movie.title.trim();

        // Must start with a capital letter
        if (!/^[A-Z]/.test(titleTrimmed)) {
            errors.push('Title must start with a capital letter.');
        }

        // Must not exceed 200 characters
        if (titleTrimmed.length > 200) {
            errors.push('Title cannot exceed 200 characters.');
        }

        // Must not exist already in DB (only if format is valid)
        if (/^[A-Z]/.test(titleTrimmed)) {
            try {
                const existingMovie = await getMovieByTitle(titleTrimmed);
                if (existingMovie) {
                    errors.push('A movie with this title already exists.');
                }
            } catch (error) {
                console.error('Error checking title uniqueness:', error);
            }
        }
    }

    if (!movie.description || !movie.description.trim()) {
        errors.push('Description is required.');
    } else {
        const descLength = movie.description.trim().length;

        if (descLength < 20) {
            errors.push(`Description must be at least 20 characters (current: ${descLength}).`);
        }

        if (descLength > 500) {
            errors.push(`Description cannot exceed 500 characters (current: ${descLength}).`);
        }
    }

    if (!movie.releaseDate) {
        errors.push('Release date is required.');
    } else {
        const releaseDate = new Date(movie.releaseDate);

        if (isNaN(releaseDate.getTime())) {
            errors.push('Release date is not valid.');
        } else {
            const year = releaseDate.getFullYear();

            if (year < 1900) {
                errors.push(`Release year must be between 1900 and ${currentYear + 1}.`);
            }

            if (year > currentYear + 1) {
                errors.push(`Release year must be between 1900 and ${currentYear + 1}.`);
            }
        }
    }

    if (!movie.genre || !Array.isArray(movie.genre) || movie.genre.length === 0) {
        errors.push('At least one genre is required.');
    } else {
        const validGenres = [
            'action', 'adventure', 'animation', 'comedy', 'crime',
            'drama', 'family', 'fantasy', 'history', 'horror',
            'music', 'romance', 'mystery', 'science fiction', 'thriller', 'war'
        ];

        const invalidGenres = movie.genre.filter(g => !validGenres.includes(g.toLowerCase()));

        if (invalidGenres.length > 0) {
            errors.push(`Invalid genres: ${invalidGenres.join(', ')}`);
        }
    }


    if (!movie.countryOfProduction || !Array.isArray(movie.countryOfProduction) || movie.countryOfProduction.length === 0) {
        errors.push('At least one country of production is required.');
    } else {
        const validCountries = [
            'Belgium', 'Brazil', 'Chile', 'Denmark', 'Finland', 'France',
            'Germany', 'Greece', 'Italy', 'Japan', 'Latvia', 'Mexico',
            'Spain', 'Sweden', 'Switzerland', 'Turkey', 'UK', 'USA'
        ];

        const invalidCountries = movie.countryOfProduction.filter(c => !validCountries.includes(c));

        if (invalidCountries.length > 0) {
            errors.push(`Invalid countries: ${invalidCountries.join(', ')}`);
        }
    }

    if (!movie.ageRating || movie.ageRating.trim() === '') {
        errors.push('Age rating is required.');
    } else {
        const validRatings = ['A', '7', '12', '16', '18'];

        if (!validRatings.includes(movie.ageRating)) {
            errors.push(`Age rating must be one of: ${validRatings.join(', ')}`);
        }
    }

    if (movie.poster) {
        const validExtensions = ['.jpg', '.jpeg', '.png'];
        const hasValidExtension = validExtensions.some(ext =>
            movie.poster.toLowerCase().endsWith(ext)
        );

        if (!hasValidExtension) {
            errors.push('Poster must be a JPG, JPEG, or PNG image.');
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
}