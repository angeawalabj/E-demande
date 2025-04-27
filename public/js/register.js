
   // Initialisation AOS
  AOS.init({
    duration: 1000,
    once: true
  });
  
  // Animation GSAP pour le titre
  gsap.from('.register h1', {
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
    const form = document.getElementById('registerForm');
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
  
      // Vérification des mots de passe
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      if (password !== confirmPassword) {
        document.getElementById('confirmPassword').setCustomValidity('Les mots de passe ne correspondent pas.');
        return;
      } else {
        document.getElementById('confirmPassword').setCustomValidity('');
      }
  
      // Vérification des fichiers
      const nipCard = document.getElementById('nipCard').files[0];
      const studentCard = document.getElementById('studentCard').files[0];
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (nipCard && !allowedTypes.includes(nipCard.type)) {
        document.getElementById('nipCard').setCustomValidity('Fichier non valide (image ou PDF uniquement).');
        return;
      } else {
        document.getElementById('nipCard').setCustomValidity('');
      }
      if (studentCard && !allowedTypes.includes(studentCard.type)) {
        document.getElementById('studentCard').setCustomValidity('Fichier non valide (image ou PDF uniquement).');
        return;
      } else {
        document.getElementById('studentCard').setCustomValidity('');
      }
  
      // Si le formulaire est valide, envoyer les données au backend
      if (form.checkValidity()) {
        const formData = new FormData();
        formData.append('name', document.getElementById('name').value);
        formData.append('surname', document.getElementById('surname').value);
        formData.append('email', document.getElementById('email').value);
        formData.append('matricule', document.getElementById('matricule').value);
        formData.append('nip', document.getElementById('nip').value);
        formData.append('phone', document.getElementById('phone').value);
        formData.append('password', password);
        if (nipCard) formData.append('nipCard', nipCard);
        if (studentCard) formData.append('studentCard', studentCard);
  
        try {
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            body: formData
          });
  
          const result = await response.json();
  
          if (response.ok) {
            // Stocker le token JWT (si votre backend en renvoie un)
            if (result.token) {
              localStorage.setItem('token', result.token);
            }
            // Rediriger vers le tableau de bord
            window.location.href = 'dashboard.html';
          } else {
            // Afficher le message d'erreur
            errorMessage.textContent = result.message || 'Une erreur est survenue lors de l\'inscription.';
            errorMessage.classList.remove('d-none');
          }
        } catch (error) {
          errorMessage.textContent = 'Erreur de connexion au serveur. Veuillez réessayer.';
          errorMessage.classList.remove('d-none');
        }
      }
    });
  })();