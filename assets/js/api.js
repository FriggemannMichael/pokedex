/*const POKEMON_API_CONFIG = {
    baseUrl: 'https://pokeapi.co/api/v2/pokemon',
    pokemonPerPage: 20,
    defaultOffset: 0
};

async function fetchFromPokeAPI(url) {
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`PokeAPI Error: ${response.status} - ${response.statusText}`);
        }
        
        return await response.json();
        
    } catch (error) {
        console.error('API Request failed:', error.message);
        throw error;
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

function createPokemonData(rawApiPokemon) {
    return {
        id: rawApiPokemon.id,
        name: rawApiPokemon.name,
        image: rawApiPokemon.sprites.other['official-artwork'].front_default,
        types: rawApiPokemon.types.map(typeObj => typeObj.type.name)
    };
}

async function fetchPokemonByTypeData(type) {
    const typeApiResponse = await fetchFromPokeAPI(`https://pokeapi.co/api/v2/type/${type}`);

    const pokemonUrls = typeApiResponse.pokemon
        .slice(0, POKEMON_API_CONFIG.pokemonPerPage)
        .map(pokemonData => pokemonData.pokemon.url);

    return await Promise.all(pokemonUrls.map(url => loadPokemonDetails(url)));
}

async function fetchMorePokemonByType(type, offset) {
    const typeApiResponse = await fetchFromPokeAPI(`https://pokeapi.co/api/v2/type/${type}`);

    const pokemonUrls = typeApiResponse.pokemon
        .slice(offset, offset + POKEMON_API_CONFIG.pokemonPerPage)
        .map(pokemonData => pokemonData.pokemon.url);

    if (pokemonUrls.length === 0) {
        console.log('No more Pokémon available!');
        return [];
    }

    return await Promise.all(pokemonUrls.map(url => loadPokemonDetails(url)));
}*/

const POKEMON_API_CONFIG = {
    baseUrl: 'https://pokeapi.co/api/v2/pokemon',
    pokemonPerPage: 20,
    defaultOffset: 0
};

async function fetchFromPokeAPI(url) {
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`PokeAPI Error: ${response.status} - ${response.statusText}`);
    }
    
    return await response.json();
}

async function fetchPokemonData(offset, limit) {
    const url = `${POKEMON_API_CONFIG.baseUrl}?offset=${offset}&limit=${limit}`;
    const pokemonListResponse = await fetchFromPokeAPI(url);
    
    return await Promise.all(
        pokemonListResponse.results.map(pokemon => loadPokemonDetails(pokemon.url))
    );
}

async function loadPokemonDetails(pokemonUrl) {
    const rawPokemonData = await fetchFromPokeAPI(pokemonUrl);
    return createPokemonData(rawPokemonData);
}

function createPokemonData(rawApiPokemon) {
    return {
        id: rawApiPokemon.id,
        name: rawApiPokemon.name,
        image: rawApiPokemon.sprites.other['official-artwork'].front_default,
        types: rawApiPokemon.types.map(typeObj => typeObj.type.name)
    };
}

async function fetchPokemonByTypeData(type) {
    const typeApiResponse = await fetchFromPokeAPI(`https://pokeapi.co/api/v2/type/${type}`);
    const pokemonUrls = extractPokemonUrls(typeApiResponse);
    
    return await Promise.all(pokemonUrls.map(url => loadPokemonDetails(url)));
}

function extractPokemonUrls(typeApiResponse) {
    return typeApiResponse.pokemon
        .slice(0, POKEMON_API_CONFIG.pokemonPerPage)
        .map(pokemonData => pokemonData.pokemon.url);
}

async function fetchMorePokemonByType(type, offset) {
    const typeApiResponse = await fetchFromPokeAPI(`https://pokeapi.co/api/v2/type/${type}`);
    const pokemonUrls = extractMorePokemonUrls(typeApiResponse, offset);
    
    if (pokemonUrls.length === 0) {
        return [];
    }
    
    return await Promise.all(pokemonUrls.map(url => loadPokemonDetails(url)));
}

function extractMorePokemonUrls(typeApiResponse, offset) {
    return typeApiResponse.pokemon
        .slice(offset, offset + POKEMON_API_CONFIG.pokemonPerPage)
        .map(pokemonData => pokemonData.pokemon.url);
}