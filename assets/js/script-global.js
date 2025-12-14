/**
 * SCRIPTS GLOBALES - SoyCampesino 2025
 */
(function () {
  "use strict";

  // Botón flotante 106 en esquina superior izquierda
  function initFloating106Button() {
    const btn = document.createElement("a");
    btn.href = "#sumate";
    btn.className = "floating-106-btn";
    btn.innerHTML = '<span class="badge-106-float">106</span>';
    btn.setAttribute("aria-label", "Únete - Lista 106");
    document.body.appendChild(btn);
  }
  initFloating106Button();

  // Año en footer
  const yearElement = document.querySelector("[data-year]");
  if (yearElement) yearElement.textContent = new Date().getFullYear();

  // Menú móvil
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      const isOpen = navLinks.dataset.open === "true";
      navLinks.dataset.open = isOpen ? "false" : "true";
      if (!isOpen) {
        navLinks.style.display = "flex";
        navLinks.style.flexDirection = "column";
        navLinks.style.gap = "12px";
        navLinks.style.padding = "16px";
        navLinks.style.position = "absolute";
        navLinks.style.top = "100%";
        navLinks.style.left = "0";
        navLinks.style.right = "0";
        navLinks.style.background = "var(--color-blanco)";
        navLinks.style.boxShadow = "0 8px 16px rgba(0,0,0,0.1)";
        navLinks.style.zIndex = "1000";
      } else {
        navLinks.style.display = "";
      }
    });

    document.addEventListener("click", function (event) {
      if (
        !navToggle.contains(event.target) &&
        !navLinks.contains(event.target)
      ) {
        if (navLinks.dataset.open === "true") {
          navLinks.dataset.open = "false";
          navLinks.style.display = "";
        }
      }
    });
  }

  // Contadores animados
  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        el.textContent = target.toLocaleString();
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(current).toLocaleString();
      }
    }, 16);
  }

  const counters = document.querySelectorAll("[data-target]");
  if (counters.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((c) => observer.observe(c));
  }

  // Descarga de PDFs
  const pdfButtons = document.querySelectorAll("[data-pdf]");
  const pdfMap = {
    papaton: "pdf/papaton.pdf",
    leche: "pdf/leche.pdf",
    campo: "pdf/campo.pdf",
    valentina: "pdf/valentina.pdf",
    acoso: "pdf/acoso.pdf",
    agraria: "pdf/agraria.pdf",
  };
  pdfButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const key = this.dataset.pdf;
      const url = pdfMap[key];
      if (!url) return alert("PDF no disponible");
      const link = document.createElement("a");
      link.href = url;
      link.download = url.split("/").pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if (window.logFirebaseEvent)
        window.logFirebaseEvent("pdf_download", { pdf_name: key });
    });
  });

  // Formulario de contacto
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const nombre = this.querySelector('[name="nombre"]');
      const apellido = this.querySelector('[name="apellido"]');
      const telefono = this.querySelector('[name="telefono"]');
      const localidad = this.querySelector('[name="localidad"]');
      const ayuda = this.querySelector('[name="ayuda"]');

      // Validaciones explícitas
      const errors = [];
      if (!nombre || nombre.value.trim().length < 2)
        errors.push("Nombre inválido");
      if (!apellido || apellido.value.trim().length < 2)
        errors.push("Apellido inválido");
      if (!telefono || !/^[0-9\s\-\+\(\)]{7,15}$/.test(telefono.value.trim()))
        errors.push("Teléfono inválido");
      if (!localidad || !localidad.value)
        errors.push("Selecciona tu localidad");
      if (!ayuda || !ayuda.value) errors.push("Selecciona cómo ayudar");

      if (errors.length) {
        if (typeof Swal !== "undefined") {
          Swal.fire({
            title: "Revisa tu información",
            html: `<ul style='text-align:left'>${errors
              .map((e) => `<li>${e}</li>`)
              .join("")}</ul>`,
            icon: "warning",
            confirmButtonColor: "#009440",
          });
        } else {
          alert("Corrige: " + errors.join(", "));
        }
        return;
      }

      const formData = Object.fromEntries(new FormData(this));
      const submitBtn = this.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
      }
      try {
        if (window.firebaseAddDoc && window.firebaseCollection) {
          const db = window.firebaseDB || { mock: true };
          await window.firebaseAddDoc(
            window.firebaseCollection(db, "voluntarios"),
            {
              ...formData,
              fecha: new Date().toISOString(),
              estado: "pendiente",
              origen: "formulario_web",
            }
          );
          if (typeof Swal !== "undefined") {
            Swal.fire({
              title: "¡Registro Exitoso! 🎉",
              text: "Te contactaremos pronto.",
              icon: "success",
              confirmButtonColor: "#009440",
            });
          } else {
            alert("Registro exitoso");
          }
          this.reset();
          if (window.logFirebaseEvent)
            window.logFirebaseEvent("contacto_registrado", {
              localidad: formData.localidad,
              ayuda: formData.ayuda,
            });
        } else {
          alert("No pudimos registrar ahora. Intenta más tarde.");
        }
      } catch (error) {
        console.error("Error al guardar:", error);
        if (typeof Swal !== "undefined") {
          Swal.fire({
            title: "Error al registrar",
            text: "Hubo un problema. Intenta nuevamente.",
            icon: "error",
            confirmButtonColor: "#009440",
          });
        } else {
          alert("Hubo un error, intenta nuevamente.");
        }
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  // Scroll suave
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href === "#") return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        window.scrollTo({ top: target.offsetTop - 80, behavior: "smooth" });
      }
    });
  });

  // Preloader
  window.addEventListener("load", function () {
    const preloader = document.querySelector(".preloader");
    if (preloader) {
      setTimeout(() => {
        document.body.classList.add("loaded");
        preloader.classList.add("hidden");
      }, 500);
    }
  });

  // Números flotantes "106"
  function initFloatingDecor() {
    if (document.querySelector(".floating-106-layer")) return;
    const layer = document.createElement("div");
    layer.className = "floating-106-layer";

    // Solo "106" atractivo en forma de badge
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const count106 = isMobile ? 2 : 4; // marca de agua sutil

    for (let i = 0; i < count106; i++) {
      const span = document.createElement("span");
      span.className = "floating-106";
      span.textContent = "106";

      const startX = Math.random() * 100;
      const startY = Math.random() * 100;
      const endX = Math.random() * 100;
      const endY = Math.random() * 100;

      span.style.setProperty("--start-x", `${startX}vw`);
      span.style.setProperty("--start-y", `${startY}vh`);
      span.style.setProperty("--end-x", `${endX}vw`);
      span.style.setProperty("--end-y", `${endY}vh`);

      // Duración y retraso buscando variedad agradable
      span.style.animationDuration = `${14 + Math.random() * 10}s`;
      span.style.animationDelay = `${Math.random() * 6}s`;

      // Tamaños del número, sin fondo
      span.style.fontSize = `${2.0 + Math.random() * 1.8}rem`;
      span.style.transform = `rotate(${Math.random() * 12 - 6}deg)`;

      layer.appendChild(span);
    }

    document.body.appendChild(layer);
  }

  document.addEventListener("DOMContentLoaded", initFloatingDecor);

  console.log("Scripts globales listos");
})();
