import { supabase } from "./supabase-init.js";

// APP STATE
const roleNames = {
    headboy: "Wing Head Boy",
    headgirl: "Wing Head Girl"
};

const resultChartEl = document.getElementById("resultChart");
let ctx;
if (resultChartEl) {
    ctx = resultChartEl.getContext("2d");
}
let chart;

// SIDEBAR TOGGLE
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const icon = document.getElementById('menu-icon');

    if (sidebar && overlay && icon) {
        if (sidebar.classList.contains('-translate-x-full')) {
            sidebar.classList.remove('-translate-x-full');
            overlay.classList.remove('hidden');
            icon.classList.replace('fa-bars', 'fa-xmark');
        } else {
            sidebar.classList.add('-translate-x-full');
            overlay.classList.add('hidden');
            icon.classList.replace('fa-xmark', 'fa-bars');
        }
    }
};

// Global toggle for listeners
document.querySelectorAll('[data-action="toggle-sidebar"]').forEach(btn => {
    btn.addEventListener('click', toggleSidebar);
});

// SECTION NAVIGATION
window.showSection = function (section) {
    // Hide all sections first
    document.querySelectorAll('section').forEach(s => {
        s.classList.add('hidden');
        s.style.display = 'none';
        s.style.visibility = 'hidden';
    });

    // Show target section
    const targetSection = document.getElementById(`section-${section}`);
    if (targetSection) {
        targetSection.classList.remove('hidden');
        targetSection.style.display = 'block';
        targetSection.style.visibility = 'visible';
    }

    // Update nav links
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('state-active'));
    const activeNav = document.getElementById(`nav-${section}`);
    if (activeNav) activeNav.classList.add('state-active');

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });


    if (section === 'insights') updateChart();
    if (section === 'candidates') fetchCandidates();
};

// Bind nav links with proper event handling
document.getElementById('nav-insights')?.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('insights');
});
document.getElementById('nav-candidates')?.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('candidates');
});


// CANDIDATE MANAGEMENT
window.fetchCandidates = async () => {
    const grid = document.getElementById('candidatesGrid');
    if (!grid) return;
    grid.innerHTML = '<div class="col-span-full text-center py-20 opacity-30 italic text-blue-900">Querying Grid...</div>';

    const { data, error } = await supabase.from('candidates').select('*').eq('wing', 'Primary');
    if (error) {
        grid.innerHTML = `<div class="col-span-full border-2 border-dashed border-red-100 p-10 rounded-3xl text-center">
                    <p class="text-red-500 font-black text-xs uppercase mb-4">Database Grid Missing</p>
                    <p class="text-blue-400 text-xs">The 'candidates' table must be created in Supabase to use this feature.</p>
                </div>`;
        return;
    }

    if (data.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center py-20 opacity-30 italic text-blue-900">No candidates registered.</div>';
        return;
    }

    grid.innerHTML = '';
    data.forEach(cand => {
        const div = document.createElement('div');
        div.className = "p-6 bg-white rounded-[2rem] border-2 border-blue-50 flex items-center gap-6 group relative";
        div.innerHTML = `
                    <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white border-2 border-blue-100 shrink-0 shadow-sm">
                        <img src="${cand.image_url || 'https://via.placeholder.com/150'}" class="w-full h-full object-cover">
                    </div>
                    <div class="flex-grow">
                        <p class="text-sm font-black text-blue-900">${cand.name}</p>
                        <p class="text-[9px] font-bold text-blue-300 uppercase tracking-widest mt-1">${roleNames[cand.role] || cand.role}</p>
                    </div>
                    <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center p-2">
                        <img src="${cand.symbol_url || 'https://via.placeholder.com/50'}" class="max-w-full max-h-full opacity-60">
                    </div>
                    <button onclick="deleteCandidate('${cand.id}')" title="Delete Candidate" class="w-10 h-10 bg-red-50 hover:bg-red-500 border-2 border-red-200 text-red-600 hover:text-white rounded-xl flex items-center justify-center transition-all shadow-sm hover:scale-110">
                        <i class="fa-solid fa-trash text-sm"></i>
                    </button>
                `;
        grid.appendChild(div);
    });
};

// Image preview and file handling
function updateImagePreview(type, url) {
    const previewId = type === 'photo' ? 'photoPreview' : 'symbolPreview';
    const preview = document.getElementById(previewId);
    if (preview) {
        if (url) {
            preview.querySelector('img').src = url;
            preview.classList.remove('hidden');
        } else {
            preview.classList.add('hidden');
        }
    }
}

document.getElementById('clearPhotoBtn')?.addEventListener('click', () => {
    const f = document.getElementById('candImageFile');
    const u = document.getElementById('candImage');
    if (f) f.value = '';
    if (u) u.value = '';
    updateImagePreview('photo', null);
});

document.getElementById('clearSymbolBtn')?.addEventListener('click', () => {
    const f = document.getElementById('candSymbolFile');
    const u = document.getElementById('candSymbol');
    if (f) f.value = '';
    if (u) u.value = '';
    updateImagePreview('symbol', null);
});


// File to base64 converter
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Handle file input changes for preview
const candImageFile = document.getElementById('candImageFile');
if (candImageFile) {
    candImageFile.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            const base64 = await fileToBase64(file);
            const candImage = document.getElementById('candImage');
            if (candImage) candImage.value = base64;
            updateImagePreview('photo', base64);
        }
    });
}

const candSymbolFile = document.getElementById('candSymbolFile');
if (candSymbolFile) {
    candSymbolFile.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            const base64 = await fileToBase64(file);
            const candSymbol = document.getElementById('candSymbol');
            if (candSymbol) candSymbol.value = base64;
            updateImagePreview('symbol', base64);
        }
    });
}

// Handle URL input changes for preview
const candImage = document.getElementById('candImage');
if (candImage) {
    candImage.addEventListener('input', (e) => {
        if (e.target.value && !e.target.value.startsWith('data:')) {
            updateImagePreview('photo', e.target.value);
        }
    });
}

const candSymbol = document.getElementById('candSymbol');
if (candSymbol) {
    candSymbol.addEventListener('input', (e) => {
        if (e.target.value && !e.target.value.startsWith('data:')) {
            updateImagePreview('symbol', e.target.value);
        }
    });
}

const candidateForm = document.getElementById('candidateForm');
if (candidateForm) {
    candidateForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        if (btn) {
            btn.disabled = true;
            btn.textContent = "Processing...";
        }

        const payload = {
            name: document.getElementById('candName').value.trim(),
            role: document.getElementById('candRole').value,
            image_url: document.getElementById('candImage').value.trim(),
            symbol_url: document.getElementById('candSymbol').value.trim(),
            wing: 'Primary' // Changed to Primary
        };

        const { error } = await supabase.from('candidates').insert([payload]);
        if (error) {
            showToast(error.message, 'bg-red-500');
        } else {
            e.target.reset();
            const photoPreview = document.getElementById('photoPreview');
            const symbolPreview = document.getElementById('symbolPreview');
            if (photoPreview) photoPreview.classList.add('hidden');
            if (symbolPreview) symbolPreview.classList.add('hidden');
            fetchCandidates();
        }
        if (btn) {
            btn.disabled = false;
            btn.textContent = "Authorize Registration";
        }
    });
}

window.deleteCandidate = async (id) => {
    // Find candidate name for better confirmation message
    const { data: candidate } = await supabase.from('candidates').select('name').eq('id', id).single();
    const candidateName = candidate?.name || 'this candidate';

    if (!confirm(`⚠️ DELETE CANDIDATE\n\nAre you sure you want to permanently remove "${candidateName}" from the ballot?\n\nThis action cannot be undone.`)) return;

    const { error } = await supabase.from('candidates').delete().eq('id', id);
    if (error) {
        showToast('❌ Error: ' + error.message, 'bg-red-500');
    } else {
        showToast('✅ Candidate successfully removed from the system.', 'bg-green-600');
        fetchCandidates();
    }
};

// INSIGHTS & CHARTING
window.updateChart = function () {
    const categorySelect = document.getElementById("categorySelect");
    if (!categorySelect) return;
    const role = categorySelect.value;
    const currentCategoryText = document.getElementById("currentCategoryText");
    if (currentCategoryText) currentCategoryText.textContent = roleNames[role];
    loadData(role);
}

async function loadData(role) {
    const { data, error } = await supabase.from('vote_counts').select('*').eq('role', role);
    if (error) return console.error(error);

    // Fetch total votes
    const { data: allVotes } = await supabase.from('vote_counts').select('count', { count: 'exact' }).in('role', Object.keys(roleNames));
    const total = allVotes ? allVotes.reduce((acc, curr) => acc + curr.count, 0) : 0;
    const totalVotesStat = document.getElementById("totalVotesStat");
    if (totalVotesStat) totalVotesStat.textContent = total;

    const votes = {};
    data.forEach(item => { votes[item.candidate_name] = item.count; });
    renderChart(role, votes);
}

function renderChart(role, votes) {
    if (!ctx) return;
    const names = Object.keys(votes);
    const counts = Object.values(votes);
    const maxVote = Math.max(...counts, 0);

    if (chart) chart.destroy();
    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: names,
            datasets: [{
                label: 'Votes',
                data: counts,
                backgroundColor: counts.map(c => (c === maxVote && c > 0) ? '#1565C0' : '#BBDEFB'),
                borderRadius: 20,
                borderSkipped: false,
                barThickness: 40
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#0D47A1',
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 12 },
                    cornerRadius: 12
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { display: false },
                    ticks: { font: { weight: 'bold' }, stepSize: 1, color: '#0D47A1' }
                },
                x: {
                    grid: { display: false },
                    ticks: { font: { weight: 'bold' }, color: '#0D47A1' }
                }
            }
        }
    });
}

// REALTIME
supabase.channel('dashboard-primary') // Changed to primary
    .on('postgres_changes', { event: '*', schema: 'public', table: 'vote_counts' }, (payload) => {
        const insightsSection = document.getElementById('section-insights');
        if (insightsSection && insightsSection.classList.contains('hidden')) return;
        updateChart();
        logChange(payload);
    })
    .subscribe();

function logChange(payload) {
    const logContainer = document.getElementById("logs");
    if (!logContainer) return;
    const entry = document.createElement("div");
    entry.className = "flex gap-3 items-center fadeIn p-4 bg-white rounded-2xl border-2 border-blue-50";
    entry.innerHTML = `
                <div class="w-1.5 h-1.5 bg-blue-900 rounded-full animate-pulse"></div>
                <div>
                    <p class="text-[10px] font-black text-blue-900 uppercase tracking-tight">${payload.new.candidate_name}</p>
                    <p class="text-[8px] font-bold text-blue-400 uppercase tracking-widest mt-0.5">+1 Vote Secured</p>
                </div>
                <span class="ml-auto text-[8px] font-bold text-blue-200">${new Date().toLocaleTimeString()}</span>
            `;
    if (logContainer.firstElementChild && logContainer.firstElementChild.classList.contains('italic')) logContainer.innerHTML = '';
    logContainer.prepend(entry);
}

// Bind selects
document.getElementById('categorySelect')?.addEventListener('change', updateChart);

document.getElementById("resetAllBtn")?.addEventListener("click", async () => {
    if (confirm("⚠️ CAUTION: Are you sure you want to reset ONLY PRIMARY votes? Secondary wing votes will stay safe.")) {
        try {
            const primaryRoles = ['headboy', 'headgirl', 'deputyboy', 'deputygirl'];
            await supabase.from('vote_counts').delete().in('role', primaryRoles);
            await supabase.from('votes_audit').delete().in('role', primaryRoles);
            await supabase.from('students').update({ voted_primary: false }).eq('wing', 'Primary');
            location.reload();
        } catch (err) { showToast(err.message, 'bg-red-500'); }
    }
});

document.getElementById("exportBtn")?.addEventListener("click", async () => {
    const primaryRoles = ['headboy', 'headgirl', 'deputyboy', 'deputygirl'];
    const { data } = await supabase.from('vote_counts').select('*').in('role', primaryRoles);
    if (!data) return;
    let csv = "Timestamp,Role,Candidate,Total\n";
    data.forEach(r => csv += `"${new Date().toISOString()}","${r.role}","${r.candidate_name}",${r.count}\n`);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'PRIMARY_VOTING_EXPORT.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});

document.getElementById("refreshBtn")?.addEventListener("click", fetchCandidates);

function showToast(msg, bg = 'bg-blue-600') {
    const toast = document.getElementById("toast");
    if (toast) {
        toast.textContent = msg;
        toast.className = `fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-4 rounded-2xl shadow-2xl text-white font-bold text-sm z-50 transition-all ${bg} block fadeIn`;
        setTimeout(() => {
            if (toast) toast.classList.add('hidden');
        }, 4000);
    }
}

window.deleteCandidate = deleteCandidate;

updateChart();
