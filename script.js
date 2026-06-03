// Configuración editable.
// Para agregar fotos: coloca tus archivos dentro de /images/ y añade un objeto a galleryImages.
// Para cambiar la música: edita el <source> del audio en index.html.
// Para editar textos: cambia las frases de surpriseMessages, galleryImages o carouselSlides.
const config = {
  age: 20,
  surpriseMessages: [
    "Lesly, tu forma de ser hace que hasta los días simples tengan algo especial.",
    "Que tus 20 te traigan amor bonito, calma en el corazón y sueños que sí se cumplen.",
    "Eres una persona preciosa por dentro y por fuera. Nunca olvides lo mucho que vales.",
    "Ojalá la vida te abrace suavecito y te sorprenda con momentos inolvidables.",
    "Hoy todo celebra tu existencia, Lesly. Brilla sin miedo.",
    "Que cada deseo que guardas en silencio encuentre su camino hacia ti."
  ],
  galleryImages: [
    { src: "images/foto-1.jpeg", caption: "Un recuerdo suave y bonito" },
    { src: "images/foto-2.jpeg", caption: "Un día para guardar en el corazón" },
    { src: "images/foto-3.jpeg", caption: "Sonrisas que se quedan" },
    { src: "images/foto-4.jpeg", caption: "Una noche con magia" },
    { src: "images/recuerdo-5.svg", caption: "Detalles que brillan" },
    { src: "images/recuerdo-6.svg", caption: "Momentos que abrazan" }
  ],
  carouselSlides: [
    {
      src: "images/foto-1.jpg",
      caption: "Por todas las veces que tu sonrisa hizo que el día se sintiera más bonito."
    },
    {
      src: "images/foto-3.jpeg",
      caption: "Por esos momentos sencillos que, contigo, se vuelven recuerdos enormes."
    },
    {
      src: "images/foto-2.jpeg",
      caption: "Por la forma tan especial en la que dejas luz donde pasas."
    },
    {
      src: "images/foto-4.jpeg",
      caption: "Por los momentos que se hacen eternos y la necesidad de para el timepo para que no termine."
    }
  ]
};

const loader = document.getElementById("loader");
const openSurprise = document.getElementById("openSurprise");
const typewriterText = document.getElementById("typewriterText");
const ageCounter = document.getElementById("ageCounter");
const messageButton = document.getElementById("messageButton");
const randomMessage = document.getElementById("randomMessage");
const musicToggle = document.getElementById("musicToggle");
const birthdayMusic = document.getElementById("birthdayMusic");
const customCursor = document.getElementById("customCursor");
const galleryGrid = document.getElementById("galleryGrid");
const photoInput = document.getElementById("photoInput");
const photoCaption = document.getElementById("photoCaption");
const uploadButton = document.getElementById("uploadButton");
const uploadStatus = document.getElementById("uploadStatus");
const carouselTrack = document.getElementById("carouselTrack");
const carouselDots = document.getElementById("carouselDots");
const storyCarousel = document.getElementById("storyCarousel");
const prevPhoto = document.getElementById("prevPhoto");
const nextPhoto = document.getElementById("nextPhoto");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxCaption = document.getElementById("lightboxCaption");
const closeLightbox = document.getElementById("closeLightbox");
const confettiCanvas = document.getElementById("confettiCanvas");
const confettiContext = confettiCanvas.getContext("2d");

let typewriterStarted = false;
let counterStarted = false;
let confettiPieces = [];
let activeSlide = 0;
let carouselTimer;
let touchStartX = 0;
let cloudinarySettings = null;
let uploadedImages = [];
let currentLightboxPhoto = null;

const deleteLightboxPhoto = document.createElement("button");
deleteLightboxPhoto.className = "lightbox-delete";
deleteLightboxPhoto.type = "button";
deleteLightboxPhoto.textContent = "Eliminar foto";
deleteLightboxPhoto.hidden = true;
lightbox.appendChild(deleteLightboxPhoto);

window.addEventListener("load", async () => {
  await initializeOnlineGallery();
  renderGallery();
  renderCarousel();
  setTimeout(() => loader.classList.add("hidden"), 750);
  createHearts();
  startCarouselAutoplay();
});

// Cursor con brillo suave para escritorio.
window.addEventListener("mousemove", (event) => {
  customCursor.style.left = `${event.clientX}px`;
  customCursor.style.top = `${event.clientY}px`;
});

document.querySelectorAll("a, button").forEach((element) => {
  element.addEventListener("mouseenter", () => customCursor.classList.add("active"));
  element.addEventListener("mouseleave", () => customCursor.classList.remove("active"));
});

// Apertura cinematográfica: confeti, corazones y transición hacia la carta.
openSurprise.addEventListener("click", () => {
  launchConfetti(240);
  createHearts(18);
  document.getElementById("carta").scrollIntoView({ behavior: "smooth" });
  setTimeout(startTypewriter, 420);
});

// Música opcional. Si no hay archivo configurado, el botón lo indica sin romper la experiencia.
musicToggle.addEventListener("click", async () => {
  const hasMusic = birthdayMusic.querySelector("source")?.getAttribute("src");
  if (!hasMusic) {
    musicToggle.querySelector(".music-text").textContent = "Agrega música";
    launchConfetti(36);
    return;
  }

  if (birthdayMusic.paused) {
    await birthdayMusic.play();
    musicToggle.querySelector(".music-text").textContent = "Pausar música";
  } else {
    birthdayMusic.pause();
    musicToggle.querySelector(".music-text").textContent = "Reproducir música";
  }
});

// Animaciones al hacer scroll.
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("visible");

    if (entry.target.contains(typewriterText) && !typewriterStarted) {
      startTypewriter();
    }

    if (entry.target.contains(ageCounter) && !counterStarted) {
      startCounter();
    }
  });
}, { threshold: 0.22 });

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

function startTypewriter() {
  if (typewriterStarted) return;
  typewriterStarted = true;

  const message = typewriterText.dataset.message;
  let index = 0;
  typewriterText.textContent = "";

  const timer = setInterval(() => {
    typewriterText.textContent += message[index];
    index += 1;
    if (index >= message.length) clearInterval(timer);
  }, 22);
}

function startCounter() {
  counterStarted = true;
  const duration = 1600;
  const startedAt = performance.now();

  function tick(now) {
    const progress = Math.min((now - startedAt) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    ageCounter.textContent = Math.floor(eased * config.age);

    if (progress < 1) requestAnimationFrame(tick);
    else ageCounter.textContent = config.age;
  }

  requestAnimationFrame(tick);
}

// Galería tipo masonry con lightbox.
function renderGallery() {
  galleryGrid.innerHTML = "";
  const allImages = [...uploadedImages, ...config.galleryImages];

  allImages.forEach((image, index) => {
    const button = document.createElement("button");
    button.className = `gallery-item gallery-item-${(index % 3) + 1}`;
    button.type = "button";
    button.setAttribute("aria-label", `Abrir foto: ${image.caption}`);
    button.innerHTML = `
      <img src="${image.src}" alt="${image.caption}">
      <span>${image.caption}</span>
    `;
    button.addEventListener("click", () => openLightbox(image));
    galleryGrid.appendChild(button);
  });
}

async function initializeOnlineGallery() {
  try {
    const [settingsResponse, galleryResponse] = await Promise.all([
      fetch("/api/config"),
      fetch("/api/gallery")
    ]);

    if (settingsResponse.ok) {
      cloudinarySettings = await settingsResponse.json();
    }

    if (galleryResponse.ok) {
      uploadedImages = await galleryResponse.json();
    }

    if (cloudinarySettings?.cloudName && cloudinarySettings?.uploadPreset) {
      setUploadStatus("La galería está lista para subir fotos nuevas.", "success");
      uploadButton.disabled = false;
    } else {
      setUploadStatus("Faltan las variables de Cloudinary en Vercel. La galería local seguirá funcionando.", "error");
      uploadButton.disabled = true;
    }
  } catch (error) {
    setUploadStatus("Modo local activo: puedes ver la página y luego activar subidas en Vercel.", "");
    uploadButton.disabled = true;
  }
}

uploadButton.addEventListener("click", uploadSelectedPhotos);

async function uploadSelectedPhotos() {
  const files = Array.from(photoInput.files || []);
  const caption = photoCaption.value.trim() || "Un recuerdo bonito con Lesly";

  if (!files.length) {
    setUploadStatus("Primero elige una o varias fotos.", "error");
    return;
  }

  if (!cloudinarySettings?.cloudName || !cloudinarySettings?.uploadPreset) {
    setUploadStatus("Configura Cloudinary en Vercel antes de subir fotos.", "error");
    return;
  }

  uploadButton.disabled = true;
  setUploadStatus(`Subiendo ${files.length} foto${files.length === 1 ? "" : "s"}...`, "");

  try {
    const savedImages = [];

    for (const file of files) {
      const cloudinaryImage = await uploadToCloudinary(file);
      const savedImage = await saveImageRecord({
        src: cloudinaryImage.secure_url,
        caption,
        publicId: cloudinaryImage.public_id
      });
      savedImages.unshift(savedImage);
    }

    uploadedImages = [...savedImages, ...uploadedImages];
    renderGallery();
    photoInput.value = "";
    photoCaption.value = "";
    setUploadStatus("Fotos guardadas con éxito. Ya aparecen en la galería.", "success");
    launchConfetti(90);
  } catch (error) {
    setUploadStatus("No se pudieron subir las fotos. Revisa Cloudinary, Atlas y las variables de Vercel.", "error");
  } finally {
    uploadButton.disabled = false;
  }
}

async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", cloudinarySettings.uploadPreset);
  formData.append("folder", "cumpleanos-lesly");

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinarySettings.cloudName}/image/upload`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error("Cloudinary no aceptó la imagen.");
  }

  return response.json();
}

async function saveImageRecord(image) {
  const response = await fetch("/api/gallery", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(image)
  });

  if (!response.ok) {
    throw new Error("No se pudo guardar la foto en Atlas.");
  }

  return response.json();
}

function setUploadStatus(message, type) {
  uploadStatus.textContent = message;
  uploadStatus.classList.remove("success", "error");
  if (type) uploadStatus.classList.add(type);
}

// Carrusel automático con botones y soporte táctil.
function renderCarousel() {
  carouselTrack.innerHTML = "";
  carouselDots.innerHTML = "";

  config.carouselSlides.forEach((slide, index) => {
    const article = document.createElement("article");
    article.className = "carousel-slide";
    article.innerHTML = `
      <img src="${slide.src}" alt="${slide.caption}">
      <div class="slide-overlay">
        <p>${slide.caption}</p>
      </div>
    `;
    carouselTrack.appendChild(article);

    const dot = document.createElement("button");
    dot.className = "carousel-dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `Ver momento ${index + 1}`);
    dot.addEventListener("click", () => goToSlide(index));
    carouselDots.appendChild(dot);
  });

  goToSlide(0);
}

function goToSlide(index) {
  activeSlide = (index + config.carouselSlides.length) % config.carouselSlides.length;
  carouselTrack.style.transform = `translateX(-${activeSlide * 100}%)`;

  document.querySelectorAll(".carousel-dot").forEach((dot, dotIndex) => {
    dot.classList.toggle("active", dotIndex === activeSlide);
  });
}

function nextSlide() {
  goToSlide(activeSlide + 1);
}

function previousSlide() {
  goToSlide(activeSlide - 1);
}

function startCarouselAutoplay() {
  clearInterval(carouselTimer);
  carouselTimer = setInterval(nextSlide, 4800);
}

prevPhoto.addEventListener("click", () => {
  previousSlide();
  startCarouselAutoplay();
});

nextPhoto.addEventListener("click", () => {
  nextSlide();
  startCarouselAutoplay();
});

storyCarousel.addEventListener("touchstart", (event) => {
  touchStartX = event.touches[0].clientX;
}, { passive: true });

storyCarousel.addEventListener("touchend", (event) => {
  const touchEndX = event.changedTouches[0].clientX;
  const distance = touchStartX - touchEndX;

  if (Math.abs(distance) > 45) {
    if (distance > 0) nextSlide();
    else previousSlide();
    startCarouselAutoplay();
  }
}, { passive: true });

function openLightbox(image) {
  currentLightboxPhoto = image;

  lightboxImage.src = image.src;
  lightboxImage.alt = image.caption;
  lightboxCaption.textContent = image.caption;

  deleteLightboxPhoto.hidden = !image.publicId;

  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
}

function closePhotoPreview() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
}

closeLightbox.addEventListener("click", closePhotoPreview);
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closePhotoPreview();
});

deleteLightboxPhoto.addEventListener("click", async (event) => {
  event.stopPropagation();
  await deleteCurrentPhoto();
});

async function deleteCurrentPhoto() {
  if (!currentLightboxPhoto?.publicId) {
    setUploadStatus("Esta foto no se puede eliminar desde la página.", "error");
    return;
  }

  const adminKey = prompt("Escribe la clave para eliminar esta foto:");

  if (!adminKey) return;

  const confirmDelete = confirm("¿Seguro que quieres eliminar esta foto? Esta acción no se puede deshacer.");

  if (!confirmDelete) return;

  deleteLightboxPhoto.disabled = true;
  deleteLightboxPhoto.textContent = "Eliminando...";

  try {
    const response = await fetch("/api/gallery", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": adminKey
      },
      body: JSON.stringify({
        publicId: currentLightboxPhoto.publicId,
        src: currentLightboxPhoto.src
      })
    });

    if (!response.ok) {
      throw new Error("No se pudo eliminar la foto.");
    }

    uploadedImages = uploadedImages.filter((photo) => {
      return photo.publicId !== currentLightboxPhoto.publicId;
    });

    closePhotoPreview();
    renderGallery();
    setUploadStatus("Foto eliminada correctamente.", "success");
  } catch (error) {
    setUploadStatus("No se pudo eliminar la foto. Revisa la clave o las variables de Vercel.", "error");
  } finally {
    deleteLightboxPhoto.disabled = false;
    deleteLightboxPhoto.textContent = "Eliminar foto";
  }
}

messageButton.addEventListener("click", () => {
  const message = config.surpriseMessages[Math.floor(Math.random() * config.surpriseMessages.length)];
  randomMessage.animate([
    { opacity: 0, transform: "translateY(14px) scale(0.98)" },
    { opacity: 1, transform: "translateY(0) scale(1)" }
  ], { duration: 460, easing: "ease-out" });
  randomMessage.textContent = message;
  createHearts(10);
  launchConfetti(74);
});

// Corazones flotantes.
function createHearts(amount = 8) {
  const container = document.getElementById("ambientHearts");

  for (let index = 0; index < amount; index += 1) {
    const heart = document.createElement("span");
    heart.className = "heart";
    heart.textContent = Math.random() > 0.45 ? "\u2661" : "\u2665";
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.fontSize = `${18 + Math.random() * 24}px`;
    heart.style.animationDuration = `${7 + Math.random() * 7}s`;
    heart.style.animationDelay = `${Math.random() * 4}s`;
    container.appendChild(heart);

    setTimeout(() => heart.remove(), 14000);
  }
}

setInterval(() => createHearts(3), 2800);

// Confeti liviano con canvas.
function resizeCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function launchConfetti(amount) {
  const colors = ["#f5a8c8", "#c9a7ff", "#ffffff", "#f6d48f", "#e768a0"];

  for (let index = 0; index < amount; index += 1) {
    confettiPieces.push({
      x: Math.random() * confettiCanvas.width,
      y: -20 - Math.random() * confettiCanvas.height * 0.35,
      size: 6 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: 2.5 + Math.random() * 4,
      drift: -1.5 + Math.random() * 3,
      rotation: Math.random() * Math.PI,
      rotationSpeed: -0.1 + Math.random() * 0.2
    });
  }
}

function renderConfetti() {
  confettiContext.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  confettiPieces = confettiPieces.filter((piece) => piece.y < confettiCanvas.height + 30);
  confettiPieces.forEach((piece) => {
    piece.y += piece.speed;
    piece.x += piece.drift;
    piece.rotation += piece.rotationSpeed;

    confettiContext.save();
    confettiContext.translate(piece.x, piece.y);
    confettiContext.rotate(piece.rotation);
    confettiContext.fillStyle = piece.color;
    confettiContext.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.55);
    confettiContext.restore();
  });

  requestAnimationFrame(renderConfetti);
}

renderConfetti();
setTimeout(() => launchConfetti(150), 1150);
