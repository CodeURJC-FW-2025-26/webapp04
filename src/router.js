import express from 'express';
import { ObjectId } from 'mongodb';

import * as movieCatalogue from './movieCatalogue.js';
import * as actorCatalogue from './actorCatalogue.js';

const router = express.Router();
export default router;

const MOVIES_PER_PAGE = 6;
const MAX_PAGINATION_BUTTONS = 3;

// - - - ROUTES - - -

router.get('/', async (req, res) => {
    try {
        const { page, skip, limit } = getPaginationParams(req);

        const [totalMovies, movies, genres] = await Promise.all([
            movieCatalogue.getTotalNumberOfMovies(),
            movieCatalogue.getMoviesPaginated(skip, limit),
            movieCatalogue.getAllGenres()
        ]);

        const totalPages = Math.ceil(totalMovies / limit);
        const pagination = calculatePagination(page, totalPages);

        res.render('index', {
            movies: movies.map(m => ({
                ...m,
                releaseYear: m.releaseDate ? new Date(m.releaseDate).getFullYear() : ''
            })),
            page,
            totalPages,
            ...pagination,
            genres
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
            searchParams.sortBy,
            searchParams.sortOrder,
            skip,
            limit
        );

        const totalPages = Math.ceil(total / limit);
        const pagination = calculatePagination(page, totalPages);

        res.json({
            movies: movies.map(m => ({
                ...m,
                releaseYear: m.releaseDate ? new Date(m.releaseDate).getFullYear() : ''
            })),
            page,
            totalPages,
            ...pagination,
            total
        });
    } catch (error) {
        res.status(500).json({ error: 'Search failed' });
    }
});

// Route for movies with slug
router.get('/movieDetails/:slug', async (req, res) => {
    try {
        const slug = req.params.slug;
        const movie = await movieCatalogue.getMovieBySlug(slug);

        if (!movie) {
            return res.status(404).send('Movie not found');
        }

        const actors = await resolveActorsForMovie(movie);

        res.render('movieDetails', {
            ...movie,
            id: movie._id.toString(),
            slug: movie.slug,
            genresText: movie.genre?.join(', ') || '',
            countriesText: movie.countryOfProduction?.join(', ') || '',
            hasActors: actors.length > 0,
            actors
        });
    } catch (error) {
        console.error('Error loading movie details:', error);
        res.status(500).send('Server error');
    }
});

// Route for movies without slug (backwards compatibility)
router.get('/movieDetails/:id', async (req, res) => {
    try {
        const movieId = new ObjectId(req.params.id);
        const movie = await movieCatalogue.getMovie(movieId);

        if (!movie) {
            return res.status(404).send('Movie not found');
        }

        if (movie.slug) {
            return res.redirect(301, `/movie/${movie.slug}`);
        }

        const actors = await resolveActorsForMovie(movie);

        const releaseYear = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : '';

        res.render('movieDetails', {
            ...movie,
            releaseYear,
            id: movie._id.toString(),
            genresText: movie.genre?.join(', ') || '',
            countriesText: movie.countryOfProduction?.join(', ') || '',
            hasActors: actors.length > 0,
            actors
        });
    } catch (error) {
        res.status(500).send('Server error');
    }
});

router.get('/personDetails/:id', async (req, res) => {
    try {
        const actorId = new ObjectId(req.params.id);
        const actor = await actorCatalogue.getActor(actorId);

        if (!actor) {
            return res.status(404).send('Actor not found');
        }

        const { birthdayFormatted, age } = formatActorDetails(actor);
        const moviesRaw = await movieCatalogue.getMoviesByActor(actorId);

        const movies = moviesRaw.map(m => ({
            ...m,
            releaseYear: m.releaseDate ? new Date(m.releaseDate).getFullYear() : ''
        }));

        res.render('personDetails', {
            ...actor,
            birthdayFormatted,
            age,
            movies,
            hasMovies: movies.length > 0
        });
    } catch (error) {
        res.status(500).send('Server error');
    }
});

router.get('/addNewMovie', (req, res) => {
    res.render('addNewMovie');
});

router.post('/addNewMovie', (req, res) => {
    res.render('addNewMovie', {
        title: req.body.title
    });
});

// - - - HELPER - - -

function calculatePagination(currentPage, totalPages) {
    const pages = [];
    let startPage, endPage;

    if (totalPages <= MAX_PAGINATION_BUTTONS) {
        startPage = 1;
        endPage = totalPages;
    } else {
        if (currentPage <= 2) {
            startPage = 1;
            endPage = MAX_PAGINATION_BUTTONS;
        } else if (currentPage >= totalPages - 1) {
            startPage = totalPages - (MAX_PAGINATION_BUTTONS - 1);
            endPage = totalPages;
        } else {
            startPage = currentPage - 1;
            endPage = currentPage + 1;
        }
    }

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

function getPaginationParams(req) {
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * MOVIES_PER_PAGE;
    return { page, skip, limit: MOVIES_PER_PAGE };
}

function getSearchParams(req) {
    return {
        searchQuery: req.query.q || '',
        genre: req.query.genre || 'all',
        sortBy: req.query.sortBy || 'releaseDate',
        sortOrder: req.query.sortOrder || 'desc'
    };
}

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
                name: actor.name,
                portrait: actor.portrait,
                description: actor.description,
                role: ref.role
            });
        }
    }

    return actorsResolved;
}

function formatActorDetails(actor) {
    const birthDate = new Date(actor.dateOfBirth);
    const birthdayFormatted = birthDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });

    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    return { birthdayFormatted, age };
}