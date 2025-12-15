import path from 'path';

import { PATHS } from '../constants.js';
import * as actorCatalogue from '../actorCatalogue.js';
import * as movieCatalogue from '../movieCatalogue.js';
import {deleteUploadedFile, renameUploadedFile} from '../imageHandler.js';
import { createActorSlug } from '../utils/slugify.js';
import { validateActor } from '../utils/actorValidator.js';
import { addReleaseYearToMovies, formatDate, calculateAge } from '../utils/routeHelpers.js';

import { ValidationError, NotFoundError, DuplicateError } from '../utils/errors.js';

// Constants
const PORTRAITS_FOLDER = PATHS.ACTORS_FULL;

// Service class for actor-related business logic
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
        const validation = validateActor(actorData);
        if (!validation.isValid) {
            throw new ValidationError('validationError', validation.errors);
        }

        // Check for duplicates
        const existingActor = await actorCatalogue.getActorByName(actorData.name);

        if (existingActor) {
            throw new DuplicateError('Actor', 'name', actorData.name);
        }

        // Handle file upload
        let filename = null;
        if (portraitFile) {
            filename = renameUploadedFile(
                PORTRAITS_FOLDER,
                portraitFile.filename,
                actorData.name
            )
        }

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
        if (!existingActor) { throw new NotFoundError('Actor', slug); }

        // Check for duplicates: Only allow same name if it belongs to the actor being edited
        const existingName = await actorCatalogue.getActorByName(actorData.name);
        if (existingName && existingName._id.toString() !== existingActor._id.toString()) {
            throw new DuplicateError('Actor', 'name', actorData.name);
        }

        let filename = existingActor.portrait;

        // Handle new file upload
        if (portraitFile) {
            filename = renameUploadedFile(
                PORTRAITS_FOLDER,
                portraitFile.filename, 
                actorData.name, 
                null, 
                existingActor.portrait
            );
        }

        // If the exiting image file was deleted and no new image file was uploaded, delete the existing portrait
        // Old portrait is already deleted by renameUploadedFile if a new one was uploaded
        if (!portraitFile && actorData.deleteImage) {
            deleteUploadedFile(PORTRAITS_FOLDER, existingActor.portrait);
            filename = null;
        }

        const updatedActor = this._createActorObject(actorData, filename);

        // Validate
        const validation = validateActor(actorData);
        if (!validation.isValid) {
            throw new ValidationError('validationError', validation.errors);
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
            deleteUploadedFile(PORTRAITS_FOLDER, actor.portrait);
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
                deleteUploadedFile(PORTRAITS_FOLDER, actor.portrait);
            }
            
            return {
                message: `${actor.name} removed from ${movie.title} and deleted completely (was only in this movie)`,
                actorDeleted: true,
                name: actor.name,
                actorName: actor.name,
                movieTitle: movie.title
            };
        } else {
            // Actor appears in multiple movies, just remove from this movie
            return {
                message: `${actor.name} removed from ${movie.title} (still appears in ${actorMovies.length - 1} other movies)`,
                actorDeleted: false,
                name: actor.name,
                actorName: actor.name,
                movieTitle: movie.title
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

    // Get actor data with movie context for editing (including current role)
    async getActorForEditWithMovieContext(actorSlug, movieSlug) {
        const actor = await actorCatalogue.getActorBySlug(actorSlug);
        
        if (!actor) {
            throw new NotFoundError('Actor', actorSlug);
        }

        const movie = await movieCatalogue.getMovieBySlug(movieSlug);
        if (!movie) {
            throw new NotFoundError('Movie', movieSlug);
        }

        // Find the actor's current role in this movie
        const actorInMovie = movie.actors?.find(a => a.actorId.toString() === actor._id.toString());
        const currentRole = actorInMovie ? actorInMovie.role : '';

        return {
            actor: {
                ...actor,
                role: currentRole
            },
            movie: {
                slug: movie.slug,
                title: movie.title
            },
            name: actor.name
        };
    }

    // Update actor in movie context (including role update)
    async updateActorInMovieContext(actorSlug, movieSlug, formData, file) {
        const actor = await actorCatalogue.getActorBySlug(actorSlug);
        
        if (!actor) {
            throw new NotFoundError('Actor', actorSlug);
        }

        const movie = await movieCatalogue.getMovieBySlug(movieSlug);
        if (!movie) {
            throw new NotFoundError('Movie', movieSlug);
        }

        // Update actor data
        const result = await this.updateActor(actorSlug, formData, file);

        // Update role in movie if provided
        if (formData.role) {
            await movieCatalogue.updateActorRoleInMovie(movieSlug, actor._id, formData.role);
        }

        return {
            actorName: result.name,
            movieTitle: movie.title,
            role: formData.role || 'Unknown Role'
        };
    }

    // Get portrait file path for serving
    async getPortraitPathByFilename(filename) {
        const portraitPath = path.join(PORTRAITS_FOLDER, filename);
        
        return {
            portraitPath: path.resolve(portraitPath),
            filename
        };
    }

    // Get movie context for adding actor from movie page
    async getMovieContext(movieSlug) {
        const movie = await movieCatalogue.getMovieBySlug(movieSlug);
        
        if (!movie) {
            throw new NotFoundError('Movie', movieSlug);
        }

        return movie;
    }

    // Add actor to movie
    async addActorToMovie(movieSlug, actorId, role) {
        const movie = await movieCatalogue.getMovieBySlug(movieSlug);
        if (!movie) {
            throw new NotFoundError('Movie', movieSlug);
        }

        const actor = await actorCatalogue.getActor(actorId);
        if (!actor) {
            throw new NotFoundError('Actor', actorId);
        }

        await movieCatalogue.addActorToMovie(movieSlug, actorId, role);
        
        return {
            movieTitle: movie.title,
            actorName: actor.name
        };
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