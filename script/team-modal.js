// Erweitertes Modal-System für Team-Pokemon
class PokemonTeamModal {
    constructor() {
        this.currentTeam = [];
        this.currentIndex = 0;
        this.init();
    }

    init() {
        this.createTeamModal();
        this.attachEventListeners();
        this.addTeamViewButton();
    }

    createTeamModal() {
        const modalHTML = `
            <div id="pokemonTeamModal" class="modal fade" tabindex="-1">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">🎯 Mein Pokemon-Team</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div id="teamModalContent">
                                <!-- Team Content wird hier geladen -->
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Schließen</button>
                            <button type="button" class="btn btn-primary" id="analyzeTeamBtn">Team analysieren</button>
                            <button type="button" class="btn btn-success" id="exportTeamBtn">Team exportieren</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    addTeamViewButton() {
        const dropPoint = document.querySelector('.drop-point');
        if (!dropPoint) return;

        const viewButton = document.createElement('button');
        viewButton.className = 'btn btn-primary mt-2 w-100';
        viewButton.innerHTML = '🎯 Team anzeigen';
        viewButton.addEventListener('click', () => this.openTeamModal());

        dropPoint.appendChild(viewButton);
    }

    attachEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.id === 'analyzeTeamBtn') {
                this.analyzeCurrentTeam();
            }
            if (e.target.id === 'exportTeamBtn') {
                this.exportTeam();
            }
            if (e.target.classList.contains('team-pokemon-detail-btn')) {
                const pokemonId = parseInt(e.target.dataset.pokemonId);
                this.showPokemonDetail(pokemonId);
            }
            if (e.target.classList.contains('team-pokemon-remove-btn')) {
                const pokemonId = parseInt(e.target.dataset.pokemonId);
                this.removePokemonFromTeam(pokemonId);
            }
        });
    }

    openTeamModal() {
        this.currentTeam = this.getCurrentTeam();
        
        if (this.currentTeam.length === 0) {
            alert('Dein Team ist leer! Füge Pokemon hinzu, indem du sie auf den Button ziehst.');
            return;
        }

        this.renderTeamModal();
        
        const modal = document.getElementById('pokemonTeamModal');
        const bootstrap_modal = new bootstrap.Modal(modal);
        bootstrap_modal.show();
    }

    getCurrentTeam() {
        const dropPoint = document.querySelector('.drop-point');
        if (!dropPoint) return [];

        const pokemonCards = dropPoint.querySelectorAll('.pokemon-card');
        const team = [];

        pokemonCards.forEach(card => {
            const pokemonData = this.extractPokemonData(card);
            if (pokemonData) {
                team.push(pokemonData);
            }
        });

        return team;
    }

    extractPokemonData(card) {
        const id = parseInt(card.dataset.pokemonId || card.dataset.id);
        const name = card.querySelector('.pokemon-name')?.textContent || '';
        const number = card.querySelector('.pokemon-number')?.textContent || '';
        const image = card.querySelector('.pokemon-image')?.src || '';
        const typeElements = card.querySelectorAll('.type-badge, .pokemon-types span');
        const types = Array.from(typeElements).map(el => 
            el.textContent.toLowerCase().replace(/[^\w]/g, '')
        ).filter(type => type.length > 0);

        // Pokemon Go Features
        const isFavorite = window.pokemonGoFeatures?.isFavorite(id) || false;
        const rating = window.pokemonGoFeatures?.getRating(id) || 0;
        const note = window.pokemonGoFeatures?.getNote(id) || '';

        if (id && name && types.length > 0) {
            return {
                id,
                name,
                number,
                image,
                types,
                isFavorite,
                rating,
                note
            };
        }

        return null;
    }

    renderTeamModal() {
        const content = document.getElementById('teamModalContent');
        content.innerHTML = this.createTeamModalContent();
    }

    createTeamModalContent() {
        const teamStats = this.calculateTeamStats();
        
        return `
            <div class="team-modal-container">
                ${this.createTeamStatsHTML(teamStats)}
                ${this.createTeamGridHTML()}
                ${this.createTeamActionsHTML()}
            </div>
        `;
    }

    calculateTeamStats() {
        const totalPokemon = this.currentTeam.length;
        const uniqueTypes = new Set();
        let totalRating = 0;
        let favoritesCount = 0;

        this.currentTeam.forEach(pokemon => {
            pokemon.types.forEach(type => uniqueTypes.add(type));
            totalRating += pokemon.rating;
            if (pokemon.isFavorite) favoritesCount++;
        });

        return {
            totalPokemon,
            uniqueTypes: uniqueTypes.size,
            averageRating: totalPokemon > 0 ? (totalRating / totalPokemon).toFixed(1) : 0,
            favoritesCount,
            typeDistribution: Array.from(uniqueTypes)
        };
    }

    createTeamStatsHTML(stats) {
        return `
            <div class="team-stats-overview">
                <div class="stat-card">
                    <div class="stat-number">${stats.totalPokemon}</div>
                    <div class="stat-label">Pokemon</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.uniqueTypes}</div>
                    <div class="stat-label">Verschiedene Typen</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.averageRating}</div>
                    <div class="stat-label">⭐ Durchschnitt</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.favoritesCount}</div>
                    <div class="stat-label">❤️ Favoriten</div>
                </div>
            </div>
        `;
    }

    createTeamGridHTML() {
        const teamCards = this.currentTeam.map((pokemon, index) => 
            this.createTeamPokemonCard(pokemon, index)
        ).join('');

        return `
            <div class="team-pokemon-grid">
                ${teamCards}
            </div>
        `;
    }

    createTeamPokemonCard(pokemon, index) {
        const ratingStars = this.createRatingStars(pokemon.rating);
        const favoriteIcon = pokemon.isFavorite ? '❤️' : '🤍';
        
        return `
            <div class="team-pokemon-card" data-pokemon-id="${pokemon.id}">
                <div class="team-pokemon-header">
                    <span class="team-position">#${index + 1}</span>
                    <span class="favorite-indicator">${favoriteIcon}</span>
                </div>
                <div class="team-pokemon-image">
                    <img src="${pokemon.image}" alt="${pokemon.name}" loading="lazy">
                </div>
                <div class="team-pokemon-info">
                    <h6 class="team-pokemon-name">${pokemon.name}</h6>
                    <div class="team-pokemon-number">${pokemon.number}</div>
                    <div class="team-pokemon-types">
                        ${pokemon.types.map(type => 
                            `<span class="type-badge type-${type}">${type.toUpperCase()}</span>`
                        ).join('')}
                    </div>
                    <div class="team-pokemon-rating">${ratingStars}</div>
                    ${pokemon.note ? `<div class="team-pokemon-note">"${pokemon.note}"</div>` : ''}
                </div>
                <div class="team-pokemon-actions">
                    <button class="btn btn-sm btn-outline-info team-pokemon-detail-btn" data-pokemon-id="${pokemon.id}">
                        Details
                    </button>
                    <button class="btn btn-sm btn-outline-danger team-pokemon-remove-btn" data-pokemon-id="${pokemon.id}">
                        Entfernen
                    </button>
                </div>
            </div>
        `;
    }

    createTeamActionsHTML() {
        return `
            <div class="team-actions-section">
                <h6>Team-Aktionen</h6>
                <div class="team-actions-grid">
                    <button class="btn btn-outline-primary" onclick="window.pokemonTeamModal.shuffleTeam()">
                        🔄 Team mischen
                    </button>
                    <button class="btn btn-outline-warning" onclick="window.pokemonTeamModal.clearNonFavorites()">
                        🧹 Nicht-Favoriten entfernen
                    </button>
                    <button class="btn btn-outline-success" onclick="window.pokemonTeamModal.shareTeam()">
                        📤 Team teilen
                    </button>
                    <button class="btn btn-outline-info" onclick="window.pokemonTeamModal.saveTeamPreset()">
                        💾 Als Preset speichern
                    </button>
                </div>
            </div>
        `;
    }

    createRatingStars(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += i <= rating ? '⭐' : '☆';
        }
        return stars;
    }

    showPokemonDetail(pokemonId) {
        // Nutze das bestehende Pokemon-Detail-Modal
        const pokemon = this.currentTeam.find(p => p.id === pokemonId);
        if (pokemon && typeof openPokemonDetail === 'function') {
            openPokemonDetail(pokemon);
        }
    }

    removePokemonFromTeam(pokemonId) {
        if (confirm('Pokemon aus dem Team entfernen?')) {
            // Entferne aus dem DOM
            const dropPoint = document.querySelector('.drop-point');
            const pokemonCard = dropPoint.querySelector(`[data-pokemon-id="${pokemonId}"]`);
            if (pokemonCard) {
                pokemonCard.remove();
                // Aktualisiere Counter
                if (typeof updatePokedexCount === 'function') {
                    updatePokedexCount();
                }
            }

            // Aktualisiere Team-Ansicht
            this.currentTeam = this.currentTeam.filter(p => p.id !== pokemonId);
            this.renderTeamModal();
        }
    }

    analyzeCurrentTeam() {
        const modal = document.getElementById('pokemonTeamModal');
        const bootstrap_modal = bootstrap.Modal.getInstance(modal);
        bootstrap_modal.hide();
        
        // Öffne Team-Analyse
        setTimeout(() => {
            if (window.pokemonTeamAnalyzer) {
                window.pokemonTeamAnalyzer.openTeamAnalysis();
            }
        }, 300);
    }

    exportTeam() {
        const teamData = {
            exported: new Date().toISOString(),
            team: this.currentTeam.map(pokemon => ({
                id: pokemon.id,
                name: pokemon.name,
                types: pokemon.types,
                rating: pokemon.rating,
                isFavorite: pokemon.isFavorite,
                note: pokemon.note
            }))
        };

        const dataStr = JSON.stringify(teamData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `pokemon-team-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(link.href);
    }

    shuffleTeam() {
        // Mische die Reihenfolge der Pokemon im Team
        const dropPoint = document.querySelector('.drop-point');
        const pokemonCards = Array.from(dropPoint.querySelectorAll('.pokemon-card'));
        
        // Fisher-Yates Shuffle
        for (let i = pokemonCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pokemonCards[i], pokemonCards[j]] = [pokemonCards[j], pokemonCards[i]];
        }
        
        // Entferne alle Cards und füge sie in neuer Reihenfolge hinzu
        pokemonCards.forEach(card => card.remove());
        pokemonCards.forEach(card => dropPoint.appendChild(card));
        
        // Aktualisiere Modal
        this.currentTeam = this.getCurrentTeam();
        this.renderTeamModal();
    }

    clearNonFavorites() {
        if (confirm('Alle Nicht-Favoriten aus dem Team entfernen?')) {
            const dropPoint = document.querySelector('.drop-point');
            const pokemonCards = dropPoint.querySelectorAll('.pokemon-card');
            
            pokemonCards.forEach(card => {
                const pokemonId = parseInt(card.dataset.pokemonId);
                if (!window.pokemonGoFeatures?.isFavorite(pokemonId)) {
                    card.remove();
                }
            });
            
            // Aktualisiere Counter und Modal
            if (typeof updatePokedexCount === 'function') {
                updatePokedexCount();
            }
            
            this.currentTeam = this.getCurrentTeam();
            this.renderTeamModal();
        }
    }

    shareTeam() {
        const teamText = `Mein Pokemon-Team:\\n${this.currentTeam.map((pokemon, i) => 
            `${i + 1}. ${pokemon.name} (${pokemon.types.join('/')})${pokemon.rating > 0 ? ` - ${pokemon.rating}⭐` : ''}`
        ).join('\\n')}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Mein Pokemon-Team',
                text: teamText
            });
        } else {
            navigator.clipboard.writeText(teamText).then(() => {
                alert('Team in die Zwischenablage kopiert!');
            });
        }
    }

    saveTeamPreset() {
        const presetName = prompt('Name für das Team-Preset:');
        if (!presetName) return;
        
        const presets = JSON.parse(localStorage.getItem('pokemonTeamPresets') || '[]');
        const newPreset = {
            name: presetName,
            created: new Date().toISOString(),
            team: this.currentTeam.map(pokemon => ({
                id: pokemon.id,
                name: pokemon.name,
                types: pokemon.types
            }))
        };
        
        presets.push(newPreset);
        localStorage.setItem('pokemonTeamPresets', JSON.stringify(presets));
        
        alert(`Team-Preset "${presetName}" gespeichert!`);
    }
}

// Globale Instanz
window.pokemonTeamModal = new PokemonTeamModal();