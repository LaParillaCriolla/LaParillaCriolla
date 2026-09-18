const toggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

toggle?.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    toggle?.setAttribute("aria-expanded", "false");
  });
});

const dateInput = document.querySelector('input[name="date"]');
if (dateInput) {
  dateInput.min = new Date().toISOString().split("T")[0];
}

const ambienceAudio = document.querySelector("#ambience-audio");
const audioToggle = document.querySelector("#audio-toggle");
const audioVolume = document.querySelector("#audio-volume");

if (ambienceAudio && audioToggle && audioVolume) {
  ambienceAudio.volume = Number(audioVolume.value);
  audioToggle.addEventListener("click", async () => {
    if (ambienceAudio.paused) {
      try {
        await ambienceAudio.play();
        audioToggle.querySelector(".audio-icon").textContent = "Ⅱ";
        audioToggle.querySelector(".audio-label").textContent = "Pausar música";
        audioToggle.setAttribute("aria-label", "Pausar música de ambiente");
        audioToggle.setAttribute("aria-pressed", "true");
      } catch (error) {
        console.error("No se pudo reproducir el audio:", error);
      }
    } else {
      ambienceAudio.pause();
      audioToggle.querySelector(".audio-icon").textContent = "▶";
      audioToggle.querySelector(".audio-label").textContent = "Música de ambiente";
      audioToggle.setAttribute("aria-label", "Reproducir música de ambiente");
      audioToggle.setAttribute("aria-pressed", "false");
    }
  });
  audioVolume.addEventListener("input", () => {
    ambienceAudio.volume = Number(audioVolume.value);
  });
}

const SUPABASE_URL = "https://xqrlasrtetugnlkelpip.supabase.co";
const SUPABASE_KEY = "sb_publishable_kJGCMhukSS0V36uAseiPEw_EaWwHqLC";
const reviewsList = document.querySelector("#reviews-list");

const supabaseRequest = async (path, options = {}) => {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  if (!response.ok) {
    throw new Error(`Supabase respondió con ${response.status}`);
  }
  const responseText = await response.text();
  return responseText ? JSON.parse(responseText) : null;
};

const renderReviews = (reviews) => {
  if (!reviewsList) return;
  if (!reviews.length) {
    reviewsList.innerHTML = '<p class="reviews-status">Sé el primero en compartir tu experiencia.</p>';
    return;
  }
  reviewsList.innerHTML = reviews.map((review) => {
    const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
    const date = new Date(review.created_at).toLocaleDateString("es-PR", { year: "numeric", month: "short", day: "numeric" });
    return `<article class="public-review"><div class="public-review-top"><strong>${escapeHtml(review.reviewer_name)}</strong><span class="public-stars">${stars}</span></div><p>${escapeHtml(review.comment)}</p><time datetime="${review.created_at}">${date}</time></article>`;
  }).join("");
};

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
}[character]));

const loadReviews = async () => {
  if (!reviewsList) return;
  try {
    const reviews = await supabaseRequest("reviews?select=reviewer_name,rating,comment,created_at&order=created_at.desc&limit=12");
    renderReviews(reviews);
  } catch (error) {
    reviewsList.innerHTML = '<p class="reviews-status">No pudimos cargar los reviews. Intenta actualizar.</p>';
    console.error("No se pudieron cargar los reviews:", error);
  }
};

document.querySelector("#reservation-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const message = form.querySelector(".form-message");
  const reservation = new FormData(form);
  const name = reservation.get("name");
  const phone = reservation.get("phone");
  const email = reservation.get("email");
  const date = reservation.get("date");
  const time = reservation.get("time");
  const guests = reservation.get("guests");
  const whatsappMessage = [
    "¡Hola, La Parrilla Criolla! Quiero solicitar esta reserva:",
    "",
    `Nombre: ${name}`,
    `Teléfono: ${phone}`,
    `Correo: ${email}`,
    `Fecha: ${date}`,
    `Hora: ${time}`,
    `Personas: ${guests}`,
    "",
    "Por favor, confirmen mi reserva. ¡Gracias!"
  ].join("\n");
  const whatsappUrl = `https://wa.me/17873905343?text=${encodeURIComponent(whatsappMessage)}`;
  message.textContent = "Abriendo WhatsApp con los detalles de tu reserva...";
  window.location.href = whatsappUrl;
});

document.querySelector("#review-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const review = new FormData(form);
  const message = form.querySelector(".form-message");
  const reviewerName = String(review.get("reviewer") || "").trim();
  const comment = String(review.get("comment") || "").trim();
  const rating = Number(String(review.get("rating") || "").split(" ")[0]);
  message.textContent = "Publicando tu review...";
  supabaseRequest("reviews", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ reviewer_name: reviewerName, rating, comment })
  }).then(() => {
    message.textContent = "¡Gracias! Tu review ya está publicado.";
    form.reset();
    document.querySelectorAll(".rating-options label").forEach((label) => label.classList.remove("is-selected"));
    loadReviews();
  }).catch((error) => {
    message.textContent = "No pudimos publicar tu review. Intenta nuevamente.";
    console.error("No se pudo publicar el review:", error);
  });
});

document.querySelectorAll('.rating-options input[name="rating"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    const selectedRating = Number(radio.value.split(" ")[0]);
    document.querySelectorAll(".rating-options label").forEach((label) => {
      const labelRating = Number(label.querySelector("input").value.split(" ")[0]);
      label.classList.toggle("is-selected", labelRating >= selectedRating);
    });
  });
});

document.querySelector(".reviews-refresh")?.addEventListener("click", loadReviews);
loadReviews();
