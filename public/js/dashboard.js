// Initialisation AOS
AOS.init({
    duration: 1000,
    once: true
  });
  
  // Animation GSAP pour le titre
  gsap.from('.dashboard h1', {
    opacity: 0,
    y: 50,
    duration: 1,
    delay: 0.5
  });
  
  // Animation Anime.js pour les boutons du menu
  document.querySelectorAll('.dashboard .btn').forEach(btn => {
    btn.addEventListener('click', () => {
      anime({
        targets: btn,
        scale: [1, 1.1],
        duration: 200,
        easing: 'easeInOutQuad',
        direction: 'alternate'
      });
    });
  });
  
  // Gestion du tableau de bord
  (function () {
    'use strict';
    const token = localStorage.getItem('token');
    const noRequests = document.getElementById('noRequests');
    const requestsTable = document.getElementById('requestsTable');
    const requestsBody = document.getElementById('requestsBody');
    const confirmEmailBtn = document.getElementById('confirmEmailBtn');
  
    // Vérifier si l'utilisateur est authentifié
    if (!token) {
      window.location.href = 'login.html';
      return;
    }
  
    // Charger les demandes
    async function loadRequests() {
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
          alert(result.message || 'Erreur lors du chargement des demandes.');
          return;
        }
  
        // Vérifier si l'email est confirmé
        if (!result.user.emailConfirmed) {
          confirmEmailBtn.classList.remove('d-none');
        }
  
        // Afficher les demandes
        if (result.requests.length === 0) {
          noRequests.classList.remove('d-none');
          requestsTable.classList.add('d-none');
        } else {
          noRequests.classList.add('d-none');
          requestsTable.classList.remove('d-none');
          requestsBody.innerHTML = '';
          result.requests.forEach(request => {
            const row = document.createElement('tr');
            let statusContent = '';
            if (request.status === 'traité' && request.documentPath) {
              statusContent = `<a href="/uploads/${request.documentPath}" target="_blank">Télécharger PDF</a>`;
            } else if (request.status === 'non trouvé') {
              statusContent = 'Document non trouvé';
            } else {
              statusContent = 'En attente';
            }
            row.innerHTML = `
              <td>${request._id}</td>
              <td>${request.type === 'attestation' ? 'Attestation' : 'Diplôme'}</td>
              <td>${request.year}</td>
              <td>${statusContent}</td>
            `;
            requestsBody.appendChild(row);
          });
        }
      } catch (error) {
        alert('Erreur de connexion au serveur. Veuillez réessayer.');
      }
    }
  
    // Charger les demandes au démarrage
    loadRequests();
  
    // Gestion des boutons du menu
    document.getElementById('requestBtn').addEventListener('click', () => {
      window.location.href = 'request.html';
    });
  
    document.getElementById('confirmEmailBtn').addEventListener('click', () => {
      alert('Veuillez vérifier votre boîte de réception pour confirmer votre email.');
    });
  
    document.getElementById('editProfileBtn').addEventListener('click', () => {
      window.location.href = 'edit-profile.html';
    });
  
    document.getElementById('contactBtn').addEventListener('click', () => {
      window.location.href = 'contact.html';
    });
  
    // Déconnexion
    document.getElementById('logoutBtn').addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.href = 'login.html';
    });
  })();