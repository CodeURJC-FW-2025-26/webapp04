import express from 'express';
import path from 'path';
import fs from 'fs/promises';

import * as movieCatalogue from './movieCatalogue.js';
import * as actorCatalogue from './actorCatalogue.js';
import { getImagePath, renameUploadedFile, uploadPoster } from './imageUploader.js';
import { createMovieSlug } from './utils/slugify.js';

const router = express.Router();
export default router;

// Constants
const MOVIES_PER_PAGE = 6;
const MAX_PAGINATION_BUTTONS = 3;
const UPLOADS_FOLDER = './uploads';

// - - - ROUTES - - -

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

        res.render('index', {
            movies: addReleaseYearToMovies(movies),
            page,
            totalPages,
            ...pagination,
            genres,
            countries,
            ageRatings
        });
    } catch (error) {
        res.status(500).send('Server error');
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
        res.status(500).send('Server error');
    }
});

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
        res.status(500).json({ error: 'Search failed' });
    }
});

router.get('/movie/:slug', async (req, res) => {
    try {
        const slug = req.params.slug;
        const movie = await movieCatalogue.getMovieBySlug(slug);

        if (!movie) {
            return res.status(404).send('Movie not found');
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
        res.status(500).send('Server error');
    }
});

router.get('/person/:slug', async (req, res) => {
    try {
        const slug = req.params.slug;
        const actor = await actorCatalogue.getActorBySlug(slug);

        if (!actor) {
            return res.status(404).send('Actor not found');
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
        res.status(500).send('Server error');
    }
});



router.get('/editPerson/:slug', async (req, res) => {
    try {
        const slug = req.params.slug;
        const actor = await actorCatalogue.getActorBySlug(slug);

        if (!actor) {
            return res.status(404).send('Actor not found');
        }

        const dateDetails = formatActorDateDetails(actor);
        const movies = await movieCatalogue.getMoviesByActor(actor._id);

        res.render('editPerson', {
            ...actor,
            slug: actor.slug
        });
    } catch (error) {
        res.status(500).send('Server error');
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
        res.status(500).send('Server error');
    }
});

router.get('/addNewMovie', (req, res) => {
    try {
        res.render('addNewMovie', {});
    } catch (error) {
        res.status(500).send('Server error');
    }
});


router.post('/addNewMovie', uploadPoster, async (req, res) => {
    try {
        const releaseYear = extractYear(req.body.releaseDate);
        const filename = renameUploadedFile(req.file?.filename, req.body.title, releaseYear);

        const movie = createMovieObject(req.body, filename, releaseYear);

        await movieCatalogue.addMovie(movie);
        res.redirect('/');
    } catch (error) {
        res.status(500).send('Server error');
    }
});

router.delete('/api/movie/:slug', async (req, res) => {
    try {
        const slug = req.params.slug;
        const movie = await movieCatalogue.getMovieBySlug(slug);

        if (!movie) {
            return res.status(404).json({
                success: false,
                error: 'Movie not found'
            });
        }

        await movieCatalogue.deleteMovie(slug);
        await deletePosterFile(movie.poster);

        res.json({
            success: true,
            message: 'Movie deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to delete movie'
        });
    }
});

// - - - HELPER FUNCTIONS - - -

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
        poster: getImagePath(filename),
        slug: createMovieSlug(formData.title, releaseYear),
        description: formData.description,
        genre: ensureArray(formData.genre),
        releaseDate: formData.releaseDate,
        countryOfProduction: ensureArray(formData.countryOfProduction),
        ageRating: Number(formData.ageRating),
        actors: null // TODO: actually add actors in array
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