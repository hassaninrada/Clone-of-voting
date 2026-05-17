import { supabase } from "./supabase-init.js";

const gr = localStorage.getItem("primary_gr");

// ======================
// LOAD VOTES (SAFE)
// ======================
const votes = {
    headboy: localStorage.getItem("vote_headboy") || "ABSTAIN",
    headgirl: localStorage.getItem("vote_headgirl") || "ABSTAIN",
    deputy_headboy: localStorage.getItem("vote_deputyheadboy") || "ABSTAIN",
    deputy_headgirl: localStorage.getItem("vote_deputyheadgirl") || "ABSTAIN"
};

// ======================
// DISPLAY (SAFE UI)
// ======================
document.getElementById("hb") && (document.getElementById("hb").textContent = votes.headboy);
document.getElementById("hg") && (document.getElementById("hg").textContent = votes.headgirl);
document.getElementById("dhb") && (document.getElementById("dhb").textContent = votes.deputy_headboy);
document.getElementById("dhg") && (document.getElementById("dhg").textContent = votes.deputy_headgirl);

// SESSION ID
const sessIdEl = document.getElementById("sessId");
if (sessIdEl && gr) sessIdEl.textContent = `#${gr}`;

// ======================
// FINAL SUBMIT
// ======================
const finalBtn = document.getElementById("finalBtn");

if (finalBtn) {
    finalBtn.addEventListener("click", async () => {

        const loader = document.getElementById("loader");
        finalBtn.disabled = true;

        if (loader) {
            loader.classList.remove("hidden");
            loader.classList.add("flex");
        }

        try {

            const isTch = gr && gr.startsWith("TCH");

            // check already voted
            if (!isTch && gr) {
                const { data, error } = await supabase
                    .from("students")
                    .select("voted_primary")
                    .eq("cid", gr)
                    .single();

                if (error) throw error;

                if (data?.voted_primary) {
                    alert("Already voted!");
                    window.location.href = "index.html";
                    return;
                }
            }

            // ======================
            // SUBMIT ONLY REAL VOTES
            // ======================
            for (const role in votes) {

                const value = votes[role];

                // ignore ABSTAIN
                if (value && value !== "ABSTAIN") {

                    const { error } = await supabase.rpc("vote_upsert_secure", {
                        p_role: role,
                        p_candidate_name: value,
                        p_voter_id: gr || "GUEST"
                    });

                    if (error) throw error;
                }
            }

            // mark student voted
            if (!isTch && gr) {
                const { error } = await supabase
                    .from("students")
                    .update({ voted_primary: true })
                    .eq("cid", gr);

                if (error) throw error;
            }

            // ======================
            // CLEAN STORAGE
            // ======================
            localStorage.removeItem("vote_headboy");
            localStorage.removeItem("vote_headgirl");
            localStorage.removeItem("vote_deputyheadboy");
            localStorage.removeItem("vote_deputyheadgirl");

            setTimeout(() => {
                window.location.href = "success-primary.html";
            }, 800);

        } catch (err) {

            console.error("Voting Error:", err);

            if (loader) {
                loader.classList.add("hidden");
                loader.classList.remove("flex");
            }

            alert("System Error — Try Again");

            finalBtn.disabled = false;
        }
    });
}

// ======================
// RESTART
// ======================
document.getElementById("restartBtn")?.addEventListener("click", () => {

    if (confirm("Discard all selections?")) {

        localStorage.removeItem("vote_headboy");
        localStorage.removeItem("vote_headgirl");
        localStorage.removeItem("vote_deputyheadboy");
        localStorage.removeItem("vote_deputyheadgirl");

        window.location.href = "student-primary.html";
    }
});














