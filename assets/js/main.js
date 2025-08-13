const appState = {
    pokemonList: [],
    isLoading: false,
    selectedType: 'all',
    nextPageOffset: 0
};

const domElements = {
    pokemonContainer: document.getElementById('pokemonContainer'),
    loadingSpinner: document.querySelector('.loading-spinner'),
    loadMoreButton: document.getElementById('loadMoreBtn'),
    filterButtons: document.querySelectorAll('.filters .btn[data-type]')
};

async function loadPokemon() {
    if (appState.isLoading) return;

    setLoadingState(true);

    try {
        const pokemonDetails = await fetchPokemonData(
            appState.nextPageOffset,
            POKEMON_API_CONFIG.pokemonPerPage
        );
        
        updateAppStateAfterLoad(pokemonDetails);
        renderPokemon(pokemonDetails);
        
    } catch (error) {
        handleError('Fehler beim Laden der Pokemon', error);
    } finally {
        setLoadingState(false);
    }
}

function updateAppStateAfterLoad(pokemonDetails) {
    appState.pokemonList = pokemonDetails;
    appState.nextPageOffset = POKEMON_API_CONFIG.pokemonPerPage;
}

function setLoadingState(loading) {
    appState.isLoading = loading;
    toggleLoadingSpinner(loading);
}

function toggleLoadingSpinner(loading) {
    if (loading) {
        domElements.loadingSpinner.classList.remove('d-none');
    } else {
        domElements.loadingSpinner.classList.add('d-none');
    }
}

function handleError(message, error) {
    console.error(message, error);
}

async function loadPokemonByType(type) {
    if (appState.isLoading) return;

    setLoadingState(true);
    clearPokemonContainer();

    try {
        clearSearchMode();
        const pokemonDetails = await getPokemonByType(type);
        updateAppStateAfterTypeLoad(pokemonDetails);
        renderPokemon(pokemonDetails);
        
    } catch (error) {
        handleError('Fehler beim Laden nach Typ', error);
    } finally {
        setLoadingState(false);
    }
}

async function getPokemonByType(type) {
    return (type === 'all')   
        ? await fetchPokemonData(0, POKEMON_API_CONFIG.pokemonPerPage)
        : await fetchPokemonByTypeData(type);
}

function updateAppStateAfterTypeLoad(pokemonDetails) {
    appState.pokemonList = pokemonDetails;
    appState.nextPageOffset = POKEMON_API_CONFIG.pokemonPerPage;
}

function clearPokemonContainer() {
    domElements.pokemonContainer.innerHTML = '';
}

function clearSearchMode() {
    appState.selectedType = 'all';
    appState.nextPageOffset = 0;
    
    resetAllButtonText();
    clearSearchInput();
}

function resetAllButtonText() {
    const allButton = document.querySelector('[data-type="all"]');
    if (allButton && allButton.textContent !== 'Alle') {
        allButton.textContent = 'Alle';
    }
}

function clearSearchInput() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchBtn');
    
    if (searchInput) {
        searchInput.value = '';
        if (typeof updateSearchButtonState === 'function') {
            updateSearchButtonState(searchButton, false);
        }
    }
}

function renderPokemon(pokemonList) {
    clearPokemonContainer();
    pokemonList.forEach(pokemon => {
        appendPokemonCard(pokemon);
    });
}

function appendPokemonCard(pokemon) {
    const pokemonCard = createPokemonCard(pokemon);
    domElements.pokemonContainer.appendChild(pokemonCard);
}

function createPokemonCard(pokemon) {
    const cardElement = document.createElement('div');
    cardElement.className = 'col-md-4 col-lg-3 mb-4';
    
    cardElement.innerHTML = getPokemonCardTemplate(pokemon);
    cardElement.addEventListener('click', () => openPokemonDetail(pokemon));
    
    return cardElement;
}

function getPokemonCardTemplate(pokemon) {
    const pokemonNumber = formatPokemonNumber(pokemon.id);
    const typeClasses = getTypeClasses(pokemon.types);
    const typeBadges = createTypeBadges(pokemon.types);
    
    return `
        <div class="pokemon-card h-100 type-${pokemon.types[0]}" data-pokemon-id="${pokemon.id}">
            <div class="pokemon-image-wrapper">
                <span class="pokemon-number">${pokemonNumber}</span>
                <img src="${pokemon.image}" alt="${pokemon.name}" class="pokemon-image">
            </div>
            <div class="pokemon-card-content">
                <h5 class="pokemon-name">${pokemon.name}</h5>
                <div class="pokemon-types">
                    ${typeBadges}
                </div>
            </div>
        </div>
    `;
}

function formatPokemonNumber(id) {
    return `#${id.toString().padStart(3, '0')}`;
}

function getTypeClasses(types) {
    return types.map(type => `type-${type}`).join(' ');
}

function createTypeBadges(types) {
    return types.map(type => 
        `<span class="type-badge">${type.toUpperCase()}</span>`
    ).join('');
}

function setLoadMoreButtonState(loading) {
    if (!domElements.loadMoreButton) return;
    
    const loadText = domElements.loadMoreButton.querySelector('.load-more-text');
    const loadSpinner = domElements.loadMoreButton.querySelector('.load-more-spinner');
    
    toggleLoadMoreElements(loading, loadText, loadSpinner);
    domElements.loadMoreButton.disabled = loading;
}

function toggleLoadMoreElements(loading, loadText, loadSpinner) {
    if (loading) {
        loadText.classList.add('d-none');
        loadSpinner.classList.remove('d-none');
    } else {
        loadText.classList.remove('d-none');
        loadSpinner.classList.add('d-none');
    }
}

async function loadMorePokemon() {
    if (appState.isLoading) return;
    
    setLoadingState(true);
    setLoadMoreButtonState(true);
    
    try {
        const newPokemonDetails = await fetchNewPokemonDetails();
        
        if (hasNewPokemonData(newPokemonDetails)) {
            updatePokemonList(newPokemonDetails);
        } else {
            console.log('Keine weiteren Pokemon verfügbar');
        }
        
    } catch (error) {
        handleError('Fehler beim Nachladen', error);
    } finally {
        resetLoadingState();
    }
}

async function fetchNewPokemonDetails() {
    switch (appState.selectedType) {
        case 'all':
            return await fetchPokemonData(
                appState.nextPageOffset, 
                POKEMON_API_CONFIG.pokemonPerPage
            );
        case 'search':
            console.log('Load More im Search-Modus nicht möglich');
            return [];
        default:
            return await fetchMorePokemonByType(
                appState.selectedType, 
                appState.nextPageOffset
            );
    }
}

function hasNewPokemonData(newPokemonDetails) {
    return newPokemonDetails && newPokemonDetails.length > 0;
}

function updatePokemonList(newPokemonDetails) {
    appState.pokemonList = [...appState.pokemonList, ...newPokemonDetails];
    appendNewPokemon(newPokemonDetails);
    appState.nextPageOffset += POKEMON_API_CONFIG.pokemonPerPage;
}

function appendNewPokemon(pokemonList) {
    pokemonList.forEach(pokemon => {
        appendPokemonCard(pokemon);
    });
}

function resetLoadingState() {
    setLoadingState(false);
    setLoadMoreButtonState(false);
}

function initializeFilters() {
    domElements.filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            handleFilterClick(button);
        });
    });
}

function handleFilterClick(button) {
    appState.selectedType = button.getAttribute('data-type');
    appState.nextPageOffset = 0;
    
    setActiveFilter(button);
    loadPokemonByType(appState.selectedType);
}

function setActiveFilter(selectedButton) {
    domElements.filterButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    selectedButton.classList.add('active');
}

function initializeLoadMore() {
    domElements.loadMoreButton.addEventListener('click', () => {
        loadMorePokemon();
    });
}

function initializeApp() {
    console.log('Pokédex wird geladen...');
    
    loadPokemon();
    initializeFilters();
    initializeLoadMore();
    initializeSearch();
}

document.addEventListener('DOMContentLoaded', initializeApp);