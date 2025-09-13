class TeamOffcanvas {
  constructor() {
    this.maxTeamSize = 6;
    this.team = [];
    this.offcanvasElement = document.getElementById('teamOffcanvas');
    this.dropZone = document.getElementById('teamDropZone');
    this.cardsContainer = document.getElementById('teamCardsContainer');
    this.teamCounter = document.getElementById('teamCounter');
    this.pokedexCounter = document.getElementById('pokedexCount');
    
    this.initializeOffcanvas();
    this.setupEventListeners();
    this.loadTeamFromStorage();
  }
  
  initializeOffcanvas() {
    if (this.offcanvasElement && typeof bootstrap !== 'undefined') {
      this.offcanvas = new bootstrap.Offcanvas(this.offcanvasElement);
    }
  }
  
  setupEventListeners() {
    if (!this.dropZone) return;
    
    // Drop-Zone Events
    this.dropZone.addEventListener('dragover', this.handleDragOver.bind(this));
    this.dropZone.addEventListener('dragleave', this.handleDragLeave.bind(this));
    this.dropZone.addEventListener('drop', this.handleDrop.bind(this));
    
    // Offcanvas Events
    if (this.offcanvasElement) {
      this.offcanvasElement.addEventListener('hidden.bs.offcanvas', () => {
        this.saveTeamToStorage();
      });
    }
  }
  
  showOffcanvas() {
    if (this.offcanvas) {
      this.offcanvas.show();
    }
  }
  
  hideOffcanvas() {
    if (this.offcanvas) {
      this.offcanvas.hide();
    }
  }
  
  handleDragOver(e) {
    e.preventDefault();
    this.dropZone.classList.add('drag-over');
  }
  
  handleDragLeave(e) {
    if (!this.dropZone.contains(e.relatedTarget)) {
      this.dropZone.classList.remove('drag-over');
    }
  }
  
  handleDrop(e) {
    e.preventDefault();
    this.dropZone.classList.remove('drag-over');
    
    const pokemonId = e.dataTransfer.getData('pokedex-card-id');
    if (pokemonId) {
      this.addPokemonToTeam(pokemonId);
    }
  }
  
  addPokemonToTeam(pokemonId) {
    // Validierungen
    if (this.team.length >= this.maxTeamSize) {
      this.showToast('Team ist bereits voll! (6/6)', 'warning');
      return false;
    }
    
    if (this.isPokemonInTeam(pokemonId)) {
      this.showToast('Dieses Pokemon ist bereits in deinem Team!', 'warning');
      return false;
    }
    
    // Pokemon-Daten abrufen
    const pokemonData = this.getPokemonData(pokemonId);
    if (!pokemonData) {
      this.showToast('Pokemon-Daten konnten nicht geladen werden.', 'error');
      return false;
    }
    
    // Zum Team hinzufügen
    this.team.push(pokemonData);
    this.renderMiniCard(pokemonData);
    this.updateCounters();
    this.updateDropPlaceholder();
    this.saveTeamToStorage();
    
    this.showToast(`${pokemonData.name} wurde zum Team hinzugefügt!`, 'success');
    return true;
  }
  
  renderMiniCard(pokemon) {
    const miniCard = document.createElement('div');
    miniCard.className = 'mini-pokemon-card new-card';
    miniCard.dataset.pokemonId = pokemon.id;
    
    // Type badges erstellen
    const typeBadges = pokemon.types.map(type => 
      `<span class="type-badge type-${type}">${type}</span>`
    ).join('');
    
    miniCard.innerHTML = `
      <button class="remove-btn" onclick="teamOffcanvas.removePokemonFromTeam('${pokemon.id}')">
        <i class="fas fa-times"></i>
      </button>
      <img src="${pokemon.image}" alt="${pokemon.name}" loading="lazy">
      <div class="pokemon-name">${pokemon.name}</div>
      <div class="pokemon-types">${typeBadges}</div>
    `;
    
    this.cardsContainer.appendChild(miniCard);
    
    // Animation-Klasse nach Animation entfernen
    setTimeout(() => {
      miniCard.classList.remove('new-card');
    }, 500);
  }
  
  removePokemonFromTeam(pokemonId) {
    const pokemonIndex = this.team.findIndex(p => p.id === pokemonId);
    if (pokemonIndex === -1) return;
    
    const pokemonName = this.team[pokemonIndex].name;
    this.team.splice(pokemonIndex, 1);
    
    const miniCard = this.cardsContainer.querySelector(`[data-pokemon-id="${pokemonId}"]`);
    if (miniCard) {
      miniCard.style.animation = 'fadeInUp 0.3s ease reverse';
      setTimeout(() => {
        miniCard.remove();
      }, 300);
    }
    
    this.updateCounters();
    this.updateDropPlaceholder();
    this.saveTeamToStorage();
    
    // Team Modal auch aktualisieren falls es offen ist
    try {
      const teamModal = document.getElementById('teamModal');
      if (teamModal && teamModal.classList.contains('show')) {
        console.log('Team Modal ist offen - aktualisiere Ansicht');
        // Überprüfe ob die globale Funktion existiert
        if (typeof window.showDetailedTeamView === 'function') {
          window.showDetailedTeamView();
        } else if (typeof showDetailedTeamView === 'function') {
          showDetailedTeamView();
        }
      }
      
      // Normale Team-Übersicht auch aktualisieren
      if (typeof window.renderTeamOverview === 'function') {
        window.renderTeamOverview();
      } else if (typeof renderTeamOverview === 'function') {
        renderTeamOverview();
      }
    } catch (error) {
      console.warn('Fehler beim Aktualisieren des Team Modals:', error);
    }
    
    this.showToast(`${pokemonName} wurde aus dem Team entfernt.`, 'info');
  }
  
  clearTeam() {
    this.team = [];
    this.cardsContainer.innerHTML = '';
    this.updateCounters();
    this.updateDropPlaceholder();
    this.saveTeamToStorage();
    this.showToast('Team wurde geleert.', 'info');
  }
  
  updateCounters() {
    const count = this.team.length;
    
    // Team Counter (Offcanvas)
    if (this.teamCounter) {
      this.teamCounter.textContent = `${count}/6`;
      this.teamCounter.classList.toggle('full', count >= this.maxTeamSize);
    }
    
    // Pokedex Counter (Button)
    if (this.pokedexCounter) {
      this.pokedexCounter.textContent = count;
    }
  }
  
  updateDropPlaceholder() {
    const placeholder = this.dropZone?.querySelector('.drop-placeholder');
    if (placeholder) {
      placeholder.style.display = this.team.length > 0 ? 'none' : 'block';
    }
  }
  
  isPokemonInTeam(pokemonId) {
    return this.team.some(p => p.id === pokemonId);
  }
  
  getPokemonData(pokemonId) {
    // Versuche Pokemon-Daten aus verschiedenen Quellen zu holen
    let pokemonCard = document.querySelector(`[data-pokemon-id="${pokemonId}"]`);
    if (!pokemonCard) {
      pokemonCard = document.querySelector(`[data-id="${pokemonId}"]`);
    }
    
    if (!pokemonCard) {
      console.warn('Pokemon card not found for ID:', pokemonId);
      return null;
    }
    
    // Name extrahieren
    const nameElement = pokemonCard.querySelector('.pokemon-name, .card-title');
    const name = nameElement ? nameElement.textContent.trim() : 'Unknown';
    
    // Bild extrahieren
    const imgElement = pokemonCard.querySelector('img');
    const image = imgElement ? imgElement.src : '';
    
    // Typen extrahieren
    const typeElements = pokemonCard.querySelectorAll('.type, .pokemon-type, [class*="type-"]');
    const types = Array.from(typeElements).map(t => 
      t.textContent.trim().toLowerCase()
    ).filter(t => t && t !== '');
    
    return {
      id: pokemonId,
      name: name,
      image: image,
      types: types.length > 0 ? types : ['normal']
    };
  }
  
  getTeam() {
    return [...this.team];
  }
  
  getTeamSize() {
    return this.team.length;
  }
  
  isTeamFull() {
    return this.team.length >= this.maxTeamSize;
  }
  
  // Local Storage Funktionen
  saveTeamToStorage() {
    try {
      localStorage.setItem('pokemonTeam', JSON.stringify(this.team));
    } catch (e) {
      console.warn('Could not save team to localStorage:', e);
    }
  }
  
  loadTeamFromStorage() {
    try {
      const savedTeam = localStorage.getItem('pokemonTeam');
      if (savedTeam) {
        this.team = JSON.parse(savedTeam);
        this.renderAllMiniCards();
        this.updateCounters();
        this.updateDropPlaceholder();
      }
    } catch (e) {
      console.warn('Could not load team from localStorage:', e);
      this.team = [];
    }
  }
  
  renderAllMiniCards() {
    this.cardsContainer.innerHTML = '';
    this.team.forEach(pokemon => {
      this.renderMiniCard(pokemon);
    });
  }
  
  // Toast-Benachrichtigungen
  showToast(message, type = 'info') {
    // Überprüfe ob Bootstrap Toast verfügbar ist
    if (typeof bootstrap === 'undefined') {
      console.log(`${type.toUpperCase()}: ${message}`);
      return;
    }
    
    // Erstelle Toast Container falls nicht vorhanden
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }
    
    // Toast Element erstellen
    const toastEl = document.createElement('div');
    toastEl.className = `toast toast-${type}`;
    toastEl.setAttribute('role', 'alert');
    toastEl.innerHTML = `
      <div class="toast-header">
        <strong class="me-auto">
          ${type === 'success' ? '✅' : type === 'warning' ? '⚠️' : type === 'error' ? '❌' : 'ℹ️'} 
          Pokemon Team
        </strong>
        <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
      </div>
      <div class="toast-body">
        ${message}
      </div>
    `;
    
    toastContainer.appendChild(toastEl);
    
    // Toast anzeigen
    const toast = new bootstrap.Toast(toastEl, {
      autohide: true,
      delay: type === 'error' ? 5000 : 3000
    });
    
    toast.show();
    
    // Toast nach dem Ausblenden entfernen
    toastEl.addEventListener('hidden.bs.toast', () => {
      toastEl.remove();
    });
  }
}

// Globale Instanz erstellen (nach DOM geladen)
let teamOffcanvas;

document.addEventListener('DOMContentLoaded', () => {
  teamOffcanvas = new TeamOffcanvas();
  
  // Global verfügbar machen für onclick Handler
  window.teamOffcanvas = teamOffcanvas;
});

// Für den Fall, dass das Skript nach DOM-Load eingebunden wird
if (document.readyState === 'loading') {
  // Do nothing, DOMContentLoaded will fire
} else {
  // DOM is already loaded
  if (!teamOffcanvas) {
    teamOffcanvas = new TeamOffcanvas();
    window.teamOffcanvas = teamOffcanvas;
  }
}