import express from 'express';

import { uploadPortrait } from '../imageUploader.js';
import { renderErrorPage, renderValidationError } from '../middleware/errorHandler.js';
import { ActorService } from '../services/ActorService.js';
import { ValidationError, NotFoundError, DuplicateError } from '../utils/errors.js';

const router = express.Router();
const actorService = new ActorService();

// Actor detail page
router.get('/:slug', async (req, res) => {
    try {
        const slug = req.params.slug;
        const actorData = await actorService.getActorForDisplay(slug);
        
        res.render('actor', actorData);
    } catch (error) {
        if (error instanceof NotFoundError) {
            return renderErrorPage(res, 'notFound', 'actor');
        }
        console.error('Error loading actor details:', error);
        renderErrorPage(res, 'unknown', 'actor');
    }
});

// Add new actor form (from movie context)
router.get('/add/from-movie/:movieSlug', async (req, res) => {
    try {
        const movieSlug = req.params.movieSlug;
        const movie = await actorService.getMovieContext(movieSlug);
        
        res.render('editActor', {
            movie,
            action: '/actor/create',
            placeholderName: 'Name',
            placeholderBirthPlace: 'Place of Birth',
            placeholderDescription: 'Description'
        });
    } catch (error) {
        if (error instanceof NotFoundError) {
            return renderErrorPage(res, 'notFound', 'movie');
        }
        console.error('Error loading add actor page:', error);
        renderErrorPage(res, 'unknown', 'page');
    }
});

// Add new actor form (standalone)
router.get('/add/new', (req, res) => {
    try {
        res.render('editActor', {
            action: '/actor/create',
            placeholderName: 'Name',
            placeholderBirthPlace: 'Place of Birth',
            placeholderDescription: 'Description'
        });
    } catch (error) {
        console.error('Error loading add actor page:', error);
        renderErrorPage(res, 'unknown', 'page');
    }
});

// Create new actor
router.post('/create', uploadPortrait, async (req, res) => {
    try {
        const result = await actorService.createActor(req.body, req.file);
        
        // If creating from movie context, add actor to movie
        if (req.body.movieSlug && req.body.role) {
            const movieResult = await actorService.addActorToMovie(req.body.movieSlug, result.id, req.body.role);
            // Redirect to movie when created from movie context
            return res.redirect(`/status/actor-created?name=${encodeURIComponent(result.name)}&slug=${result.slug}&movieSlug=${encodeURIComponent(req.body.movieSlug)}&movieTitle=${encodeURIComponent(movieResult.movieTitle)}`);
        }
        
        res.redirect(`/status/actor-created?name=${encodeURIComponent(result.name)}&slug=${result.slug}`);
    } catch (error) {
        if (error instanceof ValidationError) {
            return renderValidationError(res, error.type, 'actor', error.details);
        }
        if (error instanceof DuplicateError) {
            return renderValidationError(res, 'duplicateName', 'actor', { name: error.value });
        }
        console.error('Error adding actor:', error);
        renderErrorPage(res, 'unknown', 'actor');
    }
});

// Edit actor form (from movie context)
router.get('/:slug/edit/from-movie/:movieSlug', async (req, res) => {
    try {
        const { slug, movieSlug } = req.params;
        const editData = await actorService.getActorForEditWithMovieContext(slug, movieSlug);
        
        res.render('editActor', {
            ...editData,
            action: `/actor/${slug}/update/from-movie/${movieSlug}`
        });
    } catch (error) {
        if (error instanceof NotFoundError) {
            return renderErrorPage(res, 'notFound', 'actor');
        }
        console.error('Error loading edit actor from movie page:', error);
        renderErrorPage(res, 'unknown', 'actor');
    }
});

// Edit actor form (standalone)
router.get('/:slug/edit', async (req, res) => {
    try {
        const slug = req.params.slug;
        const editData = await actorService.getActorForEdit(slug);
        
        res.render('editActor', {
            ...editData,
            action: `/actor/${slug}/update`
        });
    } catch (error) {
        if (error instanceof NotFoundError) {
            return renderErrorPage(res, 'notFound', 'actor');
        }
        console.error('Error loading edit actor page:', error);
        renderErrorPage(res, 'unknown', 'actor');
    }
});

// Update actor (from movie context)
router.post('/:slug/update/from-movie/:movieSlug', uploadPortrait, async (req, res) => {
    try {
        const { slug: actorSlug, movieSlug } = req.params;
        const result = await actorService.updateActorInMovieContext(actorSlug, movieSlug, req.body, req.file);
        
        res.redirect(`/status/actor-updated-in-movie?actorName=${encodeURIComponent(result.actorName)}&movieTitle=${encodeURIComponent(result.movieTitle)}&movieSlug=${movieSlug}&role=${encodeURIComponent(result.role)}`);
    } catch (error) {
        if (error instanceof NotFoundError) {
            return renderErrorPage(res, 'notFound', 'actor');
        }
        if (error instanceof ValidationError) {
            return renderValidationError(res, error.type, 'actor', error.details);
        }
        console.error('Error updating actor in movie context:', error);
        renderErrorPage(res, 'unknown', 'actor');
    }
});

// Update actor (standalone)
router.post('/:slug/update', uploadPortrait, async (req, res) => {
    try {
        const actorSlug = req.params.slug;
        const result = await actorService.updateActor(actorSlug, req.body, req.file);
        
        res.redirect(`/status/actor-updated?name=${encodeURIComponent(result.name)}&slug=${result.slug}`);
    } catch (error) {
        if (error instanceof NotFoundError) {
            return renderErrorPage(res, 'notFound', 'actor');
        }
        if (error instanceof ValidationError) {
            return renderValidationError(res, error.type, 'actor', error.details);
        }
        console.error('Error updating actor:', error);
        renderErrorPage(res, 'unknown', 'actor');
    }
});

// Serve actor portraits
router.get('/portraits/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const { portraitPath } = await actorService.getPortraitPathByFilename(filename);
        
        res.sendFile(portraitPath, (err) => {
            if (err && !res.headersSent) {
                res.status(404).send('Portrait not found');
            }
        });
    } catch (error) {
        console.error('Error loading portrait:', error);
        res.status(500).send('Server error');
    }
});

export default router;