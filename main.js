let loadedCount = 0;

async function loadAllScripts(scripts) {
    for (const path of scripts) {
        await loadScript(path);
    }
    startApp();
}

function loadScript(path) {
    return new Promise((resolve, reject) => {
        if (isAlreadyLoaded(path)) {
            resolve();
            return;
        }

        const script = createScriptElement(path);
        script.onload = () => {
            loadedCount++;
            resolve();
        };
        script.onerror = () => reject(new Error(`Failed to load ${path}`));

        document.head.appendChild(script);
    });
}

function isAlreadyLoaded(path) {
    return Boolean(document.querySelector(`script[src="${path}"]`));
}

function createScriptElement(path) {
    const script = document.createElement('script');
    script.src = path;
    return script;
}

function startApp() {
    setTimeout(() => {
        if (typeof initializeApp === 'function') {
            initializeApp();
        } else {
            showError();
        }
    }, 100);
}

function showError() {
    const container = document.getElementById('pokemonContainer') || document.body;
    container.innerHTML = `
        <div class="error-container text-center py-5">
            <h2>App Loading Failed</h2>
            <p>Could not initialize the Pokemon app.</p>
            <button class="btn btn-primary" onclick="window.location.reload()">
                Reload Page
            </button>
        </div>
    `;
}

function startPokemonApp() {
    const scripts = [
        './script/api.js',
        './script/template.js',
        './script/pokemon-core.js',
        './script/navigation.js',
        './script/search.js',
        './script/pokemon-detail.js',
        './script/pokemon-modal.js',
        './script/pokemon-ui.js'
        
    ];

    loadAllScripts(scripts).catch(error => {
        console.error('Script loading failed:', error);
        showError();
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startPokemonApp);
} else {
    startPokemonApp();
}
