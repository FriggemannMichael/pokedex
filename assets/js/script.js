// ===== POKEMON API KONFIGURATION =====
const POKEMON_API_CONFIG = {
    baseUrl: 'https://pokeapi.co/api/v2/pokemon',
    pokemonPerPage: 20,
    defaultOffset: 0
};

// ===== ANWENDUNGSZUSTAND (STATE) =====
const appState = {
    pokemonList: [],
    isLoading: false,
    selectedType: 'all',
    nextPageOffset: 0  // ✅ FIXED: Startet bei 0 für Pokemon 1-20
};

// ===== DOM ELEMENTE =====
const domElements = {
    pokemonContainer: document.getElementById('pokemonContainer'),
    loadingSpinner: document.querySelector('.loading-spinner'),
    loadMoreButton: document.getElementById('loadMoreBtn'),
    filterButtons: document.querySelectorAll('.filters .btn[data-type]')
};

// ===== API HELPER FUNKTIONEN =====
async function fetchFromPokeAPI(url) {
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`PokeAPI Fehler: ${response.status} - ${response.statusText}`);
        }
        
        const apiData = await response.json();
        return apiData;
        
    } catch (error) {
        console.error('API Request fehlgeschlagen:', error.message);
        throw error;
    }
}

function createPokemonData(rawApiPokemon) {
    return {
        id: rawApiPokemon.id,
        name: rawApiPokemon.name,
        image: rawApiPokemon.sprites.other['official-artwork'].front_default,
        types: rawApiPokemon.types.map(typeObj => typeObj.type.name)
    };
}

// ===== POKEMON LADEN (ERSTE LADUNG) =====
async function loadPokemon() {
    if (appState.isLoading) return;

    setLoadingState(true);

    try {
        const pokemonDetails = await fetchPokemonData(
            appState.nextPageOffset,
            POKEMON_API_CONFIG.pokemonPerPage
        );
        
        appState.pokemonList = pokemonDetails;
        renderPokemon(pokemonDetails);
        
        // Offset für nächste Ladung setzen
        appState.nextPageOffset = POKEMON_API_CONFIG.pokemonPerPage;
        
    } catch (error) {
        handleError('Fehler beim Laden der Pokemon', error);
    } finally {
        setLoadingState(false);
    }
}

async function fetchPokemonData(offset, limit) {
    const pokemonListResponse = await fetchFromPokeAPI(
        `${POKEMON_API_CONFIG.baseUrl}?offset=${offset}&limit=${limit}`
    );
    
    const pokemonDetails = await Promise.all(
        pokemonListResponse.results.map(pokemon => loadPokemonDetails(pokemon.url))
    );

    return pokemonDetails;
}

async function loadPokemonDetails(pokemonUrl) {
    const rawPokemonData = await fetchFromPokeAPI(pokemonUrl);
    return createPokemonData(rawPokemonData);
}

// ===== UI STATE MANAGEMENT =====
function setLoadingState(loading) {
    appState.isLoading = loading;

    if (loading) {
        domElements.loadingSpinner.classList.remove('d-none');
    } else {
        domElements.loadingSpinner.classList.add('d-none');
    }
}

function handleError(message, error) {
    console.error(message, error);
    // TODO: User-freundliche Fehlermeldung anzeigen
}

// ===== POKEMON RENDERING =====
function renderPokemon(pokemonList) {
    domElements.pokemonContainer.innerHTML = "";

    pokemonList.forEach(pokemon => {
        const pokemonCard = createPokemonCard(pokemon);
        domElements.pokemonContainer.appendChild(pokemonCard);
    });
}

function createPokemonCard(pokemon) {
    const cardElement = document.createElement('div');
    cardElement.className = 'col-md-4 col-lg-3 mb-4';
    
    cardElement.innerHTML = getPokemonCardTemplate(pokemon);
    cardElement.addEventListener('click', () => openPokemonDetail(pokemon));
    
    return cardElement;
}

// ✅ NEUE FUNKTION: Pokemon Card Template
function getPokemonCardTemplate(pokemon) {
    return `
        <div class="pokemon-card h-100 type-${pokemon.types[0]}" data-pokemon-id="${pokemon.id}">
            <div class="pokemon-image-wrapper">
                <span class="pokemon-number">#${pokemon.id.toString().padStart(3, '0')}</span>
                <img src="${pokemon.image}" alt="${pokemon.name}" class="pokemon-image">
            </div>
            <div class="pokemon-card-content">
                <h5 class="pokemon-name">${pokemon.name}</h5>
                <div class="pokemon-types">
                    ${pokemon.types.map(type => `<span class="type-badge">${type.toUpperCase()}</span>`).join('')}
                </div>
            </div>
        </div>
    `;
}

// ===== FILTER SYSTEM =====
function initializeFilters() {
    domElements.filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            appState.selectedType = button.getAttribute('data-type');
            appState.nextPageOffset = 0; // ✅ FIXED: Reset auf 0, nicht auf 20
            
            setActiveFilter(button);
            loadPokemonByType(appState.selectedType);
        });
    });
}

async function loadPokemonByType(type) {
    if (appState.isLoading) return;

    setLoadingState(true);
    domElements.pokemonContainer.innerHTML = '';

    try {
        const pokemonDetails = (type === 'all')   
            ? await fetchPokemonData(0, POKEMON_API_CONFIG.pokemonPerPage)
            : await fetchPokemonByTypeData(type);

        appState.pokemonList = pokemonDetails;
        renderPokemon(pokemonDetails);
        
        
        appState.nextPageOffset = POKEMON_API_CONFIG.pokemonPerPage;
        
    } catch (error) {
        handleError('Fehler beim Laden nach Typ', error);
    } finally {
        setLoadingState(false);
    }
}

async function fetchPokemonByTypeData(type) {
    const typeApiResponse = await fetchFromPokeAPI(`https://pokeapi.co/api/v2/type/${type}`);

    const pokemonUrls = typeApiResponse.pokemon
        .slice(0, POKEMON_API_CONFIG.pokemonPerPage)
        .map(pokemonData => pokemonData.pokemon.url);

    return await Promise.all(pokemonUrls.map(url => loadPokemonDetails(url)));
}

function setActiveFilter(selectedButton) {
    domElements.filterButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    selectedButton.classList.add('active');
}

// ===== LOAD MORE SYSTEM (FIXED!) =====
function initializeLoadMore() {
    domElements.loadMoreButton.addEventListener('click', () => {
        loadMorePokemon();
    });
}

// ✅ FIXED: Load More erweitert jetzt die Liste statt sie zu ersetzen
async function loadMorePokemon() {
    if (appState.isLoading) return;
    
    setLoadingState(true);
    
    try {
        let newPokemonDetails;
        
        if (appState.selectedType === 'all') {
            newPokemonDetails = await fetchPokemonData(
                appState.nextPageOffset, 
                POKEMON_API_CONFIG.pokemonPerPage
            );
        } else {
            newPokemonDetails = await fetchMorePokemonByType(appState.selectedType);
        }
        
        // ✅ HINZUFÜGEN statt ersetzen
        appState.pokemonList = [...appState.pokemonList, ...newPokemonDetails];
        appendNewPokemon(newPokemonDetails);
        
        // Offset für nächste Ladung erhöhen
        appState.nextPageOffset += POKEMON_API_CONFIG.pokemonPerPage;
        
    } catch (error) {
        handleError('Fehler beim Nachladen', error);
    } finally {
        setLoadingState(false);
    }
}

// ✅ NEUE FUNKTION: Mehr Pokemon nach Typ laden
async function fetchMorePokemonByType(type) {
    const typeApiResponse = await fetchFromPokeAPI(`https://pokeapi.co/api/v2/type/${type}`);

    const pokemonUrls = typeApiResponse.pokemon
        .slice(appState.nextPageOffset, appState.nextPageOffset + POKEMON_API_CONFIG.pokemonPerPage)
        .map(pokemonData => pokemonData.pokemon.url);

    if (pokemonUrls.length === 0) {
        console.log('Keine weiteren Pokémon verfügbar!');
        return [];
    }

    return await Promise.all(pokemonUrls.map(url => loadPokemonDetails(url)));
}


function appendNewPokemon(pokemonList) {
    pokemonList.forEach(pokemon => {
        const pokemonCard = createPokemonCard(pokemon);
        domElements.pokemonContainer.appendChild(pokemonCard);
    });
}

function openPokemonDetail(pokemon) {
    console.log('Opening detail for:', pokemon.name);
    
    // Modal initialisieren und öffnen
    initializePokemonModal();
    openPokemonModal();
    
    // Pokemon Daten laden und anzeigen
    loadPokemonDetailData(pokemon);
}

async function loadPokemonDetailData(pokemon) {
    try {
        setDetailLoadingState(true);
        
        // Card-Typ Styling setzen
        setPokemonModalType(pokemon.types[0]);
        
        // Basis-Daten setzen
        setDetailBasicData(pokemon);
        
        // API-Details laden
        const [pokemonDetails, speciesData] = await Promise.all([
            fetchFromPokeAPI(`https://pokeapi.co/api/v2/pokemon/${pokemon.id}`),
            fetchFromPokeAPI(`https://pokeapi.co/api/v2/pokemon-species/${pokemon.id}`)
        ]);
        
        // Detail-Bereiche füllen
        showPokemonTypes(pokemon.types);
        showPokemonStats(pokemonDetails);
        showPokemonDescription(speciesData);
        await loadEvolutionChain(speciesData.evolution_chain.url, pokemon.id);
        
    } catch (error) {
        console.error('Fehler beim Laden der Pokemon-Details:', error);
        showDetailError('Fehler beim Laden der Details');
    } finally {
        setDetailLoadingState(false);
    }
}

/**
 * Modal Card Typ-Styling setzen
 */
function setPokemonModalType(primaryType) {
    const overlay = document.getElementById('pokemonOverlay');
    if (!overlay) return;
    
    const card = overlay.querySelector('.pokemon-detail-card');
    if (!card) return;
    
    // Bestehende Typ-Klassen entfernen
    const existingTypeClasses = Array.from(card.classList).filter(cls => cls.startsWith('type-'));
    existingTypeClasses.forEach(cls => card.classList.remove(cls));
    
    // Neue Typ-Klasse hinzufügen
    card.classList.add(`type-${primaryType}`);
}

/**
 * Basis Pokemon-Daten setzen
 */
function setDetailBasicData(pokemon) {
    const nameElement = document.getElementById('detailName');
    const numberElement = document.getElementById('detailNumber');
    const imageElement = document.getElementById('detailImage');
    
    if (nameElement) nameElement.textContent = pokemon.name;
    if (numberElement) numberElement.textContent = `#${pokemon.id.toString().padStart(3, '0')}`;
    if (imageElement) {
        imageElement.src = pokemon.image;
        imageElement.alt = pokemon.name;
    }
}

/**
 * Pokemon Typen anzeigen
 */
function showPokemonTypes(types) {
    const typesContainer = document.getElementById('detailTypes');
    if (!typesContainer) return;
    
    typesContainer.innerHTML = types
        .map(type => createTypeBadgeTemplate(type))
        .join('');
}

/**
 * Pokemon Stats anzeigen
 */
function showPokemonStats(pokemonDetails) {
    const statsContainer = document.getElementById('detailStats');
    if (!statsContainer) return;
    
    const height = (pokemonDetails.height / 10).toFixed(1);
    const weight = (pokemonDetails.weight / 10).toFixed(1);
    const experience = pokemonDetails.base_experience || '?';
    
    statsContainer.innerHTML = `
        ${createStatItemTemplate('Größe', `${height} m`)}
        ${createStatItemTemplate('Gewicht', `${weight} kg`)}
        ${createStatItemTemplate('Erfahrung', experience)}
        ${createStatItemTemplate('ID', `#${pokemonDetails.id}`)}
    `;
}

/**
 * Pokemon Beschreibung anzeigen
 */
function showPokemonDescription(speciesData) {
    const descContainer = document.getElementById('detailDescription');
    if (!descContainer) return;
    
    const germanEntry = speciesData.flavor_text_entries.find(
        entry => entry.language.name === 'de'
    );
    
    const description = germanEntry 
        ? germanEntry.flavor_text.replace(/\n/g, ' ').replace(/\f/g, ' ')
        : 'Keine deutsche Beschreibung verfügbar.';
    
    descContainer.textContent = description;
}

/**
 * Evolution Chain laden
 */
async function loadEvolutionChain(evolutionUrl, currentPokemonId) {
    try {
        const evolutionData = await fetchFromPokeAPI(evolutionUrl);
        const evolutionChain = parseEvolutionChain(evolutionData.chain);
        await displayEvolutionChain(evolutionChain, currentPokemonId);
    } catch (error) {
        console.error('Fehler beim Laden der Evolution Chain:', error);
        showEvolutionError();
    }
}

/**
 * Evolution Chain parsen
 */
function parseEvolutionChain(chain) {
    const evolutions = [];
    
    function addEvolution(evolutionData) {
        const pokemonName = evolutionData.species.name;
        const pokemonId = evolutionData.species.url.split('/').slice(-2, -1)[0];
        
        evolutions.push({
            id: parseInt(pokemonId),
            name: pokemonName,
            image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`
        });
        
        if (evolutionData.evolves_to && evolutionData.evolves_to.length > 0) {
            evolutionData.evolves_to.forEach(evolution => {
                addEvolution(evolution);
            });
        }
    }
    
    addEvolution(chain);
    return evolutions;
}

/**
 * Evolution Chain anzeigen
 */
async function displayEvolutionChain(evolutions, currentPokemonId) {
    const container = document.getElementById('detailEvolutions');
    if (!container) return;
    
    if (evolutions.length <= 1) {
        container.innerHTML = '<div class="no-evolutions"><p>Keine Entwicklungen verfügbar</p></div>';
        return;
    }
    
    let html = '<div class="evolution-chain">';
    
    evolutions.forEach((evolution, index) => {
        const isCurrent = evolution.id === currentPokemonId;
        html += createEvolutionItemTemplate(evolution, isCurrent);
        
        // Pfeil zwischen Evolutionen (außer beim letzten)
        if (index < evolutions.length - 1) {
            html += createEvolutionArrowTemplate();
        }
    });
    
    html += '</div>';
    container.innerHTML = html;
    
    // Click Events für Evolution Items
    setupEvolutionClickEvents(container, currentPokemonId);
}

/**
 * Click Events für Evolution Items
 */
function setupEvolutionClickEvents(container, currentPokemonId) {
    const evolutionItems = container.querySelectorAll('.evolution-item');
    
    evolutionItems.forEach(item => {
        item.addEventListener('click', async () => {
            const pokemonId = item.dataset.pokemonId;
            
            if (pokemonId && pokemonId !== currentPokemonId.toString()) {
                try {
                    const newPokemonData = await fetchFromPokeAPI(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
                    const newPokemon = createPokemonData(newPokemonData);
                    
                    // Neues Pokemon im Modal laden
                    loadPokemonDetailData(newPokemon);
                    
                } catch (error) {
                    console.error('Fehler beim Laden des Evolution-Pokemon:', error);
                }
            }
        });
    });
}

// ===== UTILITY FUNKTIONEN =====

/**
 * Detail Loading State
 */
function setDetailLoadingState(loading) {
    const overlay = document.getElementById('pokemonOverlay');
    if (!overlay) return;
    
    const card = overlay.querySelector('.pokemon-detail-card');
    if (card) {
        card.style.opacity = loading ? '0.7' : '1';
        card.style.pointerEvents = loading ? 'none' : 'auto';
    }
}

/**
 * Detail Error anzeigen
 */
function showDetailError(message) {
    const descContainer = document.getElementById('detailDescription');
    if (descContainer) {
        descContainer.textContent = message;
    }
}

/**
 * Evolution Error anzeigen
 */
function showEvolutionError() {
    const container = document.getElementById('detailEvolutions');
    if (container) {
        container.innerHTML = '<div class="evolution-error"><p>Entwicklungen konnten nicht geladen werden.</p></div>';
    }
}

// ===== APP INITIALISIERUNG =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('Pokédex wird geladen...');
    
    loadPokemon();           // Erste Pokemon laden
    initializeFilters();     // Filter-Buttons aktivieren  
    initializeLoadMore();    // Load More Button aktivieren
});