// === API KONSTANTEN ===
const POKEMON_API_BASE = 'https://pokeapi.co/api/v2/pokemon';
const POKEMON_PER_PAGE = 20;

// === GLOBALE VARIABLEN ===
let allPokemon = [];
let isLoading = false;

// === DOM ELEMENTE ===
const pokemonContainer = document.getElementById('pokemonContainer');
const loadingSpinner = document.querySelector('.loading-spinner');

// === LOADING SPINNER ===
function showLoadingSpinner() {
    loadingSpinner.classList.remove('d-none');
}

function hideLoadingSpinner() {
    loadingSpinner.classList.add('d-none');
}

// === POKEMON LADEN (für "Alle") ===
async function loadPokemon(offset = 0, limit = POKEMON_PER_PAGE) {
    if (isLoading) return;
    
    isLoading = true;
    showLoadingSpinner();
    
    try {
        const response = await fetch(`${POKEMON_API_BASE}?offset=${offset}&limit=${limit}`);
        const data = await response.json();
        
        const pokemonPromises = data.results.map(pokemon => loadPokemonDetails(pokemon.url));
        const pokemonDetails = await Promise.all(pokemonPromises);
        
        // Für "Alle" - ersetzen statt hinzufügen
        allPokemon = pokemonDetails;
        renderPokemon(pokemonDetails);
        
    } catch (error) {
        console.error('Fehler beim Laden:', error);
    } finally {
        isLoading = false;
        hideLoadingSpinner();
    }
}

// === POKEMON NACH TYP LADEN ===
async function loadPokemonByType(type) {
    if (isLoading) return;
    
    isLoading = true;
    showLoadingSpinner();
    
    // Container leeren
    pokemonContainer.innerHTML = '';
    
    try {
        if (type === 'all') {
            // Normale erste 20 laden - DIREKT hier statt loadPokemon() aufrufen
            const response = await fetch(`${POKEMON_API_BASE}?offset=0&limit=${POKEMON_PER_PAGE}`);
            const data = await response.json();
            
            const pokemonPromises = data.results.map(pokemon => loadPokemonDetails(pokemon.url));
            const pokemonDetails = await Promise.all(pokemonPromises);
            
            allPokemon = pokemonDetails;
            renderPokemon(pokemonDetails);
        } else {
            // Spezifischen Typ von der API laden
            const response = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
            const typeData = await response.json();
            
            // Erste 20 Pokémon dieses Typs nehmen
            const pokemonUrls = typeData.pokemon.slice(0, 20).map(p => p.pokemon.url);
            
            // Details für diese 20 laden
            const pokemonPromises = pokemonUrls.map(url => loadPokemonDetails(url));
            const pokemonDetails = await Promise.all(pokemonPromises);
            
            // Neue Pokémon setzen
            allPokemon = pokemonDetails;
            renderPokemon(pokemonDetails);
        }
        
    } catch (error) {
        console.error('Fehler beim Laden nach Typ:', error);
    } finally {
        isLoading = false;
        hideLoadingSpinner();
    }
}

// === POKEMON DETAILS ===
async function loadPokemonDetails(url) {
    const response = await fetch(url);
    const pokemon = await response.json();
    
    return {
        id: pokemon.id,
        name: pokemon.name,
        image: pokemon.sprites.other['official-artwork'].front_default,
        types: pokemon.types.map(type => type.type.name)
    };
}

// === POKEMON RENDERN ===
function renderPokemon(pokemonList) {
    pokemonList.forEach(pokemon => {
        const pokemonCard = createPokemonCard(pokemon);
        pokemonContainer.appendChild(pokemonCard);
    });
}

// === POKEMON KARTE ERSTELLEN ===
function createPokemonCard(pokemon) {
    const card = document.createElement('div');
    card.className = 'col-md-4 col-lg-3 mb-4';
    
    card.innerHTML = `
        <div class="pokemon-card h-100">
            <div class="pokemon-image-wrapper">
                <span class="pokemon-number">#${pokemon.id.toString().padStart(3, '0')}</span>
                <img src="${pokemon.image}" alt="${pokemon.name}" class="pokemon-image">
            </div>
            <div class="p-3">
                <h5 class="pokemon-name">${pokemon.name}</h5>
                <div class="pokemon-types">
                    ${pokemon.types.map(type => `<span class="type-badge type-${type}">${type}</span>`).join('')}
                </div>
            </div>
        </div>
    `;
    
    return card;
}

// === FILTER FUNKTIONEN ===
function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filters .btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filterType = this.getAttribute('data-type');
            
            // Active-Status wechseln
            setActiveFilter(this);
            
            // Pokémon nach Typ laden (NEUE FUNKTION)
            loadPokemonByType(filterType);
        });
    });
}

// === ACTIVE FILTER SETZEN ===
function setActiveFilter(activeButton) {
    // Alle Buttons "deaktivieren"
    document.querySelectorAll('.filters .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Geklickten Button aktivieren
    activeButton.classList.add('active');
}

// === APP STARTEN ===
document.addEventListener('DOMContentLoaded', function() {
    console.log('Pokédex wird geladen...');
    loadPokemon(0, 20);
    initializeFilters();
});