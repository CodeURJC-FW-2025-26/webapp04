import express from 'express';

import { uploadPortrait } from '../imageUploader.js';
import { renderErrorPage, renderValidationError } from '../middleware/errorHandler.js';
import { ActorService } from '../services/ActorService.js';
import { ValidationError, NotFoundError, DuplicateError } from '../utils/errors.js';

const router = express.Router();
const actorService = new ActorService();

// Person detail page
router.get('/:slug', async (req, res) => {
    try {
        const slug = req.params.slug;
        const actorData = await actorService.getActorForDisplay(slug);
        
        res.render('person', actorData);
    } catch (error) {
        if (error instanceof NotFoundError) {
            return renderErrorPage(res, 'notFound', 'actor');
        }
        console.error('Error loading person details:', error);
        renderErrorPage(res, 'unknown', 'actor');
    }
});

// Add new person form (from movie context)
router.get('/add/from-movie/:movieSlug', async (req, res) => {
    try {
        const movieSlug = req.params.movieSlug;
        const movie = await actorService.getMovieContext(movieSlug);
        
        res.render('editPerson', {
            movie,
            action: '/person/create',
            placeholderName: 'Name',
            placeholderBirthPlace: 'Place of Birth',
            placeholderDescription: 'Description'
        });
    } catch (error) {
        if (error instanceof NotFoundError) {
            return renderErrorPage(res, 'notFound', 'movie');
        }
        console.error('Error loading add person page:', error);
        renderErrorPage(res, 'unknown', 'page');
    }
});

// Add new person form (standalone)
router.get('/add/new', (req, res) => {
    try {
        res.render('editPerson', {
            action: '/person/create',
            placeholderName: 'Name',
            placeholderBirthPlace: 'Place of Birth',
            placeholderDescription: 'Description'
        });
    } catch (error) {
        console.error('Error loading add person page:', error);
        renderErrorPage(res, 'unknown', 'page');
    }
});

// Create new person
router.post('/create', uploadPortrait, async (req, res) => {
    try {
        const result = await actorService.createActor(req.body, req.file);
        
        res.redirect(`/status/person-created?name=${encodeURIComponent(result.name)}&slug=${result.slug}`);
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

// Edit person form
router.get('/:slug/edit', async (req, res) => {
    try {
        const slug = req.params.slug;
        const editData = await actorService.getActorForEdit(slug);
        
        res.render('editPerson', {
            ...editData,
            action: `/person/${slug}/update`
        });
    } catch (error) {
        if (error instanceof NotFoundError) {
            return renderErrorPage(res, 'notFound', 'actor');
        }
        console.error('Error loading edit person page:', error);
        renderErrorPage(res, 'unknown', 'actor');
    }
});

// Update person
router.post('/:slug/update', uploadPortrait, async (req, res) => {
    try {
        const actorSlug = req.params.slug;
        const result = await actorService.updateActor(actorSlug, req.body, req.file);
        
        res.redirect(`/status/person-updated?name=${encodeURIComponent(result.name)}&slug=${result.slug}`);
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

// Serve person portraits
router.get('/portraits/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const { portraitPath } = await actorService.getPortraitPath(filename);
        
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