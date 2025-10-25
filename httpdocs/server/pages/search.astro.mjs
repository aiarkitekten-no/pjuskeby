import { c as createComponent, b as renderTemplate, r as renderComponent, m as maybeRenderHead } from '../chunks/astro/server_YlAN3CX0.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_CRd09uuf.mjs';
/* empty css                                  */
export { renderers } from '../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Search = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate(_a || (_a = __template(["", `  <script>
  // Search functionality with fuzzy search and debouncing
  class PjuskebySearch {
    constructor() {
      this.searchInput = document.getElementById('searchInput');
      this.suggestionsContainer = document.getElementById('suggestions');
      this.searchResults = document.getElementById('searchResults');
      this.resultsList = document.getElementById('resultsList');
      this.resultsTitle = document.getElementById('resultsTitle');
      this.resultsCount = document.getElementById('resultsCount');
      this.searchHelp = document.getElementById('searchHelp');
      this.loading = document.getElementById('loading');
      this.fuzzyCheckbox = document.getElementById('fuzzySearch');
      
      this.debounceTimer = null;
      this.suggestionDebouncer = null;
      this.currentQuery = '';
      this.selectedSuggestion = -1;

      this.init();
    }

    init() {
      // Search input with debouncing
      this.searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        
        // Clear previous timers
        clearTimeout(this.debounceTimer);
        clearTimeout(this.suggestionDebouncer);
        
        if (query.length >= 2) {
          // Autocomplete suggestions (faster)
          this.suggestionDebouncer = setTimeout(() => {
            this.fetchSuggestions(query);
          }, 150);
          
          // Main search (slower)
          this.debounceTimer = setTimeout(() => {
            this.performSearch(query);
          }, 300);
        } else {
          this.hideSuggestions();
          this.hideResults();
        }
      });

      // Keyboard navigation for suggestions
      this.searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          this.navigateSuggestions(1);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault(); 
          this.navigateSuggestions(-1);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          this.selectCurrentSuggestion();
        } else if (e.key === 'Escape') {
          this.hideSuggestions();
        }
      });

      // Hide suggestions when clicking outside
      document.addEventListener('click', (e) => {
        if (!this.searchInput.contains(e.target) && !this.suggestionsContainer.contains(e.target)) {
          this.hideSuggestions();
        }
      });

      // Filter change handlers
      document.querySelectorAll('input[name="type"]').forEach(radio => {
        radio.addEventListener('change', () => {
          if (this.currentQuery) {
            this.performSearch(this.currentQuery);
          }
        });
      });

      // Fuzzy search toggle
      this.fuzzyCheckbox.addEventListener('change', () => {
        if (this.currentQuery) {
          this.performSearch(this.currentQuery);
        }
      });

      // Popular tag handlers
      document.querySelectorAll('.popular-tag').forEach(tag => {
        tag.addEventListener('click', (e) => {
          const searchTerm = e.target.dataset.search;
          this.searchInput.value = searchTerm;
          this.performSearch(searchTerm);
        });
      });
    }

    async fetchSuggestions(query) {
      try {
        const response = await fetch(\`/api/suggest?q=\${encodeURIComponent(query)}&limit=5\`);
        const data = await response.json();
        
        if (data.suggestions && data.suggestions.length > 0) {
          this.showSuggestions(data.suggestions);
        } else {
          this.hideSuggestions();
        }
      } catch (error) {
        console.error('Suggestion error:', error);
        this.hideSuggestions();
      }
    }

    showSuggestions(suggestions) {
      this.suggestionsContainer.innerHTML = '';
      
      suggestions.forEach((suggestion, index) => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.textContent = suggestion;
        item.addEventListener('click', () => {
          this.searchInput.value = suggestion;
          this.performSearch(suggestion);
          this.hideSuggestions();
        });
        this.suggestionsContainer.appendChild(item);
      });
      
      this.suggestionsContainer.style.display = 'block';
      this.selectedSuggestion = -1;
    }

    hideSuggestions() {
      this.suggestionsContainer.style.display = 'none';
      this.selectedSuggestion = -1;
    }

    navigateSuggestions(direction) {
      const suggestions = this.suggestionsContainer.querySelectorAll('.suggestion-item');
      if (suggestions.length === 0) return;

      // Remove current selection
      suggestions[this.selectedSuggestion]?.classList.remove('selected');
      
      // Update selection
      this.selectedSuggestion += direction;
      if (this.selectedSuggestion < -1) this.selectedSuggestion = suggestions.length - 1;
      if (this.selectedSuggestion >= suggestions.length) this.selectedSuggestion = -1;
      
      // Apply new selection
      if (this.selectedSuggestion >= 0) {
        suggestions[this.selectedSuggestion].classList.add('selected');
        this.searchInput.value = suggestions[this.selectedSuggestion].textContent;
      }
    }

    selectCurrentSuggestion() {
      if (this.selectedSuggestion >= 0) {
        const suggestions = this.suggestionsContainer.querySelectorAll('.suggestion-item');
        const selectedText = suggestions[this.selectedSuggestion].textContent;
        this.searchInput.value = selectedText;
        this.performSearch(selectedText);
      } else if (this.searchInput.value.trim()) {
        this.performSearch(this.searchInput.value.trim());
      }
      this.hideSuggestions();
    }

    async performSearch(query) {
      if (!query || query.length < 2) return;
      
      this.currentQuery = query;
      this.showLoading();
      this.hideSuggestions();
      
      try {
        // Get selected type
        const typeRadio = document.querySelector('input[name="type"]:checked');
        const type = typeRadio ? typeRadio.value : '';
        
        // Get fuzzy option
        const fuzzy = this.fuzzyCheckbox.checked;
        
        // Build search URL
        const params = new URLSearchParams({
          q: query,
          fuzzy: fuzzy.toString(),
          limit: '20'
        });
        
        if (type) {
          params.set('type', type);
        }

        const response = await fetch(\`/api/search?\${params}\`);
        const data = await response.json();
        
        this.displayResults(data);
        
      } catch (error) {
        console.error('Search error:', error);
        this.showError('Search failed. Please try again later.');
      } finally {
        this.hideLoading();
      }
    }

    displayResults(data) {
      this.hideHelp();
      
      if (!data.results || data.results.length === 0) {
        this.showNoResults(data.query);
        return;
      }

      this.resultsTitle.textContent = \`Search results for "\${data.query}"\`;
      this.resultsCount.textContent = \`\${data.results.length} result\${data.results.length !== 1 ? 's' : ''}\`;
      
      this.resultsList.innerHTML = '';
      
      data.results.forEach(result => {
        const item = this.createResultItem(result);
        this.resultsList.appendChild(item);
      });
      
      this.searchResults.style.display = 'block';
    }

    createResultItem(result) {
      const item = document.createElement('div');
      item.className = 'result-item';
      
      const typeLabels = {
        story: 'Story',
        person: 'Person', 
        place: 'Place',
        business: 'Business',
        street: 'Street',
        event: 'Event',
        rumor: 'Rumor'
      };
      
      const typeEmojis = {
        story: '\u{1F4D6}',
        person: '\u{1F464}',
        place: '\u{1F4CD}',
        business: '\u{1F3E2}', 
        street: '\u{1F6E3}\uFE0F',
        event: '\u{1F389}',
        rumor: '\u{1F441}\uFE0F'
      };

      item.innerHTML = \`
        <div class="result-header">
          <a href="\${result.url}" class="result-title">
            \${result.highlightedTitle || result.title}
          </a>
          <div class="result-type">
            \${typeEmojis[result.type] || '\u{1F4C4}'} \${typeLabels[result.type] || result.type}
          </div>
        </div>
        <div class="result-description">
          \${result.matchedText || result.description}
        </div>
        <div class="result-meta">
          \${result.category ? \`<div class="result-meta-item">\u{1F4C2} \${result.category}</div>\` : ''}
          \${result.characters && result.characters.length > 0 ? 
            \`<div class="result-meta-item">\u{1F465} \${result.characters.join(', ')}</div>\` : ''}
          \${result.locations && result.locations.length > 0 ? 
            \`<div class="result-meta-item">\u{1F4CD} \${result.locations.join(', ')}</div>\` : ''}
          <div class="result-meta-item">
            \u{1F3AF} Score: <span class="result-score">\${result.score}</span>
          </div>
        </div>
      \`;

      return item;
    }

    showNoResults(query) {
      this.resultsTitle.textContent = \`No results for "\${query}"\`;
      this.resultsCount.textContent = '0 results';
      
      this.resultsList.innerHTML = \`
        <div class="result-item">
          <div class="result-title">\u{1F914} No matches found</div>
          <div class="result-description">
            Try to:
            <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
              <li>Check the spelling</li>
              <li>Use different search terms</li>
              <li>Turn on fuzzy search</li>
              <li>Try a broader category</li>
            </ul>
          </div>
        </div>
      \`;
      
      this.searchResults.style.display = 'block';
    }

    showError(message) {
      this.hideHelp();
      this.resultsTitle.textContent = 'Search Error';
      this.resultsCount.textContent = '';
      
      this.resultsList.innerHTML = \`
        <div class="result-item">
          <div class="result-title">\u274C \${message}</div>
        </div>
      \`;
      
      this.searchResults.style.display = 'block';
    }

    showLoading() {
      this.loading.style.display = 'flex';
    }

    hideLoading() {
      this.loading.style.display = 'none';
    }

    hideResults() {
      this.searchResults.style.display = 'none';
      this.showHelp();
    }

    hideHelp() {
      this.searchHelp.style.display = 'none';
    }

    showHelp() {
      this.searchHelp.style.display = 'block';
    }
  }

  // Initialize search when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    new PjuskebySearch();
    console.log('\u{1F50D} Pjuskeby Search initialized');
  });
<\/script>`], ["", `  <script>
  // Search functionality with fuzzy search and debouncing
  class PjuskebySearch {
    constructor() {
      this.searchInput = document.getElementById('searchInput');
      this.suggestionsContainer = document.getElementById('suggestions');
      this.searchResults = document.getElementById('searchResults');
      this.resultsList = document.getElementById('resultsList');
      this.resultsTitle = document.getElementById('resultsTitle');
      this.resultsCount = document.getElementById('resultsCount');
      this.searchHelp = document.getElementById('searchHelp');
      this.loading = document.getElementById('loading');
      this.fuzzyCheckbox = document.getElementById('fuzzySearch');
      
      this.debounceTimer = null;
      this.suggestionDebouncer = null;
      this.currentQuery = '';
      this.selectedSuggestion = -1;

      this.init();
    }

    init() {
      // Search input with debouncing
      this.searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        
        // Clear previous timers
        clearTimeout(this.debounceTimer);
        clearTimeout(this.suggestionDebouncer);
        
        if (query.length >= 2) {
          // Autocomplete suggestions (faster)
          this.suggestionDebouncer = setTimeout(() => {
            this.fetchSuggestions(query);
          }, 150);
          
          // Main search (slower)
          this.debounceTimer = setTimeout(() => {
            this.performSearch(query);
          }, 300);
        } else {
          this.hideSuggestions();
          this.hideResults();
        }
      });

      // Keyboard navigation for suggestions
      this.searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          this.navigateSuggestions(1);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault(); 
          this.navigateSuggestions(-1);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          this.selectCurrentSuggestion();
        } else if (e.key === 'Escape') {
          this.hideSuggestions();
        }
      });

      // Hide suggestions when clicking outside
      document.addEventListener('click', (e) => {
        if (!this.searchInput.contains(e.target) && !this.suggestionsContainer.contains(e.target)) {
          this.hideSuggestions();
        }
      });

      // Filter change handlers
      document.querySelectorAll('input[name="type"]').forEach(radio => {
        radio.addEventListener('change', () => {
          if (this.currentQuery) {
            this.performSearch(this.currentQuery);
          }
        });
      });

      // Fuzzy search toggle
      this.fuzzyCheckbox.addEventListener('change', () => {
        if (this.currentQuery) {
          this.performSearch(this.currentQuery);
        }
      });

      // Popular tag handlers
      document.querySelectorAll('.popular-tag').forEach(tag => {
        tag.addEventListener('click', (e) => {
          const searchTerm = e.target.dataset.search;
          this.searchInput.value = searchTerm;
          this.performSearch(searchTerm);
        });
      });
    }

    async fetchSuggestions(query) {
      try {
        const response = await fetch(\\\`/api/suggest?q=\\\${encodeURIComponent(query)}&limit=5\\\`);
        const data = await response.json();
        
        if (data.suggestions && data.suggestions.length > 0) {
          this.showSuggestions(data.suggestions);
        } else {
          this.hideSuggestions();
        }
      } catch (error) {
        console.error('Suggestion error:', error);
        this.hideSuggestions();
      }
    }

    showSuggestions(suggestions) {
      this.suggestionsContainer.innerHTML = '';
      
      suggestions.forEach((suggestion, index) => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.textContent = suggestion;
        item.addEventListener('click', () => {
          this.searchInput.value = suggestion;
          this.performSearch(suggestion);
          this.hideSuggestions();
        });
        this.suggestionsContainer.appendChild(item);
      });
      
      this.suggestionsContainer.style.display = 'block';
      this.selectedSuggestion = -1;
    }

    hideSuggestions() {
      this.suggestionsContainer.style.display = 'none';
      this.selectedSuggestion = -1;
    }

    navigateSuggestions(direction) {
      const suggestions = this.suggestionsContainer.querySelectorAll('.suggestion-item');
      if (suggestions.length === 0) return;

      // Remove current selection
      suggestions[this.selectedSuggestion]?.classList.remove('selected');
      
      // Update selection
      this.selectedSuggestion += direction;
      if (this.selectedSuggestion < -1) this.selectedSuggestion = suggestions.length - 1;
      if (this.selectedSuggestion >= suggestions.length) this.selectedSuggestion = -1;
      
      // Apply new selection
      if (this.selectedSuggestion >= 0) {
        suggestions[this.selectedSuggestion].classList.add('selected');
        this.searchInput.value = suggestions[this.selectedSuggestion].textContent;
      }
    }

    selectCurrentSuggestion() {
      if (this.selectedSuggestion >= 0) {
        const suggestions = this.suggestionsContainer.querySelectorAll('.suggestion-item');
        const selectedText = suggestions[this.selectedSuggestion].textContent;
        this.searchInput.value = selectedText;
        this.performSearch(selectedText);
      } else if (this.searchInput.value.trim()) {
        this.performSearch(this.searchInput.value.trim());
      }
      this.hideSuggestions();
    }

    async performSearch(query) {
      if (!query || query.length < 2) return;
      
      this.currentQuery = query;
      this.showLoading();
      this.hideSuggestions();
      
      try {
        // Get selected type
        const typeRadio = document.querySelector('input[name="type"]:checked');
        const type = typeRadio ? typeRadio.value : '';
        
        // Get fuzzy option
        const fuzzy = this.fuzzyCheckbox.checked;
        
        // Build search URL
        const params = new URLSearchParams({
          q: query,
          fuzzy: fuzzy.toString(),
          limit: '20'
        });
        
        if (type) {
          params.set('type', type);
        }

        const response = await fetch(\\\`/api/search?\\\${params}\\\`);
        const data = await response.json();
        
        this.displayResults(data);
        
      } catch (error) {
        console.error('Search error:', error);
        this.showError('Search failed. Please try again later.');
      } finally {
        this.hideLoading();
      }
    }

    displayResults(data) {
      this.hideHelp();
      
      if (!data.results || data.results.length === 0) {
        this.showNoResults(data.query);
        return;
      }

      this.resultsTitle.textContent = \\\`Search results for "\\\${data.query}"\\\`;
      this.resultsCount.textContent = \\\`\\\${data.results.length} result\\\${data.results.length !== 1 ? 's' : ''}\\\`;
      
      this.resultsList.innerHTML = '';
      
      data.results.forEach(result => {
        const item = this.createResultItem(result);
        this.resultsList.appendChild(item);
      });
      
      this.searchResults.style.display = 'block';
    }

    createResultItem(result) {
      const item = document.createElement('div');
      item.className = 'result-item';
      
      const typeLabels = {
        story: 'Story',
        person: 'Person', 
        place: 'Place',
        business: 'Business',
        street: 'Street',
        event: 'Event',
        rumor: 'Rumor'
      };
      
      const typeEmojis = {
        story: '\u{1F4D6}',
        person: '\u{1F464}',
        place: '\u{1F4CD}',
        business: '\u{1F3E2}', 
        street: '\u{1F6E3}\uFE0F',
        event: '\u{1F389}',
        rumor: '\u{1F441}\uFE0F'
      };

      item.innerHTML = \\\`
        <div class="result-header">
          <a href="\\\${result.url}" class="result-title">
            \\\${result.highlightedTitle || result.title}
          </a>
          <div class="result-type">
            \\\${typeEmojis[result.type] || '\u{1F4C4}'} \\\${typeLabels[result.type] || result.type}
          </div>
        </div>
        <div class="result-description">
          \\\${result.matchedText || result.description}
        </div>
        <div class="result-meta">
          \\\${result.category ? \\\`<div class="result-meta-item">\u{1F4C2} \\\${result.category}</div>\\\` : ''}
          \\\${result.characters && result.characters.length > 0 ? 
            \\\`<div class="result-meta-item">\u{1F465} \\\${result.characters.join(', ')}</div>\\\` : ''}
          \\\${result.locations && result.locations.length > 0 ? 
            \\\`<div class="result-meta-item">\u{1F4CD} \\\${result.locations.join(', ')}</div>\\\` : ''}
          <div class="result-meta-item">
            \u{1F3AF} Score: <span class="result-score">\\\${result.score}</span>
          </div>
        </div>
      \\\`;

      return item;
    }

    showNoResults(query) {
      this.resultsTitle.textContent = \\\`No results for "\\\${query}"\\\`;
      this.resultsCount.textContent = '0 results';
      
      this.resultsList.innerHTML = \\\`
        <div class="result-item">
          <div class="result-title">\u{1F914} No matches found</div>
          <div class="result-description">
            Try to:
            <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
              <li>Check the spelling</li>
              <li>Use different search terms</li>
              <li>Turn on fuzzy search</li>
              <li>Try a broader category</li>
            </ul>
          </div>
        </div>
      \\\`;
      
      this.searchResults.style.display = 'block';
    }

    showError(message) {
      this.hideHelp();
      this.resultsTitle.textContent = 'Search Error';
      this.resultsCount.textContent = '';
      
      this.resultsList.innerHTML = \\\`
        <div class="result-item">
          <div class="result-title">\u274C \\\${message}</div>
        </div>
      \\\`;
      
      this.searchResults.style.display = 'block';
    }

    showLoading() {
      this.loading.style.display = 'flex';
    }

    hideLoading() {
      this.loading.style.display = 'none';
    }

    hideResults() {
      this.searchResults.style.display = 'none';
      this.showHelp();
    }

    hideHelp() {
      this.searchHelp.style.display = 'none';
    }

    showHelp() {
      this.searchHelp.style.display = 'block';
    }
  }

  // Initialize search when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    new PjuskebySearch();
    console.log('\u{1F50D} Pjuskeby Search initialized');
  });
<\/script>`])), renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Search in Pjuskeby", "data-astro-cid-ipsxrsrh": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="search-container" data-astro-cid-ipsxrsrh> <div class="search-header" data-astro-cid-ipsxrsrh> <h1 data-astro-cid-ipsxrsrh>🔍 Search Pjuskeby</h1> <p data-astro-cid-ipsxrsrh>Find stories, people, places and more from our small, absurd world</p> </div> <div class="search-form" data-astro-cid-ipsxrsrh> <div class="search-input-container" data-astro-cid-ipsxrsrh> <input type="text" id="searchInput" class="search-input" placeholder="Search for stories, people, places..." autocomplete="off" data-astro-cid-ipsxrsrh> <div class="search-suggestions" id="suggestions" style="display: none;" data-astro-cid-ipsxrsrh></div> </div> <div class="search-filters" data-astro-cid-ipsxrsrh> <label class="filter-label" data-astro-cid-ipsxrsrh> <input type="radio" name="type" value="" checked data-astro-cid-ipsxrsrh> All
</label> <label class="filter-label" data-astro-cid-ipsxrsrh> <input type="radio" name="type" value="story" data-astro-cid-ipsxrsrh> Stories
</label> <label class="filter-label" data-astro-cid-ipsxrsrh> <input type="radio" name="type" value="person" data-astro-cid-ipsxrsrh> People
</label> <label class="filter-label" data-astro-cid-ipsxrsrh> <input type="radio" name="type" value="place" data-astro-cid-ipsxrsrh> Places
</label> <label class="filter-label" data-astro-cid-ipsxrsrh> <input type="radio" name="type" value="business" data-astro-cid-ipsxrsrh> Businesses
</label> <label class="filter-label" data-astro-cid-ipsxrsrh> <input type="radio" name="type" value="street" data-astro-cid-ipsxrsrh> Streets
</label> </div> <div class="search-options" data-astro-cid-ipsxrsrh> <label class="option-label" data-astro-cid-ipsxrsrh> <input type="checkbox" id="fuzzySearch" checked data-astro-cid-ipsxrsrh> Fuzzy search (find similar words)
</label> </div> </div> <div class="search-results" id="searchResults" style="display: none;" data-astro-cid-ipsxrsrh> <div class="results-header" data-astro-cid-ipsxrsrh> <h2 id="resultsTitle" data-astro-cid-ipsxrsrh>Search Results</h2> <div class="results-count" id="resultsCount" data-astro-cid-ipsxrsrh></div> </div> <div class="results-list" id="resultsList" data-astro-cid-ipsxrsrh></div> </div> <div class="search-help" id="searchHelp" data-astro-cid-ipsxrsrh> <h2 data-astro-cid-ipsxrsrh>💡 Search Tips</h2> <div class="help-grid" data-astro-cid-ipsxrsrh> <div class="help-item" data-astro-cid-ipsxrsrh> <h3 data-astro-cid-ipsxrsrh>🎯 Exact searches</h3> <p data-astro-cid-ipsxrsrh>Search for "Agatha" to find all stories about the main character</p> </div> <div class="help-item" data-astro-cid-ipsxrsrh> <h3 data-astro-cid-ipsxrsrh>🏃‍♀️ Fuzzy search</h3> <p data-astro-cid-ipsxrsrh>Type "Pjukeby" and get results for "Pjuskeby" (finds typos)</p> </div> <div class="help-item" data-astro-cid-ipsxrsrh> <h3 data-astro-cid-ipsxrsrh>📖 Categories</h3> <p data-astro-cid-ipsxrsrh>Filter by stories, people, or places for more precise results</p> </div> <div class="help-item" data-astro-cid-ipsxrsrh> <h3 data-astro-cid-ipsxrsrh>⚡ Autocomplete</h3> <p data-astro-cid-ipsxrsrh>Start typing to get search suggestions</p> </div> </div> <div class="popular-searches" data-astro-cid-ipsxrsrh> <h3 data-astro-cid-ipsxrsrh>🔥 Popular Searches</h3> <div class="popular-tags" data-astro-cid-ipsxrsrh> <button class="popular-tag" data-search="Agatha" data-astro-cid-ipsxrsrh>Agatha</button> <button class="popular-tag" data-search="diary" data-astro-cid-ipsxrsrh>Agatha's Diary</button> <button class="popular-tag" data-search="rumors" data-astro-cid-ipsxrsrh>Rumors</button> <button class="popular-tag" data-search="Babblespray Falls" data-astro-cid-ipsxrsrh>Babblespray Falls</button> <button class="popular-tag" data-search="Milly" data-astro-cid-ipsxrsrh>Milly Wiggleflap</button> <button class="popular-tag" data-search="events" data-astro-cid-ipsxrsrh>Events</button> </div> </div> </div> <div class="loading" id="loading" style="display: none;" data-astro-cid-ipsxrsrh> <div class="spinner" data-astro-cid-ipsxrsrh></div> <p data-astro-cid-ipsxrsrh>Searching...</p> </div> </div> ` }));
}, "/var/www/vhosts/pjuskeby.org/src/pages/search.astro", void 0);

const $$file = "/var/www/vhosts/pjuskeby.org/src/pages/search.astro";
const $$url = "/search";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Search,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
