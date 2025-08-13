function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchBtn');

    if (!searchInput || !searchButton) return;

    updateSearchButtonState(searchButton, false);
    addSearchInputListeners(searchInput, searchButton);
}

function addSearchInputListeners(input, button) {
    input.addEventListener('input', () => {
        const isValid = isQueryValid(input.value);
        updateSearchButtonState(button, isValid);
    });

    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && isQueryValid(input.value)) {
            performSearch(input.value.trim());
        }
    });

    button.addEventListener('click', () => {
        if (isQueryValid(input.value)) {
            performSearch(input.value.trim());
        }
    });
}

function isQueryValid(query) {
    return query.trim().length >= 3;
}

function updateSearchButtonState(button, isEnabled) {
    button.disabled = !isEnabled;
    button.classList.toggle('btn-primary', isEnabled);
    button.classList.toggle('btn-light', !isEnabled);
    button.title = isEnabled ? 'Pokemon suchen' : 'Mindestens 3 Buchstaben eingeben';
}

async function performSearch(searchQuery) {
    if (appState.isLoading) return;

    console.log(`Suche nach: "${searchQuery}"`);
    setLoadingState(true);
    clearPokemonContainer();

    try {
        const searchResults = await searchPokemonByName(searchQuery);
        handleSearchResults(searchResults, searchQuery);
    } catch (error) {
        handleError('Fehler bei der Suche', error);
        showSearchError();
    } finally {
        setLoadingState(false);
    }
}

async function searchPokemonByName(searchQuery) {
    const localResults = findPokemonLocally(searchQuery);
    if (localResults.length > 0) return localResults;

    return await fetchPokemonFromAPI(searchQuery);
}

function findPokemonLocally(query) {
    return appState.pokemonList.filter(pokemon => 
        pokemon.name.toLowerCase().includes(query.toLowerCase())
    );
}

async function fetchPokemonFromAPI(query) {
    try {
        const searchResponse = await fetchFromPokeAPI(`${POKEMON_API_CONFIG.baseUrl}?offset=0&limit=200`);
        const matchingPokemon = searchResponse.results.filter(pokemon =>
            pokemon.name.toLowerCase().includes(query.toLowerCase())
        );

        const limitedMatches = matchingPokemon.slice(0, 50);
        return await loadPokemonDetailsForUrls(limitedMatches.map(p => p.url));
    } catch (error) {
        console.error('Erweiterte Suche fehlgeschlagen:', error);
        return [];
    }
}

async function loadPokemonDetailsForUrls(urls) {
    return await Promise.all(urls.map(url => loadPokemonDetails(url)));
}

function handleSearchResults(results, searchQuery) {
    if (results.length === 0) {
        showNoSearchResults(searchQuery);
        return;
    }

    appState.pokemonList = results;
    renderPokemon(results);
    activateSearchMode();
}

function activateSearchMode() {
    appState.selectedType = 'search';
    updateFilterButtonsForSearch();
}

function showNoSearchResults(searchQuery) {
    domElements.pokemonContainer.innerHTML = `
        <div class="col-12">
            <div class="no-results text-center py-5">
                <h3>🔍 Keine Ergebnisse</h3>
                <p>Für "${searchQuery}" wurden keine Pokemon gefunden.</p>
                <button class="btn btn-primary" onclick="clearSearch()">Zurück zur Übersicht</button>
            </div>
        </div>
    `;
}

function showSearchError() {
    domElements.pokemonContainer.innerHTML = `
        <div class="col-12">
            <div class="search-error text-center py-5">
                <h3>⚠️ Suchfehler</h3>
                <p>Bei der Suche ist ein Fehler aufgetreten.</p>
                <button class="btn btn-primary" onclick="clearSearch()">Zurück zur Übersicht</button>
            </div>
        </div>
    `;
}

function updateFilterButtonsForSearch() {
    domElements.filterButtons.forEach(button => {
        button.classList.remove('active');
    });

    const allButton = document.querySelector('[data-type="all"]');
    if (allButton) {
        allButton.classList.add('active');
        allButton.textContent = '🔍 Suche';
    }
}

function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchBtn');

    if (searchInput) {
        searchInput.value = '';
        updateSearchButtonState(searchButton, false);
    }

    resetToAllFilter();
    loadPokemon();
}

function resetToAllFilter() {
    appState.selectedType = 'all';
    appState.nextPageOffset = 0;

    const allButton = document.querySelector('[data-type="all"]');
    if (allButton) {
        allButton.textContent = 'Alle';
    }
}

function clearPokemonContainer() {
    domElements.pokemonContainer.innerHTML = '';
}