import express from 'express';
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

router.get('/movie/:slug', async (req, res) => {
    try {
        const slug = req.params.slug;
        const movie = await movieCatalogue.getMovieBySlug(slug);

        if (!movie) {
            return res.status(404).send('Movie not found');
        }

        const actors = await resolveActorsForMovie(movie);
        const releaseYear = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : '';

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
    }
});

router.get('/person/:slug', async (req, res) => {
    try {
        const slug = req.params.slug;
        const actor = await actorCatalogue.getActorBySlug(slug);

        if (!actor) {
            return res.status(404).send('Actor not found');
        }

        const { birthdayFormatted, age, dayOfDeathFormatted, ageAtDeath } = formatActorDateDetails(actor);
        const alive = dayOfDeathFormatted === null;

        const moviesRaw = await movieCatalogue.getMoviesByActor(actor._id);

        const movies = moviesRaw.map(m => ({
            ...m,
            releaseYear: m.releaseDate ? new Date(m.releaseDate).getFullYear() : ''
        }));

        res.render('person', {
            ...actor,
            slug: actor.slug,
            alive,
            birthdayFormatted,
            age,
            dayOfDeathFormatted,
            ageAtDeath,
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
    let age = null; let dayOfDeathFormatted = null; let ageAtDeath = null;

    if (actor.dateOfDeath) {
        dayOfDeathFormatted = formatDate(actor.dateOfDeath);
        ageAtDeath = getActorsAgeAtDeath(actor);
    } else {
        age = getActorsCurrentAge(actor);
    }

    return { birthdayFormatted, age, dayOfDeathFormatted, ageAtDeath };
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

function getActorsCurrentAge(actor) {
    return calculateYearDifference(actor.dateOfBirth);
}

function getActorsAgeAtDeath(actor) {
    if (!actor.dateOfDeath) { return null; }
    return calculateYearDifference(actor.dateOfBirth, actor.dateOfDeath);
}

function calculateYearDifference(startDate, endDate) {
    const endDateMs = !endDate ? Date.now() : new Date(endDate).getTime();
    const startDateMs = new Date(startDate).getTime();

    const ageDifMs = endDateMs - startDateMs;
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}