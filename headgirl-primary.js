import { supabase } from "./supabase-init.js";

async function loadCandidates() {
    const grid = document.getElementById('candidatesGrid');
    if (!grid) return;
    const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('wing', 'Primary')
        .eq('role', 'headgirl');

    if (error || !data || data.length === 0) {
        grid.innerHTML = '<div class="col-span-full py-20 text-center text-blue-300 font-bold italic">No candidates registered for this category.</div>';
        return;
    }

    grid.innerHTML = '';
    data.forEach((cand) => {
        const card = document.createElement('div');
        card.className = "candidate-card p-8 text-center cursor-pointer group relative overflow-hidden";
        card.innerHTML = `
                <div class="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-bl-[3rem] flex items-center justify-center -mr-2 -mt-2 transition-all group-hover:bg-blue-600">
                  <i class="fa-solid fa-check text-blue-200 text-xl group-hover:text-white"></i>
                </div>
                <!-- Symbol Display -->
                <div class="absolute top-6 left-8 w-10 h-10 opacity-30 group-hover:opacity-100 transition-opacity">
                    <img src="${cand.symbol_url || ''}" class="w-full h-full object-contain">
                </div>
                <div class="w-32 h-32 mx-auto mb-6 relative">
                  <img src="${cand.image_url || 'https://via.placeholder.com/150'}"
                    class="w-full h-full object-cover rounded-full border-4 border-white shadow-xl group-hover:border-blue-500 transition-colors" />
                </div>
                <h3 class="text-xl font-black text-blue-900 mb-1">${cand.name}</h3>
                <p class="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-8">Candidate Identification</p>
                <button
                  class="w-full bg-blue-100/50 text-blue-600 font-black py-4 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all uppercase text-[10px] tracking-widest cursor-pointer touch-manipulation">Lock Voting Choice</button>
            `;

        card.addEventListener('click', () => castVote(cand.name));
        grid.appendChild(card);
    });
}

function castVote(candidate) {
    localStorage.setItem("vote_headgirl", candidate);
    document.body.style.opacity = "0";
    document.body.style.transition = "opacity 0.4s ease";
    setTimeout(() => { window.location.href = "deputyboy-primary.html"; }, 600);
}

loadCandidates();

