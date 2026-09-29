/**
 * ============================================================================
 * REALISTIC 3D UAV FLIGHT SIMULATOR & INFINITE PROCEDURAL TACTICAL ENVIRONMENT
 * ============================================================================
 * Features:
 * - DRDO-Grade 6-DOF Aerodynamic Flight Model with Fly-By-Wire Auto-Trim.
 * - Smooth Auto-Takeoff Sequence (spool, ground roll, rotate, climb, gear retract).
 * - Intuitive Keyboard Controls (W/S Pitch & Throttle, A/D Bank & Turn, Space Climb, Q/E Yaw).
 * - Infinite Procedural Metropolis: Dynamic streaming skyscrapers, avenue roads,
 *   traffic markings, and streetlamps that never end in any flight direction.
 * - Dynamic Celestial Day/Night Cycle with visible 3D Sun, 3D Moon, and Starfield.
 * - Forward GPWS/TAWS Terrain Warning & Collision Detection.
 * - Threat Interceptor Combat & Guided Missile Evasion Gameplay.
 * ============================================================================
 */

class Flight3DViewer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.scene = new THREE.Scene();

    // Flight Camera setup
    const aspect = (this.container.clientWidth || 800) / (this.container.clientHeight || 500);
    this.camera = new THREE.PerspectiveCamera(55, aspect, 0.2, 3500);
    this.camera.position.set(0, 4.2, 9.5);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.container.clientWidth || 800, this.container.clientHeight || 500);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    // Physical Flight State (Real World Coordinates) - Initialized BEFORE subsystems
    this.flightState = {
      position: new THREE.Vector3(0, 0.42, 0), // Starts on runway centerline
      velocity: new THREE.Vector3(0, 0, 0),
      airspeedKt: 0,
      altitudeFt: 0,
      verticalSpeedFpm: 0,
      headingRad: 0,     // Yaw angle
      pitchRad: 0,       // Pitch angle
      bankRad: 0,        // Roll angle
      onGround: true,
      gearRetracted: false,
      braking: false,
      airframeIntegrityPct: 100,
      isCrashed: false,
      terrainWarningActive: false,
      lastTerrainWarningTime: 0
    };

    // Auto Takeoff Sequence State
    this.autoTakeoff = {
      active: false,
      stage: 'idle', // 'spool', 'roll', 'rotate', 'climb'
      targetAltFt: 180
    };

    this.takeoffCooldown = 0;
    this.landingApproach = false;

    // Camera Mode
    this.cameraMode = 'chase'; // 'chase', 'cockpit', 'map'

    // High-Fidelity UAV Drone Model
    this.droneGroup = new THREE.Group();
    this.droneGroup.position.copy(this.flightState.position);
    this.scene.add(this.droneGroup);
    this.buildDroneModel();

    this.camera.lookAt(this.droneGroup.position.clone().add(new THREE.Vector3(0, 0.45, 0)));

    // Onboard EO/IR Gimbal Cam setup
    this.setupGimbalCamera();

    // Dynamic Celestial Environment (Sun, Moon, Stars, Day/Night)
    this.timeOfDay = 12.0; // 12:00 noon default
    this.autoTimeProgression = false;
    this.setupCelestialAtmosphere();

    // Infinite Procedural Metropolis World
    this.buildingColliders = [];
    this.activeChunkX = 0;
    this.activeChunkZ = 0;
    this.BLOCK_SIZE = 75; // 75 meters per city block
    this.buildInfiniteMetropolisWorld();

    // Threat Jets / Drones & Missiles
    this.setupThreatSystem();

    // Window Resizing
    window.addEventListener('resize', () => this.onResize());
  }

  // ==========================================================================
  // DYNAMIC CELESTIAL ATMOSPHERE: 3D SUN, 3D MOON & STARFIELD
  // ==========================================================================
  setupCelestialAtmosphere() {
    this.ambientLight = new THREE.AmbientLight(0xdbeafe, 0.85);
    this.scene.add(this.ambientLight);

    // 1. Sun Directional Light & Visible 3D Celestial Sun Mesh
    this.sunLight = new THREE.DirectionalLight(0xfff7ed, 1.25);
    this.sunLight.castShadow = true;
    this.scene.add(this.sunLight);

    const sunGeo = new THREE.SphereGeometry(18, 24, 24);
    const sunMat = new THREE.MeshBasicMaterial({
      color: 0xfffae6,
      transparent: true,
      opacity: 0.95
    });
    this.sunMesh = new THREE.Mesh(sunGeo, sunMat);
    this.scene.add(this.sunMesh);

    // Sun Corona Glow Ring
    const coronaGeo = new THREE.RingGeometry(18, 32, 32);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xffd56b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4
    });
    this.sunCorona = new THREE.Mesh(coronaGeo, coronaMat);
    this.sunMesh.add(this.sunCorona);

    // 2. Moon Directional Light & Visible 3D Celestial Moon Mesh
    this.moonLight = new THREE.DirectionalLight(0x93c5fd, 0.0);
    this.scene.add(this.moonLight);

    const moonGeo = new THREE.SphereGeometry(14, 24, 24);
    const moonMat = new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      roughness: 0.8,
      metalness: 0.1,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.2
    });
    this.moonMesh = new THREE.Mesh(moonGeo, moonMat);
    this.scene.add(this.moonMesh);

    // 3. Sky Color Palette
    this.skyDay = new THREE.Color(0x38bdf8);
    this.skySunset = new THREE.Color(0xd97706);
    this.skyNight = new THREE.Color(0x050814);
    this.scene.background = this.skyDay.clone();
    this.scene.fog = new THREE.Fog(0x38bdf8, 140, 1100);

    // 4. Starfield Particle System (1500 Twinkling Night Stars)
    const starGeo = new THREE.BufferGeometry();
    const starCount = 1500;
    const starPos = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const radius = 950 + Math.random() * 150;
      starPos[i] = radius * Math.sin(phi) * Math.cos(theta);
      starPos[i + 1] = Math.abs(radius * Math.cos(phi)) + 50; // In upper hemisphere
      starPos[i + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    this.starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 2.2,
      transparent: true,
      opacity: 0.0
    });
    this.starField = new THREE.Points(starGeo, this.starMat);
    this.scene.add(this.starField);

    // 5. Atmospheric Clouds
    this.clouds = [];
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.95,
      transparent: true,
      opacity: 0.7
    });

    for (let c = 0; c < 35; c++) {
      const cloud = new THREE.Group();
      for (let p = 0; p < 4; p++) {
        const puff = new THREE.Mesh(new THREE.SphereGeometry(7 + Math.random() * 5, 8, 6), cloudMat);
        puff.position.set((Math.random() - 0.5) * 16, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 12);
        cloud.add(puff);
      }
      cloud.position.set(
        (Math.random() - 0.5) * 1200,
        75 + Math.random() * 45,
        (Math.random() - 0.5) * 1200
      );
      this.scene.add(cloud);
      this.clouds.push(cloud);
    }

    // Set initial celestial position
    this.updateCelestialPositions();
  }

  // Update Sun, Moon and Sky Colors based on this.timeOfDay (0.0 to 24.0)
  updateCelestialPositions() {
    const dronePos = (this.flightState && this.flightState.position) ? this.flightState.position : new THREE.Vector3(0, 0, 0);

    // Celestial orbital angle: 0h = midnight, 6h = sunrise, 12h = noon, 18h = sunset
    const orbitAngle = ((this.timeOfDay - 6) / 24) * (Math.PI * 2);
    const orbitDist = 800;

    // Sun Position (High at 12:00, below horizon at night)
    const sunX = dronePos.x + Math.cos(orbitAngle) * orbitDist;
    const sunY = Math.sin(orbitAngle) * orbitDist;
    const sunZ = dronePos.z - 220;

    this.sunMesh.position.set(sunX, sunY, sunZ);
    this.sunLight.position.set(sunX, Math.max(10, sunY), sunZ);
    this.sunCorona.lookAt(dronePos);

    // Moon Position (Directly opposite to the Sun)
    const moonX = dronePos.x - Math.cos(orbitAngle) * orbitDist;
    const moonY = -Math.sin(orbitAngle) * orbitDist;
    const moonZ = dronePos.z + 220;

    this.moonMesh.position.set(moonX, moonY, moonZ);
    this.moonLight.position.set(moonX, Math.max(10, moonY), moonZ);

    // Day / Night Factor (1.0 = full day, 0.0 = full night)
    const sunElevation = sunY / orbitDist; // -1 to +1
    const dayFactor = Math.max(0, Math.min(1, (sunElevation + 0.15) / 0.4));
    const sunsetFactor = Math.max(0, 1 - Math.abs(sunElevation) * 3.5);

    // Blend Sky & Fog
    if (dayFactor > 0.4) {
      this.scene.background.copy(this.skyDay);
      if (sunsetFactor > 0.2) {
        this.scene.background.lerp(this.skySunset, sunsetFactor * 0.7);
      }
    } else {
      this.scene.background.copy(this.skyNight);
      if (sunsetFactor > 0.2) {
        this.scene.background.lerp(this.skySunset, sunsetFactor * 0.5);
      }
    }

    if (this.scene.fog) {
      this.scene.fog.color.copy(this.scene.background);
    }

    // Lighting Intensities
    this.sunLight.intensity = Math.max(0, dayFactor * 1.35);
    this.ambientLight.intensity = 0.2 + (dayFactor * 0.65);
    this.ambientLight.color.setHex(dayFactor > 0.3 ? 0xdbeafe : 0x1e293b);
    this.moonLight.intensity = Math.max(0, (1 - dayFactor) * 0.45);

    // Starfield Opacity
    if (this.starMat) {
      this.starMat.opacity = Math.max(0, (1 - dayFactor) * 0.95);
    }

    // Streetlight Emissive Glow at Night
    if (this.streetLightGlows) {
      const isNight = dayFactor < 0.35;
      for (let i = 0; i < this.streetLightGlows.length; i++) {
        this.streetLightGlows[i].visible = isNight;
      }
    }
  }

  setTimeOfDay(val) {
    this.timeOfDay = parseFloat(val);
    this.updateCelestialPositions();
  }

  setupGimbalCamera() {
    this.gimbalPipContainer = document.getElementById('camFeedPip');
    if (!this.gimbalPipContainer) return;

    this.gimbalCamera = new THREE.PerspectiveCamera(45, 170 / 120, 0.1, 900);
    this.gimbalRenderer = new THREE.WebGLRenderer({ antialias: true });
    this.gimbalRenderer.setSize(170, 120);
    this.gimbalPipContainer.appendChild(this.gimbalRenderer.domElement);
  }

  // ==========================================================================
  // INFINITE PROCEDURAL METROPOLIS & ROAD GRID WORLD
  // ==========================================================================
  buildInfiniteMetropolisWorld() {
    // 1. Dynamic Moving Ground Terrain Plane
    const groundGeo = new THREE.PlaneGeometry(2800, 2800);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x11161f,
      roughness: 0.9,
      metalness: 0.1
    });
    this.groundMesh = new THREE.Mesh(groundGeo, groundMat);
    this.groundMesh.rotation.x = -Math.PI / 2;
    this.scene.add(this.groundMesh);

    // 2. Base Airport Runway Zone (Centered at Origin 0,0,0)
    const runwayGeo = new THREE.PlaneGeometry(26, 700);
    const runwayMat = new THREE.MeshStandardMaterial({
      color: 0x1e232e,
      roughness: 0.8
    });
    this.runwayMesh = new THREE.Mesh(runwayGeo, runwayMat);
    this.runwayMesh.rotation.x = -Math.PI / 2;
    this.runwayMesh.position.set(0, 0.05, 0);
    this.scene.add(this.runwayMesh);

    // Runway Centerline White Stripes
    for (let rz = -320; rz <= 320; rz += 24) {
      const stripe = new THREE.Mesh(
        new THREE.PlaneGeometry(1.4, 12),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(0, 0.08, rz);
      this.scene.add(stripe);
    }

    // Runway Threshold Lighting (Green at approach, Red at departure)
    for (let lx = -13; lx <= 13; lx += 3.2) {
      const gLight = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), new THREE.MeshBasicMaterial({ color: 0x00ff88 }));
      gLight.position.set(lx, 0.15, -345);
      this.scene.add(gLight);

      const rLight = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff2244 }));
      rLight.position.set(lx, 0.15, 345);
      this.scene.add(rLight);
    }

    // 3. Infinite Procedural Skyscraper Pool (9x9 Grid = 81 Dynamic Towers)
    this.glassTextures = [
      this.createGlassWindowTexture('#1e2532', '#38bdf8', '#ffd56b'), // Blue corporate
      this.createGlassWindowTexture('#161c26', '#00f0ff', '#f59e0b'), // Cyberpunk cyan
      this.createGlassWindowTexture('#27202b', '#c084fc', '#f43f5e'), // Neon purple
      this.createGlassWindowTexture('#121820', '#a7f3d0', '#fbbf24')  // Emerald tower
    ];

    this.buildingPool = [];
    this.streetLightGlows = [];
    this.roadNetworkGroup = new THREE.Group();
    this.scene.add(this.roadNetworkGroup);

    const GRID_DIM = 9; // 9x9 = 81 blocks around drone
    const HALF_DIM = Math.floor(GRID_DIM / 2);

    for (let gx = -HALF_DIM; gx <= HALF_DIM; gx++) {
      for (let gz = -HALF_DIM; gz <= HALF_DIM; gz++) {
        // Skyscraper Tower Mesh
        const height = 30 + Math.random() * 65 + (Math.random() < 0.3 ? Math.random() * 45 : 0);
        const width = 18 + Math.random() * 12;
        const depth = 18 + Math.random() * 12;

        const tex = this.glassTextures[Math.floor(Math.random() * this.glassTextures.length)];
        const bMat = new THREE.MeshStandardMaterial({
          map: tex,
          roughness: 0.25,
          metalness: 0.65
        });

        const bMesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), bMat);
        this.scene.add(bMesh);

        // Rooftop Antenna Spire with FAA Blinking Beacon
        const spire = new THREE.Mesh(
          new THREE.CylinderGeometry(0.12, 0.45, 14, 8),
          new THREE.MeshBasicMaterial({ color: 0xff2244 })
        );
        this.scene.add(spire);

        // Streetlight Post with Night Glow Bulb
        const lampGroup = new THREE.Group();
        const pole = new THREE.Mesh(
          new THREE.CylinderGeometry(0.1, 0.1, 6.5, 6),
          new THREE.MeshStandardMaterial({ color: 0x475569 })
        );
        pole.position.y = 3.25;
        lampGroup.add(pole);

        const bulb = new THREE.Mesh(
          new THREE.SphereGeometry(0.4, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0xfef08a })
        );
        bulb.position.set(0, 6.5, 0);
        lampGroup.add(bulb);
        this.scene.add(lampGroup);
        this.streetLightGlows.push(bulb);

        // Road segment across this block
        const roadGeo = new THREE.PlaneGeometry(this.BLOCK_SIZE, 8);
        const roadMat = new THREE.MeshStandardMaterial({ color: 0x1f242d, roughness: 0.85 });
        const road = new THREE.Mesh(roadGeo, roadMat);
        road.rotation.x = -Math.PI / 2;
        road.position.y = 0.02;
        this.scene.add(road);

        // Stripe on road
        const stripe = new THREE.Mesh(
          new THREE.PlaneGeometry(this.BLOCK_SIZE * 0.9, 0.5),
          new THREE.MeshBasicMaterial({ color: 0xfacc15 })
        );
        stripe.rotation.x = -Math.PI / 2;
        stripe.position.y = 0.03;
        this.scene.add(stripe);

        this.buildingPool.push({
          gridOffsetX: gx,
          gridOffsetZ: gz,
          mesh: bMesh,
          spire: spire,
          lamp: lampGroup,
          road: road,
          roadStripe: stripe,
          width: width,
          depth: depth,
          height: height,
          baseHeight: height
        });
      }
    }

    // Initial positioning of dynamic city chunks
    this.updateInfiniteMetropolis(true);
  }

  // Continuously Stream and Wrap Metropolis Blocks Ahead of the Drone
  updateInfiniteMetropolis(force = false) {
    const dronePos = (this.flightState && this.flightState.position) ? this.flightState.position : new THREE.Vector3(0, 0.42, 0);
    const currentChunkX = Math.floor(dronePos.x / this.BLOCK_SIZE);
    const currentChunkZ = Math.floor(dronePos.z / this.BLOCK_SIZE);

    if (!force && currentChunkX === this.activeChunkX && currentChunkZ === this.activeChunkZ) {
      return;
    }

    this.activeChunkX = currentChunkX;
    this.activeChunkZ = currentChunkZ;

    // Reposition Ground Terrain under Drone
    if (this.groundMesh) {
      this.groundMesh.position.x = currentChunkX * this.BLOCK_SIZE;
      this.groundMesh.position.z = currentChunkZ * this.BLOCK_SIZE;
    }

    // Refresh Dynamic Colliders
    this.buildingColliders = [];

    for (let i = 0; i < this.buildingPool.length; i++) {
      const b = this.buildingPool[i];
      const worldBlockX = (currentChunkX + b.gridOffsetX) * this.BLOCK_SIZE;
      const worldBlockZ = (currentChunkZ + b.gridOffsetZ) * this.BLOCK_SIZE;

      // Keep Runway Corridor clear (X: -55 to +55, Z: -950 to +550)
      const inRunwayCorridor = Math.abs(worldBlockX) < 55 && worldBlockZ > -950 && worldBlockZ < 550;

      if (inRunwayCorridor) {
        b.mesh.visible = false;
        b.spire.visible = false;
        b.road.visible = false;
        b.roadStripe.visible = false;
        b.lamp.visible = false;
      } else {
        b.mesh.visible = true;
        b.spire.visible = true;
        b.road.visible = true;
        b.roadStripe.visible = true;
        b.lamp.visible = true;

        // Position Skyscraper
        b.mesh.position.set(worldBlockX, b.height / 2, worldBlockZ);
        b.spire.position.set(worldBlockX, b.height + 7, worldBlockZ);

        // Position Streetlamp at block intersection
        b.lamp.position.set(worldBlockX + this.BLOCK_SIZE / 2 - 4, 0, worldBlockZ + this.BLOCK_SIZE / 2 - 4);

        // Position Road Avenue
        b.road.position.set(worldBlockX, 0.02, worldBlockZ + this.BLOCK_SIZE / 2);
        b.roadStripe.position.set(worldBlockX, 0.03, worldBlockZ + this.BLOCK_SIZE / 2);

        // Register Dynamic Bounding Box Collider for Real-time Collision Detection
        this.buildingColliders.push({
          minX: worldBlockX - b.width / 2,
          maxX: worldBlockX + b.width / 2,
          minZ: worldBlockZ - b.depth / 2,
          maxZ: worldBlockZ + b.depth / 2,
          height: b.height
        });
      }
    }
  }

  createGlassWindowTexture(facadeColor, windowColor, warmLight) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Base Facade
    ctx.fillStyle = facadeColor;
    ctx.fillRect(0, 0, 128, 256);

    // Architectural Structural Grid
    ctx.strokeStyle = '#090d16';
    ctx.lineWidth = 2;
    for (let x = 0; x <= 128; x += 16) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 256); ctx.stroke();
    }

    // Windows with Warm Night-Glow Emissive Variation
    for (let y = 8; y < 256; y += 16) {
      for (let x = 4; x < 128; x += 16) {
        if (Math.random() < 0.8) {
          ctx.fillStyle = Math.random() < 0.4 ? warmLight : windowColor;
          ctx.globalAlpha = 0.75 + Math.random() * 0.25;
          ctx.fillRect(x, y, 10, 10);
        }
      }
    }
    ctx.globalAlpha = 1.0;

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 6);
    return tex;
  }

  // ==========================================================================
  // HIGH-FIDELITY UAV DRONE MODEL
  // ==========================================================================
  buildDroneModel() {
    const carbonMat = new THREE.MeshStandardMaterial({
      color: 0x1e2530,
      roughness: 0.35,
      metalness: 0.4
    });
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.4
    });

    // 1. Aerodynamic Main Fuselage
    const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.16, 1.7, 16), carbonMat);
    fuselage.rotation.x = Math.PI / 2;
    this.droneGroup.add(fuselage);

    // 2. Optical Sensor Turret under nose
    this.turret = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 12), carbonMat);
    this.turret.position.set(0, -0.19, -0.6);
    this.droneGroup.add(this.turret);

    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.06, 12), new THREE.MeshBasicMaterial({ color: 0x00f0ff }));
    lens.rotation.x = Math.PI / 2;
    lens.position.set(0, -0.19, -0.72);
    this.droneGroup.add(lens);

    // 3. High-Aspect Main Wing
    this.mainWing = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.07, 0.58), wingMat);
    this.mainWing.position.set(0, 0.06, -0.1);
    this.droneGroup.add(this.mainWing);

    // Winglets & Navigation Lights
    [-2.5, 2.5].forEach((wx, i) => {
      const winglet = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.35, 0.38), wingMat);
      winglet.position.set(wx, 0.22, -0.1);
      winglet.rotation.z = (i === 0 ? -0.22 : 0.22);
      this.droneGroup.add(winglet);

      const navLight = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 8, 8),
        new THREE.MeshBasicMaterial({ color: i === 0 ? 0xff2222 : 0x00ff88 })
      );
      navLight.position.set(wx, 0.38, -0.1);
      this.droneGroup.add(navLight);
    });

    // 4. Twin Tail Booms & Elevators
    [-1.65, 1.65].forEach(bx => {
      const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 2.1, 8), carbonMat);
      boom.rotation.x = Math.PI / 2;
      boom.position.set(bx, 0.02, 0.95);
      this.droneGroup.add(boom);

      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.55, 0.38), wingMat);
      fin.position.set(bx, 0.28, 1.95);
      this.droneGroup.add(fin);
    });

    const elevator = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.04, 0.38), wingMat);
    elevator.position.set(0, 0.09, 1.95);
    this.droneGroup.add(elevator);

    // 5. Pusher Propeller
    this.propellerGroup = new THREE.Group();
    this.propellerGroup.position.set(0, 0.02, 0.88);
    this.droneGroup.add(this.propellerGroup);

    const propHub = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.1, 12), carbonMat);
    propHub.rotation.x = Math.PI / 2;
    this.propellerGroup.add(propHub);

    [0, 1].forEach(bIdx => {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.68, 0.075), carbonMat);
      blade.rotation.z = bIdx * Math.PI;
      blade.geometry.translate(0, 0.34, 0);
      this.propellerGroup.add(blade);
    });

    // 6. Retractable Tricycle Landing Gear
    this.landingGear = new THREE.Group();
    const gearMat = new THREE.MeshStandardMaterial({ color: 0x1f2937 });

    const noseStrut = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.35, 8), gearMat);
    noseStrut.position.set(0, -0.22, -0.45);
    this.landingGear.add(noseStrut);

    const noseWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.04, 12), gearMat);
    noseWheel.rotation.z = Math.PI / 2;
    noseWheel.position.set(0, -0.38, -0.45);
    this.landingGear.add(noseWheel);

    [-0.55, 0.55].forEach(mx => {
      const mainStrut = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.35, 8), gearMat);
      mainStrut.position.set(mx, -0.22, 0.25);
      this.landingGear.add(mainStrut);

      const mainWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.05, 12), gearMat);
      mainWheel.rotation.z = Math.PI / 2;
      mainWheel.position.set(mx, -0.38, 0.25);
      this.landingGear.add(mainWheel);
    });

    this.droneGroup.add(this.landingGear);
  }

  // ==========================================================================
  // THREAT INTERCEPTOR COMBAT SYSTEM
  // ==========================================================================
  setupThreatSystem() {
    this.threatTimer = 0;
    this.threatInterval = 45; // Periodic threat check
    this.threatJets = [];

    const jetMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.6 });
    const jet = new THREE.Group();
    const jetBody = new THREE.Mesh(new THREE.ConeGeometry(0.7, 4.2, 8), jetMat);
    jetBody.rotation.x = Math.PI / 2;
    jet.add(jetBody);

    const jetWing = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.05, 1.2), jetMat);
    jetWing.position.set(0, 0, 0.2);
    jet.add(jetWing);

    jet.visible = false;
    jet.userData = { active: false, speed: 65, attackCooldown: 8.0 };
    this.scene.add(jet);
    this.threatJets.push(jet);

    // Homing Missile
    const mMat = new THREE.MeshBasicMaterial({ color: 0xff3344 });
    this.activeMissile = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.6, 8), mMat);
    this.activeMissile.rotation.x = Math.PI / 2;
    this.activeMissile.visible = false;
    this.activeMissile.userData = { active: false, speed: 75, lifeTimer: 8.0 };
    this.scene.add(this.activeMissile);
  }

  triggerThreatAttack() {
    const jet = this.threatJets[0];
    if (!jet || jet.userData.active) return;

    const dronePos = this.flightState.position;
    jet.position.set(
      dronePos.x + (Math.random() - 0.5) * 120,
      dronePos.y + 25 + Math.random() * 20,
      dronePos.z + 180
    );
    jet.visible = true;
    jet.userData.active = true;
    jet.userData.attackCooldown = 5.0;

    if (window.speechAlertEngine) {
      window.speechAlertEngine.speak("Tactical warning: Bogey detected in flight sector. Air threat inbound.", true);
    }
  }

  fireThreatMissile(fromPos) {
    this.activeMissile.position.copy(fromPos);
    this.activeMissile.visible = true;
    this.activeMissile.userData.active = true;
    this.activeMissile.userData.lifeTimer = 7.0;

    if (window.speechAlertEngine) {
      window.speechAlertEngine.speak("Warning! Missile launch detected! Perform evasive maneuvers!", true);
    }
  }

  // ==========================================================================
  // REAL-TIME 3D FLIGHT UPDATE & AERODYNAMIC ENGINE
  // ==========================================================================
  update(dt, engineTelemetry, inputKeys) {
    const { rpm, engineRunning, throttlePct } = engineTelemetry;

    // Propeller visual spinning
    if (this.propellerGroup && rpm > 40) {
      this.propellerGroup.rotation.z += (rpm / 60) * Math.PI * 2 * dt;
    }

    if (this.flightState.isCrashed) {
      this.renderer.render(this.scene, this.camera);
      return;
    }

    if (this.takeoffCooldown > 0) {
      this.takeoffCooldown -= dt;
    }

    // --- 1. DYNAMIC CELESTIAL ADVANCE ---
    if (this.autoTimeProgression) {
      this.timeOfDay = (this.timeOfDay + dt * 0.1) % 24;
      this.updateCelestialPositions();
    }

    // --- 2. SMART AUTO-TAKEOFF CONTROLLER ---
    // Triggered by 'T' key, or UI Takeoff button
    const isTakeoffKey = inputKeys['t'] || inputKeys['T'] || inputKeys['takeoff'];
    if (isTakeoffKey && this.flightState.onGround && !this.autoTakeoff.active) {
      this.autoTakeoff.active = true;
      this.autoTakeoff.stage = 'spool';
      this.takeoffCooldown = 8.0;
      if (!engineRunning && window.dashboard && window.dashboard.setEngineRunning) {
        window.dashboard.setEngineRunning(true);
      }
      window.physicsMLEngine.state.throttlePct = 100;
      if (window.speechAlertEngine) {
        window.speechAlertEngine.speak("Takeoff sequence initiated. Spooling engine to full throttle.", true);
      }
    }

    if (this.autoTakeoff.active) {
      window.physicsMLEngine.state.throttlePct = 100;
      if (this.flightState.onGround) {
        if (this.flightState.airspeedKt > 35) {
          // Gentle rotate
          this.flightState.pitchRad = Math.min(0.18, this.flightState.pitchRad + dt * 0.35);
          if (this.flightState.pitchRad > 0.08) {
            this.flightState.onGround = false;
            this.flightState.gearRetracted = true;
            this.flightState.position.y = Math.max(1.5, this.flightState.position.y);
            this.takeoffCooldown = 8.0;
            this.autoTakeoff.stage = 'climb';
            if (window.speechAlertEngine) {
              window.speechAlertEngine.speak("Rotate. UAV airborne, landing gear retracted.", false);
            }
          }
        }
      } else {
        // Airborne climb to target cruise altitude
        if (this.flightState.altitudeFt < this.autoTakeoff.targetAltFt) {
          this.flightState.pitchRad = 0.14; // Steady positive climb
        } else {
          // Level off smoothly
          this.flightState.pitchRad = 0.02;
          this.autoTakeoff.active = false;
          window.physicsMLEngine.state.throttlePct = 75; // Settle at cruise power
          if (window.speechAlertEngine) {
            window.speechAlertEngine.speak("Cruising altitude established. Fly-by-wire auto-trim active.", false);
          }
        }
      }
    }

    // --- 3. FLIGHT CONTROLS & FLY-BY-WIRE AUTO-STABILIZATION ---
    if (engineRunning) {
      // Throttle Adjustment (Keyboard + On-screen buttons):
      if (inputKeys['Shift'] || inputKeys['PageUp'] || inputKeys['btnThrUp'] || inputKeys['thrUp']) {
        window.physicsMLEngine.state.throttlePct = Math.min(100, window.physicsMLEngine.state.throttlePct + 50 * dt);
      }
      if (inputKeys['Control'] || inputKeys['PageDown'] || inputKeys['btnThrDn'] || inputKeys['thrDn']) {
        window.physicsMLEngine.state.throttlePct = Math.max(0, window.physicsMLEngine.state.throttlePct - 50 * dt);
      }

      // Pitch Controls (Up = Climb, Down = Dive):
      let pitchInput = 0;
      if (inputKeys['w'] || inputKeys['W'] || inputKeys['ArrowUp'] || inputKeys['btnPitchUp'] || inputKeys[' '] || inputKeys['Spacebar']) {
        pitchInput += 1.0; // Climb / Pitch Up
      }
      if (inputKeys['s'] || inputKeys['S'] || inputKeys['ArrowDown'] || inputKeys['btnPitchDn']) {
        pitchInput -= 1.0; // Dive / Pitch Down
      }

      // Assisted landing approach guidance
      if (this.landingApproach && !this.flightState.onGround) {
        if (this.flightState.position.y < 1.2) {
          this.flightState.pitchRad = 0.02; // Auto-flare for butter landing
        } else {
          this.flightState.pitchRad = -0.04; // Gentle glide slope
        }
      } else if (pitchInput !== 0) {
        const pitchRate = 0.55;
        this.flightState.pitchRad += pitchInput * pitchRate * dt;
        this.flightState.pitchRad = Math.max(-0.45, Math.min(0.45, this.flightState.pitchRad));
      } else if (!this.autoTakeoff.active && !this.flightState.onGround) {
        // FLY-BY-WIRE AUTO-LEVEL: Returns gently to horizontal cruise (+0.02 rad)
        this.flightState.pitchRad += (0.02 - this.flightState.pitchRad) * Math.min(1, dt * 3.5);
      }

      // Roll / Bank Controls (A/D & D-Pad):
      let rollInput = 0;
      if (inputKeys['d'] || inputKeys['D'] || inputKeys['ArrowRight'] || inputKeys['btnYawR']) rollInput += 1.0;
      if (inputKeys['a'] || inputKeys['A'] || inputKeys['ArrowLeft'] || inputKeys['btnYawL']) rollInput -= 1.0;

      if (rollInput !== 0) {
        const targetBank = rollInput * 0.55;
        this.flightState.bankRad += (targetBank - this.flightState.bankRad) * Math.min(1, dt * 5.0);
        // Coordinated turn from bank
        const turnRate = 1.15;
        this.flightState.headingRad += rollInput * turnRate * dt;
      } else if (!this.flightState.onGround) {
        // FLY-BY-WIRE AUTO-LEVEL: Returns wings level
        this.flightState.bankRad += (0 - this.flightState.bankRad) * Math.min(1, dt * 4.5);
      }

      // Rudder Yaw Controls (Q / E)
      if (inputKeys['q'] || inputKeys['Q']) this.flightState.headingRad -= 0.65 * dt;
      if (inputKeys['e'] || inputKeys['E']) this.flightState.headingRad += 0.65 * dt;

      // Landing Command (L)
      if ((inputKeys['l'] || inputKeys['L'] || inputKeys['land']) && !this.flightState.onGround) {
        this.autoTakeoff.active = false;
        this.landingApproach = true;
        this.takeoffCooldown = 0;
        this.flightState.gearRetracted = false;
        window.physicsMLEngine.state.throttlePct = 25;
        this.flightState.pitchRad = -0.04;
        if (window.speechAlertEngine) {
          window.speechAlertEngine.speak("Initiating landing descent. Landing gear deployed.", true);
        }
      }
    } else {
      // Engine off glide damping
      this.flightState.bankRad *= 0.92;
      this.flightState.pitchRad *= 0.92;
    }

    // --- 4. AIRSPEED & AERODYNAMIC ACCELERATION ---
    const throttleRatio = throttlePct / 100;
    const targetAirspeed = engineRunning ? (throttleRatio * 85) : 0;
    this.flightState.airspeedKt += (targetAirspeed - this.flightState.airspeedKt) * Math.min(1, dt * 1.6);

    // Manual Ground Rotation Takeoff
    if (this.flightState.onGround && this.flightState.airspeedKt > 35 && this.flightState.pitchRad > 0.05) {
      this.flightState.onGround = false;
      this.flightState.gearRetracted = true;
      this.flightState.position.y = Math.max(1.5, this.flightState.position.y);
      this.takeoffCooldown = 8.0;
      if (window.speechAlertEngine) {
        window.speechAlertEngine.speak("Rotate. Airborne, gear retracted.", false);
      }
    }

    // Gear Visibility
    if (this.landingGear) {
      this.landingGear.visible = !this.flightState.gearRetracted;
    }

    // --- 5. 3D POSITION TRANSLATION & AERODYNAMIC LIFT ---
    const forwardX = Math.sin(this.flightState.headingRad);
    const forwardZ = -Math.cos(this.flightState.headingRad);
    const forwardSpeedUnits = (this.flightState.airspeedKt * 0.514) * 0.75; // Scaled knots to units/sec

    this.flightState.position.x += forwardX * forwardSpeedUnits * dt;
    this.flightState.position.z += forwardZ * forwardSpeedUnits * dt;

    if (!this.flightState.onGround) {
      // Aerodynamic lift vs weight balance
      const liftFactor = Math.pow(Math.max(0, this.flightState.airspeedKt / 35), 2);
      const verticalClimb = Math.sin(this.flightState.pitchRad) * forwardSpeedUnits * 1.5;
      const gravitySink = liftFactor >= 1.0 ? 0 : (1.0 - liftFactor) * -3.5;

      const totalVy = verticalClimb + gravitySink;
      this.flightState.position.y = Math.max(0.42, this.flightState.position.y + totalVy * dt);
      this.flightState.altitudeFt = Math.max(0, (this.flightState.position.y - 0.42) * 85);
      this.flightState.verticalSpeedFpm = totalVy * 60 * 3.28;

      // Safe Touchdown / Flare Check (ONLY when descending and after takeoff established)
      if (this.takeoffCooldown <= 0 && this.flightState.position.y <= 0.46 && totalVy <= 0) {
        if (!this.flightState.gearRetracted && this.flightState.airspeedKt <= 75 && totalVy > -6.5) {
          // Safe Touchdown!
          this.flightState.onGround = true;
          this.flightState.gearRetracted = false;
          this.flightState.position.y = 0.42;
          this.flightState.pitchRad = 0;
          this.flightState.bankRad = 0;
          this.flightState.verticalSpeedFpm = 0;
          this.landingApproach = false;
          if (window.speechAlertEngine) {
            window.speechAlertEngine.speak("Touchdown confirmed. Aircraft safely on runway.", true);
          }
          if (window.dashboard) {
            window.dashboard.showAlert("🛬 Touchdown confirmed! Aircraft safely rolled out on runway.", "info");
          }
        } else if (this.flightState.gearRetracted && this.flightState.position.y <= 0.43) {
          this.triggerCrash("CRASH: Belly landing with gear retracted!");
          return;
        } else if (this.flightState.airspeedKt > 75) {
          this.triggerCrash("CRASH ON TOUCHDOWN: Airspeed exceeded safe landing limit (>75 kt)!");
          return;
        } else if (totalVy <= -6.5) {
          this.triggerCrash("HARD IMPACT: Excessive descent sink rate on touchdown!");
          return;
        }
      }
    } else {
      this.flightState.position.y = 0.42;
      this.flightState.altitudeFt = 0;
      this.flightState.verticalSpeedFpm = 0;
    }

    // Sync Drone Model 3D Transform
    this.droneGroup.position.copy(this.flightState.position);
    this.droneGroup.rotation.y = this.flightState.headingRad;
    this.droneGroup.rotation.x = this.flightState.onGround ? 0 : -this.flightState.pitchRad;
    this.droneGroup.rotation.z = this.flightState.onGround ? 0 : this.flightState.bankRad;

    // --- 6. UPDATE INFINITE PROCEDURAL METROPOLIS ---
    this.updateInfiniteMetropolis(false);

    // --- 7. CELESTIAL POSITION TRACKING ---
    this.updateCelestialPositions();

    // --- 8. TERRAIN COLLISION AVOIDANCE (TAWS / GPWS) ---
    this.checkTerrainCollisions(forwardX, forwardZ);

    // --- 9. ENEMY THREAT COMBAT ---
    this.updateThreatCombat(dt);

    // --- 10. CHASE CAMERA POSITIONING ---
    this.updateCamera(dt, forwardX, forwardZ);

    // --- 11. GIMBAL EO/IR FEED ---
    if (this.gimbalCamera && this.gimbalRenderer && this.turret) {
      const turretWorldPos = new THREE.Vector3();
      this.turret.getWorldPosition(turretWorldPos);
      this.gimbalCamera.position.copy(turretWorldPos);

      const target = turretWorldPos.clone().add(new THREE.Vector3(forwardX, -0.35, forwardZ).multiplyScalar(40));
      this.gimbalCamera.lookAt(target);
      this.gimbalRenderer.render(this.scene, this.gimbalCamera);
    }

    // Render Main 3D Viewport
    this.renderer.render(this.scene, this.camera);
  }

  // Check 3D Building Obstacle Proximity & Collision
  checkTerrainCollisions(fwdX, fwdZ) {
    if (this.flightState.onGround || (this.takeoffCooldown && this.takeoffCooldown > 3.0)) return;

    const dronePos = this.flightState.position;
    let collisionRiskAhead = false;

    for (let i = 0; i < this.buildingColliders.length; i++) {
      const b = this.buildingColliders[i];

      if (dronePos.y < b.height) {
        // Physical Impact Check
        if (dronePos.x >= b.minX - 1.2 && dronePos.x <= b.maxX + 1.2 &&
            dronePos.z >= b.minZ - 1.2 && dronePos.z <= b.maxZ + 1.2) {
          this.triggerCrash("CRITICAL IMPACT: UAV Collided with Skyscraper Building!");
          return;
        }

        // Forward TAWS / GPWS Radar Check (50m ahead)
        const aheadPos = dronePos.clone().add(new THREE.Vector3(fwdX, 0, fwdZ).multiplyScalar(50));
        if (aheadPos.x >= b.minX - 8 && aheadPos.x <= b.maxX + 8 &&
            aheadPos.z >= b.minZ - 8 && aheadPos.z <= b.maxZ + 8) {
          collisionRiskAhead = true;
        }
      }
    }

    // Voice Alert if terrain hazard ahead
    const now = Date.now();
    if (collisionRiskAhead) {
      this.flightState.terrainWarningActive = true;
      if (now - this.flightState.lastTerrainWarningTime > 3500) {
        this.flightState.lastTerrainWarningTime = now;
        if (window.speechAlertEngine) {
          window.speechAlertEngine.speak("Warning! Terrain ahead! Pull up! Turn around! Pull up!", true);
        }
      }
    } else {
      this.flightState.terrainWarningActive = false;
    }
  }

  updateThreatCombat(dt) {
    if (this.flightState.onGround || this.flightState.isCrashed) return;

    this.threatTimer += dt;
    if (this.threatTimer > this.threatInterval) {
      this.threatTimer = 0;
      this.triggerThreatAttack();
    }

    const jet = this.threatJets[0];
    if (jet && jet.userData.active) {
      jet.position.add(new THREE.Vector3(0, 0, -jet.userData.speed * dt));
      jet.userData.attackCooldown -= dt;

      if (jet.userData.attackCooldown <= 0 && !this.activeMissile.userData.active) {
        this.fireThreatMissile(jet.position.clone());
        jet.userData.active = false;
        jet.visible = false;
      }
    }

    if (this.activeMissile.userData.active) {
      this.activeMissile.userData.lifeTimer -= dt;
      const mPos = this.activeMissile.position;
      const targetPos = this.droneGroup.position;

      const dir = targetPos.clone().sub(mPos);
      const dist = dir.length();
      dir.normalize();

      mPos.add(dir.multiplyScalar(this.activeMissile.userData.speed * dt));
      this.activeMissile.lookAt(targetPos);

      if (dist < 3.5) {
        this.activeMissile.userData.active = false;
        this.activeMissile.visible = false;

        this.flightState.airframeIntegrityPct = Math.max(0, this.flightState.airframeIntegrityPct - 30);
        window.physicsMLEngine.state.vibrationRmsG += 3.5;

        const viewportEl = document.getElementById('flightViewport');
        if (viewportEl) {
          viewportEl.classList.add('damage-flash');
          setTimeout(() => viewportEl.classList.remove('damage-flash'), 800);
        }

        if (window.speechAlertEngine) {
          window.speechAlertEngine.speak("Alert! Missile hit detected! Airframe integrity degraded!", true);
        }
      } else if (this.activeMissile.userData.lifeTimer <= 0) {
        this.activeMissile.userData.active = false;
        this.activeMissile.visible = false;
        if (window.speechAlertEngine) {
          window.speechAlertEngine.speak("Threat neutralized. Missile evaded.", false);
        }
      }
    }
  }

  updateCamera(dt, fwdX, fwdZ) {
    const fwd = new THREE.Vector3(fwdX, 0, fwdZ);

    if (this.cameraMode === 'chase') {
      const behindOffset = fwd.clone().multiplyScalar(-9.5);
      const targetCamPos = this.droneGroup.position.clone()
        .add(behindOffset)
        .add(new THREE.Vector3(0, 3.8, 0));

      this.camera.position.lerp(targetCamPos, Math.min(1, dt * 5.5));
      this.camera.lookAt(this.droneGroup.position.clone().add(new THREE.Vector3(0, 0.45, 0)));
    } else if (this.cameraMode === 'cockpit') {
      const nosePos = this.droneGroup.position.clone().add(fwd.clone().multiplyScalar(0.7)).add(new THREE.Vector3(0, 0.15, 0));
      this.camera.position.lerp(nosePos, Math.min(1, dt * 10.0));
      this.camera.lookAt(nosePos.clone().add(fwd.clone().multiplyScalar(30)));
    } else if (this.cameraMode === 'map') {
      const mapPos = new THREE.Vector3(
        this.droneGroup.position.x,
        this.droneGroup.position.y + 120,
        this.droneGroup.position.z + 0.01
      );
      this.camera.position.lerp(mapPos, Math.min(1, dt * 4.0));
      this.camera.lookAt(this.droneGroup.position);
    }
  }

  setCameraMode(mode) {
    this.cameraMode = mode;
  }

  resetFlight() {
    this.flightState.position.set(0, 0.42, 0);
    this.flightState.velocity.set(0, 0, 0);
    this.flightState.airspeedKt = 0;
    this.flightState.altitudeFt = 0;
    this.flightState.verticalSpeedFpm = 0;
    this.flightState.headingRad = 0;
    this.flightState.pitchRad = 0;
    this.flightState.bankRad = 0;
    this.flightState.onGround = true;
    this.flightState.gearRetracted = false;
    this.flightState.braking = false;
    this.flightState.airframeIntegrityPct = 100;
    this.flightState.isCrashed = false;
    this.flightState.terrainWarningActive = false;
    this.autoTakeoff.active = false;
    this.takeoffCooldown = 0;
    this.landingApproach = false;

    if (this.droneGroup) {
      this.droneGroup.position.set(0, 0.42, 0);
      this.droneGroup.rotation.set(0, 0, 0);
    }

    if (this.landingGear) {
      this.landingGear.visible = true;
    }

    this.updateInfiniteMetropolis(true);

    const viewportEl = document.getElementById('flightViewport');
    if (viewportEl) viewportEl.classList.remove('damage-flash');

    if (window.speechAlertEngine) {
      window.speechAlertEngine.stopAlarmBeeper();
      window.speechAlertEngine.speak("Flight reset to runway. Aircraft ready for departure.", true);
    }

    const alertBanner = document.getElementById('alertBanner');
    if (alertBanner) alertBanner.style.display = 'none';
  }

  triggerCrash(reason) {
    this.flightState.isCrashed = true;
    this.flightState.airframeIntegrityPct = 0;
    this.flightState.airspeedKt = 0;
    window.physicsMLEngine.state.engineRunning = false;
    window.physicsMLEngine.state.vibrationRmsG = 5.0;

    const viewportEl = document.getElementById('flightViewport');
    if (viewportEl) viewportEl.classList.add('damage-flash');

    if (window.speechAlertEngine) {
      window.speechAlertEngine.speak(`Emergency! ${reason}`, true);
    }
    const alertBanner = document.getElementById('alertBanner');
    if (alertBanner) {
      alertBanner.style.display = 'flex';
      alertBanner.className = 'alert-banner danger';
      alertBanner.textContent = `💥 ${reason} Press START ENGINE / RESET (R) to reinitialize.`;
    }
  }

  onResize() {
    if (!this.container) return;
    const w = this.container.clientWidth || 600;
    const h = this.container.clientHeight || 400;
    if (w <= 0 || h <= 0) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }
}

window.Flight3DViewer = Flight3DViewer;
