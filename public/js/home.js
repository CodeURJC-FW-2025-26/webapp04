// State Management
const state = {
    // currentPage is used for pagination; kept in state so different UI actions can reset or advance it.
    currentPage: 1,
    // searchTimeout is the debounce timer id for the search input to avoid frequent network calls.
    searchTimeout: null
};

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
    movieGrid: document.getElementById('movieGrid'),
    paginationNav: document.getElementById('paginationNav')
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
    } else {
        renderMovies(data.movies);
    }

    updatePagination(data);
}

function showNoResults() {
    elements.movieGrid.innerHTML = `
        <div class="col-12">
            <p class="text-center">No movies found.</p>
        </div>
    `;
}

function renderMovies(movies) {
    // Map each movie to its HTML card and join them.
    elements.movieGrid.innerHTML = movies.map(createMovieCard).join('');
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

function updatePagination(data) {
    // If only one page, hide pagination entirely.
    if (data.totalPages <= 1) {
        elements.paginationNav.innerHTML = '';
        return;
    }

    const paginationHTML = buildPaginationHTML(data);
    elements.paginationNav.innerHTML = paginationHTML;
    // After replacing innerHTML we need to re-attach listeners to the new DOM nodes.
    attachPaginationListeners();
}

function buildPaginationHTML(data) {
    // Expecting data to include { hasPrev, prevPage, hasNext, nextPage, pages: [{number, isCurrent}, ...] }
    const parts = [];

    parts.push('<ul class="pagination justify-content-center">');

    if (data.hasPrev) {
        parts.push(createPaginationButton(data.prevPage, '<i class="bi bi-chevron-left"></i>'));
    }

    data.pages.forEach(page => {
        const activeClass = page.isCurrent ? 'active' : '';
        parts.push(`
            <li class="page-item ${activeClass}">
                <a class="page-link" href="#" data-page="${page.number}">${page.number}</a>
            </li>
        `);
    });

    if (data.hasNext) {
        parts.push(createPaginationButton(data.nextPage, '<i class="bi bi-chevron-right"></i>'));
    }

    parts.push('</ul>');

    return parts.join('');
}

function createPaginationButton(page, content) {
    // Small helper to keep markup consistent for prev/next buttons.
    return `
        <li class="page-item">
            <a class="page-link" href="#" data-page="${page}">${content}</a>
        </li>
    `;
}

function attachPaginationListeners() {
    // Attach click handlers to newly created pagination links.
    elements.paginationNav.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', handlePaginationClick);
    });
}

function handlePaginationClick(e) {
    e.preventDefault();
    const page = parseInt(e.currentTarget.dataset.page);
    // Update state and run the search for the selected page.
    state.currentPage = page;
    performSearch(page);
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