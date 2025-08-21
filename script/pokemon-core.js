const appState = {
    pokemonList: [],
    allPokemonList: [],
    isLoading: false,
    selectedType: "all",
    nextPageOffset: 0,
    currentPage: 1,
};

const domElements = {
    pokemonContainer: document.getElementById("pokemonContainer"),
    loadingSpinner: document.querySelector(".loading-spinner"),
    loadMoreButton: document.getElementById("loadMoreBtn"),
    filterButtons: document.querySelectorAll(".btn-filter[data-type]"),
    dropdownItems: document.querySelectorAll(".dropdown-item.type-item[data-type]"),
};

async function loadPokemon() {
    if (appState.isLoading) return;
    
    setLoadingState(true);
    
    const pokemonDetails = await fetchPokemonData(
        appState.nextPageOffset,
        POKEMON_API_CONFIG.pokemonPerPage
    );
    
    updateAppStateAfterLoad(pokemonDetails);
    renderPokemon(pokemonDetails);
    setLoadingState(false);
}

async function loadPokemonByType(type) {
    if (appState.isLoading) return;
    
    setLoadingState(true); 
    clearPokemonContainer();
    appState.selectedType = type;  
    
    try {
        const list = type === "all" ? [...appState.allPokemonList] : await getPokemonByType(type);
        
        if (type !== "all") {
           
            appState.nextPageOffset = 0;
            appState.currentPage = 1;
            resetAllButtonText();
            clearSearchInput();
            
            
            appState.pokemonList = list;
            appState.nextPageOffset = POKEMON_API_CONFIG.pokemonPerPage;
            
        } else {
            
            appState.pokemonList = list;
            appState.nextPageOffset = list.length;
            appState.currentPage = 1;
        }
        
        renderPokemon(list);
        
    } catch (e) { 
        console.error(e); 
    } finally { 
        setLoadingState(false); 
    }
}

async function getPokemonByType(type) {
    if (type === "all") {
        return await fetchPokemonData(0, POKEMON_API_CONFIG.pokemonPerPage);
    }
    
    return await fetchPokemonByTypeData(type);
}


function updateAppStateWithNewData(newPokemonDetails) {
    appState.pokemonList = [...appState.pokemonList, ...newPokemonDetails];
    
    if (appState.selectedType === "all") {
        appState.allPokemonList = [...appState.pokemonList];
    }
    
    appState.nextPageOffset += POKEMON_API_CONFIG.pokemonPerPage;
}

async function fetchNewPokemonDetails() {
    switch (appState.selectedType) {
        case "all":
            return await fetchPokemonData(appState.nextPageOffset, POKEMON_API_CONFIG.pokemonPerPage);
        case "search":
            return [];
        default:
            return await fetchMorePokemonByType(appState.selectedType, appState.nextPageOffset);
    }
}

function updateAppStateAfterLoad(pokemonDetails) {
    appState.pokemonList = pokemonDetails;
    appState.allPokemonList = [...pokemonDetails];
    appState.nextPageOffset = POKEMON_API_CONFIG.pokemonPerPage;
}

function updateAppStateAfterTypeLoad(pokemonDetails) {
    appState.nextPageOffset = POKEMON_API_CONFIG.pokemonPerPage;
    appState.currentPage = 1;
    if (appState.selectedType !== "all") {
        appState.pokemonList = pokemonDetails;
    }
}

function setLoadingState(loading) {
    appState.isLoading = loading;
    toggleLoadingSpinner(loading);
}

function toggleLoadingSpinner(loading) {
    if (!domElements.loadingSpinner) return;
    domElements.loadingSpinner.classList.toggle("d-none", !loading);
}

function renderPokemon(pokemonList) {
    if (!pokemonList || pokemonList.length === 0) {
        showNoPokemonMessage();
        return;
    }
    
    pokemonList.forEach((pokemon) => appendPokemonCard(pokemon));
}

function appendPokemonCard(pokemon) {
    if (!domElements.pokemonContainer) return;
    
    const pokemonCard = createPokemonCard(pokemon);
    domElements.pokemonContainer.appendChild(pokemonCard);
}

function createPokemonCard(pokemon) {
    const cardElement = document.createElement("div");
    cardElement.className = "col-md-4 col-lg-3 mb-4";
    cardElement.innerHTML = getPokemonCardTemplate(pokemon);
    cardElement.addEventListener("click", () => openPokemonDetail(pokemon));
    
    return cardElement;
}

function clearPokemonContainer() {
    if (!domElements.pokemonContainer) return;
    domElements.pokemonContainer.innerHTML = "";
}

function resetSearchMode() {
    appState.selectedType = "all";
    appState.nextPageOffset = 0;
    appState.currentPage = 1;
    resetAllButtonText();
    clearSearchInput();
}

function resetAllButtonText() {
    const allButton = document.querySelector('[data-type="all"]');
    if (allButton) allButton.innerHTML = '<span class="filter-text">All</span>';
}

function clearSearchInput() {
    const searchInput = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchBtn");
    
    if (!searchInput) return;
    
    searchInput.value = "";
    
    if (typeof updateSearchButtonState === "function") {
        updateSearchButtonState(searchButton, false);
    }
}

function handleLoadingError(message, error) {
    console.error(message, error);
    showErrorMessage(message);
}

function showErrorMessage(message) {
    const container = document.getElementById("pokemonContainer");
    if (container) container.innerHTML = createErrorTemplate(message);
}

function showNoPokemonMessage() {
    const container = document.getElementById("pokemonContainer");
    if (container) container.innerHTML = createErrorTemplate("No Pokemon available");
}

function formatPokemonNumber(id) {
    return `#${id.toString().padStart(3, "0")}`;
}

function createTypeBadges(types) {
    return types
        .map((type) => `<span class="type-badge">${type.toUpperCase()}</span>`)
        .join("");
}

