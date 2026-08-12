let currentUser = JSON.parse(localStorage.getItem('frh_current_user')) || null;
let adminCreds = JSON.parse(localStorage.getItem('frh_admin_creds')) || { user: 'superadmin', pass: 'securepass99', pin: '8888' };
let adminFailedAttempts = parseInt(localStorage.getItem('frh_admin_fails')) || 0;
let adminLockUntil = parseInt(localStorage.getItem('frh_admin_lock')) || 0;

let telegramConfig = JSON.parse(localStorage.getItem('frh_telegram_config')) || { token: '', chatId: '' };
let currentBroadcast = JSON.parse(localStorage.getItem('frh_broadcast')) || { title: "PENGUMUMAN PENTING", content: "Selamat datang di RapzResource HUB v15. Fokus Script Mobile Legends dan Free Fire dengan sub-kategori lengkap!" };

// STRUKTUR KATEGORI & SUB-KATEGORI (Bisa ditambah manual oleh Admin)
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
        typeUpload: "file",
        version: "v1.0",
        links: [
            { name: "Link Iklan (Free)", url: "https://safelink-sample.com/ml1" },
            { name: "Link Tanpa Iklan (VVIP)", url: "https://drive.google.com/ml1-clean" },
            { name: "Direct File (VVIP)", url: "https://direct-download.com/ml1" }
        ],
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
        ratings: { 5: 5, 4: 1 },
        ratedUsers: {},
        reviews: [{ user: "Budi", rating: 5, text: "Mantap work tanpa lag di ranked!" }],
        comments: [{ user: "Budi", text: "Aman gais ga ada banned." }],
        editStatus: null
    }
];

let announcements = JSON.parse(localStorage.getItem('frh_announcements')) || [
    { id: 1, title: "Pembaruan RapzResource HUB v15", content: "Fokus penuh pada Script Mobile Legends dan Free Fire, sub-kategori kustom, serta upload link manual dinamis.", date: "12 Agustus 2026" }
];

let communityRequests = JSON.parse(localStorage.getItem('frh_community_requests')) || [];

let liveChatConversations = JSON.parse(localStorage.getItem('frh_livechat_conversations')) || {
    "Budi": [
        { sender: "Budi", text: "Halo admin, mau tanya cara pasang script FF skin gimana?", time: "10:00" },
        { sender: "superadmin", text: "Halo Budi, silakan cek petunjuk di deskripsi ya.", time: "10:05" }
    ]
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
    addCustomLinkRow(); 

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
   MANAJEMEN KATEGORI & SUB-KATEGORI MANUAL
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
    if (!val) {
        alert('Nama sub-kategori tidak boleh kosong!');
        return;
    }
    if (!categoryConfig[mainCat]) categoryConfig[mainCat] = [];
    if (categoryConfig[mainCat].includes(val)) {
        alert('Sub-kategori sudah ada!');
        return;
    }
    categoryConfig[mainCat].push(val);
    localStorage.setItem('frh_category_config', JSON.stringify(categoryConfig));
    document.getElementById(inputId).value = '';
    renderAdminCategoriesConfig();
    updateSubCategories();
    alert('Sub-kategori berhasil ditambahkan!');
}

function removeSubCategory(mainCat, idx) {
    if (confirm('Hapus sub-kategori ini?')) {
        categoryConfig[mainCat].splice(idx, 1);
        localStorage.setItem('frh_category_config', JSON.stringify(categoryConfig));
        renderAdminCategoriesConfig();
        updateSubCategories();
        alert('Sub-kategori dihapus.');
    }
}

/* ========================================================
   MANAJEMEN LINK DINAMIS MANUAL (Mendukung Multi VVIP Direct Upload via Admin)
   ======================================================== */
function addCustomLinkRow(nameVal = '', urlVal = '') {
    const container = document.getElementById('dynamic-links-container');
    if (!container) return;
    const rowId = Date.now() + Math.random();

    let div = document.createElement('div');
    div.className = "flex flex-col sm:flex-row items-center gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800";
    div.id = `link-row-${rowId}`;
    div.innerHTML = `
        <select class="bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-xs focus:outline-none focus:border-cyan-500 link-name-input text-cyan-400 font-bold" required>
            <option value="Link Iklan (Free)" ${nameVal === 'Link Iklan (Free)' ? 'selected' : ''}>Link Iklan (Free)</option>
            <option value="Link Tanpa Iklan (VVIP)" ${nameVal === 'Link Tanpa Iklan (VVIP)' ? 'selected' : ''}>Link Tanpa Iklan (VVIP)</option>
            <option value="Direct File (VVIP)" ${nameVal === 'Direct File (VVIP)' ? 'selected' : ''}>Direct File (VVIP)</option>
        </select>
        <input type="url" placeholder="https://..." value="${urlVal}" class="flex-1 w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 link-url-input" required>
        <input type="file" onchange="handleAdminDirectFileUpload(this, '${rowId}')" class="text-[10px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-cyan-500 file:text-slate-950 hover:file:bg-cyan-400 cursor-pointer" title="Upload File Langsung ke Web">
        <button type="button" onclick="document.getElementById('link-row-${rowId}').remove()" class="px-2.5 py-2 bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-slate-950 rounded-lg transition-all text-xs cursor-pointer"><i class="fa-solid fa-trash"></i></button>
    `;
    container.appendChild(div);
}

function handleAdminDirectFileUpload(fileInput, rowId) {
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const row = document.getElementById(`link-row-${rowId}`);
        if (row) {
            const urlInput = row.querySelector('.link-url-input');
            if (urlInput) {
                urlInput.value = e.target.result; // Menyimpan Base64 file langsung ke URL input manual
                alert(`File "${file.name}" berhasil diunggah secara lokal ke sistem!`);
            }
        }
    };
    reader.readAsDataURL(file);
}

/* ========================================================
   WAKTU VVIP & BAN
   ======================================================== */
function checkVipExpiration() {
    let now = Date.now();
    let updated = false;
    for (let uname in userVipSubscriptions) {
        let expireTime = userVipSubscriptions[uname];
        if (typeof expireTime === 'number' && now > expireTime) {
            delete userVipSubscriptions[uname];
            updated = true;
            addNotification(`Masa aktif VVIP 1 bulan Anda telah otomatis berakhir.`, 'danger');
            recordSystemLog('redeem_point', `Masa aktif VVIP 1 bulan untuk akun @${uname} telah otomatis berakhir.`, uname);
        }
    }
    if (updated) {
        localStorage.setItem('frh_user_vip_subs', JSON.stringify(userVipSubscriptions));
    }
}

function checkBanExpiration() {
    let now = Date.now();
    let updated = false;
    for (let uname in userBans) {
        let banUntil = userBans[uname];
        if (banUntil !== 'permanent' && now > banUntil) {
            delete userBans[uname];
            updated = true;
        }
    }
    if (updated) {
        localStorage.setItem('frh_user_bans', JSON.stringify(userBans));
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

function sendTelegramNotification(text) {
    if (!telegramConfig.token || !telegramConfig.chatId) return;
    let url = `https://api.telegram.org/bot${telegramConfig.token}/sendMessage`;
    let data = {
        chat_id: telegramConfig.chatId,
        text: `🤖 [RapzResource HUB v15]\n${text}`,
        parse_mode: 'HTML'
    };
    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).catch(err => console.error('Telegram API Error:', err));
}

function handleSaveTelegramConfig(e) {
    e.preventDefault();
    telegramConfig.token = document.getElementById('tg-token').value.trim();
    telegramConfig.chatId = document.getElementById('tg-chatid').value.trim();
    localStorage.setItem('frh_telegram_config', JSON.stringify(telegramConfig));
    alert('Konfigurasi Bot Telegram berhasil disimpan!');
    sendTelegramNotification('✅ Bot Telegram berhasil dihubungkan ke pusat logs dan livechat.');
}

function handleSaveBroadcast(e) {
    e.preventDefault();
    const title = document.getElementById('bc-title').value.trim();
    const content = document.getElementById('bc-content').value.trim();
    currentBroadcast = { title, content };
    localStorage.setItem('frh_broadcast', JSON.stringify(currentBroadcast));
    alert('Broadcast berhasil disimpan dan aktif di dashboard user!');
    renderBroadcastBanner();
}

function renderBroadcastBanner() {
    const bannerBox = document.getElementById('broadcast-banner-container');
    if (!bannerBox) return;
    if (!currentBroadcast || !currentBroadcast.content) {
        bannerBox.innerHTML = '';
        return;
    }
    bannerBox.innerHTML = `
        <div class="bg-slate-900 border border-cyan-500/40 rounded-2xl p-4 shadow-lg space-y-2">
            <div class="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <i class="fa-solid fa-bullhorn animate-pulse"></i> ${currentBroadcast.title}
            </div>
            <div class="overflow-hidden relative bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div class="animate-marquee text-xs text-slate-200 font-semibold">
                    ${currentBroadcast.content}
                </div>
            </div>
        </div>
    `;
}

function resetAllLogs() {
    if (confirm('Apakah Anda yakin ingin MENGHAPUS SEMUA (Reset All Logs) pusat sistem logs?')) {
        systemLogs = [];
        localStorage.setItem('frh_system_logs', JSON.stringify(systemLogs));
        renderAdminLogsList();
        alert('Semua pusat logs berhasil direset.');
    }
}

function recordSystemLog(logType, detailText, uname = null) {
    const logItem = {
        id: Date.now(),
        user: uname || (currentUser ? currentUser.username : 'Guest'),
        type: logType, 
        detail: detailText,
        time: new Date().toLocaleString('id-ID')
    };
    systemLogs.unshift(logItem);
    if (systemLogs.length > 200) systemLogs.pop();
    localStorage.setItem('frh_system_logs', JSON.stringify(systemLogs));

    sendTelegramNotification(`<b>[LOGS: ${logType.toUpperCase()}]</b>\nDetail: ${detailText}\nUser: @${logItem.user}\nWaktu: ${logItem.time}`);
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

function addPoints(username, amount) {
    if (!userPoints[username]) userPoints[username] = 0;
    userPoints[username] += amount;
    localStorage.setItem('frh_user_points', JSON.stringify(userPoints));
}

function addExpAndLevelProgress(username, amount = null) {
    if (!username) return;
    if (!userLevels[username]) userLevels[username] = { level: 1, exp: 0 };
    let uData = userLevels[username];

    let expGain = amount !== null ? amount : (Math.random() < 0.7 ? 1 : 2);
    uData.exp += expGain;

    let targetExp = getTargetExpForLevel(uData.level);
    while (uData.exp >= targetExp && uData.level < 100) {
        uData.exp -= targetExp;
        uData.level++;
        targetExp = getTargetExpForLevel(uData.level);
        addNotification(`Selamat! Akun Anda naik ke Level ${uData.level}!`, 'admin');
        recordSystemLog('naik_level', `User @${username} naik level ke Level ${uData.level}.`, username);
    }

    if (uData.level >= 100) {
        uData.level = 100;
        uData.exp = 0;
    }

    localStorage.setItem('frh_user_levels', JSON.stringify(userLevels));
}

function getTargetExpForLevel(lvl) {
    return lvl * 50;
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
        document.getElementById('tab-login').className = "flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all text-slate-400 cursor-pointer";
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
        
        if (userBans[uVal]) {
            let banUntil = userBans[uVal];
            if (banUntil === 'permanent' || Date.now() < banUntil) {
                alert('Akun Anda sedang diblokir oleh Administrator.');
                return;
            }
        }

        if (!validUser && uVal !== 'user') {
            alert('Username atau Password salah!');
            return;
        }
        currentUser = { username: uVal, role: 'user' };
        logUserAction(uVal, 'Masuk ke sistem');
        recordSystemLog('akun_login', `User @${uVal} berhasil masuk ke akun.`, uVal);
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
    recordSystemLog('daftar_baru', `Akun baru terdaftar dengan username @${username}.`, username);
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
            renderResources();
        }
    }
}

function getUserBadge(username) {
    let pts = userPoints[username] || 0;
    let uLvl = userLevels[username] ? userLevels[username].level : 1;

    if (pts >= 1000 && uLvl >= 70) return 'Grandmaster Elite 👑🔥';
    if (pts >= 700 && uLvl >= 50) return 'Legendary Contributor ⚡';
    if (pts >= 400 && uLvl >= 30) return 'Master Contributor 🏆';
    if (pts >= 200 && uLvl >= 15) return 'Senior Contributor 🌟';
    if (pts >= 100 && uLvl >= 8) return 'Active Contributor ✨';
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

/* ========================================================
   SUPPORT CHAT & LIVE CHAT
   ======================================================== */
function toggleSupportChatModal() {
    const modal = document.getElementById('support-chat-modal');
    if (modal) modal.classList.toggle('hidden');
}

function selectSupportCategory(cat) {
    toggleSupportChatModal();
    if (cat === 'Bantuan') {
        switchMainView('livechat');
        let introText = `[Sistem Bantuan]: Halo admin, saya butuh bantuan/kendala terkait akun atau transaksi.`;
        if (currentUser) {
            if (!liveChatConversations[currentUser.username]) liveChatConversations[currentUser.username] = [];
            liveChatConversations[currentUser.username].push({ sender: currentUser.username, text: introText, time: new Date().toLocaleTimeString('id-ID') });
            localStorage.setItem('frh_livechat_conversations', JSON.stringify(liveChatConversations));
            renderUserLiveChatMessages();
            sendTelegramNotification(`<b>[SUPPORT CHAT: BANTUAN]</b>\nUser: @${currentUser.username}\nPesan: ${introText}`);
        }
    } else if (cat === 'Request') {
        switchMainView('requests');
        openRequestModal();
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
    alert('Request script berhasil diajukan ke admin!');
    sendTelegramNotification(`<b>[NEW REQUEST SCRIPT]</b>\nUser: @${currentUser.username}\nJudul: ${title}\nDesc: ${desc}`);
}

function renderCommunityRequests() {
    const list = document.getElementById('user-requests-list');
    if (!list) return;
    list.innerHTML = '';
    
    let reports = brokenReports;
    if (reports.length === 0) {
        list.innerHTML = `<p class="text-xs text-slate-500">Belum ada laporan link rusak.</p>`;
        return;
    }
    reports.forEach((rep, idx) => {
        list.innerHTML += `
            <div class="bg-slate-950 p-4 rounded-xl border border-rose-500/30 flex justify-between items-center text-xs">
                <div>
                    <span class="font-bold text-rose-400 text-sm block">Script: ${rep.resName}</span>
                    <span class="text-[10px] text-slate-400 mt-1 inline-block">Dilaporkan oleh user: @${rep.user}</span>
                </div>
                ${currentUser.role === 'admin' ? `<button onclick="resolveBrokenReport(${idx})" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg cursor-pointer">Selesaikan / Hapus Laporan</button>` : ''}
            </div>
        `;
    });
}

function resolveBrokenReport(idx) {
    brokenReports.splice(idx, 1);
    localStorage.setItem('frh_broken_reports', JSON.stringify(brokenReports));
    renderCommunityRequests();
    alert('Laporan link rusak diselesaikan.');
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
    ['upload', 'manage', 'categories', 'users', 'broadcast', 'telegram', 'logs', 'livechat', 'rewards', 'requests', 'analytics', 'backup', 'settings'].forEach(t => {
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
    if (type === 'categories') renderAdminCategoriesConfig();
    if (type === 'users') renderAdminUsersList();
    if (type === 'broadcast') {
        document.getElementById('bc-title').value = currentBroadcast.title || '';
        document.getElementById('bc-content').value = currentBroadcast.content || '';
    }
    if (type === 'telegram') {
        document.getElementById('tg-token').value = telegramConfig.token || '';
        document.getElementById('tg-chatid').value = telegramConfig.chatId || '';
    }
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
    users.forEach((u) => {
        let isVip = userVipSubscriptions[u.username] && Date.now() < userVipSubscriptions[u.username];
        let unlockedArr = userUnlockedPosts[u.username] || [];
        let uPts = userPoints[u.username] || 0;
        let isBanned = userBans[u.username];

        let postCheckboxes = resources.map(res => {
            let isUnlocked = unlockedArr.includes(res.id);
            return `<label class="flex items-center gap-1.5 text-[10px] text-slate-300"><input type="checkbox" ${isUnlocked ? 'checked' : ''} onchange="toggleAdminUserPostAccess('${u.username}', ${res.id})" class="accent-cyan-500"> ${res.name}</label>`;
        }).join('');

        list.innerHTML += `
            <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                        <span class="font-bold text-white text-sm block">${u.username} ${isBanned ? '<span class="text-rose-500 font-bold">(Diblokir)</span>' : ''}</span>
                        <span class="text-[10px] text-slate-400">Poin: <span class="text-amber-400 font-bold">${uPts} Pts</span> | VVIP: <span class="${isVip ? 'text-amber-400 font-bold' : 'text-slate-400'}">${isVip ? 'Aktif' : 'Non-VVIP'}</span></span>
                    </div>
                    <div class="flex flex-wrap gap-2 items-center">
                        <button onclick="adminAddPoints('${u.username}')" class="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 font-bold rounded cursor-pointer">+ Poin</button>
                        <button onclick="adminSubPoints('${u.username}')" class="px-2.5 py-1 bg-rose-500/20 text-rose-400 font-bold rounded cursor-pointer">- Poin</button>
                        <button onclick="toggleVipSubscription('${u.username}')" class="px-2.5 py-1 ${isVip ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-amber-400'} font-bold rounded cursor-pointer">${isVip ? 'Cabut VVIP' : 'Beri VVIP'}</button>
                        <button onclick="adminResetUser('${u.username}')" class="px-2.5 py-1 bg-cyan-500/20 text-cyan-400 font-bold rounded cursor-pointer">Reset</button>
                        <button onclick="adminDeleteUser('${u.username}')" class="px-2.5 py-1 bg-rose-500 text-slate-950 font-bold rounded cursor-pointer">Hapus</button>
                    </div>
                </div>
                <div class="flex flex-wrap gap-2 items-center pt-2 border-t border-slate-900">
                    <span class="text-[10px] font-bold text-slate-400">Blokir:</span>
                    <button onclick="adminBanUser('${u.username}', 7)" class="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] cursor-pointer">7 Hari</button>
                    <button onclick="adminBanUser('${u.username}', 12)" class="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] cursor-pointer">12 Hari</button>
                    <button onclick="adminBanUser('${u.username}', 120)" class="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] cursor-pointer">120 Hari</button>
                    <button onclick="adminBanUser('${u.username}', 9999)" class="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] cursor-pointer">9999 Hari</button>
                    <button onclick="adminBanUser('${u.username}', 'permanent')" class="px-2 py-0.5 bg-rose-500/20 text-rose-400 rounded text-[10px] cursor-pointer">Permanen</button>
                    <button onclick="adminUnbanUser('${u.username}')" class="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[10px] cursor-pointer">Buka Blokir</button>
                </div>
                <div class="border-t border-slate-900 pt-2">
                    <span class="text-[11px] font-semibold text-cyan-400 block mb-1">Akses Postingan Khusus:</span>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">${postCheckboxes || '<span class="text-slate-500 text-[10px]">Belum ada post</span>'}</div>
                </div>
            </div>
        `;
    });
}

function adminAddPoints(uname) {
    let amt = prompt(`Masukkan jumlah poin yang ingin ditambahkan untuk @${uname}:`, "10");
    if (amt && !isNaN(amt)) {
        addPoints(uname, parseInt(amt));
        renderAdminUsersList();
        alert(`Berhasil menambahkan ${amt} poin ke @${uname}`);
    }
}

function adminSubPoints(uname) {
    let amt = prompt(`Masukkan jumlah poin yang ingin dikurangi untuk @${uname}:`, "10");
    if (amt && !isNaN(amt)) {
        userPoints[uname] = Math.max(0, (userPoints[uname] || 0) - parseInt(amt));
        localStorage.setItem('frh_user_points', JSON.stringify(userPoints));
        renderAdminUsersList();
        alert(`Berhasil mengurangi ${amt} poin dari @${uname}`);
    }
}

function adminResetUser(uname) {
    if (confirm(`Apakah Anda yakin ingin mereset data akun @${uname}?`)) {
        userPoints[uname] = 0;
        delete userVipSubscriptions[uname];
        delete userUnlockedPosts[uname];
        delete userBans[uname];
        localStorage.setItem('frh_user_points', JSON.stringify(userPoints));
        localStorage.setItem('frh_user_vip_subs', JSON.stringify(userVipSubscriptions));
        localStorage.setItem('frh_user_unlocked_posts', JSON.stringify(userUnlockedPosts));
        renderAdminUsersList();
        alert(`Akun @${uname} berhasil direset.`);
    }
}

function adminDeleteUser(uname) {
    if (confirm(`HAPUS AKUN @${uname} secara permanen dari sistem?`)) {
        let users = JSON.parse(localStorage.getItem('frh_users')) || [];
        users = users.filter(u => u.username !== uname);
        localStorage.setItem('frh_users', JSON.stringify(users));
        delete userPoints[uname];
        delete userVipSubscriptions[uname];
        delete userUnlockedPosts[uname];
        renderAdminUsersList();
        alert(`Akun @${uname} berhasil dihapus.`);
    }
}

function adminBanUser(uname, durationDays) {
    if (durationDays === 'permanent') {
        userBans[uname] = 'permanent';
    } else {
        userBans[uname] = Date.now() + (durationDays * 24 * 60 * 60 * 1000);
    }
    localStorage.setItem('frh_user_bans', JSON.stringify(userBans));
    renderAdminUsersList();
    alert(`Akun @${uname} berhasil diblokir.`);
}

function adminUnbanUser(uname) {
    delete userBans[uname];
    localStorage.setItem('frh_user_bans', JSON.stringify(userBans));
    renderAdminUsersList();
    alert(`Blokir untuk akun @${uname} dibuka.`);
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
    alert(`Akses postingan untuk @${username} diperbarui.`);
}

function toggleVipSubscription(username) {
    let isVipActive = userVipSubscriptions[username] && Date.now() < userVipSubscriptions[username];
    if (isVipActive) {
        delete userVipSubscriptions[username];
    } else {
        userVipSubscriptions[username] = Date.now() + (30 * 24 * 60 * 60 * 1000);
    }
    localStorage.setItem('frh_user_vip_subs', JSON.stringify(userVipSubscriptions));
    renderAdminUsersList();
    alert(`Status VVIP untuk @${username} berhasil diperbarui.`);
}

function filterLogsCategory(cat) {
    currentLogFilter = cat;
    ['all', 'naik_level', 'redeem_point', 'selesai_quest'].forEach(c => {
        const btn = document.getElementById(`log-btn-${c}`);
        if(btn) {
            btn.className = c === cat 
                ? "px-3 py-1 bg-cyan-500 text-slate-950 font-bold rounded-lg cursor-pointer"
                : "px-3 py-1 bg-slate-800 text-slate-300 rounded-lg cursor-pointer";
        }
    });
    renderAdminLogsList();
}

function renderAdminLogsList() {
    const list = document.getElementById('admin-logs-list');
    if (!list) return;
    list.innerHTML = '';

    let filtered = systemLogs.filter(lg => {
        if (currentLogFilter === 'all') return true;
        return lg.type === currentLogFilter;
    });

    if (filtered.length === 0) {
        list.innerHTML = `<p class="text-xs text-slate-500 text-center py-4">Belum ada logs.</p>`;
        return;
    }

    filtered.forEach(lg => {
        list.innerHTML += `
            <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <div class="flex justify-between items-center text-[10px]">
                    <span class="px-2 py-0.5 rounded border font-bold uppercase text-cyan-400 bg-cyan-500/20">${lg.type}</span>
                    <span class="text-slate-500">${lg.time}</span>
                </div>
                <p class="text-slate-200">${lg.detail} <span class="text-cyan-400 font-bold">(@${lg.user})</span></p>
            </div>
        `;
    });
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
        box.innerHTML = `<p class="text-slate-500 text-center">Belum ada pesan.</p>`;
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
    sendTelegramNotification(`<b>[LIVECHAT ADMIN -> @${activeChatUser}]</b>\n${text}`);
}

function adminEndLiveChat() {
    if (!activeChatUser) return;
    if (confirm(`Akhiri sesi chat dengan @${activeChatUser}?`)) {
        delete liveChatConversations[activeChatUser];
        localStorage.setItem('frh_livechat_conversations', JSON.stringify(liveChatConversations));
        renderAdminLiveChatUsers();
        alert('Sesi chat diakhiri.');
    }
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
        box.innerHTML = `<p class="text-slate-500 text-center">Mulai chat dengan admin...</p>`;
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
    sendTelegramNotification(`<b>[LIVECHAT @${currentUser.username} -> ADMIN]</b>\n${text}`);
}

function userEndLiveChat() {
    if (!currentUser) return;
    if (confirm('Akhiri sesi live chat ini?')) {
        delete liveChatConversations[currentUser.username];
        localStorage.setItem('frh_livechat_conversations', JSON.stringify(liveChatConversations));
        renderUserLiveChatMessages();
        alert('Live chat diakhiri.');
    }
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
                    <span class="text-amber-400 block">${rew.cost} Poin | Tipe: ${rew.type} | Max/User: ${rew.limitPerUser || 1} | Kuota: ${rew.claimedCount || 0}/${rew.quota || 100}</span>
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
    const type = document.getElementById('rew-type').value;
    const limitPerUser = parseInt(document.getElementById('rew-limit-user').value) || 1;
    const quota = parseInt(document.getElementById('rew-quota').value) || 100;

    redeemRewards.push({ id: Date.now(), name, cost, type, limitPerUser, quota, claimedCount: 0 });
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
    let uname = currentUser.username;

    redeemRewards.forEach(rew => {
        if (!userRedeemHistory[uname]) userRedeemHistory[uname] = {};
        let userClaimedCount = userRedeemHistory[uname][rew.id] || 0;
        let limit = rew.limitPerUser || 1;
        let quotaMax = rew.quota || 100;
        let claimedTotal = rew.claimedCount || 0;

        if (userClaimedCount >= limit || claimedTotal >= quotaMax) return;

        let canAfford = myPts >= rew.cost;
        let btnText = canAfford ? "Tukar Hadiah" : "Poin Tidak Cukup";
        let isDisabled = !canAfford;

        list.innerHTML += `
            <div class="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col justify-between text-xs space-y-3">
                <div>
                    <span class="font-bold text-white text-sm block">${rew.name}</span>
                    <span class="text-amber-400 font-bold mt-1 inline-block"><i class="fa-solid fa-coins"></i> ${rew.cost} Poin</span>
                    <span class="text-[10px] text-slate-400 block mt-0.5">Limit/User: ${userClaimedCount}/${limit} | Kuota: ${claimedTotal}/${quotaMax}</span>
                </div>
                <button onclick="initRedeemReward(${rew.id})" ${isDisabled ? 'disabled' : ''} class="w-full py-2.5 ${isDisabled ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold'} rounded-xl transition-all cursor-pointer">${btnText}</button>
            </div>
        `;
    });
}

function initRedeemReward(id) {
    let rew = redeemRewards.find(r => r.id === id);
    let uname = currentUser.username;
    let myPts = userPoints[uname] || 0;

    if (myPts < rew.cost) {
        alert('Poin Anda tidak mencukupi.');
        return;
    }

    if (rew.type === 'post_access') {
        openRedeemPostModal(rew);
    } else {
        executeRedeemReward(rew);
    }
}

function openRedeemPostModal(rew) {
    const modal = document.getElementById('redeem-post-modal');
    const list = document.getElementById('redeem-post-selection-list');
    list.innerHTML = '';
    modal.classList.remove('hidden');

    let uname = currentUser.username;
    let unlockedArr = userUnlockedPosts[uname] || [];
    let specialResources = resources.filter(r => r.isSpecialAccess);

    if (specialResources.length === 0) {
        list.innerHTML = `<p class="text-xs text-slate-500 text-center py-4">Tidak ada script khusus.</p>`;
        return;
    }

    specialResources.forEach(res => {
        let isAlreadyUnlocked = unlockedArr.includes(res.id);
        let btnHtml = isAlreadyUnlocked 
            ? `<span class="text-emerald-400 font-bold text-[10px]">Sudah Dibuka</span>`
            : `<button onclick="confirmRedeemPostAccess(${res.id}, '${rew.name}', ${rew.cost}, ${rew.id})" class="px-3 py-1.5 bg-cyan-500 text-slate-950 font-bold rounded-lg cursor-pointer">Pilih & Buka</button>`;

        list.innerHTML += `
            <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <div>
                    <span class="font-bold text-white block">${res.name}</span>
                    <span class="text-[10px] text-amber-400">Akses Khusus (${res.version || 'v1.0'})</span>
                </div>
                <div>${btnHtml}</div>
            </div>
        `;
    });
}

function closeRedeemPostModal() {
    document.getElementById('redeem-post-modal').classList.add('hidden');
}

function confirmRedeemPostAccess(resId, rewName, cost, rewardId) {
    let uname = currentUser.username;
    if (!userUnlockedPosts[uname]) userUnlockedPosts[uname] = [];
    userPoints[uname] -= cost;
    localStorage.setItem('frh_user_points', JSON.stringify(userPoints));
    userUnlockedPosts[uname].push(resId);
    localStorage.setItem('frh_user_unlocked_posts', JSON.stringify(userUnlockedPosts));

    closeRedeemPostModal();
    alert('Akses postingan khusus berhasil dibuka!');
    renderProfilePage();
}

function executeRedeemReward(rew) {
    let uname = currentUser.username;
    userPoints[uname] -= rew.cost;
    localStorage.setItem('frh_user_points', JSON.stringify(userPoints));

    if (rew.type === 'vip') {
        userVipSubscriptions[uname] = Date.now() + (30 * 24 * 60 * 60 * 1000);
        localStorage.setItem('frh_user_vip_subs', JSON.stringify(userVipSubscriptions));
    }

    alert(`Berhasil menukar "${rew.name}"!`);
    renderProfilePage();
}

/* ========================================================
   UPLOAD & MANAJEMEN SCRIPT
   ======================================================== */
function setSubmitEditMode(val) { activeEditModeAction = 'edit'; }
function setSubmitUpdateMode(val) { activeEditModeAction = 'update'; }

function handleSaveResource(e) {
    e.preventDefault();
    const editId = document.getElementById('edit-resource-id').value;
    const name = document.getElementById('up-name').value.trim();
    const category = document.getElementById('up-category').value;
    const subcategory = document.getElementById('up-subcategory').value;
    const typeUpload = document.getElementById('up-type-upload').value;
    const version = document.getElementById('up-version').value.trim();
    const fileSize = document.getElementById('up-link-size').value.trim();
    const screenshot = document.getElementById('up-screenshot').value.trim();
    const description = document.getElementById('up-desc').value.trim();
    const verified = document.getElementById('up-verified').checked;
    const isSpecialAccess = document.getElementById('up-special-access').checked;

    let links = [];
    document.querySelectorAll('#dynamic-links-container > div').forEach(row => {
        let nInput = row.querySelector('.link-name-input');
        let uInput = row.querySelector('.link-url-input');
        if (nInput && uInput && nInput.value && uInput.value) {
            links.push({ name: nInput.value.trim(), url: uInput.value.trim() });
        }
    });

    if (links.length === 0) {
        alert('Harap masukkan setidaknya 1 tautan unduhan secara manual.');
        return;
    }

    if (editId) {
        let res = resources.find(r => r.id == editId);
        if (res) {
            res.name = name;
            res.category = category;
            res.subcategory = subcategory;
            res.typeUpload = typeUpload;
            res.version = version;
            res.fileSize = fileSize;
            res.screenshot = screenshot;
            res.description = description;
            res.verified = verified;
            res.isSpecialAccess = isSpecialAccess;
            res.links = links;
            
            if (activeEditModeAction === 'edit') res.editStatus = 'Edited';
            else if (activeEditModeAction === 'update') res.editStatus = 'Updated';
            else res.editStatus = 'Edited';
        }
        alert('Script berhasil diperbarui!');
        resetUploadForm();
    } else {
        const newRes = {
            id: Date.now(),
            name, category, subcategory, typeUpload, version,
            links, paidUnlockedUsers: [],
            isSpecialAccess,
            description, fileSize, screenshot, verified,
            uploader: currentUser.username,
            likes: 0, views: 0,
            likedBy: [], savedBy: [],
            ratings: {}, ratedUsers: {},
            reviews: [], comments: [],
            editStatus: null
        };
        resources.unshift(newRes);
        addNotification(`Script baru dipublikasikan: ${name}`, 'admin');
        alert('Script berhasil dipublikasikan!');
        e.target.reset();
        document.getElementById('dynamic-links-container').innerHTML = '';
        addCustomLinkRow();
    }

    localStorage.setItem('frh_resources', JSON.stringify(resources));
    renderAdminManageList();
}

function editResource(id) {
    const res = resources.find(r => r.id === id);
    if (!res) return;
    switchAdminTab('upload');
    document.getElementById('form-upload-title').innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Edit Script: ${res.name}`;
    document.getElementById('edit-resource-id').value = res.id;
    document.getElementById('up-name').value = res.name;
    document.getElementById('up-category').value = res.category;
    updateSubCategories();
    document.getElementById('up-subcategory').value = res.subcategory;
    document.getElementById('up-type-upload').value = res.typeUpload || 'file';
    document.getElementById('up-version').value = res.version || 'v1.0';
    document.getElementById('up-link-size').value = res.fileSize;
    document.getElementById('up-screenshot').value = res.screenshot || '';
    document.getElementById('up-desc').value = res.description;
    document.getElementById('up-verified').checked = res.verified || false;
    document.getElementById('up-special-access').checked = res.isSpecialAccess || false;

    const container = document.getElementById('dynamic-links-container');
    container.innerHTML = '';
    if (res.links && res.links.length > 0) {
        res.links.forEach(l => addCustomLinkRow(l.name, l.url));
    } else {
        addCustomLinkRow();
    }

    document.getElementById('btn-submit-resource').classList.add('hidden');
    document.getElementById('btn-submit-edit').classList.remove('hidden');
    document.getElementById('btn-submit-edit').style.display = 'flex';
    document.getElementById('btn-submit-update').classList.remove('hidden');
    document.getElementById('btn-submit-update').style.display = 'flex';
    document.getElementById('btn-cancel-edit').classList.remove('hidden');
}

function resetUploadForm() {
    document.getElementById('edit-resource-id').value = '';
    document.getElementById('form-upload-title').innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> Tambah Script Game Baru`;
    document.getElementById('btn-submit-resource').classList.remove('hidden');
    document.getElementById('btn-submit-edit').classList.add('hidden');
    document.getElementById('btn-submit-update').classList.add('hidden');
    document.getElementById('btn-cancel-edit').classList.add('hidden');
    document.querySelector('form').reset();
    document.getElementById('dynamic-links-container').innerHTML = '';
    addCustomLinkRow();
    activeEditModeAction = null;
}

let pendingDeleteId = null;
function deleteResource(id) {
    pendingDeleteId = id;
    const res = resources.find(r => r.id === id);
    document.getElementById('confirm-msg').textContent = `Hapus "${res ? res.name : 'script ini'}"?`;
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
    document.getElementById('reader-content').textContent = `=== PETUNJUK PEMASANGAN & KOMPARASI VERSI ===\nVersi Saat Ini: ${res.version || 'v1.0'}\nKategori: ${res.category} (${res.subcategory})\n\n[Deskripsi & Petunjuk Lengkap]:\n${res.description}`;
    document.getElementById('reader-mode-modal').classList.remove('hidden');
}

function openVersionComparison() {
    openReaderMode();
}

function closeReaderMode() {
    document.getElementById('reader-mode-modal').classList.add('hidden');
}

function renderAdminManageList() {
    const list = document.getElementById('admin-manage-list');
    if (!list) return;
    list.innerHTML = '';
    if (resources.length === 0) {
        list.innerHTML = `<p class="text-xs text-slate-500 col-span-full">Belum ada script.</p>`;
        return;
    }
    resources.forEach(res => {
        list.innerHTML += `
            <div class="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col justify-between text-xs space-y-3">
                <div>
                    <span class="font-bold text-white text-sm block">${res.name} (${res.version || 'v1.0'})</span>
                    <span class="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 inline-block mt-1">${res.category} (${res.subcategory})</span>
                    ${res.isSpecialAccess ? '<span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 inline-block ml-1 font-bold">Khusus</span>' : ''}
                    ${res.editStatus === 'Edited' ? '<span class="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 inline-block ml-1 font-bold">Edited</span>' : ''}
                    ${res.editStatus === 'Updated' ? '<span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 inline-block ml-1 font-bold">Updated</span>' : ''}
                </div>
                <div class="flex items-center justify-between pt-2 border-t border-slate-900">
                    <label class="flex items-center gap-1 text-[11px] text-amber-400 cursor-pointer font-semibold">
                        <input type="checkbox" ${res.isSpecialAccess ? 'checked' : ''} onchange="toggleSpecialAccessFlag(${res.id})" class="accent-amber-500">
                        Akses Khusus
                    </label>
                    <div class="flex gap-2">
                        <button onclick="editResource(${res.id})" class="px-3 py-1 bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-slate-950 font-bold rounded-lg transition-all cursor-pointer">Edit</button>
                        <button onclick="deleteResource(${res.id})" class="px-3 py-1 bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-slate-950 font-bold rounded-lg transition-all cursor-pointer">Hapus</button>
                    </div>
                </div>
            </div>
        `;
    });
}

function toggleSpecialAccessFlag(id) {
    let res = resources.find(r => r.id === id);
    if (res) {
        res.isSpecialAccess = !res.isSpecialAccess;
        localStorage.setItem('frh_resources', JSON.stringify(resources));
        renderAdminManageList();
        alert(`Status akses khusus "${res.name}" diubah.`);
    }
}

function renderAdminAnalytics() {
    const statRes = document.getElementById('stat-total-res');
    const statUsers = document.getElementById('stat-total-users');
    if (statRes) statRes.textContent = resources.length;
    let users = JSON.parse(localStorage.getItem('frh_users')) || [];
    if (statUsers) statUsers.textContent = users.length;
}

function exportDataBackup() {
    const backupData = {
        resources, announcements,
        users: JSON.parse(localStorage.getItem('frh_users')) || [],
        brokenReports, userPoints, userVipSubscriptions, systemLogs,
        exportDate: new Date().toISOString()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "rapzresource_hub_v15_backup.json");
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
    alert('Kredensial Super Admin diperbarui!');
}

function renderAdminDashboard() {
    renderAdminManageList();
    renderAdminAnalytics();
    renderAdminUsersList();
    renderAdminCategoriesConfig();
}

/* ========================================================
   FILTER UTAMA & SUB-KATEGORI INTERAKTIF
   ======================================================== */
function filterMainCategory(cat) {
    currentMainCategory = cat;
    currentSubCategory = 'All';

    ['All', 'Script Mobile Legends', 'Script Free Fire', 'Saved'].forEach(c => {
        let btn = document.getElementById(`main-cat-btn-${c}`) || document.getElementById(`cat-btn-${c}`);
        if(btn) {
            btn.className = c === cat 
                ? "px-4 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 transition-all cursor-pointer shadow-md"
                : "px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all cursor-pointer";
        }
    });

    const subBar = document.getElementById('sub-category-bar');
    if (cat === 'Script Mobile Legends' || cat === 'Script Free Fire') {
        subBar.classList.remove('hidden');
        renderSubCategoryButtons(cat);
    } else {
        subBar.classList.add('hidden');
    }

    renderResources();
}

function filterSaved() {
    currentMainCategory = 'Saved';
    currentSubCategory = 'All';
    document.getElementById('sub-category-bar').classList.add('hidden');
    renderResources();
}

function renderSubCategoryButtons(mainCat) {
    const wrapper = document.getElementById('sub-category-buttons-wrapper');
    if (!wrapper) return;
    wrapper.innerHTML = '';

    let subs = categoryConfig[mainCat] || [];
    
    wrapper.innerHTML += `
        <button onclick="filterSubCategory('All')" id="sub-btn-All" class="px-3 py-1.5 rounded-lg text-xs font-bold ${currentSubCategory === 'All' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'} cursor-pointer">Semua</button>
    `;

    subs.forEach(sub => {
        let isActive = currentSubCategory === sub;
        wrapper.innerHTML += `
            <button onclick="filterSubCategory('${sub}')" id="sub-btn-${sub}" class="px-3 py-1.5 rounded-lg text-xs font-bold ${isActive ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'} cursor-pointer">${sub}</button>
        `;
    });
}

function filterSubCategory(sub) {
    currentSubCategory = sub;
    let subs = categoryConfig[currentMainCategory] || [];
    ['All', ...subs].forEach(s => {
        let btn = document.getElementById(`sub-btn-${s}`);
        if (btn) {
            btn.className = s === sub 
                ? "px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 cursor-pointer"
                : "px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer";
        }
    });
    renderResources();
}

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
        box.innerHTML += `<div class="text-[10px] text-cyan-400 px-2 py-1 uppercase">Hasil Pencarian</div>`;
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
        if (currentMainCategory === 'Script Mobile Legends') matchCat = res.category === 'Script Mobile Legends';
        if (currentMainCategory === 'Script Free Fire') matchCat = res.category === 'Script Free Fire';
        if (currentMainCategory === 'Saved') matchCat = res.savedBy && res.savedBy.includes(currentUser.username);

        if (matchCat && currentSubCategory !== 'All' && (currentMainCategory === 'Script Mobile Legends' || currentMainCategory === 'Script Free Fire')) {
            matchCat = res.subcategory === currentSubCategory;
        }

        let matchSearch = res.name.toLowerCase().includes(searchKeyword) || res.description.toLowerCase().includes(searchKeyword);
        return matchCat && matchSearch;
    });

    if (sortBy === 'popular') filtered.sort((a, b) => b.likes - a.likes);
    if (sortBy === 'views') filtered.sort((a, b) => b.views - a.views);
    if (sortBy === 'rating') filtered.sort((a, b) => parseFloat(calculateAverageRating(b)) - parseFloat(calculateAverageRating(a)));
    if (sortBy === 'size') filtered.sort((a, b) => parseFileSize(a.fileSize) - parseFileSize(b.fileSize));

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="col-span-full py-16 text-center text-slate-500"><i class="fa-regular fa-folder-open text-4xl mb-3"></i><p class="text-sm">Tidak ada script yang ditemukan.</p></div>`;
        return;
    }

    filtered.forEach(res => {
        const isLiked = res.likedBy && res.likedBy.includes(currentUser.username);
        const isSaved = res.savedBy && res.savedBy.includes(currentUser.username);
        const isBroken = brokenReports.some(rep => rep.resName === res.name);

        const iconClass = res.category === 'Script Mobile Legends' ? 'fa-solid fa-shield-halved text-cyan-400' : 'fa-solid fa-fire text-amber-400';
        const avgRating = calculateAverageRating(res);

        grid.innerHTML += `
            <div class="bg-slate-900 border ${isBroken ? 'border-rose-500/50' : 'border-slate-800/80'} rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg group">
                <div>
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center gap-2">
                            <div class="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-lg ${iconClass}"></div>
                            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-400">${res.version || 'v1.0'}</span>
                        </div>
                        <div class="flex items-center gap-1.5">
                            ${res.isSpecialAccess ? '<span class="text-[10px] text-amber-400 font-bold bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30"><i class="fa-solid fa-key"></i> Khusus</span>' : ''}
                            ${res.editStatus === 'Edited' ? '<span class="text-[10px] text-blue-400 font-bold bg-blue-500/20 px-2 py-0.5 rounded">Edited</span>' : ''}
                            ${res.editStatus === 'Updated' ? '<span class="text-[10px] text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded">Updated</span>' : ''}
                            ${isBroken ? '<span class="text-[10px] text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded">Rusak</span>' : ''}
                            <span class="text-[10px] text-amber-400 font-bold"><i class="fa-solid fa-star"></i> ${avgRating}</span>
                        </div>
                    </div>
                    <span class="text-[10px] uppercase font-bold text-slate-500 block mb-1">${res.category} • ${res.subcategory}</span>
                    <h3 onclick="openDetail(${res.id})" class="font-bold text-base text-white group-hover:text-cyan-400 transition-colors cursor-pointer line-clamp-1">${res.name}</h3>
                    <p class="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">${res.description}</p>
                </div>
                
                <div class="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-300">
                    <div class="flex items-center gap-3">
                        <button onclick="toggleLike(${res.id})" class="flex items-center gap-1 hover:text-rose-400 transition-colors cursor-pointer ${isLiked ? 'text-rose-500' : ''}">
                            <i class="${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart"></i> <span>${res.likes || 0}</span>
                        </button>
                        <span class="flex items-center gap-1" title="Jumlah Dilihat"><i class="fa-solid fa-eye text-cyan-400"></i> ${res.views || 0}</span>
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
        addExpAndLevelProgress(currentUser.username);
        logUserAction(currentUser.username, `Menyukai script: ${res.name}`);
        recordSystemLog('like_post', `User @${currentUser.username} menyukai script "${res.name}".`, currentUser.username);
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
        logUserAction(currentUser.username, `Menyimpan script: ${res.name}`);
    }
    localStorage.setItem('frh_resources', JSON.stringify(resources));
    renderResources();
}

function checkUserHasCleanLinkAccess(res) {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;

    let isVip = userVipSubscriptions[currentUser.username] && Date.now() < userVipSubscriptions[currentUser.username];
    let unlockedArr = userUnlockedPosts[currentUser.username] || [];
    let isUnlockedPost = unlockedArr.includes(res.id);

    return isVip || isUnlockedPost;
}

/* ========================================================
   DETAIL POSTINGAN DENGAN FITUR SALIN LINK & LAPOR LINK RUSAK DI SETIAP TOMBOL
   ======================================================== */
function openDetail(id, openModalWindow = true) {
    const res = resources.find(r => r.id === id);
    if (!res) return;

    if (res.isSpecialAccess && currentUser && currentUser.role !== 'admin') {
        let unlockedArr = userUnlockedPosts[currentUser.username] || [];
        let isVip = userVipSubscriptions[currentUser.username] && Date.now() < userVipSubscriptions[currentUser.username];
        if (!unlockedArr.includes(res.id) && !isVip) {
            alert('Akses Ditolak! Postingan ini merupakan Postingan Khusus. Anda harus menukarkan poin di menu Redeem Points atau mengaktifkan VVIP untuk melihat detail dan cara mengaksesnya.');
            switchMainView('profile');
            return;
        }
    }

    activeResourceId = id;
    res.views = (res.views || 0) + 1;
    localStorage.setItem('frh_resources', JSON.stringify(resources));

    if (currentUser && currentUser.role !== 'admin') {
        if (!userViewHistory[currentUser.username]) userViewHistory[currentUser.username] = [];
        userViewHistory[currentUser.username] = userViewHistory[currentUser.username].filter(item => item !== res.name);
        userViewHistory[currentUser.username].unshift(res.name);
        if (userViewHistory[currentUser.username].length > 15) userViewHistory[currentUser.username].pop();
        localStorage.setItem('frh_user_view_history', JSON.stringify(userViewHistory));
        addExpAndLevelProgress(currentUser.username); 
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

    // RENDER TOMBOL DOWNLOAD + TOMBOL SALIN LINK & LAPOR LINK RUSAK DI BAWAHNYA
    const dynamicLinksList = document.getElementById('modal-dynamic-links-list');
    dynamicLinksList.innerHTML = '';

    if (res.links && res.links.length > 0) {
        res.links.forEach((l, index) => {
            let isVipLink = l.name.toLowerCase().includes('vvip') || l.name.toLowerCase().includes('tanpa iklan') || l.name.toLowerCase().includes('direct');
            let canAccess = !isVipLink || checkUserHasCleanLinkAccess(res);

            let btnBg = isVipLink ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20' : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20';
            let iconType = isVipLink ? 'fa-shield-halved' : 'fa-cloud-arrow-down';

            let actionButtonHtml = '';
            if (canAccess) {
                actionButtonHtml = `
                    <a href="${l.url}" target="_blank" onclick="recordDownload(event, '${l.name}')" class="w-full py-3 ${btnBg} font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer text-xs">
                        <i class="fa-solid ${iconType}"></i> ${l.name} (${res.fileSize || 'Files'})
                    </a>
                `;
            } else {
                actionButtonHtml = `
                    <button onclick="alert('Akses Ditolak! Tautan VVIP ini memerlukan VVIP aktif atau membuka akses postingan khusus.'); switchMainView('profile'); closeModal();" class="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-xs border border-slate-700">
                        <i class="fa-solid fa-lock text-amber-400"></i> ${l.name} [VVIP Diperlukan]
                    </button>
                `;
            }

            // Tambahan tombol salin link & lapor link rusak persis di bawah setiap tombol unduhan
            dynamicLinksList.innerHTML += `
                <div class="space-y-1.5 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
                    ${actionButtonHtml}
                    <div class="flex items-center gap-2 pt-1">
                        <button onclick="copySpecificLink('${encodeURIComponent(l.url)}', '${l.name}')" class="flex-1 py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-800">
                            <i class="fa-regular fa-copy text-cyan-400"></i> Salin Link (${l.name})
                        </button>
                        <button onclick="reportSpecificLink('${res.name}', '${l.name}')" class="py-1.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-rose-500/20" title="Laporkan link rusak">
                            <i class="fa-solid fa-triangle-exclamation"></i> Lapor Rusak
                        </button>
                    </div>
                </div>
            `;
        });
    } else {
        dynamicLinksList.innerHTML = `<p class="text-xs text-slate-500">Tidak ada tautan tersedia.</p>`;
    }

    const iconDiv = document.getElementById('modal-file-icon');
    iconDiv.innerHTML = `<i class="${res.category === 'Script Mobile Legends' ? 'fa-solid fa-shield-halved text-cyan-400' : 'fa-solid fa-fire text-amber-400'}"></i>`;

    let hasRated = res.ratedUsers && res.ratedUsers[currentUser.username];
    const ratingSectionBox = document.getElementById('modal-rating-form-container') || document.getElementById('btn-submit-rating')?.parentElement?.parentElement;
    
    if (hasRated) {
        if (ratingSectionBox) {
            ratingSectionBox.innerHTML = `<div class="bg-slate-950 border border-slate-800 p-3 rounded-xl text-center text-xs text-emerald-400 font-bold"><i class="fa-solid fa-circle-check"></i> Anda sudah memberikan ulasan & rating untuk script ini. Terima kasih!</div>`;
        }
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

function copySpecificLink(encodedUrl, linkName) {
    let decodedUrl = decodeURIComponent(encodedUrl);
    navigator.clipboard.writeText(decodedUrl).then(() => {
        alert(`Tautan "${linkName}" berhasil disalin ke clipboard!`);
    }).catch(err => {
        console.error('Gagal menyalin:', err);
    });
}

function reportSpecificLink(resName, linkName) {
    if (!currentUser) {
        alert('Silakan login terlebih dahulu.');
        return;
    }
    let reportText = `${resName} (${linkName})`;
    if (!brokenReports.some(rep => rep.resName === reportText && rep.user === currentUser.username)) {
        brokenReports.push({ resName: reportText, user: currentUser.username });
        localStorage.setItem('frh_broken_reports', JSON.stringify(brokenReports));
        addNotification(`Laporan link rusak untuk ${reportText} diteruskan ke admin.`, 'danger');
        addPoints(currentUser.username, 5);
        logUserAction(currentUser.username, `Melaporkan link rusak: ${reportText}`);
        alert(`Laporan link rusak untuk "${linkName}" berhasil diteruskan (+5 Poin).`);
        renderResources();
    } else {
        alert('Anda sudah melaporkan tautan ini sebelumnya.');
    }
}

function selectRatingStar(star) {
    currentSelectedStar = star;
    const ratingTextEl = document.getElementById('rating-selected-text');
    if (ratingTextEl) ratingTextEl.textContent = `${star} Bintang Dipilih`;
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
        alert('Anda sudah memberikan rating.');
        return;
    }

    const reviewInput = document.getElementById('review-input');
    const reviewText = reviewInput ? reviewInput.value.trim() : '';
    
    res.ratedUsers[currentUser.username] = currentSelectedStar;
    res.ratings[currentSelectedStar] = (res.ratings[currentSelectedStar] || 0) + 1;
    res.reviews.unshift({ user: currentUser.username, rating: currentSelectedStar, text: reviewText });

    addPoints(currentUser.username, 10);
    addExpAndLevelProgress(currentUser.username); 
    logUserAction(currentUser.username, `Memberi rating & ulasan pada ${res.name}`);
    recordSystemLog('rating_post', `User @${currentUser.username} memberi rating pada "${res.name}".`, currentUser.username);

    localStorage.setItem('frh_resources', JSON.stringify(resources));
    
    alert(`Ulasan & rating berhasil dikirim (+10 Poin & EXP).`);
    if (reviewInput) reviewInput.value = '';
    openDetail(activeResourceId, false);
    renderResources();
}

function recordDownload(e, linkName) {
    if (!currentUser) {
        e.preventDefault();
        alert('Anda wajib login terlebih dahulu sebelum mengunduh.');
        document.getElementById('auth-modal').classList.remove('hidden');
        return;
    }

    addPoints(currentUser.username, 5);
    logUserAction(currentUser.username, `Mengunduh script via ${linkName}`);
}

function reportBrokenLink() {
    reportBrokenLink = function() {
        if (!activeResourceId) return;
        let res = resources.find(r => r.id === activeResourceId);
        reportSpecificLink(res.name, 'Semua Tautan');
    };
    reportBrokenLink();
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
    addExpAndLevelProgress(currentUser.username); 
    logUserAction(currentUser.username, `Mengomentari script: ${res.name}`);
    recordSystemLog('komentar_post', `User @${currentUser.username} berkomentar pada "${res.name}".`, currentUser.username);

    localStorage.setItem('frh_resources', JSON.stringify(resources));
    input.value = '';
    alert('Komentar berhasil dikirim (+5 Poin & EXP).');
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
        alert('Password berhasil diubah!');
        document.getElementById('new-user-pass').value = '';
        togglePasswordForm();
    }
}

const profileQuestsDefinition = [
    { id: 'q1', title: 'Sukai 1 Script', reward: 10, target: 1, type: 'like' },
    { id: 'q2', title: 'Sukai 3 Script', reward: 25, target: 3, type: 'like' },
    { id: 'q3', title: 'Sukai 5 Script', reward: 40, target: 5, type: 'like' },
    { id: 'q4', title: 'Sukai 10 Script', reward: 75, target: 10, type: 'like' },
    { id: 'q5', title: 'Sukai 25 Script', reward: 150, target: 25, type: 'like' },
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
    return 0;
}

function claimProfileQuest(questId, target, type, reward) {
    let uname = currentUser.username;
    if (!userQuestClaims[uname]) userQuestClaims[uname] = {};
    if (userQuestClaims[uname][questId]) {
        alert('Quest sudah diklaim!');
        return;
    }

    let currentProgress = checkQuestRealProgress(type);
    if (currentProgress >= target) {
        userQuestClaims[uname][questId] = true;
        localStorage.setItem('frh_user_quest_claims', JSON.stringify(userQuestClaims));
        addPoints(uname, reward);
        addExpAndLevelProgress(uname, 25); 
        addNotification(`Quest "${questId}" selesai! (+${reward} Poin & EXP)`, 'admin');
        recordSystemLog('selesai_quest', `User @${uname} menyelesaikan quest "${questId}" (+${reward} Poin).`, uname);
        alert(`Quest selesai! Anda mendapatkan +${reward} Poin & EXP.`);
        renderProfilePage();
    } else {
        alert(`Belum memenuhi syarat (Progress: ${currentProgress}/${target}).`);
    }
}

function renderProfilePage() {
    let uname = currentUser.username;
    document.getElementById('profile-username').textContent = uname;
    document.getElementById('profile-badge-label').textContent = getUserBadge(uname);
    document.getElementById('profile-points-label').textContent = `Poin Reward: ${userPoints[uname] || 0} Pts`;
    
    if (!userLevels[uname]) userLevels[uname] = { level: 1, exp: 0 };
    let uLvlData = userLevels[uname];
    let reqExp = getTargetExpForLevel(uLvlData.level);
    document.getElementById('profile-level-label').textContent = `Level: ${uLvlData.level} (EXP: ${uLvlData.exp}/${reqExp})`;

    let isVip = userVipSubscriptions[uname] && Date.now() < userVipSubscriptions[uname];
    document.getElementById('profile-vip-status').innerHTML = isVip ? `<span class="px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg"><i class="fa-solid fa-shield-halved"></i> VVIP Tanpa Iklan Aktif (1 Bulan)</span>` : `<span class="text-slate-400">Status: Member Free (Dengan Iklan)</span>`;

    const trophyBox = document.getElementById('profile-trophies');
    trophyBox.innerHTML = '';
    let badgeStr = getUserBadge(uname);
    if (!badgeStr.includes('Member Baru')) {
        trophyBox.innerHTML += `<span class="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-[10px] font-bold">${badgeStr}</span>`;
    }

    const questList = document.getElementById('profile-quests-list');
    if (questList) {
        questList.innerHTML = '';
        if (!userQuestClaims[uname]) userQuestClaims[uname] = {};

        profileQuestsDefinition.forEach(q => {
            let isClaimed = userQuestClaims[uname][q.id] || false;
            let currentProg = checkQuestRealProgress(q.type);
            let canClaim = currentProg >= q.target && !isClaimed;

            let btnHtml = '';
            if (isClaimed) {
                btnHtml = `<span class="text-emerald-400 font-bold text-[11px]"><i class="fa-solid fa-check"></i> Selesai</span>`;
            } else if (canClaim) {
                btnHtml = `<button onclick="claimProfileQuest('${q.id}', ${q.target}, '${q.type}', ${q.reward})" class="px-3 py-1.5 bg-emerald-500 text-slate-950 font-bold rounded-xl cursor-pointer">Klaim (+${q.reward})</button>`;
            } else {
                btnHtml = `<span class="text-slate-500 text-[10px]">Progress: ${currentProg}/${q.target}</span>`;
            }

            questList.innerHTML += `
                <div class="bg-slate-950 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between text-xs">
                    <div>
                        <span class="font-bold text-white block">${q.title}</span>
                        <span class="text-amber-400 text-[10px]">Hadiah: +${q.reward} Poin & EXP</span>
                    </div>
                    <div>${btnHtml}</span></div>
                </div>
            `;
        });
    }

    renderUserRedeemRewardsList();

    const viewList = document.getElementById('profile-view-history-list');
    viewList.innerHTML = '';
    let myViews = userViewHistory[uname] || [];
    if (myViews.length === 0) {
        viewList.innerHTML = `<p class="text-xs text-slate-500">Belum ada riwayat.</p>`;
    } else {
        myViews.forEach(name => {
            viewList.innerHTML += `<div class="bg-slate-950 p-3 rounded-xl text-xs text-slate-300 border border-slate-800 flex items-center gap-2"><i class="fa-solid fa-eye text-cyan-400"></i> ${name}</div>`;
        });
    }

    const savedList = document.getElementById('profile-saved-list');
    savedList.innerHTML = '';
    let mySaved = resources.filter(r => r.savedBy && r.savedBy.includes(uname));
    
    if (mySaved.length === 0) {
        savedList.innerHTML = `<p class="text-xs text-slate-500">Belum ada script disimpan.</p>`;
    } else {
        mySaved.forEach(res => {
            savedList.innerHTML += `<div class="bg-slate-950 p-3 rounded-xl text-xs text-slate-300 border border-slate-800 flex items-center justify-between"><span>${res.name}</span><button onclick="openDetail(${res.id})" class="text-cyan-400 font-bold cursor-pointer">Buka</button></div>`;
        });
    }
}
