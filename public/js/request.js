// Initialisation AOS
AOS.init({
    duration: 1000,
    once: true
  });
  
  // Animation GSAP pour le titre
  gsap.from('.request h1', {
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
  
  // Gestion du formulaire de demande
  (function () {
    'use strict';
    const token = localStorage.getItem('token');
    const form = document.getElementById('requestForm');
    const emailNotConfirmed = document.getElementById('emailNotConfirmed');
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
  
    // Vérifier la confirmation de l'email
    async function checkEmailConfirmation() {
      try {
        const response = await fetch('/api/requests', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
  
        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = 'login.html';
          return;
        }
  
        const result = await response.json();
  
        if (!response.ok) {
          errorMessage.textContent = result.message || 'Erreur lors de la vérification.';
          errorMessage.classList.remove('d-none');
          return;
        }
  
        if (!result.user.emailConfirmed) {
          emailNotConfirmed.classList.remove('d-none');
          form.querySelectorAll('input, select, button').forEach(el => el.disabled = true);
        }
      } catch (error) {
        errorMessage.textContent = 'Erreur de connexion au serveur. Veuillez réessayer.';
        errorMessage.classList.remove('d-none');
      }
    }
  
    checkEmailConfirmation();
  
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
        const type = document.getElementById('type').value;
        const year = document.getElementById('year').value;
        const level = document.getElementById('level').value;
  
        try {
          const response = await fetch('/api/requests', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ type, year, level })
          });
  
          const result = await response.json();
  
          if (response.ok) {
            // Afficher le message de succès
            successMessage.textContent = 'Demande soumise avec succès. Vous allez être redirigé vers le tableau de bord.';
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
            errorMessage.textContent = result.message || 'Erreur lors de la soumission de la demande.';
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