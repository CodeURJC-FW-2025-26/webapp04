import express from 'express';

import { uploadPortrait } from '../imageHandler.js';
import { renderErrorPage, sendJsonErrorPage, sendJsonValidationError, sendJsonDuplicateError, sendJsonNotFoundError, sendJsonServerError } from '../middleware/errorHandler.js';
import { ActorService } from '../services/ActorService.js';
import { ValidationError, NotFoundError, DuplicateError } from '../utils/errors.js';

const router = express.Router();
const actorService = new ActorService();

// GET FROM to add an actor within the movie detail page
router.get('/add/in-movie/:movieSlug', async (req, res) => {
   try {
       const movieSlug = req.params.movieSlug;
       const movieData = movieSlug ? await actorService.getMovieContext(movieSlug) : null;

       res.render('partials/actorForm', {
           isCompact: true,
           movie: movieData,
           action: '/actor/create'
       });
   } catch (error) {
       console.error('Error loading actor add form in movie detail page:', error);
       sendJsonServerError(res, 'load the actor form');
   }
});

// GET FORM to edit an actor within the movie detail page
router.get('/edit/:actorSlug/in-movie/:movieSlug', async (req, res) => {
    try {
        const actorSlug = req.params.actorSlug;
        const movieSlug = req.params.movieSlug;

        const actorToEdit = await actorService.getActorForEditWithMovieContext(actorSlug, movieSlug);

        res.render('partials/actorForm', {
            isCompact: true,
            ...actorToEdit,
            action: `/actor/update/${actorSlug}/from-movie/${movieSlug}`
        });
    } catch (error) {
        console.error('Error loading actor edit form in movie detail page:', error);
        sendJsonServerError(res, 'load the actor form');
    }
})

// GET FORM to edit an actor coming from the actor details page (without movie context)
router.get('/edit/:actorSlug', async (req, res) => {
    try {
        const actorSlug = req.params.actorSlug;
        const editData = await actorService.getActorForEdit(actorSlug);

        res.render('editActor', {
            ...editData,
            action: `/actor/update/${actorSlug}`
        });
    } catch (error) {
        if (error instanceof NotFoundError) {
            return renderErrorPage(res, 'notFound', 'actor');
        }
        console.error('Error loading edit actor page:', error);
        renderErrorPage(res, 'unknown', 'actor');
    }
});

// CREATE a new actor
router.post('/create', uploadPortrait, async (req, res) => {
    try {
        const result = await actorService.createActor(req.body, req.file);
        let message;

        // If creating from movie context, add actor to movie
        if (req.body.movieSlug && req.body.role) {
            // Creating from movie context, adding actor to movie
            const movieResult = await actorService.addActorToMovie(
                req.body.movieSlug,
                result.id,
                req.body.role
            );
            message = `${result.name} has been added to ${movieResult.movieTitle}!`;
        } else {
            // Standalone without movie context
            message = `${result.name} has been created successfully!`;
        }

        res.json({
            valid: true,
            message: message
        });

    } catch (error) {
        if (error instanceof ValidationError) {
            return sendJsonValidationError(res, error.type, 'actor', error.details);
        }
        if (error instanceof DuplicateError) {
            return sendJsonDuplicateError(res, 'actor', 'name', error.value);
        }
        console.error('Error adding actor:', error);
        sendJsonErrorPage(res, 'unknown', 'actor');
    }
});

// UPDATE an actor (from movie context)
router.post('/update/:actorSlug/from-movie/:movieSlug', uploadPortrait, async (req, res) => {
    try {
        const actorSlug = req.params.actorSlug;
        const movieSlug = req.params.movieSlug;
        const result = await actorService.updateActorInMovieContext(actorSlug, movieSlug, req.body, req.file);

        res.json({
            valid: true,
            message: `${result.actorName} has been updated in ${result.movieTitle}!`
        });

    } catch (error) {
        if (error instanceof NotFoundError) {
            return sendJsonNotFoundError(res, 'actor');
        }
        if (error instanceof ValidationError) {
            return sendJsonValidationError(res, error.type, 'actor', error.details);
        }
        if (error instanceof DuplicateError) {
            return sendJsonDuplicateError(res, 'actor', 'name', error.value);
        }
        console.error('Error adding actor:', error);
        sendJsonErrorPage(res, 'unknown', 'actor');
    }
});

// UPDATE an actor (without movie context)
router.post('/update/:actorSlug', uploadPortrait, async (req, res) => {
    try {
        const actorSlug = req.params.actorSlug;
        const result = await actorService.updateActor(actorSlug, req.body, req.file);

        res.json({
            valid: true,
            message: `${result.name} has been updated successfully!`,
            redirect: `/actor/${result.slug}`,
            title: result.name
        });

    } catch (error) {
        if (error instanceof NotFoundError) {
            return sendJsonNotFoundError(res, 'actor');
        }
        if (error instanceof ValidationError) {
            return sendJsonValidationError(res, error.type, 'actor', error.details);
        }
        if (error instanceof DuplicateError) {
            return sendJsonDuplicateError(res, 'actor', 'name', error.value);
        }
        console.error('Error adding actor:', error);
        sendJsonErrorPage(res, 'unknown', 'actor');
    }
});

// GET ACTOR PORTRAITS
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

// GET ACTOR DETAIL PAGE
router.get('/:actorSlug', async (req, res) => {
    try {
        const actorSlug = req.params.actorSlug;
        const actorData = await actorService.getActorForDisplay(actorSlug);

        res.render('actor', actorData);
    } catch (error) {
        if (error instanceof NotFoundError) {
            return renderErrorPage(res, 'notFound', 'actor');
        }
        console.error('Error loading actor details:', error);
        renderErrorPage(res, 'unknown', 'actor');
    }
});

export default router;