let currentUser = JSON.parse(localStorage.getItem('frh_current_user')) || null;
let adminCreds = JSON.parse(localStorage.getItem('frh_admin_creds')) || { user: 'superadmin', pass: 'securepass99', pin: '8888' };
let adminFailedAttempts = parseInt(localStorage.getItem('frh_admin_fails')) || 0;
let adminLockUntil = parseInt(localStorage.getItem('frh_admin_lock')) || 0;

let telegramConfig = JSON.parse(localStorage.getItem('frh_telegram_config')) || { token: '', chatId: '' };
let currentBroadcast = JSON.parse(localStorage.getItem('frh_broadcast')) || { title: "PENGUMUMAN PENTING", content: "Selamat datang di Gudang Script Mobile Legends & Free Fire." };

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
        typeUpload: "link",
        version: "v1.0",
        links: [
            { name: "Link Iklan (Free)", url: "https://safelink-sample.com/ml1", type: "free" },
            { name: "Link Tanpa Iklan (VVIP)", url: "https://drive.google.com/ml1-clean", type: "vvip" }
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
    { id: 1, title: "Pembaruan Gudang Script", content: "Kustomisasi Nama Link, Pembersihan Fitur Redundan, dan Riwayat Profil Komprehensif.", date: "12 Agustus 2026" }
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
    { id: 1, text: "Selamat datang di Gudang Script Mobile Legends & Free Fire", type: 'script', read: false, time: "Baru saja" }
];
let userRedeemHistory = JSON.parse(localStorage.getItem('frh_user_redeem_history')) || {}; 
let userBans = JSON.parse(localStorage.getItem('frh_user_bans')) || {}; 

// Riwayat Profil Tambahan
let userLoginHistory = JSON.parse(localStorage.getItem('frh_user_login_history')) || {};
let userQuestHistory = JSON.parse(localStorage.getItem('frh_user_quest_history')) || {};
let userRedeemLogHistory = JSON.parse(localStorage.getItem('frh_user_redeem_log_history')) || {};
let userReportHistory = JSON.parse(localStorage.getItem('frh_user_report_history')) || {};
let userPasswordHistory = JSON.parse(localStorage.getItem('frh_user_password_history')) || {};

let currentMainCategory = 'All';
let currentSubCategory = 'All';

let activeResourceId = null;
let currentSelectedStar = 5;
let adminSessionTimer = null;
let currentLogFilter = 'all';
let activeEditModeAction = null;

// POIN 5: DAILY CLAIM SYSTEM (Reset setiap jam 00.00 / tanggal berganti, random 1-100 poin)
function handleDailyClaim() {
    if (!currentUser) {
        showToast('Silakan login terlebih dahulu untuk melakukan Daily Claim.', 'warning');
        return;
    }
    let uname = currentUser.username;
    let lastClaimDate = localStorage.getItem(`frh_last_claim_date_${uname}`);
    let todayDateStr = new Date().toDateString();

    if (lastClaimDate === todayDateStr) {
        showToast('Anda sudah melakukan Daily Claim hari ini. Reset pada jam 00.00.', 'warning');
        return;
    }

    let randomPts = Math.floor(Math.random() * 100) + 1;
    addPoints(uname, randomPts);
    localStorage.setItem(`frh_last_claim_date_${uname}`, todayDateStr);
    
    addNotification(`Daily Claim berhasil! Anda mendapatkan ${randomPts} Poin.`, 'reward');
    recordSystemLog('daily_claim', `User @${uname} mengklaim ${randomPts} poin dari Daily Claim harian.`, uname);
    showToast(`Selamat! Anda mendapatkan ${randomPts} Poin dari Daily Claim.`, 'success');
}

document.addEventListener('DOMContentLoaded', () => {
    checkVipExpiration();
    checkBanExpiration();
    checkAuthState();
    checkAdminLockState();
    renderNotifications();
    renderBroadcastBanner();
    updateSubCategories();
    addCustomLinkRow(); 
    ensureToastContainerExists();

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
   SISTEM TOAST NOTIFIKASI MELAYANG
   ======================================================== */
function ensureToastContainerExists() {
    if (!document.getElementById('toast-container-hub')) {
        let container = document.createElement('div');
        container.id = 'toast-container-hub';
        container.className = "fixed bottom-5 right-5 z-[99999] flex flex-col gap-3 pointer-events-none";
        document.body.appendChild(container);
    }
}

function showToast(message, type = 'success') {
    ensureToastContainerExists();
    const container = document.getElementById('toast-container-hub');
    const toastId = Date.now();
    
    let bgCol = 'bg-slate-900/95 border-cyan-500/40 text-cyan-400';
    let iconClass = 'fa-circle-check text-cyan-400';
    if (type === 'error') { bgCol = 'bg-slate-900/95 border-rose-500/40 text-rose-400'; iconClass = 'fa-circle-exclamation text-rose-400'; }
    if (type === 'warning') { bgCol = 'bg-slate-900/95 border-amber-500/40 text-amber-400'; iconClass = 'fa-triangle-exclamation text-amber-400'; }

    let toastEl = document.createElement('div');
    toastEl.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border ${bgCol} shadow-2xl backdrop-blur-xl text-xs font-bold animate-fadeIn transition-all duration-300 translate-y-2`;
    toastEl.id = `toast-${toastId}`;
    toastEl.innerHTML = `<i class="fa-solid ${iconClass} text-base"></i> <span class="text-slate-200">${message}</span>`;
    
    container.appendChild(toastEl);

    setTimeout(() => {
        toastEl.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toastEl.remove(), 300);
    }, 3200);
}

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
            <div class="flex items-center justify-between bg-slate-900/80 backdrop-blur-md p-3 rounded-2xl border border-slate-800 text-xs shadow-md transition-all hover:border-cyan-500/40">
                <span class="text-slate-200 font-semibold flex items-center gap-2"><i class="fa-solid fa-folder-open text-cyan-400"></i> ${sub}</span>
                <button onclick="removeSubCategory('Script Mobile Legends', ${idx})" class="text-rose-400 hover:text-rose-300 p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 transition-all"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
    });

    (categoryConfig["Script Free Fire"] || []).forEach((sub, idx) => {
        ffList.innerHTML += `
            <div class="flex items-center justify-between bg-slate-900/80 backdrop-blur-md p-3 rounded-2xl border border-slate-800 text-xs shadow-md transition-all hover:border-amber-500/40">
                <span class="text-slate-200 font-semibold flex items-center gap-2"><i class="fa-solid fa-folder-open text-amber-400"></i> ${sub}</span>
                <button onclick="removeSubCategory('Script Free Fire', ${idx})" class="text-rose-400 hover:text-rose-300 p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 transition-all"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
    });
}

function addNewSubCategory(mainCat) {
    let inputId = mainCat === 'Script Mobile Legends' ? 'new-ml-sub-input' : 'new-ff-sub-input';
    let val = document.getElementById(inputId).value.trim();
    if (!val) {
        showToast('Nama sub-kategori tidak boleh kosong!', 'warning');
        return;
    }
    if (!categoryConfig[mainCat]) categoryConfig[mainCat] = [];
    if (categoryConfig[mainCat].includes(val)) {
        showToast('Sub-kategori sudah ada!', 'warning');
        return;
    }
    categoryConfig[mainCat].push(val);
    localStorage.setItem('frh_category_config', JSON.stringify(categoryConfig));
    document.getElementById(inputId).value = '';
    renderAdminCategoriesConfig();
    updateSubCategories();
    showToast('Sub-kategori berhasil ditambahkan!', 'success');
}

function removeSubCategory(mainCat, idx) {
    if (confirm('Hapus sub-kategori ini?')) {
        categoryConfig[mainCat].splice(idx, 1);
        localStorage.setItem('frh_category_config', JSON.stringify(categoryConfig));
        renderAdminCategoriesConfig();
        updateSubCategories();
        showToast('Sub-kategori dihapus.', 'success');
    }
}

/* ========================================================
   POIN 3: MANAJEMEN TAUTAN DENGAN NAMA & TIPE (FREE / VVIP)
   ======================================================== */
function addCustomLinkRow(nameVal = 'Link Iklan (Free)', urlVal = '', typeVal = 'free') {
    const container = document.getElementById('dynamic-links-container');
    if (!container) return;
    const rowId = Date.now() + Math.random();

    let div = document.createElement('div');
    div.className = "flex flex-col sm:flex-row items-center gap-3 bg-slate-900/80 backdrop-blur-md p-3.5 rounded-2xl border border-slate-800 shadow-lg animate-fadeIn";
    div.id = `link-row-${rowId}`;
    div.innerHTML = `
        <input type="text" placeholder="Nama Link (Cth: VVIP Server 1)..." value="${nameVal}" class="w-full sm:w-44 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-cyan-500 link-name-input text-cyan-400 font-bold shadow-inner" required>
        <select class="link-type-select bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-cyan-500 text-slate-200 font-semibold cursor-pointer">
            <option value="free" ${typeVal === 'free' ? 'selected' : ''}>Free (Dengan Iklan)</option>
            <option value="vvip" ${typeVal === 'vvip' ? 'selected' : ''}>VVIP (Tanpa Iklan)</option>
        </select>
        <input type="url" placeholder="https://..." value="${urlVal}" class="flex-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-cyan-500 link-url-input shadow-inner text-slate-200" required>
        <button type="button" onclick="document.getElementById('link-row-${rowId}').remove()" class="px-3 py-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-slate-950 rounded-xl transition-all text-xs cursor-pointer shadow-md"><i class="fa-solid fa-trash"></i></button>
    `;
    container.appendChild(div);
}

function checkVipExpiration() {
    let now = Date.now();
    let updated = false;
    for (let uname in userVipSubscriptions) {
        let expireTime = userVipSubscriptions[uname];
        if (typeof expireTime === 'number' && now > expireTime) {
            delete userVipSubscriptions[uname];
            updated = true;
            addNotification(`Masa aktif VVIP 1 bulan Anda telah otomatis berakhir.`, 'reward');
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
        text: `🤖 [Gudang Script Mobile Legends & Free Fire]\n${text}`,
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
    showToast('Konfigurasi Bot Telegram berhasil disimpan!', 'success');
    sendTelegramNotification('✅ Bot Telegram berhasil dihubungkan ke pusat logs dan livechat.');
}

function handleSaveBroadcast(e) {
    e.preventDefault();
    const title = document.getElementById('bc-title').value.trim();
    const content = document.getElementById('bc-content').value.trim();
    currentBroadcast = { title, content };
    localStorage.setItem('frh_broadcast', JSON.stringify(currentBroadcast));
    showToast('Broadcast berhasil disimpan dan aktif di dashboard user!', 'success');
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
        <div class="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-500/30 rounded-2xl p-4 shadow-xl space-y-2 backdrop-blur-md animate-fadeIn">
            <div class="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <i class="fa-solid fa-bullhorn animate-bounce"></i> ${currentBroadcast.title}
            </div>
            <div class="overflow-hidden relative bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 shadow-inner">
                <div class="animate-marquee text-xs text-slate-200 font-semibold flex items-center gap-2">
                    <i class="fa-solid fa-bolt text-cyan-400"></i> ${currentBroadcast.content}
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
        showToast('Semua pusat logs berhasil direset.', 'success');
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

/* ========================================================
   POIN 2: HANYA NOTIFIKASI SCRIPT TERBARU, QUEST TERBARU, REWARD TERBARU
   ======================================================== */
function addNotification(text, type = 'script') {
    const allowedTypes = ['script', 'quest', 'reward'];
    if (!allowedTypes.includes(type)) return;

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
        list.innerHTML = `<p class="text-[11px] text-slate-500 text-center py-2"><i class="fa-regular fa-bell-slash"></i> Tidak ada notifikasi.</p>`;
        return;
    }

    notifications.forEach(n => {
        let borderColor = 'border-cyan-500/30';
        let iconCol = 'text-cyan-400 fa-gamepad';
        if (n.type === 'quest') { borderColor = 'border-emerald-500/30'; iconCol = 'text-emerald-400 fa-flag-checkered'; }
        if (n.type === 'reward') { borderColor = 'border-amber-500/30'; iconCol = 'text-amber-400 fa-gift'; }

        list.innerHTML += `
            <div class="bg-slate-950/90 backdrop-blur-md p-3 rounded-2xl border ${borderColor} text-xs space-y-1 shadow-md transition-all hover:scale-[1.01] ${n.read ? 'opacity-60' : ''}">
                <p class="text-slate-300 flex items-start gap-2"><i class="fa-solid ${iconCol} mt-0.5"></i> <span>${n.text}</span></p>
                <span class="text-[9px] text-slate-500 block text-right"><i class="fa-regular fa-clock"></i> Baru saja</span>
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
        addNotification(`Selamat! Akun Anda naik ke Level ${uData.level}!`, 'reward');
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
        document.getElementById('tab-login').className = "flex-1 py-3 text-xs font-bold rounded-xl transition-all text-cyan-400 bg-slate-800/90 shadow-lg cursor-pointer flex items-center justify-center gap-2";
        document.getElementById('tab-reg').className = "flex-1 py-3 text-xs font-semibold rounded-xl transition-all text-slate-400 hover:text-slate-200 cursor-pointer flex items-center justify-center gap-2";
    } else {
        document.getElementById('form-login-unified').classList.add('hidden');
        document.getElementById('form-reg-unified').classList.remove('hidden');
        document.getElementById('tab-reg').className = "flex-1 py-3 text-xs font-bold rounded-xl transition-all text-cyan-400 bg-slate-800/90 shadow-lg cursor-pointer flex items-center justify-center gap-2";
        document.getElementById('tab-login').className = "flex-1 py-3 text-xs font-semibold rounded-xl transition-all text-slate-400 cursor-pointer flex items-center justify-center gap-2";
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
            showToast(`PIN Super Admin Salah! Percobaan gagal: ${adminFailedAttempts}/3`, 'error');
            checkAdminLockState();
            return;
        }
    } else {
        let users = JSON.parse(localStorage.getItem('frh_users')) || [];
        const validUser = users.find(u => u.username === uVal && u.password === pVal);
        
        if (userBans[uVal]) {
            let banUntil = userBans[uVal];
            if (banUntil === 'permanent' || Date.now() < banUntil) {
                showToast('Akun Anda sedang diblokir oleh Administrator.', 'error');
                return;
            }
        }

        if (!validUser && uVal !== 'user') {
            showToast('Username atau Password salah!', 'error');
            return;
        }
        currentUser = { username: uVal, role: 'user' };
        logUserAction(uVal, 'Masuk ke sistem');
        recordSystemLog('akun_login', `User @${uVal} berhasil masuk ke akun.`, uVal);

        if (!userLoginHistory[uVal]) userLoginHistory[uVal] = [];
        userLoginHistory[uVal].unshift({ time: new Date().toLocaleString('id-ID'), status: 'Berhasil Masuk' });
        if (userLoginHistory[uVal].length > 15) userLoginHistory[uVal].pop();
        localStorage.setItem('frh_user_login_history', JSON.stringify(userLoginHistory));
    }
    localStorage.setItem('frh_current_user', JSON.stringify(currentUser));
    checkAuthState();
}

function resetAdminSessionTimer() {
    if (adminSessionTimer) clearTimeout(adminSessionTimer);
    adminSessionTimer = setTimeout(() => {
        showToast('Sesi Super Admin telah berakhir karena tidak ada aktivitas selama 15 menit.', 'warning');
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
        showToast('Username sudah terdaftar!', 'warning');
        return;
    }
    users.push({ username, password });
    localStorage.setItem('frh_users', JSON.stringify(users));
    recordSystemLog('daftar_baru', `Akun baru terdaftar dengan username @${username}.`, username);
    showToast('Registrasi berhasil! Silakan masuk.', 'success');
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
    showToast('Request script berhasil diajukan ke admin!', 'success');
    sendTelegramNotification(`<b>[NEW REQUEST SCRIPT]</b>\nUser: @${currentUser.username}\nJudul: ${title}\nDesc: ${desc}`);
}

function renderCommunityRequests() {
    const list = document.getElementById('user-requests-list');
    if (!list) return;
    list.innerHTML = '';
    
    let reports = brokenReports;
    if (reports.length === 0) {
        list.innerHTML = `<p class="text-xs text-slate-500 text-center py-4"><i class="fa-solid fa-circle-check text-emerald-400"></i> Belum ada laporan link rusak.</p>`;
        return;
    }
    reports.forEach((rep, idx) => {
        list.innerHTML += `
            <div class="bg-slate-950/80 backdrop-blur-md p-4 rounded-2xl border border-rose-500/30 flex justify-between items-center text-xs shadow-lg transition-all hover:border-rose-500/60">
                <div>
                    <span class="font-bold text-rose-400 text-sm block flex items-center gap-2"><i class="fa-solid fa-triangle-exclamation"></i> Script: ${rep.resName}</span>
                    <span class="text-[10px] text-slate-400 mt-1 inline-block"><i class="fa-solid fa-user"></i> Dilaporkan oleh user: @${rep.user}</span>
                </div>
                ${currentUser.role === 'admin' ? `<button onclick="resolveBrokenReport(${idx})" class="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl cursor-pointer shadow-md transition-all hover:scale-105 flex items-center gap-1.5"><i class="fa-solid fa-check text-emerald-400"></i> Selesaikan</button>` : ''}
            </div>
        `;
    });
}

function resolveBrokenReport(idx) {
    brokenReports.splice(idx, 1);
    localStorage.setItem('frh_broken_reports', JSON.stringify(brokenReports));
    renderCommunityRequests();
    showToast('Laporan link rusak diselesaikan.', 'success');
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
        let badgeColor = 'text-slate-300 bg-slate-900 border-slate-800';
        if (idx === 0) { rankBadge = '👑 #1'; badgeColor = 'text-amber-300 bg-amber-500/10 border-amber-500/30 font-extrabold shadow-lg shadow-amber-500/10 animate-pulse'; }
        if (idx === 1) { rankBadge = '🥈 #2'; badgeColor = 'text-slate-200 bg-slate-800 border-slate-700 font-bold'; }
        if (idx === 2) { rankBadge = '🥉 #3'; badgeColor = 'text-amber-600 bg-amber-900/20 border-amber-800/40 font-bold'; }

        list.innerHTML += `
            <div class="bg-slate-950/80 backdrop-blur-md p-4 rounded-2xl border ${badgeColor} flex items-center justify-between text-xs shadow-lg transition-all hover:scale-[1.01]">
                <div class="flex items-center gap-3">
                    <span class="w-12 text-center py-1 rounded-xl bg-slate-900 border border-slate-800 font-bold ${rankBadge.includes('👑') ? 'text-amber-400' : 'text-cyan-400'}">${rankBadge}</span>
                    <span class="font-bold text-white flex items-center gap-2"><i class="fa-solid fa-user-circle text-cyan-400"></i> ${r.username}</span>
                </div>
                <div class="text-cyan-400 font-extrabold flex items-center gap-1"><i class="fa-solid fa-coins text-amber-400"></i> ${r.points} Pts</div>
            </div>
        `;
    });
}

function switchAdminTab(type) {
    ['upload', 'manage', 'categories', 'users', 'broadcast', 'telegram', 'logs', 'livechat', 'rewards', 'requests', 'analytics', 'backup', 'settings'].forEach(t => {
        const sec = document.getElementById(`admin-${t}-section`);
        const btn = document.getElementById(`btn-tab-${t}`);
        if(sec) sec.classList.add('hidden');
        if(btn) btn.className = "px-4 py-2.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-2xl transition-all cursor-pointer shadow-md border border-slate-800/80 flex items-center gap-2";
    });
    const targetSec = document.getElementById(`admin-${type}-section`);
    const targetBtn = document.getElementById(`btn-tab-${type}`);
    if(targetSec) targetSec.classList.remove('hidden');
    if(targetBtn) targetBtn.className = "px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold text-xs rounded-2xl transition-all shadow-xl shadow-amber-500/20 cursor-pointer flex items-center gap-2 scale-105";
    
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
        list.innerHTML = `<p class="text-xs text-slate-500 text-center py-4">Belum ada user terdaftar.</p>`;
        return;
    }
    users.forEach((u) => {
        let isVip = userVipSubscriptions[u.username] && Date.now() < userVipSubscriptions[u.username];
        let unlockedArr = userUnlockedPosts[u.username] || [];
        let uPts = userPoints[u.username] || 0;
        let isBanned = userBans[u.username];

        let postCheckboxes = resources.map(res => {
            let isUnlocked = unlockedArr.includes(res.id);
            return `<label class="flex items-center gap-1.5 text-[10px] text-slate-300 bg-slate-900/80 p-2 rounded-xl border border-slate-800"><input type="checkbox" ${isUnlocked ? 'checked' : ''} onchange="toggleAdminUserPostAccess('${u.username}', ${res.id})" class="accent-cyan-500 rounded"> <span class="truncate">${res.name}</span></label>`;
        }).join('');

        list.innerHTML += `
            <div class="bg-slate-950/90 backdrop-blur-md p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl transition-all hover:border-slate-700">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <span class="font-extrabold text-white text-sm block flex items-center gap-2"><i class="fa-solid fa-user-shield text-cyan-400"></i> ${u.username} ${isBanned ? '<span class="text-rose-500 font-bold bg-rose-500/10 px-2 py-0.5 rounded-lg text-[10px]">Diblokir</span>' : ''}</span>
                        <span class="text-[11px] text-slate-400 mt-1 block">Poin: <span class="text-amber-400 font-extrabold">${uPts} Pts</span> | VVIP: <span class="${isVip ? 'text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-lg text-[10px]' : 'text-slate-400'}">${isVip ? 'Aktif' : 'Non-VVIP'}</span></span>
                    </div>
                    <div class="flex flex-wrap gap-2 items-center">
                        <button onclick="adminAddPoints('${u.username}')" class="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-bold rounded-xl cursor-pointer transition-all shadow-md flex items-center gap-1"><i class="fa-solid fa-plus"></i> Poin</button>
                        <button onclick="adminSubPoints('${u.username}')" class="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-bold rounded-xl cursor-pointer transition-all shadow-md flex items-center gap-1"><i class="fa-solid fa-minus"></i> Poin</button>
                        <button onclick="toggleVipSubscription('${u.username}')" class="px-3 py-1.5 ${isVip ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-amber-400'} font-bold rounded-xl cursor-pointer transition-all shadow-md flex items-center gap-1"><i class="fa-solid fa-crown"></i> ${isVip ? 'Cabut VVIP' : 'Beri VVIP'}</button>
                        <button onclick="adminResetUser('${u.username}')" class="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 font-bold rounded-xl cursor-pointer transition-all shadow-md flex items-center gap-1"><i class="fa-solid fa-rotate-right"></i> Reset</button>
                        <button onclick="adminDeleteUser('${u.username}')" class="px-3 py-1.5 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold rounded-xl cursor-pointer transition-all shadow-md flex items-center gap-1"><i class="fa-solid fa-trash"></i> Hapus</button>
                    </div>
                </div>
                <div class="flex flex-wrap gap-2 items-center pt-3 border-t border-slate-900">
                    <span class="text-[11px] font-bold text-slate-400 flex items-center gap-1"><i class="fa-solid fa-ban text-rose-400"></i> Blokir:</span>
                    <button onclick="adminBanUser('${u.username}', 7)" class="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-[10px] cursor-pointer border border-slate-800 transition-all">7 Hari</button>
                    <button onclick="adminBanUser('${u.username}', 12)" class="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-[10px] cursor-pointer border border-slate-800 transition-all">12 Hari</button>
                    <button onclick="adminBanUser('${u.username}', 120)" class="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-[10px] cursor-pointer border border-slate-800 transition-all">120 Hari</button>
                    <button onclick="adminBanUser('${u.username}', 9999)" class="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-[10px] cursor-pointer border border-slate-800 transition-all">9999 Hari</button>
                    <button onclick="adminBanUser('${u.username}', 'permanent')" class="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-xl text-[10px] cursor-pointer border border-rose-500/30 transition-all font-bold">Permanen</button>
                    <button onclick="adminUnbanUser('${u.username}')" class="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-xl text-[10px] cursor-pointer border border-emerald-500/30 transition-all font-bold"><i class="fa-solid fa-unlock"></i> Buka Blokir</button>
                </div>
                <div class="border-t border-slate-900 pt-3">
                    <span class="text-[11px] font-bold text-cyan-400 block mb-2 flex items-center gap-1.5"><i class="fa-solid fa-key"></i> Akses Postingan Khusus:</span>
                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">${postCheckboxes || '<span class="text-slate-500 text-[10px]">Belum ada post</span>'}</div>
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
        showToast(`Berhasil menambahkan ${amt} poin ke @${uname}`, 'success');
    }
}

function adminSubPoints(uname) {
    let amt = prompt(`Masukkan jumlah poin yang ingin dikurangi untuk @${uname}:`, "10");
    if (amt && !isNaN(amt)) {
        userPoints[uname] = Math.max(0, (userPoints[uname] || 0) - parseInt(amt));
        localStorage.setItem('frh_user_points', JSON.stringify(userPoints));
        renderAdminUsersList();
        showToast(`Berhasil mengurangi ${amt} poin dari @${uname}`, 'success');
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
        showToast(`Akun @${uname} berhasil direset.`, 'success');
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
        showToast(`Akun @${uname} berhasil dihapus.`, 'success');
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
    showToast(`Akun @${uname} berhasil diblokir.`, 'warning');
}

function adminUnbanUser(uname) {
    delete userBans[uname];
    localStorage.setItem('frh_user_bans', JSON.stringify(userBans));
    renderAdminUsersList();
    showToast(`Blokir untuk akun @${uname} dibuka.`, 'success');
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
    showToast(`Akses postingan untuk @${username} diperbarui.`, 'success');
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
    showToast(`Status VVIP untuk @${username} berhasil diperbarui.`, 'success');
}

function filterLogsCategory(cat) {
    currentLogFilter = cat;
    ['all', 'naik_level', 'redeem_point', 'selesai_quest'].forEach(c => {
        const btn = document.getElementById(`log-btn-${c}`);
        if(btn) {
            btn.className = c === cat 
                ? "px-3.5 py-1.5 bg-cyan-500 text-slate-950 font-bold rounded-xl cursor-pointer shadow-md transition-all"
                : "px-3.5 py-1.5 bg-slate-900 text-slate-300 hover:bg-slate-800 rounded-xl cursor-pointer border border-slate-800 transition-all";
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
        list.innerHTML = `<p class="text-xs text-slate-500 text-center py-4"><i class="fa-solid fa-list-check"></i> Belum ada logs.</p>`;
        return;
    }

    filtered.forEach(lg => {
        list.innerHTML += `
            <div class="bg-slate-950/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-800 space-y-1.5 shadow-md">
                <div class="flex justify-between items-center text-[10px]">
                    <span class="px-2.5 py-0.5 rounded-lg border font-extrabold uppercase text-cyan-400 bg-cyan-500/10 border-cyan-500/20"><i class="fa-solid fa-terminal"></i> ${lg.type}</span>
                    <span class="text-slate-500 flex items-center gap-1"><i class="fa-regular fa-clock"></i> ${lg.time}</span>
                </div>
                <p class="text-slate-200 text-xs">${lg.detail} <span class="text-cyan-400 font-bold">(@${lg.user})</span></p>
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
            <div onclick="selectActiveChatUser('${u.username}')" class="p-3 rounded-2xl cursor-pointer text-xs font-semibold flex justify-between items-center transition-all ${isSel ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20 scale-102' : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'}">
                <span class="flex items-center gap-2"><i class="fa-solid fa-user"></i> ${u.username}</span>
                <i class="fa-solid fa-chevron-right text-[10px]"></i>
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
    header.innerHTML = `<i class="fa-solid fa-comments text-cyan-400"></i> Chat Real-Time dengan: @${activeChatUser}`;
    box.innerHTML = '';
    let msgs = liveChatConversations[activeChatUser] || [];
    if (msgs.length === 0) {
        box.innerHTML = `<p class="text-slate-500 text-center py-6">Belum ada pesan.</p>`;
        return;
    }
    msgs.forEach(m => {
        let isMe = m.sender === 'superadmin';
        box.innerHTML += `
            <div class="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800/80 space-y-1.5 shadow-md ${isMe ? 'border-cyan-500/30 bg-cyan-950/20' : ''}">
                <div class="flex justify-between text-[10px] text-slate-400">
                    <span class="font-bold text-cyan-400 flex items-center gap-1"><i class="fa-solid fa-user-circle"></i> ${m.sender}</span>
                    <span class="flex items-center gap-1"><i class="fa-regular fa-clock"></i> ${m.time}</span>
                </div>
                <p class="text-slate-200 text-xs">${m.text}</p>
                ${m.img ? `<img src="${m.img}" class="max-h-36 rounded-xl mt-1.5 border border-slate-800 shadow-lg">` : ''}
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
        showToast('Sesi chat diakhiri.', 'success');
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
        box.innerHTML = `<p class="text-slate-500 text-center py-6"><i class="fa-regular fa-comment-dots text-2xl mb-2 block text-cyan-400"></i> Mulai chat dengan admin...</p>`;
        return;
    }
    msgs.forEach(m => {
        let isMe = m.sender === currentUser.username;
        box.innerHTML += `
            <div class="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800/80 space-y-1.5 shadow-md ${isMe ? 'border-cyan-500/30 bg-cyan-950/20' : ''}">
                <div class="flex justify-between text-[10px] text-slate-400">
                    <span class="font-bold text-cyan-400 flex items-center gap-1"><i class="fa-solid fa-user-circle"></i> ${m.sender}</span>
                    <span class="flex items-center gap-1"><i class="fa-regular fa-clock"></i> ${m.time}</span>
                </div>
                <p class="text-slate-200 text-xs">${m.text}</p>
                ${m.img ? `<img src="${m.img}" class="max-h-36 rounded-xl mt-1.5 border border-slate-800 shadow-lg">` : ''}
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
        showToast('Live chat diakhiri.', 'success');
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
            <div class="bg-slate-950/90 backdrop-blur-md p-4 rounded-2xl border border-slate-800 flex justify-between items-center text-xs shadow-lg">
                <div>
                    <span class="font-extrabold text-white text-sm block flex items-center gap-2"><i class="fa-solid fa-gift text-amber-400"></i> ${rew.name}</span>
                    <span class="text-amber-400 font-bold block mt-1 flex items-center gap-1"><i class="fa-solid fa-coins"></i> ${rew.cost} Poin | Tipe: ${rew.type} | Max/User: ${rew.limitPerUser || 1} | Kuota: ${rew.claimedCount || 0}/${rew.quota || 100}</span>
                </div>
                <button onclick="deleteReward(${idx})" class="px-3.5 py-2 bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-slate-950 font-bold rounded-xl cursor-pointer transition-all shadow-md flex items-center gap-1.5"><i class="fa-solid fa-trash"></i> Hapus</button>
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
    addNotification(`Reward baru ditambahkan: ${name}`, 'reward');
    showToast('Reward redeem baru berhasil ditambahkan!', 'success');
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
            <div class="bg-slate-950/90 backdrop-blur-md border border-slate-800 p-5 rounded-2xl flex flex-col justify-between text-xs space-y-4 shadow-xl transition-all hover:border-cyan-500/40">
                <div>
                    <span class="font-extrabold text-white text-sm block flex items-center gap-2"><i class="fa-solid fa-award text-amber-400"></i> ${rew.name}</span>
                    <span class="text-amber-400 font-extrabold mt-2 inline-block flex items-center gap-1.5"><i class="fa-solid fa-coins"></i> ${rew.cost} Poin</span>
                    <span class="text-[10px] text-slate-400 block mt-1"><i class="fa-solid fa-chart-pie"></i> Limit/User: ${userClaimedCount}/${limit} | Kuota: ${claimedTotal}/${quotaMax}</span>
                </div>
                <button onclick="initRedeemReward(${rew.id})" ${isDisabled ? 'disabled' : ''} class="w-full py-3 ${isDisabled ? 'bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800' : 'bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-950 font-extrabold shadow-lg shadow-cyan-500/20'} rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"><i class="fa-solid ${isDisabled ? 'fa-lock' : 'fa-gift'}"></i> ${btnText}</button>
            </div>
        `;
    });
}

function initRedeemReward(id) {
    let rew = redeemRewards.find(r => r.id === id);
    let uname = currentUser.username;
    let myPts = userPoints[uname] || 0;

    if (myPts < rew.cost) {
        showToast('Poin Anda tidak mencukupi.', 'warning');
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
        list.innerHTML = `<p class="text-xs text-slate-500 text-center py-6"><i class="fa-solid fa-folder-open text-2xl mb-2 block text-cyan-400"></i> Tidak ada script khusus.</p>`;
        return;
    }

    specialResources.forEach(res => {
        let isAlreadyUnlocked = unlockedArr.includes(res.id);
        let btnHtml = isAlreadyUnlocked 
            ? `<span class="text-emerald-400 font-bold text-[11px] bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20"><i class="fa-solid fa-check"></i> Sudah Dibuka</span>`
            : `<button onclick="confirmRedeemPostAccess(${res.id}, '${rew.name}', ${rew.cost}, ${rew.id})" class="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold rounded-xl cursor-pointer shadow-md transition-all flex items-center gap-1.5"><i class="fa-solid fa-unlock"></i> Pilih & Buka</button>`;

        list.innerHTML += `
            <div class="bg-slate-950/90 backdrop-blur-md p-4 rounded-2xl border border-slate-800 flex justify-between items-center text-xs shadow-lg">
                <div>
                    <span class="font-extrabold text-white text-sm block flex items-center gap-2"><i class="fa-solid fa-shield-halved text-cyan-400"></i> ${res.name}</span>
                    <span class="text-[10px] text-amber-400 font-bold mt-1 inline-block flex items-center gap-1"><i class="fa-solid fa-key"></i> Akses Khusus (${res.version || 'v1.0'})</span>
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
    showToast('Akses postingan khusus berhasil dibuka!', 'success');
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

    if (!userRedeemLogHistory[uname]) userRedeemLogHistory[uname] = [];
    userRedeemLogHistory[uname].unshift({ name: rew.name, cost: rew.cost, time: new Date().toLocaleString('id-ID') });
    if (userRedeemLogHistory[uname].length > 15) userRedeemLogHistory[uname].pop();
    localStorage.setItem('frh_user_redeem_log_history', JSON.stringify(userRedeemLogHistory));

    showToast(`Berhasil menukar "${rew.name}"!`, 'success');
    renderProfilePage();
}

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
        let tSelect = row.querySelector('.link-type-select');
        let uInput = row.querySelector('.link-url-input');
        if (nInput && uInput && nInput.value && uInput.value) {
            links.push({ 
                name: nInput.value.trim(), 
                type: tSelect ? tSelect.value : 'free', 
                url: uInput.value.trim() 
            });
        }
    });

    if (links.length === 0) {
        showToast('Harap masukkan setidaknya 1 tautan unduhan secara manual.', 'warning');
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
        showToast('Script berhasil diperbarui!', 'success');
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
        addNotification(`Script baru dirilis: ${name}`, 'script');
        showToast('Script berhasil dipublikasikan!', 'success');
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
    document.getElementById('up-type-upload').value = res.typeUpload || 'link';
    document.getElementById('up-version').value = res.version || 'v1.0';
    document.getElementById('up-link-size').value = res.fileSize;
    document.getElementById('up-screenshot').value = res.screenshot || '';
    document.getElementById('up-desc').value = res.description;
    document.getElementById('up-verified').checked = res.verified || false;
    document.getElementById('up-special-access').checked = res.isSpecialAccess || false;

    const container = document.getElementById('dynamic-links-container');
    container.innerHTML = '';
    if (res.links && res.links.length > 0) {
        res.links.forEach(l => addCustomLinkRow(l.name, l.url, l.type || 'free'));
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
        let deletedRes = resources.find(r => r.id === pendingDeleteId);
        let deletedResName = deletedRes ? deletedRes.name : null;

        resources = resources.filter(r => r.id !== pendingDeleteId);
        localStorage.setItem('frh_resources', JSON.stringify(resources));

        if (deletedResName) {
            for (let uname in userViewHistory) {
                userViewHistory[uname] = userViewHistory[uname].filter(name => name !== deletedResName);
            }
            localStorage.setItem('frh_user_view_history', JSON.stringify(userViewHistory));
        }

        renderAdminManageList();
        closeCustomConfirm();
        showToast('Script berhasil dihapus & dibersihkan dari riwayat user.', 'success');
    }
}

function closeCustomConfirm() {
    document.getElementById('custom-confirm-modal').classList.add('hidden');
    pendingDeleteId = null;
}

function renderAdminManageList() {
    const list = document.getElementById('admin-manage-list');
    if (!list) return;
    list.innerHTML = '';
    if (resources.length === 0) {
        list.innerHTML = `<p class="text-xs text-slate-500 col-span-full text-center py-6"><i class="fa-solid fa-folder-open text-2xl mb-2 block text-cyan-400"></i> Belum ada script.</p>`;
        return;
    }
    resources.forEach(res => {
        list.innerHTML += `
            <div class="bg-slate-950/90 backdrop-blur-md border border-slate-800 p-5 rounded-2xl flex flex-col justify-between text-xs space-y-4 shadow-xl transition-all hover:border-cyan-500/40">
                <div>
                    <span class="font-extrabold text-white text-sm block flex items-center gap-2"><i class="fa-solid fa-gamepad text-cyan-400"></i> ${res.name} (${res.version || 'v1.0'})</span>
                    <span class="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 font-bold inline-block mt-2"><i class="fa-solid fa-folder"></i> ${res.category} (${res.subcategory})</span>
                    ${res.isSpecialAccess ? '<span class="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-400 font-extrabold inline-block ml-1.5 border border-amber-500/30"><i class="fa-solid fa-key"></i> Khusus</span>' : ''}
                </div>
                <div class="flex items-center justify-between pt-3 border-t border-slate-900">
                    <label class="flex items-center gap-2 text-[11px] text-amber-400 cursor-pointer font-bold">
                        <input type="checkbox" ${res.isSpecialAccess ? 'checked' : ''} onchange="toggleSpecialAccessFlag(${res.id})" class="accent-amber-500 rounded">
                        <i class="fa-solid fa-lock"></i> Akses Khusus
                    </label>
                    <div class="flex gap-2">
                        <button onclick="editResource(${res.id})" class="px-3.5 py-1.5 bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-slate-950 font-bold rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1"><i class="fa-solid fa-pen-to-square"></i> Edit</button>
                        <button onclick="deleteResource(${res.id})" class="px-3.5 py-1.5 bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-slate-950 font-bold rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1"><i class="fa-solid fa-trash"></i> Hapus</button>
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
        showToast(`Status akses khusus "${res.name}" diubah.`, 'success');
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
    dlAnchor.setAttribute("download", "rapzresource_hub_v18_backup.json");
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    showToast('Backup data berhasil diunduh.', 'success');
}

function handleUpdateAdminCredentials(e) {
    e.preventDefault();
    adminCreds.user = document.getElementById('set-admin-user').value;
    adminCreds.pass = document.getElementById('set-admin-pass').value;
    adminCreds.pin = document.getElementById('set-admin-pin').value;
    localStorage.setItem('frh_admin_creds', JSON.stringify(adminCreds));
    showToast('Kredensial Super Admin diperbarui!', 'success');
}

function renderAdminDashboard() {
    renderAdminManageList();
    renderAdminAnalytics();
    renderAdminUsersList();
    renderAdminCategoriesConfig();
}

function filterMainCategory(cat) {
    currentMainCategory = cat;
    currentSubCategory = 'All';

    ['All', 'Script Mobile Legends', 'Script Free Fire', 'Saved'].forEach(c => {
        let btn = document.getElementById(`main-cat-btn-${c}`) || document.getElementById(`cat-btn-${c}`);
        if(btn) {
            btn.className = c === cat 
                ? "px-4 py-3 rounded-2xl text-xs font-extrabold bg-gradient-to-r from-cyan-500 to-cyan-600 text-slate-950 transition-all cursor-pointer shadow-xl shadow-cyan-500/20 flex items-center gap-2 scale-105"
                : "px-4 py-3 rounded-2xl text-xs font-bold bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800 transition-all cursor-pointer flex items-center gap-2";
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
        <button onclick="filterSubCategory('All')" id="sub-btn-All" class="px-3.5 py-2 rounded-xl text-xs font-bold ${currentSubCategory === 'All' ? 'bg-amber-500 text-slate-950 font-extrabold shadow-lg shadow-amber-500/20' : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'} cursor-pointer transition-all flex items-center gap-1.5"><i class="fa-solid fa-border-all"></i> Semua</button>
    `;

    subs.forEach(sub => {
        let isActive = currentSubCategory === sub;
        wrapper.innerHTML += `
            <button onclick="filterSubCategory('${sub}')" id="sub-btn-${sub}" class="px-3.5 py-2 rounded-xl text-xs font-bold ${isActive ? 'bg-amber-500 text-slate-950 font-extrabold shadow-lg shadow-amber-500/20' : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'} cursor-pointer transition-all flex items-center gap-1.5"><i class="fa-solid fa-folder"></i> ${sub}</button>
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
                ? "px-3.5 py-2 rounded-xl text-xs font-extrabold bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 cursor-pointer transition-all flex items-center gap-1.5"
                : "px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800 cursor-pointer transition-all flex items-center gap-1.5";
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
        box.innerHTML += `<div class="text-[10px] text-cyan-400 px-3 py-1.5 uppercase font-bold tracking-wider"><i class="fa-solid fa-magnifying-glass"></i> Hasil Pencarian</div>`;
        matchedFiles.forEach(f => {
            box.innerHTML += `<div onclick="openDetail(${f.id})" class="px-3 py-2 hover:bg-slate-800/80 rounded-xl text-xs text-slate-200 cursor-pointer flex items-center justify-between transition-all"><span class="font-bold flex items-center gap-2"><i class="fa-solid fa-gamepad text-cyan-400"></i> ${f.name}</span> <span class="text-[10px] text-slate-500">${f.category}</span></div>`;
        });
    }

    if (userRecentSearches.length > 0) {
        box.innerHTML += `<div class="text-[10px] text-slate-500 px-3 py-1.5 uppercase font-bold tracking-wider border-t border-slate-800 mt-1 flex justify-between items-center"><span><i class="fa-solid fa-clock-rotate-left"></i> Pencarian Terakhir</span></div>`;
        userRecentSearches.forEach((term, index) => {
            box.innerHTML += `<div class="px-3 py-2 hover:bg-slate-800/80 rounded-xl text-xs text-slate-300 flex items-center justify-between transition-all"><span onclick="selectRecentSearch('${term}')" class="cursor-pointer flex-1 flex items-center gap-2"><i class="fa-solid fa-history text-slate-500"></i> ${term}</span><button onclick="removeSearchItem(event, ${index})" class="text-rose-400 hover:text-rose-300 p-1"><i class="fa-solid fa-xmark"></i></button></div>`;
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

function computeLevenshteinDistance(a, b) {
    let matrix = [];
    for (let i = 0; i <= b.length; i++) { matrix[i] = [i]; }
    for (let j = 0; j <= a.length; j++) { matrix[0][j] = j; }
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) == a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
            }
        }
    }
    return matrix[b.length][a.length];
}

function fuzzyMatch(query, text) {
    let q = query.toLowerCase().trim();
    let t = text.toLowerCase().trim();
    if (t.includes(q)) return true;
    let words = t.split(' ');
    for (let w of words) {
        if (w.length > 2 && q.length > 2) {
            let distance = computeLevenshteinDistance(q, w);
            if (distance <= 2) return true;
        }
    }
    return false;
}

function renderResources() {
    const grid = document.getElementById('resource-grid');
    if (!grid) return;

    grid.innerHTML = `
        <div class="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 animate-pulse space-y-4">
            <div class="flex justify-between items-center"><div class="w-10 h-10 bg-slate-800 rounded-2xl"></div><div class="w-16 h-6 bg-slate-800 rounded-xl"></div></div>
            <div class="w-3/4 h-5 bg-slate-800 rounded-lg"></div>
            <div class="w-full h-10 bg-slate-800 rounded-lg"></div>
        </div>
        <div class="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 animate-pulse space-y-4">
            <div class="flex justify-between items-center"><div class="w-10 h-10 bg-slate-800 rounded-2xl"></div><div class="w-16 h-6 bg-slate-800 rounded-xl"></div></div>
            <div class="w-3/4 h-5 bg-slate-800 rounded-lg"></div>
            <div class="w-full h-10 bg-slate-800 rounded-lg"></div>
        </div>
    `;

    setTimeout(() => {
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

            let matchSearch = searchKeyword === '' || fuzzyMatch(searchKeyword, res.name) || fuzzyMatch(searchKeyword, res.description);
            return matchCat && matchSearch;
        });

        if (sortBy === 'popular') filtered.sort((a, b) => b.likes - a.likes);
        if (sortBy === 'views') filtered.sort((a, b) => b.views - a.views);
        if (sortBy === 'rating') filtered.sort((a, b) => parseFloat(calculateAverageRating(b)) - parseFloat(calculateAverageRating(a)));
        if (sortBy === 'size') filtered.sort((a, b) => parseFileSize(a.fileSize) - parseFileSize(b.fileSize));

        if (filtered.length === 0) {
            grid.innerHTML = `<div class="col-span-full py-20 text-center text-slate-500 bg-slate-900/40 rounded-3xl border border-slate-800/80 backdrop-blur-md"><i class="fa-regular fa-folder-open text-5xl mb-3 text-cyan-400 animate-pulse"></i><p class="text-sm font-bold text-slate-300">Tidak ada script yang ditemukan.</p></div>`;
            return;
        }

        filtered.forEach(res => {
            const isLiked = res.likedBy && res.likedBy.includes(currentUser.username);
            const isSaved = res.savedBy && res.savedBy.includes(currentUser.username);
            const isBroken = brokenReports.some(rep => rep.resName.includes(res.name));

            const iconClass = res.category === 'Script Mobile Legends' ? 'fa-solid fa-shield-halved text-cyan-400' : 'fa-solid fa-fire text-amber-400';
            const avgRating = calculateAverageRating(res);

            grid.innerHTML += `
                <div class="bg-gradient-to-b from-slate-900/90 to-slate-950/90 backdrop-blur-xl border ${isBroken ? 'border-rose-500/50' : 'border-slate-800/80'} rounded-3xl p-5 flex flex-col justify-between hover:border-cyan-500/50 transition-all duration-300 shadow-xl group hover:-translate-y-1">
                    <div>
                        <div class="flex items-center justify-between mb-4">
                            <div class="flex items-center gap-2.5">
                                <div class="w-11 h-11 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-lg shadow-inner ${iconClass} group-hover:scale-110 transition-transform"></div>
                                <span class="text-[10px] font-extrabold px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 shadow-sm">${res.version || 'v1.0'}</span>
                            </div>
                            <div class="flex items-center gap-1.5 flex-wrap justify-end">
                                ${res.isSpecialAccess ? '<span class="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20 shadow-sm flex items-center gap-1"><i class="fa-solid fa-key"></i> Khusus</span>' : ''}
                                ${isBroken ? '<span class="text-[10px] text-rose-400 font-bold bg-rose-500/10 px-2.5 py-1 rounded-xl border border-rose-500/20">Rusak</span>' : ''}
                                <span class="text-[11px] text-amber-400 font-extrabold bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20 flex items-center gap-1 shadow-sm"><i class="fa-solid fa-star"></i> ${avgRating}</span>
                            </div>
                        </div>
                        <span class="text-[10px] uppercase font-bold text-slate-500 block mb-1.5 tracking-wider"><i class="fa-solid fa-tag"></i> ${res.category} • ${res.subcategory}</span>
                        <h3 onclick="openDetail(${res.id})" class="font-extrabold text-base text-white group-hover:text-cyan-400 transition-colors cursor-pointer line-clamp-1">${res.name}</h3>
                        <p class="text-xs text-slate-300 mt-2.5 line-clamp-2 leading-relaxed">${res.description}</p>
                    </div>
                    
                    <div class="pt-4 mt-5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
                        <div class="flex items-center gap-4">
                            <button onclick="toggleLike(${res.id})" class="flex items-center gap-1.5 hover:text-rose-400 transition-colors cursor-pointer ${isLiked ? 'text-rose-500 font-bold' : ''}">
                                <i class="${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart text-sm"></i> <span>${res.likes || 0}</span>
                            </button>
                            <span class="flex items-center gap-1.5" title="Jumlah Dilihat"><i class="fa-solid fa-eye text-cyan-400"></i> ${res.views || 0}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <button onclick="toggleSave(${res.id})" class="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all cursor-pointer shadow-md ${isSaved ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' : 'text-slate-300'}" title="Simpan">
                                <i class="${isSaved ? 'fa-solid' : 'fa-regular'} fa-bookmark text-sm"></i>
                            </button>
                            <button onclick="openDetail(${res.id})" class="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-950 font-extrabold rounded-xl transition-all shadow-lg shadow-cyan-500/20 cursor-pointer flex items-center gap-1.5"><i class="fa-solid fa-circle-info"></i> Detail</button>
                        </div>
                    </div>
                </div>
            `;
        });
    }, 250);
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
        showToast('Batal menyukai script.', 'warning');
    } else {
        res.likedBy.push(currentUser.username);
        res.likes += 1;
        addPoints(currentUser.username, 2);
        addExpAndLevelProgress(currentUser.username);
        logUserAction(currentUser.username, `Menyukai script: ${res.name}`);
        recordSystemLog('like_post', `User @${currentUser.username} menyukai script "${res.name}".`, currentUser.username);
        showToast('Berhasil menyukai script (+2 Poin).', 'success');
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
        showToast('Script dihapus dari daftar tersimpan.', 'warning');
    } else {
        res.savedBy.push(currentUser.username);
        showToast('Script berhasil disimpan!', 'success');
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
   POIN 1: PEMBERSIHAN DETAIL (Tanpa Salin & Lapor Global)
   ======================================================== */
function openDetail(id, openModalWindow = true) {
    const res = resources.find(r => r.id === id);
    if (!res) return;

    if (res.isSpecialAccess && currentUser && currentUser.role !== 'admin') {
        let unlockedArr = userUnlockedPosts[currentUser.username] || [];
        let isVip = userVipSubscriptions[currentUser.username] && Date.now() < userVipSubscriptions[currentUser.username];
        if (!unlockedArr.includes(res.id) && !isVip) {
            showToast('Akses Ditolak! Postingan ini khusus VVIP.', 'error');
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

    const isBroken = brokenReports.some(rep => rep.resName.includes(res.name));
    const alertBox = document.getElementById('modal-broken-alert');
    if (alertBox) {
        if (isBroken) alertBox.classList.remove('hidden');
        else alertBox.classList.add('hidden');
    }

    const dynamicLinksList = document.getElementById('modal-dynamic-links-list');
    dynamicLinksList.innerHTML = '';

    if (res.links && res.links.length > 0) {
        res.links.forEach((l) => {
            let isVipLink = l.type === 'vvip' || l.name.toLowerCase().includes('vvip') || l.name.toLowerCase().includes('tanpa iklan');
            let canAccess = !isVipLink || checkUserHasCleanLinkAccess(res);

            let btnBg = isVipLink ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20' : 'bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-950 shadow-cyan-500/20';
            let iconType = isVipLink ? 'fa-shield-halved' : 'fa-cloud-arrow-down';

            let actionButtonHtml = '';
            if (canAccess) {
                actionButtonHtml = `
                    <a href="${l.url}" target="_blank" onclick="recordDownload(event, '${l.name}')" class="w-full py-3.5 ${btnBg} font-extrabold rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer text-xs">
                        <i class="fa-solid ${iconType} text-sm"></i> ${l.name} (${res.fileSize || 'Files'})
                    </a>
                `;
            } else {
                actionButtonHtml = `
                    <button onclick="showToast('Akses Ditolak! Tautan VVIP memerlukan VVIP aktif.', 'warning'); switchMainView('profile'); closeModal();" class="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-400 font-extrabold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer text-xs border border-slate-800 shadow-md">
                        <i class="fa-solid fa-lock text-amber-400 text-sm"></i> ${l.name} [VVIP Diperlukan]
                    </button>
                `;
            }

            dynamicLinksList.innerHTML += `
                <div class="space-y-2 bg-slate-950/80 backdrop-blur-md p-3.5 rounded-3xl border border-slate-800/90 shadow-xl">
                    ${actionButtonHtml}
                    <div class="flex items-center gap-2 pt-1">
                        <button onclick="copySpecificLink('${encodeURIComponent(l.url)}', '${l.name}')" class="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-800 shadow-md">
                            <i class="fa-regular fa-copy text-cyan-400"></i> Salin Link
                        </button>
                        <button onclick="reportSpecificLink('${res.name}', '${l.name}')" class="py-2 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-rose-500/20 shadow-md" title="Laporkan link rusak">
                            <i class="fa-solid fa-triangle-exclamation"></i> Lapor Rusak
                        </button>
                    </div>
                </div>
            `;
        });
    } else {
        dynamicLinksList.innerHTML = `<p class="text-xs text-slate-500 text-center py-4"><i class="fa-solid fa-link-slash"></i> Tidak ada tautan tersedia.</p>`;
    }

    const iconDiv = document.getElementById('modal-file-icon');
    if (iconDiv) iconDiv.innerHTML = `<i class="${res.category === 'Script Mobile Legends' ? 'fa-solid fa-shield-halved text-cyan-400' : 'fa-solid fa-fire text-amber-400'}"></i>`;

    let hasRated = res.ratedUsers && res.ratedUsers[currentUser.username];
    const ratingSectionBox = document.getElementById('btn-submit-rating')?.parentElement?.parentElement;
    if (hasRated && ratingSectionBox) {
        ratingSectionBox.innerHTML = `<div class="bg-slate-950 p-4 rounded-2xl text-center text-xs text-emerald-400 font-extrabold shadow-lg flex items-center justify-center gap-2"><i class="fa-solid fa-circle-check"></i> Anda sudah memberikan ulasan & rating.</div>`;
    }

    const reviewList = document.getElementById('review-list');
    if (reviewList) {
        document.getElementById('review-count').textContent = res.reviews ? res.reviews.length : 0;
        reviewList.innerHTML = '';
        if (!res.reviews || res.reviews.length === 0) {
            reviewList.innerHTML = `<p class="text-xs text-slate-500 text-center py-4">Belum ada ulasan.</p>`;
        } else {
            res.reviews.forEach(rv => {
                reviewList.innerHTML += `<div class="bg-slate-950 p-3.5 rounded-2xl text-xs space-y-1"><span class="font-extrabold text-cyan-400">${rv.user}</span><p class="text-slate-300">${rv.text}</p></div>`;
            });
        }
    }

    const commentList = document.getElementById('comment-list');
    if (commentList) {
        document.getElementById('comment-count').textContent = res.comments ? res.comments.length : 0;
        commentList.innerHTML = '';
        if (!res.comments || res.comments.length === 0) {
            commentList.innerHTML = `<p class="text-xs text-slate-500 text-center py-4">Belum ada komentar.</p>`;
        } else {
            res.comments.forEach(c => {
                commentList.innerHTML += `<div class="bg-slate-950 p-3.5 rounded-2xl text-xs space-y-1"><span class="font-extrabold text-cyan-400">${c.user}</span><p class="text-slate-300">${c.text}</p></div>`;
            });
        }
    }
}

function copySpecificLink(encodedUrl, linkName) {
    let decodedUrl = decodeURIComponent(encodedUrl);
    navigator.clipboard.writeText(decodedUrl).then(() => {
        showToast(`Tautan "${linkName}" berhasil disalin!`, 'success');
    });
}

function reportSpecificLink(resName, linkName) {
    if (!currentUser) {
        showToast('Silakan login terlebih dahulu.', 'warning');
        return;
    }
    let reportText = `${resName} (${linkName})`;
    if (!brokenReports.some(rep => rep.resName === reportText && rep.user === currentUser.username)) {
        brokenReports.push({ resName: reportText, user: currentUser.username });
        localStorage.setItem('frh_broken_reports', JSON.stringify(brokenReports));
        addNotification(`Laporan link rusak untuk ${reportText} dikirim.`, 'quest');
        addPoints(currentUser.username, 5);
        showToast(`Laporan link rusak untuk "${linkName}" diteruskan (+5 Poin).`, 'success');
        renderResources();
    } else {
        showToast('Anda sudah melaporkan tautan ini sebelumnya.', 'warning');
    }
}

function selectRatingStar(star) {
    currentSelectedStar = star;
    const ratingTextEl = document.getElementById('rating-selected-text');
    if (ratingTextEl) ratingTextEl.textContent = `${star} Bintang Dipilih`;
    document.querySelectorAll('#star-container button').forEach((btn, idx) => {
        btn.className = (idx + 1) <= star ? "text-amber-400 cursor-pointer scale-110" : "text-slate-600 hover:text-amber-400 cursor-pointer";
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
        showToast('Anda sudah memberikan rating.', 'warning');
        return;
    }

    const reviewInput = document.getElementById('review-input');
    const reviewText = reviewInput ? reviewInput.value.trim() : '';
    
    res.ratedUsers[currentUser.username] = currentSelectedStar;
    res.ratings[currentSelectedStar] = (res.ratings[currentSelectedStar] || 0) + 1;
    res.reviews.unshift({ user: currentUser.username, rating: currentSelectedStar, text: reviewText });

    addPoints(currentUser.username, 10);
    addExpAndLevelProgress(currentUser.username); 
    localStorage.setItem('frh_resources', JSON.stringify(resources));
    
    showToast('Ulasan & rating berhasil dikirim (+10 Poin & EXP).', 'success');
    if (reviewInput) reviewInput.value = '';
    openDetail(activeResourceId, false);
    renderResources();
}

function recordDownload(e, linkName) {
    if (!currentUser) {
        e.preventDefault();
        showToast('Anda wajib login sebelum mengunduh.', 'warning');
        document.getElementById('auth-modal').classList.remove('hidden');
        return;
    }
    addPoints(currentUser.username, 5);
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
    addExpAndLevelProgress(currentUser.username); 
    localStorage.setItem('frh_resources', JSON.stringify(resources));
    input.value = '';
    showToast('Komentar berhasil dikirim (+5 Poin & EXP).', 'success');
    openDetail(activeResourceId, false);
}

function togglePasswordForm() {
    document.getElementById('profile-password-box').classList.toggle('hidden');
}

function handleChangeUserPassword(e) {
    e.preventDefault();
    const newPass = document.getElementById('new-user-pass').value;
    let users = JSON.parse(localStorage.getItem('frh_users')) || [];
    let userObj = users.find(u => u.username === currentUser.username);
    if (userObj) {
        userObj.password = newPass;
        localStorage.setItem('frh_users', JSON.stringify(users));
        showToast('Password berhasil diubah!', 'success');
        document.getElementById('new-user-pass').value = '';
        togglePasswordForm();
    }
}

/* ========================================================
   POIN 4: VALIDASI KETAT PADA QUEST MANUAL
   ======================================================== */
const profileQuestsDefinition = [
    { id: 'q1', title: 'Sukai 1 Script', reward: 10, target: 1, type: 'like' },
    { id: 'q2', title: 'Sukai 3 Script', reward: 25, target: 3, type: 'like' },
    { id: 'q6', title: 'Rating Bintang 5 untuk 1 Script', reward: 15, target: 1, type: 'rate5' },
    { id: 'q11', title: 'Kirim 1 Komentar', reward: 10, target: 1, type: 'comment' },
    { id: 'q16', title: 'Lihat 5 Script Berbeda', reward: 15, target: 5, type: 'view' }
];

function checkQuestRealProgress(type) {
    let uname = currentUser.username;
    if (type === 'like') {
        return resources.filter(r => r.likedBy && r.likedBy.includes(uname)).length;
    }
    if (type === 'rate5') {
        return resources.filter(r => r.ratedUsers && r.ratedUsers[uname] === 5).length;
    }
    if (type === 'comment') {
        let count = 0;
        resources.forEach(r => {
            if (r.comments && r.comments.some(c => c.user === uname)) count++;
        });
        return count;
    }
    if (type === 'view') {
        return (userViewHistory[uname] || []).length;
    }
    return 0;
}

function claimProfileQuest(questId, target, type, reward) {
    let uname = currentUser.username;
    if (!userQuestClaims[uname]) userQuestClaims[uname] = {};
    if (userQuestClaims[uname][questId]) {
        showToast('Quest sudah diklaim!', 'warning');
        return;
    }

    let currentProgress = checkQuestRealProgress(type);
    
    // Validasi Ketat Sesuai Instruksi
    if (currentProgress < target) {
        showToast(`Validasi Gagal: Syarat quest belum terpenuhi (${currentProgress}/${target}).`, 'error');
        return;
    }

    userQuestClaims[uname][questId] = true;
    localStorage.setItem('frh_user_quest_claims', JSON.stringify(userQuestClaims));
    addPoints(uname, reward);
    addExpAndLevelProgress(uname, 25); 

    if (!userQuestHistory[uname]) userQuestHistory[uname] = [];
    let qDef = profileQuestsDefinition.find(q => q.id === questId);
    userQuestHistory[uname].unshift({ title: qDef ? qDef.title : questId, reward, time: new Date().toLocaleString('id-ID') });
    localStorage.setItem('frh_user_quest_history', JSON.stringify(userQuestHistory));

    addNotification(`Quest "${qDef ? qDef.title : questId}" berhasil diselesaikan!`, 'quest');
    showToast(`Quest selesai! +${reward} Poin & EXP didapatkan.`, 'success');
    renderProfilePage();
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
                btnHtml = `<span class="text-emerald-400 font-extrabold text-[11px] bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20"><i class="fa-solid fa-check"></i> Selesai</span>`;
            } else if (canClaim) {
                btnHtml = `<button onclick="claimProfileQuest('${q.id}', ${q.target}, '${q.type}', ${q.reward})" class="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 font-extrabold rounded-xl cursor-pointer shadow-lg"><i class="fa-solid fa-gift"></i> Klaim (+${q.reward})</button>`;
            } else {
                btnHtml = `<span class="text-slate-500 text-[10px] bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800">Progress: ${currentProg}/${q.target}</span>`;
            }

            questList.innerHTML += `
                <div class="bg-slate-950/90 backdrop-blur-md border border-slate-800 p-4 rounded-2xl flex items-center justify-between text-xs shadow-lg">
                    <div>
                        <span class="font-extrabold text-white block text-sm">${q.title}</span>
                        <span class="text-amber-400 text-[10px] font-bold mt-1 inline-block">Hadiah: +${q.reward} Poin</span>
                    </div>
                    <div>${btnHtml}</div>
                </div>
            `;
        });
    }
    renderUserRedeemRewardsList();
}
