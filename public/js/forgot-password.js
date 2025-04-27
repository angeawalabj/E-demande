// Initialisation AOS
AOS.init({
    duration: 1000,
    once: true
  });
  
  // Animation GSAP pour le titre
  gsap.from('.forgot-password h1', {
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
    const form = document.getElementById('forgotPasswordForm');
    const successMessage = document.createElement('div');
    successMessage.className = 'alert alert-success d-none mt-3';
    const errorMessage = document.createElement('div');
    errorMessage.className = 'alert alert-danger d-none mt-3';
    form.appendChild(successMessage);
    form.appendChild(errorMessage);
  
    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      event.stopPropagation();
  
      // Réinitialiser les messages
      successMessage.classList.add('d-none');
      successMessage.textContent = '';
      errorMessage.classList.add('d-none');
      errorMessage.textContent = '';
  
      form.classList.add('was-validated');
  
      if (form.checkValidity()) {
        const email = document.getElementById('email').value;
  
        try {
          const response = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          });
  
          const result = await response.json();
  
          if (response.ok) {
            // Afficher le message de succès
            successMessage.textContent = 'Un lien de réinitialisation a été envoyé à votre email.';
            successMessage.classList.remove('d-none');
            // Réinitialiser le formulaire
            form.reset();
            form.classList.remove('was-validated');
          } else {
            // Afficher le message d'erreur
            errorMessage.textContent = result.message || 'Erreur lors de l\'envoi du lien.';
            errorMessage.classList.remove('d-none');
          }
        } catch (error) {
          errorMessage.textContent = 'Erreur de connexion au serveur. Veuillez réessayer.';
          errorMessage.classList.remove('d-none');
        }
      }
    });
  })();