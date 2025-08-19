


function getPokemonCardTemplate(pokemon) {
    const pokemonNumber = formatPokemonNumber(pokemon.id);
    const typeBadges = createTypeBadges(pokemon.types);
    
    return `
        <div class="pokemon-card h-100 type-${pokemon.types[0]}" data-pokemon-id="${pokemon.id}">
            ${getPokemonImageSection(pokemon, pokemonNumber)}
            ${getPokemonContentSection(pokemon, typeBadges)}
        </div>
    `;
}

function getPokemonImageSection(pokemon, pokemonNumber) {
    return `
        <div class="pokemon-image-wrapper">
            <span class="pokemon-number">${pokemonNumber}</span>
            <img src="${pokemon.image}" 
                 alt="${pokemon.name}" 
                 class="pokemon-image"
                 loading="lazy">
        </div>
    `;
}

function getPokemonContentSection(pokemon, typeBadges) {
    return `
        <div class="pokemon-card-content">
            <h5 class="pokemon-name">${pokemon.name}</h5>
            <div class="pokemon-types">
                ${typeBadges}
            </div>
        </div>
    `;
}

function createTypeBadges(types) {
    return types.map(type => 
        `<span class="type-badge">${type.toUpperCase()}</span>`
    ).join('');
}

function formatPokemonNumber(id) {
    return `#${id.toString().padStart(3, '0')}`;
}


function createNoResultsTemplate(searchQuery) {
    return `
        <div class="col-12">
            <div class="no-results text-center py-5">
                <h3>🔍 No Pokemon Found</h3>
                <p>No Pokemon found for "<strong>${searchQuery}</strong>".</p>
                <p class="text-muted">
                    <small>Make sure to search in English (e.g., "pikachu", "charizard")</small>
                </p>
                <button class="btn btn-primary" onclick="clearSearch()">
                    ← Back to All Pokemon
                </button>
            </div>
        </div>
    `;
}

function createErrorTemplate(message = 'An error occurred') {
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


function createSearchResultItemTemplate(pokemon) {
    return `
        <div class="search-result-item" onclick="selectPokemonFromDropdown(${pokemon.id})">
            <img src="${pokemon.image}" 
                 alt="${pokemon.name}" 
                 class="search-result-image"
                 loading="lazy">
            <div class="search-result-info">
                <div class="search-result-name">${pokemon.name}</div>
                <div class="search-result-types">
                    ${pokemon.types.map(type => 
                        `<span class="search-result-type">${type}</span>`
                    ).join('')}
                </div>
            </div>
        </div>
        
    `;
}

function createNoSearchResultsTemplate(query) {
    return `
        <div class="search-result-item">
            <div class="search-result-info">
                <div class="search-result-name">No results for "${query}"</div>
                <div style="font-size: 0.8rem; color: #666; margin-top: 0.2rem;">
                    Try searching in English (e.g., "pikachu", "charizard")
                </div>
            </div>
        </div>
    `;
}