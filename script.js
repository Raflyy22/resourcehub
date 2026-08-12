let currentUser = JSON.parse(localStorage.getItem('frh_current_user')) || null;
let adminCreds = JSON.parse(localStorage.getItem('frh_admin_creds')) || { user: 'superadmin', pass: 'securepass99', pin: '8888' };
let adminFailedAttempts = parseInt(localStorage.getItem('frh_admin_fails')) || 0;
let adminLockUntil = parseInt(localStorage.getItem('frh_admin_lock')) || 0;

let telegramConfig = JSON.parse(localStorage.getItem('frh_telegram_config')) || { token: '', chatId: '' };
let currentBroadcast = JSON.parse(localStorage.getItem('frh_broadcast')) || { title: "PENGUMUMAN PENTING", content: "Selamat datang di RapzResource HUB v15. Fitur unduhan terpisah, proteksi postingan khusus, dan 20 quest aktif!" };

let categoryConfig = JSON.parse(localStorage.getItem('frh_category_config')) || {
    "Script Mobile Legends": ["Script Skin", "Script Anti Lag", "Script Booster", "Game Booster"],
    "Script Free Fire": ["Script Skin", "Script Anti Lag", "Script Aimbot"]
};

let resources = JSON.parse(localStorage.getItem('frh_resources')) || [
    {
        id: 1,
        name: "Script Skin Epic MLBB v1",
        category: "Script Mobile Legends",
        subcategory: "Script Skin",
        version: "v1.0",
        // Poin 1: Link terpisah terstruktur
        freeLinks: [{ name: "Safelink Iklan Free 1", url: "https://safelink-sample.com/ml1" }],
        vvipLinks: [{ name: "Tanpa Iklan VVIP Drive", url: "https://drive.google.com/ml1-clean" }],
        directLinks: [{ name: "Direct File Utama", url: "https://direct-download.com/ml1", fileData: "" }],
        paidUnlockedUsers: [],
        isSpecialAccess: true,
        description: "Script skin epic permanen anti ban work 100% di mode ranked.\n\n[Petunjuk]: Salin folder art ke com.mobile.legends/files/dragon2017/assets.",
        fileSize: "25.4 MB",
        screenshot: "",
        verified: true,
        uploader: "superadmin",
        likes: 15,
        views: 210,
        likedBy: [],
        savedBy: [],
        ratings: { 5: 5 },
        ratedUsers: {},
        reviews: [{ user: "Budi", rating: 5, text: "Mantap work tanpa lag!" }],
        comments: [{ user: "Budi", text: "Aman gais." }],
        editStatus: null
    }
];

let announcements = JSON.parse(localStorage.getItem('frh_announcements')) || [];
let communityRequests = JSON.parse(localStorage.getItem('frh_community_requests')) || [];
let liveChatConversations = JSON.parse(localStorage.getItem('frh_livechat_conversations')) || {
    "Budi": [{ sender: "Budi", text: "Halo admin.", time: "10:00" }]
};
let activeChatUser = "Budi";

let redeemRewards = JSON.parse(localStorage.getItem('frh_redeem_rewards')) || [
    { id: 1, name: "Akses VVIP Tanpa Iklan (1 Bulan)", cost: 50, type: "vip", limitPerUser: 1, quota: 100, claimedCount: 0 },
    { id: 2, name: "Akses Postingan Khusus Satuan", cost: 25, type: "post_access", limitPerUser: 5, quota: 200, claimedCount: 0 },
    { id: 3, name: "Saldo Dana Rp 25.000", cost: 100, type: "dana", limitPerUser: 1, quota: 50, claimedCount: 0 }
];

let userViewHistory = JSON.parse(localStorage.getItem('frh_user_view_history')) || {};
let userPoints = JSON.parse(localStorage.getItem('frh_user_points')) || {};
let userLevels = JSON.parse(localStorage.getItem('frh_user_levels')) || {}; 
let userQuestClaims = JSON.parse(localStorage.getItem('frh_user_quest_claims')) || {};
let userVipSubscriptions = JSON.parse(localStorage.getItem('frh_user_vip_subs')) || {}; 
let userUnlockedPosts = JSON.parse(localStorage.getItem('frh_user_unlocked_posts')) || {}; 
let userAuditLogs = JSON.parse(localStorage.getItem('frh_user_audit_logs')) || {};
let systemLogs = JSON.parse(localStorage.getItem('frh_system_logs')) || []; 
let brokenReports = JSON.parse(localStorage.getItem('frh_broken_reports')) || [];
let userRecentSearches = JSON.parse(localStorage.getItem('frh_recent_searches')) || [];
let notifications = JSON.parse(localStorage.getItem('frh_notifications')) || [
    { id: 1, text: "Selamat datang di RapzResource HUB v15!", type: 'info', read: false, time: "Baru saja" }
];
let userRedeemHistory = JSON.parse(localStorage.getItem('frh_user_redeem_history')) || {}; 
let userBans = JSON.parse(localStorage.getItem('frh_user_bans')) || {}; 

let currentMainCategory = 'All';
let currentSubCategory = 'All';
let activeResourceId = null;
let currentSelectedStar = 5;
let adminSessionTimer = null;
let currentLogFilter = 'all';
let activeEditModeAction = null;

document.addEventListener('DOMContentLoaded', () => {
    checkVipExpiration();
    checkBanExpiration();
    checkAuthState();
    checkAdminLockState();
    renderNotifications();
    renderBroadcastBanner();
    updateSubCategories();
    addFreeLinkRow();
    addVvipLinkRow();

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
            toggleSupportChatModal();
        }
    });

    if (currentUser && currentUser.role === 'admin') {
        resetAdminSessionTimer();
    }
});

/* ========================================================
   MANAJEMEN KATEGORI & LINK MANUAL (Poin 1)
   ======================================================== */
function updateSubCategories() {
    const mainCatSelect = document.getElementById('up-category');
    const subCatSelect = document.getElementById('up-subcategory');
    if (!mainCatSelect || !subCatSelect) return;

    const selectedMain = mainCatSelect.value;
    subCatSelect.innerHTML = '';
    
    let subs = categoryConfig[selectedMain] || [];
    subs.forEach(sub => {
        subCatSelect.innerHTML += `<option value="${sub}">${sub}</option>`;
    });
}

function renderAdminCategoriesConfig() {
    const mlList = document.getElementById('admin-ml-sub-list');
    const ffList = document.getElementById('admin-ff-sub-list');
    if (!mlList || !ffList) return;

    mlList.innerHTML = '';
    ffList.innerHTML = '';

    (categoryConfig["Script Mobile Legends"] || []).forEach((sub, idx) => {
        mlList.innerHTML += `
            <div class="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-xs">
                <span class="text-slate-200 font-semibold">${sub}</span>
                <button onclick="removeSubCategory('Script Mobile Legends', ${idx})" class="text-rose-400 hover:text-rose-300 px-2 py-1"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
    });

    (categoryConfig["Script Free Fire"] || []).forEach((sub, idx) => {
        ffList.innerHTML += `
            <div class="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-xs">
                <span class="text-slate-200 font-semibold">${sub}</span>
                <button onclick="removeSubCategory('Script Free Fire', ${idx})" class="text-rose-400 hover:text-rose-300 px-2 py-1"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
    });
}

function addNewSubCategory(mainCat) {
    let inputId = mainCat === 'Script Mobile Legends' ? 'new-ml-sub-input' : 'new-ff-sub-input';
    let val = document.getElementById(inputId).value.trim();
    if (!val) { alert('Nama sub-kategori kosong!'); return; }
    if (!categoryConfig[mainCat]) categoryConfig[mainCat] = [];
    categoryConfig[mainCat].push(val);
    localStorage.setItem('frh_category_config', JSON.stringify(categoryConfig));
    document.getElementById(inputId).value = '';
    renderAdminCategoriesConfig();
    updateSubCategories();
    alert('Sub-kategori ditambahkan.');
}

function removeSubCategory(mainCat, idx) {
    if (confirm('Hapus sub-kategori?')) {
        categoryConfig[mainCat].splice(idx, 1);
        localStorage.setItem('frh_category_config', JSON.stringify(categoryConfig));
        renderAdminCategoriesConfig();
        updateSubCategories();
    }
}

// Poin 1: Tambah Baris Link Iklan Free & VVIP manual
function addFreeLinkRow(name = '', url = '') {
    const container = document.getElementById('free-links-container');
    if (!container) return;
    const id = Date.now() + Math.random();
    let div = document.createElement('div');
    div.className = "flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800";
    div.id = `free-row-${id}`;
    div.innerHTML = `
        <input type="text" placeholder="Nama Link Iklan..." value="${name}" class="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs free-name" required>
        <input type="url" placeholder="https://..." value="${url}" class="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs free-url" required>
        <button type="button" onclick="document.getElementById('free-row-${id}').remove()" class="px-2.5 py-2 bg-rose-500/20 text-rose-400 rounded-lg text-xs cursor-pointer"><i class="fa-solid fa-trash"></i></button>
    `;
    container.appendChild(div);
}

function addVvipLinkRow(name = '', url = '') {
    const container = document.getElementById('vvip-links-container');
    if (!container) return;
    const id = Date.now() + Math.random();
    let div = document.createElement('div');
    div.className = "flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800";
    div.id = `vvip-row-${id}`;
    div.innerHTML = `
        <input type="text" placeholder="Nama Link Tanpa Iklan VVIP..." value="${name}" class="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs vvip-name" required>
        <input type="url" placeholder="https://..." value="${url}" class="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs vvip-url" required>
        <button type="button" onclick="document.getElementById('vvip-row-${id}').remove()" class="px-2.5 py-2 bg-rose-500/20 text-rose-400 rounded-lg text-xs cursor-pointer"><i class="fa-solid fa-trash"></i></button>
    `;
    container.appendChild(div);
}

/* ========================================================
   WAKTU VVIP & BAN
   ======================================================== */
function checkVipExpiration() {
    let now = Date.now();
    let updated = false;
    for (let uname in userVipSubscriptions) {
        if (now > userVipSubscriptions[uname]) {
            delete userVipSubscriptions[uname];
            updated = true;
            addNotification(`Masa aktif VVIP Anda berakhir.`, 'danger');
        }
    }
    if (updated) localStorage.setItem('frh_user_vip_subs', JSON.stringify(userVipSubscriptions));
}

function checkBanExpiration() {
    let now = Date.now();
    let updated = false;
    for (let uname in userBans) {
        if (userBans[uname] !== 'permanent' && now > userBans[uname]) {
            delete userBans[uname];
            updated = true;
        }
    }
    if (updated) localStorage.setItem('frh_user_bans', JSON.stringify(userBans));
}

function togglePasswordVisibility(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (input.type === 'password') { input.type = 'text'; icon.className = "fa-regular fa-eye-slash"; }
    else { input.type = 'password'; icon.className = "fa-regular fa-eye"; }
}

function logUserAction(username, actionText) {
    if (!userAuditLogs[username]) userAuditLogs[username] = [];
    userAuditLogs[username].unshift({ text: actionText, time: new Date().toLocaleTimeString('id-ID') });
    if (userAuditLogs[username].length > 10) userAuditLogs[username].pop();
    localStorage.setItem('frh_user_audit_logs', JSON.stringify(userAuditLogs));
}

function sendTelegramNotification(text) {
    if (!telegramConfig.token || !telegramConfig.chatId) return;
    fetch(`https://api.telegram.org/bot${telegramConfig.token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: telegramConfig.chatId, text: `🤖 [RapzResource v15]\n${text}`, parse_mode: 'HTML' })
    }).catch(err => console.error(err));
}

function handleSaveTelegramConfig(e) {
    e.preventDefault();
    telegramConfig.token = document.getElementById('tg-token').value.trim();
    telegramConfig.chatId = document.getElementById('tg-chatid').value.trim();
    localStorage.setItem('frh_telegram_config', JSON.stringify(telegramConfig));
    alert('Telegram terhubung!');
}

function handleSaveBroadcast(e) {
    e.preventDefault();
    currentBroadcast = { title: document.getElementById('bc-title').value.trim(), content: document.getElementById('bc-content').value.trim() };
    localStorage.setItem('frh_broadcast', JSON.stringify(currentBroadcast));
    alert('Broadcast disimpan!');
    renderBroadcastBanner();
}

function renderBroadcastBanner() {
    const bannerBox = document.getElementById('broadcast-banner-container');
    if (!bannerBox || !currentBroadcast.content) return;
    bannerBox.innerHTML = `
        <div class="bg-slate-900 border border-cyan-500/40 rounded-2xl p-4 shadow-lg space-y-2">
            <div class="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase"><i class="fa-solid fa-bullhorn animate-pulse"></i> ${currentBroadcast.title}</div>
            <div class="overflow-hidden relative bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div class="animate-marquee text-xs text-slate-200 font-semibold">${currentBroadcast.content}</div>
            </div>
        </div>
    `;
}

function resetAllLogs() {
    if (confirm('Reset semua logs?')) {
        systemLogs = [];
        localStorage.setItem('frh_system_logs', JSON.stringify(systemLogs));
        renderAdminLogsList();
    }
}

function recordSystemLog(logType, detailText, uname = null) {
    systemLogs.unshift({ id: Date.now(), user: uname || (currentUser ? currentUser.username : 'Guest'), type: logType, detail: detailText, time: new Date().toLocaleString('id-ID') });
    if (systemLogs.length > 200) systemLogs.pop();
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
    badge.textContent = unreadCount;
    if (unreadCount > 0) badge.classList.remove('hidden'); else badge.classList.add('hidden');
    notifications.forEach(n => {
        list.innerHTML += `<div class="bg-slate-950 p-2.5 rounded-xl border border-cyan-500/30 text-xs space-y-1"><p class="text-slate-300">${n.text}</p></div>`;
    });
}

function toggleNotificationDropdown() { document.getElementById('notif-dropdown').classList.toggle('hidden'); }
function clearNotifications() { notifications.forEach(n => n.read = true); localStorage.setItem('frh_notifications', JSON.stringify(notifications)); renderNotifications(); }

function addPoints(username, amount) {
    if (!userPoints[username]) userPoints[username] = 0;
    userPoints[username] += amount;
    localStorage.setItem('frh_user_points', JSON.stringify(userPoints));
}

function addExpAndLevelProgress(username, amount = null) {
    if (!username) return;
    if (!userLevels[username]) userLevels[username] = { level: 1, exp: 0 };
    let uData = userLevels[username];
    uData.exp += (amount !== null ? amount : 1);
    let targetExp = uData.level * 50;
    while (uData.exp >= targetExp && uData.level < 100) {
        uData.exp -= targetExp;
        uData.level++;
        targetExp = uData.level * 50;
        addNotification(`Selamat! Akun naik ke Level ${uData.level}!`, 'admin');
    }
    localStorage.setItem('frh_user_levels', JSON.stringify(userLevels));
}

function formatFileSizeInput(el) {
    let val = el.value.trim();
    if (val && !val.toLowerCase().includes('mb')) el.value = parseFloat(val) + " MB";
}

function switchAuthTab(tab) {
    if (tab === 'login') {
        document.getElementById('form-login-unified').classList.remove('hidden');
        document.getElementById('form-reg-unified').classList.add('hidden');
        document.getElementById('tab-login').className = "flex-1 py-2.5 text-xs font-semibold rounded-lg text-cyan-400 bg-slate-800 cursor-pointer";
        document.getElementById('tab-reg').className = "flex-1 py-2.5 text-xs font-semibold rounded-lg text-slate-400 cursor-pointer";
    } else {
        document.getElementById('form-login-unified').classList.add('hidden');
        document.getElementById('form-reg-unified').classList.remove('hidden');
        document.getElementById('tab-reg').className = "flex-1 py-2.5 text-xs font-semibold rounded-lg text-cyan-400 bg-slate-800 cursor-pointer";
        document.getElementById('tab-login').className = "flex-1 py-2.5 text-xs font-semibold rounded-lg text-slate-400 cursor-pointer";
    }
}

function checkUnifiedAdminTrigger() {
    if (document.getElementById('uni-user').value.trim() === adminCreds.user && document.getElementById('uni-pass').value === adminCreds.pass) {
        document.getElementById('container-admin-pin').classList.remove('hidden');
    } else {
        document.getElementById('container-admin-pin').classList.add('hidden');
    }
}

function handleUnifiedLogin(e) {
    e.preventDefault();
    const u = document.getElementById('uni-user').value.trim();
    const p = document.getElementById('uni-pass').value;
    const pin = document.getElementById('uni-pin').value;

    if (u === adminCreds.user && p === adminCreds.pass) {
        if (pin === adminCreds.pin) {
            currentUser = { username: 'Super Administrator', role: 'admin' };
            resetAdminSessionTimer();
        } else { alert('PIN Salah!'); return; }
    } else {
        let users = JSON.parse(localStorage.getItem('frh_users')) || [];
        let valid = users.find(x => x.username === u && x.password === p);
        if (userBans[u]) { alert('Akun diblokir.'); return; }
        if (!valid && u !== 'user') { alert('Login gagal.'); return; }
        currentUser = { username: u, role: 'user' };
        logUserAction(u, 'Login');
    }
    localStorage.setItem('frh_current_user', JSON.stringify(currentUser));
    checkAuthState();
}

function resetAdminSessionTimer() {
    if (adminSessionTimer) clearTimeout(adminSessionTimer);
    adminSessionTimer = setTimeout(() => { logout(); }, 15 * 60 * 1000);
}

function handleRegister(e) {
    e.preventDefault();
    const u = document.getElementById('reg-username').value.trim();
    const p = document.getElementById('reg-password').value;
    let users = JSON.parse(localStorage.getItem('frh_users')) || [];
    if (users.some(x => x.username === u)) { alert('Sudah terdaftar!'); return; }
    users.push({ username: u, password: p });
    localStorage.setItem('frh_users', JSON.stringify(users));
    alert('Registrasi sukses!');
    switchAuthTab('login');
}

function checkAdminLockState() {}
function logout() { localStorage.removeItem('frh_current_user'); currentUser = null; checkAuthState(); }

function checkAuthState() {
    if (!currentUser) {
        document.getElementById('auth-modal').classList.remove('hidden');
        document.getElementById('main-app').classList.add('hidden');
    } else {
        document.getElementById('auth-modal').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        document.getElementById('user-display-name').textContent = currentUser.username;
        document.getElementById('user-role-badge').textContent = currentUser.role === 'admin' ? 'Super Admin' : getUserBadge(currentUser.username);

        if (currentUser.role === 'admin') {
            document.getElementById('admin-panel').classList.remove('hidden');
            document.getElementById('user-panel').classList.add('hidden');
            document.getElementById('nav-profile-btn').classList.add('hidden');
            renderAdminDashboard();
        } else {
            document.getElementById('admin-panel').classList.add('hidden');
            document.getElementById('user-panel').classList.remove('hidden');
            document.getElementById('nav-profile-btn').classList.remove('hidden');
            renderResources();
        }
    }
}

function getUserBadge(username) {
    let pts = userPoints[username] || 0;
    let uLvl = userLevels[username] ? userLevels[username].level : 1;
    if (pts >= 1000) return 'Grandmaster Elite 👑🔥';
    if (pts >= 500) return 'Master Contributor 🏆';
    return 'Member Baru 🌱';
}

function switchMainView(view) {
    ['user-panel', 'profile-panel', 'faq-panel', 'leaderboard-panel', 'requests-panel', 'livechat-panel'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });
    if (view === 'home') { document.getElementById('user-panel').classList.remove('hidden'); renderResources(); }
    else if (view === 'profile') { document.getElementById('profile-panel').classList.remove('hidden'); renderProfilePage(); }
    else if (view === 'faq') document.getElementById('faq-panel').classList.remove('hidden');
    else if (view === 'leaderboard') { document.getElementById('leaderboard-panel').classList.remove('hidden'); renderLeaderboardPage(); }
    else if (view === 'requests') { document.getElementById('requests-panel').classList.remove('hidden'); renderCommunityRequests(); }
    else if (view === 'livechat') { document.getElementById('livechat-panel').classList.remove('hidden'); renderUserLiveChatMessages(); }
}

function toggleSupportChatModal() { document.getElementById('support-chat-modal').classList.toggle('hidden'); }
function selectSupportCategory(cat) { toggleSupportChatModal(); if (cat === 'Bantuan') switchMainView('livechat'); else switchMainView('requests'); }

function openRequestModal() { document.getElementById('request-modal').classList.remove('hidden'); }
function closeRequestModal() { document.getElementById('request-modal').classList.add('hidden'); }

function handlePostRequest(e) {
    e.preventDefault();
    communityRequests.push({ id: Date.now(), title: document.getElementById('req-title').value, desc: document.getElementById('req-desc').value, user: currentUser.username });
    localStorage.setItem('frh_community_requests', JSON.stringify(communityRequests));
    closeRequestModal();
    alert('Request dikirim!');
}

function renderCommunityRequests() {
    const list = document.getElementById('user-requests-list');
    if (!list) return;
    list.innerHTML = '';
    brokenReports.forEach((rep, idx) => {
        list.innerHTML += `<div class="bg-slate-950 p-4 rounded-xl border border-rose-500/30 flex justify-between items-center text-xs"><div><span class="font-bold text-rose-400">Script: ${rep.resName}</span><span class="text-[10px] text-slate-400 block">Pelapor: @${rep.user}</span></div><button onclick="brokenReports.splice(${idx},1);localStorage.setItem('frh_broken_reports',JSON.stringify(brokenReports));renderCommunityRequests();" class="px-3 py-1 bg-slate-800 text-slate-300 rounded cursor-pointer">Selesaikan</button></div>`;
    });
    if (brokenReports.length === 0) list.innerHTML = `<p class="text-xs text-slate-500">Tidak ada laporan.</p>`;
}

function renderLeaderboardPage() {
    const list = document.getElementById('leaderboard-list');
    if (!list) return;
    list.innerHTML = '';
    let users = JSON.parse(localStorage.getItem('frh_users')) || [];
    let rank = users.map(u => ({ username: u.username, points: userPoints[u.username] || 0 }));
    rank.sort((a, b) => b.points - a.points);
    rank.forEach((r, idx) => {
        list.innerHTML += `<div class="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between text-xs"><span>#${idx+1} ${r.username}</span><span class="text-cyan-400 font-bold">${r.points} Pts</span></div>`;
    });
}

function switchAdminTab(type) {
    ['upload', 'manage', 'categories', 'users', 'broadcast', 'telegram', 'logs', 'livechat', 'rewards', 'requests', 'analytics', 'backup', 'settings'].forEach(t => {
        let sec = document.getElementById(`admin-${t}-section`);
        if (sec) sec.classList.add('hidden');
    });
    document.getElementById(`admin-${type}-section`).classList.remove('hidden');
    if (type === 'manage') renderAdminManageList();
    if (type === 'categories') renderAdminCategoriesConfig();
    if (type === 'users') renderAdminUsersList();
    if (type === 'logs') renderAdminLogsList();
    if (type === 'livechat') renderAdminLiveChatUsers();
    if (type === 'rewards') renderAdminRewardsList();
    if (type === 'requests') renderCommunityRequests();
}

function renderAdminUsersList() {
    const list = document.getElementById('admin-users-list');
    if (!list) return;
    list.innerHTML = '';
    let users = JSON.parse(localStorage.getItem('frh_users')) || [];
    users.forEach(u => {
        let unlocked = userUnlockedPosts[u.username] || [];
        let postChecks = resources.map(res => `<label class="text-[10px]"><input type="checkbox" ${unlocked.includes(res.id)?'checked':''} onchange="toggleAdminUserPostAccess('${u.username}', ${res.id})" class="accent-cyan-500"> ${res.name}</label>`).join('');
        list.innerHTML += `<div class="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2"><div class="flex justify-between"><b>${u.username}</b><button onclick="adminDeleteUser('${u.username}')" class="px-2 py-1 bg-rose-500 text-slate-950 rounded cursor-pointer">Hapus</button></div><div class="grid grid-cols-2 gap-1">${postChecks}</div></div>`;
    });
}

function adminDeleteUser(uname) {
    let users = JSON.parse(localStorage.getItem('frh_users')) || [];
    localStorage.setItem('frh_users', JSON.stringify(users.filter(x => x.username !== uname)));
    renderAdminUsersList();
}

function toggleAdminUserPostAccess(uname, resId) {
    if (!userUnlockedPosts[uname]) userUnlockedPosts[uname] = [];
    let idx = userUnlockedPosts[uname].indexOf(resId);
    if (idx > -1) userUnlockedPosts[uname].splice(idx, 1); else userUnlockedPosts[uname].push(resId);
    localStorage.setItem('frh_user_unlocked_posts', JSON.stringify(userUnlockedPosts));
}

function renderAdminLogsList() {
    const list = document.getElementById('admin-logs-list');
    if (!list) return;
    list.innerHTML = systemLogs.map(lg => `<div class="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px]">${lg.time} - ${lg.detail} (@${lg.user})</div>`).join('');
}

function renderAdminLiveChatUsers() {
    const list = document.getElementById('admin-chat-user-list');
    if (!list) return;
    list.innerHTML = Object.keys(liveChatConversations).map(u => `<div onclick="activeChatUser='${u}';renderAdminChatMessages();" class="p-2 bg-slate-900 rounded cursor-pointer text-xs">${u}</div>`).join('');
    renderAdminChatMessages();
}

function renderAdminChatMessages() {
    const box = document.getElementById('admin-chat-messages');
    if (!box || !activeChatUser) return;
    box.innerHTML = (liveChatConversations[activeChatUser] || []).map(m => `<div><b>${m.sender}:</b> ${m.text}</div>`).join('');
}

function handleAdminSendChat(e) {
    e.preventDefault();
    let text = document.getElementById('admin-chat-input').value;
    if (!liveChatConversations[activeChatUser]) liveChatConversations[activeChatUser] = [];
    liveChatConversations[activeChatUser].push({ sender: 'superadmin', text, time: new Date().toLocaleTimeString('id-ID') });
    localStorage.setItem('frh_livechat_conversations', JSON.stringify(liveChatConversations));
    document.getElementById('admin-chat-input').value = '';
    renderAdminChatMessages();
}

function adminEndLiveChat() { delete liveChatConversations[activeChatUser]; renderAdminLiveChatUsers(); }

function renderAdminRewardsList() {
    const list = document.getElementById('admin-rewards-list');
    if (!list) return;
    list.innerHTML = redeemRewards.map((r, i) => `<div class="bg-slate-950 p-3 rounded border text-xs flex justify-between"><span>${r.name} (${r.cost} Pts)</span><button onclick="redeemRewards.splice(${i},1);localStorage.setItem('frh_redeem_rewards',JSON.stringify(redeemRewards));renderAdminRewardsList();" class="text-rose-400">Hapus</button></div>`).join('');
}

function handleSaveReward(e) {
    e.preventDefault();
    redeemRewards.push({ id: Date.now(), name: document.getElementById('rew-name').value, cost: parseInt(document.getElementById('rew-cost').value), type: document.getElementById('rew-type').value });
    localStorage.setItem('frh_redeem_rewards', JSON.stringify(redeemRewards));
    renderAdminRewardsList();
    alert('Reward ditambah!');
}

function exportDataBackup() {
    let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ resources, users: JSON.parse(localStorage.getItem('frh_users')) || [] }, null, 2));
    let dl = document.createElement('a'); dl.setAttribute("href", dataStr); dl.setAttribute("download", "backup.json"); dl.click();
}

function handleUpdateAdminCredentials(e) {
    e.preventDefault();
    adminCreds = { user: document.getElementById('set-admin-user').value, pass: document.getElementById('set-admin-pass').value, pin: document.getElementById('set-admin-pin').value };
    localStorage.setItem('frh_admin_creds', JSON.stringify(adminCreds));
    alert('Kredensial diperbarui!');
}

function renderAdminDashboard() {
    renderAdminManageList();
    renderAdminUsersList();
    renderAdminCategoriesConfig();
}

/* ========================================================
   UPLOAD SCRIPT & FILE (Poin 1)
   ======================================================== */
function setSubmitEditMode() { activeEditModeAction = 'edit'; }
function setSubmitUpdateMode() { activeEditModeAction = 'update'; }

function handleSaveResource(e) {
    e.preventDefault();
    const editId = document.getElementById('edit-resource-id').value;
    const name = document.getElementById('up-name').value.trim();
    const category = document.getElementById('up-category').value;
    const subcategory = document.getElementById('up-subcategory').value;
    const version = document.getElementById('up-version').value.trim();
    const fileSize = document.getElementById('up-link-size').value.trim();
    const screenshot = document.getElementById('up-screenshot').value.trim();
    const description = document.getElementById('up-desc').value.trim();
    const verified = document.getElementById('up-verified').checked;
    const isSpecialAccess = document.getElementById('up-special-access').checked;

    // Poin 1: Kumpulkan Link Iklan Free
    let freeLinks = [];
    document.querySelectorAll('#free-links-container > div').forEach(row => {
        let n = row.querySelector('.free-name').value;
        let u = row.querySelector('.free-url').value;
        if (n && u) freeLinks.push({ name: n, url: u });
    });

    // Poin 1: Kumpulkan Link Tanpa Iklan VVIP
    let vvipLinks = [];
    document.querySelectorAll('#vvip-links-container > div').forEach(row => {
        let n = row.querySelector('.vvip-name').value;
        let u = row.querySelector('.vvip-url').value;
        if (n && u) vvipLinks.push({ name: n, url: u });
    });

    // Poin 1: Download Langsung File/APK
    let directName = document.getElementById('up-direct-name').value.trim();
    let directUrlFallback = document.getElementById('up-direct-url-fallback').value.trim();
    let fileInput = document.getElementById('up-direct-file');
    let directLinks = [];

    if (fileInput.files && fileInput.files[0]) {
        let reader = new FileReader();
        reader.onload = function(event) {
            let base64File = event.target.result;
            finishSavingResource(editId, name, category, subcategory, version, fileSize, screenshot, description, verified, isSpecialAccess, freeLinks, vvipLinks, [{ name: directName || fileInput.files[0].name, url: directUrlFallback || '#', fileData: base64File }]);
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        if (directName || directUrlFallback) {
            directLinks.push({ name: directName || 'Direct File VVIP', url: directUrlFallback, fileData: '' });
        }
        finishSavingResource(editId, name, category, subcategory, version, fileSize, screenshot, description, verified, isSpecialAccess, freeLinks, vvipLinks, directLinks);
    }
}

function finishSavingResource(editId, name, category, subcategory, version, fileSize, screenshot, description, verified, isSpecialAccess, freeLinks, vvipLinks, directLinks) {
    if (editId) {
        let res = resources.find(r => r.id == editId);
        if (res) {
            res.name = name; res.category = category; res.subcategory = subcategory; res.version = version; res.fileSize = fileSize; res.screenshot = screenshot; res.description = description; res.verified = verified; res.isSpecialAccess = isSpecialAccess; res.freeLinks = freeLinks; res.vvipLinks = vvipLinks; res.directLinks = directLinks;
        }
        alert('Script diperbarui!');
        resetUploadForm();
    } else {
        resources.unshift({
            id: Date.now(), name, category, subcategory, version, fileSize, screenshot, description, verified, isSpecialAccess, freeLinks, vvipLinks, directLinks,
            uploader: currentUser.username, likes: 0, views: 0, likedBy: [], savedBy: [], ratings: {}, ratedUsers: {}, reviews: [], comments: []
        });
        alert('Script dipublikasikan!');
        document.querySelector('form').reset();
    }
    localStorage.setItem('frh_resources', JSON.stringify(resources));
    renderAdminManageList();
}

function editResource(id) {
    const res = resources.find(r => r.id === id);
    if (!res) return;
    switchAdminTab('upload');
    document.getElementById('edit-resource-id').value = res.id;
    document.getElementById('up-name').value = res.name;
    document.getElementById('up-category').value = res.category;
    updateSubCategories();
    document.getElementById('up-subcategory').value = res.subcategory;
    document.getElementById('up-version').value = res.version || 'v1.0';
    document.getElementById('up-link-size').value = res.fileSize;
    document.getElementById('up-screenshot').value = res.screenshot || '';
    document.getElementById('up-desc').value = res.description;
    document.getElementById('up-verified').checked = res.verified || false;
    document.getElementById('up-special-access').checked = res.isSpecialAccess || false;

    document.getElementById('free-links-container').innerHTML = '';
    (res.freeLinks || []).forEach(l => addFreeLinkRow(l.name, l.url));
    document.getElementById('vvip-links-container').innerHTML = '';
    (res.vvipLinks || []).forEach(l => addVvipLinkRow(l.name, l.url));
    if (res.directLinks && res.directLinks.length > 0) {
        document.getElementById('up-direct-name').value = res.directLinks[0].name;
        document.getElementById('up-direct-url-fallback').value = res.directLinks[0].fileData ? '' : res.directLinks[0].url;
    }
}

function resetUploadForm() {
    document.getElementById('edit-resource-id').value = '';
    document.querySelector('form').reset();
    document.getElementById('free-links-container').innerHTML = '';
    document.getElementById('vvip-links-container').innerHTML = '';
    addFreeLinkRow(); addVvipLinkRow();
}

function deleteResource(id) {
    resources = resources.filter(r => r.id !== id);
    localStorage.setItem('frh_resources', JSON.stringify(resources));
    renderAdminManageList();
}

function renderAdminManageList() {
    const list = document.getElementById('admin-manage-list');
    if (!list) return;
    list.innerHTML = resources.map(res => `<div class="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2"><b>${res.name}</b><div class="flex justify-between"><button onclick="editResource(${res.id})" class="text-amber-400">Edit</button><button onclick="deleteResource(${res.id})" class="text-rose-400">Hapus</button></div></div>`).join('');
}

/* ========================================================
   FILTER UTAMA & USER DASHBOARD
   ======================================================== */
function filterMainCategory(cat) {
    currentMainCategory = cat;
    currentSubCategory = 'All';
    ['All', 'Script Mobile Legends', 'Script Free Fire', 'Saved'].forEach(c => {
        let btn = document.getElementById(`main-cat-btn-${c}`) || document.getElementById(`cat-btn-${c}`);
        if(btn) btn.className = c === cat ? "px-4 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 cursor-pointer" : "px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 cursor-pointer";
    });
    let subBar = document.getElementById('sub-category-bar');
    if (cat === 'Script Mobile Legends' || cat === 'Script Free Fire') { subBar.classList.remove('hidden'); renderSubCategoryButtons(cat); }
    else subBar.classList.add('hidden');
    renderResources();
}

function filterSaved() { currentMainCategory = 'Saved'; currentSubCategory = 'All'; document.getElementById('sub-category-bar').classList.add('hidden'); renderResources(); }

function renderSubCategoryButtons(mainCat) {
    const wrapper = document.getElementById('sub-category-buttons-wrapper');
    if (!wrapper) return;
    wrapper.innerHTML = `<button onclick="filterSubCategory('All')" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 cursor-pointer">Semua</button>`;
    (categoryConfig[mainCat] || []).forEach(sub => {
        wrapper.innerHTML += `<button onclick="filterSubCategory('${sub}')" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 text-slate-300 cursor-pointer">${sub}</button>`;
    });
}

function filterSubCategory(sub) { currentSubCategory = sub; renderResources(); }

function handleSearchInput() { renderResources(); }

function renderResources() {
    const grid = document.getElementById('resource-grid');
    if (!grid) return;
    const searchKeyword = document.getElementById('search-input').value.toLowerCase();
    grid.innerHTML = '';

    let filtered = resources.filter(res => {
        let matchCat = currentMainCategory === 'All' || (currentMainCategory === 'Saved' ? (res.savedBy && res.savedBy.includes(currentUser.username)) : res.category === currentMainCategory);
        if (matchCat && currentSubCategory !== 'All' && currentMainCategory !== 'Saved') matchCat = res.subcategory === currentSubCategory;
        return matchCat && (res.name.toLowerCase().includes(searchKeyword) || res.description.toLowerCase().includes(searchKeyword));
    });

    if (filtered.length === 0) { grid.innerHTML = `<div class="col-span-full py-16 text-center text-slate-500"><p>Tidak ada script.</p></div>`; return; }

    filtered.forEach(res => {
        let isLiked = res.likedBy && res.likedBy.includes(currentUser.username);
        let isSaved = res.savedBy && res.savedBy.includes(currentUser.username);
        let avgRating = calculateAverageRating(res);

        grid.innerHTML += `
            <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
                <div>
                    <div class="flex justify-between items-center mb-3">
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-400">${res.version || 'v1.0'}</span>
                        ${res.isSpecialAccess ? '<span class="text-[10px] text-amber-400 font-bold bg-amber-500/20 px-2 py-0.5 rounded"><i class="fa-solid fa-key"></i> Khusus</span>' : ''}
                    </div>
                    <h3 onclick="openDetail(${res.id})" class="font-bold text-base text-white hover:text-cyan-400 cursor-pointer line-clamp-1">${res.name}</h3>
                    <p class="text-xs text-slate-300 mt-2 line-clamp-2">${res.description}</p>
                </div>
                <div class="pt-4 mt-4 border-t border-slate-800 flex justify-between items-center text-xs">
                    <button onclick="toggleLike(${res.id})" class="${isLiked?'text-rose-500':'text-slate-300'}"><i class="fa-solid fa-heart"></i> ${res.likes || 0}</button>
                    <button onclick="openDetail(${res.id})" class="px-3 py-2 bg-cyan-500 text-slate-950 font-bold rounded-lg cursor-pointer">Detail</button>
                </div>
            </div>
        `;
    });
}

function calculateAverageRating(res) {
    if (!res.ratings || Object.keys(res.ratings).length === 0) return '0.0';
    let s = 0, v = 0;
    for (let k in res.ratings) { s += k * res.ratings[k]; v += res.ratings[k]; }
    return (s / v).toFixed(1);
}

function toggleLike(id) {
    let res = resources.find(r => r.id === id);
    if (!res.likedBy) res.likedBy = [];
    let idx = res.likedBy.indexOf(currentUser.username);
    if (idx > -1) { res.likedBy.splice(idx, 1); res.likes--; }
    else { res.likedBy.push(currentUser.username); res.likes++; addPoints(currentUser.username, 2); }
    localStorage.setItem('frh_resources', JSON.stringify(resources));
    renderResources();
}

function toggleSave(id) {
    let res = resources.find(r => r.id === id);
    if (!res.savedBy) res.savedBy = [];
    let idx = res.savedBy.indexOf(currentUser.username);
    if (idx > -1) res.savedBy.splice(idx, 1); else res.savedBy.push(currentUser.username);
    localStorage.setItem('frh_resources', JSON.stringify(resources));
    renderResources();
}

function checkUserHasCleanLinkAccess(res) {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    let isVip = userVipSubscriptions[currentUser.username] && Date.now() < userVipSubscriptions[currentUser.username];
    let unlockedArr = userUnlockedPosts[currentUser.username] || [];
    return isVip || unlockedArr.includes(res.id);
}

/* ========================================================
   DETAIL MODAL & PROTEKSI AKSES (Poin 2, 4, 5, 6, 7)
   ======================================================== */
function openDetail(id) {
    const res = resources.find(r => r.id === id);
    if (!res) return;
    activeResourceId = id;
    res.views = (res.views || 0) + 1;
    localStorage.setItem('frh_resources', JSON.stringify(resources));

    document.getElementById('detail-modal').classList.remove('hidden');
    document.getElementById('modal-title').textContent = res.name;
    document.getElementById('modal-version-badge').textContent = res.version || 'v1.0';
    document.getElementById('modal-badge').textContent = `${res.category} / ${res.subcategory}`;
    document.getElementById('modal-desc').textContent = res.description;
    document.getElementById('modal-avg-rating').innerHTML = `<i class="fa-solid fa-star"></i> ${calculateAverageRating(res)}`;

    // Poin 2: Proteksi postingan khusus
    let isLocked = res.isSpecialAccess && !checkUserHasCleanLinkAccess(res);
    if (isLocked) {
        document.getElementById('modal-locked-notice').classList.remove('hidden');
        document.getElementById('modal-unlocked-content').classList.add('hidden');
        return;
    } else {
        document.getElementById('modal-locked-notice').classList.add('hidden');
        document.getElementById('modal-unlocked-content').classList.remove('hidden');
    }

    // Poin 5: Cek apakah user sudah memberi rating
    let hasRated = res.ratedUsers && res.ratedUsers[currentUser.username];
    if (hasRated) {
        document.getElementById('rating-form-container').classList.add('hidden'); // Dihilangkan jika sudah rating agar tidak spam
    } else {
        document.getElementById('rating-form-container').classList.remove('hidden');
    }

    // Render Link Tautan Terpisah (Poin 1, 6, & 7)
    renderSeparatedDownloadLinks(res);

    // Render Ulasan & Komentar
    renderReviewsAndComments(res);
}

function renderSeparatedDownloadLinks(res) {
    let freeBox = document.getElementById('modal-free-links-list');
    let vvipBox = document.getElementById('modal-vvip-links-list');
    let directBox = document.getElementById('modal-direct-links-list');

    freeBox.innerHTML = '';
    vvipBox.innerHTML = '';
    directBox.innerHTML = '';

    // 1. Link Iklan Free
    if (res.freeLinks && res.freeLinks.length > 0) {
        res.freeLinks.forEach(l => {
            freeBox.innerHTML += `
                <div class="space-y-1">
                    <a href="${l.url}" target="_blank" onclick="recordDownload(event, '${l.name}')" class="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md">
                        <i class="fa-solid fa-cloud-arrow-down"></i> ${l.name} (Free)
                    </a>
                    <div class="flex gap-2">
                        <button onclick="navigator.clipboard.writeText('${l.url}'); alert('Tautan disalin!');" class="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[10px] font-semibold rounded-lg cursor-pointer"><i class="fa-solid fa-copy"></i> Salin Link</button>
                        <button onclick="reportBrokenLinkCustom('${l.name}')" class="flex-1 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-semibold rounded-lg cursor-pointer"><i class="fa-solid fa-triangle-exclamation"></i> Lapor Rusak</button>
                    </div>
                </div>
            `;
        });
    } else {
        freeBox.innerHTML = `<p class="text-[11px] text-slate-500">Tidak ada link free.</p>`;
    }

    // 2. Link Tanpa Iklan VVIP
    let hasVipAccess = checkUserHasCleanLinkAccess(res);
    if (res.vvipLinks && res.vvipLinks.length > 0) {
        res.vvipLinks.forEach(l => {
            if (hasVipAccess) {
                vvipBox.innerHTML += `
                    <div class="space-y-1">
                        <a href="${l.url}" target="_blank" onclick="recordDownload(event, '${l.name}')" class="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md">
                            <i class="fa-solid fa-shield-halved"></i> ${l.name} (VVIP)
                        </a>
                        <div class="flex gap-2">
                            <button onclick="navigator.clipboard.writeText('${l.url}'); alert('Tautan disalin!');" class="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 text-[10px] font-semibold rounded-lg cursor-pointer"><i class="fa-solid fa-copy"></i> Salin Link</button>
                            <button onclick="reportBrokenLinkCustom('${l.name}')" class="flex-1 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-semibold rounded-lg cursor-pointer"><i class="fa-solid fa-triangle-exclamation"></i> Lapor Rusak</button>
                        </div>
                    </div>
                `;
            } else {
                vvipBox.innerHTML += `
                    <button onclick="alert('Memerlukan VVIP aktif!'); switchMainView('profile'); closeModal();" class="w-full py-3 bg-slate-800 text-slate-400 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer">
                        <i class="fa-solid fa-lock text-amber-400"></i> ${l.name} [VVIP Diperlukan]
                    </button>
                `;
            }
        });
    } else {
        vvipBox.innerHTML = `<p class="text-[11px] text-slate-500">Tidak ada link VVIP.</p>`;
    }

    // 3. Download Langsung dari Website
    if (res.directLinks && res.directLinks.length > 0) {
        res.directLinks.forEach(l => {
            if (hasVipAccess) {
                let downloadAction = l.fileData ? `href="${l.fileData}" download="${l.name}"` : `href="${l.url}" target="_blank"`;
                directBox.innerHTML += `
                    <div class="space-y-1">
                        <a ${downloadAction} class="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md">
                            <i class="fa-solid fa-download"></i> ${l.name} (Direct Server)
                        </a>
                        <div class="flex gap-2">
                            <button onclick="navigator.clipboard.writeText('${l.fileData || l.url}'); alert('Tautan disalin!');" class="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-[10px] font-semibold rounded-lg cursor-pointer"><i class="fa-solid fa-copy"></i> Salin Link</button>
                            <button onclick="reportBrokenLinkCustom('${l.name}')" class="flex-1 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-semibold rounded-lg cursor-pointer"><i class="fa-solid fa-triangle-exclamation"></i> Lapor Rusak</button>
                        </div>
                    </div>
                `;
            } else {
                directBox.innerHTML += `
                    <button onclick="alert('Memerlukan VVIP aktif!'); switchMainView('profile'); closeModal();" class="w-full py-3 bg-slate-800 text-slate-400 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer">
                        <i class="fa-solid fa-lock text-amber-400"></i> ${l.name} [VVIP Diperlukan]
                    </button>
                `;
            }
        });
    } else {
        directBox.innerHTML = `<p class="text-[11px] text-slate-500">Tidak ada direct server.</p>`;
    }
}

function reportBrokenLinkCustom(linkName) {
    let res = resources.find(r => r.id === activeResourceId);
    brokenReports.push({ resName: `${res.name} (${linkName})`, user: currentUser.username });
    localStorage.setItem('frh_broken_reports', JSON.stringify(brokenReports));
    alert('Laporan link rusak dikirim ke admin (+5 Poin).');
    addPoints(currentUser.username, 5);
}

function renderReviewsAndComments(res) {
    document.getElementById('review-count').textContent = (res.reviews || []).length;
    document.getElementById('review-list').innerHTML = (res.reviews || []).map(rv => `<div class="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs"><b>${rv.user}</b>: ${rv.text}</div>`).join('');
    document.getElementById('comment-count').textContent = (res.comments || []).length;
    document.getElementById('comment-list').innerHTML = (res.comments || []).map(c => `<div class="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs"><b>${c.user}</b>: ${c.text}</div>`).join('');
}

// Poin 4: Mode baca menyatukan komparasi & detail
function openReaderMode() {
    const res = resources.find(r => r.id === activeResourceId);
    if (!res) return;
    document.getElementById('reader-content').textContent = `=== MODE BACA & KOMPARASI VERSI ===\nJudul: ${res.name}\nVersi: ${res.version || 'v1.0'}\n\n${res.description}`;
    document.getElementById('reader-mode-modal').classList.remove('hidden');
}

function closeReaderMode() { document.getElementById('reader-mode-modal').classList.add('hidden'); }
function closeModal() { document.getElementById('detail-modal').classList.add('hidden'); activeResourceId = null; }

function selectRatingStar(star) { currentSelectedStar = star; document.getElementById('rating-selected-text').textContent = `${star} Bintang Dipilih`; }

function handlePostRatingAndReview(e) {
    e.preventDefault();
    let res = resources.find(r => r.id === activeResourceId);
    if (!res.ratings) res.ratings = {};
    if (!res.ratedUsers) res.ratedUsers = {};
    if (!res.reviews) res.reviews = [];

    if (res.ratedUsers[currentUser.username]) { alert('Anda sudah memberi rating.'); return; }

    let text = document.getElementById('review-input').value.trim();
    res.ratedUsers[currentUser.username] = currentSelectedStar;
    res.ratings[currentSelectedStar] = (res.ratings[currentSelectedStar] || 0) + 1;
    res.reviews.unshift({ user: currentUser.username, rating: currentSelectedStar, text: text });

    addPoints(currentUser.username, 10);
    addExpAndLevelProgress(currentUser.username, 10);
    localStorage.setItem('frh_resources', JSON.stringify(resources));

    alert('Rating & ulasan dikirim (+10 Poin).');
    document.getElementById('review-input').value = '';
    openDetail(activeResourceId);
}

function recordDownload(e, name) {
    if (!currentUser) { e.preventDefault(); alert('Login dulu.'); return; }
    addPoints(currentUser.username, 5);
}

function handlePostComment(e) {
    e.preventDefault();
    let res = resources.find(r => r.id === activeResourceId);
    let text = document.getElementById('comment-input').value.trim();
    if (!res.comments) res.comments = [];
    res.comments.push({ user: currentUser.username, text: text });
    localStorage.setItem('frh_resources', JSON.stringify(resources));
    document.getElementById('comment-input').value = '';
    openDetail(activeResourceId);
}

function togglePasswordForm() { document.getElementById('profile-password-box').classList.toggle('hidden'); }
function handleChangeUserPassword(e) { e.preventDefault(); alert('Password diubah!'); togglePasswordForm(); }

/* ========================================================
   POIN 3: QUEST DIPERBANYAK MENJADI 20 QUEST
   ======================================================== */
const profileQuestsDefinition = [
    { id: 'q1', title: 'Sukai 1 Script', reward: 10, target: 1, type: 'like' },
    { id: 'q2', title: 'Sukai 3 Script', reward: 25, target: 3, type: 'like' },
    { id: 'q3', title: 'Sukai 5 Script', reward: 40, target: 5, type: 'like' },
    { id: 'q4', title: 'Sukai 10 Script', reward: 75, target: 10, type: 'like' },
    { id: 'q5', title: 'Sukai 20 Script', reward: 150, target: 20, type: 'like' },
    { id: 'q6', title: 'Rating Bintang 5 untuk 1 Script', reward: 15, target: 1, type: 'rate5' },
    { id: 'q7', title: 'Rating Bintang 5 untuk 3 Script', reward: 35, target: 3, type: 'rate5' },
    { id: 'q8', title: 'Rating Bintang 5 untuk 5 Script', reward: 60, target: 5, type: 'rate5' },
    { id: 'q9', title: 'Rating Bintang 5 untuk 10 Script', reward: 120, target: 10, type: 'rate5' },
    { id: 'q10', title: 'Rating Bintang 5 untuk 25 Script', reward: 250, target: 25, type: 'rate5' },
    { id: 'q11', title: 'Kirim 1 Komentar', reward: 10, target: 1, type: 'comment' },
    { id: 'q12', title: 'Kirim 5 Komentar', reward: 30, target: 5, type: 'comment' },
    { id: 'q13', title: 'Kirim 10 Komentar', reward: 60, target: 10, type: 'comment' },
    { id: 'q14', title: 'Kirim 25 Komentar', reward: 130, target: 25, type: 'comment' },
    { id: 'q15', title: 'Kirim 50 Komentar', reward: 250, target: 50, type: 'comment' },
    { id: 'q16', title: 'Lihat 5 Script Berbeda', reward: 15, target: 5, type: 'view' },
    { id: 'q17', title: 'Lihat 15 Script Berbeda', reward: 40, target: 15, type: 'view' },
    { id: 'q18', title: 'Lihat 30 Script Berbeda', reward: 80, target: 30, type: 'view' },
    { id: 'q19', title: 'Lihat 50 Script Berbeda', reward: 150, target: 50, type: 'view' },
    { id: 'q20', title: 'Lihat 100 Script Berbeda', reward: 300, target: 100, type: 'view' }
];

function checkQuestRealProgress(type) {
    let uname = currentUser.username;
    if (type === 'like') {
        let count = 0; resources.forEach(r => { if (r.likedBy && r.likedBy.includes(uname)) count++; }); return count;
    }
    if (type === 'rate5') {
        let count = 0; resources.forEach(r => { if (r.ratedUsers && r.ratedUsers[uname] === 5) count++; }); return count;
    }
    if (type === 'comment') {
        let count = 0; resources.forEach(r => { if (r.comments) r.comments.forEach(c => { if (c.user === uname) count++; }); }); return count;
    }
    if (type === 'view') {
        let myViews = userViewHistory[uname] || [];
        return myViews.length;
    }
    return 0;
}

function claimProfileQuest(questId, target, type, reward) {
    let uname = currentUser.username;
    if (!userQuestClaims[uname]) userQuestClaims[uname] = {};
    if (userQuestClaims[uname][questId]) { alert('Quest sudah diklaim.'); return; }

    let prog = checkQuestRealProgress(type);
    if (prog >= target) {
        userQuestClaims[uname][questId] = true;
        localStorage.setItem('frh_user_quest_claims', JSON.stringify(userQuestClaims));
        addPoints(uname, reward);
        addExpAndLevelProgress(uname, 25);
        alert(`Quest selesai! +${reward} Poin & EXP.`);
        renderProfilePage();
    } else {
        alert(`Belum cukup (Progress: ${prog}/${target}).`);
    }
}

function renderProfilePage() {
    let uname = currentUser.username;
    document.getElementById('profile-username').textContent = uname;
    document.getElementById('profile-badge-label').textContent = getUserBadge(uname);
    document.getElementById('profile-points-label').textContent = `Poin: ${userPoints[uname] || 0} Pts`;
    
    if (!userLevels[uname]) userLevels[uname] = { level: 1, exp: 0 };
    let uLvl = userLevels[uname];
    document.getElementById('profile-level-label').textContent = `Level: ${uLvl.level} (EXP: ${uLvl.exp}/${uLvl.level*50})`;

    let isVip = userVipSubscriptions[uname] && Date.now() < userVipSubscriptions[uname];
    document.getElementById('profile-vip-status').innerHTML = isVip ? `<span class="text-amber-400">VVIP Aktif</span>` : `<span>Member Free</span>`;

    const questList = document.getElementById('profile-quests-list');
    if (questList) {
        questList.innerHTML = '';
        if (!userQuestClaims[uname]) userQuestClaims[uname] = {};
        profileQuestsDefinition.forEach(q => {
            let isClaimed = userQuestClaims[uname][q.id] || false;
            let prog = checkQuestRealProgress(q.type);
            let canClaim = prog >= q.target && !isClaimed;

            let btnHtml = isClaimed ? `<span class="text-emerald-400 text-[10px]">Selesai</span>` : (canClaim ? `<button onclick="claimProfileQuest('${q.id}', ${q.target}, '${q.type}', ${q.reward})" class="px-2.5 py-1 bg-emerald-500 text-slate-950 font-bold rounded cursor-pointer">Klaim (+${q.reward})</button>` : `<span class="text-slate-500 text-[10px]">${prog}/${q.target}</span>`);

            questList.innerHTML += `<div class="bg-slate-950 border border-slate-800 p-3 rounded-xl flex justify-between items-center text-xs"><div><b>${q.title}</b><span class="text-amber-400 block text-[10px]">+${q.reward} Poin</span></div><div>${btnHtml}</div></div>`;
        });
    }

    const redeemBox = document.getElementById('user-redeem-rewards-list');
    redeemBox.innerHTML = redeemRewards.map(r => `<div class="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2"><b>${r.name}</b><span class="text-amber-400 block">${r.cost} Poin</span><button onclick="executeRedeem(${r.id})" class="w-full py-2 bg-cyan-500 text-slate-950 font-bold rounded cursor-pointer">Tukar</button></div>`).join('');
}

function executeRedeem(id) {
    let r = redeemRewards.find(x => x.id === id);
    let uname = currentUser.username;
    if ((userPoints[uname] || 0) < r.cost) { alert('Poin kurang!'); return; }
    userPoints[uname] -= r.cost;
    localStorage.setItem('frh_user_points', JSON.stringify(userPoints));
    if (r.type === 'vip') {
        userVipSubscriptions[uname] = Date.now() + (30*24*60*60*1000);
        localStorage.setItem('frh_user_vip_subs', JSON.stringify(userVipSubscriptions));
    }
    alert('Redeem sukses!');
    renderProfilePage();
}
