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
document.querySelectorAll('.alert').forEach(alert => {
    setTimeout(() => {
        alert.style.transition = 'opacity 0.3s';
        alert.style.opacity = '0';
        setTimeout(() => alert.remove(), 300);
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
