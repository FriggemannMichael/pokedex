function openPokemonDetail(pokemon) {
    console.log('Opening detail for:', pokemon.name);
    
    initializePokemonModal();
    openPokemonModal();
    loadPokemonDetailData(pokemon);
}

async function loadPokemonDetailData(pokemon) {
    try {
        setDetailLoadingState(true);
        setPokemonModalType(pokemon.types[0]);
        setDetailBasicData(pokemon);
        
        await loadDetailApiData(pokemon);
        
    } catch (error) {
        console.error('Fehler beim Laden der Pokemon-Details:', error);
        showDetailError('Fehler beim Laden der Details');
    } finally {
        setDetailLoadingState(false);
    }
}

async function loadDetailApiData(pokemon) {
    const [pokemonDetails, speciesData] = await Promise.all([
        fetchFromPokeAPI(`https://pokeapi.co/api/v2/pokemon/${pokemon.id}`),
        fetchFromPokeAPI(`https://pokeapi.co/api/v2/pokemon-species/${pokemon.id}`)
    ]);
    
    displayPokemonDetails(pokemon, pokemonDetails, speciesData);
    await loadEvolutionChain(speciesData.evolution_chain.url, pokemon.id);
}

function displayPokemonDetails(pokemon, pokemonDetails, speciesData) {
    showPokemonTypes(pokemon.types);
    showPokemonStats(pokemonDetails);
    showPokemonDescription(speciesData);
}

function setPokemonModalType(primaryType) {
    const overlay = document.getElementById('pokemonOverlay');
    if (!overlay) return;
    
    const card = overlay.querySelector('.pokemon-detail-card');
    if (!card) return;
    
    removeExistingTypeClasses(card);
    card.classList.add(`type-${primaryType}`);
}

function removeExistingTypeClasses(card) {
    const existingTypeClasses = Array.from(card.classList)
        .filter(cls => cls.startsWith('type-'));
    existingTypeClasses.forEach(cls => card.classList.remove(cls));
}

function setDetailBasicData(pokemon) {
    const nameElement = document.getElementById('detailName');
    const numberElement = document.getElementById('detailNumber');
    const imageElement = document.getElementById('detailImage');
    
    updateBasicElements(nameElement, numberElement, imageElement, pokemon);
}

function updateBasicElements(nameEl, numberEl, imageEl, pokemon) {
    if (nameEl) nameEl.textContent = pokemon.name;
    if (numberEl) numberEl.textContent = `#${pokemon.id.toString().padStart(3, '0')}`;
    if (imageEl) {
        imageEl.src = pokemon.image;
        imageEl.alt = pokemon.name;
    }
}

function showPokemonTypes(types) {
    const typesContainer = document.getElementById('detailTypes');
    if (!typesContainer) return;
    
    typesContainer.innerHTML = types
        .map(type => createTypeBadgeTemplate(type))
        .join('');
}

function showPokemonStats(pokemonDetails) {
    const statsContainer = document.getElementById('detailStats');
    if (!statsContainer) return;
    
    const statsData = calculateStatsData(pokemonDetails);
    statsContainer.innerHTML = createStatsHTML(statsData);
}

function calculateStatsData(pokemonDetails) {
    return {
        height: (pokemonDetails.height / 10).toFixed(1),
        weight: (pokemonDetails.weight / 10).toFixed(1),
        experience: pokemonDetails.base_experience || '?',
        id: pokemonDetails.id
    };
}

function createStatsHTML(statsData) {
    return `
        ${createStatItemTemplate('Größe', `${statsData.height} m`)}
        ${createStatItemTemplate('Gewicht', `${statsData.weight} kg`)}
        ${createStatItemTemplate('Erfahrung', statsData.experience)}
        ${createStatItemTemplate('ID', `#${statsData.id}`)}
    `;
}

function showPokemonDescription(speciesData) {
    const descContainer = document.getElementById('detailDescription');
    if (!descContainer) return;
    
    const description = extractGermanDescription(speciesData);
    descContainer.textContent = description;
}

function extractGermanDescription(speciesData) {
    const germanEntry = speciesData.flavor_text_entries
        .find(entry => entry.language.name === 'de');
    
    return germanEntry 
        ? cleanDescriptionText(germanEntry.flavor_text)
        : 'Keine deutsche Beschreibung verfügbar.';
}

function cleanDescriptionText(text) {
    return text.replace(/\n/g, ' ').replace(/\f/g, ' ');
}

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

function parseEvolutionChain(chain) {
    const evolutions = [];
    addEvolution(chain, evolutions);
    return evolutions;
}

function addEvolution(evolutionData, evolutions) {
    const pokemonName = evolutionData.species.name;
    const pokemonId = extractPokemonId(evolutionData.species.url);
    
    evolutions.push(createEvolutionData(pokemonId, pokemonName));
    
    if (hasEvolutions(evolutionData)) {
        evolutionData.evolves_to.forEach(evolution => {
            addEvolution(evolution, evolutions);
        });
    }
}

function extractPokemonId(url) {
    return url.split('/').slice(-2, -1)[0];
}

function createEvolutionData(pokemonId, pokemonName) {
    return {
        id: parseInt(pokemonId),
        name: pokemonName,
        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`
    };
}

function hasEvolutions(evolutionData) {
    return evolutionData.evolves_to && evolutionData.evolves_to.length > 0;
}

async function displayEvolutionChain(evolutions, currentPokemonId) {
    const container = document.getElementById('detailEvolutions');
    if (!container) return;
    
    if (evolutions.length <= 1) {
        showNoEvolutions(container);
        return;
    }
    
    renderEvolutionChain(container, evolutions, currentPokemonId);
    setupEvolutionClickEvents(container, currentPokemonId);
}

function showNoEvolutions(container) {
    container.innerHTML = '<div class="no-evolutions"><p>Keine Entwicklungen verfügbar</p></div>';
}

function renderEvolutionChain(container, evolutions, currentPokemonId) {
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
}

function setupEvolutionClickEvents(container, currentPokemonId) {
    const evolutionItems = container.querySelectorAll('.evolution-item');
    
    evolutionItems.forEach(item => {
        item.addEventListener('click', async () => {
            await handleEvolutionClick(item, currentPokemonId);
        });
    });
}

async function handleEvolutionClick(item, currentPokemonId) {
    const pokemonId = item.dataset.pokemonId;
    
    if (shouldLoadNewPokemon(pokemonId, currentPokemonId)) {
        try {
            const newPokemon = await loadNewEvolutionPokemon(pokemonId);
            loadPokemonDetailData(newPokemon);
        } catch (error) {
            console.error('Fehler beim Laden des Evolution-Pokemon:', error);
        }
    }
}

function shouldLoadNewPokemon(pokemonId, currentPokemonId) {
    return pokemonId && pokemonId !== currentPokemonId.toString();
}

async function loadNewEvolutionPokemon(pokemonId) {
    const newPokemonData = await fetchFromPokeAPI(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
    return createPokemonData(newPokemonData);
}

function setDetailLoadingState(loading) {
    const overlay = document.getElementById('pokemonOverlay');
    if (!overlay) return;
    
    const card = overlay.querySelector('.pokemon-detail-card');
    if (card) {
        card.style.opacity = loading ? '0.7' : '1';
        card.style.pointerEvents = loading ? 'none' : 'auto';
    }
}

function showDetailError(message) {
    const descContainer = document.getElementById('detailDescription');
    if (descContainer) {
        descContainer.textContent = message;
    }
}

function showEvolutionError() {
    const container = document.getElementById('detailEvolutions');
    if (container) {
        container.innerHTML = '<div class="evolution-error"><p>Entwicklungen konnten nicht geladen werden.</p></div>';
    }
}

// Erweitere deine bestehende displayPokemonDetails Funktion
function displayPokemonDetails(pokemon, pokemonDetails, speciesData) {
    showPokemonTypes(pokemon.types);
    showPokemonStats(pokemonDetails);  // Basis-Stats (bleibt)
    showPokemonBaseStats(pokemonDetails);  // NEU: Kampf-Stats
    showBreedingInfo(speciesData);     // NEU: Zucht-Info
    showPokemonMoves(pokemonDetails);  // NEU: Moves
    showPokemonDescription(speciesData);
}

// NEU: Basis-Kampfwerte mit Progress Bars
function showPokemonBaseStats(pokemonDetails) {
    const statsContainer = document.getElementById('detailBaseStats');
    if (!statsContainer) return;
    
    const baseStats = pokemonDetails.stats.map(stat => ({
        name: translateStatName(stat.stat.name),
        value: stat.base_stat,
        maxValue: 255  // Pokemon-Stats gehen meist bis 255
    }));
    
    statsContainer.innerHTML = `
        <div class="base-stats-grid">
            ${baseStats.map(stat => createProgressStatTemplate(stat)).join('')}
        </div>
    `;
}

// NEU: Zucht-Informationen
function showBreedingInfo(speciesData) {
    const breedingContainer = document.getElementById('detailBreeding');
    if (!breedingContainer) return;
    
    const genderInfo = calculateGenderInfo(speciesData.gender_rate);
    const eggGroups = speciesData.egg_groups.map(g => g.name).join(', ');
    
    breedingContainer.innerHTML = `
        <div class="breeding-grid">
            ${createStatItemTemplate('Geschlecht', genderInfo)}
            ${createStatItemTemplate('Ei-Gruppen', eggGroups)}
            ${createStatItemTemplate('Brutzyklen', speciesData.hatch_counter || '?')}
            ${createStatItemTemplate('Fangrate', speciesData.capture_rate)}
        </div>
    `;
}

// NEU: Pokemon Moves
function showPokemonMoves(pokemonDetails) {
    const movesContainer = document.getElementById('detailMoves');
    if (!movesContainer) return;
    
    // Erste 20 Moves (sonst wird's zu lang)
    const limitedMoves = pokemonDetails.moves.slice(0, 20);
    
    movesContainer.innerHTML = `
        <div class="moves-grid">
            ${limitedMoves.map(moveData => 
                createMoveBadgeTemplate(moveData.move.name)
            ).join('')}
        </div>
    `;
}

// Stat-Namen übersetzen
function translateStatName(statName) {
    const translations = {
        'hp': 'KP',
        'attack': 'Angriff', 
        'defense': 'Verteidigung',
        'special-attack': 'Spez. Angriff',
        'special-defense': 'Spez. Verteidigung',
        'speed': 'Initiative'
    };
    return translations[statName] || statName;
}

// Gender-Info berechnen
function calculateGenderInfo(genderRate) {
    if (genderRate === -1) {
        return 'Geschlechtslos';
    }
    
    const malePercent = ((8 - genderRate) / 8 * 100).toFixed(1);
    const femalePercent = (genderRate / 8 * 100).toFixed(1);
    
    return `♂ ${malePercent}% ♀ ${femalePercent}%`;
}