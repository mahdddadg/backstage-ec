const services = Array.from(document.querySelectorAll(".choice-card"));
const specialists = Array.from(document.querySelectorAll(".pill-button"));
const timeSlotsContainer = document.querySelector("#time-slots");
const bookingForm = document.querySelector("#booking-form");
const bookingDate = document.querySelector("#booking-date");
const guestName = document.querySelector("#guest-name");
const guestPhone = document.querySelector("#guest-phone");
const guestEmail = document.querySelector("#guest-email");
const guestNotes = document.querySelector("#guest-notes");
const visitType = document.querySelector("#visit-type");
const formFeedback = document.querySelector("#form-feedback");

const summaryService = document.querySelector("#summary-service");
const summaryDuration = document.querySelector("#summary-duration");
const summaryDate = document.querySelector("#summary-date");
const summaryTime = document.querySelector("#summary-time");
const summarySpecialist = document.querySelector("#summary-specialist");
const summaryVisit = document.querySelector("#summary-visit");
const summaryPrice = document.querySelector("#summary-price");
const summaryDescription = document.querySelector("#summary-description");
const summaryNotes = document.querySelector("#summary-notes");
const summaryStatus = document.querySelector("#summary-status");
const calendarLink = document.querySelector("#calendar-link");
const copySummaryButton = document.querySelector("#copy-summary");

const modal = document.querySelector("#reservation-modal");
const modalMessage = document.querySelector("#modal-message");
const confirmationCode = document.querySelector("#confirmation-code");
const closeModalButton = document.querySelector("#close-modal");
const modalCalendarLink = document.querySelector("#modal-calendar-link");
const modalCopyButton = document.querySelector("#modal-copy");

const slots = ["10:00", "11:30", "13:00", "15:00", "17:30", "19:00"];

let selectedService = services[0];
let selectedSpecialist = specialists[0];
let selectedTime = slots[0];

function toDateInputValue(date) {
  const offset = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offset).toISOString().split("T")[0];
}

function setDefaultDate() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  bookingDate.min = toDateInputValue(now);
  bookingDate.value = toDateInputValue(tomorrow);
}

function renderTimeSlots() {
  timeSlotsContainer.innerHTML = "";

  slots.forEach((slot) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `time-chip${slot === selectedTime ? " is-selected" : ""}`;
    button.textContent = slot;
    button.setAttribute("aria-pressed", String(slot === selectedTime));

    button.addEventListener("click", () => {
      selectedTime = slot;
      renderTimeSlots();
      updateSummary();
    });

    timeSlotsContainer.appendChild(button);
  });
}

function formatDate(dateString) {
  if (!dateString) {
    return "Selecciona una fecha";
  }

  const date = new Date(`${dateString}T12:00:00`);
  return new Intl.DateTimeFormat("es-EC", {
    weekday: "long",
    day: "numeric",
    month: "long"
  }).format(date);
}

function getActiveServiceData() {
  return {
    service: selectedService.dataset.service,
    duration: selectedService.dataset.duration,
    price: selectedService.dataset.price,
    description: selectedService.dataset.description
  };
}

function getSummaryText() {
  const data = getActiveServiceData();
  const name = guestName.value.trim() || "Cliente";
  const phone = guestPhone.value.trim() || "Sin teléfono";
  const email = guestEmail.value.trim() || "Sin correo";
  const notes = guestNotes.value.trim() || "Sin notas adicionales";

  return [
    "Backstage Salon and Spa",
    `Servicio: ${data.service}`,
    `Fecha: ${formatDate(bookingDate.value)}`,
    `Hora: ${selectedTime}`,
    `Duración: ${data.duration}`,
    `Especialista: ${selectedSpecialist.dataset.specialist}`,
    `Cliente: ${name}`,
    `WhatsApp/Teléfono: ${phone}`,
    `Correo: ${email}`,
    `Tipo de visita: ${visitType.value}`,
    "Dirección: Av. Malecón, 130804, Manta, Ecuador",
    `Notas: ${notes}`
  ].join("\n");
}

function buildCalendarLink() {
  const data = getActiveServiceData();

  if (!bookingDate.value || !selectedTime) {
    return "#";
  }

  const [year, month, day] = bookingDate.value.split("-").map(Number);
  const [hour, minute] = selectedTime.split(":").map(Number);
  const start = new Date(year, month - 1, day, hour, minute);
  const durationMinutes = Number.parseInt(data.duration, 10) || 60;
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

  const formatCalendarDate = (value) => {
    const datePart = [
      value.getFullYear(),
      String(value.getMonth() + 1).padStart(2, "0"),
      String(value.getDate()).padStart(2, "0")
    ].join("");

    const timePart = [
      String(value.getHours()).padStart(2, "0"),
      String(value.getMinutes()).padStart(2, "0"),
      "00"
    ].join("");

    return `${datePart}T${timePart}`;
  };

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${data.service} - Backstage Salon and Spa`,
    details: getSummaryText(),
    location: "Av. Malecón, 130804, Manta, Ecuador",
    dates: `${formatCalendarDate(start)}/${formatCalendarDate(end)}`,
    ctz: "America/Guayaquil"
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function updateStatus() {
  const missingName = guestName.value.trim().length === 0;
  const missingPhone = guestPhone.value.trim().length === 0;

  if (missingName && missingPhone) {
    summaryStatus.textContent = "Selecciona tus preferencias y agrega tus datos para preparar la solicitud.";
    return;
  }

  if (missingName || missingPhone) {
    summaryStatus.textContent = "Ya casi está lista: completa tus datos para generar la reserva.";
    return;
  }

  summaryStatus.textContent = "Todo listo para preparar una solicitud elegante y compartirla al instante.";
}

function updateSummary() {
  const data = getActiveServiceData();

  summaryService.textContent = data.service;
  summaryDuration.textContent = data.duration;
  summaryDate.textContent = formatDate(bookingDate.value);
  summaryTime.textContent = selectedTime;
  summarySpecialist.textContent = selectedSpecialist.dataset.specialist;
  summaryVisit.textContent = visitType.value;
  summaryPrice.textContent = `Desde $${data.price}`;
  summaryDescription.textContent = data.description;
  summaryNotes.textContent = guestNotes.value.trim() || "Aún no has agregado preferencias especiales.";
  updateStatus();

  const link = buildCalendarLink();
  calendarLink.href = link;
  modalCalendarLink.href = link;
}

function selectButton(buttons, activeButton, selectedClass) {
  buttons.forEach((button) => {
    const isActive = button === activeButton;
    button.classList.toggle(selectedClass, isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

services.forEach((service) => {
  service.addEventListener("click", () => {
    selectedService = service;
    selectButton(services, selectedService, "is-selected");
    updateSummary();
  });
});

specialists.forEach((specialist) => {
  specialist.addEventListener("click", () => {
    selectedSpecialist = specialist;
    selectButton(specialists, selectedSpecialist, "is-selected");
    updateSummary();
  });
});

[bookingDate, guestName, guestPhone, guestEmail, guestNotes, visitType].forEach((field) => {
  field.addEventListener("input", updateSummary);
  field.addEventListener("change", updateSummary);
});

async function copySummary() {
  const summary = getSummaryText();

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(summary);
    } else {
      const helper = document.createElement("textarea");
      helper.value = summary;
      helper.setAttribute("readonly", "");
      helper.style.position = "fixed";
      helper.style.opacity = "0";
      document.body.appendChild(helper);
      helper.select();
      document.execCommand("copy");
      document.body.removeChild(helper);
    }

    formFeedback.textContent = "Resumen copiado. Ya puedes compartir tu solicitud.";
  } catch (error) {
    formFeedback.textContent = "No se pudo copiar automáticamente. Prueba de nuevo desde otro navegador.";
  }
}

copySummaryButton.addEventListener("click", copySummary);
modalCopyButton.addEventListener("click", copySummary);

function openModal() {
  modal.classList.remove("is-hidden");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  modal.classList.add("is-hidden");
  modal.setAttribute("aria-hidden", "true");
}

closeModalButton.addEventListener("click", closeModal);

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.classList.contains("is-hidden")) {
    closeModal();
  }
});

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!bookingForm.reportValidity()) {
    formFeedback.textContent = "Completa los campos obligatorios para preparar tu reserva.";
    return;
  }

  const code = `BSS-${Math.floor(1000 + Math.random() * 9000)}`;
  confirmationCode.textContent = code;
  modalMessage.textContent = `${guestName.value.trim()}, tu solicitud para ${getActiveServiceData().service} el ${formatDate(
    bookingDate.value
  )} a las ${selectedTime} ya está lista para confirmar.`;
  formFeedback.textContent = "Solicitud preparada. Usa el calendario o copia el resumen para compartirlo.";
  openModal();
});

setDefaultDate();
renderTimeSlots();
updateSummary();
