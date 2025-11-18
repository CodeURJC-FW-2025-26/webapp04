import path from 'path';
import { ObjectId } from "mongodb";

import { PATHS } from '../constants.js';
import * as movieCatalogue from '../movieCatalogue.js';
import * as actorCatalogue from '../actorCatalogue.js';
import { renameUploadedFile } from '../imageUploader.js';
import { createMovieSlug } from '../utils/slugify.js';
import { validateMovie } from '../utils/movieValidator.js';
import { 
    extractYear, 
    ensureArray,
    deletePosterFile
} from '../utils/routeHelpers.js';
import { ValidationError, NotFoundError, DuplicateError } from '../utils/errors.js';

// Constants
const POSTER_FOLDER = PATHS.MOVIE_POSTERS_FULL;

// Service class for movie-related business logic
export class MovieService {
    
    // Get movie by slug with formatted data for display
    async getMovieForDisplay(slug) {
        const movie = await movieCatalogue.getMovieBySlug(slug);
        
        if (!movie) {
            throw new NotFoundError('Movie', slug);
        }

        const actors = await this._resolveActorsForMovie(movie);
        const releaseYear = extractYear(movie.releaseDate);

        return {
            ...movie,
            releaseYear,
            id: movie._id.toString(),
            slug: movie.slug,
            genresText: movie.genre?.join(', ') || '',
            countriesText: movie.countryOfProduction?.join(', ') || '',
            hasActors: actors.length > 0,
            actors
        };
    }

    // Create a new movie with validation and file handling
    async createMovie(movieData, posterFile) {
        // Validate input
        const validation = validateMovie(movieData, posterFile);
        if (!validation.isValid) {
            const firstError = validation.errors[0];
            throw new ValidationError(firstError.type, firstError.details);
        }

        // Check for duplicates
        const existingMovie = await movieCatalogue.getMovieByTitle(movieData.title);

        if (existingMovie) {
            throw new DuplicateError('Movie', 'title', movieData.title);
        }

        const releaseYear = extractYear(movieData.releaseDate);

        // Handle file upload
        const filename = renameUploadedFile(
            POSTER_FOLDER, 
            posterFile.filename, 
            movieData.title, 
            releaseYear
        );

        // Create movie object
        const movie = this._createMovieObject(movieData, filename, releaseYear);

        // Save to database
        const movieId = await movieCatalogue.addMovie(movie);

        return {
            id: movieId,
            slug: movie.slug,
            title: movie.title
        };
    }

    // Update existing movie with validation and file handling
    async updateMovie(slug, movieData, posterFile = null) {
        const existingMovie = await movieCatalogue.getMovieBySlug(slug);
        
        if (!existingMovie) {
            throw new NotFoundError('Movie', slug);
        }

        const releaseYear = extractYear(movieData.releaseDate);
        let filename = existingMovie.poster;

        // Handle new file upload
        if (posterFile) {
            filename = renameUploadedFile(
                POSTER_FOLDER,
                posterFile.filename,
                movieData.title,
                releaseYear,
                existingMovie.poster
            );
        }

        const updatedMovie = this._createMovieObject(movieData, filename, releaseYear);

        // Validate
        const validation = validateMovie(movieData, posterFile || { filename: filename });
        if (!validation.isValid) {
            const firstError = validation.errors[0];
            throw new ValidationError(firstError.type, firstError.details);
        }

        // Update in database
        await movieCatalogue.updateMovie(slug, updatedMovie);

        return {
            slug: updatedMovie.slug,
            title: updatedMovie.title
        };
    }

    // Delete movie and associated files
    async deleteMovie(slug) {
        const movie = await movieCatalogue.getMovieBySlug(slug);
        
        if (!movie) {
            throw new NotFoundError('Movie', slug);
        }

        // Delete from database
        await movieCatalogue.deleteMovie(slug);
        
        // Delete poster file
        await deletePosterFile(movie.poster);

        return {
            title: movie.title
        };
    }

    // Get movie data formatted for editing form
    async getMovieForEdit(slug, availableGenres, availableCountries, availableAgeRatings) {
        const movie = await movieCatalogue.getMovieBySlug(slug);
        
        if (!movie) {
            throw new NotFoundError('Movie', slug);
        }

        // Prepare genres with selected flags
        const genres = availableGenres.map(g => ({
            value: g,
            selected: movie.genre.includes(g)
        }));

        const ageRating = availableAgeRatings.map(r => ({
            value: r,
            selected: movie && String(movie.ageRating) === String(r)
        }));

        const countries = availableCountries.map(c => ({
            value: c,
            selected: movie.countryOfProduction.includes(c)
        }));

        const actors = await this._resolveActorsForMovie(movie);

        return {
            movie: {
                ...movie,
                actors
            },
            countries,
            ageRating,
            genres
        };
    }

    // Get poster file path for serving
    async getPosterPath(slug) {
        const movie = await movieCatalogue.getMovieBySlug(slug);
        
        if (!movie?.poster) {
            throw new NotFoundError('Poster', slug);
        }

        return {
            posterPath: path.join(POSTER_FOLDER, movie.poster),
            filename: movie.poster
        };
    }

    // Private helper methods
    async _resolveActorsForMovie(movie) {
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

    _createMovieObject(formData, filename, releaseYear) {
        return {
            title: formData.title,
            poster: filename,
            slug: createMovieSlug(formData.title, releaseYear),
            description: formData.description,
            genre: ensureArray(formData.genre),
            releaseDate: formData.releaseDate,
            countryOfProduction: ensureArray(formData.countryOfProduction),
            ageRating: formData.ageRating,
            actors: this._parseActors(formData)
        };
    }

    _parseActors({ actorId, actorRole }) {
        if (!actorId || !actorRole) return [];

        const ids = [].concat(actorId);
        const roles = [].concat(actorRole);

        const actors = ids
            .map((id, i) => id && roles[i] && ({
                actorId: new ObjectId(id),
                role: roles[i]
            }))
            .filter(Boolean);

        return actors.length ? actors : [];
    }
}