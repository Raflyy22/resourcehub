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
        linkAd: "https://safelink-sample.com/file1",
        linkNoAd: "https://drive.google.com/file1-clean",
        paidUnlockedUsers: [],
        description: "Aplikasi Android builder visual dengan dukungan modifikasi penuh.\n\n[Changelog v6.3]: Perbaikan bug kompilasi & peningkatan kecepatan.",
        fileSize: "15.4 MB",
        screenshot: "",
        verified: true,
        uploader: "superadmin",
        likes: 12,
        views: 145,
        likedBy: [],
        savedBy: [],
        ratings: { 5: 4, 4: 2 },
        ratedUsers: {},
        reviews: [{ user: "Budi", rating: 5, text: "Aplikasi sangat mantap dan berjalan lancar!" }],
        comments: [{ user: "Budi", text: "Mantap aplikasinya work 100%!" }]
    }
];

let announcements = JSON.parse(localStorage.getItem('frh_announcements')) || [
    { id: 1, title: "Selamat Datang di FileHub Ultimate Suite v9!", content: "Level otomatis, redeem pilih postingan & ewallet dengan input data, serta sistem Logs aktivitas kini aktif.", date: "10 Agustus 2026" }
];

let communityRequests = JSON.parse(localStorage.getItem('frh_community_requests')) || [
    { id: 1, title: "Request Adobe Photoshop APK", desc: "Mohon sediakan versi modifikasinya.", user: "Budi", status: "Pending" }
];

let liveChatConversations = JSON.parse(localStorage.getItem('frh_livechat_conversations')) || {
    "Budi": [
        { sender: "Budi", text: "Halo admin, saya ingin konfirmasi redeem poin untuk saldo DANA 50rb.", time: "10:00" },
        { sender: "superadmin", text: "Baik Budi, silakan tunggu sebentar diproses.", time: "10:05" }
    ]
};
let activeChatUser = "Budi";

let redeemRewards = JSON.parse(localStorage.getItem('frh_redeem_rewards')) || [
    { id: 1, name: "Akses VIP Tanpa Iklan (1 Bulan)", cost: 50, type: "vip" },
    { id: 2, name: "Akses Postingan Khusus Satuan", cost: 25, type: "post_access" },
    { id: 3, name: "Saldo E-Wallet Rp 25.000", cost: 100, type: "ewallet" },
    { id: 4, name: "Aplikasi Eksklusif Premium APK", cost: 75, type: "exclusive_app" }
];

let userViewHistory = JSON.parse(localStorage.getItem('frh_user_view_history')) || {};
let userPoints = JSON.parse(localStorage.getItem('frh_user_points')) || {};
let userLevels = JSON.parse(localStorage.getItem('frh_user_levels')) || {};
let userQuestClaims = JSON.parse(localStorage.getItem('frh_user_quest_claims')) || {};
let userVipSubscriptions = JSON.parse(localStorage.getItem('frh_user_vip_subs')) || {};
let userUnlockedPosts = JSON.parse(localStorage.getItem('frh_user_unlocked_posts')) || {};
let userAuditLogs = JSON.parse(localStorage.getItem('frh_user_audit_logs')) || {};
let systemLogs = JSON.parse(localStorage.getItem('frh_system_logs')) || []; // Sistem Logs Terpusat
let brokenReports = JSON.parse(localStorage.getItem('frh_broken_reports')) || [];
let userRecentSearches = JSON.parse(localStorage.getItem('frh_recent_searches')) || [];
let notifications = JSON.parse(localStorage.getItem('frh_notifications')) || [
    { id: 1, text: "Selamat datang di platform FileHub Ultimate Suite v9!", type: 'info', read: false, time: "Baru saja" }
];

let currentFilter = 'All';
let activeResourceId = null;
let currentSelectedStar = 5;
let adminSessionTimer = null;
let pendingEwalletReward = null;

document.addEventListener('DOMContentLoaded', () => {
    checkAuthState();
    checkAdminLockState();
    renderNotifications();
    checkAutoDarkModeSchedule();
    
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
        if (el) el.addEventListener('input', checkUnifiedAdminTrigger);
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
            closeRequestModal();
            closeRedeemPostModal();
            closeEWalletModal();
        }
    });

    if (currentUser && currentUser.role === 'admin') {
        resetAdminSessionTimer();
    }
});

function checkAutoDarkModeSchedule() {
    const hour = new Date().getHours();
    if (hour >= 18 || hour < 6) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('frh_theme', 'dark');
    }
}

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

function logUserAction(username, actionText) {
    if (!userAuditLogs[username]) userAuditLogs[username] = [];
    userAuditLogs[username].unshift({ text: actionText, time: new Date().toLocaleTimeString('id-ID') });
    if (userAuditLogs[username].length > 10) userAuditLogs[username].pop();
    localStorage.setItem('frh_user_audit_logs', JSON.stringify(userAuditLogs));
}

function recordSystemLog(actionType, detail) {
    const logItem = {
        id: Date.now(),
        user: currentUser ? currentUser.username : 'Guest',
        type: actionType,
        detail: detail,
        time: new Date().toLocaleString('id-ID')
    };
    systemLogs.unshift(logItem);
    if (systemLogs.length > 100) systemLogs.pop();
    localStorage.setItem('frh_system_logs', JSON.stringify(systemLogs));
}

function addNotification(text, type = 'info') {
    notifications.unshift({ id: Date.now(), text, type, read: false, time: "Baru saja" });
    localStorage.setItem('frh_notifications', JSON.stringify(notifications));
    renderNotifications();
}

function renderNotifications() {
    const list = document.getElementById('notif-list');
    const badge = document.getElementById('notif-badge');
    if (!list || !badge) return;
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
                <span class="text-[9px] text-slate-500">Baru saja</span>
            </div>
        `;
    });
}

function toggleNotificationDropdown() {
    const dropdown = document.getElementById('notif-dropdown');
    if (dropdown) dropdown.classList.toggle('hidden');
}

function clearNotifications() {
    notifications.forEach(n => n.read = true);
    localStorage.setItem('frh_notifications', JSON.stringify(notifications));
    renderNotifications();
}

/* ========================================================
   FITUR 1: LEVEL AKUN OTOMATIS NAIK BERDASARKAN PROGRES POIN
   ======================================================== */
function addPoints(username, amount) {
    if (!userPoints[username]) userPoints[username] = 0;
    userPoints[username] += amount;
    localStorage.setItem('frh_user_points', JSON.stringify(userPoints));
    
    recordSystemLog('Dapatkan Point', `User @${username} mendapatkan +${amount} Poin.`);

    // Cek naik level otomatis berdasarkan total poin (setiap 50 poin naik 1 level, max 100)
    let currentLvl = userLevels[username] || 1;
    let expectedLvl = Math.min(100, Math.floor((userPoints[username] / 50)) + 1);
    if (expectedLvl > currentLvl) {
        userLevels[username] = expectedLvl;
        localStorage.setItem('frh_user_levels', JSON.stringify(userLevels));
        addNotification(`Selamat! Akun Anda naik ke Level ${expectedLvl}!`, 'admin');
        recordSystemLog('Naik Level', `User @${username} naik otomatis ke Level ${expectedLvl}.`);
    }

    // Cek Badge otomatis
    let badge = getUserBadge(username);
    if (badge.includes('Elite') || badge.includes('Active')) {
        recordSystemLog('Dapatkan Badge', `User @${username} memperoleh badge "${badge}".`);
    }
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
        if (validUser && validUser.banned) {
            alert('Akun Anda telah diblokir oleh Administrator.');
            return;
        }
        if (!validUser && uVal !== 'user') {
            alert('Username atau Password salah!');
            return;
        }
        currentUser = { username: uVal, role: 'user' };
        logUserAction(uVal, 'Masuk ke sistem');
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
    users.push({ username, password, banned: false });
    localStorage.setItem('frh_users', JSON.stringify(users));
    alert('Registrasi berhasil! Silakan masuk.');
    switchAuthTab('login');
}

function checkAdminLockState() {
    const now = Date.now();
    const warningEl = document.getElementById('admin-lock-warning');
    const submitBtn = document.getElementById('uni-submit-btn');
    if (!warningEl || !submitBtn) return;

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
            document.getElementById('requests-panel').classList.add('hidden');
            document.getElementById('livechat-panel').classList.add('hidden');
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
    ['user-panel', 'profile-panel', 'faq-panel', 'leaderboard-panel', 'requests-panel', 'livechat-panel'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
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
    } else if (view === 'requests') {
        document.getElementById('requests-panel').classList.remove('hidden');
        renderCommunityRequests();
    } else if (view === 'livechat') {
        document.getElementById('livechat-panel').classList.remove('hidden');
        renderUserLiveChatMessages();
    }
}

function openRequestModal() {
    const modal = document.getElementById('request-modal');
    if (modal) modal.classList.remove('hidden');
}

function closeRequestModal() {
    const modal = document.getElementById('request-modal');
    if (modal) modal.classList.add('hidden');
}

function handlePostRequest(e) {
    e.preventDefault();
    const title = document.getElementById('req-title').value.trim();
    const desc = document.getElementById('req-desc').value.trim();
    communityRequests.push({ id: Date.now(), title, desc, user: currentUser.username, status: 'Pending' });
    localStorage.setItem('frh_community_requests', JSON.stringify(communityRequests));
    closeRequestModal();
    e.target.reset();
    renderCommunityRequests();
    alert('Request file berhasil diajukan ke admin!');
}

function renderCommunityRequests() {
    const list = document.getElementById('user-requests-list');
    if (!list) return;
    list.innerHTML = '';
    if (communityRequests.length === 0) {
        list.innerHTML = `<p class="text-xs text-slate-500">Belum ada request file.</p>`;
        return;
    }
    communityRequests.forEach(req => {
        list.innerHTML += `
            <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <div>
                    <span class="font-bold text-white text-sm block">${req.title}</span>
                    <p class="text-slate-400 mt-0.5">${req.desc}</p>
                    <span class="text-[10px] text-cyan-400 mt-1 inline-block">Diajukan oleh: ${req.user} (${req.status})</span>
                </div>
                ${currentUser.role === 'admin' ? `<button onclick="fulfillRequest(${req.id})" class="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg cursor-pointer">Tandai Selesai</button>` : ''}
            </div>
        `;
    });
}

function fulfillRequest(id) {
    let req = communityRequests.find(r => r.id === id);
    if (req) {
        req.status = 'Dipenuhi';
        localStorage.setItem('frh_community_requests', JSON.stringify(communityRequests));
        renderCommunityRequests();
        alert('Request ditandai selesai.');
    }
}

function renderLeaderboardPage() {
    const list = document.getElementById('leaderboard-list');
    if (!list) return;
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

function switchAdminTab(type) {
    ['upload', 'manage', 'users', 'logs', 'livechat', 'rewards', 'requests', 'analytics', 'backup', 'settings'].forEach(t => {
        const sec = document.getElementById(`admin-${t}-section`);
        const btn = document.getElementById(`btn-tab-${t}`);
        if(sec) sec.classList.add('hidden');
        if(btn) btn.className = "px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer";
    });
    const targetSec = document.getElementById(`admin-${type}-section`);
    const targetBtn = document.getElementById(`btn-tab-${type}`);
    if(targetSec) targetSec.classList.remove('hidden');
    if(targetBtn) targetBtn.className = "px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer";
    
    if (type === 'manage') renderAdminManageList();
    if (type === 'users') renderAdminUsersList();
    if (type === 'logs') renderAdminLogsList();
    if (type === 'livechat') renderAdminLiveChatUsers();
    if (type === 'rewards') renderAdminRewardsList();
    if (type === 'requests') renderCommunityRequests();
    if (type === 'analytics') renderAdminAnalytics();
}

function renderAdminUsersList() {
    const list = document.getElementById('admin-users-list');
    if (!list) return;
    list.innerHTML = '';
    let users = JSON.parse(localStorage.getItem('frh_users')) || [];
    if (users.length === 0) {
        list.innerHTML = `<p class="text-xs text-slate-500">Belum ada user terdaftar.</p>`;
        return;
    }
    users.forEach((u, idx) => {
        let isVip = userVipSubscriptions[u.username] || false;
        let unlockedArr = userUnlockedPosts[u.username] || [];
        let uPts = userPoints[u.username] || 0;

        let postCheckboxes = resources.map(res => {
            let isUnlocked = unlockedArr.includes(res.id);
            return `<label class="flex items-center gap-1.5 text-[10px] text-slate-300"><input type="checkbox" ${isUnlocked ? 'checked' : ''} onchange="toggleAdminUserPostAccess('${u.username}', ${res.id})" class="accent-cyan-500"> ${res.name}</label>`;
        }).join('');

        list.innerHTML += `
            <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                        <span class="font-bold text-white text-sm block">${u.username}</span>
                        <span class="text-[10px] text-slate-400">Status: ${u.banned ? '<span class="text-rose-400">Diblokir</span>' : '<span class="text-emerald-400">Aktif</span>'} | Poin: <span class="text-amber-400 font-bold">${uPts} Pts</span> | VIP: <span class="${isVip ? 'text-amber-400 font-bold' : 'text-slate-400'}">${isVip ? 'Aktif' : 'Non-VIP'}</span></span>
                    </div>
                    <div class="flex flex-wrap gap-2 items-center">
                        <div class="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
                            <input type="number" id="point-input-${u.username}" placeholder="Jumlah" class="w-16 bg-slate-950 px-2 py-1 text-[11px] text-white rounded focus:outline-none">
                            <button onclick="modifyUserPoints('${u.username}', 'add')" class="px-2 py-1 bg-emerald-500 text-slate-950 font-bold rounded text-[10px]" title="Tambah Poin">+ Poin</button>
                            <button onclick="modifyUserPoints('${u.username}', 'sub')" class="px-2 py-1 bg-rose-500 text-slate-950 font-bold rounded text-[10px]" title="Kurangi Poin">- Poin</button>
                        </div>
                        <button onclick="toggleVipSubscription('${u.username}')" class="px-3 py-1.5 ${isVip ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-amber-400'} font-bold rounded-lg cursor-pointer">${isVip ? 'Cabut VIP' : 'Beri VIP'}</button>
                        <button onclick="toggleUserBan(${idx})" class="px-3 py-1.5 ${u.banned ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'} font-bold rounded-lg cursor-pointer">${u.banned ? 'Pulihkan' : 'Blokir'}</button>
                    </div>
                </div>
                <div class="border-t border-slate-900 pt-2">
                    <span class="text-[11px] font-semibold text-cyan-400 block mb-1">Akses Postingan Khusus Satuan:</span>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">${postCheckboxes || '<span class="text-slate-500 text-[10px]">Belum ada post</span>'}</div>
                </div>
            </div>
        `;
    });
}

function modifyUserPoints(username, action) {
    const inputEl = document.getElementById(`point-input-${username}`);
    if (!inputEl) return;
    let val = parseInt(inputEl.value);
    if (isNaN(val) || val <= 0) {
        alert('Masukkan jumlah poin yang valid.');
        return;
    }
    if (!userPoints[username]) userPoints[username] = 0;
    if (action === 'add') {
        userPoints[username] += val;
        addNotification(`Admin menambahkan ${val} poin ke akun Anda.`, 'admin');
        recordSystemLog('Dapatkan Point', `Admin menambahkan ${val} poin ke akun @${username}.`);
        alert(`Berhasil menambahkan ${val} poin ke @${username}.`);
    } else {
        userPoints[username] = Math.max(0, userPoints[username] - val);
        addNotification(`Admin mengurangi ${val} poin dari akun Anda.`, 'danger');
        recordSystemLog('Kurangi Point', `Admin mengurangi ${val} poin dari akun @${username}.`);
        alert(`Berhasil mengurangi ${val} poin dari @${username}.`);
    }
    localStorage.setItem('frh_user_points', JSON.stringify(userPoints));
    inputEl.value = '';
    renderAdminUsersList();
}

/* ========================================================
   FITUR 4: SISTEM LOGS TERPUSAT ADMIN
   ======================================================== */
function renderAdminLogsList() {
    const list = document.getElementById('admin-logs-list');
    if (!list) return;
    list.innerHTML = '';
    if (systemLogs.length === 0) {
        list.innerHTML = `<p class="text-xs text-slate-500 text-center py-4">Belum ada aktivitas logs tersimpan.</p>`;
        return;
    }
    systemLogs.forEach(lg => {
        let badgeColor = 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
        if (lg.type.includes('Redeem') || lg.type.includes('Klaim')) badgeColor = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
        if (lg.type.includes('Akses') || lg.type.includes('Level') || lg.type.includes('Badge')) badgeColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';

        list.innerHTML += `
            <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <div class="flex justify-between items-center text-[10px]">
                    <span class="px-2 py-0.5 rounded border font-bold ${badgeColor}">${lg.type}</span>
                    <span class="text-slate-500">${lg.time}</span>
                </div>
                <p class="text-slate-200">${lg.detail} <span class="text-cyan-400 font-bold">(@${lg.user})</span></p>
            </div>
        `;
    });
}

function toggleAdminUserPostAccess(username, resId) {
    if (!userUnlockedPosts[username]) userUnlockedPosts[username] = [];
    let idx = userUnlockedPosts[username].indexOf(resId);
    if (idx > -1) {
        userUnlockedPosts[username].splice(idx, 1);
    } else {
        userUnlockedPosts[username].push(resId);
    }
    localStorage.setItem('frh_user_unlocked_posts', JSON.stringify(userUnlockedPosts));
    recordSystemLog('Akses Link Postingan Khusus', `Admin mengatur akses post ID ${resId} untuk @${username}.`);
    alert(`Akses postingan untuk @${username} diperbarui.`);
}

function toggleVipSubscription(username) {
    let currentVip = userVipSubscriptions[username] || false;
    userVipSubscriptions[username] = !currentVip;
    localStorage.setItem('frh_user_vip_subs', JSON.stringify(userVipSubscriptions));
    renderAdminUsersList();
    recordSystemLog('Akses link tanpa iklan', `Admin memperbarui status VIP Tanpa Iklan @${username} menjadi ${!currentVip}.`);
    alert(`Status VIP Tanpa Iklan untuk @${username} berhasil diperbarui.`);
}

function toggleUserBan(idx) {
    let users = JSON.parse(localStorage.getItem('frh_users')) || [];
    if (users[idx]) {
        users[idx].banned = !users[idx].banned;
        localStorage.setItem('frh_users', JSON.stringify(users));
        renderAdminUsersList();
        alert('Status akun berhasil diperbarui.');
    }
}

function renderAdminLiveChatUsers() {
    const list = document.getElementById('admin-chat-user-list');
    if (!list) return;
    list.innerHTML = '';
    let users = JSON.parse(localStorage.getItem('frh_users')) || [];
    
    users.forEach(u => {
        let isSel = activeChatUser === u.username;
        list.innerHTML += `
            <div onclick="selectActiveChatUser('${u.username}')" class="p-2.5 rounded-xl cursor-pointer text-xs font-semibold flex justify-between items-center ${isSel ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}">
                <span>${u.username}</span>
            </div>
        `;
    });
    renderAdminChatMessages();
}

function selectActiveChatUser(username) {
    activeChatUser = username;
    renderAdminLiveChatUsers();
}

function renderAdminChatMessages() {
    const box = document.getElementById('admin-chat-messages');
    const header = document.getElementById('admin-active-chat-header');
    if (!box || !header) return;
    if (!activeChatUser) {
        header.textContent = "Pilih user untuk memulai chat";
        box.innerHTML = '';
        return;
    }
    header.textContent = `Chat Real-Time dengan: @${activeChatUser}`;
    box.innerHTML = '';
    let msgs = liveChatConversations[activeChatUser] || [];
    if (msgs.length === 0) {
        box.innerHTML = `<p class="text-slate-500 text-center">Belum ada pesan dengan user ini.</p>`;
        return;
    }
    msgs.forEach(m => {
        let isMe = m.sender === 'superadmin';
        box.innerHTML += `
            <div class="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1 ${isMe ? 'border-cyan-500/30' : ''}">
                <div class="flex justify-between text-[10px] text-slate-400">
                    <span class="font-bold text-cyan-400">${m.sender}</span>
                    <span>${m.time}</span>
                </div>
                <p class="text-slate-200">${m.text}</p>
                ${m.img ? `<img src="${m.img}" class="max-h-32 rounded-lg mt-1 border border-slate-800">` : ''}
            </div>
        `;
    });
    box.scrollTop = box.scrollHeight;
}

function handleAdminSendChat(e) {
    e.preventDefault();
    if (!activeChatUser) return;
    const input = document.getElementById('admin-chat-input');
    const text = input.value.trim();
    if (!text) return;
    if (!liveChatConversations[activeChatUser]) liveChatConversations[activeChatUser] = [];
    liveChatConversations[activeChatUser].push({ sender: 'superadmin', text, time: new Date().toLocaleTimeString('id-ID') });
    localStorage.setItem('frh_livechat_conversations', JSON.stringify(liveChatConversations));
    input.value = '';
    renderAdminChatMessages();
}

function handleAdminUploadImage(e) {
    const file = e.target.files[0];
    if (!file || !activeChatUser) return;
    const reader = new FileReader();
    reader.onload = function(event) {
        if (!liveChatConversations[activeChatUser]) liveChatConversations[activeChatUser] = [];
        liveChatConversations[activeChatUser].push({ sender: 'superadmin', text: '[Mengirim Foto]', img: event.target.result, time: new Date().toLocaleTimeString('id-ID') });
        localStorage.setItem('frh_livechat_conversations', JSON.stringify(liveChatConversations));
        renderAdminChatMessages();
    };
    reader.readAsDataURL(file);
}

function renderUserLiveChatMessages() {
    const box = document.getElementById('user-livechat-messages');
    if (!box) return;
    box.innerHTML = '';
    if (!currentUser) return;
    let msgs = liveChatConversations[currentUser.username] || [];
    if (msgs.length === 0) {
        box.innerHTML = `<p class="text-slate-500 text-center">Mulai percobaan chat dengan admin...</p>`;
        return;
    }
    msgs.forEach(m => {
        let isMe = m.sender === currentUser.username;
        box.innerHTML += `
            <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1 ${isMe ? 'border-cyan-500/30' : ''}">
                <div class="flex justify-between text-[10px] text-slate-400">
                    <span class="font-bold text-cyan-400">${m.sender}</span>
                    <span>${m.time}</span>
                </div>
                <p class="text-slate-200">${m.text}</p>
                ${m.img ? `<img src="${m.img}" class="max-h-32 rounded-lg mt-1 border border-slate-800">` : ''}
            </div>
        `;
    });
    box.scrollTop = box.scrollHeight;
}

function handleUserSendChat(e) {
    e.preventDefault();
    const input = document.getElementById('user-chat-input');
    const text = input.value.trim();
    if (!text || !currentUser) return;
    if (!liveChatConversations[currentUser.username]) liveChatConversations[currentUser.username] = [];
    liveChatConversations[currentUser.username].push({ sender: currentUser.username, text, time: new Date().toLocaleTimeString('id-ID') });
    localStorage.setItem('frh_livechat_conversations', JSON.stringify(liveChatConversations));
    input.value = '';
    renderUserLiveChatMessages();
}

function handleUserUploadImage(e) {
    const file = e.target.files[0];
    if (!file || !currentUser) return;
    const reader = new FileReader();
    reader.onload = function(event) {
        if (!liveChatConversations[currentUser.username]) liveChatConversations[currentUser.username] = [];
        liveChatConversations[currentUser.username].push({ sender: currentUser.username, text: '[Mengirim Foto]', img: event.target.result, time: new Date().toLocaleTimeString('id-ID') });
        localStorage.setItem('frh_livechat_conversations', JSON.stringify(liveChatConversations));
        renderUserLiveChatMessages();
    };
    reader.readAsDataURL(file);
}

function renderAdminRewardsList() {
    const list = document.getElementById('admin-rewards-list');
    if (!list) return;
    list.innerHTML = '';
    redeemRewards.forEach((rew, idx) => {
        list.innerHTML += `
            <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <div>
                    <span class="font-bold text-white">${rew.name}</span>
                    <span class="text-amber-400 block">${rew.cost} Poin (${rew.type})</span>
                </div>
                <button onclick="deleteReward(${idx})" class="px-3 py-1 bg-rose-500/20 text-rose-400 font-bold rounded cursor-pointer">Hapus</button>
            </div>
        `;
    });
}

function handleSaveReward(e) {
    e.preventDefault();
    const name = document.getElementById('rew-name').value.trim();
    const cost = parseInt(document.getElementById('rew-cost').value);
    redeemRewards.push({ id: Date.now(), name, cost, type: 'custom' });
    localStorage.setItem('frh_redeem_rewards', JSON.stringify(redeemRewards));
    e.target.reset();
    renderAdminRewardsList();
    alert('Reward redeem baru berhasil ditambahkan!');
}

function deleteReward(idx) {
    redeemRewards.splice(idx, 1);
    localStorage.setItem('frh_redeem_rewards', JSON.stringify(redeemRewards));
    renderAdminRewardsList();
}

function renderUserRedeemRewardsList() {
    const list = document.getElementById('user-redeem-rewards-list');
    if (!list) return;
    list.innerHTML = '';
    let myPts = userPoints[currentUser.username] || 0;

    redeemRewards.forEach(rew => {
        let canAfford = myPts >= rew.cost;
        list.innerHTML += `
            <div class="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col justify-between text-xs space-y-3">
                <div>
                    <span class="font-bold text-white text-sm block">${rew.name}</span>
                    <span class="text-amber-400 font-bold mt-1 inline-block"><i class="fa-solid fa-coins"></i> ${rew.cost} Poin</span>
                </div>
                <button onclick="initRedeemReward(${rew.id})" class="w-full py-2.5 ${canAfford ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold' : 'bg-slate-800 text-slate-500 cursor-not-allowed'} rounded-xl transition-all cursor-pointer">Tukar Hadiah</button>
            </div>
        `;
    });
}

/* ========================================================
   FITUR 2 & 3: REDEEM PILIH POSTINGAN KHUSUS & INPUT E-WALLET
   ======================================================== */
function initRedeemReward(id) {
    let rew = redeemRewards.find(r => r.id === id);
    let myPts = userPoints[currentUser.username] || 0;
    if (myPts < rew.cost) {
        alert('Poin Anda tidak mencukupi untuk menukar hadiah ini.');
        return;
    }

    if (rew.type === 'post_access') {
        openRedeemPostModal(rew);
    } else if (rew.type === 'ewallet' || rew.name.toLowerCase().includes('saldo') || rew.name.toLowerCase().includes('wallet')) {
        pendingEwalletReward = rew;
        document.getElementById('redeem-ewallet-modal').classList.remove('hidden');
    } else {
        executeRedeemReward(rew);
    }
}

function openRedeemPostModal(rew) {
    const modal = document.getElementById('redeem-post-modal');
    const list = document.getElementById('redeem-post-selection-list');
    list.innerHTML = '';
    modal.classList.remove('hidden');

    if (resources.length === 0) {
        list.innerHTML = `<p class="text-xs text-slate-500 text-center">Tidak ada postingan tersedia.</p>`;
        return;
    }

    resources.forEach(res => {
        list.innerHTML += `
            <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <div>
                    <span class="font-bold text-white block">${res.name}</span>
                    <span class="text-[10px] text-cyan-400">${res.category} (${res.version || 'v1.0'})</span>
                </div>
                <button onclick="confirmRedeemPostAccess(${res.id}, '${rew.name.replace(/'/g, "")}', ${rew.cost})" class="px-3 py-1.5 bg-cyan-500 text-slate-950 font-bold rounded-lg cursor-pointer">Pilih & Buka</button>
            </div>
        `;
    });
}

function closeRedeemPostModal() {
    document.getElementById('redeem-post-modal').classList.add('hidden');
}

function confirmRedeemPostAccess(resId, rewName, cost) {
    let uname = currentUser.username;
    userPoints[uname] -= cost;
    localStorage.setItem('frh_user_points', JSON.stringify(userPoints));

    if (!userUnlockedPosts[uname]) userUnlockedPosts[uname] = [];
    if (!userUnlockedPosts[uname].includes(resId)) {
        userUnlockedPosts[uname].push(resId);
        localStorage.setItem('frh_user_unlocked_posts', JSON.stringify(userUnlockedPosts));
    }

    let targetRes = resources.find(r => r.id === resId);
    recordSystemLog('Redeem Poin Berhasil', `User @${uname} berhasil menukar ${cost} poin untuk "${rewName}" pada post "${targetRes ? targetRes.name : resId}".`);
    recordSystemLog('Akses Link Postingan Khusus', `User @${uname} membuka akses khusus post ID ${resId}.`);

    closeRedeemPostModal();
    alert(`Berhasil! Akses postingan "${targetRes ? targetRes.name : ''}" telah dibuka.`);
    renderProfilePage();
}

function closeEWalletModal() {
    document.getElementById('redeem-ewallet-modal').classList.add('hidden');
    pendingEwalletReward = null;
}

function submitEWalletRedeem(e) {
    e.preventDefault();
    if (!pendingEwalletReward) return;
    let number = document.getElementById('ewallet-number').value.trim();
    let accName = document.getElementById('ewallet-name').value.trim();
    let uname = currentUser.username;
    let rew = pendingEwalletReward;

    userPoints[uname] -= rew.cost;
    localStorage.setItem('frh_user_points', JSON.stringify(userPoints));

    recordSystemLog('Redeem Poin Berhasil', `User @${uname} menukar ${rew.cost} poin untuk "${rew.name}" ke e-wallet ${number} (${accName}).`);

    closeEWalletModal();
    e.target.reset();
    alert(`Redeem saldo e-wallet berhasil diajukan! Nomor: ${number} atas nama ${accName}.`);
    renderProfilePage();
}

function executeRedeemReward(rew) {
    let uname = currentUser.username;
    userPoints[uname] -= rew.cost;
    localStorage.setItem('frh_user_points', JSON.stringify(userPoints));

    if (rew.type === 'vip') {
        userVipSubscriptions[uname] = true;
        localStorage.setItem('frh_user_vip_subs', JSON.stringify(userVipSubscriptions));
        recordSystemLog('Akses link tanpa iklan', `User @${uname} mengaktifkan VIP Tanpa Iklan via redeem.`);
    }

    recordSystemLog('Redeem Poin Berhasil', `User @${uname} berhasil menukar ${rew.cost} poin dengan "${rew.name}".`);
    addNotification(`Berhasil menukar redeem: ${rew.name}`, 'admin');
    alert(`Berhasil menukar poin dengan "${rew.name}"!`);
    renderProfilePage();
}

function handleSaveResource(e) {
    e.preventDefault();
    const editId = document.getElementById('edit-resource-id').value;
    const name = document.getElementById('up-name').value;
    const category = document.getElementById('up-category').value;
    const subcategory = document.getElementById('up-subcategory').value.trim();
    const version = document.getElementById('up-version').value.trim();
    const linkAd = document.getElementById('up-link-ad').value.trim();
    const linkNoAd = document.getElementById('up-link-noad').value.trim();
    const description = document.getElementById('up-desc').value;
    const fileSize = document.getElementById('up-link-size').value;
    const screenshot = document.getElementById('up-screenshot').value.trim();
    const verified = document.getElementById('up-verified').checked;

    if (editId) {
        let res = resources.find(r => r.id == editId);
        if (res) {
            res.name = name;
            res.category = category;
            res.subcategory = subcategory;
            res.version = version;
            res.linkAd = linkAd;
            res.linkNoAd = linkNoAd;
            res.description = description;
            res.fileSize = fileSize;
            res.screenshot = screenshot;
            res.verified = verified;
        }
        alert('Tautan resource berhasil diperbarui!');
        resetUploadForm();
    } else {
        const newRes = {
            id: Date.now(),
            name, category, subcategory, version,
            linkAd, linkNoAd, paidUnlockedUsers: [],
            description, fileSize, screenshot, verified,
            uploader: currentUser.username,
            likes: 0, views: 0,
            likedBy: [], savedBy: [],
            ratings: {}, ratedUsers: {},
            reviews: [], comments: []
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
    document.getElementById('up-link-ad').value = res.linkAd || '';
    document.getElementById('up-link-noad').value = res.linkNoAd || '';
    document.getElementById('up-link-size').value = res.fileSize;
    document.getElementById('up-screenshot').value = res.screenshot || '';
    document.getElementById('up-desc').value = res.description;
    document.getElementById('up-verified').checked = res.verified || false;
    document.getElementById('btn-submit-resource').textContent = 'Simpan Perubahan';
    document.getElementById('btn-cancel-edit').classList.remove('hidden');
}

function resetUploadForm() {
    document.getElementById('edit-resource-id').value = '';
    document.getElementById('form-upload-title').innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> Tambah Link File / Aplikasi Baru`;
    document.getElementById('btn-submit-resource').innerHTML = `<i class="fa-solid fa-upload"></i> Publikasikan Tautan Resource`;
    document.getElementById('btn-cancel-edit').classList.add('hidden');
    document.querySelector('form').reset();
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

function openVersionComparison() {
    const res = resources.find(r => r.id === activeResourceId);
    if (!res) return;
    document.getElementById('reader-content').textContent = `=== KOMPARASI & CATATAN RILIS VERSI ===\nVersi Saat Ini: ${res.version || 'v1.0'}\n\n${res.description}`;
    document.getElementById('reader-mode-modal').classList.remove('hidden');
}

function closeReaderMode() {
    document.getElementById('reader-mode-modal').classList.add('hidden');
}

function renderAdminManageList() {
    const list = document.getElementById('admin-manage-list');
    if (!list) return;
    list.innerHTML = '';
    if (resources.length === 0) {
        list.innerHTML = `<p class="text-xs text-slate-500 col-span-full">Belum ada resource.</p>`;
        return;
    }
    resources.forEach(res => {
        list.innerHTML += `
            <div class="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col justify-between text-xs space-y-3">
                <div>
                    <span class="font-bold text-white text-sm block">${res.name} (${res.version || 'v1.0'})</span>
                    <span class="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 inline-block mt-1">${res.category}</span>
                </div>
                <div class="flex gap-2 pt-2 border-t border-slate-900">
                    <button onclick="editResource(${res.id})" class="flex-1 py-1.5 bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-slate-950 font-bold rounded-lg transition-all cursor-pointer">Edit</button>
                    <button onclick="deleteResource(${res.id})" class="flex-1 py-1.5 bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-slate-950 font-bold rounded-lg transition-all cursor-pointer">Hapus</button>
                </div>
            </div>
        `;
    });
}

function renderAdminAnalytics() {
    const statRes = document.getElementById('stat-total-res');
    const statUsers = document.getElementById('stat-total-users');
    if (statRes) statRes.textContent = resources.length;
    let users = JSON.parse(localStorage.getItem('frh_users')) || [];
    if (statUsers) statUsers.textContent = users.length;

    const repList = document.getElementById('admin-reports-list');
    if (!repList) return;
    repList.innerHTML = '';
    if (brokenReports.length === 0) {
        repList.innerHTML = `<p class="text-xs text-slate-500">Belum ada laporan link rusak.</p>`;
        return;
    }

    let reportCounts = {};
    brokenReports.forEach(r => {
        reportCounts[r.resName] = (reportCounts[r.resName] || 0) + 1;
    });

    let sortedReports = Object.keys(reportCounts).sort((a, b) => reportCounts[b] - reportCounts[a]);

    sortedReports.forEach(resName => {
        repList.innerHTML += `
            <div class="bg-slate-950 border border-rose-500/30 p-3 rounded-xl text-xs flex justify-between items-center">
                <div>
                    <span class="font-bold text-rose-400">${resName}</span> mendapati <span class="text-amber-400 font-bold">${reportCounts[resName]} laporan</span> link rusak.
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
        userVipSubscriptions,
        systemLogs,
        exportDate: new Date().toISOString()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "filehub_ultimatesuite_v9_backup.json");
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
    renderAdminUsersList();
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
    if (!box) return;
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
        box.innerHTML += `<div class="text-[10px] text-slate-500 px-2.5 py-1 uppercase border-t border-slate-800 mt-1 flex justify-between items-center"><span>Pencarian Terakhir</span></div>`;
        userRecentSearches.forEach((term, index) => {
            box.innerHTML += `<div class="px-2 py-1.5 hover:bg-slate-800 rounded-lg text-xs text-slate-300 flex items-center justify-between"><span onclick="selectRecentSearch('${term}')" class="cursor-pointer flex-1"><i class="fa-solid fa-clock-rotate-left text-slate-500 mr-2"></i> ${term}</span><button onclick="removeSearchItem(event, ${index})" class="text-rose-400 hover:text-rose-300 px-1"><i class="fa-solid fa-xmark"></i></button></div>`;
        });
    }
}

function removeSearchItem(e, index) {
    e.stopPropagation();
    userRecentSearches.splice(index, 1);
    localStorage.setItem('frh_recent_searches', JSON.stringify(userRecentSearches));
    renderRecentSearchDropdown();
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
    return num;
}

function renderResources() {
    const grid = document.getElementById('resource-grid');
    if (!grid) return;
    const searchKeyword = document.getElementById('search-input').value.toLowerCase();
    const sortBy = document.getElementById('sort-select').value;
    grid.innerHTML = '';

    let filtered = resources.filter(res => {
        let matchCat = true;
        if (currentFilter === 'File') matchCat = res.category === 'File';
        if (currentFilter === 'Aplikasi') matchCat = res.category === 'Aplikasi';
        if (currentFilter === 'Saved') matchCat = res.savedBy && res.savedBy.includes(currentUser.username);

        let matchSearch = res.name.toLowerCase().includes(searchKeyword) || res.description.toLowerCase().includes(searchKeyword);
        return matchCat && matchSearch;
    });

    if (sortBy === 'popular') filtered.sort((a, b) => b.likes - a.likes);
    if (sortBy === 'views') filtered.sort((a, b) => b.views - a.views);
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
        const isCommunityChoice = (res.views >= 100 || parseFloat(calculateAverageRating(res)) >= 4.5) && res.id > oneWeekAgo;

        const iconClass = res.category === 'Aplikasi' ? 'fa-brands fa-android text-emerald-400' : 'fa-solid fa-file-zipper text-cyan-400';
        const avgRating = calculateAverageRating(res);

        grid.innerHTML += `
            <div class="bg-slate-900 border ${isBroken ? 'border-rose-500/50' : 'border-slate-800/80'} rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg group">
                <div>
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center gap-2">
                            <div class="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-lg ${iconClass}"></div>
                            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-400">${res.version || 'v1.0'}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            ${isCommunityChoice ? '<span class="text-[10px] text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">Favorit</span>' : ''}
                            ${isBroken ? '<span class="text-[10px] text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded">Rusak</span>' : ''}
                            <span class="text-[10px] text-amber-400 font-bold"><i class="fa-solid fa-star"></i> ${avgRating}</span>
                        </div>
                    </div>
                    <h3 onclick="openDetail(${res.id})" class="font-bold text-base text-white group-hover:text-cyan-400 transition-colors cursor-pointer line-clamp-1">${res.name}</h3>
                    <p class="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">${res.description}</p>
                </div>
                
                <div class="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-300">
                    <div class="flex items-center gap-3">
                        <button onclick="toggleLike(${res.id})" class="flex items-center gap-1 hover:text-rose-400 transition-colors cursor-pointer ${isLiked ? 'text-rose-500' : ''}">
                            <i class="${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart"></i> <span>${res.likes || 0}</span>
                        </button>
                        <span class="flex items-center gap-1" title="Jumlah Lihat Post"><i class="fa-solid fa-eye text-cyan-400"></i> ${res.views || 0}</span>
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

function copyDirectLinkFromModal() {
    if (!activeResourceId) return;
    const res = resources.find(r => r.id === activeResourceId);
    if (!res) return;
    navigator.clipboard.writeText(res.linkNoAd || res.linkAd);
    alert(`Tautan "${res.name}" berhasil disalin ke clipboard!`);
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
        logUserAction(currentUser.username, `Menyukai resource: ${res.name}`);
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
        logUserAction(currentUser.username, `Menyimpan resource: ${res.name}`);
    }
    localStorage.setItem('frh_resources', JSON.stringify(resources));
    renderResources();
}

function openDetail(id, openModalWindow = true) {
    activeResourceId = id;
    const res = resources.find(r => r.id === id);
    if (!res) return;

    res.views = (res.views || 0) + 1;
    localStorage.setItem('frh_resources', JSON.stringify(resources));

    if (currentUser && currentUser.role !== 'admin') {
        if (!userViewHistory[currentUser.username]) userViewHistory[currentUser.username] = [];
        userViewHistory[currentUser.username] = userViewHistory[currentUser.username].filter(item => item !== res.name);
        userViewHistory[currentUser.username].unshift(res.name);
        if (userViewHistory[currentUser.username].length > 15) userViewHistory[currentUser.username].pop();
        localStorage.setItem('frh_user_view_history', JSON.stringify(userViewHistory));
    }

    if (openModalWindow) {
        document.getElementById('detail-modal').classList.remove('hidden');
    }

    document.getElementById('modal-title').textContent = res.name;
    document.getElementById('modal-version-badge').textContent = res.version || 'v1.0';
    document.getElementById('modal-badge').textContent = `${res.category} / ${res.subcategory}`;
    document.getElementById('modal-desc').textContent = res.description;
    document.getElementById('modal-avg-rating').innerHTML = `<i class="fa-solid fa-star"></i> ${calculateAverageRating(res)}`;
    
    const verifiedBadge = document.getElementById('modal-verified-badge');
    if (res.verified) verifiedBadge.classList.remove('hidden');
    else verifiedBadge.classList.add('hidden');

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

    const downloadAdBtn = document.getElementById('modal-download-ad-btn');
    const downloadNoAdBtn = document.getElementById('modal-download-noad-btn');

    downloadAdBtn.href = res.linkAd;

    let isVip = userVipSubscriptions[currentUser.username] || false;
    let unlockedArr = userUnlockedPosts[currentUser.username] || [];
    let isUnlockedPost = unlockedArr.includes(res.id);

    if (currentUser.role === 'admin' || isVip || isUnlockedPost) {
        downloadNoAdBtn.href = res.linkNoAd;
        downloadNoAdBtn.innerHTML = `<i class="fa-solid fa-shield-halved"></i> Link Tanpa Iklan (${res.fileSize}) [Akses Aktif]`;
    } else {
        downloadNoAdBtn.href = "#";
        downloadNoAdBtn.onclick = (e) => {
            e.preventDefault();
            alert('Link Tanpa Iklan memerlukan langganan VIP atau pembelian akses post ini via Redeem Poin / Live Chat.');
            switchMainView('livechat');
            closeModal();
        };
        downloadNoAdBtn.innerHTML = `<i class="fa-solid fa-lock"></i> Link Tanpa Iklan (Terkunci)`;
    }

    const iconDiv = document.getElementById('modal-file-icon');
    iconDiv.innerHTML = `<i class="${res.category === 'Aplikasi' ? 'fa-brands fa-android text-emerald-400' : 'fa-solid fa-file-zipper text-cyan-400'}"></i>`;

    let hasRated = res.ratedUsers && res.ratedUsers[currentUser.username];
    const submitRatingBtn = document.getElementById('btn-submit-rating');
    const reviewInput = document.getElementById('review-input');
    if (hasRated) {
        submitRatingBtn.disabled = true;
        submitRatingBtn.textContent = 'Anda sudah memberi rating pada post ini';
        submitRatingBtn.classList.add('opacity-50', 'cursor-not-allowed');
        reviewInput.disabled = true;
    } else {
        submitRatingBtn.disabled = false;
        submitRatingBtn.textContent = 'Kirim Rating & Ulasan';
        submitRatingBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        reviewInput.disabled = false;
    }

    const reviewList = document.getElementById('review-list');
    document.getElementById('review-count').textContent = res.reviews ? res.reviews.length : 0;
    reviewList.innerHTML = '';
    if (!res.reviews || res.reviews.length === 0) {
        reviewList.innerHTML = `<p class="text-xs text-slate-500 text-center py-2">Belum ada ulasan.</p>`;
    } else {
        res.reviews.forEach(rv => {
            let starsHtml = '<span class="text-amber-400">';
            for(let i=0; i<rv.rating; i++) starsHtml += '<i class="fa-solid fa-star"></i>';
            starsHtml += '</span>';
            reviewList.innerHTML += `<div class="bg-slate-950 border border-slate-800/60 p-3 rounded-xl text-xs space-y-1"><div class="flex justify-between items-center"><span class="font-bold text-cyan-400">${rv.user}</span> ${starsHtml}</div><p class="text-slate-300">${rv.text}</p></div>`;
        });
    }

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

function selectRatingStar(star) {
    currentSelectedStar = star;
    document.getElementById('rating-selected-text').textContent = `${star} Bintang Dipilih`;
    const starBtns = document.querySelectorAll('#star-container button');
    starBtns.forEach((btn, idx) => {
        if ((idx + 1) <= star) {
            btn.className = "text-amber-400 cursor-pointer";
        } else {
            btn.className = "text-slate-600 hover:text-amber-400 cursor-pointer";
        }
    });
}

function handlePostRatingAndReview(e) {
    e.preventDefault();
    if (!activeResourceId) return;
    let res = resources.find(r => r.id === activeResourceId);
    if (!res.ratings) res.ratings = {};
    if (!res.ratedUsers) res.ratedUsers = {};
    if (!res.reviews) res.reviews = [];

    if (res.ratedUsers[currentUser.username]) {
        alert('Anda sudah memberikan rating pada postingan ini sebelumnya.');
        return;
    }

    const reviewText = document.getElementById('review-input').value.trim();
    res.ratedUsers[currentUser.username] = currentSelectedStar;
    res.ratings[currentSelectedStar] = (res.ratings[currentSelectedStar] || 0) + 1;
    res.reviews.unshift({ user: currentUser.username, rating: currentSelectedStar, text: reviewText });

    addPoints(currentUser.username, 10);
    logUserAction(currentUser.username, `Memberi rating ${currentSelectedStar} bintang & ulasan pada ${res.name}`);
    localStorage.setItem('frh_resources', JSON.stringify(resources));
    
    alert(`Terima kasih! Ulasan & rating berhasil dikirim (+10 Poin).`);
    document.getElementById('review-input').value = '';
    openDetail(activeResourceId, false);
    renderResources();
}

function recordDownload(e, type) {
    if (!currentUser) {
        e.preventDefault();
        alert('Anda wajib login atau daftar terlebih dahulu sebelum mengunduh file.');
        document.getElementById('auth-modal').classList.remove('hidden');
        return;
    }

    if (type === 'noad') {
        let res = resources.find(r => r.id === activeResourceId);
        let isVip = userVipSubscriptions[currentUser.username] || false;
        let unlockedArr = userUnlockedPosts[currentUser.username] || [];
        let isUnlocked = unlockedArr.includes(res.id);
        if (currentUser.role !== 'admin' && !isVip && !isUnlocked) {
            e.preventDefault();
            alert('Akses Link Tanpa Iklan terkunci. Tukarkan poin redeem atau hubungi admin via Live Chat.');
            switchMainView('livechat');
            closeModal();
            return;
        }
        recordSystemLog('Akses link tanpa iklan', `User @${currentUser.username} mengakses link tanpa iklan untuk post "${res.name}".`);
    }

    addPoints(currentUser.username, 5);
    logUserAction(currentUser.username, `Mengunduh resource (${type === 'ad' ? 'Dengan Iklan' : 'Tanpa Iklan'})`);
}

function reportBrokenLink() {
    if (!activeResourceId) return;
    let res = resources.find(r => r.id === activeResourceId);
    if (!brokenReports.some(rep => rep.resName === res.name && rep.user === currentUser.username)) {
        brokenReports.push({ resName: res.name, user: currentUser.username });
        localStorage.setItem('frh_broken_reports', JSON.stringify(brokenReports));
        addNotification(`Laporan link rusak diterima: ${res.name}`, 'danger');
        addPoints(currentUser.username, 5);
        logUserAction(currentUser.username, `Melaporkan link rusak: ${res.name}`);
        alert('Laporan link rusak terkirim (+5 Poin).');
        openDetail(activeResourceId, false);
        renderResources();
    } else {
        alert('Anda sudah melaporkan link ini sebelumnya.');
    }
}

function closeModal() {
    const modal = document.getElementById('detail-modal');
    if (modal) modal.classList.add('hidden');
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
    logUserAction(currentUser.username, `Mengomentari resource: ${res.name}`);
    localStorage.setItem('frh_resources', JSON.stringify(resources));
    input.value = '';
    alert('Komentar berhasil dikirim (+5 Poin).');
    openDetail(activeResourceId, false);
}

function togglePasswordForm() {
    const box = document.getElementById('profile-password-box');
    if (box) box.classList.toggle('hidden');
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

const profileQuestsDefinition = [
    { id: 'like_1', title: 'Sukai 1 postingan', reward: 10, target: 1, type: 'like' },
    { id: 'like_5', title: 'Sukai 5 Postingan', reward: 30, target: 5, type: 'like' },
    { id: 'rate_star5_1', title: 'Lakukan Rating Bintang 5 Untuk 1 Postingan', reward: 15, target: 1, type: 'rate5' },
    { id: 'rate_star5_3', title: 'Lakukan Rating Bintang 5 Untuk 3 Postingan', reward: 45, target: 3, type: 'rate5' },
    { id: 'comment_10', title: 'Lakukan 10 Komentar Pada Postingan', reward: 50, target: 10, type: 'comment' },
    { id: 'comment_50', title: 'Lakukan 50 Komentat Pada Postingan', reward: 200, target: 50, type: 'comment' },
    { id: 'comment_100', title: 'Lakukan 100 Komentat Pada Postingan', reward: 400, target: 100, type: 'comment' },
    { id: 'view_100', title: 'Lihat 100 Postingan', reward: 75, target: 100, type: 'view' },
    { id: 'get_badge', title: 'Dapatkan Badge Di Profile Kamu', reward: 50, target: 1, type: 'badge' }
];

function checkQuestRealProgress(type) {
    let uname = currentUser.username;
    if (type === 'like') {
        let count = 0;
        resources.forEach(r => { if (r.likedBy && r.likedBy.includes(uname)) count++; });
        return count;
    }
    if (type === 'rate5') {
        let count = 0;
        resources.forEach(r => { if (r.ratedUsers && r.ratedUsers[uname] === 5) count++; });
        return count;
    }
    if (type === 'comment') {
        let count = 0;
        resources.forEach(r => {
            if (r.comments) {
                r.comments.forEach(c => { if (c.user === uname) count++; });
            }
        });
        return count;
    }
    if (type === 'view') {
        let myViews = userViewHistory[uname] || [];
        return myViews.length;
    }
    if (type === 'badge') {
        let badge = getUserBadge(uname);
        return badge.includes('Member Baru') ? 0 : 1;
    }
    return 0;
}

function claimProfileQuest(questId, target, type, reward) {
    let uname = currentUser.username;
    if (!userQuestClaims[uname]) userQuestClaims[uname] = {};
    if (userQuestClaims[uname][questId]) {
        alert('Quest ini sudah pernah diklaim sebelumnya!');
        return;
    }

    let currentProgress = checkQuestRealProgress(type);
    if (currentProgress >= target) {
        userQuestClaims[uname][questId] = true;
        localStorage.setItem('frh_user_quest_claims', JSON.stringify(userQuestClaims));
        addPoints(uname, reward);
        addNotification(`Quest "${questId}" berhasil diklaim! (+${reward} Poin)`, 'admin');
        recordSystemLog('Quest Berhasil', `User @${uname} berhasil menyelesaikan dan mengklaim quest "${questId}" (+${reward} Poin).`);
        alert(`Validasi Berhasil! Quest selesai. Anda mendapatkan +${reward} Poin.`);
        renderProfilePage();
    } else {
        alert(`Validasi Gagal! Anda belum memenuhi syarat (Progress saat ini: ${currentProgress}/${target}). Selesaikan dulu quest tersebut!`);
    }
}

function renderProfilePage() {
    document.getElementById('profile-username').textContent = currentUser.username;
    document.getElementById('profile-badge-label').textContent = getUserBadge(currentUser.username);
    document.getElementById('profile-points-label').textContent = `Poin Reward: ${userPoints[currentUser.username] || 0} Pts`;
    
    let currentLvl = userLevels[currentUser.username] || 1;
    document.getElementById('profile-level-label').textContent = `Level: ${currentLvl} (Progres Otomatis)`;

    let isVip = userVipSubscriptions[currentUser.username] || false;
    document.getElementById('profile-vip-status').innerHTML = isVip ? `<span class="px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg"><i class="fa-solid fa-shield-halved"></i> VIP Tanpa Iklan Aktif</span>` : `<span class="text-slate-400">Status: Member Free (Dengan Iklan)</span>`;

    const trophyBox = document.getElementById('profile-trophies');
    trophyBox.innerHTML = '';
    let pts = userPoints[currentUser.username] || 0;
    if (pts >= 20) trophyBox.innerHTML += `<span class="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-[10px] font-bold">Active Reviewer</span>`;
    if (pts >= 50) trophyBox.innerHTML += `<span class="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-full text-[10px] font-bold">Bug Hunter</span>`;

    const questList = document.getElementById('profile-quests-list');
    if (questList) {
        questList.innerHTML = '';
        let uname = currentUser.username;
        if (!userQuestClaims[uname]) userQuestClaims[uname] = {};

        profileQuestsDefinition.forEach(q => {
            let isClaimed = userQuestClaims[uname][q.id] || false;
            let currentProg = checkQuestRealProgress(q.type);
            let canClaim = currentProg >= q.target && !isClaimed;

            let btnHtml = '';
            if (isClaimed) {
                btnHtml = `<span class="text-emerald-400 font-bold text-[11px]"><i class="fa-solid fa-check"></i> Selesai & Diklaim</span>`;
            } else if (canClaim) {
                btnHtml = `<button onclick="claimProfileQuest('${q.id}', ${q.target}, '${q.type}', ${q.reward})" class="px-3 py-1.5 bg-emerald-500 text-slate-950 font-bold rounded-xl cursor-pointer">Klaim Poin (+${q.reward})</button>`;
            } else {
                btnHtml = `<span class="text-slate-500 text-[10px]">Progress: ${currentProg}/${q.target}</span>`;
            }

            questList.innerHTML += `
                <div class="bg-slate-950 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between text-xs">
                    <div>
                        <span class="font-bold text-white block">${q.title}</span>
                        <span class="text-amber-400 text-[10px]">Hadiah: +${q.reward} Poin</span>
                    </div>
                    <div>${btnHtml}</div>
                </div>
            `;
        });
    }

    renderUserRedeemRewardsList();

    const viewList = document.getElementById('profile-view-history-list');
    viewList.innerHTML = '';
    let myViews = userViewHistory[currentUser.username] || [];
    if (myViews.length === 0) {
        viewList.innerHTML = `<p class="text-xs text-slate-500">Belum ada riwayat melihat post.</p>`;
    } else {
        myViews.forEach(name => {
            viewList.innerHTML += `<div class="bg-slate-950 p-3 rounded-xl text-xs text-slate-300 border border-slate-800 flex items-center gap-2"><i class="fa-solid fa-eye text-cyan-400"></i> ${name}</div>`;
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
}
