function createPokemonModalTemplate() {
    return `
        <div id="pokemonOverlay" class="pokemon-overlay d-none">
            <div class="overlay-background"></div>
            <div class="overlay-content">
                ${createModalHeaderTemplate()}
                ${createPokemonDetailCardTemplate()}
            </div>
        </div>
    `;
}

function createModalHeaderTemplate() {
    return ``;
}

function createPokemonDetailCardTemplate() {
    return `
        <div class="pokemon-detail-card">
            ${createCardNavigationTemplate()}
            ${createDetailHeaderTemplate()}
            ${createDetailImageTemplate()}
            ${createTabNavigationTemplate()}
            ${createTabContentTemplate()}
        </div>
    `;
}

function createCardNavigationTemplate() {
    return `
        <div class="card-navigation">
            <button class="nav-btn nav-prev" title="Previous Pokémon">‹</button>
            <button class="nav-btn nav-close" title="Close">✕</button>
            <button class="nav-btn nav-next" title="Next Pokémon">›</button>
        </div>
    `;
}

function createDetailHeaderTemplate() {
    return `
        <div class="detail-header">
            <h2 id="detailName" class="detail-pokemon-name">-</h2>
            <span id="detailNumber" class="detail-pokemon-number">-</span>
        </div>
    `;
}

function createDetailImageTemplate() {
    return `
        <div class="detail-image-section">
            <img id="detailImage" src="" alt="" class="detail-pokemon-image">
        </div>
    `;
}

function createTabNavigationTemplate() {
    return `
        <div class="pokemon-tabs">
            <button class="tab-btn active" data-tab="info">INFO</button>
            <button class="tab-btn" data-tab="stats">STATS</button>
            <button class="tab-btn" data-tab="breeding">BREEDING</button>
            <button class="tab-btn" data-tab="moves">MOVES</button>
            <button class="tab-btn" data-tab="evolution">EVOLUTION</button>
            <button class="tab-btn" data-tab="description">DESCRIPTION</button>
        </div>
    `;
}

function createTabContentTemplate() {
    return `
        <div class="tab-content">
            ${createInfoTabTemplate()}
            ${createStatsTabTemplate()}
            ${createBreedingTabTemplate()}
            ${createMovesTabTemplate()}
            ${createEvolutionTabTemplate()}
            ${createDescriptionTabTemplate()}
        </div>
    `;
}

function createStatsTabTemplate() {
    return `
        <div class="tab-panel" id="tab-stats">
            <div id="detailBaseStats" class="base-stats-container">
            </div>
        </div>
    `;
}

function createBreedingTabTemplate() {
    return `
        <div class="tab-panel" id="tab-breeding">
            <div id="detailBreeding" class="breeding-info">
            </div>
        </div>
    `;
}

function createMovesTabTemplate() {
    return `
        <div class="tab-panel" id="tab-moves">
            <div id="detailMoves" class="moves-container">
            </div>
        </div>
    `;
}

function createInfoTabTemplate() {
    return `
        <div class="tab-panel active" id="tab-info">
            <div id="detailTypes" class="pokemon-types-display">
            </div>
            
            <div class="pokemon-stats">
                <div id="detailStats" class="stats-grid">
                </div>
            </div>
        </div>
    `;
}

function createEvolutionTabTemplate() {
    return `
        <div class="tab-panel" id="tab-evolution">
            <div id="detailEvolutions" class="evolution-display">
            </div>
        </div>
    `;
}

function createDescriptionTabTemplate() {
    return `
        <div class="tab-panel" id="tab-description">
            <div class="description-container">
                <p id="detailDescription" class="pokemon-description">
                    Loading description...
                </p>
            </div>
        </div>
    `;
}

function initializePokemonModal() {
    const existingModal = document.getElementById('pokemonOverlay');
    if (existingModal) return;
    
    createModal();
    setupModalEventListeners();
}

function createModal() {
    const modalHTML = createPokemonModalTemplate();
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function setupModalEventListeners() {
    const overlay = document.getElementById('pokemonOverlay');
    if (!overlay) return;
    
    setupBackgroundListener(overlay);
    setupNavigationListeners(overlay);
    addEscapeListener();
}

function setupBackgroundListener(overlay) {
    const background = overlay.querySelector('.overlay-background');
    const closeBtn = overlay.querySelector('.nav-close');
    
    background.addEventListener('click', closePokemonModal);
    closeBtn.addEventListener('click', closePokemonModal);
}

function setupNavigationListeners(overlay) {
    const prevBtn = overlay.querySelector('.nav-prev');
    const nextBtn = overlay.querySelector('.nav-next');
    
    prevBtn.addEventListener('click', () => navigatePokemon(-1));
    nextBtn.addEventListener('click', () => navigatePokemon(1));
}

function handleEscapeKey(event) {
    if (event.key === 'Escape') {
        const overlay = document.getElementById('pokemonOverlay');
        if (overlay && overlay.classList.contains('show')) {
            closePokemonModal();
        }
    }
}

function openPokemonModal() {
    const overlay = document.getElementById('pokemonOverlay');
    if (!overlay) return;
    
    showModal(overlay);
    disableBodyScroll();
    initializeTabsDelayed();
}

function showModal(overlay) {
    overlay.classList.remove('d-none');
    setTimeout(() => overlay.classList.add('show'), 10);
}

function disableBodyScroll() {
    document.body.style.overflow = 'hidden';
}

function initializeTabsDelayed() {
    setTimeout(initializeTabs, 100);
}

function closePokemonModal() {
    const overlay = document.getElementById('pokemonOverlay');
    if (!overlay) return;
    
    hideModal(overlay);
    scheduleModalCleanup(overlay);
}

function hideModal(overlay) {
    overlay.classList.remove('show');
}

function scheduleModalCleanup(overlay) {
    setTimeout(() => {
        overlay.classList.add('d-none');
        document.body.style.overflow = 'auto';
        resetModalCard();
    }, 300);
}

function resetModalCard() {
    const overlay = document.getElementById('pokemonOverlay');
    if (!overlay) return;
    
    const card = overlay.querySelector('.pokemon-detail-card');
    if (card) {
        removeTypeClasses(card);
    }
}

function removeTypeClasses(card) {
    const typeClasses = Array.from(card.classList).filter(cls => cls.startsWith('type-'));
    typeClasses.forEach(cls => card.classList.remove(cls));
}

function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            switchToTab(targetTab, tabButtons, tabPanels);
        });
    });
}

function switchToTab(targetTab, tabButtons, tabPanels) {
    deactivateAllTabs(tabButtons, tabPanels);
    activateSelectedTab(targetTab);
}

function deactivateAllTabs(tabButtons, tabPanels) {
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabPanels.forEach(panel => panel.classList.remove('active'));
}

function activateSelectedTab(targetTab) {
    const activeButton = document.querySelector(`[data-tab="${targetTab}"]`);
    const activePanel = document.getElementById(`tab-${targetTab}`);
    
    if (activeButton) activeButton.classList.add('active');
    if (activePanel) activePanel.classList.add('active');
}

function createTypeBadgeTemplate(type) {
    return `<span class="detail-type-badge type-${type}">${type.toUpperCase()}</span>`;
}

function createStatItemTemplate(label, value) {
    return `
        <div class="stat-item">
            <div class="stat-label">${label}</div>
            <div class="stat-value">${value}</div>
        </div>
    `;
}

function createEvolutionItemTemplate(pokemon, isCurrent = false) {
    return `
        <div class="evolution-item ${isCurrent ? 'current' : ''}" data-pokemon-id="${pokemon.id}">
            <img src="${pokemon.image}" alt="${pokemon.name}" class="evolution-image">
            <div class="evolution-name">${pokemon.name}</div>
        </div>
    `;
}

function createEvolutionArrowTemplate() {
    return `<div class="evolution-arrow">→</div>`;
}

function createLoadingTemplate(message = 'Loading...') {
    return `
        <div class="detail-loading text-center">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3">${message}</p>
        </div>
    `;
}

function createErrorTemplate(message = 'Error loading') {
    return `
        <div class="detail-error text-center">
            <h6>⚠️ ${message}</h6>
            <p>Please try again.</p>
        </div>
    `;
}

function createProgressStatTemplate(stat) {
    const percentage = calculateStatPercentage(stat);
    return createProgressStatHTML(stat, percentage);
}

function calculateStatPercentage(stat) {
    return Math.min((stat.value / stat.maxValue) * 100, 100);
}

function createProgressStatHTML(stat, percentage) {
    return `
        <div class="progress-stat-item">
            <div class="progress-header">
                <span class="progress-label">${stat.name}</span>
                <span class="progress-value">${stat.value}</span>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width: ${percentage}%"></div>
            </div>
        </div>
    `;
}

function createMoveBadgeTemplate(moveName) {
    const cleanName = moveName.replace('-', ' ');
    return `<span class="move-badge">${cleanName}</span>`;
}

let isEscapeListenerActive = false;

function addEscapeListener() {
    if (!isEscapeListenerActive) {
        document.addEventListener('keydown', handleEscapeKey);
        isEscapeListenerActive = true;
    }
}