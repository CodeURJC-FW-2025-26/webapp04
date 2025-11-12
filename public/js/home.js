// State Management
const state = {
    currentPage: 1,
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
    movieGrid: document.getElementById('movieGrid'),
    paginationNav: document.getElementById('paginationNav')
};

// Event Listeners
function initializeEventListeners() {
    elements.searchInput.addEventListener('input', handleSearchInput);

    elements.genreFilter.addEventListener('change', handleFilterChange);
    elements.countryFilter.addEventListener('change', handleFilterChange);
    elements.ageRatingFilter.addEventListener('change', handleFilterChange);

    elements.sortBy.addEventListener('change', handleFilterChange);
    elements.sortOrder.addEventListener('change', handleFilterChange);
}

function handleSearchInput() {
    clearTimeout(state.searchTimeout);
    state.searchTimeout = setTimeout(() => {
        resetPageAndSearch();
    }, 300);
}

function handleFilterChange() {
    resetPageAndSearch();
}

function resetPageAndSearch() {
    state.currentPage = 1;
    performSearch();
}

// Search Logic
async function performSearch(page = 1) {
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

    appendCheckedValues(params, 'genre', elements.genreFilter);
    appendCheckedValues(params, 'country', elements.countryFilter);
    appendCheckedValues(params, 'ageRating', elements.ageRatingFilter);

    return params;
}

function appendCheckedValues(params, key, container) {
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
    if (data.totalPages <= 1) {
        elements.paginationNav.innerHTML = '';
        return;
    }

    const paginationHTML = buildPaginationHTML(data);
    elements.paginationNav.innerHTML = paginationHTML;
    attachPaginationListeners();
}

function buildPaginationHTML(data) {
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
    return `
        <li class="page-item">
            <a class="page-link" href="#" data-page="${page}">${content}</a>
        </li>
    `;
}

function attachPaginationListeners() {
    elements.paginationNav.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', handlePaginationClick);
    });
}

function handlePaginationClick(e) {
    e.preventDefault();
    const page = parseInt(e.currentTarget.dataset.page);
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
performSearch();