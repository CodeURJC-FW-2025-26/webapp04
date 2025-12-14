import express from 'express';

import { getPaginationParams } from '../middleware/pagination.js';
import { getSearchParams } from '../utils/routeHelpers.js';
import { SearchService } from '../services/SearchService.js';
import { MovieService } from '../services/MovieService.js';
import { ActorService } from '../services/ActorService.js';
import { NotFoundError } from '../utils/errors.js';
import { sendJsonNotFoundError, sendJsonServerError } from '../middleware/errorHandler.js';

const router = express.Router();
const searchService = new SearchService();
const movieService = new MovieService();
const actorService = new ActorService();

// Search
router.get('/search', async (req, res) => {
    try {
        const { page, skip, limit } = getPaginationParams(req);
        const searchParams = getSearchParams(req);

        const { movies, total } = await searchService.searchMovies(searchParams, skip, limit);

        const totalPages = Math.ceil(total / limit);

        res.json({
            movies,
            page,
            totalPages
        });
    } catch (error) {
        console.error('Error searching movies:', error);
        sendJsonServerError(res, 'search for movies');
    }
});

// DELETE MOVIE
router.delete('/movie/:slug', async (req, res) => {
    try {
        const slug = req.params.slug;
        const result = await movieService.deleteMovie(slug);

        res.json({
            success: true,
            title: 'Movie deleted!',
            message: `${result.title} has been removed successfully!`,
            redirect: '/',
            redirectIcon: 'bi-house-fill',
            redirectText: 'Go to Home'
        });
    } catch (error) {
        if (error instanceof NotFoundError) {
            return sendJsonNotFoundError(res, 'movie');
        }
        console.error('Error deleting movie:', error);
        sendJsonServerError(res, 'delete movie');
    }
});

// DELETE ACTOR FROM MOVIE
router.delete('/movie/:movieSlug/actor/:actorSlug', async (req, res) => {
    try {
        const { movieSlug, actorSlug } = req.params;
        const result = await actorService.removeActorFromMovie(movieSlug, actorSlug);

        res.json({
            success: true,
            title: 'Actor Removed!',
            message: result.message
        });
    } catch (error) {
        if (error instanceof NotFoundError) {
            const entityType = error.entity.toLowerCase();
            return sendJsonNotFoundError(res, entityType);
        }
        console.error('Error removing actor from movie:', error);
        sendJsonServerError(res, 'remove actor from movie');
    }
});

// DELETE ACTOR
router.delete('/actor/:slug', async (req, res) => {
    try {
        const slug = req.params.slug;
        const result = await actorService.deleteActor(slug);

        res.json({
            success: true,
            title: 'Actor deleted!',
            message: `${result.name} has been removed successfully!`,
            redirect: '/',
            redirectIcon: 'bi-house-fill',
            redirectText: 'Go to Home'
        });
    } catch (error) {
        if (error instanceof NotFoundError) {
            return sendJsonNotFoundError(res, 'actor');
        }
        console.error('Error deleting actor:', error);
        sendJsonServerError(res, 'delete actor');
    }
});

export default router;