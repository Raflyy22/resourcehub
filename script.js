let currentUser = JSON.parse(localStorage.getItem('frh_current_user')) || null;
let adminCreds = JSON.parse(localStorage.getItem('frh_admin_creds')) || { user: 'superadmin', pass: 'securepass99', pin: '8888' };
let adminFailedAttempts = parseInt(localStorage.getItem('frh_admin_fails')) || 0;
let adminLockUntil = parseInt(localStorage.getItem('frh_admin_lock')) || 0;

let resources = JSON.parse(localStorage.getItem('frh_resources')) || [
    {
        id: 1,
        name: "Sketchware Pro Mod",
        category: "Aplikasi",
        subcategory: "Android 64-bit",
        version: "v6.3",
        description: "Aplikasi Android builder visual dengan dukungan modifikasi penuh.",
        fileData: "https://drive.google.com",
        fileSize: "15.4 MB",
        screenshot: "",
        uploader: "superadmin",
        likes: 12,
        downloads: 45,
        likedBy: [],
        savedBy: [],
        ratings: { 5: 4, 4: 2 },
        ratedUsers: {},
        comments: [{ user: "Budi", text: "Mantap aplikasinya work 100%!" }]
    },
    {
        id: 2,
        name: "Template UI Kit Dashboard Admin",
        category: "File",
        subcategory: "Web Universal",
        version: "v2.0",
        description: "Kumpulan aset template ZIP HTML, CSS, dan Tailwind.",
        fileData: "https://mediafire.com",
        fileSize: "4.2 MB",
        screenshot: "",
        uploader: "superadmin",
        likes: 25,
        downloads: 88,
        likedBy: [],
        savedBy: [],
        ratings: { 5: 10 },
        ratedUsers: {},
        comments: []
    }
];

let announcements = JSON.parse(localStorage.getItem('frh_announcements')) || [
    { id: 1, title: "Selamat Datang di FileHub Ultimate Suite v3!", content: "Fitur Leaderboard bulanan, folder koleksi kustom, dan pratinjau teks kode kini aktif.", date: "10 Agustus 2026" }
];

let userDownloads = JSON.parse(localStorage.getItem('frh_user_downloads')) || {};
let userPoints = JSON.parse(localStorage.getItem('frh_user_points')) || {};
let userCollections = JSON.parse(localStorage.getItem('frh_user_collections')) || {};
let brokenReports = JSON.parse(localStorage.getItem('frh_broken_reports')) || [];
let userRecentSearches = JSON.parse(localStorage.getItem('frh_recent_searches')) || [];
let notifications = JSON.parse(localStorage.getItem('frh_notifications')) || [
    { id: 1, text: "Selamat datang di platform FileHub Ultimate Suite!", type: 'info', read: false, time: "Baru saja" }
];

let currentFilter = 'All';
let activeResourceId = null;
let adminSessionTimer = null;

document.addEventListener('DOMContentLoaded', () => {
    checkAuthState();
    checkAdminLockState();
    renderNotifications();
    
    // Auto Theme OS System Preference or Saved
    const savedTheme = localStorage.getItem('frh_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const activeTheme = savedTheme || (prefersDark ? 'dark' : 'light');

    if (activeTheme === 'light') {
        document.documentElement.classList.remove('dark');
        document.getElementById('theme-icon').className = "fa-solid fa-sun text-xs";
    }

    const userInp = document.getElementById('uni-user');
    const passInp = document.getElementById('uni-pass');
    [userInp, passInp].forEach(el => {
        el.addEventListener('input', checkUnifiedAdminTrigger);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
            e.preventDefault();
            const searchBox = document.getElementById('search-input');
            if (searchBox) searchBox.focus();
        }
        if (e.key === 'Escape') {
            closeModal();
            closeCustomConfirm();
            closeReaderMode();
            closeCollectionModal();
        }
    });

    if (currentUser && currentUser.role === 'admin') {
        resetAdminSessionTimer();
    }
});

function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    const themeIcon = document.getElementById('theme-icon');
    if (isDark) {
        localStorage.setItem('frh_theme', 'dark');
        themeIcon.className = "fa-solid fa-moon text-xs";
    } else {
        localStorage.setItem('frh_theme', 'light');
        themeIcon.className = "fa-solid fa-sun text-xs";
    }
}

function togglePasswordVisibility(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = "fa-regular fa-eye-slash";
    } else {
        input.type = 'password';
        icon.className = "fa-regular fa-eye";
    }
}

function addNotification(text, type = 'info') {
    notifications.unshift({ id: Date.now(), text, type, read: false, time: "Baru saja" });
    localStorage.setItem('frh_notifications', JSON.stringify(notifications));
    renderNotifications();
}

function renderNotifications() {
    const list = document.getElementById('notif-list');
    const badge = document.getElementById('notif-badge');
    list.innerHTML = '';
    
    let unreadCount = notifications.filter(n => !n.read).length;
    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }

    if (notifications.length === 0) {
        list.innerHTML = `<p class="text-[11px] text-slate-500 text-center py-2">Tidak ada notifikasi.</p>`;
        return;
    }

    notifications.forEach(n => {
        let borderColor = 'border-cyan-500/30';
        if (n.type === 'admin') borderColor = 'border-amber-500/30';
        if (n.type === 'danger') borderColor = 'border-rose-500/30';

        list.innerHTML += `
            <div class="bg-slate-950 p-2.5 rounded-xl border ${borderColor} text-xs space-y-1 ${n.read ? 'opacity-60' : ''}">
                <p class="text-slate-300">${n.text}</p>
                <span class="text-[9px] text-slate-500">${n.time}</span>
            </div>
        `;
    });
}

function toggleNotificationDropdown() {
    const dropdown = document.getElementById('notif-dropdown');
    dropdown.classList.toggle('hidden');
}

function clearNotifications() {
    notifications.forEach(n => n.read = true);
    localStorage.setItem('frh_notifications', JSON.stringify(notifications));
    renderNotifications();
}

function addPoints(username, amount) {
    if (!userPoints[username]) userPoints[username] = 0;
    userPoints[username] += amount;
    localStorage.setItem('frh_user_points', JSON.stringify(userPoints));
}

function formatFileSizeInput(el) {
    let val = el.value.trim();
    if (!val) return;
    if (!val.toLowerCase().includes('mb') && !val.toLowerCase().includes('kb') && !val.toLowerCase().includes('gb')) {
        let num = parseFloat(val);
        if (!isNaN(num)) {
            el.value = num + " MB";
        }
    }
}

function switchAuthTab(tab) {
    if (tab === 'login') {
        document.getElementById('form-login-unified').classList.remove('hidden');
        document.getElementById('form-reg-unified').classList.add('hidden');
        document.getElementById('tab-login').className = "flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all text-cyan-400 bg-slate-800 shadow-sm cursor-pointer";
        document.getElementById('tab-reg').className = "flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all text-slate-400 hover:text-slate-200 cursor-pointer";
    } else {
        document.getElementById('form-login-unified').classList.add('hidden');
        document.getElementById('form-reg-unified').classList.remove('hidden');
        document.getElementById('tab-reg').className = "flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all text-cyan-400 bg-slate-800 shadow-sm cursor-pointer";
        document.getElementById('tab-login').className = "flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all text-slate-400 hover:text-slate-200 cursor-pointer";
    }
}

function checkUnifiedAdminTrigger() {
    const uVal = document.getElementById('uni-user').value.trim();
    const pVal = document.getElementById('uni-pass').value;
    const pinContainer = document.getElementById('container-admin-pin');

    if (uVal === adminCreds.user && pVal === adminCreds.pass) {
        pinContainer.classList.remove('hidden');
    } else {
        pinContainer.classList.add('hidden');
    }
}

function handleUnifiedLogin(e) {
    e.preventDefault();
    const uVal = document.getElementById('uni-user').value.trim();
    const pVal = document.getElementById('uni-pass').value;
    const pinVal = document.getElementById('uni-pin').value;

    if (uVal === adminCreds.user && pVal === adminCreds.pass) {
        const now = Date.now();
        if (now < adminLockUntil) return;

        if (pinVal === adminCreds.pin) {
            adminFailedAttempts = 0;
            localStorage.setItem('frh_admin_fails', adminFailedAttempts);
            currentUser = { username: 'Super Administrator', role: 'admin' };
            resetAdminSessionTimer();
        } else {
            adminFailedAttempts++;
            localStorage.setItem('frh_admin_fails', adminFailedAttempts);
            if (adminFailedAttempts >= 3) {
                adminLockUntil = Date.now() + 30000;
                localStorage.setItem('frh_admin_lock', adminLockUntil);
                adminFailedAttempts = 0;
                localStorage.setItem('frh_admin_fails', adminFailedAttempts);
            }
            alert(`PIN Super Admin Salah! Percobaan gagal: ${adminFailedAttempts}/3`);
            checkAdminLockState();
            return;
        }
    } else {
        let users = JSON.parse(localStorage.getItem('frh_users')) || [];
        const validUser = users.find(u => u.username === uVal && u.password === pVal);
        if (!validUser && uVal !== 'user') {
            alert('Username atau Password salah!');
            return;
        }
        currentUser = { username: uVal, role: 'user' };
    }
    localStorage.setItem('frh_current_user', JSON.stringify(currentUser));
    checkAuthState();
}

function resetAdminSessionTimer() {
    if (adminSessionTimer) clearTimeout(adminSessionTimer);
    adminSessionTimer = setTimeout(() => {
        alert('Sesi Super Admin telah berakhir karena tidak ada aktivitas selama 15 menit.');
        logout();
    }, 15 * 60 * 1000);
}

document.addEventListener('mousemove', () => { if (currentUser && currentUser.role === 'admin') resetAdminSessionTimer(); });
document.addEventListener('keypress', () => { if (currentUser && currentUser.role === 'admin') resetAdminSessionTimer(); });

function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value;
    let users = JSON.parse(localStorage.getItem('frh_users')) || [];
    if (users.some(u => u.username === username)) {
        alert('Username sudah terdaftar!');
        return;
    }
    users.push({ username, password });
    localStorage.setItem('frh_users', JSON.stringify(users));
    alert('Registrasi berhasil! Silakan masuk.');
    switchAuthTab('login');
}

function checkAdminLockState() {
    const now = Date.now();
    const warningEl = document.getElementById('admin-lock-warning');
    const submitBtn = document.getElementById('uni-submit-btn');

    if (now < adminLockUntil) {
        const remainingSec = Math.ceil((adminLockUntil - now) / 1000);
        warningEl.textContent = `Akses Admin terkunci karena salah PIN 3x. Coba lagi dalam ${remainingSec} detik.`;
        warningEl.classList.remove('hidden');
        submitBtn.disabled = true;
        submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
        setTimeout(checkAdminLockState, 1000);
    } else {
        warningEl.classList.add('hidden');
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
}

function logout() {
    localStorage.removeItem('frh_current_user');
    currentUser = null;
    if (adminSessionTimer) clearTimeout(adminSessionTimer);
    checkAuthState();
}

function checkAuthState() {
    const authModal = document.getElementById('auth-modal');
    const mainApp = document.getElementById('main-app');
    if (!currentUser) {
        authModal.classList.remove('hidden');
        mainApp.classList.add('hidden');
    } else {
        authModal.classList.add('hidden');
        mainApp.classList.remove('hidden');
        document.getElementById('user-display-name').textContent = currentUser.username;
        document.getElementById('user-role-badge').textContent = currentUser.role === 'admin' ? 'Super Admin' : getUserBadge(currentUser.username);

        if (currentUser.role === 'admin') {
            document.getElementById('admin-panel').classList.remove('hidden');
            document.getElementById('user-panel').classList.add('hidden');
            document.getElementById('profile-panel').classList.add('hidden');
            document.getElementById('faq-panel').classList.add('hidden');
            document.getElementById('leaderboard-panel').classList.add('hidden');
            document.getElementById('nav-profile-btn').classList.add('hidden');
            renderAdminDashboard();
        } else {
            document.getElementById('admin-panel').classList.add('hidden');
            document.getElementById('user-panel').classList.remove('hidden');
            document.getElementById('nav-profile-btn').classList.remove('hidden');
            renderAnnouncements();
            renderResources();
        }
    }
}

function getUserBadge(username) {
    let pts = userPoints[username] || 0;
    if (pts >= 100) return 'Elite Contributor 🏆';
    if (pts >= 50) return 'Active Contributor 🌟';
    if (pts >= 20) return 'Active Member 💬';
    return 'Member Baru 🌱';
}

function switchMainView(view) {
    ['user-panel', 'profile-panel', 'faq-panel', 'leaderboard-panel'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });

    if (view === 'home') {
        document.getElementById('user-panel').classList.remove('hidden');
        renderResources();
    } else if (view === 'profile') {
        document.getElementById('profile-panel').classList.remove('hidden');
        renderProfilePage();
    } else if (view === 'faq') {
        document.getElementById('faq-panel').classList.remove('hidden');
    } else if (view === 'leaderboard') {
        document.getElementById('leaderboard-panel').classList.remove('hidden');
        renderLeaderboardPage();
    }
}

function renderLeaderboardPage() {
    const list = document.getElementById('leaderboard-list');
    list.innerHTML = '';
    
    let users = JSON.parse(localStorage.getItem('frh_users')) || [];
    let ranking = users.map(u => ({ username: u.username, points: userPoints[u.username] || 0 }));
    ranking.push({ username: 'superadmin', points: userPoints['superadmin'] || 150 });

    ranking.sort((a, b) => b.points - a.points);

    ranking.forEach((r, idx) => {
        let rankBadge = `#${idx + 1}`;
        if (idx === 0) rankBadge = '👑 #1';
        if (idx === 1) rankBadge = '🥈 #2';
        if (idx === 2) rankBadge = '🥉 #3';

        list.innerHTML += `
            <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div class="flex items-center gap-3">
                    <span class="font-bold text-amber-400 w-10">${rankBadge}</span>
                    <span class="font-bold text-white">${r.username}</span>
                </div>
                <div class="text-cyan-400 font-bold">${r.points} Pts</div>
            </div>
        `;
    });
}

function openCreateCollectionModal() {
    document.getElementById('collection-modal').classList.remove('hidden');
}

function closeCollectionModal() {
    document.getElementById('collection-modal').classList.add('hidden');
}

function saveCustomCollection() {
    const colName = document.getElementById('col-name-input').value.trim();
    if (!colName) return;
    if (!userCollections[currentUser.username]) userCollections[currentUser.username] = {};
    if (!userCollections[currentUser.username][colName]) {
        userCollections[currentUser.username][colName] = [];
    }
    localStorage.setItem('frh_user_collections', JSON.stringify(userCollections));
    document.getElementById('col-name-input').value = '';
    closeCollectionModal();
    renderProfilePage();
    alert(`Folder koleksi "${colName}" berhasil dibuat!`);
}

function switchAdminTab(type) {
    ['upload', 'announcement', 'manage', 'analytics', 'backup', 'settings'].forEach(t => {
        document.getElementById(`admin-${t}-section`).classList.add('hidden');
        document.getElementById(`btn-tab-${t}`).className = "px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer";
    });
    document.getElementById(`admin-${type}-section`).classList.remove('hidden');
    document.getElementById(`btn-tab-${type}`).className = "px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer";
    if (type === 'manage') renderAdminManageList();
    if (type === 'analytics') renderAdminAnalytics();
}

function validateLinkInput() {
    const url = document.getElementById('up-link-url').value.toLowerCase();
    const hint = document.getElementById('link-validation-hint');
    if (url.includes('drive.google.com')) {
        hint.innerHTML = `<span class="text-emerald-400"><i class="fa-solid fa-check-circle"></i> Terdeteksi: Google Drive Valid</span>`;
    } else if (url.includes('mediafire.com')) {
        hint.innerHTML = `<span class="text-emerald-400"><i class="fa-solid fa-check-circle"></i> Terdeteksi: MediaFire Valid</span>`;
    } else if (url.includes('mega.nz')) {
        hint.innerHTML = `<span class="text-emerald-400"><i class="fa-solid fa-check-circle"></i> Terdeteksi: MEGA Valid</span>`;
    } else {
        hint.innerHTML = `<span class="text-amber-400"><i class="fa-solid fa-triangle-exclamation"></i> Domain tidak dikenal</span>`;
    }
}

function testLinkQuickCheck() {
    const url = document.getElementById('up-link-url').value;
    if (!url) {
        alert('Masukkan URL tautan terlebih dahulu.');
        return;
    }
    window.open(url, '_blank');
}

function handleSaveResource(e) {
    e.preventDefault();
    const editId = document.getElementById('edit-resource-id').value;
    const name = document.getElementById('up-name').value;
    const category = document.getElementById('up-category').value;
    const subcategory = document.getElementById('up-subcategory').value.trim();
    const version = document.getElementById('up-version').value.trim();
    const description = document.getElementById('up-desc').value;
    const fileData = document.getElementById('up-link-url').value;
    const fileSize = document.getElementById('up-link-size').value;
    const screenshot = document.getElementById('up-screenshot').value.trim();

    if (editId) {
        let res = resources.find(r => r.id == editId);
        if (res) {
            res.name = name;
            res.category = category;
            res.subcategory = subcategory;
            res.version = version;
            res.description = description;
            res.fileData = fileData;
            res.fileSize = fileSize;
            res.screenshot = screenshot;
        }
        alert('Tautan resource berhasil diperbarui!');
        resetUploadForm();
    } else {
        const newRes = {
            id: Date.now(),
            name, category, subcategory, version, description,
            fileData, fileSize, screenshot,
            uploader: currentUser.username,
            likes: 0, downloads: 0,
            likedBy: [], savedBy: [],
            ratings: {}, ratedUsers: {},
            comments: []
        };
        resources.unshift(newRes);
        addNotification(`Resource baru dipublikasikan: ${name}`, 'admin');
        alert('Tautan resource berhasil dipublikasikan!');
        e.target.reset();
    }

    localStorage.setItem('frh_resources', JSON.stringify(resources));
    renderAdminManageList();
}

function editResource(id) {
    const res = resources.find(r => r.id === id);
    if (!res) return;
    switchAdminTab('upload');
    document.getElementById('form-upload-title').innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Edit Resource: ${res.name}`;
    document.getElementById('edit-resource-id').value = res.id;
    document.getElementById('up-name').value = res.name;
    document.getElementById('up-category').value = res.category;
    document.getElementById('up-subcategory').value = res.subcategory;
    document.getElementById('up-version').value = res.version || 'v1.0';
    document.getElementById('up-link-url').value = res.fileData;
    document.getElementById('up-link-size').value = res.fileSize;
    document.getElementById('up-screenshot').value = res.screenshot || '';
    document.getElementById('up-desc').value = res.description;
    document.getElementById('btn-submit-resource').textContent = 'Simpan Perubahan';
    document.getElementById('btn-cancel-edit').classList.remove('hidden');
}

function resetUploadForm() {
    document.getElementById('edit-resource-id').value = '';
    document.getElementById('form-upload-title').innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> Tambah Link File / Aplikasi Baru`;
    document.getElementById('btn-submit-resource').innerHTML = `<i class="fa-solid fa-upload"></i> Publikasikan Tautan Resource`;
    document.getElementById('btn-cancel-edit').classList.add('hidden');
    document.querySelector('form').reset();
    document.getElementById('link-validation-hint').innerHTML = '';
}

let pendingDeleteId = null;
function deleteResource(id) {
    pendingDeleteId = id;
    const res = resources.find(r => r.id === id);
    document.getElementById('confirm-msg').textContent = `Apakah Anda yakin ingin menghapus "${res ? res.name : 'resource ini'}"?`;
    document.getElementById('custom-confirm-modal').classList.remove('hidden');
    document.getElementById('confirm-btn-yes').onclick = executeDeleteResource;
}

function executeDeleteResource() {
    if (pendingDeleteId) {
        resources = resources.filter(r => r.id !== pendingDeleteId);
        localStorage.setItem('frh_resources', JSON.stringify(resources));
        renderAdminManageList();
        closeCustomConfirm();
    }
}

function closeCustomConfirm() {
    document.getElementById('custom-confirm-modal').classList.add('hidden');
    pendingDeleteId = null;
}

function openReaderMode() {
    const res = resources.find(r => r.id === activeResourceId);
    if (!res) return;
    document.getElementById('reader-content').textContent = res.description;
    document.getElementById('reader-mode-modal').classList.remove('hidden');
}

function openTextPreview() {
    openReaderMode(); // Menggunakan modal pratinjau teks yang sama
}

function closeReaderMode() {
    document.getElementById('reader-mode-modal').classList.add('hidden');
}

function renderAdminManageList() {
    const list = document.getElementById('admin-manage-list');
    list.innerHTML = '';
    if (resources.length === 0) {
        list.innerHTML = `<p class="text-xs text-slate-500">Belum ada resource.</p>`;
        return;
    }
    resources.forEach(res => {
        list.innerHTML += `
            <div class="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between text-xs">
                <div>
                    <span class="font-bold text-white">${res.name} (${res.version || 'v1.0'})</span>
                    <span class="ml-2 px-2 py-0.5 rounded bg-slate-800 text-cyan-400">${res.category} / ${res.subcategory}</span>
                </div>
                <div class="flex gap-2">
                    <button onclick="editResource(${res.id})" class="px-3 py-1.5 bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-slate-950 font-bold rounded-lg transition-all cursor-pointer">Edit</button>
                    <button onclick="deleteResource(${res.id})" class="px-3 py-1.5 bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-slate-950 font-bold rounded-lg transition-all cursor-pointer">Hapus</button>
                </div>
            </div>
        `;
    });
}

function renderAdminAnalytics() {
    document.getElementById('stat-total-res').textContent = resources.length;
    let users = JSON.parse(localStorage.getItem('frh_users')) || [];
    document.getElementById('stat-total-users').textContent = users.length;

    const repList = document.getElementById('admin-reports-list');
    repList.innerHTML = '';
    if (brokenReports.length === 0) {
        repList.innerHTML = `<p class="text-xs text-slate-500">Belum ada laporan link rusak.</p>`;
        return;
    }

    // Monitor Kesehatan Link: Mengelompokkan laporan rusak terbanyak ke barisan teratas
    let reportCounts = {};
    brokenReports.forEach(r => {
        reportCounts[r.resName] = (reportCounts[r.resName] || 0) + 1;
    });

    let sortedReports = Object.keys(reportCounts).sort((a, b) => reportCounts[b] - reportCounts[a]);

    sortedReports.forEach(resName => {
        repList.innerHTML += `
            <div class="bg-slate-950 border border-rose-500/30 p-3 rounded-xl text-xs flex justify-between items-center">
                <div>
                    <span class="font-bold text-rose-400">${resName}</span> mendapati <span class="text-amber-400 font-bold">${reportCounts[resName]} laporan</span> link rusak (Prioritas Perbaikan).
                </div>
                <button onclick="resolveAllReportsFor('${resName}')" class="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer">Selesaikan</button>
            </div>
        `;
    });
}

function resolveAllReportsFor(resName) {
    brokenReports = brokenReports.filter(rep => rep.resName !== resName);
    localStorage.setItem('frh_broken_reports', JSON.stringify(brokenReports));
    renderAdminAnalytics();
}

function exportDataBackup() {
    const backupData = {
        resources,
        announcements,
        users: JSON.parse(localStorage.getItem('frh_users')) || [],
        brokenReports,
        userPoints,
        userCollections,
        exportDate: new Date().toISOString()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "filehub_ultimatesuite_v3_backup.json");
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
}

function handleUpdateAdminCredentials(e) {
    e.preventDefault();
    adminCreds.user = document.getElementById('set-admin-user').value;
    adminCreds.pass = document.getElementById('set-admin-pass').value;
    adminCreds.pin = document.getElementById('set-admin-pin').value;
    localStorage.setItem('frh_admin_creds', JSON.stringify(adminCreds));
    alert('Kredensial Super Admin berhasil diperbarui!');
}

function renderAdminDashboard() {
    renderAdminManageList();
    renderAdminAnalytics();
}

function handlePostAnnouncement(e) {
    e.preventDefault();
    const newAnn = {
        id: Date.now(),
        title: document.getElementById('ann-title').value,
        content: document.getElementById('ann-content').value,
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    };
    announcements.unshift(newAnn);
    localStorage.setItem('frh_announcements', JSON.stringify(announcements));
    addNotification(`Pengumuman baru: ${newAnn.title}`, 'admin');
    alert('Pengumuman berhasil disiarkan!');
    e.target.reset();
}

function renderAnnouncements() {
    const container = document.getElementById('announcement-container');
    container.innerHTML = '';
    announcements.forEach(ann => {
        container.innerHTML += `
            <div class="bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/20 p-5 rounded-2xl flex items-start gap-4 shadow-md">
                <div class="p-3 bg-amber-500/20 text-amber-400 rounded-xl text-lg"><i class="fa-solid fa-bullhorn"></i></div>
                <div>
                    <div class="flex items-center gap-3">
                        <h4 class="font-bold text-sm text-amber-300">${ann.title}</h4>
                        <span class="text-[10px] text-slate-500">${ann.date}</span>
                    </div>
                    <p class="text-xs text-slate-300 mt-1">${ann.content}</p>
                </div>
            </div>
        `;
    });
}

function filterCategory(cat) {
    currentFilter = cat;
    ['All', 'File', 'Aplikasi', 'Saved'].forEach(c => {
        const btn = document.getElementById(`cat-btn-${c}`);
        if(btn) {
            btn.className = c === cat 
                ? "px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 text-slate-950 transition-all cursor-pointer shadow-md"
                : "px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all cursor-pointer";
        }
    });
    renderResources();
}

function filterSaved() { filterCategory('Saved'); }

function handleSearchInput() {
    const keyword = document.getElementById('search-input').value.trim();
    if (keyword.length > 0) {
        if (!userRecentSearches.includes(keyword)) {
            userRecentSearches.unshift(keyword);
            if (userRecentSearches.length > 5) userRecentSearches.pop();
            localStorage.setItem('frh_recent_searches', JSON.stringify(userRecentSearches));
        }
    }
    renderResources();
    renderRecentSearchDropdown();
}

function renderRecentSearchDropdown() {
    const box = document.getElementById('recent-search-box');
    box.innerHTML = '';
    const keyword = document.getElementById('search-input').value.trim().toLowerCase();
    
    let matchedFiles = [];
    if (keyword.length > 0) {
        matchedFiles = resources.filter(r => r.name.toLowerCase().includes(keyword)).slice(0, 3);
    }

    if (userRecentSearches.length === 0 && matchedFiles.length === 0) {
        box.classList.add('hidden');
        return;
    }
    box.classList.remove('hidden');

    if (matchedFiles.length > 0) {
        box.innerHTML += `<div class="text-[10px] text-cyan-400 px-2 py-1 uppercase">Live Search Match</div>`;
        matchedFiles.forEach(f => {
            box.innerHTML += `<div onclick="openDetail(${f.id})" class="px-2 py-1.5 hover:bg-slate-800 rounded-lg text-xs text-slate-200 cursor-pointer flex items-center justify-between"><span class="font-bold">${f.name}</span> <span class="text-[10px] text-slate-500">${f.category}</span></div>`;
        });
    }

    if (userRecentSearches.length > 0) {
        box.innerHTML += `<div class="text-[10px] text-slate-500 px-2.5 py-1 uppercase border-t border-slate-800 mt-1">Pencarian Terakhir</div>`;
        userRecentSearches.forEach(term => {
            box.innerHTML += `<div onclick="selectRecentSearch('${term}')" class="px-2 py-1.5 hover:bg-slate-800 rounded-lg text-xs text-slate-300 cursor-pointer flex items-center justify-between"><i class="fa-solid fa-clock-rotate-left text-slate-500"></i> ${term}</div>`;
        });
    }
}

function selectRecentSearch(term) {
    document.getElementById('search-input').value = term;
    document.getElementById('recent-search-box').classList.add('hidden');
    renderResources();
}

function parseFileSize(sizeStr) {
    if (!sizeStr) return 0;
    let num = parseFloat(sizeStr);
    if (isNaN(num)) return 0;
    if (sizeStr.toLowerCase().includes('kb')) return num / 1024;
    if (sizeStr.toLowerCase().includes('gb')) return num * 1024;
    return num; // MB
}

function renderResources() {
    const grid = document.getElementById('resource-grid');
    const searchKeyword = document.getElementById('search-input').value.toLowerCase();
    const sortBy = document.getElementById('sort-select').value;
    const formatFilter = document.getElementById('format-filter').value;
    grid.innerHTML = '';

    let filtered = resources.filter(res => {
        let matchCat = true;
        if (currentFilter === 'File') matchCat = res.category === 'File';
        if (currentFilter === 'Aplikasi') matchCat = res.category === 'Aplikasi';
        if (currentFilter === 'Saved') matchCat = res.savedBy && res.savedBy.includes(currentUser.username);

        let matchFormat = true;
        if (formatFilter !== 'All') {
            matchFormat = res.name.toLowerCase().includes(formatFilter) || res.fileData.toLowerCase().includes(formatFilter) || (res.version && res.version.toLowerCase().includes(formatFilter));
        }

        let matchSearch = res.name.toLowerCase().includes(searchKeyword) || res.description.toLowerCase().includes(searchKeyword) || res.subcategory.toLowerCase().includes(searchKeyword);
        return matchCat && matchFormat && matchSearch;
    });

    if (sortBy === 'popular') filtered.sort((a, b) => b.likes - a.likes);
    if (sortBy === 'downloads') filtered.sort((a, b) => b.downloads - a.downloads);
    if (sortBy === 'rating') filtered.sort((a, b) => parseFloat(calculateAverageRating(b)) - parseFloat(calculateAverageRating(a)));
    if (sortBy === 'size') filtered.sort((a, b) => parseFileSize(a.fileSize) - parseFileSize(b.fileSize));

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="col-span-full py-16 text-center text-slate-500"><i class="fa-regular fa-folder-open text-4xl mb-3"></i><p class="text-sm">Tidak ada resource yang ditemukan.</p></div>`;
        return;
    }

    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

    filtered.forEach(res => {
        const isLiked = res.likedBy && res.likedBy.includes(currentUser.username);
        const isSaved = res.savedBy && res.savedBy.includes(currentUser.username);
        const isBroken = brokenReports.some(rep => rep.resName === res.name);
        const isCommunityChoice = (res.downloads >= 50 || parseFloat(calculateAverageRating(res)) >= 4.5) && res.id > oneWeekAgo;

        const iconClass = res.category === 'Aplikasi' ? 'fa-brands fa-android text-emerald-400' : 'fa-solid fa-file-zipper text-cyan-400';
        const avgRating = calculateAverageRating(res);

        let domainBadge = '<i class="fa-solid fa-globe text-slate-400" title="Web Link"></i>';
        if (res.fileData.includes('drive.google.com')) domainBadge = '<i class="fa-brands fa-google-drive text-cyan-400" title="Google Drive"></i>';
        if (res.fileData.includes('mediafire.com')) domainBadge = '<i class="fa-solid fa-fire text-amber-500" title="MediaFire"></i>';
        if (res.fileData.includes('mega.nz')) domainBadge = '<i class="fa-solid fa-m text-rose-400" title="MEGA"></i>';

        grid.innerHTML += `
            <div class="bg-slate-900 border ${isBroken ? 'border-rose-500/50' : 'border-slate-800/80'} rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg group">
                <div>
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center gap-2">
                            <div class="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-lg ${iconClass}"></div>
                            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-400">${res.version || 'v1.0'}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            ${isCommunityChoice ? '<span class="text-[10px] text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30"><i class="fa-solid fa-fire"></i> Favorit Komunitas</span>' : ''}
                            ${isBroken ? '<span class="text-[10px] text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded"><i class="fa-solid fa-triangle-exclamation"></i> Link Rusak</span>' : ''}
                            <span class="text-[10px] text-amber-400 font-bold"><i class="fa-solid fa-star"></i> ${avgRating}</span>
                            <span class="text-[10px] font-semibold px-2 py-1 rounded-lg bg-slate-800 text-slate-300">${domainBadge}</span>
                        </div>
                    </div>
                    <h3 onclick="openDetail(${res.id})" class="font-bold text-base text-white group-hover:text-cyan-400 transition-colors cursor-pointer line-clamp-1">${res.name}</h3>
                    <p class="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">${res.description}</p>
                </div>
                
                <div class="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                    <div class="flex items-center gap-3">
                        <button onclick="toggleLike(${res.id})" class="flex items-center gap-1 hover:text-rose-400 transition-colors cursor-pointer ${isLiked ? 'text-rose-500' : ''}">
                            <i class="${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart"></i> <span>${res.likes || 0}</span>
                        </button>
                        <span class="flex items-center gap-1"><i class="fa-solid fa-download"></i> ${res.downloads || 0}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="toggleSave(${res.id})" class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer ${isSaved ? 'text-amber-400' : 'text-slate-300'}" title="Simpan">
                            <i class="${isSaved ? 'fa-solid' : 'fa-regular'} fa-bookmark"></i>
                        </button>
                        <button onclick="openDetail(${res.id})" class="px-3 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition-all cursor-pointer">Detail</button>
                    </div>
                </div>
            </div>
        `;
    });
}

function calculateAverageRating(res) {
    if (!res.ratings || Object.keys(res.ratings).length === 0) return '0.0';
    let totalScore = 0;
    let totalVotes = 0;
    for (let star in res.ratings) {
        totalScore += star * res.ratings[star];
        totalVotes += res.ratings[star];
    }
    return (totalScore / totalVotes).toFixed(1);
}

function toggleLike(id) {
    let res = resources.find(r => r.id === id);
    if (!res.likedBy) res.likedBy = [];
    const index = res.likedBy.indexOf(currentUser.username);
    if (index > -1) {
        res.likedBy.splice(index, 1);
        res.likes -= 1;
    } else {
        res.likedBy.push(currentUser.username);
        res.likes += 1;
        addPoints(currentUser.username, 2);
    }
    localStorage.setItem('frh_resources', JSON.stringify(resources));
    renderResources();
    if(activeResourceId === id) openDetail(id, false);
}

function toggleSave(id) {
    let res = resources.find(r => r.id === id);
    if (!res.savedBy) res.savedBy = [];
    const index = res.savedBy.indexOf(currentUser.username);
    if (index > -1) {
        res.savedBy.splice(index, 1);
    } else {
        res.savedBy.push(currentUser.username);
    }
    localStorage.setItem('frh_resources', JSON.stringify(resources));
    renderResources();
}

function openDetail(id, openModalWindow = true) {
    activeResourceId = id;
    const res = resources.find(r => r.id === id);
    if (!res) return;

    if (openModalWindow) {
        document.getElementById('detail-modal').classList.remove('hidden');
    }

    document.getElementById('modal-title').textContent = res.name;
    document.getElementById('modal-version-badge').textContent = res.version || 'v1.0';
    document.getElementById('modal-badge').textContent = `${res.category} / ${res.subcategory}`;
    document.getElementById('modal-desc').textContent = res.description;
    document.getElementById('modal-file-size').textContent = res.fileSize || '15 MB';
    document.getElementById('modal-avg-rating').innerHTML = `<i class="fa-solid fa-star"></i> ${calculateAverageRating(res)}`;
    
    const screenshotBox = document.getElementById('modal-screenshot-container');
    const screenshotImg = document.getElementById('modal-screenshot-img');
    if (res.screenshot && res.screenshot.trim() !== '') {
        screenshotImg.src = res.screenshot;
        screenshotBox.classList.remove('hidden');
    } else {
        screenshotBox.classList.add('hidden');
    }

    const isBroken = brokenReports.some(rep => rep.resName === res.name);
    const alertBox = document.getElementById('modal-broken-alert');
    if (isBroken) alertBox.classList.remove('hidden');
    else alertBox.classList.add('hidden');

    const downloadBtn = document.getElementById('modal-download-btn');
    downloadBtn.href = res.fileData;

    const iconDiv = document.getElementById('modal-file-icon');
    iconDiv.innerHTML = `<i class="${res.category === 'Aplikasi' ? 'fa-brands fa-android text-emerald-400' : 'fa-solid fa-file-zipper text-cyan-400'}"></i>`;

    const starBtns = document.querySelectorAll('#star-container button');
    starBtns.forEach((btn, idx) => {
        const starVal = idx + 1;
        if (res.ratedUsers && res.ratedUsers[currentUser.username] >= starVal) {
            btn.className = "text-amber-400 cursor-pointer";
        } else {
            btn.className = "text-slate-600 hover:text-amber-400 cursor-pointer";
        }
    });

    const commentList = document.getElementById('comment-list');
    document.getElementById('comment-count').textContent = res.comments ? res.comments.length : 0;
    commentList.innerHTML = '';
    if (!res.comments || res.comments.length === 0) {
        commentList.innerHTML = `<p class="text-xs text-slate-500 text-center py-4">Belum ada komentar.</p>`;
    } else {
        res.comments.forEach(c => {
            commentList.innerHTML += `<div class="bg-slate-950 border border-slate-800/60 p-3 rounded-xl text-xs space-y-1"><span class="font-bold text-cyan-400">${c.user}</span><p class="text-slate-300">${c.text}</p></div>`;
        });
    }
}

function rateResource(star) {
    if (!activeResourceId) return;
    let res = resources.find(r => r.id === activeResourceId);
    if (!res.ratings) res.ratings = {};
    if (!res.ratedUsers) res.ratedUsers = {};

    let prevRating = res.ratedUsers[currentUser.username];
    if (prevRating) {
        res.ratings[prevRating] -= 1;
    }
    res.ratedUsers[currentUser.username] = star;
    res.ratings[star] = (res.ratings[star] || 0) + 1;

    addPoints(currentUser.username, 10);
    localStorage.setItem('frh_resources', JSON.stringify(resources));
    alert(`Terima kasih! Anda memberikan rating ${star} bintang dan mendapatkan +10 Poin Reward.`);
    openDetail(activeResourceId, false);
    renderResources();
}

function recordDownload() {
    if (!activeResourceId) return;
    let res = resources.find(r => r.id === activeResourceId);
    res.downloads = (res.downloads || 0) + 1;
    
    if (!userDownloads[currentUser.username]) userDownloads[currentUser.username] = [];
    userDownloads[currentUser.username] = userDownloads[currentUser.username].filter(item => item !== res.name);
    userDownloads[currentUser.username].unshift(res.name);

    addPoints(currentUser.username, 5);
    localStorage.setItem('frh_user_downloads', JSON.stringify(userDownloads));
    localStorage.setItem('frh_resources', JSON.stringify(resources));
    renderResources();
}

function reportBrokenLink() {
    if (!activeResourceId) return;
    let res = resources.find(r => r.id === activeResourceId);
    if (!brokenReports.some(rep => rep.resName === res.name && rep.user === currentUser.username)) {
        brokenReports.push({ resName: res.name, user: currentUser.username });
        localStorage.setItem('frh_broken_reports', JSON.stringify(brokenReports));
        addNotification(`Laporan link rusak diterima untuk file: ${res.name}`, 'danger');
        addPoints(currentUser.username, 5);
        alert('Laporan link rusak telah dikirim ke Administrator (+5 Poin).');
        openDetail(activeResourceId, false);
        renderResources();
    } else {
        alert('Anda sudah melaporkan link ini sebelumnya.');
    }
}

function closeModal() {
    document.getElementById('detail-modal').classList.add('hidden');
    activeResourceId = null;
}

function handlePostComment(e) {
    e.preventDefault();
    if (!activeResourceId) return;
    const input = document.getElementById('comment-input');
    const text = input.value.trim();
    if (!text) return;
    let res = resources.find(r => r.id === activeResourceId);
    if (!res.comments) res.comments = [];
    res.comments.push({ user: currentUser.username, text: text });
    
    addPoints(currentUser.username, 5);
    localStorage.setItem('frh_resources', JSON.stringify(resources));
    input.value = '';
    alert('Komentar berhasil dikirim (+5 Poin).');
    openDetail(activeResourceId, false);
}

function togglePasswordForm() {
    const box = document.getElementById('profile-password-box');
    box.classList.toggle('hidden');
}

function handleChangeUserPassword(e) {
    e.preventDefault();
    const newPass = document.getElementById('new-user-pass').value;
    let users = JSON.parse(localStorage.getItem('frh_users')) || [];
    let userObj = users.find(u => u.username === currentUser.username);
    if (userObj) {
        userObj.password = newPass;
        localStorage.setItem('frh_users', JSON.stringify(users));
        alert('Password akun berhasil diubah!');
        document.getElementById('new-user-pass').value = '';
        togglePasswordForm();
    }
}

function renderProfilePage() {
    document.getElementById('profile-username').textContent = currentUser.username;
    document.getElementById('profile-badge-label').textContent = getUserBadge(currentUser.username);
    document.getElementById('profile-points-label').textContent = `Poin Reward Kontributor: ${userPoints[currentUser.username] || 0} Pts`;
    
    const dlList = document.getElementById('profile-download-list');
    dlList.innerHTML = '';
    let myDownloads = userDownloads[currentUser.username] || [];
    if (myDownloads.length === 0) {
        dlList.innerHTML = `<p class="text-xs text-slate-500">Belum ada riwayat download.</p>`;
    } else {
        myDownloads.forEach(name => {
            dlList.innerHTML += `<div class="bg-slate-950 p-3 rounded-xl text-xs text-slate-300 border border-slate-800 flex items-center gap-2"><i class="fa-solid fa-check text-cyan-400"></i> ${name}</div>`;
        });
    }

    const savedList = document.getElementById('profile-saved-list');
    savedList.innerHTML = '';
    let mySaved = resources.filter(r => r.savedBy && r.savedBy.includes(currentUser.username));
    
    if (mySaved.length === 0) {
        savedList.innerHTML = `<p class="text-xs text-slate-500">Belum ada file disimpan.</p>`;
    } else {
        mySaved.forEach(res => {
            savedList.innerHTML += `<div class="bg-slate-950 p-3 rounded-xl text-xs text-slate-300 border border-slate-800 flex items-center justify-between"><span>${res.name}</span><button onclick="openDetail(${res.id})" class="text-cyan-400 font-bold cursor-pointer">Buka</button></div>`;
        });
    }

    // Render Folder Koleksi Kustom jika ada
    let cols = userCollections[currentUser.username] || {};
    for (let cName in cols) {
        savedList.innerHTML += `<div class="p-2.5 bg-slate-950 border border-amber-500/30 rounded-xl text-xs mt-2"><span class="font-bold text-amber-400"><i class="fa-solid fa-folder"></i> ${cName}</span> (0 Item)</div>`;
    }

    const comList = document.getElementById('profile-comment-list');
    comList.innerHTML = '';
    let myComments = [];
    resources.forEach(res => {
        if (res.comments) {
            res.comments.forEach(c => {
                if (c.user === currentUser.username) {
                    myComments.push({ resName: res.name, text: c.text, resId: res.id });
                }
            });
        }
    });

    if (myComments.length === 0) {
        comList.innerHTML = `<p class="text-xs text-slate-500">Belum ada riwayat komentar.</p>`;
    } else {
        myComments.forEach(item => {
            comList.innerHTML += `<div class="bg-slate-950 p-3 rounded-xl text-xs text-slate-300 border border-slate-800 flex items-center justify-between"><div><span class="text-cyan-400 font-bold">${item.resName}:</span> "${item.text}"</div><button onclick="openDetail(${item.resId})" class="text-amber-400 font-bold cursor-pointer">Lihat</button></div>`;
        });
    }
}
