// ===== POKEMON MODAL TEMPLATE SYSTEM =====

// ===== HAUPTTEMPLATE FUNKTIONEN =====

/**
 * Komplettes Pokemon Modal Overlay erstellen
 */
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

/**
 * Modal Header mit Navigation
 */
function createModalHeaderTemplate() {
    return `
        <div class="overlay-header">
            <button class="nav-btn nav-prev" title="Vorheriges Pokémon">‹</button>
            <button class="nav-btn nav-close" title="Schließen">✕</button>
            <button class="nav-btn nav-next" title="Nächstes Pokémon">›</button>
        </div>
    `;
}

/**
 * Pokemon Detail Card mit Tab-System
 */
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

// ===== DETAIL CARD BEREICHE =====

/**
 * Header Bereich (Name + Nummer)
 */
function createDetailHeaderTemplate() {
    return `
        <div class="detail-header">
            <h2 id="detailName" class="detail-pokemon-name">-</h2>
            <span id="detailNumber" class="detail-pokemon-number">-</span>
        </div>
    `;
}

/**
 * Bild Bereich
 */
function createDetailImageTemplate() {
    return `
        <div class="detail-image-section">
            <img id="detailImage" src="" alt="" class="detail-pokemon-image">
        </div>
    `;
}

/**
 * Tab Navigation
 */
function createTabNavigationTemplate() {
    return `
        <div class="pokemon-tabs">
            <button class="tab-btn active" data-tab="info">INFO</button>
            <button class="tab-btn" data-tab="evolution">EVOLUTION</button>
            <button class="tab-btn" data-tab="beschreibung">BESCHREIBUNG</button>
        </div>
    `;
}

/**
 * Tab Content Container
 */
function createTabContentTemplate() {
    return `
        <div class="tab-content">
            ${createInfoTabTemplate()}
            ${createEvolutionTabTemplate()}
            ${createDescriptionTabTemplate()}
        </div>
    `;
}

// ===== TAB TEMPLATES =====

/**
 * Info Tab mit Typen und Stats
 */
function createInfoTabTemplate() {
    return `
        <div class="tab-panel active" id="tab-info">
            <div id="detailTypes" class="pokemon-types-display">
                <!-- Typen werden hier eingefügt -->
            </div>
            
            <div class="pokemon-stats">
                <div id="detailStats" class="stats-grid">
                    <!-- Stats werden hier eingefügt -->
                </div>
            </div>
        </div>
    `;
}

/**
 * Evolution Tab
 */
function createEvolutionTabTemplate() {
    return `
        <div class="tab-panel" id="tab-evolution">
            <div id="detailEvolutions" class="evolution-display">
                <!-- Evolution chain wird hier eingefügt -->
            </div>
        </div>
    `;
}

/**
 * Beschreibung Tab
 */
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

// ===== MODAL MANAGEMENT FUNKTIONEN =====

/**
 * Modal initialisieren (falls noch nicht vorhanden)
 */
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

/**
 * Modal Event Listeners hinzufügen
 */
function setupModalEventListeners() {
    const overlay = document.getElementById('pokemonOverlay');
    if (!overlay) return;
    
    const background = overlay.querySelector('.overlay-background');
    const closeBtn = overlay.querySelector('.nav-close');
    const prevBtn = overlay.querySelector('.nav-prev');
    const nextBtn = overlay.querySelector('.nav-next');
    
    // Modal schließen
    background.addEventListener('click', closePokemonModal);
    closeBtn.addEventListener('click', closePokemonModal);
    
    // Navigation (später implementieren)
    prevBtn.addEventListener('click', () => navigatePokemon(-1));
    nextBtn.addEventListener('click', () => navigatePokemon(1));
    
    // ✅ FIXED: ESC Event Listener sicher hinzufügen
    addEscapeListener();
}

/**
 * ESC Taste Handler
 */
function handleEscapeKey(event) {
    if (event.key === 'Escape') {
        const overlay = document.getElementById('pokemonOverlay');
        if (overlay && overlay.classList.contains('show')) {
            closePokemonModal();
        }
    }
}

/**
 * Modal öffnen
 */
function openPokemonModal() {
    const overlay = document.getElementById('pokemonOverlay');
    if (!overlay) {
        console.error('Modal nicht gefunden!');
        return;
    }
    
    // Modal anzeigen
    overlay.classList.remove('d-none');
    
    // Animation starten
    setTimeout(() => {
        overlay.classList.add('show');
    }, 10);
    
    // Body Scroll verhindern
    document.body.style.overflow = 'hidden';
    
    // Tabs initialisieren
    setTimeout(initializeTabs, 100);
}

/**
 * Modal schließen
 */
function closePokemonModal() {
    const overlay = document.getElementById('pokemonOverlay');
    if (!overlay) return;
    
    // Animation
    overlay.classList.remove('show');
    
    setTimeout(() => {
        overlay.classList.add('d-none');
        document.body.style.overflow = 'auto';
        resetModalCard();
    }, 300);
}

/**
 * Modal Card auf Standard zurücksetzen
 */
function resetModalCard() {
    const overlay = document.getElementById('pokemonOverlay');
    if (!overlay) return;
    
    const card = overlay.querySelector('.pokemon-detail-card');
    if (card) {
        // Typ-Klassen entfernen
        const typeClasses = Array.from(card.classList).filter(cls => cls.startsWith('type-'));
        typeClasses.forEach(cls => card.classList.remove(cls));
    }
}

// ===== TAB SYSTEM =====

/**
 * Tab System initialisieren
 */
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

/**
 * Zu bestimmtem Tab wechseln
 */
function switchToTab(targetTab, tabButtons, tabPanels) {
    // Alle Buttons und Panels deaktivieren
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabPanels.forEach(panel => panel.classList.remove('active'));
    
    // Aktiven Button und Panel aktivieren
    const activeButton = document.querySelector(`[data-tab="${targetTab}"]`);
    const activePanel = document.getElementById(`tab-${targetTab}`);
    
    if (activeButton) activeButton.classList.add('active');
    if (activePanel) activePanel.classList.add('active');
}

// ===== DETAIL TEMPLATE FUNKTIONEN =====

/**
 * Pokemon Typ Badge Template
 */
function createTypeBadgeTemplate(type) {
    return `<span class="detail-type-badge type-${type}">${type.toUpperCase()}</span>`;
}

/**
 * Stats Item Template
 */
function createStatItemTemplate(label, value) {
    return `
        <div class="stat-item">
            <div class="stat-label">${label}</div>
            <div class="stat-value">${value}</div>
        </div>
    `;
}

/**
 * Evolution Item Template
 */
function createEvolutionItemTemplate(pokemon, isCurrent = false) {
    return `
        <div class="evolution-item ${isCurrent ? 'current' : ''}" data-pokemon-id="${pokemon.id}">
            <img src="${pokemon.image}" alt="${pokemon.name}" class="evolution-image">
            <div class="evolution-name">${pokemon.name}</div>
        </div>
    `;
}

/**
 * Evolution Arrow Template
 */
function createEvolutionArrowTemplate() {
    return `<div class="evolution-arrow">→</div>`;
}

// ===== UTILITY FUNKTIONEN =====

/**
 * Pokemon Navigation (Platzhalter)
 */
function navigatePokemon(direction) {
    console.log(`Navigate: ${direction > 0 ? 'Next' : 'Previous'} Pokemon`);
    // TODO: Navigation zwischen Pokemon implementieren
}

/**
 * Loading Template
 */
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

/**
 * Error Template
 */
function createErrorTemplate(message = 'Fehler beim Laden') {
    return `
        <div class="detail-error text-center">
            <h6>⚠️ ${message}</h6>
            <p>Bitte versuche es erneut.</p>
        </div>
    `;
}

// ===== ESC EVENT LISTENER MANAGEMENT =====
let escapeListenerAdded = false;

/**
 * ESC Event Listener einmalig hinzufügen
 */
function addEscapeListener() {
    if (!escapeListenerAdded) {
        document.addEventListener('keydown', handleEscapeKey);
        escapeListenerAdded = true;
        console.log('ESC Event Listener hinzugefügt');
    }
}