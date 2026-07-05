/* ============================================================
   TrekSense — plan.js  (Trek With Us enquiry page)
   Front-end only: enquiries are kept in localStorage for now.
   ============================================================ */

const $ = sel => document.querySelector(sel);

document.addEventListener("DOMContentLoaded", () => {
  $("#site-header").innerHTML = headerHTML("plan");
  $("#bottom-nav").innerHTML = bottomNavHTML("plan");
  updateThemeIcons();

  /* trek dropdown from the live dataset, pre-selected via ?trek=id */
  const sel = $("#trek-select");
  [...TREKS].sort((a, b) => a.name.localeCompare(b.name)).forEach(t => {
    const o = document.createElement("option");
    o.value = t.id;
    o.textContent = `${t.name} — ${t.state} (${t.difficulty})`;
    sel.appendChild(o);
  });
  const pre = new URLSearchParams(location.search).get("trek");
  if (pre && TREKS.some(t => t.id === pre)) sel.value = pre;

  /* experience chips */
  let experience = "First trek";
  $("#exp-chips").addEventListener("click", e => {
    const b = e.target.closest(".chip");
    if (!b) return;
    document.querySelectorAll("#exp-chips .chip").forEach(c => c.classList.remove("active"));
    b.classList.add("active");
    experience = b.dataset.exp;
  });

  /* submit → store locally + show success (backend comes later) */
  $("#plan-form").addEventListener("submit", e => {
    e.preventDefault();
    const f = e.target;
    if (!f.name.value.trim() || !f.email.value.trim() || !f.trek.value) {
      f.reportValidity();
      return;
    }
    const trek = TREKS.find(t => t.id === f.trek.value);
    const enquiry = {
      at: new Date().toISOString(),
      name: f.name.value.trim(),
      email: f.email.value.trim(),
      phone: f.phone.value.trim(),
      trek: trek.name,
      month: f.month.value || "Flexible",
      group: f.group.value,
      experience,
      message: f.message.value.trim()
    };
    const all = JSON.parse(localStorage.getItem("ts-inquiries") || "[]");
    all.push(enquiry);
    localStorage.setItem("ts-inquiries", JSON.stringify(all));

    $("#ps-summary").innerHTML =
      `Thanks <b>${enquiry.name}</b> — we've logged your enquiry for <b>${enquiry.trek}</b>` +
      `${enquiry.month !== "Flexible" ? ` in <b>${enquiry.month}</b>` : ""} (${enquiry.group}, ${enquiry.experience.toLowerCase()}).`;
    f.classList.add("hide");
    $("#plan-success").classList.remove("hide");
  });

  $("#ps-again").addEventListener("click", () => {
    $("#plan-form").classList.remove("hide");
    $("#plan-form").reset();
    $("#plan-success").classList.add("hide");
  });

  FX.reveal(".plan-hero-text, .plan-form-card, .ps-stat", 80);
});
