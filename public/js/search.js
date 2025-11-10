let searchTimeout;
let currentPage = 1;

const searchInput = document.getElementById('searchInput');
const genreFilter = document.getElementById('genreFilter');
const sortBy = document.getElementById('sortBy');
const sortOrder = document.getElementById('sortOrder');
const filterButton = document.getElementById('filterBtn');
const sortButton = document.getElementById('sortBtn');
const filterOptions = document.getElementById('filterOptions');
const sortOptions = document.getElementById('sortOptions');

filterButton.addEventListener('click', () => {
    filterOptions.style.display = filterOptions.style.display === 'none' ? 'block' : 'none';
});

sortButton.addEventListener('click', () => {
    sortOptions.style.display = sortOptions.style.display === 'none' ? 'block' : 'none';
});

searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        currentPage = 1;
        performSearch();
    }, 300);
});

genreFilter.addEventListener('change', () => {
    currentPage = 1;
    performSearch();
});

sortBy.addEventListener('change', () => {
    currentPage = 1;
    performSearch();
});

sortOrder.addEventListener('change', () => {
    currentPage = 1;
    performSearch();
});

async function performSearch(page = 1) {
    const query = searchInput.value;
    const genre = genreFilter.value;
    const sort = sortBy.value;
    const order = sortOrder.value;

    try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&genre=${genre}&sortBy=${sort}&sortOrder=${order}&page=${page}`);
        const data = await response.json();

        updateResults(data);
    } catch (error) {
        console.error('Search error:', error);
    }
}

function updateResults(data) {
    const movieGrid = document.getElementById('movieGrid');
    movieGrid.innerHTML = '';

    if (data.movies.length === 0) {
        movieGrid.innerHTML = '<div class="col-12"><p class="text-center">No movies found.</p></div>';
    } else {
        data.movies.forEach(movie => {
            const col = document.createElement('div');
            col.className = 'col-md-4 col-sm-6 col-12';
            col.innerHTML = `
                <div class="moviePoster">
                    <a href="/movieDetails/${movie._id}">
                        <img src="/img/moviePosters/${movie.poster}" alt="Poster of ${movie.title} (${movie.releaseYear})">
                        <div class="moviePosterTitle">
                            <span class="title">${movie.title}</span><br>
                            <span class="year">${movie.releaseYear}</span>
                        </div>
                    </a>
                </div>
            `;
            movieGrid.appendChild(col);
        });
    }

    updatePagination(data);
}

function updatePagination(data) {
    const paginationNav = document.getElementById('paginationNav');

    if (data.totalPages <= 1) {
        paginationNav.innerHTML = '';
        return;
    }

    let paginationHTML = '<ul class="pagination justify-content-center">';

    if (data.hasPrev) {
        paginationHTML += `
            <li class="page-item">
                <a class="page-link" href="#" data-page="${data.prevPage}">
                    <i class="bi bi-chevron-left"></i>
                </a>
            </li>
        `;
    }

    data.pages.forEach(page => {
        paginationHTML += `
            <li class="page-item ${page.isCurrent ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${page.number}">${page.number}</a>
            </li>
        `;
    });

    if (data.hasNext) {
        paginationHTML += `
            <li class="page-item">
                <a class="page-link" href="#" data-page="${data.nextPage}">
                    <i class="bi bi-chevron-right"></i>
                </a>
            </li>
        `;
    }

    paginationHTML += '</ul>';
    paginationNav.innerHTML = paginationHTML;

    paginationNav.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = parseInt(e.currentTarget.dataset.page);
            currentPage = page;
            performSearch(page);
        });
    });
}