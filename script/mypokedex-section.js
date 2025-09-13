// Team Modal Funktionalität
// Neue Modal-basierte Pokedex-Sektion

// Globale Funktion für Team Modal anzeigen
window.showTeamModal = function() {
  const teamModal = document.getElementById('teamModal');
  if (!teamModal || typeof bootstrap === 'undefined') {
    console.warn('Team Modal oder Bootstrap nicht verfügbar');
    return;
  }
  
  // Team-Übersicht rendern
  renderTeamOverview();
  
  // Modal anzeigen
  const modal = new bootstrap.Modal(teamModal);
  modal.show();
};

// Globale Funktion für Pokemon entfernen
window.removePokemonFromTeam = function(pokemonId) {
  console.log('removePokemonFromTeam aufgerufen mit ID:', pokemonId);
  
  if (!pokemonId) {
    console.error('Keine Pokemon ID übergeben');
    return;
  }
  
  if (!window.teamOffcanvas) {
    console.warn('Team Offcanvas nicht verfügbar');
    return;
  }
  
  // Bestätigung anfordern
  if (confirm('Möchtest du dieses Pokemon wirklich aus deinem Team entfernen?')) {
    try {
      // Pokemon aus dem Team entfernen
      console.log('Entferne Pokemon mit ID:', pokemonId);
      window.teamOffcanvas.removePokemonFromTeam(pokemonId);
      
      // Team-Ansichten aktualisieren
      const teamModal = document.getElementById('teamModal');
      const isModalOpen = teamModal && teamModal.classList.contains('show');
      
      if (isModalOpen) {
        // Modal ist offen - detaillierte Ansicht aktualisieren
        console.log('Aktualisiere detaillierte Team-Ansicht');
        showDetailedTeamView();
      }
      
      // Immer auch die normale Übersicht aktualisieren
      console.log('Aktualisiere Team-Übersicht');
      renderTeamOverview();
      
      // Toast-Benachrichtigung
      if (window.teamOffcanvas.showToast) {
        window.teamOffcanvas.showToast('Pokemon aus Team entfernt', 'warning');
      }
      
      console.log(`Pokemon ${pokemonId} wurde aus dem Team entfernt`);
    } catch (error) {
      console.error('Fehler beim Entfernen des Pokemon:', error);
    }
  }
};

// Globale Funktion für Team-Analyse (onclick Handler)
window.openTeamAnalysis = function() {
  console.log('openTeamAnalysis aufgerufen');
  
  // Überprüfe ob Team Analyzer verfügbar ist
  if (!window.pokemonTeamAnalyzer || typeof window.pokemonTeamAnalyzer.openTeamAnalysis !== 'function') {
    console.warn('Team Analyzer nicht verfügbar');
    alert('Team Analyzer wird noch geladen. Bitte warte einen Moment und versuche es erneut.');
    return;
  }
  
  // Prüfe ob Team vorhanden ist
  if (!window.teamOffcanvas) {
    console.warn('Team Offcanvas nicht verfügbar');
    alert('Team-System wird noch geladen. Bitte versuche es erneut.');
    return;
  }
  
  const team = window.teamOffcanvas.getTeam();
  if (team.length === 0) {
    alert('Füge erst Pokemon zu deinem Team hinzu, bevor du es analysieren kannst!');
    return;
  }
  
  try {
    // Schließe Team Modal falls offen und manage Focus korrekt
    const teamModal = document.getElementById('teamModal');
    const modal = bootstrap.Modal.getInstance(teamModal);
    if (modal) {
      // Focus vom Button entfernen vor dem Schließen
      const analyzeBtn = document.getElementById('analyzeTeamBtn');
      if (analyzeBtn) {
        analyzeBtn.blur();
      }
      
      // Modal schließen und Focus korrekt übergeben
      modal.hide();
      
      // Event Listener für korrektes Focus Management
      teamModal.addEventListener('hidden.bs.modal', function modalHiddenHandler() {
        // Event Listener nur einmal ausführen
        teamModal.removeEventListener('hidden.bs.modal', modalHiddenHandler);
        
        // Focus auf Body oder Main Element setzen
        document.body.focus();
        
        // Team-Analyse öffnen
        setTimeout(() => {
          window.pokemonTeamAnalyzer.openTeamAnalysis();
        }, 100);
      });
    } else {
      // Direkt öffnen wenn kein Modal offen ist
      window.pokemonTeamAnalyzer.openTeamAnalysis();
    }
    
    console.log('Team-Analyse wird geöffnet');
  } catch (error) {
    console.error('Fehler beim Öffnen des Team Analyzers:', error);
    alert('Fehler beim Öffnen der Team-Analyse. Bitte versuche es erneut.');
  }
};

// Team-Übersicht im Modal rendern
function renderTeamOverview() {
  const overview = document.getElementById('teamOverview');
  if (!overview) return;
  
  overview.innerHTML = '';
  
  // Überprüfe ob TeamOffcanvas verfügbar ist
  if (!window.teamOffcanvas) {
    overview.innerHTML = `
      <div class="col-12 text-center">
        <p class="text-muted">Team-System wird geladen...</p>
      </div>
    `;
    return;
  }
  
  const team = window.teamOffcanvas.getTeam();
  
  if (team.length === 0) {
    overview.classList.add('empty');
    return;
  }
  
  overview.classList.remove('empty');
  
  team.forEach((pokemon, index) => {
    const teamCard = document.createElement('div');
    teamCard.className = 'team-overview-card';
    
    // Primary type für CSS-Klassen
    const primaryType = pokemon.types[0];
    
    // Type badges erstellen
    const typeBadges = pokemon.types.map(type => 
      `<span class="badge type-badge type-${type}">${type}</span>`
    ).join('');
    
    teamCard.innerHTML = `
      <div class="pokemon-card type-${primaryType}">
        <button class="pokemon-remove-btn" data-pokemon-id="${pokemon.id}" title="Pokemon entfernen">
          ✕
        </button>
        <img src="${pokemon.image}" class="card-img-top pokemon-image" alt="${pokemon.name}" loading="lazy">
        <div class="card-body">
          <h6 class="card-title pokemon-name">${pokemon.name}</h6>
          <div class="pokemon-types">
            ${typeBadges}
          </div>
          <div class="team-position">
            <small>Position ${index + 1}</small>
          </div>
        </div>
      </div>
    `;
    
    overview.appendChild(teamCard);
  });
}

// Erweiterte Team-Ansicht für detaillierte Informationen
function showDetailedTeamView() {
  const overview = document.getElementById('teamOverview');
  if (!overview) return;
  
  overview.innerHTML = '';
  
  if (!window.teamOffcanvas) {
    overview.innerHTML = `<div class="alert alert-warning">Team-System wird geladen...</div>`;
    return;
  }
  
  const team = window.teamOffcanvas.getTeam();
  
  if (team.length === 0) {
    overview.innerHTML = `
      <div class="alert alert-info text-center">
        <i class="fas fa-info-circle me-2"></i>
        Dein Team ist noch leer. Ziehe Pokemon-Karten in das Offcanvas, um dein Team zusammenzustellen!
      </div>
    `;
    return;
  }
  
  // Erstelle erweiterte Team-Statistiken
  const teamStats = generateTeamStats(team);
  
  overview.innerHTML = `
    <div class="detailed-team-view">
      <!-- Team Statistiken -->
      <div class="team-stats mb-4">
        <div class="row g-3">
          <div class="col-md-4">
            <div class="stat-card">
              <div class="stat-icon">👥</div>
              <div class="stat-content">
                <div class="stat-number">${team.length}</div>
                <div class="stat-label">Team-Mitglieder</div>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="stat-card">
              <div class="stat-icon">⚡</div>
              <div class="stat-content">
                <div class="stat-number">${teamStats.uniqueTypes}</div>
                <div class="stat-label">Verschiedene Typen</div>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="stat-card">
              <div class="stat-icon">🎯</div>
              <div class="stat-content">
                <div class="stat-number">${teamStats.coverage}%</div>
                <div class="stat-label">Typ-Abdeckung</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Team Pokemon -->
      <div class="team-pokemon">
        <h6 class="mb-3"><i class="fas fa-users me-2"></i>Deine Pokemon</h6>
        <div class="row g-3">
          ${team.map((pokemon, index) => {
            const primaryType = pokemon.types[0];
            return `
            <div class="col-md-6 col-lg-4">
              <div class="detailed-pokemon-card pokemon-card type-${primaryType}">
                <button class="pokemon-remove-btn" data-pokemon-id="${pokemon.id}" title="Pokemon entfernen">
                  ✕
                </button>
                <img src="${pokemon.image}" class="card-img-top pokemon-image" alt="${pokemon.name}" loading="lazy">
                <div class="card-body">
                  <h6 class="card-title pokemon-name">${pokemon.name}</h6>
                  <div class="pokemon-types mb-2">
                    ${pokemon.types.map(type => `<span class="badge type-badge" style="background-color: var(--type-${type})">${type}</span>`).join('')}
                  </div>
                  <div class="pokemon-position">
                    <small><i class="fas fa-map-marker-alt me-1"></i>Position ${index + 1}</small>
                  </div>
                </div>
              </div>
            </div>
            `;
          }).join('')}
        </div>
      </div>
      
      <!-- Typ-Verteilung -->
      <div class="type-distribution mt-4">
        <h6 class="mb-3"><i class="fas fa-chart-pie me-2"></i>Typ-Verteilung</h6>
        <div class="type-breakdown">
          ${teamStats.typeBreakdown.map(([type, count]) => `
            <div class="type-stat">
              <span class="badge type-badge type-${type} me-2">${type}</span>
              <span class="type-count">${count}x</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// Hilfsfunktion für Team-Statistiken
function generateTeamStats(team) {
  const allTypes = team.flatMap(pokemon => pokemon.types);
  const typeCounts = {};
  
  allTypes.forEach(type => {
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });
  
  const uniqueTypes = Object.keys(typeCounts).length;
  const totalTypes = 18; // Anzahl aller Pokemon-Typen
  const coverage = Math.round((uniqueTypes / totalTypes) * 100);
  
  return {
    uniqueTypes,
    coverage,
    typeBreakdown: Object.entries(typeCounts).sort((a, b) => b[1] - a[1])
  };
}

// Event Listener für Modal Events
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded - Registering Team Modal Event Listeners');
  
  const teamModal = document.getElementById('teamModal');
  if (teamModal) {
    // Modal wird geöffnet - Team-Übersicht aktualisieren
    teamModal.addEventListener('show.bs.modal', () => {
      console.log('Team Modal opening - rendering team overview');
      renderTeamOverview();
    });
    
    // Modal geschlossen - eventuell Cleanup
    teamModal.addEventListener('hidden.bs.modal', () => {
      // Cleanup falls nötig
      console.log('Team Modal closed');
    });
  }
  
  // Event Listener für Action Buttons mit Delegation
  document.addEventListener('click', (event) => {
    // Team anzeigen Button
    if (event.target.id === 'showTeamBtn') {
      console.log('Show Team Button clicked');
      event.preventDefault();
      showDetailedTeamView();
    }
    
    // Team analysieren Button
    if (event.target.id === 'analyzeTeamBtn') {
      console.log('Analyze Team Button clicked');
      event.preventDefault();
      
      // Debug: Prüfe verfügbare Objekte
      console.log('window.pokemonTeamAnalyzer:', window.pokemonTeamAnalyzer);
      console.log('window.teamOffcanvas:', window.teamOffcanvas);
      
      // Überprüfe ob Team Analyzer verfügbar ist
      if (window.pokemonTeamAnalyzer && typeof window.pokemonTeamAnalyzer.openTeamAnalysis === 'function') {
        // Prüfe ob Team vorhanden ist
        const team = window.teamOffcanvas ? window.teamOffcanvas.getTeam() : [];
        if (team.length === 0) {
          alert('Füge erst Pokemon zu deinem Team hinzu, bevor du es analysieren kannst!');
          return;
        }
        
        // Schließe Team Modal zuerst
        const modal = bootstrap.Modal.getInstance(document.getElementById('teamModal'));
        if (modal) {
          modal.hide();
        }
        
        // Öffne Team Analyzer mit kurzer Verzögerung
        setTimeout(() => {
          try {
            window.pokemonTeamAnalyzer.openTeamAnalysis();
          } catch (error) {
            console.error('Fehler beim Öffnen des Team Analyzers:', error);
            alert('Fehler beim Öffnen der Team-Analyse. Bitte versuche es erneut.');
          }
        }, 300);
      } else {
        console.warn('Team Analyzer nicht verfügbar');
        alert('Team Analyzer wird noch geladen. Bitte warte einen Moment und versuche es erneut.');
      }
    }
    
    // Pokemon entfernen Button
    if (event.target.classList.contains('pokemon-remove-btn')) {
      console.log('Remove Pokemon Button clicked');
      event.preventDefault();
      const pokemonId = event.target.getAttribute('data-pokemon-id');
      if (pokemonId) {
        window.removePokemonFromTeam(parseInt(pokemonId));
      }
    }
  });
});

// Für Backwards-Kompatibilität: Dropdown Toggle Funktion (falls woanders verwendet)
window.toggleDropdown = function(dropdownId) {
  console.warn('toggleDropdown is deprecated. Use showTeamModal() instead.');
  showTeamModal();
};

// Legacy Counter Update (falls noch verwendet)
function updatePokedexCount() {
  const countElement = document.getElementById("pokedexCount");
  if (countElement && window.teamOffcanvas) {
    countElement.textContent = window.teamOffcanvas.getTeamSize();
  }
}