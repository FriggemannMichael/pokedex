// ===== POKEMON MODAL TEMPLATES =====

/**
 * Erstellt das komplette Pokemon Modal Overlay
 */
function createPokemonModalTemplate() {
    return `
        <div id="pokemonOverlay" class="pokemon-overlay d-none">
            <div class="overlay-background"></div>
            <div class="overlay-content">
                <div class="overlay-header">
                    <button class="nav-btn nav-prev" title="Vorheriges Pokémon">‹</button>
                    <button class="nav-btn nav-close" title="Schließen">✕</button>
                    <button class="nav-btn nav-next" title="Nächstes Pokémon">›</button>
                </div>
                
                <div class="pokemon-detail-card">
                    <!-- Pokemon Header -->
                    <div class="detail-header">
                        <h2 id="detailName" class="detail-pokemon-name">-</h2>
                        <span id="detailNumber" class="detail-pokemon-number">-</span>
                    </div>
                    
                    <!-- Pokemon Bild -->
                    <div class="detail-image-section">
                        <img id="detailImage" src="" alt="" class="detail-pokemon-image">
                        
                        <!-- Versionen (optional) -->
                        <div class="pokemon-versions d-none">
                            <button class="version-btn active" data-version="default">Normal</button>
                            <button class="version-btn" data-version="shiny">Shiny</button>
                        </div>
                    </div>
                    
                    <!-- TYPEN CONTAINER -->
                    <div id="detailTypes" class="detail-types">
                        <!-- Typen werden hier dynamisch eingefügt -->
                    </div>
                    
                    <!-- STATS CONTAINER -->
                    <div id="detailStats" class="detail-stats">
                        <!-- Stats werden hier dynamisch eingefügt -->
                    </div>
                    
                    <!-- BESCHREIBUNG CONTAINER -->
                    <div class="detail-description">
                        <h6>Beschreibung</h6>
                        <p id="detailDescription" class="description-text">
                            Beschreibung wird geladen...
                        </p>
                    </div>
                    
                    <!-- ENTWICKLUNGEN CONTAINER -->
                    <div class="detail-evolutions">
                        <h6>Entwicklungen</h6>
                        <div id="detailEvolutions" class="evolution-chain">
                            <!-- Evolution chain wird hier dynamisch eingefügt -->
                        </div>
                    </div>
                </div>
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
 * Pokemon Detail Card mit allen Containern
 */
function createPokemonDetailCardTemplate() {
    return `
        <div class="pokemon-detail-card">
            ${createHeaderSectionTemplate()}
            ${createImageSectionTemplate()}
            ${createTypesSectionTemplate()}
            ${createStatsSectionTemplate()}
            ${createDescriptionSectionTemplate()}
            ${createEvolutionsSectionTemplate()}
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
            
            <!-- Versionen (optional, erstmal versteckt) -->
            <div class="pokemon-versions d-none">
                <button class="version-btn active" data-version="default">Normal</button>
                <button class="version-btn" data-version="shiny">Shiny</button>
            </div>
        </div>
    `;
}

/**
 * Typen Sektion
 */
function createTypesSectionTemplate() {
    return `
        <div id="detailTypes" class="detail-types">
            <!-- Typen werden hier dynamisch eingefügt -->
        </div>
    `;
}

/**
 * Stats Sektion (Größe, Gewicht)
 */
function createStatsSectionTemplate() {
    return `
        <div id="detailStats" class="detail-stats">
            <!-- Stats werden hier dynamisch eingefügt -->
        </div>
    `;
}

/**
 * Beschreibung Sektion
 */
function createDescriptionSectionTemplate() {
    return `
        <div class="detail-description">
            <h6>Beschreibung</h6>
            <p id="detailDescription" class="description-text">
                Beschreibung wird geladen...
            </p>
        </div>
    `;
}

/**
 * Entwicklungen Sektion
 */
function createEvolutionsSectionTemplate() {
    return `
        <div class="detail-evolutions">
            <h6>Entwicklungen</h6>
            <div id="detailEvolutions" class="evolution-chain">
                <!-- Evolution chain wird hier dynamisch eingefügt -->
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
}

/**
 * Modal schließen
 */
function closePokemonModal() {
    const overlay = document.getElementById('pokemonOverlay');
    if (!overlay) return;
    
    overlay.classList.remove('show');
    
    setTimeout(() => {
        overlay.classList.add('d-none');
        document.body.style.overflow = 'auto';
    }, 300);
}

/**
 * Navigation zwischen Pokémon (Platzhalter)
 */
function navigatePokemon(direction) {
    console.log(`Navigate: ${direction > 0 ? 'Next' : 'Previous'} Pokemon`);
    // Wird später implementiert
}

/**
 * Template für Pokemon-Typen
 */
function createTypeBadgeTemplate(type) {
    return `<span class="detail-type-badge type-${type}">${type}</span>`;
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
}

/**
 * Modal schließen
 */
function closePokemonModal() {
    const overlay = document.getElementById('pokemonOverlay');
    if (!overlay) return;
    
    overlay.classList.remove('show');
    
    setTimeout(() => {
        overlay.classList.add('d-none');
        document.body.style.overflow = 'auto';
    }, 300);
}

/**
 * Navigation zwischen Pokémon (Platzhalter)
 */
function navigatePokemon(direction) {
    console.log(`Navigate: ${direction > 0 ? 'Next' : 'Previous'} Pokemon`);
    // Wird später implementiert
}