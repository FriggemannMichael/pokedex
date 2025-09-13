// Erweiterte Drag & Drop Funktionalität
function handlePokemonDragStart(event) {
  const pokemonCard = event.target.closest(".pokemon-card");
  if (!pokemonCard) return;

  const pokemonId = pokemonCard.dataset.pokemonId || pokemonCard.dataset.id;
  event.dataTransfer.setData("pokedex-card-id", pokemonId);
  event.dataTransfer.setData("text/plain", pokemonId);

  // Visuelles Feedback
  pokemonCard.style.opacity = "0.7";
  pokemonCard.classList.add("dragging");

  // WICHTIG: Offcanvas automatisch öffnen
  setTimeout(() => {
    if (window.teamOffcanvas) {
      window.teamOffcanvas.showOffcanvas();
    }
  }, 100);

  // Verwende das Original-Element als Drag-Image
  const rect = pokemonCard.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  event.dataTransfer.setDragImage(pokemonCard, centerX, centerY);
}

// Event Listener für Drag End
function handlePokemonDragEnd(event) {
  const pokemonCard = event.target.closest(".pokemon-card");
  if (pokemonCard) {
    pokemonCard.style.opacity = "1";
    pokemonCard.classList.remove("dragging");
  }
}

document.addEventListener("dragend", handlePokemonDragEnd);

// Drag & Drop für Pokemon Cards aktivieren
document.addEventListener("DOMContentLoaded", () => {
  // Aktiviere Drag für alle bestehenden Pokemon Cards
  enableDragForPokemonCards();

  // Observer für dynamisch hinzugefügte Cards
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const pokemonCards = node.querySelectorAll(".pokemon-card");
          pokemonCards.forEach(enableDragForCard);
        }
      });
    });
  });

  observer.observe(
    document.getElementById("pokemonContainer") || document.body,
    {
      childList: true,
      subtree: true,
    }
  );
});

function enableDragForPokemonCards() {
  const pokemonCards = document.querySelectorAll(".pokemon-card");
  pokemonCards.forEach(enableDragForCard);
}

function enableDragForCard(card) {
  if (!card.hasAttribute("draggable")) {
    card.setAttribute("draggable", "true");
    card.addEventListener("dragstart", handlePokemonDragStart);
  }
}
