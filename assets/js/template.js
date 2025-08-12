// ===== POKEMON MODAL TEMPLATES (Pokemon GO Style) =====

/**
 * Erstellt das komplette Pokemon Modal Overlay
 */
function createPokemonModalTemplate() {
    return `
        <div id="pokemonOverlay" class="pokemon-overlay">
            <div class="overlay-background"></div>
            <div class="overlay-content">
                <div class="overlay-header">
                    <button class="nav-btn nav-prev" title="Vorheriges Pokémon">‹</button>
                    <button class="nav-btn nav-close" title="Schließen">✕</button>
                    <button class="nav-btn nav-next" title="Nächstes Pokémon">›</button>
                </div>
                
                ${createPokemonDetailCardTemplate()}
            </div>
        </div>
    `;
}

/**
 * Pokemon Detail Card mit Tab-System
 */
function createPokemonDetailCardTemplate() {
    return `
        <div class="pokemon-detail-card">
            ${createHeaderSectionTemplate()}
            ${createImageSectionTemplate()}
            ${createTabNavigationTemplate()}
            ${createTabContentTemplate()}
        </div>
    `;
}

/**
 * Header Bereich (Name + Nummer)
 */
function createHeaderSectionTemplate() {
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
function createImageSectionTemplate() {
    return `
        <div class="detail-image-section">
            <img id="detailImage" src="" alt="" class="detail-pokemon-image">
        </div>
    `;
}

/**
 * Tab Navigation (INFO | EVOLUTION | BESCHREIBUNG)
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
 * Tab Content Container mit allen 3 Panels
 */
function createTabContentTemplate() {
    return `
        <div class="tab-content">
            <!-- INFO TAB -->
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
            
            <!-- EVOLUTION TAB -->
            <div class="tab-panel" id="tab-evolution">
                <div id="detailEvolutions" class="evolution-display">
                    <!-- Evolution chain wird hier eingefügt -->
                </div>
            </div>
            
            <!-- BESCHREIBUNG TAB -->
            <div class="tab-panel" id="tab-beschreibung">
                <div class="description-container">
                    <p id="detailDescription" class="pokemon-description">
                        Beschreibung wird geladen...
                    </p>
                </div>
            </div>
        </div>
    `;
}

// ===== MODAL UTILITY FUNKTIONEN =====

/**
 * Modal in DOM einfügen
 */
function initializePokemonModal() {
    // Prüfen ob Modal bereits existiert
    const existingModal = document.getElementById('pokemonOverlay');
    if (existingModal) {
        console.log('Modal bereits vorhanden');
        return;
    }
    
    console.log('Modal wird erstellt...');
    
    // Modal HTML erstellen und einfügen
    const modalHTML = createPokemonModalTemplate();
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Prüfen ob es erfolgreich hinzugefügt wurde
    const newModal = document.getElementById('pokemonOverlay');
    if (newModal) {
        console.log('Modal erfolgreich erstellt!');
        // Event Listeners hinzufügen
        setupModalEventListeners();
    } else {
        console.error('Modal konnte nicht erstellt werden!');
    }
}

/**
 * Tab-System initialisieren
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
    // Alle Buttons deaktivieren
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Alle Panels verstecken
    tabPanels.forEach(panel => panel.classList.remove('active'));
    
    // Aktiven Button markieren
    const activeButton = document.querySelector(`[data-tab="${targetTab}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    // Aktives Panel anzeigen
    const activePanel = document.getElementById(`tab-${targetTab}`);
    if (activePanel) {
        activePanel.classList.add('active');
    }
}

/**
 * Modal Event Listeners
 */
function setupModalEventListeners() {
    const overlay = document.getElementById('pokemonOverlay');
    const background = overlay.querySelector('.overlay-background');
    const closeBtn = overlay.querySelector('.nav-close');
    const prevBtn = overlay.querySelector('.nav-prev');
    const nextBtn = overlay.querySelector('.nav-next');
    
    // Schließen bei Klick auf Background
    background.addEventListener('click', closePokemonModal);
    
    // Schließen bei Close Button
    closeBtn.addEventListener('click', closePokemonModal);
    
    // Navigation (später implementieren)
    prevBtn.addEventListener('click', () => navigatePokemon(-1));
    nextBtn.addEventListener('click', () => navigatePokemon(1));
    
    // ESC Taste
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !overlay.classList.contains('d-none')) {
            closePokemonModal();
        }
    });
}

/**
 * Modal öffnen
 */
function openPokemonModal() {
    const overlay = document.getElementById('pokemonOverlay');
    
    if (!overlay) {
        console.error('Pokemon Overlay nicht gefunden! Modal wird neu erstellt...');
        initializePokemonModal();
        
        // Nochmal versuchen
        const retryOverlay = document.getElementById('pokemonOverlay');
        if (!retryOverlay) {
            console.error('Modal konnte nicht erstellt werden!');
            return;
        }
        return openPokemonModal(); // Rekursiv nochmal versuchen
    }
    
    overlay.classList.remove('d-none');
    
    // Animation
    setTimeout(() => {
        overlay.classList.add('show');
    }, 10);
    
    // Body Scroll verhindern
    document.body.style.overflow = 'hidden';
    
    // Tabs nach dem Öffnen initialisieren
    setTimeout(() => {
        initializeTabs();
    }, 100);
}

/**
 * Modal schließen - MIT Card-Typ Reset
 */
function closePokemonModal() {
    const overlay = document.getElementById('pokemonOverlay');
    if (!overlay) return;
    
    overlay.classList.remove('show');
    
    setTimeout(() => {
        overlay.classList.add('d-none');
        document.body.style.overflow = 'auto';
        
        // Card Typ-Klassen zurücksetzen
        const card = overlay.querySelector('.pokemon-detail-card');
        if (card) {
            const existingTypeClasses = Array.from(card.classList).filter(cls => cls.startsWith('type-'));
            existingTypeClasses.forEach(cls => card.classList.remove(cls));
            console.log('Card Typ-Klassen zurückgesetzt');
        }
    }, 300);
}

/**
 * Navigation zwischen Pokémon (Platzhalter)
 */
function navigatePokemon(direction) {
    console.log(`Navigate: ${direction > 0 ? 'Next' : 'Previous'} Pokemon`);
    // Wird später implementiert
}

// ===== TEMPLATE HILFSFUNKTIONEN =====

/**
 * Template für Pokemon-Typen
 */
function createTypeBadgeTemplate(type) {
    return `<span class="detail-type-badge type-${type}">${type.toUpperCase()}</span>`;
}

/**
 * Template für Stats-Item
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
 * Template für Evolution Item
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
 * Template für Evolution Arrow
 */
function createEvolutionArrowTemplate() {
    return `<div class="evolution-arrow">→</div>`;
}

/**
 * Template für Loading State
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
 * Template für Fehler-Anzeige
 */
function createErrorTemplate(message = 'Fehler beim Laden') {
    return `
        <div class="detail-error text-center">
            <h6>⚠️ ${message}</h6>
            <p>Bitte versuche es erneut.</p>
        </div>
    `;
}