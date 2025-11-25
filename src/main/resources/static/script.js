// Configuration
const API_BASE_URL = '/api/movies';
const FAVORITES_KEY = 'omdb_favorites';

// State
let currentSearch = '';
let currentPage = 1;
let totalResults = 0;
let showingFavorites = false;

// Test that JavaScript is loading
console.log('=== OMDB Movie Explorer JavaScript Loaded ===');
console.log('API_BASE_URL:', API_BASE_URL);

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resultsContainer = document.getElementById('resultsContainer');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMsg = document.getElementById('errorMsg');
const paginationContainer = document.getElementById('paginationContainer');
const movieModal = document.getElementById('movieModal');
const modalContent = document.getElementById('movieDetailContent');
const closeModal = document.querySelector('.close');
const showFavoritesBtn = document.getElementById('showFavoritesBtn');
const favCount = document.getElementById('favCount');

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});
closeModal.addEventListener('click', () => movieModal.classList.remove('show'));
showFavoritesBtn.addEventListener('click', toggleFavorites);
window.addEventListener('click', (e) => {
    if (e.target === movieModal) movieModal.classList.remove('show');
});

// Initialize
updateFavoritesCount();
console.log('=== Event listeners attached ===');

// Functions
async function handleSearch() {
    const query = searchInput.value.trim();
    
    if (!query) {
        showError('Please enter a search term');
        return;
    }
    
    currentSearch = query;
    currentPage = 1;
    showingFavorites = false;
    await searchMovies(query, currentPage);
}

async function searchMovies(title, page) {
    showLoading();
    hideError();
    resultsContainer.innerHTML = '';
    paginationContainer.innerHTML = '';
    
    try {
        console.log('Searching for:', title, 'page:', page);
        const url = `${API_BASE_URL}/search?title=${encodeURIComponent(title)}&page=${page}`;
        console.log('Fetching URL:', url);
        
        const response = await fetch(url);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Raw data received:', data);
        console.log('Search field (capital):', data.Search);
        console.log('Response field:', data.Response);
        
        // Backend returns UPPERCASE field names: Search, Response, Error
        const searchResults = data.Search;
        const responseStatus = data.Response;
        
        if (responseStatus === 'True' && searchResults && searchResults.length > 0) {
            totalResults = parseInt(data.totalResults || 0);
            console.log('Displaying', searchResults.length, 'movies');
            displayMovies(searchResults);
            displayPagination();
        } else {
            const errorMessage = data.Error || 'No movies found';
            console.log('No results:', errorMessage);
            showError(errorMessage);
        }
    } catch (error) {
        console.error('Fetch error:', error);
        showError('Error: ' + error.message);
    } finally {
        hideLoading();
    }
}

function displayMovies(movies) {
    console.log('displayMovies called with', movies.length, 'movies');
    resultsContainer.innerHTML = '';
    
    movies.forEach((movie, index) => {
        console.log('Creating card for movie', index, ':', movie.Title);
        const card = createMovieCard(movie);
        resultsContainer.appendChild(card);
    });
}

function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    
    const isFavorite = isFavoriteMovie(movie.imdbID);
    
    // Backend returns Title, Year, Poster, Type, imdbID (capital letters)
    card.innerHTML = `
        <div class="favorite-btn ${isFavorite ? 'active' : ''}" data-id="${movie.imdbID}">
            ${isFavorite ? '❤️' : '🤍'}
        </div>
        ${movie.Poster !== 'N/A' 
            ? `<img src="${movie.Poster}" alt="${movie.Title}">` 
            : '<div class="no-poster">🎬</div>'}
        <div class="movie-info">
            <div class="movie-title">${movie.Title}</div>
            <div class="movie-year">${movie.Year}</div>
            <span class="movie-type">${movie.Type}</span>
        </div>
    `;
    
    card.querySelector('.favorite-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(movie);
    });
    
    card.addEventListener('click', () => showMovieDetail(movie.imdbID));
    
    return card;
}

async function showMovieDetail(imdbId) {
    showLoading();
    
    try {
        console.log('Fetching details for:', imdbId);
        const response = await fetch(`${API_BASE_URL}/${imdbId}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch movie details');
        }
        
        const movie = await response.json();
        console.log('Movie details received:', movie);
        displayMovieDetail(movie);
        movieModal.classList.add('show');
    } catch (error) {
        console.error('Error fetching details:', error);
        showError('Failed to fetch movie details');
    } finally {
        hideLoading();
    }
}

function displayMovieDetail(movie) {
    // Backend returns all fields with Capital letters
    const posterUrl = movie.Poster !== 'N/A' ? movie.Poster : '';
    const isFavorite = isFavoriteMovie(movie.imdbID);
    
    modalContent.innerHTML = `
        <div class="detail-header" style="background-image: url('${posterUrl}');">
            <div class="detail-overlay">
                <div class="detail-title">${movie.Title}</div>
                <div class="detail-meta">
                    <span>${movie.Year}</span>
                    <span>•</span>
                    <span>${movie.Rated}</span>
                    <span>•</span>
                    <span>${movie.Runtime}</span>
                </div>
            </div>
        </div>
        
        <div class="detail-body">
            <div class="detail-section">
                <h3>Plot</h3>
                <p>${movie.Plot}</p>
            </div>
            
            <div class="detail-section">
                <h3>Genre</h3>
                <p>${movie.Genre}</p>
            </div>
            
            <div class="detail-section">
                <h3>Director</h3>
                <p>${movie.Director}</p>
            </div>
            
            <div class="detail-section">
                <h3>Actors</h3>
                <p>${movie.Actors}</p>
            </div>
            
            ${movie.Ratings && movie.Ratings.length > 0 ? `
                <div class="detail-section">
                    <h3>Ratings</h3>
                    <div class="ratings-grid">
                        ${movie.Ratings.map(rating => `
                            <div class="rating-item">
                                <div class="rating-source">${rating.Source}</div>
                                <div class="rating-value">${rating.Value}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <div class="detail-section">
                <button class="favorite-btn-detail ${isFavorite ? 'active' : ''}" 
                        onclick="toggleFavorite({imdbID: '${movie.imdbID}', Title: '${movie.Title.replace(/'/g, "\\'")}', Year: '${movie.Year}', Poster: '${movie.Poster}', Type: '${movie.Type}'})">
                    ${isFavorite ? '❤️ Remove from Favorites' : '🤍 Add to Favorites'}
                </button>
            </div>
        </div>
    `;
}

function displayPagination() {
    paginationContainer.innerHTML = '';
    
    const totalPages = Math.ceil(totalResults / 10);
    
    if (totalPages <= 1) return;
    
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.textContent = '← Previous';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => goToPage(currentPage - 1));
    paginationContainer.appendChild(prevBtn);
    
    const pageInfo = document.createElement('span');
    pageInfo.style.color = 'white';
    pageInfo.style.padding = '10px 20px';
    pageInfo.style.fontWeight = '600';
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    paginationContainer.appendChild(pageInfo);
    
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.textContent = 'Next →';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => goToPage(currentPage + 1));
    paginationContainer.appendChild(nextBtn);
}

async function goToPage(page) {
    currentPage = page;
    await searchMovies(currentSearch, currentPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Favorites Management
function getFavorites() {
    const favorites = localStorage.getItem(FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : [];
}

function saveFavorites(favorites) {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    updateFavoritesCount();
}

function isFavoriteMovie(imdbId) {
    const favorites = getFavorites();
    return favorites.some(fav => fav.imdbID === imdbId);
}

function toggleFavorite(movie) {
    console.log('Toggling favorite for:', movie.Title || movie.title);
    let favorites = getFavorites();
    const index = favorites.findIndex(fav => fav.imdbID === movie.imdbID);
    
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(movie);
    }
    
    saveFavorites(favorites);
    
    if (showingFavorites) {
        displayFavorites();
    } else {
        // Update the current view
        const favBtn = document.querySelector(`.favorite-btn[data-id="${movie.imdbID}"]`);
        if (favBtn) {
            const isFav = isFavoriteMovie(movie.imdbID);
            favBtn.classList.toggle('active', isFav);
            favBtn.textContent = isFav ? '❤️' : '🤍';
        }
    }
    
    // Close modal if open
    if (movieModal.classList.contains('show')) {
        movieModal.classList.remove('show');
    }
}

function updateFavoritesCount() {
    const favorites = getFavorites();
    const countElement = document.getElementById('favCount');
    if (countElement) {
        countElement.textContent = favorites.length;
    }
}

function toggleFavorites() {
    showingFavorites = !showingFavorites;
    
    if (showingFavorites) {
        displayFavorites();
        showFavoritesBtn.textContent = `Show Search Results`;
    } else {
        if (currentSearch) {
            searchMovies(currentSearch, currentPage);
        } else {
            resultsContainer.innerHTML = '';
            paginationContainer.innerHTML = '';
        }
        showFavoritesBtn.innerHTML = `Show Favorites (<span id="favCount">${getFavorites().length}</span>)`;
    }
}

function displayFavorites() {
    const favorites = getFavorites();
    resultsContainer.innerHTML = '';
    paginationContainer.innerHTML = '';
    hideError();
    
    if (favorites.length === 0) {
        showError('No favorites yet. Start adding movies to your favorites!');
        return;
    }
    
    displayMovies(favorites);
}

// UI Helper Functions
function showLoading() {
    loadingSpinner.classList.add('show');
}

function hideLoading() {
    loadingSpinner.classList.remove('show');
}

function showError(message) {
    errorMsg.textContent = message;
    errorMsg.classList.add('show');
}

function hideError() {
    errorMsg.classList.remove('show');
}

console.log('=== Script fully loaded and ready ===');