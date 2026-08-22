// Dashboard Application State
let problems = [];
let selectedDifficulties = new Set(['Easy', 'Medium', 'Hard']);
let selectedTopics = new Set();
let searchQuery = '';
let sortBy = 'number-asc';

// DOM Elements
const problemsGrid = document.getElementById('problems-grid');
const searchInput = document.getElementById('search-input');
const topicsListContainer = document.getElementById('topics-list');
const activeFiltersBar = document.getElementById('active-filters-bar');
const sortSelect = document.getElementById('sort-select');
const emptyState = document.getElementById('empty-state');
const showingCountEl = document.getElementById('showing-count');

// Stats Elements
const totalCountEl = document.getElementById('total-count');
const easyCountEl = document.getElementById('easy-count');
const mediumCountEl = document.getElementById('medium-count');
const hardCountEl = document.getElementById('hard-count');

// Modal Elements
const modal = document.getElementById('solution-modal');
const modalTitle = document.getElementById('modal-title');
const modalDifficulty = document.getElementById('modal-difficulty');
const modalTopics = document.getElementById('modal-topics');
const modalDescription = document.getElementById('modal-description');
const modalLeetCodeLink = document.getElementById('modal-leetcode-link');
const modalCode = document.getElementById('modal-code');
const modalCloseBtn = document.getElementById('modal-close-btn');
const copyCodeBtn = document.getElementById('copy-code-btn');

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    fetchSolutions();
    setupEventListeners();
});

// Fetch data from solutions.json
async function fetchSolutions() {
    try {
        const response = await fetch('solutions.json');
        if (!response.ok) {
            throw new Error(`Failed to load solutions.json: ${response.status}`);
        }
        problems = await response.json();
        
        calculateStats();
        populateTopicsList();
        renderDashboard();
    } catch (error) {
        console.error('Error fetching solutions:', error);
        problemsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; background: var(--bg-card); border-radius: 16px; border: 1px solid var(--border-color)">
                <p style="color: var(--color-hard); font-weight: 600; font-size: 1.1rem;">Failed to load solutions database.</p>
                <p style="color: var(--text-secondary); margin-top: 0.5rem;">Please check if solutions.json is correctly generated.</p>
            </div>
        `;
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Search Input
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        renderDashboard();
    });

    // Difficulty Filters
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const diff = btn.dataset.diff;
            if (selectedDifficulties.has(diff)) {
                // Keep at least one difficulty active, or toggle off if others are active
                if (selectedDifficulties.size > 1) {
                    selectedDifficulties.delete(diff);
                    btn.classList.remove('active');
                }
            } else {
                selectedDifficulties.add(diff);
                btn.classList.add('active');
            }
            renderDashboard();
        });
    });

    // Sorting Dropdown
    sortSelect.addEventListener('change', (e) => {
        sortBy = e.target.value;
        renderDashboard();
    });

    // Modal Close
    modalCloseBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Copy Code Button
    copyCodeBtn.addEventListener('click', copyCodeToClipboard);

    // Escape Key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('open')) {
            closeModal();
        }
    });
}

// Calculate progress statistics
function calculateStats() {
    totalCountEl.textContent = problems.length;
    
    const easy = problems.filter(p => p.difficulty === 'Easy').length;
    const medium = problems.filter(p => p.difficulty === 'Medium').length;
    const hard = problems.filter(p => p.difficulty === 'Hard').length;
    
    easyCountEl.textContent = easy;
    mediumCountEl.textContent = medium;
    hardCountEl.textContent = hard;
}

// Populate Topics List in sidebar
function populateTopicsList() {
    const topicsMap = {};
    problems.forEach(p => {
        if (p.topics && Array.isArray(p.topics)) {
            p.topics.forEach(t => {
                topicsMap[t] = (topicsMap[t] || 0) + 1;
            });
        }
    });

    // Sort topics alphabetically
    const sortedTopics = Object.keys(topicsMap).sort();
    
    topicsListContainer.innerHTML = '';
    sortedTopics.forEach(topic => {
        const count = topicsMap[topic];
        const tag = document.createElement('span');
        tag.className = 'topic-tag';
        tag.textContent = `${topic} (${count})`;
        tag.dataset.topic = topic;
        
        tag.addEventListener('click', () => {
            if (selectedTopics.has(topic)) {
                selectedTopics.delete(topic);
                tag.classList.remove('active');
            } else {
                selectedTopics.add(topic);
                tag.classList.add('active');
            }
            renderDashboard();
        });
        
        topicsListContainer.appendChild(tag);
    });
}

// Main render function
function renderDashboard() {
    // Filter problems
    let filtered = problems.filter(p => {
        // Difficulty filter
        if (!selectedDifficulties.has(p.difficulty)) return false;
        
        // Topic filter: problem must contain at least one of the selected topics
        if (selectedTopics.size > 0) {
            const hasTopic = p.topics.some(t => selectedTopics.has(t));
            if (!hasTopic) return false;
        }
        
        // Search filter
        if (searchQuery) {
            const numStr = p.number ? p.number.toString() : '';
            const inTitle = p.title.toLowerCase().includes(searchQuery);
            const inNum = numStr.includes(searchQuery);
            const inDesc = p.description.toLowerCase().includes(searchQuery);
            if (!inTitle && !inNum && !inDesc) return false;
        }
        
        return true;
    });

    // Sort problems
    filtered.sort((a, b) => {
        if (sortBy === 'number-asc') {
            return (a.number || 99999) - (b.number || 99999);
        } else if (sortBy === 'number-desc') {
            return (b.number || 0) - (a.number || 0);
        } else if (sortBy === 'name-asc') {
            return a.title.localeCompare(b.title);
        } else if (sortBy === 'difficulty-asc') {
            const levels = { 'Easy': 1, 'Medium': 2, 'Hard': 3, 'Unknown': 4 };
            return levels[a.difficulty] - levels[b.difficulty];
        }
        return 0;
    });

    // Update Showing Count
    showingCountEl.textContent = filtered.length;

    // Render Cards
    renderCards(filtered);
    
    // Render Active Filters Bar
    renderActiveFilters();

    // Initialize/Refresh Lucide Icons
    lucide.createIcons();
}

// Render dynamic cards grid
function renderCards(list) {
    problemsGrid.innerHTML = '';
    
    if (list.length === 0) {
        emptyState.style.display = 'flex';
        problemsGrid.style.display = 'none';
        return;
    }
    
    emptyState.style.display = 'none';
    problemsGrid.style.display = 'grid';

    list.forEach(p => {
        const card = document.createElement('div');
        card.className = `problem-card ${p.difficulty.toLowerCase()}-card`;
        
        // Card tags
        let tagsHtml = '';
        if (p.topics && p.topics.length > 0) {
            tagsHtml = `
                <div class="card-tags">
                    ${p.topics.slice(0, 3).map(t => `<span class="card-tag">${t}</span>`).join('')}
                    ${p.topics.length > 3 ? `<span class="card-tag">+${p.topics.length - 3}</span>` : ''}
                </div>
            `;
        }

        // Snippet description (strip html tags for card display)
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = p.description;
        const textContent = tempDiv.textContent || tempDiv.innerText || '';
        
        card.innerHTML = `
            <div class="problem-card-header">
                <div class="problem-title-wrapper">
                    <span class="problem-number">#${p.number || 'N/A'}</span>
                    <h3 class="problem-title">${p.title}</h3>
                </div>
                <span class="diff-badge ${p.difficulty.toLowerCase()}">${p.difficulty}</span>
            </div>
            <p class="problem-card-desc">${textContent || 'No description available.'}</p>
            <div class="problem-card-footer">
                ${tagsHtml}
                <button class="view-solution-link">
                    <i data-lucide="eye" style="width:16px; height:16px"></i> View Solution
                </button>
            </div>
        `;
        
        card.addEventListener('click', () => openModal(p));
        problemsGrid.appendChild(card);
    });
}

// Render active filter badges below header
function renderActiveFilters() {
    activeFiltersBar.innerHTML = '';
    
    const hasDiffFilters = selectedDifficulties.size < 3;
    const hasTopicFilters = selectedTopics.size > 0;
    const hasSearchFilter = searchQuery.length > 0;
    
    if (!hasDiffFilters && !hasTopicFilters && !hasSearchFilter) {
        activeFiltersBar.style.display = 'none';
        return;
    }
    
    activeFiltersBar.style.display = 'flex';
    
    // Difficulty filters
    if (hasDiffFilters) {
        selectedDifficulties.forEach(diff => {
            createFilterBadge(`Difficulty: ${diff}`, () => {
                if (selectedDifficulties.size > 1) {
                    selectedDifficulties.delete(diff);
                    document.querySelector(`.diff-btn[data-diff="${diff}"]`).classList.remove('active');
                    renderDashboard();
                }
            });
        });
    }
    
    // Topic filters
    if (hasTopicFilters) {
        selectedTopics.forEach(topic => {
            createFilterBadge(`Topic: ${topic}`, () => {
                selectedTopics.delete(topic);
                const tagEl = document.querySelector(`.topic-tag[data-topic="${topic}"]`);
                if (tagEl) tagEl.classList.remove('active');
                renderDashboard();
            });
        });
    }
    
    // Search filter
    if (hasSearchFilter) {
        createFilterBadge(`Search: "${searchQuery}"`, () => {
            searchQuery = '';
            searchInput.value = '';
            renderDashboard();
        });
    }
    
    // Clear All button
    const clearAll = document.createElement('button');
    clearAll.className = 'clear-all-filters';
    clearAll.textContent = 'Clear All';
    clearAll.addEventListener('click', () => {
        // Reset diffs
        selectedDifficulties = new Set(['Easy', 'Medium', 'Hard']);
        document.querySelectorAll('.diff-btn').forEach(btn => btn.classList.add('active'));
        
        // Reset topics
        selectedTopics.clear();
        document.querySelectorAll('.topic-tag').forEach(tag => tag.classList.remove('active'));
        
        // Reset search
        searchQuery = '';
        searchInput.value = '';
        
        renderDashboard();
    });
    activeFiltersBar.appendChild(clearAll);
}

// Helper to create active filter badges
function createFilterBadge(text, onRemove) {
    const badge = document.createElement('div');
    badge.className = 'active-filter-badge';
    badge.innerHTML = `
        <span>${text}</span>
        <button><i data-lucide="x" style="width:14px; height:14px"></i></button>
    `;
    badge.querySelector('button').addEventListener('click', onRemove);
    activeFiltersBar.appendChild(badge);
}

// Modal View Functions
function openModal(problem) {
    modalTitle.textContent = `${problem.number}. ${problem.title}`;
    
    // Update difficulty
    modalDifficulty.className = `difficulty-badge ${problem.difficulty.toLowerCase()}`;
    modalDifficulty.textContent = problem.difficulty;
    
    // Update topics
    modalTopics.innerHTML = '';
    if (problem.topics && problem.topics.length > 0) {
        problem.topics.forEach(t => {
            const tag = document.createElement('span');
            tag.className = 'card-tag';
            tag.textContent = t;
            modalTopics.appendChild(tag);
        });
    }
    
    // Update description and link
    modalDescription.innerHTML = problem.description || '<p>No description available.</p>';
    modalLeetCodeLink.href = problem.url || '#';
    modalLeetCodeLink.style.display = problem.url ? 'inline-flex' : 'none';
    
    // Update Code Block
    modalCode.className = 'language-python';
    modalCode.textContent = problem.code || '# No solution code provided.';
    
    // Reset copy button status
    copyCodeBtn.innerHTML = '<i data-lucide="copy" style="width:14px; height:14px"></i> Copy Code';
    
    // Open Modal
    modal.classList.add('open');
    document.body.style.overflow = 'hidden'; // prevent scrolling behind modal
    
    // Trigger Prism syntax highlight
    Prism.highlightElement(modalCode);
    
    // Refresh icons inside modal
    lucide.createIcons();
}

function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = ''; // restore scrolling
}

// Copy solution code to clipboard
function copyCodeToClipboard() {
    const codeText = modalCode.textContent;
    navigator.clipboard.writeText(codeText).then(() => {
        copyCodeBtn.innerHTML = '<i data-lucide="check" style="width:14px; height:14px"></i> Copied!';
        lucide.createIcons();
        
        // Reset back to Copy after 2 seconds
        setTimeout(() => {
            copyCodeBtn.innerHTML = '<i data-lucide="copy" style="width:14px; height:14px"></i> Copy Code';
            lucide.createIcons();
        }, 2000);
    }).catch(err => {
        console.error('Error copying code:', err);
    });
}
