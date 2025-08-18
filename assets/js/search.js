function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchBtn');
    const searchDropdown = document.getElementById('searchDropdown');

    if (!searchInput || !searchButton) return;

    updateSearchButtonState(searchButton, false);
    addSearchInputListeners(searchInput, searchButton, searchDropdown);
}

function addSearchInputListeners(input, button, dropdown) {
  let searchTimeout;

  input.addEventListener('input', (event) => handleInput(event, button, dropdown));
  input.addEventListener('keydown', (event) => handleKeydown(event, input, dropdown));
  input.addEventListener('focus', () => handleFocus(input, dropdown));
  button.addEventListener('click', () => handleButtonClick(input, dropdown));
  document.addEventListener('click', (event) => handleDocumentClick(event, input, button, dropdown));

  function handleInput(event, button, dropdown) {
    const query = event.target.value.trim();
    updateSearchButtonState(button, isQueryValid(query));
    clearTimeout(searchTimeout);
    query.length >= 3
      ? searchTimeout = setTimeout(() => performDropdownSearch(query, dropdown), 300)
      : hideSearchDropdown(dropdown);
  }

  function handleKeydown(event, input, dropdown) {
    if (event.key === 'Enter' && isQueryValid(input.value)) {
      hideSearchDropdown(dropdown);
      performFullSearch(input.value.trim());
    }
    if (event.key === 'Escape') {
      hideSearchDropdown(dropdown);
      input.blur();
    }
  }

  function handleButtonClick(input, dropdown) {
    if (isQueryValid(input.value)) {
      hideSearchDropdown(dropdown);
      performFullSearch(input.value.trim());
    }
  }

  function handleDocumentClick(event, input, button, dropdown) {
    const outsideClick = !input.contains(event.target) && !dropdown.contains(event.target) && !button.contains(event.target);
    if (outsideClick) hideSearchDropdown(dropdown);
  }

  function handleFocus(input, dropdown) {
    const query = input.value.trim();
    if (query.length >= 3) performDropdownSearch(query, dropdown);
  }
}


async function performDropdownSearch(searchQuery, dropdown) {
    try {
        const results = await searchPokemonByName(searchQuery, 5);
        displaySearchDropdown(results, dropdown, searchQuery);
    } catch (error) {
        console.error('Dropdown search error:', error);
        hideSearchDropdown(dropdown);
    }
}

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

function selectPokemonFromDropdown(pokemonId) {
    const dropdown = document.getElementById('searchDropdown');
    hideSearchDropdown(dropdown);
    let pokemon = appState.pokemonList.find(p => p.id === pokemonId);
    
    if (pokemon) {
        openPokemonDetail(pokemon);
    } else {
        loadSinglePokemon(pokemonId);
    }
}

async function loadSinglePokemon(pokemonId) {
    try {
        const pokemonUrl = `https://pokeapi.co/api/v2/pokemon/${pokemonId}`;
        const pokemon = await loadPokemonDetails(pokemonUrl);
        openPokemonDetail(pokemon);
    } catch (error) {
        console.error('Error loading single pokemon:', error);
    }
}

function showSearchDropdown(dropdown) {
    if (dropdown) {
        dropdown.classList.remove('d-none');
    }
}

function hideSearchDropdown(dropdown) {
    if (dropdown) {
        dropdown.classList.add('d-none');
    }
}

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

async function searchPokemonByName(searchQuery, limit = 50) {
    const localResults = findPokemonLocally(searchQuery);
    if (localResults.length > 0) {
        return localResults.slice(0, limit);
    }

    return await fetchPokemonFromAPI(searchQuery, limit);
}

function findPokemonLocally(query) {
    const lowerQuery = query.toLowerCase();
    return appState.pokemonList.filter(pokemon => 
        pokemon.name.toLowerCase().includes(lowerQuery)
    );
}

async function fetchPokemonFromAPI(query, limit) {
    try {
        const searchResponse = await fetchFromPokeAPI(`${POKEMON_API_CONFIG.baseUrl}?offset=0&limit=1000`);
        const matchingPokemon = filterMatchingPokemon(searchResponse, query);
        return await loadLimitedPokemonDetails(matchingPokemon, limit);
    } catch (error) {
        console.error('API search error:', error);
        return [];
    }
}

function filterMatchingPokemon(searchResponse, query) {
    const lowerQuery = query.toLowerCase();
    return searchResponse.results.filter(pokemon =>
        pokemon.name.toLowerCase().includes(lowerQuery)
    );
}

async function loadLimitedPokemonDetails(matchingPokemon, limit) {
    const limitedMatches = matchingPokemon.slice(0, limit);
    return await loadPokemonDetailsForUrls(limitedMatches.map(p => p.url));
}

async function loadPokemonDetailsForUrls(urls) {
    return await Promise.all(urls.map(url => loadPokemonDetails(url)));
}

function handleSearchResults(results, searchQuery) {
    if (results.length === 0) {
        showNoSearchResults(searchQuery);
        return;
    }

    updateSearchResults(results);
    activateSearchMode();
}

function updateSearchResults(results) {
    appState.pokemonList = results;
    appState.currentPage = 1;
    appState.totalPages = 1;
    renderPokemon(results);
    updatePaginationControls();
}

function activateSearchMode() {
    appState.selectedType = 'search';
    appState.nextPageOffset = 0;
    updateFilterButtonsForSearch();
}





function updateFilterButtonsForSearch() {
    resetFilterButtons();
    updateAllButtonForSearch();
}

function resetFilterButtons() {
    const filterButtons = document.querySelectorAll('.btn-filter[data-type]');
    filterButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    const dropdownButton = document.querySelector('#moreTypesDropdown');
    if (dropdownButton) {
        dropdownButton.classList.remove('active');
    }
}

function updateAllButtonForSearch() {
    const allButton = document.querySelector('[data-type="all"]');
    if (allButton) {
        allButton.classList.add('active');
        allButton.innerHTML = '<span class="filter-text">🔍 Search Results</span>';
    }
}

function clearSearch() {
    resetSearchInput();
    resetToAllFilter();
    loadPokemon();
}

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

function resetToAllFilter() {
    appState.selectedType = 'all';
    appState.currentPage = 1;
    appState.nextPageOffset = 0;
    resetAllButtonText();
}

function resetAllButtonText() {
    const allButton = document.querySelector('[data-type="all"]');
    if (allButton) {
        allButton.innerHTML = '<span class="filter-text">All</span>';
    }
}

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
