// Simple Hyperspeed-like animated background using Three.js
(function() {
  let scene, camera, renderer, mesh, animationFrameId;
  let hyperspeedInstance = null;

  // Wait for Three.js to be available
  function waitForThree(callback, maxAttempts = 50) {
    let attempts = 0;
    const checkThree = setInterval(() => {
      attempts++;
      if (typeof THREE !== 'undefined') {
        clearInterval(checkThree);
        callback();
      } else if (attempts >= maxAttempts) {
        clearInterval(checkThree);
        console.warn('Three.js failed to load after 5 seconds');
        callback(); // Proceed anyway (will use fallback)
      }
    }, 100);
  }

  window.initHyperspeedBackground = function(containerId) {
    if (hyperspeedInstance) return hyperspeedInstance;
    
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container "${containerId}" not found`);
      return null;
    }

    // Check if Three.js is available
    if (typeof THREE === 'undefined') {
      console.warn('Three.js is not loaded yet. Using fallback background.');
      container.style.background = 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(167,139,250,0.15))';
      container.style.minHeight = '600px';
      return null;
    }

    try {
      // Setup scene
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0b0f1a);
      scene.fog = new THREE.Fog(0x0b0f1a, 100, 500);

      // Setup camera
      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.clientHeight, 1);
      camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.z = 30;

      // Setup renderer
      renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: false,
        precision: 'highp',
        powerPreference: 'high-performance'
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowShadowMap;
      container.appendChild(renderer.domElement);

      // Create animated geometry
      const geometries = [];
      const meshes = [];

      // Road-like plane with wave distortion
      const planeGeo = new THREE.PlaneGeometry(50, 100, 32, 32);
      const planeMaterial = new THREE.MeshPhongMaterial({
        color: 0x080808,
        emissive: 0x1a3a52,
        wireframe: false,
        shininess: 30
      });
      const planeMesh = new THREE.Mesh(planeGeo, planeMaterial);
      planeMesh.rotation.x = -Math.PI / 3;
      planeMesh.position.z = -20;
      planeMesh.receiveShadow = true;
      scene.add(planeMesh);
      geometries.push(planeGeo);
      meshes.push(planeMesh);

      // Floating particles/lights
      const particleGeo = new THREE.IcosahedronGeometry(0.5, 3);
      const particles = [];
      
      for (let i = 0; i < 15; i++) {
        const particleMaterial = new THREE.MeshPhongMaterial({
          color: 0x03b3c3,
          emissive: 0x03b3c3,
          shininess: 100
        });
        const particle = new THREE.Mesh(particleGeo, particleMaterial);
        particle.position.set(
          (Math.random() - 0.5) * 60,
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 60
        );
        particle.castShadow = true;
        particle.receiveShadow = true;
        particle.scale.set(0.5 + Math.random(), 0.5 + Math.random(), 0.5 + Math.random());
        scene.add(particle);
        particles.push({
          mesh: particle,
          speed: 0.5 + Math.random() * 1.5,
          rotX: (Math.random() - 0.5) * 0.01,
          rotY: (Math.random() - 0.5) * 0.01
        });
      }

      // Lighting
      const directionalLight = new THREE.DirectionalLight(0xa78bfa, 0.8);
      directionalLight.position.set(20, 30, 20);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      scene.add(directionalLight);

      const pointLight1 = new THREE.PointLight(0x03b3c3, 0.6);
      pointLight1.position.set(-20, 10, 30);
      pointLight1.castShadow = true;
      scene.add(pointLight1);

      const pointLight2 = new THREE.PointLight(0xd856bf, 0.4);
      pointLight2.position.set(20, -10, -30);
      scene.add(pointLight2);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
      scene.add(ambientLight);

      // Animation loop
      function animate() {
        animationFrameId = requestAnimationFrame(animate);

        // Animate plane wave
        const posAttribute = planeGeo.getAttribute('position');
        if (posAttribute) {
          const posArray = posAttribute.array;
          const time = Date.now() * 0.001;

          for (let i = 0; i < posArray.length; i += 3) {
            const x = posArray[i];
            const y = posArray[i + 1];
            const z = Math.sin(x * 0.1 + time) * Math.cos(y * 0.05 + time) * 2;
            posArray[i + 2] = z;
          }
          posAttribute.needsUpdate = true;
        }

        // Animate particles
        particles.forEach(p => {
          p.mesh.rotation.x += p.rotX;
          p.mesh.rotation.y += p.rotY;
          p.mesh.position.z += p.speed * 0.02;

          if (p.mesh.position.z > 50) {
            p.mesh.position.z = -50;
          }
        });

        // Subtle camera movement
        const time = Date.now() * 0.001;
        camera.position.x = Math.sin(time * 0.1) * 5;
        camera.position.y = Math.cos(time * 0.1) * 3;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
      }

      // Handle window resize
      function onWindowResize() {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        
        if (newWidth > 0 && newHeight > 0) {
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        }
      }

      window.addEventListener('resize', onWindowResize);

      // Start animation
      animate();

      hyperspeedInstance = {
        dispose() {
          window.removeEventListener('resize', onWindowResize);
          cancelAnimationFrame(animationFrameId);
          geometries.forEach(g => g.dispose());
          renderer.dispose();
          if (container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
          }
        }
      };

      return hyperspeedInstance;

    } catch (error) {
      console.error('Error initializing Hyperspeed background:', error);
      // Fallback to gradient
      container.style.background = 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(167,139,250,0.15))';
      container.style.minHeight = '600px';
      return null;
    }
  };

  // Auto-init if container exists on page load
  window.addEventListener('DOMContentLoaded', () => {
    waitForThree(() => {
      const container = document.getElementById('hyperspeed-container');
      if (container && window.initHyperspeedBackground) {
        window.initHyperspeedBackground('hyperspeed-container');
      }
    });
  });
})();
