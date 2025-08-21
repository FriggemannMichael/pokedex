const appState = {
    pokemonList: [],
    isLoading: false,
    selectedType: 'all',
    nextPageOffset: 0,
    currentPage: 1
};

const domElements = {
    pokemonContainer: document.getElementById('pokemonContainer'),
    loadingSpinner: document.querySelector('.loading-spinner'),
    loadMoreButton: document.getElementById('loadMoreBtn'),
    filterButtons: document.querySelectorAll('.btn-filter[data-type]'),
    dropdownItems: document.querySelectorAll('.dropdown-item.type-item[data-type]')
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
        handleLoadingError('Error loading Pokemon', error);
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
    if (!domElements.loadingSpinner) return;
    
    if (loading) {
        domElements.loadingSpinner.classList.remove('d-none');
    } else {
        domElements.loadingSpinner.classList.add('d-none');
    }
}

function handleLoadingError(message, error) {
    console.error(message, error);
    showErrorMessage(message);
}

function showErrorMessage(message) {
    const container = document.getElementById('pokemonContainer');
    if (!container) return;
    
    container.innerHTML = createErrorTemplate(message);
}

function createErrorTemplate(message) {
    return `
        <div class="col-12">
            <div class="search-error text-center py-5">
                <h3>⚠️ Error</h3>
                <p>${message}. Please try again.</p>
                <button class="btn btn-primary" onclick="window.location.reload()">
                    🔄 Reload Page
                </button>
            </div>
        </div>
    `;
}

async function loadPokemonByType(type) {
    if (appState.isLoading) return;

    setLoadingState(true);
    clearPokemonContainer();

    try {
        resetSearchMode();
        const pokemonDetails = await getPokemonByType(type);
        updateAppStateAfterTypeLoad(pokemonDetails);
        renderPokemon(pokemonDetails);
        
    } catch (error) {
        handleLoadingError('Error loading by type', error);
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
    appState.currentPage = 1;
}

function clearPokemonContainer() {
    if (!domElements.pokemonContainer) return;
    domElements.pokemonContainer.innerHTML = '';
}

function resetSearchMode() {
    appState.selectedType = 'all';
    appState.nextPageOffset = 0;
    appState.currentPage = 1;
    
    resetAllButtonText();
    clearSearchInput();
}

function resetAllButtonText() {
    const allButton = document.querySelector('[data-type="all"]');
    if (!allButton) return;
    
    if (allButton.innerHTML !== '<span class="filter-text">All</span>') {
        allButton.innerHTML = '<span class="filter-text">All</span>';
    }
}

function clearSearchInput() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchBtn');
    
    if (!searchInput) return;
    
    searchInput.value = '';
    if (typeof updateSearchButtonState === 'function') {
        updateSearchButtonState(searchButton, false);
    }
}

function renderPokemon(pokemonList) {
    if (!pokemonList || pokemonList.length === 0) {
        showNoPokemonMessage();
        return;
    }
    
    clearPokemonContainer();
    pokemonList.forEach(pokemon => {
        appendPokemonCard(pokemon);
    });
}

function showNoPokemonMessage() {
    const container = document.getElementById('pokemonContainer');
    if (!container) return;
    
    container.innerHTML = createErrorTemplate('No Pokemon available');
}

function appendPokemonCard(pokemon) {
    if (!domElements.pokemonContainer) return;
    
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
    const typeBadges = createTypeBadges(pokemon.types);
    
    return `
        <div class="pokemon-card h-100 type-${pokemon.types[0]}" data-pokemon-id="${pokemon.id}">
            <div class="pokemon-image-wrapper">
                <span class="pokemon-number">${pokemonNumber}</span>
                <img src="${pokemon.image}" alt="${pokemon.name}" class="pokemon-image" loading="lazy">
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
    if (!loadText || !loadSpinner) return;
    
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
        processNewPokemonData(newPokemonDetails);
    } catch (error) {
        handleLoadingError('Error loading more', error);
    } finally {
        resetLoadingState();
    }
}

function processNewPokemonData(newPokemonDetails) {
    if (hasNewPokemonData(newPokemonDetails)) {
        appendNewPokemonToList(newPokemonDetails);
    } else {
        showNoMorePokemonMessage();
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

function appendNewPokemonToList(newPokemonDetails) {
    appendNewPokemon(newPokemonDetails);
    appState.pokemonList = [...appState.pokemonList, ...newPokemonDetails];
    appState.nextPageOffset += POKEMON_API_CONFIG.pokemonPerPage;
}

function appendNewPokemon(pokemonList) {
    pokemonList.forEach(pokemon => {
        appendPokemonCard(pokemon);
    });
}

function showNoMorePokemonMessage() {
    if (!domElements.loadMoreButton) return;
    
    const originalText = domElements.loadMoreButton.innerHTML;
    domElements.loadMoreButton.innerHTML = '✅ All Pokemon loaded!';
    domElements.loadMoreButton.disabled = true;
    
    setTimeout(() => {
        domElements.loadMoreButton.innerHTML = originalText;
        domElements.loadMoreButton.disabled = false;
    }, 3000);
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
    
    domElements.dropdownItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            handleDropdownFilterClick(item);
        });
    });
}

function handleFilterClick(button) {
    const selectedType = button.getAttribute('data-type');
    updateAppStateForFilter(selectedType);
    
    changeBodyBackground(selectedType);
    setActiveFilter(button);
    loadPokemonByType(selectedType);
}

function handleDropdownFilterClick(item) {
    const selectedType = item.getAttribute('data-type');
    updateAppStateForFilter(selectedType);

    changeBodyBackground(selectedType);
    closeDropdown();
    setActiveDropdownFilter(selectedType);
    loadPokemonByType(selectedType);
}

function updateAppStateForFilter(selectedType) {
    appState.selectedType = selectedType;
    appState.nextPageOffset = 0;
    appState.currentPage = 1;
}

function closeDropdown() {
    const dropdown = document.querySelector('#moreTypesDropdown');
    if (!dropdown) return;
    
    const bsDropdown = bootstrap.Dropdown.getInstance(dropdown);
    if (bsDropdown) {
        bsDropdown.hide();
    }
}

function setActiveFilter(selectedButton) {
    domElements.filterButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    const dropdownButton = document.querySelector('#moreTypesDropdown');
    if (dropdownButton) {
        dropdownButton.classList.remove('active');
    }
    
    selectedButton.classList.add('active');
}

function setActiveDropdownFilter(selectedType) {
    domElements.filterButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    const dropdownButton = document.querySelector('#moreTypesDropdown');
    if (!dropdownButton) return;
    
    dropdownButton.classList.add('active');
    dropdownButton.setAttribute('data-type', selectedType);
    updateDropdownButtonContent(dropdownButton, selectedType);
}

function updateDropdownButtonContent(dropdownButton, selectedType) {
    const selectedItem = document.querySelector(`[data-type="${selectedType}"]`);
    if (!selectedItem) return;
    
    const typeName = capitalizeFirstLetter(selectedType);
    const icon = selectedItem.querySelector('.type-icon');
    
    if (icon) {
        dropdownButton.innerHTML = createDropdownButtonHTML(icon.src, typeName);
    }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function createDropdownButtonHTML(iconSrc, typeName) {
    return `
        <img src="${iconSrc}" alt="${typeName}" class="type-icon">
        <span class="filter-text">${typeName}</span>
    `;
}

function changeBodyBackground(pokemonType) {
    document.body.className = document.body.className.replace(/type-\w+/g, '');
    if (pokemonType && pokemonType !== 'all') {
        document.body.classList.add(`type-${pokemonType}`);
    }
}

function initializeLoadMore() {
    if (!domElements.loadMoreButton) return;
    
    domElements.loadMoreButton.addEventListener('click', () => {
        loadMorePokemon();
    });
}

function updatePaginationControls() {
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    const pageInfo = document.getElementById('pageInfo');
    const paginationControls = document.getElementById('paginationControls');
    
    updatePageInfo(pageInfo);
    updatePreviousButton(prevBtn);
    updateNextButton(nextBtn);
    togglePaginationVisibility(paginationControls);
}

function updatePageInfo(pageInfo) {
    if (!pageInfo) return;
    pageInfo.textContent = `Page ${appState.currentPage}`;
}

function updatePreviousButton(prevBtn) {
    if (!prevBtn) return;
    prevBtn.disabled = appState.currentPage <= 1;
}

function updateNextButton(nextBtn) {
    if (!nextBtn) return;
    
    if (appState.selectedType === 'all') {
        nextBtn.disabled = false;
    } else if (appState.selectedType === 'search') {
        nextBtn.disabled = true;
    } else {
        nextBtn.disabled = appState.currentPage >= 10;
    }
}

function togglePaginationVisibility(paginationControls) {
    if (!paginationControls) return;
    
    const isSearchMode = appState.selectedType === 'search';
    paginationControls.style.display = isSearchMode ? 'none' : 'flex';
}

function initializeApp() {
    loadPokemon();
    initializeFilters();
    initializeLoadMore();
    initializeSearch();
    
    if (typeof initializeFullNavigation === 'function') {
        initializeFullNavigation();
    }
    
    if (typeof updateNavigationForType === 'function') {
        updateNavigationForType('all');
    }
}

document.addEventListener('DOMContentLoaded', initializeApp);