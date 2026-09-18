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
