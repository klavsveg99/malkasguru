// GOOGLE CONSENT MODE v2 - Default denied
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }

gtag('consent', 'default', {
    'analytics_storage': 'denied',
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'wait_for_update': 500
});

const GA_MEASUREMENT_ID = 'G-KNQMSS9LHQ';
let gaLoaded = false;

function loadGoogleAnalytics() {
    if (gaLoaded) return;
    gaLoaded = true;

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
    script.onload = function() {
        gtag('js', new Date());
        gtag('config', GA_MEASUREMENT_ID, { send_page_view: false });
        gtag('event', 'page_view');
    };
    document.head.appendChild(script);
}

const COOKIE_CONSENT_KEY = 'malkasguru_cookie_consent';
const COOKIE_EXPIRY_DAYS = 365;

class CookieConsent {
    constructor() {
        this.consentBanner = document.getElementById('cookieConsent');
        this.consentModal = document.getElementById('cookieModal');
        this.initialized = false;
        this.init();
    }

    init() {
        this.attachEventListeners();
        this.checkConsent();
    }

    attachEventListeners() {
        document.getElementById('cookieReject')?.addEventListener('click', () => this.rejectAll());
        document.getElementById('cookieAcceptAll')?.addEventListener('click', () => this.acceptAll());
        document.getElementById('cookieCustomize')?.addEventListener('click', () => this.openModal());
        document.getElementById('cookieModalClose')?.addEventListener('click', () => this.closeModal());
        document.getElementById('cookieModalOverlay')?.addEventListener('click', () => this.closeModal());
        document.getElementById('cookieModalReject')?.addEventListener('click', () => this.rejectAll());
        document.getElementById('cookieModalAccept')?.addEventListener('click', () => this.acceptAll());
        document.getElementById('cookieModalSave')?.addEventListener('click', () => this.savePreferences());
        document.getElementById('cookieSettings')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.openModal();
        });
    }

    checkConsent() {
        const consent = this.getConsent();
        if (!consent) {
            this.showBanner();
        } else {
            this.applyConsent(consent);
            this.hideBanner();
        }
    }

    getConsent() {
        const cookie = document.cookie.split('; ').find(row => row.startsWith(COOKIE_CONSENT_KEY + '='));
        if (!cookie) return null;
        try {
            return JSON.parse(decodeURIComponent(cookie.split('=')[1]));
        } catch (e) {
            return null;
        }
    }

    showBanner() {
        document.body.classList.remove('cookies-accepted');
    }

    hideBanner() {
        document.body.classList.add('cookies-accepted');
    }

    openModal() {
        if (this.consentModal) {
            this.consentModal.classList.add('show');
            document.body.style.overflow = 'hidden';
            this.loadPreferences();
        }
    }

    closeModal() {
        if (this.consentModal) {
            this.consentModal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    loadPreferences() {
        const preferences = this.getPreferences();
        document.querySelectorAll('.category-checkbox').forEach(checkbox => {
            const category = checkbox.getAttribute('data-category');
            if (category === 'necessary') {
                checkbox.checked = true;
            } else {
                checkbox.checked = preferences[category] || false;
            }
        });
    }

    getPreferences() {
        const consent = this.getConsent();
        if (!consent) return { analytics: false, marketing: false };
        return {
            analytics: consent.analytics || false,
            marketing: consent.marketing || false
        };
    }

    savePreferences() {
        const preferences = {};
        document.querySelectorAll('.category-checkbox:not(:disabled)').forEach(checkbox => {
            const category = checkbox.getAttribute('data-category');
            preferences[category] = checkbox.checked;
        });
        this.setConsent(preferences);
        this.closeModal();
        this.hideBanner();
    }

    acceptAll() {
        this.setConsent({ analytics: true, marketing: true });
        this.closeModal();
        this.hideBanner();
    }

    rejectAll() {
        this.setConsent({ analytics: false, marketing: false });
        this.closeModal();
        this.hideBanner();
    }

    setConsent(preferences) {
        const consent = {
            necessary: true,
            analytics: preferences.analytics || false,
            marketing: preferences.marketing || false,
            timestamp: new Date().getTime()
        };
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + COOKIE_EXPIRY_DAYS);
        document.cookie = COOKIE_CONSENT_KEY + '=' + encodeURIComponent(JSON.stringify(consent)) + '; expires=' + expiryDate.toUTCString() + '; path=/; SameSite=Lax';
        this.updateGoogleConsent(consent);
    }

    updateGoogleConsent(consent) {
        if (consent.analytics) {
            loadGoogleAnalytics();
        }
        gtag('consent', 'update', {
            'analytics_storage': consent.analytics ? 'granted' : 'denied',
            'ad_storage': consent.marketing ? 'granted' : 'denied',
            'ad_user_data': consent.marketing ? 'granted' : 'denied',
            'ad_personalization': consent.marketing ? 'granted' : 'denied'
        });
    }

    applyConsent(consent) {
        this.updateGoogleConsent(consent);
    }
}

let lastScroll = 0;
const header = document.querySelector('header');

window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;

    if (currentScroll > 100) {
        if (currentScroll > lastScroll) {
            header.classList.add('hidden');
            header.classList.remove('sticky');
        } else {
            header.classList.remove('hidden');
            header.classList.add('sticky');
        }
    } else {
        header.classList.remove('sticky', 'hidden');
    }

    lastScroll = currentScroll;
});

const contactPopup = document.getElementById('contactPopup');
const contactOverlay = document.getElementById('contactOverlay');
const popupClose = document.getElementById('popupClose');
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');
const ctaButtons = document.querySelectorAll('.contact-cta-btn');
const deliveryDateInput = document.getElementById('deliveryDate');

function isSunday(date) {
    return date.getDay() === 0;
}

// ---- Custom delivery date picker ----
(function() {
    const FIELD = 'deliveryDateField';
    const HIDDEN = 'deliveryDate';
    const field = document.getElementById(FIELD);
    const hidden = document.getElementById(HIDDEN);
    if (!field) return;

    let minDate = new Date();
    minDate.setDate(minDate.getDate() + 2);
    minDate.setHours(0, 0, 0, 0);

    const popup = document.getElementById('datepickerPopup');
    const title = document.getElementById('datepickerTitle');
    const grid = document.getElementById('datepickerGrid');
    const prevBtn = document.getElementById('datepickerPrev');
    const nextBtn = document.getElementById('datepickerNext');

    const LATV = ['Pirmdiena','Otrdiena','Trešdiena','Ceturtdiena','Piektdiena','Sestdiena','Svētdiena'];
    const MONTH = ['Janvāris','Februāris','Marts','Aprīlis','Maijs','Jūnijs','Jūlijs','Augusts','Septembris','Oktobris','Novembris','Decembris'];

    let view = new Date(minDate.getFullYear(), minDate.getMonth(), 1);

    function fmt(d) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return y + '-' + m + '-' + day;
    }

    function sameDay(a, b) {
        return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    }

    function render() {
        title.textContent = MONTH[view.getMonth()] + ' ' + view.getFullYear();
        grid.innerHTML = '';
        const first = new Date(view.getFullYear(), view.getMonth(), 1);
        // Monday-first: getDay() 0=Sun..6=Sat -> index in week (Mon-first)
        let lead = (first.getDay() + 6) % 7;
        const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();

        for (let i = 0; i < lead; i++) {
            const empty = document.createElement('div');
            empty.className = 'datepicker-cell empty';
            grid.appendChild(empty);
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(view.getFullYear(), view.getMonth(), d);
            const cell = document.createElement('button');
            cell.type = 'button';
            cell.textContent = d;
            cell.className = 'datepicker-cell';
            const disabled = isSunday(date) || date < minDate;
            if (disabled) {
                cell.classList.add('disabled');
                cell.disabled = true;
            } else {
                if (hidden.value && sameDay(date, new Date(hidden.value + 'T00:00:00'))) {
                    cell.classList.add('selected');
                }
                cell.addEventListener('click', () => {
                    hidden.value = fmt(date);
                    field.value = fmt(date) + ' (' + LATV[date.getDay() === 0 ? 6 : date.getDay() - 1] + ')';
                    closePopup();
                    if (formMessage.classList.contains('error')) {
                        formMessage.textContent = '';
                        formMessage.className = '';
                    }
                });
            }
            grid.appendChild(cell);
        }
    }

    function openPopup() {
        popup.classList.add('active');
        render();
    }

    function closePopup() {
        popup.classList.remove('active');
    }

    field.addEventListener('click', (e) => {
        e.stopPropagation();
        if (popup.classList.contains('active')) {
            closePopup();
        } else {
            openPopup();
        }
    });

    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        view.setMonth(view.getMonth() - 1);
        render();
    });
    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        view.setMonth(view.getMonth() + 1);
        render();
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.datepicker-popup') && !e.target.closest('#deliveryDateField')) {
            closePopup();
        }
    });
})();


function openPopup() {
    contactPopup.classList.add('active');
    contactOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closePopup() {
    contactPopup.classList.remove('active');
    contactOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

ctaButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        openPopup();
    });
});

popupClose.addEventListener('click', closePopup);
contactOverlay.addEventListener('click', closePopup);

const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const mainNav = document.getElementById('mainNav');
const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');

function openMobileMenu() {
    mainNav.classList.add('active');
    mobileMenuToggle.classList.add('active');
    mobileMenuOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
    mainNav.classList.remove('active');
    mobileMenuToggle.classList.remove('active');
    mobileMenuOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        if (mainNav.classList.contains('active')) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });
}

if (mobileMenuOverlay) {
    mobileMenuOverlay.addEventListener('click', closeMobileMenu);
}

document.querySelectorAll('#mainNav a').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (contactPopup && contactPopup.classList.contains('active')) {
            closePopup();
        }
        if (mainNav && mainNav.classList.contains('active')) {
            closeMobileMenu();
        }
    }
});

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const deliveryDate = (deliveryDateInput && deliveryDateInput.value) ? deliveryDateInput.value : '';
        if (deliveryDate) {
            const selected = new Date(deliveryDate + 'T00:00:00');
            if (isSunday(selected)) {
                formMessage.textContent = 'Svētdienās piegāde netiek veikta. Lūdzu, izvēlieties citu dienu.';
                formMessage.className = 'form-message error';
                return;
            }
            const t = new Date();
            t.setDate(t.getDate() + 2);
            t.setHours(0, 0, 0, 0);
            if (selected < t) {
                formMessage.textContent = 'Piegādes datumam jābūt vismaz 2 dienas vēlāk.';
                formMessage.className = 'form-message error';
                return;
            }
        }

        const formData = new FormData(contactForm);
        formData.append('lang', 'lv');

        try {
            const response = await fetch('contact.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            formMessage.textContent = result.message;
            formMessage.className = 'form-message ' + (result.success ? 'success' : 'error');

            if (result.success) {
                gtag('event', 'form_submission', {
                    event_category: 'contact',
                    event_label: window.location.pathname
                });
                gtag('event', 'generate_lead');
                gtag('event', 'conversion_event_submit_lead_form');
                contactForm.reset();
                contactForm.style.display = 'none';
            }
        } catch (error) {
            formMessage.textContent = 'Kļūda nosūtot ziņojumu. Lūdzu, mēģiniet vēlreiz.';
            formMessage.className = 'form-message error';
        }
    });
}

const logoLink = document.querySelector('.logo');
const footerLogo = document.querySelector('.footer-logo');

function scrollToTop(e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

if (logoLink) {
    logoLink.addEventListener('click', scrollToTop);
}

if (footerLogo) {
    footerLogo.addEventListener('click', scrollToTop);
}

const animatedElements = document.querySelectorAll('.section, footer, .cta-section, .features-grid, .quality-grid, .products-grid, .logistics-grid, .contacts-grid, .stat-item, .feature-card, .quality-item, .product-card, .logistics-card, .contact-card, .hours-card, .tech-specs, .spec-card, .cta-box, .map-placeholder, .map-locations, .hero-inner, .delivery-promise-inner, .delivery-promise-item, .story-content, .story-image');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animationPlayState = 'running';
            entry.target.style.opacity = '1';
        }
    });
}, { threshold: 0.1 });

animatedElements.forEach(el => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
});

document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', () => {
        gtag('event', 'click_to_call');
    });
});

document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
    link.addEventListener('click', () => {
        gtag('event', 'email_click');
    });
});

// Initialize Cookie Consent
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('cookieConsent')) {
        new CookieConsent();
    }
});
