// DOM-Cache: Zentrale Verwaltung häufig verwendeter DOM-Elemente
// Verhindert mehrfache getElementById Aufrufe und verbessert Performance

class DOMCache {
    constructor() {
        this._cache = new Map();
        this.initializeCache();
    }

    initializeCache() {
        // Häufig verwendete DOM-Elemente vorladen
        const commonElements = [
            'pokemonContainer',
            'searchInput',
            'searchBtn',
            'searchDropdown',
            'pokemonOverlay',
            'loadMoreBtn',
            'pokedexCount',
            'pageInfo',
            'paginationControls',
            'prevPageBtn',
            'nextPageBtn'
        ];

        commonElements.forEach(id => {
            this.get(id); // Lädt Element in Cache
        });
    }

    get(elementId) {
        // Prüfe zuerst den Cache
        if (this._cache.has(elementId)) {
            const cachedElement = this._cache.get(elementId);
            // Prüfe ob Element noch im DOM existiert
            if (document.contains(cachedElement)) {
                return cachedElement;
            } else {
                // Element wurde aus DOM entfernt, Cache aktualisieren
                this._cache.delete(elementId);
            }
        }

        // Element nicht im Cache oder nicht mehr im DOM, neu laden
        const element = document.getElementById(elementId);
        if (element) {
            this._cache.set(elementId, element);
        }
        return element;
    }

    // Hilfsmethoden für häufig verwendete Elemente
    getPokemonContainer() { return this.get('pokemonContainer'); }
    getSearchInput() { return this.get('searchInput'); }
    getSearchBtn() { return this.get('searchBtn'); }
    getSearchDropdown() { return this.get('searchDropdown'); }
    getPokemonOverlay() { return this.get('pokemonOverlay'); }
    getLoadMoreBtn() { return this.get('loadMoreBtn'); }

    // Cache leeren (für Tests oder bei größeren DOM-Änderungen)
    clearCache() {
        this._cache.clear();
        this.initializeCache();
    }

    // Cache-Status für Debugging
    getCacheInfo() {
        return {
            size: this._cache.size,
            keys: Array.from(this._cache.keys()),
            validElements: Array.from(this._cache.values()).filter(el => document.contains(el)).length
        };
    }
}

// Globale DOM-Cache Instanz
const domCache = new DOMCache();

// Für Kompatibilität: Globale Funktionen die den Cache nutzen
window.getElementById = (id) => domCache.get(id);

// Export für andere Module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { domCache, DOMCache };
}