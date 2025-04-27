// Initialisation AOS
AOS.init({
    duration: 1000,
    once: true
  });
  
  // Animation GSAP pour le titre
  gsap.from('.login h1', {
    opacity: 0,
    y: 50,
    duration: 1,
    delay: 0.5
  });
  
  // Animation Anime.js pour les labels
  document.querySelectorAll('.form-label').forEach(label => {
    label.addEventListener('click', () => {
      anime({
        targets: label,
        scale: [1, 1.1],
        duration: 200,
        easing: 'easeInOutQuad',
        direction: 'alternate'
      });
    });
  });
  
  // Validation et soumission du formulaire
  (function () {
    'use strict';
    const form = document.getElementById('loginForm');
    const errorMessage = document.createElement('div');
    errorMessage.className = 'alert alert-danger d-none mt-3';
    form.appendChild(errorMessage);
  
    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      event.stopPropagation();
  
      // Réinitialiser le message d'erreur
      errorMessage.classList.add('d-none');
      errorMessage.textContent = '';
  
      form.classList.add('was-validated');
  
      if (form.checkValidity()) {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
  
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
  
          const result = await response.json();
  
          if (response.ok) {
            // Stocker le token JWT
            localStorage.setItem('token', result.token);
            // Rediriger vers le tableau de bord
            window.location.href = 'dashboard.html';
          } else {
            // Afficher le message d'erreur
            errorMessage.textContent = result.message || 'Erreur lors de la connexion.';
            errorMessage.classList.remove('d-none');
          }
        } catch (error) {
          errorMessage.textContent = 'Erreur de connexion au serveur. Veuillez réessayer.';
          errorMessage.classList.remove('d-none');
        }
      }
    });
  })();