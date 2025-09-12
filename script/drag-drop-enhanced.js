// Erweiterte Drag & Drop Funktionalität
function handlePokemonDragStart(event) {
    const pokemonCard = event.target.closest('.pokemon-card');
    if (!pokemonCard) return;
    
    const pokemonId = pokemonCard.dataset.pokemonId;
    event.dataTransfer.setData("pokedex-card-id", pokemonId);
    event.dataTransfer.setData("text/plain", pokemonId);
    
    // Visuelles Feedback
    pokemonCard.style.opacity = "0.7";
    pokemonCard.classList.add("dragging");
    
    // Drag-Image erstellen
    const dragImage = pokemonCard.cloneNode(true);
    dragImage.style.transform = "rotate(5deg) scale(0.8)";
    dragImage.style.opacity = "0.9";
    document.body.appendChild(dragImage);
    event.dataTransfer.setDragImage(dragImage, 50, 50);
    
    // Cleanup after drag start
    setTimeout(() => {
        document.body.removeChild(dragImage);
    }, 0);
}

// Event Listener für Drag End
document.addEventListener('dragend', (event) => {
    if (event.target.classList.contains('pokemon-card')) {
        event.target.style.opacity = "1";
        event.target.classList.remove("dragging");
    }
});

// Drag & Drop für Pokemon Cards aktivieren
document.addEventListener('DOMContentLoaded', () => {
    // Aktiviere Drag für alle bestehenden Pokemon Cards
    enableDragForPokemonCards();
    
    // Observer für dynamisch hinzugefügte Cards
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const pokemonCards = node.querySelectorAll('.pokemon-card');
                    pokemonCards.forEach(enableDragForCard);
                }
            });
        });
    });
    
    observer.observe(document.getElementById('pokemonContainer') || document.body, {
        childList: true,
        subtree: true
    });
});

function enableDragForPokemonCards() {
    const pokemonCards = document.querySelectorAll('.pokemon-card');
    pokemonCards.forEach(enableDragForCard);
}

function enableDragForCard(card) {
    if (!card.hasAttribute('draggable')) {
        card.setAttribute('draggable', 'true');
        card.addEventListener('dragstart', handlePokemonDragStart);
    }
}