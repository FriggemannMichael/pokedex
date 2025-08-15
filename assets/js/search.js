// Optimierte search.js - Automatische Suche mit Dropdown

function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchBtn');
    const searchDropdown = document.getElementById('searchDropdown');

    if (!searchInput || !searchButton) return;

    // Initial Button-Status setzen
    updateSearchButtonState(searchButton, false);
    
    // Event Listeners hinzufügen
    addSearchInputListeners(searchInput, searchButton, searchDropdown);
}

function addSearchInputListeners(input, button, dropdown) {
    let searchTimeout;

    // Automatische Suche beim Tippen (ab 3 Buchstaben)
    input.addEventListener('input', (event) => {
        const query = event.target.value.trim();
        
        // Button-Status aktualisieren
        const isValid = isQueryValid(query);
        updateSearchButtonState(button, isValid);
        
        // Dropdown-Suche mit kleiner Verzögerung für bessere Performance
        clearTimeout(searchTimeout);
        
        if (query.length >= 3) {
            searchTimeout = setTimeout(() => {
                performDropdownSearch(query, dropdown);
            }, 300); // 300ms Verzögerung
        } else {
            hideSearchDropdown(dropdown);
        }
    });

    // Enter-Taste für vollständige Suche
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && isQueryValid(input.value)) {
            hideSearchDropdown(dropdown);
            performFullSearch(input.value.trim());
        }
        
        // Escape zum Schließen des Dropdowns
        if (event.key === 'Escape') {
            hideSearchDropdown(dropdown);
            input.blur(); // Fokus entfernen
        }
    });

    // Button-Klick für vollständige Suche
    button.addEventListener('click', () => {
        if (isQueryValid(input.value)) {
            hideSearchDropdown(dropdown);
            performFullSearch(input.value.trim());
        }
    });

    // Klick außerhalb schließt das Dropdown
    document.addEventListener('click', (event) => {
        if (!input.contains(event.target) && 
            !dropdown.contains(event.target) && 
            !button.contains(event.target)) {
            hideSearchDropdown(dropdown);
        }
    });

    // Focus Event - zeigt Dropdown wenn bereits Text vorhanden
    input.addEventListener('focus', () => {
        const query = input.value.trim();
        if (query.length >= 3) {
            performDropdownSearch(query, dropdown);
        }
    });
}

// Dropdown-Suche - zeigt max. 5 Ergebnisse
async function performDropdownSearch(searchQuery, dropdown) {
    try {
        const results = await searchPokemonByName(searchQuery, 5);
        displaySearchDropdown(results, dropdown, searchQuery);
    } catch (error) {
        console.error('Dropdown search error:', error);
        hideSearchDropdown(dropdown);
    }
}

// Dropdown-Ergebnisse anzeigen
function displaySearchDropdown(results, dropdown, query) {
    const resultsContainer = dropdown.querySelector('#searchResults');
    
    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="search-result-item">
                <div class="search-result-info">
                    <div class="search-result-name">No results for "${query}"</div>
                    <div style="font-size: 0.8rem; color: #666; margin-top: 0.2rem;">
                        Try searching in English (e.g., "pikachu", "charizard")
                    </div>
                </div>
            </div>
        `;
    } else {
        resultsContainer.innerHTML = results.map(pokemon => `
            <div class="search-result-item" onclick="selectPokemonFromDropdown(${pokemon.id})">
                <img src="${pokemon.image}" 
                     alt="${pokemon.name}" 
                     class="search-result-image"
                     loading="lazy">
                <div class="search-result-info">
                    <div class="search-result-name">${pokemon.name}</div>
                    <div class="search-result-types">
                        ${pokemon.types.map(type => 
                            `<span class="search-result-type">${type}</span>`
                        ).join('')}
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    showSearchDropdown(dropdown);
}

// Pokemon aus Dropdown auswählen
function selectPokemonFromDropdown(pokemonId) {
    // Erst das Dropdown schließen
    const dropdown = document.getElementById('searchDropdown');
    hideSearchDropdown(dropdown);
    
    // Pokemon aus aktueller Liste finden oder laden
    let pokemon = appState.pokemonList.find(p => p.id === pokemonId);
    
    if (pokemon) {
        openPokemonDetail(pokemon);
    } else {
        // Falls Pokemon nicht in aktueller Liste, einzeln laden
        loadSinglePokemon(pokemonId);
    }
}

// Einzelnes Pokemon laden
async function loadSinglePokemon(pokemonId) {
    try {
        const pokemonUrl = `https://pokeapi.co/api/v2/pokemon/${pokemonId}`;
        const pokemon = await loadPokemonDetails(pokemonUrl);
        openPokemonDetail(pokemon);
    } catch (error) {
        console.error('Error loading single pokemon:', error);
    }
}

// Dropdown anzeigen
function showSearchDropdown(dropdown) {
    if (dropdown) {
        dropdown.classList.remove('d-none');
    }
}

// Dropdown verstecken
function hideSearchDropdown(dropdown) {
    if (dropdown) {
        dropdown.classList.add('d-none');
    }
}

// Vollständige Suche ausführen (ersetzt Pokemon-Liste)
async function performFullSearch(searchQuery) {
    if (appState.isLoading) return;

    setLoadingState(true);
    clearPokemonContainer();

    try {
        const searchResults = await searchPokemonByName(searchQuery, 50);
        handleSearchResults(searchResults, searchQuery);
    } catch (error) {
        handleError('Search error', error);
        showSearchError();
    } finally {
        setLoadingState(false);
    }
}

// Pokemon-Suche - nur englische Namen, optimiert
async function searchPokemonByName(searchQuery, limit = 50) {
    // Erst lokal suchen (in bereits geladenen Pokemon)
    const localResults = findPokemonLocally(searchQuery);
    if (localResults.length > 0) {
        return localResults.slice(0, limit);
    }

    // Wenn lokal nichts gefunden, API abfragen
    return await fetchPokemonFromAPI(searchQuery, limit);
}

// Lokale Suche in bereits geladenen Pokemon
function findPokemonLocally(query) {
    const lowerQuery = query.toLowerCase();
    return appState.pokemonList.filter(pokemon => 
        pokemon.name.toLowerCase().includes(lowerQuery)
    );
}

// API-Suche für nicht geladene Pokemon
async function fetchPokemonFromAPI(query, limit) {
    try {
        // Erste 1000 Pokemon für bessere Performance
        const searchResponse = await fetchFromPokeAPI(`${POKEMON_API_CONFIG.baseUrl}?offset=0&limit=1000`);
        const matchingPokemon = filterMatchingPokemon(searchResponse, query);
        return await loadLimitedPokemonDetails(matchingPokemon, limit);
    } catch (error) {
        console.error('API search error:', error);
        return [];
    }
}

// Pokemon nach Namen filtern
function filterMatchingPokemon(searchResponse, query) {
    const lowerQuery = query.toLowerCase();
    return searchResponse.results.filter(pokemon =>
        pokemon.name.toLowerCase().includes(lowerQuery)
    );
}

// Begrenzte Anzahl Pokemon-Details laden
async function loadLimitedPokemonDetails(matchingPokemon, limit) {
    const limitedMatches = matchingPokemon.slice(0, limit);
    return await loadPokemonDetailsForUrls(limitedMatches.map(p => p.url));
}

// Pokemon-Details für URLs laden
async function loadPokemonDetailsForUrls(urls) {
    return await Promise.all(urls.map(url => loadPokemonDetails(url)));
}

// Suchergebnisse verarbeiten
function handleSearchResults(results, searchQuery) {
    if (results.length === 0) {
        showNoSearchResults(searchQuery);
        return;
    }

    updateSearchResults(results);
    activateSearchMode();
}

// Suchergebnisse in App-State aktualisieren
function updateSearchResults(results) {
    appState.pokemonList = results;
    appState.currentPage = 1;
    appState.totalPages = 1; // Suchergebnisse haben nur eine Seite
    renderPokemon(results);
    updatePaginationControls();
}

// Such-Modus aktivieren
function activateSearchMode() {
    appState.selectedType = 'search';
    appState.nextPageOffset = 0;
    updateFilterButtonsForSearch();
}

// "Keine Ergebnisse" anzeigen
function showNoSearchResults(searchQuery) {
    const container = document.getElementById('pokemonContainer');
    container.innerHTML = `
        <div class="col-12">
            <div class="no-results text-center py-5">
                <h3>🔍 No Pokemon Found</h3>
                <p>No Pokemon found for "<strong>${searchQuery}</strong>".</p>
                <p class="text-muted">
                    <small>Make sure to search in English (e.g., "pikachu", "charizard")</small>
                </p>
                <button class="btn btn-primary" onclick="clearSearch()">
                    ← Back to All Pokemon
                </button>
            </div>
        </div>
    `;
}

// Suchfehler anzeigen
function showSearchError() {
    const container = document.getElementById('pokemonContainer');
    container.innerHTML = `
        <div class="col-12">
            <div class="search-error text-center py-5">
                <h3>⚠️ Search Error</h3>
                <p>An error occurred during the search. Please try again.</p>
                <button class="btn btn-primary" onclick="clearSearch()">
                    ← Back to All Pokemon
                </button>
            </div>
        </div>
    `;
}

// Filter-Buttons für Suche aktualisieren
function updateFilterButtonsForSearch() {
    resetFilterButtons();
    updateAllButtonForSearch();
}

// Alle Filter-Buttons zurücksetzen
function resetFilterButtons() {
    const filterButtons = document.querySelectorAll('.btn-filter[data-type]');
    filterButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    // Dropdown-Button auch zurücksetzen
    const dropdownButton = document.querySelector('#moreTypesDropdown');
    if (dropdownButton) {
        dropdownButton.classList.remove('active');
    }
}

// "All" Button für Suche markieren
function updateAllButtonForSearch() {
    const allButton = document.querySelector('[data-type="all"]');
    if (allButton) {
        allButton.classList.add('active');
        allButton.innerHTML = '<span class="filter-text">🔍 Search Results</span>';
    }
}

// Suche zurücksetzen
function clearSearch() {
    resetSearchInput();
    resetToAllFilter();
    loadPokemon();
}

// Sucheingabe zurücksetzen
function resetSearchInput() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchBtn');
    const searchDropdown = document.getElementById('searchDropdown');

    if (searchInput) {
        searchInput.value = '';
        updateSearchButtonState(searchButton, false);
        hideSearchDropdown(searchDropdown);
    }
}

// Zurück zu "Alle" Filter
function resetToAllFilter() {
    appState.selectedType = 'all';
    appState.currentPage = 1;
    appState.nextPageOffset = 0;
    resetAllButtonText();
}

// "All" Button Text zurücksetzen
function resetAllButtonText() {
    const allButton = document.querySelector('[data-type="all"]');
    if (allButton) {
        allButton.innerHTML = '<span class="filter-text">All</span>';
    }
}

// Hilfsfunktionen
function isQueryValid(query) {
    return query.trim().length >= 3;
}

function updateSearchButtonState(button, isEnabled) {
    if (!button) return;
    
    button.disabled = !isEnabled;
    button.classList.toggle('btn-primary', isEnabled);
    button.classList.toggle('btn-light', !isEnabled);
    button.title = isEnabled ? 'Search Pokemon' : 'Enter at least 3 letters';
}

function clearPokemonContainer() {
    const container = document.getElementById('pokemonContainer');
    if (container) {
        container.innerHTML = '';
    }
}