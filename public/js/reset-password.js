     // Initialisation AOS
  AOS.init({
    duration: 1000,
    once: true
  });
  
  // Animation GSAP pour le titre
  gsap.from('.reset-password h1', {
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
    const form = document.getElementById('resetPasswordForm');
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
  
      // Vérifier la correspondance des mots de passe
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      if (password !== confirmPassword) {
        document.getElementById('confirmPassword').setCustomValidity('Les mots de passe ne correspondent pas.');
        return;
      } else {
        document.getElementById('confirmPassword').setCustomValidity('');
      }
  
      if (form.checkValidity()) {
        // Extraire le token de l'URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
  
        if (!token) {
          errorMessage.textContent = 'Token de réinitialisation manquant.';
          errorMessage.classList.remove('d-none');
          return;
        }
  
        try {
          const response = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, password })
          });
  
          const result = await response.json();
  
          if (response.ok) {
            // Afficher le message de succès
            successMessage.textContent = 'Mot de passe réinitialisé avec succès. Vous allez être redirigé vers la page de connexion.';
            successMessage.classList.remove('d-none');
            // Réinitialiser le formulaire
            form.reset();
            form.classList.remove('was-validated');
            // Rediriger vers la page de connexion après 3 secondes
            setTimeout(() => {
              window.location.href = 'login.html';
            }, 3000);
          } else {
            // Afficher le message d'erreur
            errorMessage.textContent = result.message || 'Erreur lors de la réinitialisation du mot de passe.';
            errorMessage.classList.remove('d-none');
          }
        } catch (error) {
          errorMessage.textContent = 'Erreur de connexion au serveur. Veuillez réessayer.';
          errorMessage.classList.remove('d-none');
        }
      }
    });
  })();