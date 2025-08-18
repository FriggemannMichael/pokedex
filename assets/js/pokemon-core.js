const appState = {
  pokemonList: [],
  isLoading: false,
  selectedType: "all",
  nextPageOffset: 0,
  currentPage: 1,
};

const domElements = {
  pokemonContainer: document.getElementById("pokemonContainer"),
  loadingSpinner: document.querySelector(".loading-spinner"),
  loadMoreButton: document.getElementById("loadMoreBtn"),
  filterButtons: document.querySelectorAll(".btn-filter[data-type]"),
  dropdownItems: document.querySelectorAll(
    ".dropdown-item.type-item[data-type]"
  ),
};

async function loadPokemon() {
  if (appState.isLoading) return;
  setLoadingState(true);

  try {
    const pokemonDetails = await fetchPokemonData(
      appState.nextPageOffset,
      POKEMON_API_CONFIG.pokemonPerPage
    );
    updateAppStateAfterLoad(pokemonDetails);
    renderPokemon(pokemonDetails);
  } catch (error) {
    handleLoadingError("Error loading Pokemon", error);
  } finally {
    setLoadingState(false);
  }
}

async function loadPokemonByType(type) {
  if (appState.isLoading) return;
  setLoadingState(true);
  clearPokemonContainer();

  try {
    resetSearchMode();
    const pokemonDetails = await getPokemonByType(type);
    updateAppStateAfterTypeLoad(pokemonDetails);
    renderPokemon(pokemonDetails);
  } catch (error) {
    handleLoadingError("Error loading by type", error);
  } finally {
    setLoadingState(false);
  }
}

async function getPokemonByType(type) {
  return type === "all"
    ? await fetchPokemonData(0, POKEMON_API_CONFIG.pokemonPerPage)
    : await fetchPokemonByTypeData(type);
}

async function loadMorePokemon() {
  if (appState.isLoading) return;
  setLoadingState(true);
  setLoadMoreButtonState(true);

  try {
    const newPokemonDetails = await fetchNewPokemonDetails();
    processNewPokemonData(newPokemonDetails);
  } catch (error) {
    handleLoadingError("Error loading more", error);
  } finally {
    resetLoadingState();
  }
}

async function fetchNewPokemonDetails() {
  switch (appState.selectedType) {
    case "all":
      return await fetchPokemonData(
        appState.nextPageOffset,
        POKEMON_API_CONFIG.pokemonPerPage
      );
    case "search":
      return [];
    default:
      return await fetchMorePokemonByType(
        appState.selectedType,
        appState.nextPageOffset
      );
  }
}

function updateAppStateAfterLoad(pokemonDetails) {
  appState.pokemonList = pokemonDetails;
  appState.nextPageOffset = POKEMON_API_CONFIG.pokemonPerPage;
}

function updateAppStateAfterTypeLoad(pokemonDetails) {
  appState.pokemonList = pokemonDetails;
  appState.nextPageOffset = POKEMON_API_CONFIG.pokemonPerPage;
  appState.currentPage = 1;
}

function setLoadingState(loading) {
  appState.isLoading = loading;
  toggleLoadingSpinner(loading);
}

function resetLoadingState() {
  setLoadingState(false);
  setLoadMoreButtonState(false);
}

function toggleLoadingSpinner(loading) {
  if (!domElements.loadingSpinner) return;
  domElements.loadingSpinner.classList.toggle("d-none", !loading);
}

function renderPokemon(pokemonList) {
  if (!pokemonList || pokemonList.length === 0) {
    showNoPokemonMessage();
    return;
  }
  clearPokemonContainer();
  pokemonList.forEach((pokemon) => appendPokemonCard(pokemon));
}

function appendPokemonCard(pokemon) {
  if (!domElements.pokemonContainer) return;
  const pokemonCard = createPokemonCard(pokemon);
  domElements.pokemonContainer.appendChild(pokemonCard);
}

function createPokemonCard(pokemon) {
  const cardElement = document.createElement("div");
  cardElement.className = "col-md-4 col-lg-3 mb-4";
  cardElement.innerHTML = getPokemonCardTemplate(pokemon);
  cardElement.addEventListener("click", () => openPokemonDetail(pokemon));
  return cardElement;
}

function clearPokemonContainer() {
  if (!domElements.pokemonContainer) return;
  domElements.pokemonContainer.innerHTML = "";
}

function resetSearchMode() {
  appState.selectedType = "all";
  appState.nextPageOffset = 0;
  appState.currentPage = 1;
  resetAllButtonText();
  clearSearchInput();
}

function resetAllButtonText() {
  const allButton = document.querySelector('[data-type="all"]');
  if (allButton) allButton.innerHTML = '<span class="filter-text">All</span>';
}

function clearSearchInput() {
  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchBtn");
  if (!searchInput) return;
  searchInput.value = "";
  if (typeof updateSearchButtonState === "function") {
    updateSearchButtonState(searchButton, false);
  }
}

function handleLoadingError(message, error) {
  console.error(message, error);
  showErrorMessage(message);
}

function showErrorMessage(message) {
  const container = document.getElementById("pokemonContainer");
  if (container) container.innerHTML = createErrorTemplate(message);
}

function createErrorTemplate(message) {
  return `
    <div class="col-12">
      <div class="search-error text-center py-5">
        <h3>⚠️ Error</h3>
        <p>${message}. Please try again.</p>
        <button class="btn btn-primary" onclick="window.location.reload()">
          🔄 Reload Page
        </button>
      </div>
    </div>`;
}

function showNoPokemonMessage() {
  const container = document.getElementById("pokemonContainer");
  if (container)
    container.innerHTML = createErrorTemplate("No Pokemon available");
}

function getPokemonCardTemplate(pokemon) {
  const pokemonNumber = formatPokemonNumber(pokemon.id);
  const typeBadges = createTypeBadges(pokemon.types);
  return `
    <div class="pokemon-card h-100 type-${pokemon.types[0]}" data-pokemon-id="${pokemon.id}">
      <div class="pokemon-image-wrapper">
        <span class="pokemon-number">${pokemonNumber}</span>
        <img src="${pokemon.image}" alt="${pokemon.name}" class="pokemon-image" loading="lazy">
      </div>
      <div class="pokemon-card-content">
        <h5 class="pokemon-name">${pokemon.name}</h5>
        <div class="pokemon-types">${typeBadges}</div>
      </div>
    </div>`;
}

function formatPokemonNumber(id) {
  return `#${id.toString().padStart(3, "0")}`;
}

function createTypeBadges(types) {
  return types
    .map((type) => `<span class="type-badge">${type.toUpperCase()}</span>`)
    .join("");
}

function processNewPokemonData(newPokemonDetails) {
  if (newPokemonDetails && newPokemonDetails.length > 0) {
    appendNewPokemon(newPokemonDetails);
    appState.pokemonList = [...appState.pokemonList, ...newPokemonDetails];
    appState.nextPageOffset += POKEMON_API_CONFIG.pokemonPerPage;
  } else {
    showNoMorePokemonMessage();
  }
}

function appendNewPokemon(pokemonList) {
  pokemonList.forEach((pokemon) => appendPokemonCard(pokemon));
}

function showNoMorePokemonMessage() {
  if (!domElements.loadMoreButton) return;
  const originalText = domElements.loadMoreButton.innerHTML;
  domElements.loadMoreButton.innerHTML = "✅ All Pokemon loaded!";
  domElements.loadMoreButton.disabled = true;
  setTimeout(() => {
    domElements.loadMoreButton.innerHTML = originalText;
    domElements.loadMoreButton.disabled = false;
  }, 3000);
}

function setLoadMoreButtonState(loading) {
  if (!domElements.loadMoreButton) return;
  const loadText = domElements.loadMoreButton.querySelector(".load-more-text");
  const loadSpinner =
    domElements.loadMoreButton.querySelector(".load-more-spinner");
  if (loadText && loadSpinner) {
    loadText.classList.toggle("d-none", loading);
    loadSpinner.classList.toggle("d-none", !loading);
  }
  domElements.loadMoreButton.disabled = loading;
}
