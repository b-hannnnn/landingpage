const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.15,
    rootMargin: '0px 0px -12% 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

const fileInput = document.getElementById('outfitInput');
const moodInput = document.getElementById('moodInput');
const recommendBtn = document.getElementById('recommendBtn');
const previewImage = document.getElementById('previewImage');
const styleSummary = document.getElementById('styleSummary');
const recommendationsGrid = document.getElementById('recommendations');

const catalog = [
    {
        title: 'Husk Knit Jacket',
        description: 'A subtle structured layer that blends with earthy and natural tones.',
        tags: ['layer', 'earthy', 'work', 'minimal', 'city'],
        swatch: '#b59d71'
    },
    {
        title: 'Beige Weave Blouse',
        description: 'Light, refined, and easy to pair with both warm and soft palettes.',
        tags: ['soft', 'minimal', 'casual', 'warm', 'day'],
        swatch: '#d4b986'
    },
    {
        title: 'Cream Scarf',
        description: 'An elegant drape that warms cool looks and brightens muted outfits.',
        tags: ['elegant', 'soft', 'layer', 'evening', 'neutral'],
        swatch: '#f5eadc'
    },
    {
        title: 'Forest Husk Pants',
        description: 'Tailored comfort with a natural texture that grounds modern silhouettes.',
        tags: ['earthy', 'work', 'layer', 'outdoor', 'relaxed'],
        swatch: '#5d6a4e'
    },
    {
        title: 'Sunlit Wrap Dress',
        description: 'A lightweight dress with graceful movement and subtle durian-husk sheen.',
        tags: ['summer', 'evening', 'elegant', 'city', 'dressy'],
        swatch: '#dfe0ca'
    },
    {
        title: 'Soft Husk Tote',
        description: 'A refined accessory with structure and a quiet craftsmanship feel.',
        tags: ['accessory', 'minimal', 'travel', 'day', 'natural'],
        swatch: '#c2b294'
    }
];

const moodMap = {
    warm: ['warm', 'autumn', 'earthy', 'natural', 'cozy', 'rustic', 'vintage', 'beige'],
    elegant: ['elegant', 'evening', 'formal', 'luxury', 'dressy', 'glam'],
    minimal: ['minimal', 'clean', 'simpl', 'modern', 'soft', 'calm'],
    work: ['work', 'office', 'business', 'meeting', 'professional'],
    casual: ['casual', 'street', 'travel', 'holiday', 'weekend', 'relaxed'],
    bold: ['bold', 'colorful', 'contrast', 'bright', 'vibrant', 'statement']
};

const colorHints = {
    black: 'black',
    white: 'white',
    beige: 'beige',
    brown: 'brown',
    green: 'green',
    blue: 'blue',
    pink: 'pink',
    cream: 'cream'
};

function getKeywordsFromMood(text) {
    return text
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter(Boolean);
}

function findMatchingProducts(keywords) {
    const matches = catalog
        .map(item => {
            const score = item.tags.reduce((total, tag) => {
                return total + keywords.filter(k => tag.includes(k)).length;
            }, 0);
            return { item, score };
        })
        .filter(match => match.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(match => match.item);

    if (matches.length >= 3) {
        return matches.slice(0, 3);
    }

    const fallback = catalog.slice(0, 3);
    return matches.length ? [...matches, ...fallback].slice(0, 3) : fallback;
}

function buildSummary({ fileName, keywords }) {
    const phrase = keywords.length
        ? `Your mood is interpreted as ${keywords.join(', ')} — the AI emphasizes soft natural tones and balanced texture.`
        : 'The AI assistant will lean into calm, durian-husk elegance and modern comfort.';

    const photoNote = fileName
        ? `Based on your uploaded piece (${fileName}), the suggestion is designed to layer with ease and bring quiet sophistication.`
        : 'Provide a photo and a few mood words to make the recommendation even more precise.';

    return `${phrase} ${photoNote}`;
}

function updatePreview(file) {
    previewImage.innerHTML = '';
    previewImage.classList.toggle('has-photo', Boolean(file));

    if (!file) {
        previewImage.textContent = 'Your uploaded outfit preview';
        return;
    }

    const preview = document.createElement('img');
    preview.src = URL.createObjectURL(file);
    preview.alt = 'Uploaded outfit preview';
    preview.onload = () => URL.revokeObjectURL(preview.src);
    previewImage.appendChild(preview);
}

function populateRecommendations(items) {
    recommendationsGrid.innerHTML = items
        .map(product => `
            <article class="product-card">
                <div class="product-swatch" style="background: ${product.swatch};"></div>
                <h3>${product.title}</h3>
                <p>${product.description}</p>
            </article>
        `)
        .join('');
}

fileInput.addEventListener('change', event => {
    const file = event.target.files[0];
    updatePreview(file);
});

recommendBtn.addEventListener('click', async () => {
    const moodText = moodInput.value.trim();
    const file = fileInput.files[0];

    if (!file && !moodText) {
        styleSummary.textContent = 'Upload a photo or tell the AI your mood, and the assistant will recommend a matching durian-husk outfit.';
        return;
    }

    recommendBtn.disabled = true;
    recommendBtn.textContent = 'Styling your look...';

    const keywords = getKeywordsFromMood(moodText);
    const colorKeywords = Object.keys(colorHints).filter(color => moodText.toLowerCase().includes(color));
    const fileKeywords = file ? getKeywordsFromMood(file.name) : [];
    const combinedKeywords = [...new Set([...keywords, ...fileKeywords, ...colorKeywords])];

    await new Promise(resolve => setTimeout(resolve, 1100));

    const matches = findMatchingProducts(combinedKeywords);
    const summary = buildSummary({ fileName: file ? file.name : null, keywords: combinedKeywords });

    styleSummary.textContent = summary;
    populateRecommendations(matches);

    recommendBtn.disabled = false;
    recommendBtn.textContent = 'Generate AI Match';
});

// Initialize with default cards
populateRecommendations(catalog.slice(0, 3));

function toggleMenu() {
    document.body.classList.toggle('menu-open');
}
