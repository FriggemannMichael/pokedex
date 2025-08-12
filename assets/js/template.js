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
    return `
        <div class="overlay-header">
            <button class="nav-btn nav-prev" title="Vorheriges Pokémon">‹</button>
            <button class="nav-btn nav-close" title="Schließen">✕</button>
            <button class="nav-btn nav-next" title="Nächstes Pokémon">›</button>
        </div>
    `;
}

function createPokemonDetailCardTemplate() {
    return `
        <div class="pokemon-detail-card">
            ${createDetailHeaderTemplate()}
            ${createDetailImageTemplate()}
            ${createTabNavigationTemplate()}
            ${createTabContentTemplate()}
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
            <button class="tab-btn" data-tab="evolution">EVOLUTION</button>
            <button class="tab-btn" data-tab="beschreibung">BESCHREIBUNG</button>
        </div>
    `;
}

function createTabContentTemplate() {
    return `
        <div class="tab-content">
            ${createInfoTabTemplate()}
            ${createEvolutionTabTemplate()}
            ${createDescriptionTabTemplate()}
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
        <div class="tab-panel" id="tab-beschreibung">
            <div class="description-container">
                <p id="detailDescription" class="pokemon-description">
                    Beschreibung wird geladen...
                </p>
            </div>
        </div>
    `;
}

function initializePokemonModal() {
    const existingModal = document.getElementById('pokemonOverlay');
    if (existingModal) {
        console.log('Modal bereits vorhanden');
        return;
    }
    
    console.log('Modal wird erstellt...');
    
    const modalHTML = createPokemonModalTemplate();
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    setupModalEventListeners();
}

function setupModalEventListeners() {
    const overlay = document.getElementById('pokemonOverlay');
    if (!overlay) return;
    
    const background = overlay.querySelector('.overlay-background');
    const closeBtn = overlay.querySelector('.nav-close');
    const prevBtn = overlay.querySelector('.nav-prev');
    const nextBtn = overlay.querySelector('.nav-next');
    
    background.addEventListener('click', closePokemonModal);
    closeBtn.addEventListener('click', closePokemonModal);
    
    prevBtn.addEventListener('click', () => navigatePokemon(-1));
    nextBtn.addEventListener('click', () => navigatePokemon(1));
    
    addEscapeListener();
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
    if (!overlay) {
        console.error('Modal nicht gefunden!');
        return;
    }
    
    overlay.classList.remove('d-none');
    
    setTimeout(() => {
        overlay.classList.add('show');
    }, 10);
    
    document.body.style.overflow = 'hidden';
    
    setTimeout(initializeTabs, 100);
}

function closePokemonModal() {
    const overlay = document.getElementById('pokemonOverlay');
    if (!overlay) return;
    
    overlay.classList.remove('show');
    
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
        const typeClasses = Array.from(card.classList).filter(cls => cls.startsWith('type-'));
        typeClasses.forEach(cls => card.classList.remove(cls));
    }
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
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabPanels.forEach(panel => panel.classList.remove('active'));
    
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

function navigatePokemon(direction) {
    console.log(`Navigate: ${direction > 0 ? 'Next' : 'Previous'} Pokemon`);
}

function createLoadingTemplate(message = 'Wird geladen...') {
    return `
        <div class="detail-loading text-center">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3">${message}</p>
        </div>
    `;
}

function createErrorTemplate(message = 'Fehler beim Laden') {
    return `
        <div class="detail-error text-center">
            <h6>⚠️ ${message}</h6>
            <p>Bitte versuche es erneut.</p>
        </div>
    `;
}

let escapeListenerAdded = false;

function addEscapeListener() {
    if (!escapeListenerAdded) {
        document.addEventListener('keydown', handleEscapeKey);
        escapeListenerAdded = true;
        console.log('ESC Event Listener hinzugefügt');
    }
}