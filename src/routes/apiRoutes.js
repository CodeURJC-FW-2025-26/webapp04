import express from 'express';

import { getPaginationParams } from '../middleware/pagination.js';
import { getSearchParams } from '../utils/routeHelpers.js';
import { SearchService } from '../services/SearchService.js';
import { MovieService } from '../services/MovieService.js';
import { ActorService } from '../services/ActorService.js';
import { NotFoundError } from '../utils/errors.js';

const router = express.Router();
const searchService = new SearchService();
const movieService = new MovieService();
const actorService = new ActorService();

// Movie search API
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
        res.status(500).json({ error: 'Search failed' });
    }
});

// Actor search API
router.get('/actors/search', async (req, res) => {
    try {
        const query = req.query.q || '';
        const actors = await actorService.searchActors(query);
        res.json(actors);
    } catch (error) {
        console.error('Error searching actors:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

// Delete movie API
router.delete('/movie/:slug', async (req, res) => {
    try {
        const slug = req.params.slug;
        const result = await movieService.deleteMovie(slug);

        res.json({
            success: true,
            title: 'Movie deleted!',
            message: `${result.title} has been removed successfully!`
        });
    } catch (error) {
        if (error instanceof NotFoundError) {
            return res.status(404).json({
                success: false,
                error: 'Movie not found'
            });
        }
        console.error('Error deleting movie:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete movie'
        });
    }
});

// Remove actor from movie API
router.delete('/movie/:movieSlug/actor/:actorSlug', async (req, res) => {
    try {
        const { movieSlug, actorSlug } = req.params;
        const result = await actorService.removeActorFromMovie(movieSlug, actorSlug);

        res.json({
            success: true,
            title: 'Actor deleted!',
            message: result.message
        });
    } catch (error) {
        if (error instanceof NotFoundError) {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }
        console.error('Error removing actor from movie:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to remove actor from movie'
        });
    }
});

// Delete actor API (complete deletion)
router.delete('/actor/:slug', async (req, res) => {
    try {
        const slug = req.params.slug;
        const result = await actorService.deleteActor(slug);

        res.json({
            success: true,
            title: 'Actor deleted!',
            message: `${result.name} has been removed successfully!`
        });
    } catch (error) {
        if (error instanceof NotFoundError) {
            return res.status(404).json({
                success: false,
                error: 'Actor not found'
            });
        }
        console.error('Error deleting actor:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete actor'
        });
    }
});

export default router;