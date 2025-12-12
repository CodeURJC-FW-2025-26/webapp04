import express from 'express';

import { uploadPortrait } from '../imageUploader.js';
import { renderErrorPage, sendJsonErrorPage, sendJsonValidationError } from '../middleware/errorHandler.js';
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

// Create new actor AJAX
router.post('/create', uploadPortrait, async (req, res) => {
    try {
        const result = await actorService.createActor(req.body, req.file);

        let message;
        let redirectUrl;
        let title;

        // If creating from movie context, add actor to movie
        if (req.body.movieSlug && req.body.role) {
            // Creating from movie context  add to movie and redirect there
            const movieResult = await actorService.addActorToMovie(
                req.body.movieSlug,
                result.id,
                req.body.role
            );
            message = `${result.name} has been added to ${movieResult.movieTitle}!`;
            redirectUrl = `/movie/${req.body.movieSlug}`;
            title = movieResult.movieTitle;
        } else {
            // Standalone redirect to actor detail
            message = `${result.name} has been created successfully!`;
            redirectUrl = `/actor/${result.slug}`;
            title = result.name;
        }

        res.json({
            valid: true,
            message: message,
            redirect: redirectUrl,
            title: title
        });

    } catch (error) {
        if (error instanceof ValidationError) {
            return sendJsonValidationError(res, error.type, 'actor', error.details);
        }
        if (error instanceof DuplicateError) {
            return res.status(400).json({
                valid: false,
                message: `An actor with the name "${error.value}" already exists.`,
                errors: [
                    {
                        field: 'name',
                        message: `An actor with the name "${error.value}" already exists.`
                    }
                ]
            });
        }
        console.error('Error adding actor:', error);
        sendJsonErrorPage(res, 'unknown', 'actor');
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

// Update actor (from movie context) - AJAX VERSION
router.post('/:slug/update/from-movie/:movieSlug', uploadPortrait, async (req, res) => {
    try {
        const { slug: actorSlug, movieSlug } = req.params;
        const result = await actorService.updateActorInMovieContext(actorSlug, movieSlug, req.body, req.file);

        res.json({
            valid: true,
            message: `${result.actorName} has been updated in ${result.movieTitle}!`,
            redirect: `/movie/${movieSlug}`,
            title:result.movieTitle
        });

    } catch (error) {
        if (error instanceof NotFoundError) {
            return res.json({
                valid: false,
                message: 'Actor or movie not found.'
            });
        }
        if (error instanceof ValidationError) {
            return sendJsonValidationError(res, error.type, 'actor', error.details);
        }
        if (error instanceof DuplicateError) {
            return res.status(400).json({
                valid: false,
                message: `An actor with the name "${error.value}" already exists.`,
                errors: [
                    {
                        field: 'name',
                        message: `An actor with the name "${error.value}" already exists.`
                    }
                ]
            });
        }
        console.error('Error adding actor:', error);
        sendJsonErrorPage(res, 'unknown', 'actor');
    }
});

// Update actor (standalone) with AJAX
router.post('/:slug/update', uploadPortrait, async (req, res) => {
    try {
        const actorSlug = req.params.slug;
        const result = await actorService.updateActor(actorSlug, req.body, req.file);

        res.json({
            valid: true,
            message: `${result.name} has been updated successfully!`,
            redirect: `/actor/${result.slug}`,
            title: result.name
        });

    } catch (error) {
        if (error instanceof NotFoundError) {
            return res.json({
                valid: false,
                message: "Actor not found"
            });
        }
        if (error instanceof ValidationError) {
            return sendJsonValidationError(res, error.type, 'actor', error.details);
        }
        if (error instanceof DuplicateError) {
            return res.status(400).json({
                valid: false,
                message: `An actor with the name "${error.value}" already exists.`,
                errors: [
                    {
                        field: 'name',
                        message: `An actor with the name "${error.value}" already exists.`
                    }
                ]
            });
        }
        console.error('Error adding actor:', error);
        sendJsonErrorPage(res, 'unknown', 'actor');
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