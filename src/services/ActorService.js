import path from 'path';

import { PATHS } from '../constants.js';
import * as actorCatalogue from '../actorCatalogue.js';
import * as movieCatalogue from '../movieCatalogue.js';
import { renameUploadedFile } from '../imageUploader.js';
import { createActorSlug } from '../utils/slugify.js';
import { validateActor } from '../utils/actorValidator.js';
import { 
    addReleaseYearToMovies, 
    deletePortraitFile,
    formatDate,
    calculateAge
} from '../utils/routeHelpers.js';

import { ValidationError, NotFoundError, DuplicateError } from '../utils/errors.js';

// Constants
const PERSON_FOLDER = PATHS.PERSONS_FULL;

// Service class for actor/person-related business logic
export class ActorService {

     // Get actor by slug with formatted data for display
     async getActorForDisplay(slug) {
        const actor = await actorCatalogue.getActorBySlug(slug);
        
        if (!actor) {
            throw new NotFoundError('Actor', slug);
        }

        const dateDetails = this._formatActorDateDetails(actor);
        const movies = await movieCatalogue.getMoviesByActor(actor._id);

        return {
            ...actor,
            slug: actor.slug,
            alive: !dateDetails.dayOfDeathFormatted,
            ...dateDetails,
            movies: addReleaseYearToMovies(movies),
            hasMovies: movies.length > 0
        };
    }

    // Create a new actor with validation and file handling
    async createActor(actorData, portraitFile = null) {
        // Validate input
        const validation = validateActor(actorData, portraitFile);
        if (!validation.isValid) {
            const firstError = validation.errors[0];
            throw new ValidationError(firstError.type, firstError.details);
        }

        // Check for duplicates
        const slug = createActorSlug(actorData.name);
        const existingActor = await actorCatalogue.getActorBySlug(slug);

        if (existingActor) {
            throw new DuplicateError('Actor', 'name', actorData.name);
        }

        // Handle file upload (optional for actors)
        const filename = portraitFile ? 
            renameUploadedFile(PERSON_FOLDER, portraitFile.filename, actorData.name) : 
            null;

        // Create actor object
        const actor = this._createActorObject(actorData, filename);

        // Save to database
        const actorId = await actorCatalogue.addActor(actor);

        return {
            id: actorId,
            slug: actor.slug,
            name: actor.name
        };
    }

    // Update existing actor with validation and file handling
    async updateActor(slug, actorData, portraitFile = null) {
        const existingActor = await actorCatalogue.getActorBySlug(slug);
        
        if (!existingActor) {
            throw new NotFoundError('Actor', slug);
        }

        let filename = existingActor.portrait;

        // Handle new file upload
        if (portraitFile) {
            filename = renameUploadedFile(
                PERSON_FOLDER, 
                portraitFile.filename, 
                actorData.name, 
                null, 
                existingActor.portrait
            );
        }

        // Handle portrait removal
        if (actorData.removePortrait === 'true' && filename) {
            await deletePortraitFile(filename);
            filename = null;
        }

        const updatedActor = this._createActorObject(actorData, filename);

        // Validate
        const validation = validateActor(actorData, { filename: filename });
        if (!validation.isValid) {
            const firstError = validation.errors[0];
            throw new ValidationError(firstError.type, firstError.details);
        }

        // Update in database
        await actorCatalogue.updateActor(slug, updatedActor);

        return {
            slug: updatedActor.slug,
            name: updatedActor.name
        };
    }

    // Delete actor and associated files
    async deleteActor(slug) {
        const actor = await actorCatalogue.getActorBySlug(slug);
        
        if (!actor) {
            throw new NotFoundError('Actor', slug);
        }

        // Delete from database
        await actorCatalogue.deleteActor(slug);
        
        // Delete portrait file if exists
        if (actor.portrait) {
            await deletePortraitFile(actor.portrait);
        }

        return {
            name: actor.name
        };
    }

    // Remove actor from specific movie, delete actor completely if no other movies
    async removeActorFromMovie(movieSlug, actorSlug) {
        const actor = await actorCatalogue.getActorBySlug(actorSlug);
        if (!actor) {
            throw new NotFoundError('Actor', actorSlug);
        }

        // Get the movie to verify it exists
        const movie = await movieCatalogue.getMovieBySlug(movieSlug);
        if (!movie) {
            throw new NotFoundError('Movie', movieSlug);
        }

        // Check if actor appears in any other movies BEFORE removing from current movie
        const actorMovies = await movieCatalogue.getMoviesWithActor(actorSlug);
        
        // Remove actor from this specific movie first
        await movieCatalogue.removeActorFromMovie(movieSlug, actorSlug);

        // If actor was only in this one movie (length = 1), delete completely
        if (actorMovies.length === 1) {
            // Actor was only in this movie, delete completely from actors.json
            await actorCatalogue.deleteActor(actorSlug);
            
            // Delete portrait file if exists
            if (actor.portrait) {
                await deletePortraitFile(actor.portrait);
            }
            
            return {
                message: `${actor.name} removed from ${movie.title} and deleted completely (was only in this movie)`,
                actorDeleted: true,
                name: actor.name
            };
        } else {
            // Actor appears in multiple movies, just remove from this movie
            return {
                message: `${actor.name} removed from ${movie.title} (still appears in ${actorMovies.length - 1} other movies)`,
                actorDeleted: false,
                name: actor.name
            };
        }
    }

    // Get actor data formatted for editing form
    async getActorForEdit(slug) {
        const actor = await actorCatalogue.getActorBySlug(slug);
        
        if (!actor) {
            throw new NotFoundError('Actor', slug);
        }

        return {
            actor,
            name: actor.name
        };
    }

    // Get portrait file path for serving
    async getPortraitPath(filename) {
        const portraitPath = path.join(PERSON_FOLDER, filename);
        
        return {
            portraitPath: path.resolve(portraitPath),
            filename
        };
    }

    // Search actors by query
    async searchActors(query) {
        return await actorCatalogue.searchActors(query);
    }

    // Get movie context for adding actor from movie page
    async getMovieContext(movieSlug) {
        const movie = await movieCatalogue.getMovieBySlug(movieSlug);
        
        if (!movie) {
            throw new NotFoundError('Movie', movieSlug);
        }

        return movie;
    }

    // Private helper methods
    _formatActorDateDetails(actor) {
        const birthdayFormatted = formatDate(actor.dateOfBirth);
        const dayOfDeathFormatted = actor.dateOfDeath ? formatDate(actor.dateOfDeath) : null;
        const age = actor.dateOfDeath ? null : calculateAge(actor.dateOfBirth);
        const ageAtDeath = actor.dateOfDeath ? calculateAge(actor.dateOfBirth, actor.dateOfDeath) : null;

        return { birthdayFormatted, age, dayOfDeathFormatted, ageAtDeath };
    }

    _createActorObject(formData, filename) {
        return {
            name: formData.name,
            slug: createActorSlug(formData.name),
            portrait: filename,
            description: formData.description,
            dateOfBirth: formData.dateOfBirth,
            placeOfBirth: formData.placeOfBirth
        };
    }
}