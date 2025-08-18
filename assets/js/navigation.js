const navigationState = {
  currentPage: 1,
  totalPages: 1,
  pokemonPerPage: 20,
  totalPokemon: 0,
  currentMode: "pagination",
};

function initializeNavigation() {
  setupNavigationButtons();
  updatePaginationControls();
}

function setupNavigationButtons() {
  const prevBtn = document.getElementById("prevPageBtn");
  const nextBtn = document.getElementById("nextPageBtn");
  const loadMoreBtn = document.getElementById("loadMoreBtn");

  if (prevBtn) {
    prevBtn.addEventListener("click", () =>
      navigateToPage(navigationState.currentPage - 1)
    );
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () =>
      navigateToPage(navigationState.currentPage + 1)
    );
  }

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", loadMorePokemon);
  }
}

async function navigateToPage(pageNumber) {
  if (isNavigationBlocked(pageNumber)) return;

  setLoadingState(true);
  try {
    updateCurrentPage(pageNumber);
    const pokemonDetails = await fetchPokemonDetails(pageNumber);
    renderPokemonList(pokemonDetails);
    updatePaginationControls();
    scrollToTop();
  } catch (error) {
    handleNavigationError(error);
  } finally {
    setLoadingState(false);
  }
}

function isNavigationBlocked(pageNumber) {
  return (
    appState.isLoading ||
    pageNumber < 1 ||
    pageNumber > navigationState.totalPages ||
    appState.selectedType === "search"
  );
}

function updateCurrentPage(pageNumber) {
  navigationState.currentPage = pageNumber;
  appState.currentPage = pageNumber;
}

async function fetchPokemonDetails(pageNumber) {
  const offset = calculateOffset(pageNumber);
  if (appState.selectedType === "all") {
    return await fetchPokemonData(offset, navigationState.pokemonPerPage);
  } else {
    return await fetchPokemonByType(appState.selectedType, offset);
  }
}

function calculateOffset(pageNumber) {
  return (pageNumber - 1) * navigationState.pokemonPerPage;
}

async function loadMorePokemon() {
  if (appState.isLoading) return;

  setLoadingState(true);
  setLoadMoreButtonState(true);
  try {
    const newPokemonDetails = await fetchNewPokemonDetails();
    if (hasNewPokemonData(newPokemonDetails)) {
      appendNewPokemon(newPokemonDetails);
      updateAppStateWithNewPokemon(newPokemonDetails);
    } else {
      showNoMorePokemon();
    }
  } catch (error) {
    handleLoadMoreError(error);
  } finally {
    resetLoadingState();
  }
}

async function fetchNewPokemonDetails() {
  switch (appState.selectedType) {
    case "all":
      return await fetchPokemonData(
        appState.nextPageOffset,
        navigationState.pokemonPerPage
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

function updateAppStateWithNewPokemon(newPokemonDetails) {
  appState.pokemonList = [...appState.pokemonList, ...newPokemonDetails];
  appState.nextPageOffset += navigationState.pokemonPerPage;
}

function appendNewPokemon(pokemonList) {
  pokemonList.forEach(appendPokemonCard);
}

function showNoMorePokemon() {
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  if (loadMoreBtn) {
    loadMoreBtn.innerHTML = "✅ All Pokemon loaded!";
    loadMoreBtn.disabled = true;
    resetLoadMoreButtonAfterDelay(loadMoreBtn);
  }
}

function resetLoadMoreButtonAfterDelay(loadMoreBtn) {
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

function updatePaginationControls() {
  const prevBtn = document.getElementById("prevPageBtn");
  const nextBtn = document.getElementById("nextPageBtn");
  const pageInfo = document.getElementById("pageInfo");
  const paginationControls = document.getElementById("paginationControls");

  if (pageInfo) pageInfo.textContent = `Page ${navigationState.currentPage}`;
  if (prevBtn) prevBtn.disabled = navigationState.currentPage <= 1;
  if (nextBtn) nextBtn.disabled = isNextButtonDisabled();
  if (paginationControls) {
    paginationControls.style.display =
      appState.selectedType === "search" ? "none" : "flex";
  }
}

function isNextButtonDisabled() {
  if (appState.selectedType === "all") {
    return false;
  } else if (appState.selectedType === "search") {
    return true;
  } else {
    return navigationState.currentPage >= navigationState.totalPages;
  }
}

async function calculateTotalPagesForType(type) {
  try {
    if (type === "all") {
      navigationState.totalPages = 50; // Example value
    } else if (type === "search") {
      navigationState.totalPages = 1;
    } else {
      const totalPokemon = await fetchTotalPokemonForType(type);
      navigationState.totalPages = Math.ceil(
        totalPokemon / navigationState.pokemonPerPage
      );
    }
  } catch (error) {
    handleTotalPagesError(error);
  }
}

async function fetchTotalPokemonForType(type) {
  const typeResponse = await fetchFromPokeAPI(
    `https://pokeapi.co/api/v2/type/${type}`
  );
  return typeResponse.pokemon.length;
}

function handleTotalPagesError(error) {
  console.error("Error calculating total pages:", error);
  navigationState.totalPages = 1;
}

function setLoadMoreButtonState(loading) {
  const btn = document.getElementById("loadMoreBtn");
  if (!btn) return;
  const text = btn.querySelector(".load-more-text");
  const spinner = btn.querySelector(".load-more-spinner");
  text?.classList.toggle("d-none", loading);
  spinner?.classList.toggle("d-none", !loading);
  btn.disabled = loading;
}


function resetLoadingState() {
  setLoadingState(false);
  setLoadMoreButtonState(false);
}

function hasNewPokemonData(newPokemonDetails) {
  return newPokemonDetails && newPokemonDetails.length > 0;
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
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
  const burgerBtn = document.getElementById("burgerMenuBtn");
  const filterContainer = document.getElementById("filterContainer");

  if (shouldSkipInitialization(burgerBtn, filterContainer)) return;

  setupBurgerButtonClick(burgerBtn, filterContainer);
  setupDocumentClickHandler(burgerBtn, filterContainer);
}

function shouldSkipInitialization(burgerBtn, filterContainer) {
  return !burgerBtn || !filterContainer;
}

function setupBurgerButtonClick(burgerBtn, filterContainer) {
  burgerBtn.addEventListener("click", () =>
    toggleFilterContainer(burgerBtn, filterContainer)
  );
}

function setupDocumentClickHandler(burgerBtn, filterContainer) {
  document.addEventListener("click", (event) =>
    handleOutsideClick(event, burgerBtn, filterContainer)
  );
}

function toggleFilterContainer(burgerBtn, filterContainer) {
  const isVisible = filterContainer.classList.toggle("show");
  updateBurgerButtonHTML(burgerBtn, isVisible);
}

function updateBurgerButtonHTML(burgerBtn, isVisible) {
  burgerBtn.innerHTML = isVisible
    ? getBurgerMenuCloseHTML()
    : getBurgerMenuOpenHTML();
}

function getBurgerMenuOpenHTML() {
  return createBurgerMenuHTML("☰", "Filters");
}

function getBurgerMenuCloseHTML() {
  return createBurgerMenuHTML("✕", "Close");
}

function createBurgerMenuHTML(icon, text) {
  return `
        <span class="burger-icon">${icon}</span>
        <span class="filter-text">${text}</span>
    `;
}

function handleOutsideClick(event, burgerBtn, filterContainer) {
  if (
    !burgerBtn.contains(event.target) &&
    !filterContainer.contains(event.target)
  ) {
    filterContainer.classList.remove("show");
    updateBurgerButtonHTML(burgerBtn, false);
  }
}

function closeFilterContainerIfClickedOutside(
  event,
  burgerBtn,
  filterContainer
) {
  if (
    !burgerBtn.contains(event.target) &&
    !filterContainer.contains(event.target)
  ) {
    filterContainer.classList.remove("show");
    burgerBtn.innerHTML = getBurgerMenuOpenHTML();
  }
}

function initializeFullNavigation() {
  initializeNavigation();
  initializeBurgerMenu();
  checkResponsiveNavigation();
  window.addEventListener("resize", checkResponsiveNavigation);
}

function checkResponsiveNavigation() {
  const burgerBtn = document.getElementById("burgerMenuBtn");
  const filterContainer = document.getElementById("filterContainer");

  if (window.innerWidth <= 768) {
    burgerBtn?.classList.remove("d-none");
    filterContainer?.classList.remove("show");
  } else {
    burgerBtn?.classList.add("d-none");
    filterContainer?.classList.remove("show");
  }
}

function handleNavigationError(error) {
  console.error("Navigation error:", error);
  handleError("Navigation error", error);
}

function handleLoadMoreError(error) {
  console.error("Load more error:", error);
  handleError("Error loading more", error);
}
async function navigateToPage(pageNumber) {
  if (isNavigationBlocked(pageNumber)) return;

  setLoadingState(true);
  try {
    updateCurrentPage(pageNumber);
    const pokemonDetails = await fetchPokemonDetails(pageNumber);
    renderPokemonList(pokemonDetails);
    updatePaginationControls();
    scrollToTop();
  } catch (error) {
    handleNavigationError(error);
  } finally {
    setLoadingState(false);
  }
}

function handleNavigationError(error) {
  console.error("Navigation error:", error);
  handleError("Navigation error", error);
}

function renderPokemonList(pokemonDetails) {
  clearPokemonContainer();
  pokemonDetails.forEach((pokemon) => {
    appendPokemonCard(pokemon);
  });
}

function handleError(message, error) {
  console.error(message, error);
  alert(message);
}
