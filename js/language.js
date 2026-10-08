/* ==========================================================
   AJMF CENTRALIZED LANGUAGE SWITCHING SYSTEM
   Handles language detection, localStorage persistence,
   and dynamic DOM translation across all website pages.
   ========================================================== */

document.addEventListener('DOMContentLoaded', function () {
    // 0. Ensure Language Switcher UI component exists in header & is wired up
    ensureLanguageSelectorExists();

    // 1. Determine current language preference (defaulting to English 'en')
    const savedLanguage = localStorage.getItem('language') || 'en';
    
    // 2. Initial application of translations
    applyTranslations(savedLanguage);
    
    // 3. Attach global event listeners to language switcher controls
    setupLanguageSelectorListeners();

    // 4. Setup observer for dynamic elements (Read More expansions, Modals, Accordions)
    observeDynamicTextChanges();
});

/**
 * Ensures the language dropdown UI component is mounted in the header if missing,
 * and attaches necessary toggle and selection handlers regardless of whether
 * it was statically rendered in HTML or dynamically injected.
 */
function ensureLanguageSelectorExists() {
    const container = document.querySelector('.header .container');
    if (!container) return;

    let wrapper = container.querySelector('.lang-dropdown-wrapper');

    if (!wrapper) {
        let actionsDiv = container.querySelector('.header-actions');
        const hamburgerBtn = container.querySelector('.hamburger-menu, #hamburgerBtn');
        const desktopBtn = container.querySelector('.donate-btn.desktop-only-btn');

        if (!actionsDiv) {
            actionsDiv = document.createElement('div');
            actionsDiv.className = 'header-actions';
            if (hamburgerBtn) {
                hamburgerBtn.parentNode.insertBefore(actionsDiv, hamburgerBtn);
            } else if (desktopBtn) {
                desktopBtn.parentNode.insertBefore(actionsDiv, desktopBtn);
            } else {
                container.appendChild(actionsDiv);
            }
            if (desktopBtn) {
                actionsDiv.appendChild(desktopBtn);
            }
        }

        wrapper = document.createElement('div');
        wrapper.className = 'lang-dropdown-wrapper';
        wrapper.id = 'langDropdownWrapper';
        wrapper.innerHTML = `
            <button type="button" class="lang-dropdown-btn" id="langDropdownBtn" aria-expanded="false" aria-label="Select Language">
                <i class="fa-solid fa-globe lang-globe-icon"></i>
                <span id="currentLangText">English</span>
                <i class="fa-solid fa-chevron-down lang-chevron"></i>
            </button>
            <ul class="lang-dropdown-menu" id="langDropdownMenu" role="menu">
                <li><button type="button" class="lang-option" data-lang="en">English</button></li>
                <li><button type="button" class="lang-option" data-lang="hi">Hindi (हिंदी)</button></li>
            </ul>
        `;
        if (desktopBtn && desktopBtn.parentNode === actionsDiv) {
            actionsDiv.insertBefore(wrapper, desktopBtn);
        } else {
            actionsDiv.appendChild(wrapper);
            if (desktopBtn) {
                actionsDiv.appendChild(desktopBtn);
            }
        }
    }

    // Attach event listeners to all lang-dropdown-wrappers on the page
    const wrappers = document.querySelectorAll('.lang-dropdown-wrapper');
    wrappers.forEach(w => {
        const btn = w.querySelector('#langDropdownBtn, .lang-dropdown-btn');
        if (btn && !btn.dataset.langBound) {
            btn.dataset.langBound = 'true';
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                const isOpen = w.classList.toggle('is-open');
                btn.setAttribute('aria-expanded', isOpen);
            });
        }

        w.querySelectorAll('[data-lang]').forEach(function (opt) {
            if (!opt.classList.contains('lang-option')) {
                opt.classList.add('lang-option');
            }
            if (!opt.dataset.langBound) {
                opt.dataset.langBound = 'true';
                opt.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    const selectedLang = opt.getAttribute('data-lang');
                    changeLanguage(selectedLang);
                    w.classList.remove('is-open');
                    if (btn) btn.setAttribute('aria-expanded', 'false');
                });
            }
        });
    });

    // Close all open dropdowns when clicking outside
    if (!document.datasetCloseLangBound) {
        document.datasetCloseLangBound = 'true';
        document.addEventListener('click', function (e) {
            document.querySelectorAll('.lang-dropdown-wrapper').forEach(w => {
                if (!w.contains(e.target)) {
                    w.classList.remove('is-open');
                    const b = w.querySelector('#langDropdownBtn, .lang-dropdown-btn');
                    if (b) b.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }
}

/**
 * Main function to change the active language and persist preference
 * @param {string} lang - Language code ('en' or 'hi')
 */
function changeLanguage(lang) {
    if (lang !== 'en' && lang !== 'hi') lang = 'en';
    
    // Save selection in localStorage
    localStorage.setItem('language', lang);
    
    // Apply translations to current page
    applyTranslations(lang);
}

/**
 * Applies translations to all elements with data-i18n, data-i18n-placeholder, data-i18n-alt, and data-i18n-title
 * @param {string} lang - Active language ('en' or 'hi')
 */
function applyTranslations(lang) {
    if (typeof translations === 'undefined' || !translations[lang]) {
        console.warn('AJMF Translation Dictionary not loaded for language:', lang);
        return;
    }

    const dict = translations[lang];
    document.documentElement.lang = lang;

    // Body font class toggle for Hindi typography support
    if (lang === 'hi') {
        document.body.classList.add('lang-hi');
    } else {
        document.body.classList.remove('lang-hi');
    }

    // Translate Text Elements (data-i18n)
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(function (el) {
        const key = el.getAttribute('data-i18n');
        if (dict[key] !== undefined && dict[key] !== null) {
            updateElementTextPreservingIcons(el, dict[key]);
        }
    });

    // Translate Input & Textarea Placeholders (data-i18n-placeholder)
    const placeholders = document.querySelectorAll('[data-i18n-placeholder]');
    placeholders.forEach(function (el) {
        const key = el.getAttribute('data-i18n-placeholder');
        if (dict[key] !== undefined && dict[key] !== null) {
            el.placeholder = dict[key];
        }
    });

    // Translate Image Alt Text (data-i18n-alt)
    const altElements = document.querySelectorAll('[data-i18n-alt]');
    altElements.forEach(function (el) {
        const key = el.getAttribute('data-i18n-alt');
        if (dict[key] !== undefined && dict[key] !== null) {
            el.alt = dict[key];
        }
    });

    // Translate Title Attributes (data-i18n-title)
    const titleElements = document.querySelectorAll('[data-i18n-title]');
    titleElements.forEach(function (el) {
        const key = el.getAttribute('data-i18n-title');
        if (dict[key] !== undefined && dict[key] !== null) {
            el.title = dict[key];
        }
    });

    // Update active UI state on language switcher controls
    updateSwitcherUI(lang);
}

/**
 * Updates element text content while preserving any child icons (<i> or <svg>)
 * and correctly parsing intentional HTML markup (such as <br>, <strong>, <span>).
 */
function updateElementTextPreservingIcons(el, newText) {
    const icons = el.querySelectorAll('i, svg');
    if (icons.length > 0) {
        const iconNodes = Array.from(icons).map(function (icon) { return icon.cloneNode(true); });
        const isIconFirst = el.firstElementChild && (el.firstElementChild.tagName === 'I' || el.firstElementChild.tagName === 'SVG');
        
        el.innerHTML = '';
        const tempSpan = document.createElement('span');
        tempSpan.innerHTML = newText;

        if (isIconFirst) {
            iconNodes.forEach(function (icon) { el.appendChild(icon); });
            el.appendChild(document.createTextNode(' '));
            while (tempSpan.firstChild) {
                el.appendChild(tempSpan.firstChild);
            }
        } else {
            while (tempSpan.firstChild) {
                el.appendChild(tempSpan.firstChild);
            }
            el.appendChild(document.createTextNode(' '));
            iconNodes.forEach(function (icon) { el.appendChild(icon); });
        }
    } else {
        el.innerHTML = newText;
    }
}

/**
 * Updates the visual state of language toggle buttons / selects across the page
 */
function updateSwitcherUI(lang) {
    const currentLangTexts = document.querySelectorAll('#currentLangText, .current-lang-text');
    currentLangTexts.forEach(el => {
        el.textContent = (lang === 'hi') ? 'Hindi (हिंदी)' : 'English';
    });

    document.querySelectorAll('[data-lang]').forEach(function (btn) {
        const btnLang = btn.getAttribute('data-lang');
        if (btnLang === lang) {
            btn.classList.add('is-active');
        } else {
            btn.classList.remove('is-active');
        }
    });
}

/**
 * Attaches global event listeners to language switcher controls (delegated)
 */
function setupLanguageSelectorListeners() {
    document.addEventListener('click', function (e) {
        const langOpt = e.target.closest('[data-lang]');
        if (langOpt && !langOpt.dataset.langBound) {
            const lang = langOpt.getAttribute('data-lang');
            if (lang) {
                changeLanguage(lang);
                const wrapper = langOpt.closest('.lang-dropdown-wrapper');
                if (wrapper) {
                    wrapper.classList.remove('is-open');
                    const btn = wrapper.querySelector('#langDropdownBtn, .lang-dropdown-btn');
                    if (btn) btn.setAttribute('aria-expanded', 'false');
                }
            }
            return;
        }

        const toggleBtn = e.target.closest('.lang-toggle-btn');
        if (toggleBtn) {
            const currentLang = localStorage.getItem('language') || 'en';
            const nextLang = (currentLang === 'en') ? 'hi' : 'en';
            changeLanguage(nextLang);
            return;
        }
    });

    document.addEventListener('change', function (e) {
        const select = e.target.closest('.lang-select-dropdown');
        if (select) {
            changeLanguage(select.value);
        }
    });
}

/**
 * Re-applies active language when dynamic content (modals, read more) is triggered
 */
function observeDynamicTextChanges() {
    document.addEventListener('click', function (e) {
        const trigger = e.target.closest('.btn-read-more, .more-btn, .learning-card, #watchHeroVideoBtn, .dropdown > a, button');
        if (trigger) {
            setTimeout(function () {
                const currentLang = localStorage.getItem('language') || 'en';
                if (currentLang === 'hi') {
                    applyTranslations('hi');
                }
            }, 100);
        }
    });
}
