// Initialisation AOS
AOS.init({
    duration: 1000,
    once: true
  });
  
  // Animation GSAP pour le titre
  gsap.from('.edit-profile h1', {
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
  
  // Gestion du formulaire de modification de profil
  (function () {
    'use strict';
    const token = localStorage.getItem('token');
    const form = document.getElementById('editProfileForm');
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
  
    // Charger les informations de l'utilisateur
    async function loadUserProfile() {
      try {
        const response = await fetch('/api/users/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
  
        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = 'login.html';
          return;
        }
  
        const result = await response.json();
  
        if (!response.ok) {
          errorMessage.textContent = result.message || 'Erreur lors du chargement du profil.';
          errorMessage.classList.remove('d-none');
          return;
        }
  
        // Pré-remplir le formulaire
        document.getElementById('name').value = result.user.name;
        document.getElementById('surname').value = result.user.surname;
        document.getElementById('email').value = result.user.email;
        document.getElementById('matricule').value = result.user.matricule;
        document.getElementById('nip').value = result.user.nip;
        document.getElementById('phone').value = result.user.phone;
      } catch (error) {
        errorMessage.textContent = 'Erreur de connexion au serveur. Veuillez réessayer.';
        errorMessage.classList.remove('d-none');
      }
    }
  
    loadUserProfile();
  
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
        const name = document.getElementById('name').value;
        const surname = document.getElementById('surname').value;
        const email = document.getElementById('email').value;
        const matricule = document.getElementById('matricule').value;
        const nip = document.getElementById('nip').value;
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;
  
        try {
          const response = await fetch('/api/users/profile', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, surname, email, matricule, nip, phone, password })
          });
  
          const result = await response.json();
  
          if (response.ok) {
            // Afficher le message de succès
            successMessage.textContent = 'Profil mis à jour avec succès. Vous allez être redirigé vers le tableau de bord.';
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
            errorMessage.textContent = result.message || 'Erreur lors de la mise à jour du profil.';
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