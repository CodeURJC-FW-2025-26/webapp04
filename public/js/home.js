// State Management
const state = {
    // currentPage is used for infinite scroll; increments as more movies are loaded.
    currentPage: 1,
    // searchTimeout is the debounce timer id for the search input to avoid frequent network calls.
    searchTimeout: null,
    // isLoading prevents multiple simultaneous requests
    isLoading: false,
    // hasMoreMovies tracks if there are more movies to load
    hasMoreMovies: true
};

// Infinite Scroll Handler
let scrollTimeout = null;
document.addEventListener('scroll', () => {
    // Throttle scroll events to improve performance
    if (scrollTimeout) { return; }
    
    scrollTimeout = setTimeout(() => {
        scrollTimeout = null;
        checkScrollPosition();
    }, 100);
});

function checkScrollPosition() {
    // Don't load if already loading or no more movies available
    if (state.isLoading || !state.hasMoreMovies) { return; }

    const documentHeight = document.body.scrollHeight;
    const currentScroll = window.scrollY + window.innerHeight;
    const threshold = 100; // Load when 100px from bottom

    if (currentScroll + threshold > documentHeight) {
        loadMoreMovies();
    }
}

async function loadMoreMovies() {
    state.isLoading = true;
    showLoadingIndicator();
    
    state.currentPage++;
    
    try {
        const searchParams = buildSearchParams(state.currentPage);
        const response = await fetch(`/api/search?${searchParams.toString()}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.movies.length === 0) {
            state.hasMoreMovies = false;
            hideLoadingIndicator();
        } else {
            appendMovies(data.movies);
            state.hasMoreMovies = data.page < data.totalPages;
            hideLoadingIndicator();
        }
    } catch (error) {
        console.error('Error loading more movies:', error);
        state.currentPage--; // Revert page increment on error
        hideLoadingIndicator();
    } finally {
        state.isLoading = false;
    }
}

// DOM Elements
const elements = {
    searchInput: document.getElementById('searchInput'),
    genreFilter: document.getElementById('genreFilter'),
    countryFilter: document.getElementById('countryFilter'),
    ageRatingFilter: document.getElementById('ageRatingFilter'),
    sortBy: document.getElementById('sortBy'),
    sortOrder: document.getElementById('sortOrder'),
    sortButtonText: document.getElementById('sortButtonText'),
    sortButtonIcon: document.getElementById('sortButtonIcon'),
    movieGrid: document.getElementById('movieGrid')
};

// Event Listeners
function initializeEventListeners() {
    elements.searchInput.addEventListener('input', handleSearchInput);

    elements.genreFilter.addEventListener('change', handleFilterChange);
    elements.countryFilter.addEventListener('change', handleFilterChange);
    elements.ageRatingFilter.addEventListener('change', handleFilterChange);

    elements.sortBy.addEventListener('change', handleSortChange);
    elements.sortOrder.addEventListener('change', handleSortChange);
}

function handleSearchInput() {
    // Clear previous timer and set a new one so the search is triggered
    // only after the user stops typing for 300ms.
    clearTimeout(state.searchTimeout);
    state.searchTimeout = setTimeout(() => {
        resetPageAndSearch();
    }, 300);
}

function handleFilterChange() {
    // Any filter change resets to first page and performs a new search.
    resetPageAndSearch();
}

function handleSortChange() {
    // Update visible sort button label/icon and re-run the search.
    updateSortButton();
    resetPageAndSearch();
}

function resetPageAndSearch() {
    state.currentPage = 1;
    state.hasMoreMovies = true;
    performSearch();
}

// Update Sort Button Display
function updateSortButton() {
    const sortBy = elements.sortBy.value;
    const sortOrder = elements.sortOrder.value;

    const sortLabels = {
        'title': 'Title',
        'releaseDate': 'Release Date'
    };
    elements.sortButtonText.textContent = sortLabels[sortBy] || 'Sort';

    // Change icon depending on ascending/descending order.
    const iconClass = sortOrder === 'asc' ? 'bi-arrow-up-short' : 'bi-arrow-down-short';
    elements.sortButtonIcon.className = `bi ${iconClass} ps-2 pe-0`;
}

// Search Logic
async function performSearch(page = 1) {
    // Build URLSearchParams to create a query string safely (handles encoding).
    const searchParams = buildSearchParams(page);

    try {
        const response = await fetch(`/api/search?${searchParams.toString()}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        updateResults(data);
    } catch (error) {
        showErrorMessage('Failed to load movies. Please try again.');
    }
}

function buildSearchParams(page) {
    const params = new URLSearchParams();

    params.append('q', elements.searchInput.value);
    params.append('sortBy', elements.sortBy.value);
    params.append('sortOrder', elements.sortOrder.value);
    params.append('page', page);

    // For filter checkboxes we append the same key multiple times.
    // The server can read these as an array (req.query.genre).
    appendCheckedValues(params, 'genre', elements.genreFilter);
    appendCheckedValues(params, 'country', elements.countryFilter);
    appendCheckedValues(params, 'ageRating', elements.ageRatingFilter);

    return params;
}

function appendCheckedValues(params, key, container) {
    // Collect all checked checkboxes inside the given container and append their names.
    const checkedBoxes = container.querySelectorAll('input[type="checkbox"]:checked');
    checkedBoxes.forEach(checkbox => params.append(key, checkbox.name));
}

// UI Updates
function updateResults(data) {
    if (data.movies.length === 0) {
        showNoResults();
        state.hasMoreMovies = false;
    } else {
        renderMovies(data.movies);
        state.hasMoreMovies = data.page < data.totalPages;
    }
}

function showNoResults() {
    elements.movieGrid.innerHTML = `
        <div class="col-12">
            <p class="text-center">No movies found.</p>
        </div>
    `;
}

function renderMovies(movies) {
    // Map each movie to its HTML card and join them (replaces existing movies).
    elements.movieGrid.innerHTML = movies.map(createMovieCard).join('');
}

function appendMovies(movies) {
    // Append new movies to the existing grid (for infinite scroll).
    const moviesHTML = movies.map(createMovieCard).join('');
    elements.movieGrid.insertAdjacentHTML('beforeend', moviesHTML);
}

function createMovieCard(movie) {
    return `
        <div class="col-lg-4 col-md-6 col-sm-12">
            <div class="moviePoster">
                <a href="/movie/${movie.slug}">
                    <img src="/movie/${movie.slug}/poster" 
                         alt="Poster of ${escapeHtml(movie.title)} (${movie.releaseYear})"
                         loading="lazy">
                    <div class="moviePosterTitle">
                        <span class="title">${escapeHtml(movie.title)}</span><br>
                        <span class="year">${movie.releaseYear}</span>
                    </div>
                </a>
            </div>
        </div>
    `;
}

// Loading Indicator
function showLoadingIndicator() {
    // Check if loading indicator already exists
    if (!document.getElementById('loadingIndicator')) {
        const loadingHTML = `
            <div id="loadingIndicator" class="col-12 text-center py-4">
                <div class="spinner-border text-primary" role="status"></div>
            </div>
        `;
        elements.movieGrid.insertAdjacentHTML('beforeend', loadingHTML);
    }
}

function hideLoadingIndicator() {
    const indicator = document.getElementById('loadingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showErrorMessage(message) {
    elements.movieGrid.innerHTML = `
        <div class="col-12">
            <div class="alert alert-danger" role="alert">
                ${message}
            </div>
        </div>
    `;
}

// Initialize
initializeEventListeners();
updateSortButton();
performSearch();