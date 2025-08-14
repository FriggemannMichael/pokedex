let currentPokemonIndex = 0;
let availablePokemonList = [];

function openPokemonDetail(pokemon) {
    setNavigationData(pokemon);
    initializePokemonModal();
    openPokemonModal();
    loadPokemonDetailData(pokemon);
}

function setNavigationData(selectedPokemon) {
    availablePokemonList = appState.pokemonList;
    currentPokemonIndex = availablePokemonList.findIndex(p => p.id === selectedPokemon.id);
}

async function loadPokemonDetailData(pokemon) {
    try {
        setDetailLoadingState(true);
        await initializePokemonData(pokemon);
        updateNavigationButtons();
    } catch (error) {
        showDetailError('Error loading details');
    } finally {
        setDetailLoadingState(false);
    }
}

async function initializePokemonData(pokemon) {
    setPokemonModalType(pokemon.types[0]);
    setDetailBasicData(pokemon);
    await loadDetailApiData(pokemon);
}

function updateNavigationButtons() {
    const prevBtn = document.querySelector('.nav-prev');
    const nextBtn = document.querySelector('.nav-next');
    
    if (!prevBtn || !nextBtn) return;
    
    updatePreviousButton(prevBtn);
    updateNextButton(nextBtn);
}

function updatePreviousButton(prevBtn) {
    if (currentPokemonIndex <= 0) {
        prevBtn.style.opacity = '0.5';
        prevBtn.disabled = true;
    } else {
        prevBtn.style.opacity = '1';
        prevBtn.disabled = false;
    }
}

function updateNextButton(nextBtn) {
    if (currentPokemonIndex >= availablePokemonList.length - 1) {
        nextBtn.style.opacity = '0.5';
        nextBtn.disabled = true;
    } else {
        nextBtn.style.opacity = '1';
        nextBtn.disabled = false;
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
    showPokemonBaseStats(pokemonDetails);
    showBreedingInfo(speciesData);
    showPokemonMoves(pokemonDetails);
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
        ${createStatItemTemplate('Height', `${statsData.height} m`)}
        ${createStatItemTemplate('Weight', `${statsData.weight} kg`)}
        ${createStatItemTemplate('Experience', statsData.experience)}
        ${createStatItemTemplate('ID', `#${statsData.id}`)}
    `;
}

function showPokemonDescription(speciesData) {
    const descContainer = document.getElementById('detailDescription');
    if (!descContainer) return;
    
    const description = extractEnglishDescription(speciesData);
    descContainer.textContent = description;
}

function extractEnglishDescription(speciesData) {
    const englishEntry = speciesData.flavor_text_entries
        .find(entry => entry.language.name === 'en');
    
    return englishEntry 
        ? cleanDescriptionText(englishEntry.flavor_text)
        : 'No English description available.';
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
    container.innerHTML = '<div class="no-evolutions"><p>No evolutions available</p></div>';
}

function renderEvolutionChain(container, evolutions, currentPokemonId) {
    const html = createEvolutionHTML(evolutions, currentPokemonId);
    container.innerHTML = html;
}

function createEvolutionHTML(evolutions, currentPokemonId) {
    let html = '<div class="evolution-chain">';
    
    evolutions.forEach((evolution, index) => {
        const isCurrent = evolution.id === currentPokemonId;
        html += createEvolutionItemTemplate(evolution, isCurrent);
        
        if (index < evolutions.length - 1) {
            html += createEvolutionArrowTemplate();
        }
    });
    
    html += '</div>';
    return html;
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
            showDetailError('Error loading evolution Pokemon');
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
        container.innerHTML = '<div class="evolution-error"><p>Evolutions could not be loaded.</p></div>';
    }
}

function showPokemonBaseStats(pokemonDetails) {
    const statsContainer = document.getElementById('detailBaseStats');
    if (!statsContainer) return;
    
    const baseStats = createBaseStatsArray(pokemonDetails);
    statsContainer.innerHTML = createBaseStatsHTML(baseStats);
}

function createBaseStatsArray(pokemonDetails) {
    return pokemonDetails.stats.map(stat => ({
        name: translateStatName(stat.stat.name),
        value: stat.base_stat,
        maxValue: 255
    }));
}

function createBaseStatsHTML(baseStats) {
    return `
        <div class="base-stats-grid">
            ${baseStats.map(stat => createProgressStatTemplate(stat)).join('')}
        </div>
    `;
}

function showBreedingInfo(speciesData) {
    const breedingContainer = document.getElementById('detailBreeding');
    if (!breedingContainer) return;
    
    const breedingData = createBreedingData(speciesData);
    breedingContainer.innerHTML = createBreedingHTML(breedingData);
}

function createBreedingData(speciesData) {
    const genderInfo = calculateGenderInfo(speciesData.gender_rate);
    const eggGroups = speciesData.egg_groups.map(g => g.name).join(', ');
    
    return {
        gender: genderInfo,
        eggGroups: eggGroups,
        hatchCycles: speciesData.hatch_counter || '?',
        catchRate: speciesData.capture_rate
    };
}

function createBreedingHTML(breedingData) {
    return `
        <div class="breeding-grid">
            ${createStatItemTemplate('Gender', breedingData.gender)}
            ${createStatItemTemplate('Egg Groups', breedingData.eggGroups)}
            ${createStatItemTemplate('Hatch Cycles', breedingData.hatchCycles)}
            ${createStatItemTemplate('Catch Rate', breedingData.catchRate)}
        </div>
    `;
}

function showPokemonMoves(pokemonDetails) {
    const movesContainer = document.getElementById('detailMoves');
    if (!movesContainer) return;
    
    const limitedMoves = pokemonDetails.moves.slice(0, 10);
    
    movesContainer.innerHTML = `
        <div class="moves-grid">
            ${limitedMoves.map(moveData => 
                createMoveBadgeTemplate(moveData.move.name)
            ).join('')}
        </div>
    `;
}

function translateStatName(statName) {
    const translations = {
        'hp': 'HP',
        'attack': 'Attack', 
        'defense': 'Defense',
        'special-attack': 'Sp. Attack',
        'special-defense': 'Sp. Defense',
        'speed': 'Speed'
    };
    return translations[statName] || statName;
}

function calculateGenderInfo(genderRate) {
    if (genderRate === -1) {
        return 'Genderless';
    }
    
    const malePercent = ((8 - genderRate) / 8 * 100).toFixed(1);
    const femalePercent = (genderRate / 8 * 100).toFixed(1);
    
    return `♂ ${malePercent}% ♀ ${femalePercent}%`;
}

function navigatePokemon(direction) {
    if (!canNavigate()) return;
    
    currentPokemonIndex += direction;
    const newPokemon = availablePokemonList[currentPokemonIndex];
    loadPokemonDetailData(newPokemon);
}

function canNavigate() {
    return availablePokemonList && availablePokemonList.length > 0;
}