// State Aplikasi & Storage Local
let currentUser = JSON.parse(localStorage.getItem('frh_current_user')) || null;
let resources = JSON.parse(localStorage.getItem('frh_resources')) || [
    {
        id: 1,
        name: "Sketchware Pro Mod v6.3",
        category: "Aplikasi",
        subcategory: "Manual",
        description: "Aplikasi Android builder untuk membuat aplikasi secara visual dengan dukungan modifikasi penuh.",
        fileData: "#",
        fileName: "sketchware_pro.apk",
        fileSize: "15.4 MB",
        uploader: "admin",
        likes: 12,
        likedBy: [],
        savedBy: [],
        comments: [
            { user: "Budi", text: "Mantap aplikasinya work 100%!" }
        ]
    },
    {
        id: 2,
        name: "Template UI Kit Dashboard Admin ZIP",
        category: "File",
        subcategory: "Manual",
        description: "Kumpulan aset UI Kit format ZIP berisi file HTML, CSS, dan Tailwind untuk keperluan web development.",
        fileData: "#",
        fileName: "ui_kit_template.zip",
        fileSize: "4.2 MB",
        uploader: "admin",
        likes: 25,
        likedBy: [],
        savedBy: [],
        comments: []
    }
];

let announcements = JSON.parse(localStorage.getItem('frh_announcements')) || [
    { id: 1, title: "Selamat Datang di File Resource Hub!", content: "Silakan download berbagai file dan aplikasi gratis serta aman.", date: "10 Agustus 2026" }
];

let currentFilter = 'All';
let activeResourceId = null;

// Inisialisasi Saat Halaman Dimuat
document.addEventListener('DOMContentLoaded', () => {
    checkAuthState();
    updateSubCategories();
});

// Sistem Auth & Tab Switcher
function switchTab(tabId) {
    ['user-login', 'user-reg', 'admin-login'].forEach(id => {
        document.getElementById(`form-${id}`).classList.add('hidden');
        document.getElementById(`tab-${id}`).classList.remove('text-cyan-400', 'bg-slate-800', 'shadow-sm');
        document.getElementById(`tab-${id}`).classList.add('text-slate-400');
    });

    document.getElementById(`form-${tabId}`).classList.remove('hidden');
    const activeTab = document.getElementById(`tab-${tabId}`);
    activeTab.classList.remove('text-slate-400');
    activeTab.classList.add('text-cyan-400', 'bg-slate-800', 'shadow-sm');
}

function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value;

    let users = JSON.parse(localStorage.getItem('frh_users')) || [];
    if (users.some(u => u.username === username)) {
        alert('Username sudah terdaftar! Gunakan yang lain.');
        return;
    }

    users.push({ username, password });
    localStorage.setItem('frh_users', JSON.stringify(users));
    alert('Registrasi berhasil! Silakan login.');
    switchTab('user-login');
}

function handleLogin(e, role) {
    e.preventDefault();
    if (role === 'admin') {
        const user = document.getElementById('admin-user').value;
        const pass = document.getElementById('admin-pass').value;
        const pin = document.getElementById('admin-pin').value;

        if (user === 'admin' && pass === 'admin123' && pin === '9999') {
            currentUser = { username: 'Administrator', role: 'admin' };
        } else {
            alert('Username, Password, atau PIN Admin salah! (Default PIN: 9999)');
            return;
        }
    } else {
        const inputs = e.target.querySelectorAll('input');
        const username = inputs[0].value.trim();
        const password = inputs[1].value;

        let users = JSON.parse(localStorage.getItem('frh_users')) || [];
        const validUser = users.find(u => u.username === username && u.password === password);

        if (!validUser && username !== 'user') {
            alert('Username atau Password salah! Atau silakan daftar terlebih dahulu.');
            return;
        }
        currentUser = { username: username, role: 'user' };
    }

    localStorage.setItem('frh_current_user', JSON.stringify(currentUser));
    checkAuthState();
}

function logout() {
    localStorage.removeItem('frh_current_user');
    currentUser = null;
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
        document.getElementById('user-role-badge').textContent = currentUser.role === 'admin' ? 'Super Admin' : 'Member User';

        if (currentUser.role === 'admin') {
            document.getElementById('admin-panel').classList.remove('hidden');
            document.getElementById('user-panel').classList.add('hidden');
        } else {
            document.getElementById('admin-panel').classList.add('hidden');
            document.getElementById('user-panel').classList.remove('hidden');
            renderAnnouncements();
            renderResources();
        }
    }
}

// Admin Tab & Subkategori
function switchAdminTab(type) {
    if (type === 'upload') {
        document.getElementById('admin-upload-section').classList.remove('hidden');
        document.getElementById('admin-announcement-section').classList.add('hidden');
        document.getElementById('btn-tab-upload').className = "px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md";
        document.getElementById('btn-tab-announcement').className = "px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all";
    } else {
        document.getElementById('admin-upload-section').classList.add('hidden');
        document.getElementById('admin-announcement-section').classList.remove('hidden');
        document.getElementById('btn-tab-announcement').className = "px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md";
        document.getElementById('btn-tab-upload').className = "px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all";
    }
}

function updateSubCategories() {
    const cat = document.getElementById('up-category').value;
    const subSelect = document.getElementById('up-subcategory');
    subSelect.innerHTML = '';

    let options = cat === 'File' 
        ? ['Manual', 'Dokumentasi', 'Arsip Code', 'Lainnya']
        : ['Manual', 'Pengumuman App', 'Tools', 'Utility'];

    options.forEach(opt => {
        let el = document.createElement('option');
        el.value = opt;
        el.textContent = opt;
        subSelect.appendChild(el);
    });
}

// Admin Actions
function handleUploadFile(e) {
    e.preventDefault();
    const fileInput = document.getElementById('up-file');
    const file = fileInput.files[0];

    const newRes = {
        id: Date.now(),
        name: document.getElementById('up-name').value,
        category: document.getElementById('up-category').value,
        subcategory: document.getElementById('up-subcategory').value,
        description: document.getElementById('up-desc').value,
        fileData: file ? URL.createObjectURL(file) : '#',
        fileName: file ? file.name : 'unknown_file',
        fileSize: file ? (file.size / (1024*1024)).toFixed(2) + ' MB' : '1.0 MB',
        uploader: currentUser.username,
        likes: 0,
        likedBy: [],
        savedBy: [],
        comments: []
    };

    resources.unshift(newRes);
    localStorage.setItem('frh_resources', JSON.stringify(resources));
    alert('File berhasil diupload dan dipublikasikan!');
    e.target.reset();
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
    alert('Pengumuman berhasil disiarkan!');
    e.target.reset();
}

// User Actions & Rendering
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

function filterSaved() {
    filterCategory('Saved');
}

function renderResources() {
    const grid = document.getElementById('resource-grid');
    const searchKeyword = document.getElementById('search-input').value.toLowerCase();
    grid.innerHTML = '';

    let filtered = resources.filter(res => {
        let matchCat = true;
        if (currentFilter === 'File') matchCat = res.category === 'File';
        if (currentFilter === 'Aplikasi') matchCat = res.category === 'Aplikasi';
        if (currentFilter === 'Saved') matchCat = res.savedBy && res.savedBy.includes(currentUser.username);

        let matchSearch = res.name.toLowerCase().includes(searchKeyword) || res.description.toLowerCase().includes(searchKeyword);
        return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full py-16 text-center text-slate-500">
                <i class="fa-regular fa-folder-open text-4xl mb-3"></i>
                <p class="text-sm">Tidak ada resource file atau aplikasi yang ditemukan.</p>
            </div>
        `;
        return;
    }

    filtered.forEach(res => {
        const isLiked = res.likedBy && res.likedBy.includes(currentUser.username);
        const isSaved = res.savedBy && res.savedBy.includes(currentUser.username);
        const iconClass = res.category === 'Aplikasi' ? 'fa-brands fa-android text-emerald-400' : 'fa-solid fa-file-zipper text-cyan-400';

        grid.innerHTML += `
            <div class="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg group">
                <div>
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-lg ${iconClass}"></div>
                        <span class="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300">${res.category} / ${res.subcategory}</span>
                    </div>
                    <h3 onclick="openDetail(${res.id})" class="font-bold text-base text-white group-hover:text-cyan-400 transition-colors cursor-pointer line-clamp-1">${res.name}</h3>
                    <p class="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">${res.description}</p>
                </div>
                
                <div class="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                    <div class="flex items-center gap-3">
                        <button onclick="toggleLike(${res.id})" class="flex items-center gap-1 hover:text-rose-400 transition-colors cursor-pointer ${isLiked ? 'text-rose-500' : ''}">
                            <i class="${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart"></i> <span>${res.likes || 0}</span>
                        </button>
                        <button onclick="openDetail(${res.id})" class="flex items-center gap-1 hover:text-cyan-400 transition-colors cursor-pointer">
                            <i class="fa-regular fa-comment"></i> <span>${res.comments ? res.comments.length : 0}</span>
                        </button>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="toggleSave(${res.id})" class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer ${isSaved ? 'text-amber-400' : 'text-slate-300'}" title="Simpan">
                            <i class="${isSaved ? 'fa-solid' : 'fa-regular'} fa-bookmark"></i>
                        </button>
                        <button onclick="openDetail(${res.id})" class="px-3 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition-all cursor-pointer shadow-sm">
                            Detail & Download
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
}

// Interaksi Fitur (Like, Save, Komentar, Detail)
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
    document.getElementById('modal-badge').textContent = `${res.category} / ${res.subcategory}`;
    document.getElementById('modal-desc').textContent = res.description;
    document.getElementById('modal-file-size').textContent = res.fileSize || '1.0 MB';
    
    const downloadBtn = document.getElementById('modal-download-btn');
    downloadBtn.href = res.fileData;
    downloadBtn.download = res.fileName;

    const iconDiv = document.getElementById('modal-file-icon');
    iconDiv.innerHTML = `<i class="${res.category === 'Aplikasi' ? 'fa-brands fa-android text-emerald-400' : 'fa-solid fa-file-zipper text-cyan-400'}"></i>`;

    // Render Komentar
    const commentList = document.getElementById('comment-list');
    document.getElementById('comment-count').textContent = res.comments ? res.comments.length : 0;
    commentList.innerHTML = '';

    if (!res.comments || res.comments.length === 0) {
        commentList.innerHTML = `<p class="text-xs text-slate-500 text-center py-4">Belum ada komentar. Jadilah yang pertama berkomentar!</p>`;
    } else {
        res.comments.forEach(c => {
            commentList.innerHTML += `
                <div class="bg-slate-950 border border-slate-800/60 p-3 rounded-xl text-xs space-y-1">
                    <span class="font-bold text-cyan-400">${c.user}</span>
                    <p class="text-slate-300">${c.text}</p>
                </div>
            `;
        });
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
    localStorage.setItem('frh_resources', JSON.stringify(resources));
    
    input.value = '';
    openDetail(activeResourceId, false);
    renderResources();
}

