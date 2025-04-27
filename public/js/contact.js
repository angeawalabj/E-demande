// Initialisation AOS
AOS.init({
    duration: 1000,
    once: true
  });
  
  // Animation GSAP pour le titre
  gsap.from('.contact h1', {
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
  
  // Gestion du formulaire de contact
  (function () {
    'use strict';
    const token = localStorage.getItem('token');
    const form = document.getElementById('contactForm');
    const successMessage = document.createElement('div');
    successMessage.className = 'alert alert-success d-none mt-3';
    const errorMessage = document.createElement('div');
    errorMessage.className = 'alert alert-danger d-none mt-3';
    form.appendChild(successMessage);
    form.appendChild(errorMessage);
  
    // Vérifier si l'utilisateur est authentifié
    if (!token) {
      window.location.href = 'login.html';
      return;
    }
  
    // Soumission du formulaire
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
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value;
  
        try {
          const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ subject, message })
          });
  
          const result = await response.json();
  
          if (response.ok) {
            // Afficher le message de succès
            successMessage.textContent = 'Message envoyé avec succès. Vous allez être redirigé vers le tableau de bord.';
            successMessage.classList.remove('d-none');
            // Réinitialiser le formulaire
            form.reset();
            form.classList.remove('was-validated');
            // Rediriger vers le tableau de bord après 3 secondes
            setTimeout(() => {
              window.location.href = 'dashboard.html';
            }, 3000);
          } else {
            // Afficher le message d'erreur
            errorMessage.textContent = result.message || 'Erreur lors de l\'envoi du message.';
            errorMessage.classList.remove('d-none');
          }
        } catch (error) {
          errorMessage.textContent = 'Erreur de connexion au serveur. Veuillez réessayer.';
          errorMessage.classList.remove('d-none');
        }
      }
    });
  
    // Déconnexion
    document.getElementById('logoutBtn').addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.href = 'login.html';
    });
  })();