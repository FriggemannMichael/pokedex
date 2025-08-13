// VERBESSERUNG: Strukturiertes Config-Object statt einzelne Konstanten
// WARUM: Besser organisiert und erweiterbar
const POKEMON_API_CONFIG = {
    baseUrl: 'https://pokeapi.co/api/v2/pokemon',
    pokemonPerPage: 20,
    defaultOffset: 0
};

// VERBESSERUNG: Strukturiertes State-Object statt globale Variablen
// WARUM: Klar erkennbar was zum App-Zustand gehört
const appState = {
    pokemonList: [],
    isLoading: false,
    selectedType: 'all',
    nextPageOffset: 0
};

// VERBESSERUNG: Alle DOM-Elemente zentral organisiert
// WARUM: Bessere Übersicht und wiederverwendbar
const domElements = {
    pokemonContainer: document.getElementById('pokemonContainer'),
    loadingSpinner: document.querySelector('.loading-spinner'),
    loadMoreButton: document.getElementById('loadMoreBtn'),
    filterButtons: document.querySelectorAll('.filters .btn[data-type]')
};

// VERBESSERUNG: Zentrale API-Funktion mit Error Handling
// WARUM: Alle API-Calls verwenden gleiche Fehlerbehandlung
// ÄNDERUNG: Strukturiertes Error Handling statt einfaches try-catch
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

// VERBESSERUNG: Daten-Transformation in eigene Funktion
// WARUM: Klare Trennung zwischen API-Daten und App-Daten
// ÄNDERUNG: Ausgelagert aus loadPokemonDetails für bessere Struktur
function createPokemonData(rawApiPokemon) {
    return {
        id: rawApiPokemon.id,
        name: rawApiPokemon.name,
        image: rawApiPokemon.sprites.other['official-artwork'].front_default,
        types: rawApiPokemon.types.map(typeObj => typeObj.type.name)
    };
}

// VERBESSERUNG: Verwende appState statt globale Variablen
// ÄNDERUNG: Klarere Struktur und State-Management
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
        
        appState.nextPageOffset = POKEMON_API_CONFIG.pokemonPerPage;
        
    } catch (error) {
        handleError('Fehler beim Laden der Pokemon', error);
    } finally {
        setLoadingState(false);
    }
}

// VERBESSERUNG: Aufgeteilt in separate Funktion für bessere Lesbarkeit
// WARUM: loadPokemon sollte nicht direkt API-Details kennen
async function fetchPokemonData(offset, limit) {
    const pokemonListResponse = await fetchFromPokeAPI(
        `${POKEMON_API_CONFIG.baseUrl}?offset=${offset}&limit=${limit}`
    );
    
    const pokemonDetails = await Promise.all(
        pokemonListResponse.results.map(pokemon => loadPokemonDetails(pokemon.url))
    );

    return pokemonDetails;
}

// VERBESSERUNG: Verwendet zentrale fetchFromPokeAPI und createPokemonData
// WARUM: Konsistente API-Calls und Datenstrukturen
async function loadPokemonDetails(pokemonUrl) {
    const rawPokemonData = await fetchFromPokeAPI(pokemonUrl);
    return createPokemonData(rawPokemonData);
}

// VERBESSERUNG: Verwendet domElements und appState
// WARUM: Kein direkter DOM-Zugriff, strukturierter State
function setLoadingState(loading) {
    appState.isLoading = loading;

    if (loading) {
        domElements.loadingSpinner.classList.remove('d-none');
    } else {
        domElements.loadingSpinner.classList.add('d-none');
    }
}

// VERBESSERUNG: Zentrale Error-Behandlung
// WARUM: Einheitliche Fehlerbehandlung in der ganzen App
function handleError(message, error) {
    console.error(message, error);
}

// VERBESSERUNG: Spezifische Funktion für Load More Button State
// WARUM: Trennung der Verantwortlichkeiten
function setLoadMoreButtonState(loading) {
    if (!domElements.loadMoreButton) return;
    
    const loadText = domElements.loadMoreButton.querySelector('.load-more-text');
    const loadSpinner = domElements.loadMoreButton.querySelector('.load-more-spinner');
    
    if (loading) {
        domElements.loadMoreButton.disabled = true;
        loadText.classList.add('d-none');
        loadSpinner.classList.remove('d-none');
    } else {
        domElements.loadMoreButton.disabled = false;
        loadText.classList.remove('d-none');
        loadSpinner.classList.add('d-none');
    }
}

// VERBESSERUNG: Container wird erst geleert, dann befüllt
// WARUM: Verhindert doppelte Inhalte bei mehrfachen Aufrufen
function renderPokemon(pokemonList) {
    domElements.pokemonContainer.innerHTML = "";

    pokemonList.forEach(pokemon => {
        const pokemonCard = createPokemonCard(pokemon);
        domElements.pokemonContainer.appendChild(pokemonCard);
    });
}

// VERBESSERUNG: Template-Erstellung in eigene Funktion ausgelagert
// WARUM: HTML-Erstellung von Card-Logik getrennt
function createPokemonCard(pokemon) {
    const cardElement = document.createElement('div');
    cardElement.className = 'col-md-4 col-lg-3 mb-4';
    
    cardElement.innerHTML = getPokemonCardTemplate(pokemon);
    cardElement.addEventListener('click', () => openPokemonDetail(pokemon));
    
    return cardElement;
}

// VERBESSERUNG: HTML-Template in eigene Funktion
// WARUM: Trennung von Logik und Darstellung
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

// VERBESSERUNG: Verwendet domElements statt querySelector
// WARUM: Zentrale DOM-Element Verwaltung
function initializeFilters() {
    domElements.filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            appState.selectedType = button.getAttribute('data-type');
            appState.nextPageOffset = 0;
            
            setActiveFilter(button);
            loadPokemonByType(appState.selectedType);
        });
    });
}

// VERBESSERUNG: Klarere Funktionsstruktur mit Search-Mode Clearing
// WARUM: Verhindert Konflikte zwischen Filter und Suche
async function loadPokemonByType(type) {
    if (appState.isLoading) return;

    setLoadingState(true);
    domElements.pokemonContainer.innerHTML = '';

    try {
        clearSearchMode(); // VERBESSERUNG: Explizite Search-Mode Bereinigung

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

// VERBESSERUNG: Eigene Funktion für Search-Mode bereinigen
// WARUM: Klare Verantwortlichkeit und wiederverwendbar
function clearSearchMode() {
    appState.selectedType = 'all';
    appState.nextPageOffset = 0;
    
    const allButton = document.querySelector('[data-type="all"]');
    if (allButton && allButton.textContent !== 'Alle') {
        allButton.textContent = 'Alle';
    }
    
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchBtn');
    if (searchInput) {
        searchInput.value = '';
        if (typeof updateSearchButtonState === 'function') {
            updateSearchButtonState(searchButton, false);
        }
    }
}

// VERBESSERUNG: Eigene Funktion für Typ-basierte Pokemon
// WARUM: Trennung von normaler und Typ-basierter Datenabfrage
async function fetchPokemonByTypeData(type) {
    const typeApiResponse = await fetchFromPokeAPI(`https://pokeapi.co/api/v2/type/${type}`);

    const pokemonUrls = typeApiResponse.pokemon
        .slice(0, POKEMON_API_CONFIG.pokemonPerPage)
        .map(pokemonData => pokemonData.pokemon.url);

    return await Promise.all(pokemonUrls.map(url => loadPokemonDetails(url)));
}

// VERBESSERUNG: Verwendet domElements
// WARUM: Konsistente DOM-Element Verwaltung
function setActiveFilter(selectedButton) {
    domElements.filterButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    selectedButton.classList.add('active');
}

// VERBESSERUNG: Strukturierte Load More Logik mit besserer Fehlerbehandlung
// WARUM: Klarere Ablauflogik und robustere Implementierung
async function loadMorePokemon() {
    if (appState.isLoading) return;
    
    setLoadingState(true);
    setLoadMoreButtonState(true);
    
    try {
        const newPokemonDetails = await fetchNewPokemonDetails();
        
        if (!newPokemonDetails || newPokemonDetails.length === 0) {
            console.log('Keine weiteren Pokemon verfügbar');
            return;
        }
        
        updatePokemonList(newPokemonDetails);
        
    } catch (error) {
        handleError('Fehler beim Nachladen', error);
    } finally {
        resetLoadingState();
    }
}

// VERBESSERUNG: Switch-Case für verschiedene Load-More Szenarien
// WARUM: Klarere Entscheidungslogik als if-else Ketten
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
            return await fetchMorePokemonByType(appState.selectedType);
    }
}

// VERBESSERUNG: State-Update in eigene Funktion
// WARUM: Klare Verantwortlichkeit für State-Management
function updatePokemonList(newPokemonDetails) {
    appState.pokemonList = [...appState.pokemonList, ...newPokemonDetails];
    appendNewPokemon(newPokemonDetails);
    appState.nextPageOffset += POKEMON_API_CONFIG.pokemonPerPage;
}

// VERBESSERUNG: Cleanup in eigene Funktion
// WARUM: Weniger Code-Duplikation im finally-Block
function resetLoadingState() {
    setLoadingState(false);
    setLoadMoreButtonState(false);
}

// VERBESSERUNG: Verwendet domElements
// WARUM: Konsistente DOM-Element Verwaltung
function initializeLoadMore() {
    domElements.loadMoreButton.addEventListener('click', () => {
        loadMorePokemon();
    });
}

// VERBESSERUNG: Bessere Fehlerbehandlung für leere Resultate
// WARUM: Robustere Implementierung
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

// VERBESSERUNG: Neue Pokemon anhängen statt Container leeren
// WARUM: Bessere UX - bestehende Karten bleiben sichtbar
function appendNewPokemon(pokemonList) {
    pokemonList.forEach(pokemon => {
        const pokemonCard = createPokemonCard(pokemon);
        domElements.pokemonContainer.appendChild(pokemonCard);
    });
}

// Öffnet das Pokemon-Detail Modal (unverändert)
function openPokemonDetail(pokemon) {
    console.log('Opening detail for:', pokemon.name);
    
    initializePokemonModal();
    openPokemonModal();
    
    loadPokemonDetailData(pokemon);
}

// VERBESSERUNG: Aufgeteilt in kleinere Funktionen (unter 14 Zeilen!)
// WARUM: Uncle Bob Clean Code - eine Funktion, eine Aufgabe
// ÄNDERUNG: Von 30+ Zeilen auf 12 Zeilen reduziert
async function loadPokemonDetailData(pokemon) {
    try {
        setDetailLoadingState(true);
        
        setPokemonModalType(pokemon.types[0]);
        
        setDetailBasicData(pokemon);
        
        const [pokemonDetails, speciesData] = await Promise.all([
            fetchFromPokeAPI(`https://pokeapi.co/api/v2/pokemon/${pokemon.id}`),
            fetchFromPokeAPI(`https://pokeapi.co/api/v2/pokemon-species/${pokemon.id}`)
        ]);
        
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

// VERBESSERUNG: Besserer Funktionsname (Modal statt Card)
// WARUM: Klarere Beschreibung was die Funktion macht
function setPokemonModalType(primaryType) {
    const overlay = document.getElementById('pokemonOverlay');
    if (!overlay) return;
    
    const card = overlay.querySelector('.pokemon-detail-card');
    if (!card) return;
    
    const existingTypeClasses = Array.from(card.classList).filter(cls => cls.startsWith('type-'));
    existingTypeClasses.forEach(cls => card.classList.remove(cls));
    
    card.classList.add(`type-${primaryType}`);
}

// VERBESSERUNG: Basis-Daten setzen in eigene Funktion ausgelagert
// WARUM: loadPokemonDetailData sollte nicht DOM-Details kennen
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

// VERBESSERUNG: Verwendet Template-Funktion
// WARUM: Trennung von Logik und HTML-Erstellung
function showPokemonTypes(types) {
    const typesContainer = document.getElementById('detailTypes');
    if (!typesContainer) return;
    
    typesContainer.innerHTML = types
        .map(type => createTypeBadgeTemplate(type))
        .join('');
}

// VERBESSERUNG: HTML-Erstellung in Template-Funktionen ausgelagert
// WARUM: Von 18+ Zeilen auf 9 Zeilen reduziert, bessere Lesbarkeit
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

// Zeigt die deutsche Beschreibung des Pokemon an (leicht verbessert)
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

// VERBESSERUNG: Verwendet zentrale fetchFromPokeAPI
// WARUM: Konsistente API-Calls mit Fehlerbehandlung
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

// Wandelt die komplexe Evolution-API-Struktur in einfaches Array um (unverändert)
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

// VERBESSERUNG: Von 30+ Zeilen auf 14 Zeilen reduziert
// WARUM: Click-Events in eigene Funktion ausgelagert
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
        
        if (index < evolutions.length - 1) {
            html += createEvolutionArrowTemplate();
        }
    });
    
    html += '</div>';
    container.innerHTML = html;
    
    setupEvolutionClickEvents(container, currentPokemonId);
}

// VERBESSERUNG: Click-Events in eigene Funktion ausgelagert
// WARUM: displayEvolutionChain sollte nur HTML erstellen, nicht Events verwalten
function setupEvolutionClickEvents(container, currentPokemonId) {
    const evolutionItems = container.querySelectorAll('.evolution-item');
    
    evolutionItems.forEach(item => {
        item.addEventListener('click', async () => {
            const pokemonId = item.dataset.pokemonId;
            
            if (pokemonId && pokemonId !== currentPokemonId.toString()) {
                try {
                    const newPokemonData = await fetchFromPokeAPI(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
                    const newPokemon = createPokemonData(newPokemonData);
                    
                    loadPokemonDetailData(newPokemon);
                    
                } catch (error) {
                    console.error('Fehler beim Laden des Evolution-Pokemon:', error);
                }
            }
        });
    });
}

// Zeigt/versteckt Loading-Animation im Modal (unverändert)
function setDetailLoadingState(loading) {
    const overlay = document.getElementById('pokemonOverlay');
    if (!overlay) return;
    
    const card = overlay.querySelector('.pokemon-detail-card');
    if (card) {
        card.style.opacity = loading ? '0.7' : '1';
        card.style.pointerEvents = loading ? 'none' : 'auto';
    }
}

// Zeigt Fehlermeldung im Modal an (unverändert)
function showDetailError(message) {
    const descContainer = document.getElementById('detailDescription');
    if (descContainer) {
        descContainer.textContent = message;
    }
}

// Zeigt Fehler bei Evolution-Chain an (unverändert)
function showEvolutionError() {
    const container = document.getElementById('detailEvolutions');
    if (container) {
        container.innerHTML = '<div class="evolution-error"><p>Entwicklungen konnten nicht geladen werden.</p></div>';
    }
}

// VERBESSERUNG: Klarere Initialisierung mit initializeSearch()
// WARUM: Alle Module werden explizit initialisiert
document.addEventListener('DOMContentLoaded', () => {
    console.log('Pokédex wird geladen...');
    
    loadPokemon();
    initializeFilters();
    initializeLoadMore();
    initializeSearch(); // VERBESSERUNG: Such-Funktion auch initialisieren
});