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
    button.title = isEnabled ? 'Search Pokemon' : 'Enter at least 3 letters';
}

async function performSearch(searchQuery) {
    if (appState.isLoading) return;

    console.log(`Search for: "${searchQuery}"`);
    setLoadingState(true);
    clearPokemonContainer();

    try {
        const searchResults = await searchPokemonByName(searchQuery);
        handleSearchResults(searchResults, searchQuery);
    } catch (error) {
        handleError('Search error', error);
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
        console.log(`🌐 API search for: "${query}"`);
        
        // Extended: Load 1000 Pokemon (almost all)
        const searchResponse = await fetchFromPokeAPI(`${POKEMON_API_CONFIG.baseUrl}?offset=0&limit=1000`);
        
        const matchingPokemon = searchResponse.results.filter(pokemon =>
            pokemon.name.toLowerCase().includes(query.toLowerCase())
        );

        console.log(`✅ ${matchingPokemon.length} Pokemon found in API:`, matchingPokemon.map(p => p.name));

        const limitedMatches = matchingPokemon.slice(0, 50);
        return await loadPokemonDetailsForUrls(limitedMatches.map(p => p.url));
    } catch (error) {
        console.error('Extended search failed:', error);
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
                <h3>🔍 No Results</h3>
                <p>No Pokemon found for "${searchQuery}".</p>
                <button class="btn btn-primary" onclick="clearSearch()">Back to Overview</button>
            </div>
        </div>
    `;
}

function showSearchError() {
    domElements.pokemonContainer.innerHTML = `
        <div class="col-12">
            <div class="search-error text-center py-5">
                <h3>⚠️ Search Error</h3>
                <p>An error occurred during the search.</p>
                <button class="btn btn-primary" onclick="clearSearch()">Back to Overview</button>
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
        allButton.textContent = '🔍 Search';
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
        allButton.textContent = 'All';
    }
}

function clearPokemonContainer() {
    domElements.pokemonContainer.innerHTML = '';
}