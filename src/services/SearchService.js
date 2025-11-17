import * as movieCatalogue from '../movieCatalogue.js';
import * as actorCatalogue from '../actorCatalogue.js';
import { addReleaseYearToMovies } from '../utils/routeHelpers.js';

// Service class for search and filtering operations
export class SearchService {

    // Search movies with pagination, filtering and sorting
    async searchMovies(searchParams, skip, limit) {
        const { movies, total } = await movieCatalogue.searchMovies(
            searchParams.searchQuery,
            searchParams.genre,
            searchParams.country,
            searchParams.ageRating,
            searchParams.sortBy,
            searchParams.sortOrder,
            skip,
            limit
        );

        return {
            movies: addReleaseYearToMovies(movies),
            total
        };
    }

    // Search actors by query string
    async searchActors(query) {
        return await actorCatalogue.searchActors(query);
    }

    // Get all available filter options for movies
    async getMovieFilterOptions() {
        const [genres, countries, ageRatings] = await Promise.all([
            movieCatalogue.getAllGenres(),
            movieCatalogue.getAllCountries(),
            movieCatalogue.getAllAgeRatings()
        ]);

        return {
            genres,
            countries,
            ageRatings
        };
    }

    // Get movies with pagination for home page
    async getMoviesForHomePage(skip, limit) {
        const [totalMovies, movies] = await Promise.all([
            movieCatalogue.getTotalNumberOfMovies(),
            movieCatalogue.getMoviesPaginated(skip, limit)
        ]);

        return {
            totalMovies,
            movies: addReleaseYearToMovies(movies)
        };
    }

    // Get complete home page data including movies and filter options
    async getHomePageData(skip, limit) {
        const [movieData, filterOptions] = await Promise.all([
            this.getMoviesForHomePage(skip, limit),
            this.getMovieFilterOptions()
        ]);

        return {
            totalMovies: movieData.totalMovies,
            movies: movieData.movies,
            ...filterOptions
        };
    }
}