
const navigationState = {
    currentPage: 1,
    totalPages: 1,
    pokemonPerPage: 20,
    totalPokemon: 0,
    currentMode: 'pagination' 
};


function initializeNavigation() {
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => navigateToPage(navigationState.currentPage - 1));
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => navigateToPage(navigationState.currentPage + 1));
    }
    
    
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMorePokemon);
    }
    
    
    updatePaginationControls();
}


async function navigateToPage(pageNumber) {
    if (appState.isLoading) return;
    if (pageNumber < 1 || pageNumber > navigationState.totalPages) return;
    
    
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
           
            const allTypeData = await fetchPokemonByTypeData(appState.selectedType);
            const startIndex = offset;
            const endIndex = startIndex + navigationState.pokemonPerPage;
            pokemonDetails = allTypeData.slice(startIndex, endIndex);
        }
        
        
        clearPokemonContainer();
        appState.pokemonList = pokemonDetails;
        renderPokemon(pokemonDetails);
        
        
        updatePaginationControls();
        
        
        scrollToTop();
        
    } catch (error) {
        console.error('Navigation error:', error);
        handleError('Navigation error', error);
    } finally {
        setLoadingState(false);
    }
}


async function loadMorePokemon() {
    if (appState.isLoading) return;
    
    setLoadingState(true);
    setLoadMoreButtonState(true);
    
    try {
        const newPokemonDetails = await fetchNewPokemonDetails();
        
        if (hasNewPokemonData(newPokemonDetails)) {
            
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


async function fetchNewPokemonDetails() {
    switch (appState.selectedType) {
        case 'all':
            return await fetchPokemonData(
                appState.nextPageOffset, 
                navigationState.pokemonPerPage
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


function appendNewPokemon(pokemonList) {
    pokemonList.forEach(pokemon => {
        appendPokemonCard(pokemon);
    });
}


function showNoMorePokemon() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.innerHTML = '✅ All Pokemon loaded!';
        loadMoreBtn.disabled = true;
        
        
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


function updatePaginationControls() {
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    const pageInfo = document.getElementById('pageInfo');
    const paginationControls = document.getElementById('paginationControls');
    
    
    if (pageInfo) {
        pageInfo.textContent = `Page ${navigationState.currentPage}`;
    }
    
    
    if (prevBtn) {
        prevBtn.disabled = navigationState.currentPage <= 1;
    }
    
    
    if (nextBtn) {
        if (appState.selectedType === 'all') {
            
            nextBtn.disabled = false;
        } else if (appState.selectedType === 'search') {
            
            nextBtn.disabled = true;
        } else {
            
            nextBtn.disabled = navigationState.currentPage >= navigationState.totalPages;
        }
    }
    
    
    if (paginationControls) {
        if (appState.selectedType === 'search') {
            paginationControls.style.display = 'none';
        } else {
            paginationControls.style.display = 'flex';
        }
    }
}


async function calculateTotalPagesForType(type) {
    try {
        if (type === 'all') {
            
            navigationState.totalPages = 50; 
            return;
        }
        
        if (type === 'search') {
            navigationState.totalPages = 1;
            return;
        }
        
        
        const typeResponse = await fetchFromPokeAPI(`https://pokeapi.co/api/v2/type/${type}`);
        const totalPokemon = typeResponse.pokemon.length;
        navigationState.totalPages = Math.ceil(totalPokemon / navigationState.pokemonPerPage);
        
    } catch (error) {
        console.error('Error calculating total pages:', error);
        navigationState.totalPages = 1;
    }
}


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


function resetLoadingState() {
    setLoadingState(false);
    setLoadMoreButtonState(false);
}


function hasNewPokemonData(newPokemonDetails) {
    return newPokemonDetails && newPokemonDetails.length > 0;
}


function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}


function resetNavigation() {
    navigationState.currentPage = 1;
    appState.currentPage = 1;
    appState.nextPageOffset = 0;
    updatePaginationControls();
}


async function updateNavigationForType(type) {
    await calculateTotalPagesForType(type);
    resetNavigation();
    updatePaginationControls();
}


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


function initializeFullNavigation() {
    initializeNavigation();
    initializeBurgerMenu();
    
    
    checkResponsiveNavigation();
    window.addEventListener('resize', checkResponsiveNavigation);
}


function checkResponsiveNavigation() {
    const burgerBtn = document.getElementById('burgerMenuBtn');
    const filterContainer = document.getElementById('filterContainer');
    
    if (window.innerWidth <= 768) {
        
        burgerBtn?.classList.remove('d-none');
        filterContainer?.classList.remove('show'); 
    } else {
        
        burgerBtn?.classList.add('d-none');
        filterContainer?.classList.remove('show');
    }
}