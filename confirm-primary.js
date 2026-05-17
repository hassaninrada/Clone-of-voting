import { supabase } from "./supabase-init.js";

const gr = localStorage.getItem("primary_gr");

// 🧠 LOAD VOTES (ALL 4 ROLES)
const votes = {
    headboy: localStorage.getItem("vote_headboy") || "ABSTAIN",
    headgirl: localStorage.getItem("vote_headgirl") || "ABSTAIN",
    deputy_headboy: localStorage.getItem("vote_deputyheadboy") || "ABSTAIN",
    deputy_headgirl: localStorage.getItem("vote_deputyheadgirl") || "ABSTAIN"
};

// 🖥️ SHOW ON UI
document.getElementById("hb").textContent = votes.headboy;
document.getElementById("hg").textContent = votes.headgirl;
document.getElementById("dhb").textContent = votes.deputy_headboy;
document.getElementById("dhg").textContent = votes.deputy_headgirl;

// SESSION ID
const sessIdEl = document.getElementById("sessId");
if (sessIdEl) sessIdEl.textContent = `#${gr}`;

// 🚀 FINAL SUBMIT
document.getElementById("finalBtn")?.addEventListener("click", async () => {

    try {

        const isTch = gr && gr.startsWith("TCH");

        // Check already voted
        if (!isTch && gr) {
            const { data } = await supabase
                .from("students")
                .select("voted_primary")
                .eq("cid", gr)
                .single();

            if (data?.voted_primary) {
                alert("Already voted!");
                window.location.href = "index.html";
                return;
            }
        }

        // Submit ALL votes
        for (const role in votes) {

            if (votes[role] !== "ABSTAIN") {

                const { error } = await supabase.rpc("vote_upsert_secure", {
                    p_role: role,
                    p_candidate_name: votes[role],
                    p_voter_id: gr
                });

                if (error) throw error;
            }
        }

        // Mark voted
        if (!isTch && gr) {
            await supabase
                .from("students")
                .update({ voted_primary: true })
                .eq("cid", gr);
        }

        // Clear storage
        localStorage.removeItem("vote_headboy");
        localStorage.removeItem("vote_headgirl");
        localStorage.removeItem("vote_deputyheadboy");
        localStorage.removeItem("vote_deputyheadgirl");

        window.location.href = "success-primary.html";

    } catch (err) {
        console.error(err);
        alert("Voting failed. Try again.");
    }
});
























