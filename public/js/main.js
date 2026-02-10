// =================================
// NAVIGATION MOBILE
// =================================
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.querySelector('.nav-menu');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        const isOpen = navMenu.classList.toggle('active');
        menuToggle.classList.toggle('active');
        menuToggle.setAttribute('aria-expanded', isOpen);
    });

    document.querySelectorAll('.nav-link, .btn-book').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        });
    });
}

// =================================
// NAVBAR SCROLL EFFECT
// =================================
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// =================================
// SMOOTH SCROLL
// =================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);

        if (target) {
            e.preventDefault();
            const navHeight = navbar.offsetHeight;
            const targetPosition = target.offsetTop - navHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// =================================
// INTERSECTION OBSERVER - FADE IN
// =================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
});

// =================================
// LIGHTBOX (class-based, prev/next, focus trap)
// =================================
class Lightbox {
    constructor() {
        this.lightbox = document.getElementById('lightbox');
        this.lightboxImg = document.getElementById('lightboxImg');
        this.images = [];
        this.currentIndex = 0;

        if (!this.lightbox) return;

        this.prevBtn = this.lightbox.querySelector('.lightbox-prev');
        this.nextBtn = this.lightbox.querySelector('.lightbox-next');
        this.closeBtn = this.lightbox.querySelector('.lightbox-close');

        this.init();
    }

    init() {
        const galleryItems = document.querySelectorAll('.gallery-item');
        if (!galleryItems.length) return;

        galleryItems.forEach((item, index) => {
            const img = item.querySelector('img');
            this.images.push({ src: img.src, alt: img.alt });
            item.addEventListener('click', () => this.open(index));
        });

        this.closeBtn.addEventListener('click', () => this.close());
        this.prevBtn.addEventListener('click', () => this.prev());
        this.nextBtn.addEventListener('click', () => this.next());

        this.lightbox.addEventListener('click', (e) => {
            if (e.target === this.lightbox) this.close();
        });

        document.addEventListener('keydown', (e) => {
            if (!this.lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') this.close();
            if (e.key === 'ArrowLeft') this.prev();
            if (e.key === 'ArrowRight') this.next();
        });
    }

    open(index) {
        this.currentIndex = index;
        this.update();
        this.lightbox.classList.add('active');
        this.lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        this.closeBtn.focus();
    }

    close() {
        this.lightbox.classList.remove('active');
        this.lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.update();
    }

    next() {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.update();
    }

    update() {
        const image = this.images[this.currentIndex];
        this.lightboxImg.src = image.src;
        this.lightboxImg.alt = image.alt;
    }
}

new Lightbox();

// =================================
// BOOKING FORM (fetch API)
// =================================
const bookingForm = document.getElementById('bookingForm');

if (bookingForm) {
    bookingForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const submitBtn = document.getElementById('bookingSubmit');
        const originalText = submitBtn.textContent;

        submitBtn.disabled = true;
        submitBtn.textContent = 'Envoi en cours...';

        const formData = new FormData(this);
        const data = Object.fromEntries(formData.entries());

        // Collect selected options as array
        const selectedOptions = [];
        document.querySelectorAll('#serviceOptionsContainer input[type="checkbox"]:checked').forEach(cb => {
            selectedOptions.push(cb.value);
        });
        if (selectedOptions.length > 0) {
            data.selectedOptions = selectedOptions;
        }

        try {
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': data._csrf
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                showNotification('Demande envoyée ! Nous vous confirmerons votre RDV rapidement.', 'success');
                bookingForm.reset();
            } else {
                const errorMsg = result.errors ? result.errors.join(', ') : (result.error || 'Une erreur est survenue');
                showNotification(errorMsg, 'error');
            }
        } catch (err) {
            showNotification('Erreur de connexion. Veuillez réessayer.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

// =================================
// NOTIFICATIONS
// =================================
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.setAttribute('role', 'alert');

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// =================================
// DATE PICKER - MIN DATE TOMORROW + BLOCKED DATES
// =================================
const dateInput = document.getElementById('date');
let blockedDatesData = [];
let closedDaysData = [];

if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.min = tomorrow.toISOString().split('T')[0];

    // Fetch blocked dates and closed days
    fetch('/api/bookings/blocked-dates')
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                blockedDatesData = data.blockedDates || [];
                closedDaysData = data.closedDays || [];
            }
        })
        .catch(() => {});

    dateInput.addEventListener('change', function() {
        const selectedDate = new Date(this.value);
        const dayOfWeek = selectedDate.getDay();

        // Check closed days
        if (closedDaysData.includes(dayOfWeek)) {
            showNotification('Ce jour de la semaine n\'est pas disponible.', 'error');
            this.value = '';
            return;
        }

        // Check blocked dates
        const dateStr = this.value;
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');

        const isBlocked = blockedDatesData.some(bd => {
            const bdDate = bd.blocked_date.split('T')[0];
            if (bdDate === dateStr) return true;
            if (bd.is_recurring) {
                const bdParts = bdDate.split('-');
                return bdParts[1] === month && bdParts[2] === day;
            }
            return false;
        });

        if (isBlocked) {
            showNotification('Cette date n\'est pas disponible. Veuillez en choisir une autre.', 'error');
            this.value = '';
        }
    });
}

// =================================
// SERVICE OPTIONS CHECKBOXES
// =================================
const serviceSelect = document.getElementById('serviceId');

if (serviceSelect) {
    serviceSelect.addEventListener('change', async function() {
        const serviceId = this.value;
        const optionsContainer = document.getElementById('serviceOptionsContainer');
        const priceDisplay = document.getElementById('estimatedPrice');

        if (optionsContainer) optionsContainer.innerHTML = '';
        if (priceDisplay) priceDisplay.textContent = '';

        if (!serviceId) return;

        try {
            const response = await fetch(`/api/bookings/service-options/${serviceId}`);
            const data = await response.json();

            if (data.success && data.options && data.options.length > 0 && optionsContainer) {
                let html = '<label>Options disponibles</label><div class="options-list">';
                data.options.forEach((opt, i) => {
                    html += `
                        <label class="option-checkbox">
                            <input type="checkbox" name="selectedOptions" value="${opt.name}" data-price="${opt.price}">
                            <span class="option-name">${opt.name}</span>
                            <span class="option-price">${opt.price}</span>
                        </label>`;
                });
                html += '</div>';
                optionsContainer.innerHTML = html;

                // Update price display on checkbox change
                optionsContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                    cb.addEventListener('change', () => updatePriceDisplay(data.price));
                });
            }

            if (priceDisplay && data.price) {
                priceDisplay.textContent = `Prix de base : ${parseFloat(data.price).toFixed(2).replace('.', ',')}€`;
            }
        } catch (err) {
            // Silently fail
        }
    });
}

function updatePriceDisplay(basePrice) {
    const priceDisplay = document.getElementById('estimatedPrice');
    if (!priceDisplay) return;

    let total = parseFloat(basePrice);
    document.querySelectorAll('#serviceOptionsContainer input[type="checkbox"]:checked').forEach(cb => {
        const priceStr = cb.dataset.price;
        const match = priceStr.match(/([+-]?\d+(?:[.,]\d+)?)/);
        if (match) total += parseFloat(match[1].replace(',', '.'));
    });

    priceDisplay.textContent = `Prix estimé : ${total.toFixed(2).replace('.', ',')}€`;
}

// =================================
// SERVICE CARD CLICK → BOOKING FORM
// =================================
const serviceCards = document.querySelectorAll('.service-card');

serviceCards.forEach(card => {
    card.addEventListener('click', () => {
        const serviceId = card.dataset.serviceId;
        const bookingSection = document.getElementById('booking');

        if (bookingSection && serviceSelect && serviceId) {
            bookingSection.scrollIntoView({ behavior: 'smooth' });
            serviceSelect.value = serviceId;
        }
    });
});

// =================================
// ACTIVE NAV LINK ON SCROLL
// =================================
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

        if (navLink) {
            if (scrollPos > sectionTop && scrollPos <= sectionTop + sectionHeight) {
                navLink.classList.add('active');
            } else {
                navLink.classList.remove('active');
            }
        }
    });
});
