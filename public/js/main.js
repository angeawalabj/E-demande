// Initialisation AOS
AOS.init({
    duration: 1000,
    once: true
  });
  
  // Initialisation ScrollReveal
  ScrollReveal().reveal('.communiques .card', {
    duration: 1000,
    distance: '50px',
    origin: 'bottom',
    interval: 200
  });
  
  // Initialisation Particles.js
  particlesJS('bgCanvas', {
    particles: {
      number: { value: 80 },
      color: { value: '#ffffff' },
      shape: { type: 'circle' },
      opacity: { value: 0.5 },
      size: { value: 3 },
      move: { speed: 2 }
    },
    interactivity: {
      events: {
        onhover: { enable: true, mode: 'repulse' }
      }
    }
  });
  
  // Animation GSAP pour le titre
  gsap.from('.hero h1', {
    opacity: 0,
    y: 50,
    duration: 1,
    delay: 0.5
  });
  
  // Animation Anime.js pour les boutons
  anime({
    targets: '.hero .btn',
    translateY: [20, 0],
    opacity: [0, 1],
    delay: anime.stagger(100, { start: 1000 }),
    duration: 800
  });
  
  // Three.js pour fond 3D
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('bgCanvas'), alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.position.z = 5;
  
  const geometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
  const material = new THREE.MeshBasicMaterial({ color: 0x007bff, wireframe: true });
  const torus = new THREE.Mesh(geometry, material);
  scene.add(torus);
  
  function animate() {
    requestAnimationFrame(animate);
    torus.rotation.x += 0.01;
    torus.rotation.y += 0.01;
    renderer.render(scene, camera);
  }
  animate();
  
  // Chargement des communiqués
  fetch('/api/communiques')
    .then(response => response.json())
    .then(data => {
      const communiquesList = document.getElementById('communiquesList');
      data.forEach(communique => {
        const card = document.createElement('div');
        card.className = 'col-md-4 mb-4';
        card.innerHTML = `
          <div class="card">
            <img src="${communique.image}" class="card-img-top" alt="${communique.title}">
            <div class="card-body">
              <h5 class="card-title">${communique.title}</h5>
              <p class="card-text">${communique.description}</p>
              <a href="${communique.link}" class="btn btn-primary">Lire plus</a>
            </div>
          </div>
        `;
        communiquesList.appendChild(card);
      });
    });