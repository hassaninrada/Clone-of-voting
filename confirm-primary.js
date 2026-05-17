import { supabase } from "./supabase-init.js";

// Get current student GR / CID
const gr = localStorage.getItem("primary_gr");

if (!gr) {
    alert("No active voting session found.");
    window.location.href = "student-primary.html";
}

// Load saved votes
const votes = {
    headboy: localStorage.getItem("vote_headboy") || "ABSTAIN",
    headgirl: localStorage.getItem("vote_headgirl") || "ABSTAIN",
    deputy_headboy: localStorage.getItem("vote_deputyheadboy") || "ABSTAIN",
    deputy_headgirl: localStorage.getItem("vote_deputyheadgirl") || "ABSTAIN",
};

// Show Session ID
const sessIdEl = document.getElementById("sessId");
if (sessIdEl) {
    sessIdEl.textContent = `#${gr}`;
}

// Show selected candidates
const hbEl = document.getElementById("hb");
if (hbEl) hbEl.textContent = votes.headboy;

const hgEl = document.getElementById("hg");
if (hgEl) hgEl.textContent = votes.headgirl;

const dhbEl = document.getElementById("dhb");
if (dhbEl) dhbEl.textContent = votes.deputy_headboy;

const dhgEl = document.getElementById("dhg");
if (dhgEl) dhgEl.textContent = votes.deputy_headgirl;

// Final submit button
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

            // Check if already voted
            const isTch = gr.startsWith("TCH");

            if (!isTch) {
                const { data: studentData, error: studentError } = await supabase
                    .from("students")
                    .select("voted_primary")
                    .eq("cid", gr)
                    .single();

                if (studentError) {
                    throw studentError;
                }

                if (studentData?.voted_primary) {
                    alert("Vote already cast for this ID.");
                    window.location.href = "index.html";
                    return;
                }
            }

            // Submit votes
            for (const role in votes) {

                if (votes[role] !== "ABSTAIN") {

                    const { error } = await supabase.rpc("vote_upsert_secure", {
                        p_role: role,
                        p_candidate_name: votes[role],
                        p_voter_id: gr
                    });

                    if (error) {
                        throw error;
                    }
                }
            }

            // Mark student as voted
            if (!isTch) {

                const { error: updateError } = await supabase
                    .from("students")
                    .update({ voted_primary: true })
                    .eq("cid", gr);

                if (updateError) {
                    throw updateError;
                }
            }

            // Clear local storage
            localStorage.removeItem("vote_headboy");
            localStorage.removeItem("vote_headgirl");
            localStorage.removeItem("vote_deputyheadboy");
            localStorage.removeItem("vote_deputyheadgirl");

            // Redirect
            setTimeout(() => {
                window.location.href = "success-primary.html";
            }, 800);

        } catch (err) {

            console.error("Voting Error:", err);

            if (loader) {
                loader.classList.add("hidden");
                loader.classList.remove("flex");
            }

            showToast("❌ System Failure — Please Retry", "bg-red-500");

            finalBtn.disabled = false;
        }
    });
}

// Restart voting
const restartBtn = document.getElementById("restartBtn");

if (restartBtn) {

    restartBtn.addEventListener("click", () => {

        const confirmReset = confirm("Discard all selections?");

        if (confirmReset) {

            localStorage.removeItem("vote_headboy");
            localStorage.removeItem("vote_headgirl");
            localStorage.removeItem("vote_deputyheadboy");
            localStorage.removeItem("vote_deputyheadgirl");

            window.location.href = "student-primary.html";
        }
    });
}

// Toast Notification
function showToast(msg, bg) {

    const toast = document.getElementById("toast");

    if (toast) {

        toast.textContent = msg;

        toast.className =
            `fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-4 rounded-2xl shadow-2xl text-white font-bold text-sm z-50 transition-all ${bg} block fadeIn`;

        setTimeout(() => {
            toast.classList.add("hidden");
        }, 4000);
    }
}
