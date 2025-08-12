// === API KONSTANTEN ===
const POKEMON_API_BASE = "https://pokeapi.co/api/v2/pokemon";
const POKEMON_PER_PAGE = 20;

// === GLOBALE VARIABLEN ===
let pokemonList = [];
let isLoading = false;
let currentType = "all";
let nextPageOffset = 20;

// === DOM ELEMENTE ===
const pokemonContainer = document.getElementById("pokemonContainer");
const loadingSpinner = document.querySelector(".loading-spinner");

function openPokemonDetail(pokemon) {
  console.log("Opening detail for:", pokemon.name);
  initializePokemonModal();
  openPokemonModal();

  loadPokemonDetailData(pokemon);
}


async function loadPokemonDetailData(pokemon) {
  try {
    setDetailLoadingState(true);

    // TYP-BASIERTE CARD-STYLING ANWENDEN
    setPokemonCardType(pokemon.types[0]); // Ersten Typ als Haupt-Typ nehmen

    // Basis-Daten setzen
    document.getElementById("detailName").textContent = pokemon.name;
    document.getElementById("detailNumber").textContent = `#${pokemon.id
      .toString()
      .padStart(3, "0")}`;
    document.getElementById("detailImage").src = pokemon.image;
    document.getElementById("detailImage").alt = pokemon.name;

    // Typen anzeigen
    showPokemonTypes(pokemon.types);

    // API-Daten laden
    const [pokemonDetails, speciesData] = await Promise.all([
      fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.id}`).then((r) =>
        r.json()
      ),
      fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemon.id}`).then(
        (r) => r.json()
      ),
    ]);

    showPokemonStats(pokemonDetails);
    showPokemonDescription(speciesData);
    await loadEvolutionChain(speciesData.evolution_chain.url, pokemon.id);
  } catch (error) {
    console.error("Fehler beim Laden der Pokemon-Details:", error);
    showErrorMessage("Fehler beim Laden der Details");
  } finally {
    setDetailLoadingState(false);
  }
}

function setPokemonCardType(primaryType) {
  const card = document.querySelector(".pokemon-detail-card");
  if (!card) return;

  // Alle bestehenden Typ-Klassen von der Card entfernen
  const existingTypeClasses = Array.from(card.classList).filter((cls) =>
    cls.startsWith("type-")
  );
  existingTypeClasses.forEach((cls) => card.classList.remove(cls));

  // Neue Typ-Klasse zur Card hinzufügen
  card.classList.add(`type-${primaryType}`);

  console.log(`Card Style gesetzt auf: type-${primaryType}`);
}

/**
 * Pokemon Typen anzeigen
 */
function showPokemonTypes(types) {
  const typesContainer = document.getElementById("detailTypes");
  if (typesContainer) {
    typesContainer.innerHTML = types
      .map(
        (type) =>
          `<span class="detail-type-badge type-${type}">${type.toUpperCase()}</span>`
      )
      .join("");
  }
}

/**
 * Pokemon Stats anzeigen - für Grid-Layout
 */
function showPokemonStats(pokemonDetails) {
  const height = (pokemonDetails.height / 10).toFixed(1);
  const weight = (pokemonDetails.weight / 10).toFixed(1);

  const statsContainer = document.getElementById("detailStats");
  if (statsContainer) {
    statsContainer.innerHTML = `
            <div class="stat-item">
                <div class="stat-label">Größe</div>
                <div class="stat-value">${height} m</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Gewicht</div>
                <div class="stat-value">${weight} kg</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Erfahrung</div>
                <div class="stat-value">${
                  pokemonDetails.base_experience || "?"
                }</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">ID</div>
                <div class="stat-value">#${pokemonDetails.id}</div>
            </div>
        `;
  }
}

/**
 * Pokemon Beschreibung anzeigen
 */
function showPokemonDescription(speciesData) {
  const germanEntry = speciesData.flavor_text_entries.find(
    (entry) => entry.language.name === "de"
  );

  const description = germanEntry
    ? germanEntry.flavor_text.replace(/\n/g, " ").replace(/\f/g, " ")
    : "Keine deutsche Beschreibung verfügbar.";

  const descContainer = document.getElementById("detailDescription");
  if (descContainer) {
    descContainer.textContent = description;
  }
}

/**
 * Evolution Chain laden
 */
async function loadEvolutionChain(evolutionUrl, currentPokemonId) {
  try {
    const evolutionData = await fetch(evolutionUrl).then((r) => r.json());
    const evolutionChain = parseEvolutionChain(evolutionData.chain);
    await displayEvolutionChain(evolutionChain, currentPokemonId);
  } catch (error) {
    console.error("Fehler beim Laden der Evolution Chain:", error);
    showEvolutionError();
  }
}

function parseEvolutionChain(chain) {
  const evolutions = [];

  function addEvolution(evolutionData) {
    const pokemonName = evolutionData.species.name;
    const pokemonId = evolutionData.species.url.split("/").slice(-2, -1)[0];

    evolutions.push({
      id: parseInt(pokemonId),
      name: pokemonName,
      image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`,
    });

    if (evolutionData.evolves_to && evolutionData.evolves_to.length > 0) {
      evolutionData.evolves_to.forEach((evolution) => {
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
  const container = document.getElementById("detailEvolutions");
  if (!container) return;

  if (evolutions.length <= 1) {
    container.innerHTML =
      '<div class="no-evolutions"><p>Keine Entwicklungen verfügbar</p></div>';
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
  html += "</div>";

  container.innerHTML = html;

  // Click Events für Evolution Items
  container.querySelectorAll(".evolution-item").forEach((item) => {
    item.addEventListener("click", async () => {
      const pokemonId = item.dataset.pokemonId;
      if (pokemonId && pokemonId !== currentPokemonId.toString()) {
        const newPokemon = await loadPokemonDetails(
          `https://pokeapi.co/api/v2/pokemon/${pokemonId}`
        );
        loadPokemonDetailData(newPokemon);
      }
    });
  });
}

// === UTILITY FUNKTIONEN ===

function setDetailLoadingState(loading) {
  const card = document.querySelector(".pokemon-detail-card");
  if (card) {
    card.style.opacity = loading ? "0.7" : "1";
    card.style.pointerEvents = loading ? "none" : "auto";
  }
}

function showErrorMessage(message) {
  const descContainer = document.getElementById("detailDescription");
  if (descContainer) {
    descContainer.textContent = message;
  }
}

function showEvolutionError() {
  const container = document.getElementById("detailEvolutions");
  if (container) {
    container.innerHTML =
      '<div class="evolution-error"><p>Entwicklungen konnten nicht geladen werden.</p></div>';
  }
}

// ===== POKEMON API FUNKTIONEN =====

function showLoadingSpinner() {
  loadingSpinner.classList.remove("d-none");
}

function hideLoadingSpinner() {
  loadingSpinner.classList.add("d-none");
}

async function loadPokemon(offset = 0, limit = POKEMON_PER_PAGE) {
  if (isLoading) return;

  isLoading = true;
  showLoadingSpinner();

  try {
    const response = await fetch(
      `${POKEMON_API_BASE}?offset=${offset}&limit=${limit}`
    );
    const data = await response.json();

    const pokemonPromises = data.results.map((pokemon) =>
      loadPokemonDetails(pokemon.url)
    );
    const pokemonDetails = await Promise.all(pokemonPromises);

    allPokemon = pokemonDetails;
    renderPokemon(pokemonDetails);
  } catch (error) {
    console.error("Fehler beim Laden:", error);
  } finally {
    isLoading = false;
    hideLoadingSpinner();
  }
}

async function loadPokemonByType(type) {
  if (isLoading) return;

  isLoading = true;
  showLoadingSpinner();
  pokemonContainer.innerHTML = "";

  try {
    if (type === "all") {
      const response = await fetch(
        `${POKEMON_API_BASE}?offset=0&limit=${POKEMON_PER_PAGE}`
      );
      const data = await response.json();

      const pokemonPromises = data.results.map((pokemon) =>
        loadPokemonDetails(pokemon.url)
      );
      const pokemonDetails = await Promise.all(pokemonPromises);

      allPokemon = pokemonDetails;
      renderPokemon(pokemonDetails);
    } else {
      const response = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
      const typeData = await response.json();

      const pokemonUrls = typeData.pokemon
        .slice(0, 20)
        .map((p) => p.pokemon.url);
      const pokemonPromises = pokemonUrls.map((url) => loadPokemonDetails(url));
      const pokemonDetails = await Promise.all(pokemonPromises);

      allPokemon = pokemonDetails;
      renderPokemon(pokemonDetails);
    }
  } catch (error) {
    console.error("Fehler beim Laden nach Typ:", error);
  } finally {
    isLoading = false;
    hideLoadingSpinner();
  }
}

async function loadPokemonDetails(url) {
  const response = await fetch(url);
  const pokemon = await response.json();

  return {
    id: pokemon.id,
    name: pokemon.name,
    image: pokemon.sprites.other["official-artwork"].front_default,
    types: pokemon.types.map((type) => type.type.name),
  };
}

function renderPokemon(pokemonList) {
  pokemonList.forEach((pokemon) => {
    const pokemonCard = createPokemonCard(pokemon);
    pokemonContainer.appendChild(pokemonCard);
  });
}

/**
 * Pokemon Card erstellen - POKEMON GO STYLE mit Typ-Hintergrund
 */
function createPokemonCard(pokemon) {
  const card = document.createElement("div");
  card.className = "col-md-4 col-lg-3 mb-4";

  // Primären Typ für Card-Styling verwenden
  const primaryType = pokemon.types[0];

  card.innerHTML = `
        <div class="pokemon-card h-100 type-${primaryType}" data-pokemon-id="${
    pokemon.id
  }">
            <div class="pokemon-image-wrapper">
                <span class="pokemon-number">#${pokemon.id
                  .toString()
                  .padStart(3, "0")}</span>
                <img src="${pokemon.image}" alt="${
    pokemon.name
  }" class="pokemon-image">
            </div>
            <div class="pokemon-card-content">
                <h5 class="pokemon-name">${pokemon.name}</h5>
                <div class="pokemon-types">
                    ${pokemon.types
                      .map(
                        (type) =>
                          `<span class="type-badge">${type.toUpperCase()}</span>`
                      )
                      .join("")}
                </div>
            </div>
        </div>
    `;

  card.addEventListener("click", () => {
    openPokemonDetail(pokemon);
  });

  return card;
}

// ===== FILTER & LOAD MORE FUNKTIONEN =====

function initializeFilters() {
  const filterButtons = document.querySelectorAll(".filters .btn[data-type]");

  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const filterType = this.getAttribute("data-type");
      setActiveFilter(this);
      loadPokemonByType(filterType);
    });
  });
}

function initializeLoadMore() {
  const loadMoreBtn = document.getElementById("loadMoreBtn");

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", function () {
      console.log(
        `Load More für Typ: ${currentType}, Offset: ${currentOffset}`
      );
      loadMorePokemon();
    });
  }
}

function setLoadMoreState(loading) {
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  if (!loadMoreBtn) return;

  const loadText = loadMoreBtn.querySelector(".load-more-text");
  const loadSpinner = loadMoreBtn.querySelector(".load-more-spinner");

  if (loading) {
    loadMoreBtn.disabled = true;
    loadText.classList.add("d-none");
    loadSpinner.classList.remove("d-none");
  } else {
    loadMoreBtn.disabled = false;
    loadText.classList.remove("d-none");
    loadSpinner.classList.add("d-none");
  }
}

async function loadMorePokemon() {
  if (isLoading) return;

  isLoading = true;
  setLoadMoreState(true);

  try {
    if (currentType === "all") {
      await loadMoreMixedPokemon();
    } else {
      await loadMoreByType(currentType);
    }
  } catch (error) {
    console.error("Fehler beim Nachladen:", error);
  } finally {
    isLoading = false;
    setLoadMoreState(false);
  }
}

async function loadMoreMixedPokemon() {
  const response = await fetch(
    `${POKEMON_API_BASE}?offset=${currentOffset}&limit=${POKEMON_PER_PAGE}`
  );
  const data = await response.json();

  const pokemonPromises = data.results.map((pokemon) =>
    loadPokemonDetails(pokemon.url)
  );
  const pokemonDetails = await Promise.all(pokemonPromises);

  pokemonContainer.innerHTML = "";
  allPokemon = pokemonDetails;
  renderPokemon(pokemonDetails);

  currentOffset += POKEMON_PER_PAGE;
}

async function loadMoreByType(type) {
  const response = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
  const typeData = await response.json();

  const startIndex = currentOffset;
  const endIndex = startIndex + POKEMON_PER_PAGE;
  const pokemonUrls = typeData.pokemon
    .slice(startIndex, endIndex)
    .map((p) => p.pokemon.url);

  if (pokemonUrls.length === 0) {
    console.log("Keine weiteren Pokémon verfügbar!");
    return;
  }

  const pokemonPromises = pokemonUrls.map((url) => loadPokemonDetails(url));
  const pokemonDetails = await Promise.all(pokemonPromises);

  pokemonContainer.innerHTML = "";
  allPokemon = pokemonDetails;
  renderPokemon(pokemonDetails);

  currentOffset += pokemonDetails.length;
}

function setActiveFilter(activeButton) {
  document.querySelectorAll(".filters .btn[data-type]").forEach((btn) => {
    btn.classList.remove("active");
  });

  activeButton.classList.add("active");

  currentType = activeButton.getAttribute("data-type");
  currentOffset = 20;
}

// ===== APP INITIALISIERUNG =====

document.addEventListener("DOMContentLoaded", function () {
  console.log("Pokédex wird geladen...");
  loadPokemon(0, 20);
  initializeFilters();
  initializeLoadMore();

  // Modal initialisieren
  initializePokemonModal();
});
