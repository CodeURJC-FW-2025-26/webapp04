import express from 'express';
import path from 'path';
import fs from 'fs/promises';

import * as movieCatalogue from './movieCatalogue.js';
import * as actorCatalogue from './actorCatalogue.js';
import { getImagePath, renameUploadedFile, uploadPoster } from './imageUploader.js';
import { createMovieSlug } from './utils/slugify.js';
import { validateMovie } from './utils/movieValidator.js';
import { createSuccessPage, createErrorPage } from './utils/statusPageHelper.js';
import { COUNTRIES } from './utils/countries.js';
import { GENRES } from './utils/genres.js';
import { AGE_RATING } from './utils/ageRating.js';
import { ObjectId } from "mongodb";

const router = express.Router();
export default router;

// Constants
const MOVIES_PER_PAGE = 6;
const MAX_PAGINATION_BUTTONS = 3;
const UPLOADS_FOLDER = './uploads';

// - - - ROUTES - - -

// Home
router.get('/', async (req, res) => {
    try {
        const { page, skip, limit } = getPaginationParams(req);

        const [totalMovies, movies, genres, countries, ageRatings] = await Promise.all([
            movieCatalogue.getTotalNumberOfMovies(),
            movieCatalogue.getMoviesPaginated(skip, limit),
            movieCatalogue.getAllGenres(),
            movieCatalogue.getAllCountries(),
            movieCatalogue.getAllAgeRatings()
        ]);

        const totalPages = Math.ceil(totalMovies / limit);
        const pagination = calculatePagination(page, totalPages);

        res.render('home', {
            movies: addReleaseYearToMovies(movies),
            page,
            totalPages,
            ...pagination,
            genres,
            countries,
            ageRatings
        });
    } catch (error) {
        console.error('Error loading home page:', error);
        renderErrorPage(res, 'unknown', 'page');
    }
});

// Search API
router.get('/api/search', async (req, res) => {
    try {
        const { page, skip, limit } = getPaginationParams(req);
        const searchParams = getSearchParams(req);

        const { movies, total } = await movieCatalogue.searchMovies(
            searchParams.searchQuery,
            searchParams.genre,
            searchParams.country,
            searchParams.ageRating,
            searchParams.sortBy,
            searchParams.sortOrder,
            skip,
            limit
        );

        const totalPages = Math.ceil(total / limit);
        const pagination = calculatePagination(page, totalPages);

        res.json({
            movies: addReleaseYearToMovies(movies),
            page,
            totalPages,
            ...pagination,
            total
        });
    } catch (error) {
        console.error('Error searching movies:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

// Movie Routes
router.get('/movie/:slug', async (req, res) => {
    try {
        const slug = req.params.slug;
        const movie = await movieCatalogue.getMovieBySlug(slug);

        if (!movie) {
            return renderErrorPage(res, 'notFound', 'movie');
        }

        const actors = await resolveActorsForMovie(movie);
        const releaseYear = extractYear(movie.releaseDate);

        res.render('movie', {
            ...movie,
            releaseYear,
            id: movie._id.toString(),
            slug: movie.slug,
            genresText: movie.genre?.join(', ') || '',
            countriesText: movie.countryOfProduction?.join(', ') || '',
            hasActors: actors.length > 0,
            actors
        });
    } catch (error) {
        console.error('Error loading movie details:', error);
        renderErrorPage(res, 'unknown', 'movie');
    }
});

router.get('/movie/:slug/poster', async (req, res) => {
    try {
        const slug = req.params.slug;
        const movie = await movieCatalogue.getMovieBySlug(slug);

        if (!movie?.poster) {
            return res.status(404).send('Poster not found');
        }

        const posterPath = path.join(UPLOADS_FOLDER, movie.poster);

        res.download(posterPath, movie.poster, (err) => {
            if (err) {
                console.error('Error sending poster:', err);
                if (!res.headersSent) {
                    res.status(500).send('Error downloading poster');
                }
            }
        });
    } catch (error) {
        console.error('Error loading poster:', error);
        res.status(500).send('Server error');
    }
});

router.get('/addNewMovie', (req, res) => {
    try {
        res.render('addNewMovie', {
            countries: COUNTRIES,
            action: `/addNewMovie`,
            ageRating: AGE_RATING,
            genres: GENRES

        });
    } catch (error) {
        console.error('Error loading add movie page:', error);
        renderErrorPage(res, 'unknown', 'page');
    }
});

router.post('/addNewMovie', uploadPoster, async (req, res) => {
    try {
        // Validate
        const validation = validateMovie(req.body, req.file);

        if (!validation.isValid) {
            const firstError = validation.errors[0];
            return renderValidationError(res, firstError.type, 'movie', firstError.details);
        }

        // Check for duplicate
        const releaseYear = extractYear(req.body.releaseDate);
        const slug = createMovieSlug(req.body.title, releaseYear);
        const existingMovie = await movieCatalogue.getMovieBySlug(slug);

        if (existingMovie) {
            return renderValidationError(res, 'duplicateTitle', 'movie', {
                title: req.body.title
            });
        }

        // Create movie
        const filename = renameUploadedFile(req.file.filename, req.body.title, releaseYear);
        const movie = createMovieObject(req.body, filename, releaseYear);

        await movieCatalogue.addMovie(movie);

        // Redirect to success page
        res.redirect(`/movie-created?title=${encodeURIComponent(movie.title)}&slug=${slug}`);

    } catch (error) {
        console.error('Error adding movie:', error);
        renderErrorPage(res, 'unknown', 'movie');
    }
});

router.delete('/api/movie/:slug', async (req, res) => {
    try {
        const slug = req.params.slug;
        const movie = await movieCatalogue.getMovieBySlug(slug);

        if (!movie) {
            return res.status(404).json({
                success: false,
                error: 'Movie not found',
                redirectUrl: '/error?type=notFound&entity=movie'
            });
        }

        await movieCatalogue.deleteMovie(slug);
        await deletePosterFile(movie.poster);

        res.json({
            success: true,
            message: 'Movie deleted successfully',
            redirectUrl: `/movie-deleted?title=${encodeURIComponent(movie.title)}`
        });
    } catch (error) {
        console.error('Error deleting movie:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete movie',
            redirectUrl: '/error?type=deleteError&entity=movie'
        });
    }
});
router.get('/editMovie/:slug', async (req, res) => {
    try {
        const slug = req.params.slug;
        const movie = await movieCatalogue.getMovieBySlug(slug);

        if (!movie) {
            return renderErrorPage(res, 'notFound', 'movie');
        }
        // Genres mit selected-Flag vorbereiten
        const genres = GENRES.map(g => ({
            value: g,
            selected: movie.genre.includes(g)
        }));

        const ageRating = AGE_RATING.map(r => ({
            value: r,
            selected: movie && String(movie.ageRating) === String(r)
        }));

        const countries = COUNTRIES.map(c => ({
            value: c,
            selected: movie.countryOfProduction.includes(c)
        }));

        res.render('editMovie', {
            movie,
            action: `/editMovie/${slug}`,
            countries,
            ageRating,
            genres

        });
    } catch (error) {
        console.error('Error loading edit person page:', error);
        renderErrorPage(res, 'unknown', 'movie');
    }
});

router.post('/editMovie/:slug', uploadPoster, async (req, res) => {
    try {
        const movieSlug = req.params.slug;
        const existingMovie = await movieCatalogue.getMovieBySlug(movieSlug);

        if (!existingMovie) { return renderErrorPage(res, 'notFound', 'movie'); }
        const releaseYear = extractYear(req.body.releaseDate);
        let filename;

        if (req.file) {
            filename = renameUploadedFile(
                req.file.filename,
                req.body.title,
                releaseYear,
                existingMovie.poster
            );
            console.log('New poster saved:', filename);
        } else {
            filename = existingMovie.poster;
            console.log('Keeping old poster:', filename);
        }

        const updatedMovie = createMovieObject(req.body, filename, releaseYear);

        // Validation
        const validation = validateMovie(req.body, req.file || { filename: filename });
        if (!validation.isValid) {
            const firstError = validation.errors[0];
            return renderValidationError(res, firstError.type, 'movie', firstError.details);
        }

        // Update in database
        await movieCatalogue.updateMovie(movieSlug, updatedMovie);

        res.redirect(`/movie-updated?title=${encodeURIComponent(updatedMovie.title)}&slug=${updatedMovie.slug}`);

    } catch (error) {
        console.error('Error updating movie:', error);
        renderErrorPage(res, 'unknown', 'movie');
    }
});

router.get('/posters/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const posterPath = path.join(UPLOADS_FOLDER, filename);

        // Send file to display in browser
        res.sendFile(path.resolve(posterPath), (err) => {
            if (err) {
                console.error('Error sending poster:', err);
                if (!res.headersSent) {
                    res.status(404).send('Poster not found');
                }
            }
        });
    } catch (error) {
        console.error('Error loading poster:', error);
        res.status(500).send('Server error');
    }
});

// Person/Actor Routes
router.get('/person/:slug', async (req, res) => {
    try {
        const slug = req.params.slug;
        const actor = await actorCatalogue.getActorBySlug(slug);

        if (!actor) {
            return renderErrorPage(res, 'notFound', 'actor');
        }

        const dateDetails = formatActorDateDetails(actor);
        const movies = await movieCatalogue.getMoviesByActor(actor._id);

        res.render('person', {
            ...actor,
            slug: actor.slug,
            alive: !dateDetails.dayOfDeathFormatted,
            ...dateDetails,
            movies: addReleaseYearToMovies(movies),
            hasMovies: movies.length > 0
        });
    } catch (error) {
        console.error('Error loading person details:', error);
        renderErrorPage(res, 'unknown', 'actor');
    }
});

router.get('/editPerson/:slug', async (req, res) => {
    try {
        const slug = req.params.slug;
        const actor = await actorCatalogue.getActorBySlug(slug);

        if (!actor) {
            return renderErrorPage(res, 'notFound', 'actor');
        }

        res.render('editPerson', {
            ...actor,
            slug: actor.slug
        });
    } catch (error) {
        console.error('Error loading edit person page:', error);
        renderErrorPage(res, 'unknown', 'actor');
    }
});

router.get('/editPerson', (req, res) => {
    try {
        res.render('editPerson', {
            placeholderName: 'Name',
            placeholderBirthPlace: 'Place of Birth',
            placeholderDescription: 'Description'
        });
    } catch (error) {
        console.error('Error loading edit person page:', error);
        renderErrorPage(res, 'unknown', 'page');
    }
});

// Status Pages
router.get('/movie-created', (req, res) => {
    const movieTitle = req.query.title || 'Unknown Movie';
    const movieSlug = req.query.slug;

    const pageData = createSuccessPage(
        'Movie Created Successfully',
        `"${movieTitle}" has been added.`,
        `/movie/${movieSlug}`,
        'bi-eye',
        'View Movie Details'
    );

    res.render('statusPage', pageData);
});

router.get('/movie-deleted', (req, res) => {
    const movieTitle = req.query.title || 'Unknown Movie';

    const pageData = createSuccessPage(
        'Movie Deleted Successfully',
        `"${movieTitle}" has been removed.`,
        '/',
        'bi-house-fill',
        'Go to Home'
    );

    res.render('statusPage', pageData);
});
router.get('/movie-updated', (req, res) => {
    const movieTitle = req.query.title || 'Unknown Movie';
    const movieSlug = req.query.slug;

    const pageData = createSuccessPage(
        'Movie Updated Successfully',
        `"${movieTitle}" has been updated.`,
        `/movie/${movieSlug}`,
        'bi-eye',
        'View Movie Details'
    );

    res.render('statusPage', pageData);
});

router.get('/error', (req, res) => {
    const errorType = req.query.type || 'unknown';
    const entity = req.query.entity || 'item';
    const details = req.query.details ? JSON.parse(req.query.details) : {};

    renderErrorPage(res, errorType, entity, details);
});

// - - - HELPER FUNCTIONS - - -

// Error Rendering
function renderErrorPage(res, errorType, entity, details = {}) {
    const pageData = createErrorPage(errorType, entity, details);
    res.status(pageData.statusCode || 500).render('statusPage', pageData);
}

function renderValidationError(res, errorType, entity, details = {}) {
    const pageData = createErrorPage(errorType, entity, details);
    res.status(400).render('statusPage', pageData);
}

// Pagination Helpers
function calculatePagination(currentPage, totalPages) {
    const pages = [];
    const { startPage, endPage } = getPaginationRange(currentPage, totalPages);

    for (let i = startPage; i <= endPage; i++) {
        pages.push({
            number: i,
            isCurrent: i === currentPage
        });
    }

    return {
        pages,
        hasPrev: currentPage > 1,
        hasNext: currentPage < totalPages,
        prevPage: currentPage - 1,
        nextPage: currentPage + 1
    };
}

function getPaginationRange(currentPage, totalPages) {
    if (totalPages <= MAX_PAGINATION_BUTTONS) {
        return { startPage: 1, endPage: totalPages };
    }

    if (currentPage <= 2) {
        return { startPage: 1, endPage: MAX_PAGINATION_BUTTONS };
    }

    if (currentPage >= totalPages - 1) {
        return {
            startPage: totalPages - (MAX_PAGINATION_BUTTONS - 1),
            endPage: totalPages
        };
    }

    return {
        startPage: currentPage - 1,
        endPage: currentPage + 1
    };
}

function getPaginationParams(req) {
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * MOVIES_PER_PAGE;
    return { page, skip, limit: MOVIES_PER_PAGE };
}

// Search & Filter Helpers
function getSearchParams(req) {
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

// Actor Helpers
async function resolveActorsForMovie(movie) {
    if (!Array.isArray(movie.actors)) {
        return [];
    }

    const actorsResolved = [];

    for (const ref of movie.actors) {
        const actor = await actorCatalogue.getActor(ref.actorId);
        if (actor) {
            actorsResolved.push({
                id: actor._id.toString(),
                slug: actor.slug,
                name: actor.name,
                portrait: actor.portrait,
                description: actor.description,
                role: ref.role
            });
        }
    }

    return actorsResolved;
}

function formatActorDateDetails(actor) {
    const birthdayFormatted = formatDate(actor.dateOfBirth);
    const dayOfDeathFormatted = actor.dateOfDeath ? formatDate(actor.dateOfDeath) : null;
    const age = actor.dateOfDeath ? null : calculateAge(actor.dateOfBirth);
    const ageAtDeath = actor.dateOfDeath ? calculateAge(actor.dateOfBirth, actor.dateOfDeath) : null;

    return { birthdayFormatted, age, dayOfDeathFormatted, ageAtDeath };
}

// Date Helpers
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function extractYear(dateString) {
    return dateString ? new Date(dateString).getFullYear() : '';
}

function calculateAge(birthDate, deathDate = null) {
    const endDate = deathDate ? new Date(deathDate) : new Date();
    const startDate = new Date(birthDate);

    const ageInMilliseconds = endDate - startDate;
    const ageDate = new Date(ageInMilliseconds);

    return Math.abs(ageDate.getUTCFullYear() - 1970);
}

// Movie Helpers
function addReleaseYearToMovies(movies) {
    return movies.map(movie => ({
        ...movie,
        releaseYear: extractYear(movie.releaseDate)
    }));
}

function createMovieObject(formData, filename, releaseYear) {
    return {
        title: formData.title,
        poster: filename, // not necessary?
        slug: createMovieSlug(formData.title, releaseYear),
        description: formData.description,
        genre: ensureArray(formData.genre),
        releaseDate: formData.releaseDate,
        countryOfProduction: ensureArray(formData.countryOfProduction),
        ageRating: formData.ageRating, // might also be 'A'
        actors: null // TODO: actually add actors in array in movies.json and also in actors.json
    };
}

function ensureArray(value) {
    return Array.isArray(value) ? value : [value];
}

// File Helpers
async function deletePosterFile(posterFilename) {
    if (!posterFilename) {
        return;
    }

    try {
        const posterPath = path.join(UPLOADS_FOLDER, posterFilename);
        await fs.unlink(posterPath);
    } catch (error) {
        console.error('Could not delete poster file:', error);
    }
}