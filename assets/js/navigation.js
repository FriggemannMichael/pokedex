// navigation.js - Pagination System

// Navigation State erweitern
const navigationState = {
    currentPage: 1,
    totalPages: 1,
    pokemonPerPage: 20,
    totalPokemon: 0,
    currentMode: 'pagination' // 'pagination' oder 'loadmore'
};

// Navigation initialisieren
function initializeNavigation() {
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    // Event Listeners für Pagination
    if (prevBtn) {
        prevBtn.addEventListener('click', () => navigateToPage(navigationState.currentPage - 1));
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => navigateToPage(navigationState.currentPage + 1));
    }
    
    // Event Listener für Load More
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMorePokemon);
    }
    
    // Initial Pagination-Controls aktualisieren
    updatePaginationControls();
}

// Zu bestimmter Seite navigieren
async function navigateToPage(pageNumber) {
    if (appState.isLoading) return;
    if (pageNumber < 1 || pageNumber > navigationState.totalPages) return;
    
    // Für Such-Modus keine Pagination
    if (appState.selectedType === 'search') return;
    
    setLoadingState(true);
    
    try {
        navigationState.currentPage = pageNumber;
        appState.currentPage = pageNumber;
        
        const offset = (pageNumber - 1) * navigationState.pokemonPerPage;
        
        let pokemonDetails;
        if (appState.selectedType === 'all') {
            pokemonDetails = await fetchPokemonData(offset, navigationState.pokemonPerPage);
        } else {
            // Für Typ-Filter alle laden und dann paginieren
            const allTypeData = await fetchPokemonByTypeData(appState.selectedType);
            const startIndex = offset;
            const endIndex = startIndex + navigationState.pokemonPerPage;
            pokemonDetails = allTypeData.slice(startIndex, endIndex);
        }
        
        // Pokemon-Container leeren und neue laden
        clearPokemonContainer();
        appState.pokemonList = pokemonDetails;
        renderPokemon(pokemonDetails);
        
        // Pagination-Controls aktualisieren
        updatePaginationControls();
        
        // Nach oben scrollen für bessere UX
        scrollToTop();
        
    } catch (error) {
        console.error('Navigation error:', error);
        handleError('Navigation error', error);
    } finally {
        setLoadingState(false);
    }
}

// Load More Pokemon (erweitert vorhandene Liste)
async function loadMorePokemon() {
    if (appState.isLoading) return;
    
    setLoadingState(true);
    setLoadMoreButtonState(true);
    
    try {
        const newPokemonDetails = await fetchNewPokemonDetails();
        
        if (hasNewPokemonData(newPokemonDetails)) {
            // Neue Pokemon zur bestehenden Liste hinzufügen
            appendNewPokemon(newPokemonDetails);
            appState.pokemonList = [...appState.pokemonList, ...newPokemonDetails];
            appState.nextPageOffset += navigationState.pokemonPerPage;
        } else {
            showNoMorePokemon();
        }
        
    } catch (error) {
        console.error('Load more error:', error);
        handleError('Error loading more', error);
    } finally {
        resetLoadingState();
    }
}

// Neue Pokemon-Daten für Load More holen
async function fetchNewPokemonDetails() {
    switch (appState.selectedType) {
        case 'all':
            return await fetchPokemonData(
                appState.nextPageOffset, 
                navigationState.pokemonPerPage
            );
        case 'search':
            return []; // Kein Load More bei Suche
        default:
            return await fetchMorePokemonByType(
                appState.selectedType, 
                appState.nextPageOffset
            );
    }
}

// Neue Pokemon zur Liste hinzufügen
function appendNewPokemon(pokemonList) {
    pokemonList.forEach(pokemon => {
        appendPokemonCard(pokemon);
    });
}

// "Keine weiteren Pokemon" anzeigen
function showNoMorePokemon() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.innerHTML = '✅ All Pokemon loaded!';
        loadMoreBtn.disabled = true;
        
        // Nach 3 Sekunden wieder normalen Text
        setTimeout(() => {
            loadMoreBtn.innerHTML = `
                <span class="load-more-text">⬇️ Load More Pokemon</span>
                <span class="load-more-spinner d-none">
                    <span class="spinner-border spinner-border-sm me-1" role="status"></span>
                    Loading...
                </span>
            `;
        }, 3000);
    }
}

// Pagination-Controls aktualisieren
function updatePaginationControls() {
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    const pageInfo = document.getElementById('pageInfo');
    const paginationControls = document.getElementById('paginationControls');
    
    // Page Info aktualisieren
    if (pageInfo) {
        pageInfo.textContent = `Page ${navigationState.currentPage}`;
    }
    
    // Previous Button
    if (prevBtn) {
        prevBtn.disabled = navigationState.currentPage <= 1;
    }
    
    // Next Button - bei "all" Mode mehr Seiten möglich
    if (nextBtn) {
        if (appState.selectedType === 'all') {
            // Bei "all" immer Next erlauben (API hat >1000 Pokemon)
            nextBtn.disabled = false;
        } else if (appState.selectedType === 'search') {
            // Bei Suche keine Pagination
            nextBtn.disabled = true;
        } else {
            // Bei Typ-Filter prüfen ob mehr Pokemon verfügbar
            nextBtn.disabled = navigationState.currentPage >= navigationState.totalPages;
        }
    }
    
    // Pagination-Controls bei Suche verstecken
    if (paginationControls) {
        if (appState.selectedType === 'search') {
            paginationControls.style.display = 'none';
        } else {
            paginationControls.style.display = 'flex';
        }
    }
}

// Total Pages für Typ-Filter berechnen
async function calculateTotalPagesForType(type) {
    try {
        if (type === 'all') {
            // Bei "all" nehmen wir eine große Anzahl an
            navigationState.totalPages = 50; // 50 Seiten à 20 Pokemon = 1000 Pokemon
            return;
        }
        
        if (type === 'search') {
            navigationState.totalPages = 1;
            return;
        }
        
        // Für andere Typen alle Pokemon des Typs zählen
        const typeResponse = await fetchFromPokeAPI(`https://pokeapi.co/api/v2/type/${type}`);
        const totalPokemon = typeResponse.pokemon.length;
        navigationState.totalPages = Math.ceil(totalPokemon / navigationState.pokemonPerPage);
        
    } catch (error) {
        console.error('Error calculating total pages:', error);
        navigationState.totalPages = 1;
    }
}

// Load More Button State setzen
function setLoadMoreButtonState(loading) {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (!loadMoreBtn) return;
    
    const loadText = loadMoreBtn.querySelector('.load-more-text');
    const loadSpinner = loadMoreBtn.querySelector('.load-more-spinner');
    
    if (loading) {
        loadText?.classList.add('d-none');
        loadSpinner?.classList.remove('d-none');
        loadMoreBtn.disabled = true;
    } else {
        loadText?.classList.remove('d-none');
        loadSpinner?.classList.add('d-none');
        loadMoreBtn.disabled = false;
    }
}

// Loading State zurücksetzen
function resetLoadingState() {
    setLoadingState(false);
    setLoadMoreButtonState(false);
}

// Prüfen ob neue Pokemon-Daten vorhanden
function hasNewPokemonData(newPokemonDetails) {
    return newPokemonDetails && newPokemonDetails.length > 0;
}

// Nach oben scrollen
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Navigation für Filter-Wechsel zurücksetzen
function resetNavigation() {
    navigationState.currentPage = 1;
    appState.currentPage = 1;
    appState.nextPageOffset = 0;
    updatePaginationControls();
}

// Navigation bei Typ-Wechsel aktualisieren
async function updateNavigationForType(type) {
    await calculateTotalPagesForType(type);
    resetNavigation();
    updatePaginationControls();
}

// Burger-Menü für Mobile initialisieren
function initializeBurgerMenu() {
    const burgerBtn = document.getElementById('burgerMenuBtn');
    const filterContainer = document.getElementById('filterContainer');
    
    if (!burgerBtn || !filterContainer) return;
    
    burgerBtn.addEventListener('click', () => {
        const isVisible = filterContainer.classList.contains('show');
        
        if (isVisible) {
            filterContainer.classList.remove('show');
            burgerBtn.innerHTML = `
                <span class="burger-icon">☰</span>
                <span class="filter-text">Filters</span>
            `;
        } else {
            filterContainer.classList.add('show');
            burgerBtn.innerHTML = `
                <span class="burger-icon">✕</span>
                <span class="filter-text">Close</span>
            `;
        }
    });
    
    // Klick außerhalb schließt Menü
    document.addEventListener('click', (event) => {
        if (!burgerBtn.contains(event.target) && 
            !filterContainer.contains(event.target)) {
            filterContainer.classList.remove('show');
            burgerBtn.innerHTML = `
                <span class="burger-icon">☰</span>
                <span class="filter-text">Filters</span>
            `;
        }
    });
}

// Navigation komplett initialisieren
function initializeFullNavigation() {
    initializeNavigation();
    initializeBurgerMenu();
    
    // Responsive Navigation prüfen
    checkResponsiveNavigation();
    window.addEventListener('resize', checkResponsiveNavigation);
}

// Responsive Navigation prüfen
function checkResponsiveNavigation() {
    const burgerBtn = document.getElementById('burgerMenuBtn');
    const filterContainer = document.getElementById('filterContainer');
    
    if (window.innerWidth <= 768) {
        // Mobile: Burger-Menü anzeigen
        burgerBtn?.classList.remove('d-none');
        filterContainer?.classList.remove('show'); // Menü schließen bei Resize
    } else {
        // Desktop: Filter direkt anzeigen
        burgerBtn?.classList.add('d-none');
        filterContainer?.classList.remove('show');
    }
}