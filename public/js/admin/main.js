// =================================
// SIDEBAR TOGGLE (mobile)
// =================================
const sidebarToggle = document.getElementById('adminMenuToggle');
const sidebar = document.getElementById('adminSidebar');

if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
            sidebar.classList.remove('open');
        }
    });
}

// =================================
// SETTINGS TABS
// =================================
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;

        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        btn.classList.add('active');
        const target = document.getElementById(`tab-${tabId}`);
        if (target) target.classList.add('active');
    });
});

// =================================
// AUTO-DISMISS ALERTS
// =================================
document.querySelectorAll('.alert').forEach(function(el) {
    // Don't auto-dismiss alerts inside modals (e.g. #qbErrors)
    if (el.closest('.modal-overlay')) return;
    setTimeout(function() {
        el.style.transition = 'opacity 0.3s';
        el.style.opacity = '0';
        setTimeout(function() { el.remove(); }, 300);
    }, 5000);
});

// =================================
// FILTER AUTO-SUBMIT
// =================================
document.querySelectorAll('.filter-auto-submit').forEach(el => {
    el.addEventListener('change', () => {
        el.closest('form').submit();
    });
});

// =================================
// DELETE CONFIRMATION (forms with _method=DELETE)
// =================================
document.querySelectorAll('form[action*="_method=DELETE"]').forEach(form => {
    form.addEventListener('submit', (e) => {
        if (!form.querySelector('[onclick]')) {
            if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
                e.preventDefault();
            }
        }
    });
});

// =================================
// ENHANCED CALENDAR MODULE
// =================================
(function() {
    const modal = document.getElementById('qbModal');
    if (!modal) return; // Not on calendar page

    function formatSlotTime(time) {
        if (!time) return '';
        return time.replace(':', 'h');
    }

    // Helpers
    function escapeHtml(str) {
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    }

    function escapeAttr(str) {
        return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function formatDateFR(dateStr) {
        const d = new Date(dateStr + 'T00:00:00');
        const dayNames = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
        const monthNames = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
        return dayNames[d.getDay()] + ' ' + d.getDate() + ' ' + monthNames[d.getMonth()] + ' ' + d.getFullYear();
    }

    // Event delegation — single handler for all calendar actions
    document.addEventListener('click', function(e) {
        var target = e.target.closest('[data-action]');
        if (!target) return;

        var action = target.dataset.action;

        if (action === 'quick-book') {
            e.preventDefault();
            openQuickBooking(target.dataset.date, target.dataset.slot);
        } else if (action === 'view-booking') {
            e.preventDefault();
            e.stopPropagation();
            openBookingInfo(target.dataset);
        } else if (action === 'select-day') {
            // Don't navigate if the click originated from a slot card inside the cell
            if (e.target.closest('.slot-card') || e.target.closest('.timeline-slot')) return;
            var date = target.dataset.date;
            var params = new URLSearchParams(window.location.search);
            params.set('day', date);
            params.set('view', 'calendar');
            window.location.href = '/admin/bookings?' + params.toString();
        }
    });

    // Open quick booking modal
    function openQuickBooking(date, slot) {
        if (!date || !slot) return;
        // Close first if already open
        closeModal();

        document.getElementById('qbDate').value = date;
        document.getElementById('qbSlot').value = slot;
        document.getElementById('qbDateBadge').textContent = formatDateFR(date);
        document.getElementById('qbSlotBadge').textContent = formatSlotTime(slot);

        // Reset form
        document.getElementById('qbPhone').value = '';
        document.getElementById('qbFirstName').value = '';
        document.getElementById('qbLastName').value = '';
        document.getElementById('qbEmail').value = '';
        document.getElementById('qbAddress').value = '';
        document.getElementById('qbService').value = '';
        document.getElementById('qbNotes').value = '';
        document.getElementById('qbStatus').value = 'confirmed';
        document.getElementById('qbOptionsContainer').style.display = 'none';
        document.getElementById('qbOptions').innerHTML = '';
        document.getElementById('qbPriceDisplay').style.display = 'none';
        document.getElementById('qbErrors').style.display = 'none';
        document.getElementById('qbClientResults').classList.remove('active');

        // Re-enable submit button
        var submitBtn = document.getElementById('qbSubmit');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Créer le RDV';

        // Show modal via class (no inline style)
        modal.classList.add('modal-open');
        setTimeout(function() { document.getElementById('qbPhone').focus(); }, 100);
    }

    // Close modal
    function closeModal() {
        modal.classList.remove('modal-open');
    }

    document.getElementById('qbClose').addEventListener('click', function(e) {
        e.stopPropagation();
        closeModal();
    });
    document.getElementById('qbCancel').addEventListener('click', function(e) {
        e.stopPropagation();
        closeModal();
    });
    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (modal.classList.contains('modal-open')) closeModal();
            if (biModal && biModal.classList.contains('modal-open')) closeBiModal();
        }
    });

    // ===== BOOKING INFO MODAL =====
    var biModal = document.getElementById('biModal');
    var biStatusLabels = { pending: 'En attente', confirmed: 'Confirmé', completed: 'Terminé', cancelled: 'Annulé', no_show: 'Absent' };
    var statusActions = {
        pending: ['confirmed', 'cancelled'],
        confirmed: ['completed', 'cancelled'],
        completed: [],
        cancelled: [],
        no_show: []
    };
    var actionLabels = { confirmed: 'Confirmer', completed: 'Terminer', cancelled: 'Annuler' };
    var actionClasses = { confirmed: 'btn-success', completed: 'btn-info', cancelled: 'btn-danger' };

    function openBookingInfo(data) {
        if (!biModal) return;
        closeBiModal();

        document.getElementById('biId').textContent = '#' + data.bookingId;
        document.getElementById('biDate').textContent = formatDateFR(data.bookingDate);

        var timeStr = data.bookingTime ? data.bookingTime.replace(':', 'h') : '';
        if (data.bookingTimeend) timeStr += ' \u2014 ' + data.bookingTimeend.replace(':', 'h');
        document.getElementById('biTime').textContent = timeStr;

        document.getElementById('biClient').textContent = data.bookingFirstname + ' ' + data.bookingLastname;

        var phoneEl = document.getElementById('biPhone');
        phoneEl.textContent = data.bookingPhone || '\u2014';
        phoneEl.href = data.bookingPhone ? 'tel:' + data.bookingPhone.replace(/\s/g, '') : '#';

        document.getElementById('biService').textContent = data.bookingService || '';
        document.getElementById('biPrice').textContent = data.bookingPrice ? data.bookingPrice + '\u20AC' : '';

        var badge = document.getElementById('biBadge');
        badge.textContent = biStatusLabels[data.bookingStatus] || data.bookingStatus;
        badge.className = 'status-badge status-' + data.bookingStatus;

        // Build footer actions
        var footer = document.getElementById('biFooter');
        footer.innerHTML = '';

        var viewLink = document.createElement('a');
        viewLink.href = '/admin/bookings/' + data.bookingId;
        viewLink.className = 'btn btn-sm';
        viewLink.textContent = 'Voir détails';
        footer.appendChild(viewLink);

        var actions = statusActions[data.bookingStatus] || [];
        actions.forEach(function(newStatus) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn btn-sm ' + (actionClasses[newStatus] || '');
            btn.textContent = actionLabels[newStatus] || newStatus;
            btn.addEventListener('click', function() {
                changeBookingStatus(data.bookingId, newStatus);
            });
            footer.appendChild(btn);
        });

        biModal.classList.add('modal-open');
    }

    function closeBiModal() {
        if (biModal) biModal.classList.remove('modal-open');
    }

    function changeBookingStatus(bookingId, newStatus) {
        var csrf = document.getElementById('qbCsrf').value;
        var errDiv = document.getElementById('biErrors');
        errDiv.style.display = 'none';

        // Disable all footer buttons during request
        var footerBtns = document.querySelectorAll('#biFooter button');
        footerBtns.forEach(function(b) { b.disabled = true; });

        fetch('/admin/bookings/' + bookingId + '/status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRF-Token': csrf,
                'CSRF-Token': csrf
            },
            body: '_csrf=' + encodeURIComponent(csrf) + '&status=' + encodeURIComponent(newStatus),
            redirect: 'manual'
        })
        .then(function() {
            window.location.reload();
        })
        .catch(function() {
            errDiv.innerHTML = '<p>Erreur réseau. Veuillez réessayer.</p>';
            errDiv.style.display = 'block';
            footerBtns.forEach(function(b) { b.disabled = false; });
        });
    }

    if (biModal) {
        document.getElementById('biClose').addEventListener('click', function(e) {
            e.stopPropagation();
            closeBiModal();
        });
        biModal.addEventListener('click', function(e) {
            if (e.target === biModal) closeBiModal();
        });
    }

    // Client search with debounce
    var searchTimeout = null;
    var phoneInput = document.getElementById('qbPhone');
    var resultsDiv = document.getElementById('qbClientResults');

    phoneInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        var q = phoneInput.value.trim();
        if (q.length < 2) {
            resultsDiv.classList.remove('active');
            resultsDiv.innerHTML = '';
            return;
        }
        searchTimeout = setTimeout(function() {
            fetch('/admin/bookings/search-clients?q=' + encodeURIComponent(q))
                .then(function(r) { return r.json(); })
                .then(function(clients) {
                    if (!clients.length) {
                        resultsDiv.classList.remove('active');
                        resultsDiv.innerHTML = '';
                        return;
                    }
                    var html = '';
                    clients.forEach(function(c) {
                        html += '<div class="client-result-item" data-id="' + c.id + '"'
                            + ' data-firstname="' + escapeAttr(c.firstName) + '"'
                            + ' data-lastname="' + escapeAttr(c.lastName) + '"'
                            + ' data-phone="' + escapeAttr(c.phone) + '"'
                            + ' data-email="' + escapeAttr(c.email) + '"'
                            + ' data-address="' + escapeAttr(c.address) + '">'
                            + '<strong>' + escapeHtml(c.firstName) + ' ' + escapeHtml(c.lastName) + '</strong>'
                            + '<small>' + escapeHtml(c.phone) + (c.email ? ' — ' + escapeHtml(c.email) : '') + '</small>'
                            + '</div>';
                    });
                    resultsDiv.innerHTML = html;
                    resultsDiv.classList.add('active');

                    // Click to select
                    resultsDiv.querySelectorAll('.client-result-item').forEach(function(item) {
                        item.addEventListener('click', function() {
                            document.getElementById('qbPhone').value = item.dataset.phone;
                            document.getElementById('qbFirstName').value = item.dataset.firstname;
                            document.getElementById('qbLastName').value = item.dataset.lastname;
                            document.getElementById('qbEmail').value = item.dataset.email;
                            document.getElementById('qbAddress').value = item.dataset.address;
                            resultsDiv.classList.remove('active');
                            resultsDiv.innerHTML = '';
                        });
                    });
                })
                .catch(function() {
                    resultsDiv.classList.remove('active');
                });
        }, 300);
    });

    // Close search results on outside click
    document.addEventListener('click', function(e) {
        if (!resultsDiv.contains(e.target) && e.target !== phoneInput) {
            resultsDiv.classList.remove('active');
        }
    });

    // Service change -> load options + price
    var serviceSelect = document.getElementById('qbService');
    var currentServiceOptions = [];

    serviceSelect.addEventListener('change', function() {
        var serviceId = serviceSelect.value;
        var optionsContainer = document.getElementById('qbOptionsContainer');
        var optionsDiv = document.getElementById('qbOptions');
        optionsDiv.innerHTML = '';
        optionsContainer.style.display = 'none';
        currentServiceOptions = [];

        if (!serviceId) {
            document.getElementById('qbPriceDisplay').style.display = 'none';
            return;
        }

        // Show base price
        var opt = serviceSelect.options[serviceSelect.selectedIndex];
        var basePrice = parseFloat(opt.dataset.price) || 0;
        document.getElementById('qbPriceValue').textContent = basePrice.toFixed(2);
        document.getElementById('qbPriceDisplay').style.display = 'block';

        // Fetch options
        fetch('/api/bookings/service-options/' + serviceId)
            .then(function(r) { return r.json(); })
            .then(function(data) {
                if (data.options && data.options.length > 0) {
                    currentServiceOptions = data.options;
                    var html = '';
                    data.options.forEach(function(o, i) {
                        html += '<label class="qb-option-item">'
                            + '<input type="checkbox" class="qb-option-check" data-name="' + escapeAttr(o.name) + '" data-price="' + escapeAttr(o.price || '0') + '">'
                            + ' ' + escapeHtml(o.name)
                            + '<span class="qb-option-price">+' + escapeHtml(o.price || '0') + '</span>'
                            + '</label>';
                    });
                    optionsDiv.innerHTML = html;
                    optionsContainer.style.display = 'block';

                    // Recalculate on check
                    optionsDiv.querySelectorAll('.qb-option-check').forEach(function(cb) {
                        cb.addEventListener('change', recalcPrice);
                    });
                }
            })
            .catch(function() {});
    });

    function recalcPrice() {
        var opt = serviceSelect.options[serviceSelect.selectedIndex];
        var total = parseFloat(opt.dataset.price) || 0;
        document.querySelectorAll('.qb-option-check:checked').forEach(function(cb) {
            var p = parseFloat(cb.dataset.price.replace(/[^0-9.,]/g, '').replace(',', '.'));
            if (!isNaN(p)) total += p;
        });
        document.getElementById('qbPriceValue').textContent = total.toFixed(2);
    }

    // Submit booking
    document.getElementById('qbSubmit').addEventListener('click', function() {
        var errDiv = document.getElementById('qbErrors');
        errDiv.style.display = 'none';

        var selectedOptions = [];
        document.querySelectorAll('.qb-option-check:checked').forEach(function(cb) {
            selectedOptions.push(cb.dataset.name);
        });

        var body = {
            date: document.getElementById('qbDate').value,
            timeSlot: document.getElementById('qbSlot').value,
            phone: document.getElementById('qbPhone').value,
            firstName: document.getElementById('qbFirstName').value,
            lastName: document.getElementById('qbLastName').value,
            email: document.getElementById('qbEmail').value,
            address: document.getElementById('qbAddress').value,
            serviceId: parseInt(document.getElementById('qbService').value, 10),
            notes: document.getElementById('qbNotes').value,
            status: document.getElementById('qbStatus').value,
            selectedOptions: selectedOptions
        };

        var csrf = document.getElementById('qbCsrf').value;

        var submitBtn = document.getElementById('qbSubmit');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Création...';

        fetch('/admin/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-Token': csrf,
                'CSRF-Token': csrf
            },
            body: JSON.stringify(body)
        })
        .then(function(r) { return r.json().then(function(data) { return { ok: r.ok, data: data }; }); })
        .then(function(result) {
            if (result.data.success) {
                // Redirect back with day selected
                var params = new URLSearchParams(window.location.search);
                params.set('view', 'calendar');
                params.set('day', body.date);
                window.location.href = '/admin/bookings?' + params.toString();
            } else {
                var errors = result.data.errors || (result.data.error ? [result.data.error] : ['Erreur inconnue']);
                errDiv.innerHTML = '<p>' + errors.map(escapeHtml).join('</p><p>') + '</p>';
                errDiv.style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.textContent = 'Créer le RDV';
            }
        })
        .catch(function() {
            errDiv.innerHTML = '<p>Erreur réseau. Veuillez réessayer.</p>';
            errDiv.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Créer le RDV';
        });
    });
})();
