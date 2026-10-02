/**
 * ============================================================================
 * REALISTIC 3D UAV FLIGHT SIMULATOR & INFINITE GOLDEN-HOUR VOLUMETRIC WORLD
 * ============================================================================
 * Features:
 * - High-Fidelity MQ-9 Reaper / Predator MALE UAV (Exact match to reference photo):
 *   * Tactical military light-grey streamline fuselage with SATCOM nose radome hump.
 *   * Long high-aspect glider wings with prominent upturned vertical winglets.
 *   * Inverted-Y tail (V-tail ruddervators + downward ventral fin).
 *   * Rear tail pusher propeller with polished chrome bullet spinner & motion blur disc.
 *   * Underwing hardpoint pylons with AGM-114 Hellfire missile pods.
 *   * Ventral chin FLIR/EO/IR optical turret with multi-spectral sensor lenses.
 *   * Retractable tricycle landing gear with automatic bay door sequencing.
 * - Sea of Cumulus Clouds: Dense, rolling, golden-hour volumetric cloud deck
 *   stretching infinitely across the horizon, matching the user reference photo.
 * - Infinite Procedural Landscape: Lush green agricultural fields, forests/trees,
 *   rivers, highway networks, downtown skyscrapers, and military airbase runway.
 * - Rock-Solid Coordinated Flight Controls:
 *   * Responsive Fly-By-Wire turning: Left (A/LeftArrow) banks & carves left,
 *     Right (D/RightArrow) banks & carves right with automatic coordinated yaw.
 *   * Strictly positive airspeed: ZERO reverse drift or inverted movement.
 *   * Smooth auto-leveling trim and stable chase camera tracking.
 * ============================================================================
 */

class Flight3DViewer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.scene = new THREE.Scene();

    // 1. Perspective Camera with long view frustum for massive vistas
    const aspect = (this.container.clientWidth || 800) / (this.container.clientHeight || 500);
    this.camera = new THREE.PerspectiveCamera(52, aspect, 0.3, 10000);
    this.camera.position.set(0, 3.8, 10.5);

    // 2. High-Performance WebGL Renderer with ACES Filmic Tone Mapping
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.container.clientWidth || 800, this.container.clientHeight || 500);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.18;
    this.container.appendChild(this.renderer.domElement);

    // 3. Physical Flight State (Aeronautical Coordinates)
    this.flightState = {
      position: new THREE.Vector3(0, 0.42, 0), // Starts on runway centerline
      velocity: new THREE.Vector3(0, 0, 0),
      airspeedKt: 0,
      altitudeFt: 0,
      verticalSpeedFpm: 0,
      headingRad: 0,     // 0 = North (-Z), increases clockwise (East = +X)
      pitchRad: 0,       // Positive = nose up (climb), negative = nose down
      bankRad: 0,        // Positive = right wing down (bank right), negative = bank left
      onGround: true,
      gearRetracted: false,
      braking: false,
      airframeIntegrityPct: 100,
      isCrashed: false,
      terrainWarningActive: false,
      lastTerrainWarningTime: 0
    };

    // Auto-Takeoff Controller State
    this.autoTakeoff = {
      active: false,
      stage: 'idle', // 'spool', 'roll', 'rotate', 'climb'
      targetY: 66.0  // Cruising height right above the cloud blanket (skimming clouds like photo)
    };

    this.takeoffCooldown = 0;
    this.landingApproach = false;

    // Camera Mode
    this.cameraMode = 'chase'; // 'chase', 'cockpit', 'map'
    this.camTargetPos = new THREE.Vector3(0, 4, 11);
    this.camLookTarget = new THREE.Vector3(0, 0.4, 0);

    // 4. Build MQ-9 Predator/Reaper UAV Model
    this.droneGroup = new THREE.Group();
    this.droneGroup.rotation.order = 'YXZ'; // Yaw (Y) -> Pitch (X) -> Roll (Z)
    this.droneGroup.position.copy(this.flightState.position);
    this.scene.add(this.droneGroup);
    this.buildDroneModel();

    // 5. Setup Live Gimbal PiP Cam
    this.setupGimbalCamera();

    // 6. Dynamic Golden-Hour Celestial Atmosphere & Sky
    this.timeOfDay = 17.2; // 17:15 Golden-Hour sunset cruise (exact match to image)
    this.autoTimeProgression = false;
    this.setupCelestialAtmosphere();

    // 7. Infinite Sea of Cumulus Clouds
    this.setupInfiniteCloudSea();

    // 8. Infinite Realistic Earth Below (Patchwork green fields, trees, city, runway)
    this.buildInfiniteEarthAndMetropolis();

    // 9. Threat Interceptor System
    this.setupThreatSystem();

    // Window Resizing
    window.addEventListener('resize', () => this.onResize());
  }

  // ==========================================================================
  // 1. CELESTIAL ATMOSPHERE & GOLDEN-HOUR LIGHTING (Exact match to photo)
  // ==========================================================================
  setupCelestialAtmosphere() {
    // Warm golden ambient skylight
    this.ambientLight = new THREE.AmbientLight(0xfce6d0, 1.05);
    this.scene.add(this.ambientLight);

    // Warm directional Golden-Hour Sun (Front-left angle matching reference image)
    this.sunLight = new THREE.DirectionalLight(0xffe4c2, 1.95);
    this.sunLight.castShadow = true;
    this.scene.add(this.sunLight);

    // Visible 3D Celestial Sun Sphere
    const sunGeo = new THREE.SphereGeometry(42, 24, 24);
    const sunMat = new THREE.MeshBasicMaterial({
      color: 0xfff6e4,
      transparent: true,
      opacity: 0.98
    });
    this.sunMesh = new THREE.Mesh(sunGeo, sunMat);
    this.scene.add(this.sunMesh);

    // Sun Corona Glow
    const coronaGeo = new THREE.RingGeometry(42, 85, 32);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xfdbd5c,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45
    });
    this.sunCorona = new THREE.Mesh(coronaGeo, coronaMat);
    this.sunMesh.add(this.sunCorona);

    // Moon Light & Mesh (for night cycles)
    this.moonLight = new THREE.DirectionalLight(0xa5c8ec, 0.0);
    this.scene.add(this.moonLight);

    const moonGeo = new THREE.SphereGeometry(22, 24, 24);
    const moonMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.8,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.2
    });
    this.moonMesh = new THREE.Mesh(moonGeo, moonMat);
    this.scene.add(this.moonMesh);

    // Sky Color Palettes (Soft warm amber-peach matching photo)
    this.skySunset = new THREE.Color(0xd5bda0); // Warm Golden-Hour Sunset Sky
    this.skyDay = new THREE.Color(0x7aaed4);    // Daytime Sky
    this.skyNight = new THREE.Color(0x060914);  // Night Sky
    this.scene.background = this.skySunset.clone();

    // Clear Atmospheric Distance Fog (keeps drone, clouds, and terrain crisp and vibrant)
    this.scene.fog = new THREE.Fog(0xd5bda0, 900, 8500);

    // Starfield for night mode
    const starGeo = new THREE.BufferGeometry();
    const starCount = 1200;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const radius = 3200 + Math.random() * 400;
      starPos[i] = radius * Math.sin(phi) * Math.cos(theta);
      starPos[i + 1] = Math.abs(radius * Math.cos(phi)) + 80;
      starPos[i + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    this.starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 2.5,
      transparent: true,
      opacity: 0.0
    });
    this.starField = new THREE.Points(starGeo, this.starMat);
    this.scene.add(this.starField);

    this.updateCelestialPositions();
  }

  updateCelestialPositions() {
    const dronePos = (this.flightState && this.flightState.position) ? this.flightState.position : new THREE.Vector3(0, 0, 0);

    // Sun angle in Golden-Hour (low front-left angle)
    const orbitAngle = ((this.timeOfDay - 6) / 24) * (Math.PI * 2);
    const orbitDist = 2600;

    const sunX = dronePos.x - Math.cos(orbitAngle) * orbitDist * 0.9;
    const sunY = Math.sin(orbitAngle) * (orbitDist * 0.65);
    const sunZ = dronePos.z - 950;

    this.sunMesh.position.set(sunX, sunY, sunZ);
    this.sunLight.position.set(sunX, Math.max(90, sunY), sunZ);
    this.sunCorona.lookAt(dronePos);

    // Moon Position
    const moonX = dronePos.x + Math.cos(orbitAngle) * orbitDist * 0.9;
    const moonY = -Math.sin(orbitAngle) * (orbitDist * 0.65);
    const moonZ = dronePos.z + 950;

    this.moonMesh.position.set(moonX, moonY, moonZ);
    this.moonLight.position.set(moonX, Math.max(90, moonY), moonZ);

    const sunElevation = sunY / orbitDist;
    const dayFactor = Math.max(0, Math.min(1, (sunElevation + 0.12) / 0.35));
    const sunsetFactor = Math.max(0, 1 - Math.abs(sunElevation - 0.22) * 3.8);

    if (dayFactor > 0.35) {
      if (sunsetFactor > 0.25) {
        // Glorious Golden-Hour Glow (matching photo)
        this.scene.background.lerpColors(this.skyDay, this.skySunset, sunsetFactor);
        if (this.scene.fog) this.scene.fog.color.copy(this.skySunset);
        this.sunLight.color.setHex(0xffe4c2);
        this.ambientLight.color.setHex(0xfce6d0);
      } else {
        // Day Blue
        this.scene.background.copy(this.skyDay);
        if (this.scene.fog) this.scene.fog.color.copy(this.skyDay);
        this.sunLight.color.setHex(0xfffaed);
        this.ambientLight.color.setHex(0xdbeafe);
      }
    } else {
      // Night Sky
      this.scene.background.copy(this.skyNight);
      if (this.scene.fog) this.scene.fog.color.copy(this.skyNight);
      this.sunLight.intensity = 0;
      this.moonLight.intensity = 0.45;
      this.ambientLight.color.setHex(0x1a243b);
      this.ambientLight.intensity = 0.35;
    }

    if (dayFactor > 0.2) {
      this.sunLight.intensity = 1.0 + dayFactor * 0.95;
      this.ambientLight.intensity = 0.6 + dayFactor * 0.45;
      if (this.starMat) this.starMat.opacity = 0;
    } else {
      if (this.starMat) this.starMat.opacity = Math.min(0.9, (0.2 - dayFactor) * 4.5);
    }
  }

  setTimeOfDay(val) {
    this.timeOfDay = parseFloat(val);
    this.updateCelestialPositions();
  }

  // ==========================================================================
  // 2. CONTINUOUS OCEAN OF BILLOWING CUMULUS CLOUDS (Exact match to image!)
  // ==========================================================================
  setupInfiniteCloudSea() {
    this.cloudGroup = new THREE.Group();
    this.scene.add(this.cloudGroup);

    // Warm-tinted fluffy cumulus cloud material
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xfffcf5,
      roughness: 0.92,
      metalness: 0.02,
      transparent: true,
      opacity: 0.95,
      depthWrite: false
    });

    // Dense billowing ocean of cumulus cloud mounds (280 clusters covering 3000m)
    this.cloudPuffs = [];
    this.CLOUD_COUNT = 280;
    this.CLOUD_SPAN = 3000; // Radius around drone

    const puffGeo1 = new THREE.SphereGeometry(18, 10, 8);
    const puffGeo2 = new THREE.SphereGeometry(28, 10, 8);
    const puffGeo3 = new THREE.SphereGeometry(38, 12, 10);

    for (let i = 0; i < this.CLOUD_COUNT; i++) {
      const cluster = new THREE.Group();

      // Billowing cumulus cluster with 5 to 7 rounded puff spheres
      const numSpheres = 5 + Math.floor(Math.random() * 3);
      for (let s = 0; s < numSpheres; s++) {
        const geoChoice = (s === 0) ? puffGeo3 : (s % 2 === 0 ? puffGeo2 : puffGeo1);
        const puff = new THREE.Mesh(geoChoice, cloudMat);
        puff.position.set(
          (Math.random() - 0.5) * 46,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 46
        );
        puff.scale.set(
          1.15 + Math.random() * 0.35,
          0.65 + Math.random() * 0.3, // Flattened cumulus base
          1.15 + Math.random() * 0.35
        );
        cluster.add(puff);
      }

      // Natural cloud deck altitude: y = 36 to 52
      const rx = (Math.random() - 0.5) * this.CLOUD_SPAN;
      const rz = (Math.random() - 0.5) * this.CLOUD_SPAN;
      const ry = 38 + Math.random() * 14;

      cluster.position.set(rx, ry, rz);
      this.cloudGroup.add(cluster);
      this.cloudPuffs.push({
        group: cluster,
        baseY: ry
      });
    }

    // High Altitude Wispy Cirrus Ceiling (y = 320)
    const cirrusGeo = new THREE.PlaneGeometry(4500, 4500);
    const cirrusMat = new THREE.MeshBasicMaterial({
      color: 0xffeed8,
      transparent: true,
      opacity: 0.14,
      side: THREE.DoubleSide
    });
    this.cirrusPlane = new THREE.Mesh(cirrusGeo, cirrusMat);
    this.cirrusPlane.rotation.x = -Math.PI / 2;
    this.cirrusPlane.position.set(0, 320, 0);
    this.scene.add(this.cirrusPlane);
  }

  // Continuously wrap clouds around the drone so the cloud sea never ends!
  updateCloudSea(dronePos) {
    if (!this.cloudPuffs) return;

    const span = this.CLOUD_SPAN;
    const halfSpan = span / 2;

    for (let i = 0; i < this.cloudPuffs.length; i++) {
      const c = this.cloudPuffs[i];
      let dx = c.group.position.x - dronePos.x;
      let dz = c.group.position.z - dronePos.z;

      while (dx > halfSpan) { c.group.position.x -= span; dx -= span; }
      while (dx < -halfSpan) { c.group.position.x += span; dx += span; }

      while (dz > halfSpan) { c.group.position.z -= span; dz -= span; }
      while (dz < -halfSpan) { c.group.position.z += span; dz += span; }
    }

    if (this.cirrusPlane) {
      this.cirrusPlane.position.x = dronePos.x;
      this.cirrusPlane.position.z = dronePos.z;
    }
  }

  // ==========================================================================
  // 3. INFINITE REALISTIC EARTH & METROPOLIS ("land, trees greenry, city")
  // ==========================================================================
  buildInfiniteEarthAndMetropolis() {
    // A. Massive Dynamic Infinite Ground Plane
    const groundGeo = new THREE.PlaneGeometry(5500, 5500, 32, 32);
    const terrainTexture = this.generateSatelliteTerrainTexture();
    const groundMat = new THREE.MeshStandardMaterial({
      map: terrainTexture,
      roughness: 0.88,
      metalness: 0.08
    });
    this.groundMesh = new THREE.Mesh(groundGeo, groundMat);
    this.groundMesh.rotation.x = -Math.PI / 2;
    this.groundMesh.position.set(0, 0, 0);
    this.scene.add(this.groundMesh);

    // B. Base Military Airbase Runway (1400m Long, Origin Centered)
    this.runwayGroup = new THREE.Group();
    this.scene.add(this.runwayGroup);

    const runwayGeo = new THREE.PlaneGeometry(32, 900);
    const runwayMat = new THREE.MeshStandardMaterial({
      color: 0x1f242d,
      roughness: 0.75
    });
    const runwaySurface = new THREE.Mesh(runwayGeo, runwayMat);
    runwaySurface.rotation.x = -Math.PI / 2;
    runwaySurface.position.set(0, 0.04, 0);
    this.runwayGroup.add(runwaySurface);

    // Runway Centerline White Stripes
    for (let rz = -420; rz <= 420; rz += 28) {
      const stripe = new THREE.Mesh(
        new THREE.PlaneGeometry(1.6, 14),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(0, 0.06, rz);
      this.runwayGroup.add(stripe);
    }

    // Runway Threshold Piano Keys
    [-12, -8, -4, 0, 4, 8, 12].forEach(tx => {
      const key1 = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 22), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      key1.rotation.x = -Math.PI / 2;
      key1.position.set(tx, 0.06, -430);
      this.runwayGroup.add(key1);

      const key2 = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 22), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      key2.rotation.x = -Math.PI / 2;
      key2.position.set(tx, 0.06, 430);
      this.runwayGroup.add(key2);
    });

    // Green approach & Red departure lights
    for (let lx = -15; lx <= 15; lx += 3.5) {
      const gLight = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), new THREE.MeshBasicMaterial({ color: 0x00ff88 }));
      gLight.position.set(lx, 0.15, -445);
      this.runwayGroup.add(gLight);

      const rLight = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff2244 }));
      rLight.position.set(lx, 0.15, 445);
      this.runwayGroup.add(rLight);
    }

    // C. 3D Trees & Greenery Groves Across the Landscape
    this.treeGroup = new THREE.Group();
    this.scene.add(this.treeGroup);
    this.treeClusters = [];

    const trunkGeo = new THREE.CylinderGeometry(0.4, 0.7, 5.0, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.9 });
    const foliageGeo1 = new THREE.ConeGeometry(3.6, 8.5, 7);
    const foliageGeo2 = new THREE.SphereGeometry(4.2, 7, 6);
    const foliageMatPine = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.85 }); // Deep pine
    const foliageMatDeciduous = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.85 }); // Lush emerald

    // Create 60 dense tree groves that stream around the world
    for (let t = 0; t < 65; t++) {
      const grove = new THREE.Group();
      const numTreesInGrove = 3 + Math.floor(Math.random() * 4);

      for (let k = 0; k < numTreesInGrove; k++) {
        const singleTree = new THREE.Group();
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 2.5;
        singleTree.add(trunk);

        const isPine = Math.random() < 0.6;
        const foliage = new THREE.Mesh(isPine ? foliageGeo1 : foliageGeo2, isPine ? foliageMatPine : foliageMatDeciduous);
        foliage.position.y = isPine ? 7.2 : 6.0;
        singleTree.add(foliage);

        singleTree.position.set(
          (Math.random() - 0.5) * 24,
          0,
          (Math.random() - 0.5) * 24
        );
        grove.add(singleTree);
      }

      // Keep runway corridor clear
      let tx = (Math.random() - 0.5) * 2400;
      let tz = (Math.random() - 0.5) * 2400;
      if (Math.abs(tx) < 70) tx = (tx >= 0 ? 1 : -1) * (85 + Math.random() * 200);

      grove.position.set(tx, 0, tz);
      this.treeGroup.add(grove);
      this.treeClusters.push({ group: grove, origX: tx, origZ: tz });
    }

    // D. Procedural Skyscraper District (Metropolis Sector)
    this.buildingPool = [];
    this.buildingColliders = [];
    this.BLOCK_SIZE = 85;
    this.activeChunkX = 0;
    this.activeChunkZ = 0;

    const glassTex = this.createSkyscraperGlassTexture();
    const towerMat = new THREE.MeshStandardMaterial({
      map: glassTex,
      roughness: 0.25,
      metalness: 0.6
    });

    const GRID_DIM = 9; // 9x9 = 81 dynamic skyscraper blocks
    const HALF_DIM = Math.floor(GRID_DIM / 2);

    for (let gx = -HALF_DIM; gx <= HALF_DIM; gx++) {
      for (let gz = -HALF_DIM; gz <= HALF_DIM; gz++) {
        // Realistic ground-level buildings (8m to 24m) sitting underneath the cloud deck
        const height = 8 + Math.random() * 12 + (Math.random() < 0.25 ? Math.random() * 6 : 0);
        const width = 16 + Math.random() * 10;
        const depth = 16 + Math.random() * 10;

        const bMesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), towerMat);
        this.scene.add(bMesh);

        // Rooftop Antenna Spire with FAA Red Beacon
        const spire = new THREE.Mesh(
          new THREE.CylinderGeometry(0.12, 0.35, 6, 6),
          new THREE.MeshBasicMaterial({ color: 0xff2244 })
        );
        this.scene.add(spire);

        this.buildingPool.push({
          gridOffsetX: gx,
          gridOffsetZ: gz,
          mesh: bMesh,
          spire: spire,
          width: width,
          depth: depth,
          height: height
        });
      }
    }

    this.updateMetropolisAndTerrain(true);
  }

  // Satellite Terrain Canvas Generator (Lush green agriculture, rivers, roads, and cities)
  generateSatelliteTerrainTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Base deep countryside green
    ctx.fillStyle = '#1e3d2f';
    ctx.fillRect(0, 0, 1024, 1024);

    // Patchwork Agricultural Fields (Forest green, olive, emerald, wheat)
    const fieldColors = [
      '#1b4332', '#2d6a4f', '#40916c', '#52b788', '#2d5032',
      '#3f6634', '#556b2f', '#6b8e23', '#859b48', '#8a7d45'
    ];

    for (let y = 0; y < 1024; y += 64) {
      for (let x = 0; x < 1024; x += 64) {
        const color = fieldColors[Math.floor(Math.random() * fieldColors.length)];
        ctx.fillStyle = color;
        ctx.fillRect(x + 2, y + 2, 60, 60);

        // Field borders
        ctx.strokeStyle = '#142c20';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 2, y + 2, 60, 60);
      }
    }

    // Winding River Ribbon
    ctx.strokeStyle = '#1e3a5f';
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.moveTo(0, 220);
    ctx.bezierCurveTo(340, 280, 520, 620, 1024, 780);
    ctx.stroke();

    // River sand bank
    ctx.strokeStyle = 'rgba(164, 180, 148, 0.4)';
    ctx.lineWidth = 26;
    ctx.beginPath();
    ctx.moveTo(0, 220);
    ctx.bezierCurveTo(340, 280, 520, 620, 1024, 780);
    ctx.stroke();

    // Highway arterials
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(180, 0);
    ctx.lineTo(240, 1024);
    ctx.moveTo(0, 540);
    ctx.lineTo(1024, 500);
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(16, 16);
    return tex;
  }

  createSkyscraperGlassTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#1a2230';
    ctx.fillRect(0, 0, 128, 256);

    ctx.strokeStyle = '#0d131e';
    ctx.lineWidth = 2;
    for (let x = 0; x <= 128; x += 16) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 256); ctx.stroke();
    }

    for (let y = 8; y < 256; y += 16) {
      for (let x = 4; x < 128; x += 16) {
        if (Math.random() < 0.75) {
          ctx.fillStyle = Math.random() < 0.3 ? '#fed7aa' : '#38bdf8';
          ctx.globalAlpha = 0.8;
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

  // Infinite Streaming of Metropolis & Ground Plane
  updateMetropolisAndTerrain(force = false) {
    const dronePos = (this.flightState && this.flightState.position) ? this.flightState.position : new THREE.Vector3(0, 0, 0);
    const currentChunkX = Math.floor(dronePos.x / this.BLOCK_SIZE);
    const currentChunkZ = Math.floor(dronePos.z / this.BLOCK_SIZE);

    if (!force && currentChunkX === this.activeChunkX && currentChunkZ === this.activeChunkZ) {
      return;
    }

    this.activeChunkX = currentChunkX;
    this.activeChunkZ = currentChunkZ;

    // Follow Ground Plane Seamlessly
    if (this.groundMesh) {
      this.groundMesh.position.x = currentChunkX * this.BLOCK_SIZE;
      this.groundMesh.position.z = currentChunkZ * this.BLOCK_SIZE;
    }

    // Refresh Skyscraper positions and colliders
    this.buildingColliders = [];

    for (let i = 0; i < this.buildingPool.length; i++) {
      const b = this.buildingPool[i];
      const worldBlockX = (currentChunkX + b.gridOffsetX) * this.BLOCK_SIZE;
      const worldBlockZ = (currentChunkZ + b.gridOffsetZ) * this.BLOCK_SIZE;

      // Keep Airport Runway Zone open (X: -65 to +65, Z: -600 to +600)
      const inRunwayZone = Math.abs(worldBlockX) < 65 && worldBlockZ > -600 && worldBlockZ < 600;

      if (inRunwayZone) {
        b.mesh.visible = false;
        b.spire.visible = false;
      } else {
        b.mesh.visible = true;
        b.spire.visible = true;
        b.mesh.position.set(worldBlockX, b.height / 2, worldBlockZ);
        b.spire.position.set(worldBlockX, b.height + 6, worldBlockZ);

        this.buildingColliders.push({
          minX: worldBlockX - b.width / 2,
          maxX: worldBlockX + b.width / 2,
          minZ: worldBlockZ - b.depth / 2,
          maxZ: worldBlockZ + b.depth / 2,
          height: b.height
        });
      }
    }

    // Wrap tree groves
    if (this.treeClusters) {
      const treeSpan = 2400;
      const halfSpan = treeSpan / 2;
      for (let k = 0; k < this.treeClusters.length; k++) {
        const tc = this.treeClusters[k];
        let dx = tc.group.position.x - dronePos.x;
        let dz = tc.group.position.z - dronePos.z;

        if (dx > halfSpan) tc.group.position.x -= treeSpan;
        else if (dx < -halfSpan) tc.group.position.x += treeSpan;

        if (dz > halfSpan) tc.group.position.z -= treeSpan;
        else if (dz < -halfSpan) tc.group.position.z += treeSpan;
      }
    }
  }

  // ==========================================================================
  // 4. HIGH-FIDELITY MQ-9 REAPER / PREDATOR UAV DRONE 3D MODEL
  //    (Exact replica of the user reference image)
  // ==========================================================================
  buildDroneModel() {
    // Military low-observability tactical grey materials
    const tacticalGreyMat = new THREE.MeshStandardMaterial({
      color: 0xc8d1dc, // Light tactical grey matching photo
      roughness: 0.38,
      metalness: 0.18
    });

    const panelDarkMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.45,
      metalness: 0.22
    });

    const polishedChromeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.18,
      metalness: 0.35,
      emissive: 0xdbeafe,
      emissiveIntensity: 0.38
    });

    const stealthCarbonMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.35,
      metalness: 0.5
    });

    // 1. Sleek Streamline Fuselage (Length ~4.6m, starts nose at -1.9, ends at tail +2.7)
    // Central hull
    const mainBodyGeo = new THREE.CylinderGeometry(0.26, 0.28, 2.6, 20);
    const mainBody = new THREE.Mesh(mainBodyGeo, tacticalGreyMat);
    mainBody.rotation.x = Math.PI / 2;
    mainBody.position.set(0, 0, 0.15);
    this.droneGroup.add(mainBody);

    // Forward Nose Cone Taper
    const noseGeo = new THREE.ConeGeometry(0.26, 1.4, 20);
    const noseMesh = new THREE.Mesh(noseGeo, tacticalGreyMat);
    noseMesh.rotation.x = -Math.PI / 2;
    noseMesh.position.set(0, 0.02, -1.8);
    this.droneGroup.add(noseMesh);

    // Signature Bulbous SATCOM Nose Radome Hump (Exact MQ-9 feature in reference image)
    const satcomGeo = new THREE.SphereGeometry(0.26, 16, 14);
    const satcomMesh = new THREE.Mesh(satcomGeo, tacticalGreyMat);
    satcomMesh.scale.set(0.92, 0.75, 2.1);
    satcomMesh.position.set(0, 0.18, -1.15);
    this.droneGroup.add(satcomMesh);

    // Forward Pitot Needle Probe
    const pitotGeo = new THREE.CylinderGeometry(0.015, 0.025, 0.45, 8);
    const pitotMesh = new THREE.Mesh(pitotGeo, polishedChromeMat);
    pitotMesh.rotation.x = Math.PI / 2;
    pitotMesh.position.set(0, 0.02, -2.6);
    this.droneGroup.add(pitotMesh);

    // Aft Fuselage Engine Cowling & Tail Taper
    const tailConeGeo = new THREE.ConeGeometry(0.28, 1.3, 16);
    const tailConeMesh = new THREE.Mesh(tailConeGeo, tacticalGreyMat);
    tailConeMesh.rotation.x = Math.PI / 2;
    tailConeMesh.position.set(0, 0.02, 2.05);
    this.droneGroup.add(tailConeMesh);

    // Ventral Chin FLIR/EO/IR Optical Gimbal Turret Ball
    this.turret = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 14), stealthCarbonMat);
    this.turret.position.set(0, -0.22, -1.45);
    this.droneGroup.add(this.turret);

    // Multi-spectral Dual Sensor Lenses
    const lens1 = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.06, 12), new THREE.MeshBasicMaterial({ color: 0x00f0ff }));
    lens1.rotation.x = Math.PI / 2;
    lens1.position.set(-0.04, -0.23, -1.58);
    this.droneGroup.add(lens1);

    const lens2 = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.06, 12), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
    lens2.rotation.x = Math.PI / 2;
    lens2.position.set(0.04, -0.23, -1.58);
    this.droneGroup.add(lens2);

    // Dorsal Spine Antennas
    const antGeo = new THREE.BoxGeometry(0.02, 0.14, 0.16);
    const ant1 = new THREE.Mesh(antGeo, panelDarkMat);
    ant1.position.set(0, 0.32, -0.1);
    this.droneGroup.add(ant1);

    const ant2 = new THREE.Mesh(antGeo, panelDarkMat);
    ant2.position.set(0, 0.28, 0.85);
    this.droneGroup.add(ant2);

    // 2. Long Glider Wings with Upturned Winglets (Span ~8.8m)
    // Left Wing
    const wingGeo = new THREE.BoxGeometry(4.2, 0.06, 0.62);
    const leftWing = new THREE.Mesh(wingGeo, tacticalGreyMat);
    leftWing.position.set(-2.25, 0.08, -0.15);
    leftWing.rotation.z = 0.025; // Subtle upward dihedral
    this.droneGroup.add(leftWing);

    // Right Wing
    const rightWing = new THREE.Mesh(wingGeo, tacticalGreyMat);
    rightWing.position.set(2.25, 0.08, -0.15);
    rightWing.rotation.z = -0.025;
    this.droneGroup.add(rightWing);

    // Signature Upturned Vertical Winglets at Wingtips (Exactly as in photo!)
    [-4.35, 4.35].forEach((wx, i) => {
      const wingletGeo = new THREE.BoxGeometry(0.04, 0.52, 0.36);
      const winglet = new THREE.Mesh(wingletGeo, tacticalGreyMat);
      winglet.position.set(wx, 0.36, -0.15);
      winglet.rotation.z = (i === 0 ? -0.22 : 0.22); // Canted slightly outward
      this.droneGroup.add(winglet);

      // Wingtip Navigation & Strobe Lights
      const navLight = new THREE.Mesh(
        new THREE.SphereGeometry(0.038, 8, 8),
        new THREE.MeshBasicMaterial({ color: i === 0 ? 0xff2244 : 0x00ff88 })
      );
      navLight.position.set(wx, 0.58, -0.15);
      this.droneGroup.add(navLight);
    });

    // 3. Underwing Hardpoint Pylons & AGM-114 Hellfire Missiles (Visible in reference image)
    const pylonGeo = new THREE.BoxGeometry(0.04, 0.16, 0.42);
    const missileGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.95, 10);
    const missileMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5 });
    const seekerMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });

    [-1.6, -2.7, 1.6, 2.7].forEach(px => {
      const pylon = new THREE.Mesh(pylonGeo, panelDarkMat);
      pylon.position.set(px, 0.01, -0.12);
      this.droneGroup.add(pylon);

      // Dual missile rack
      [-0.06, 0.06].forEach(mx => {
        const missile = new THREE.Mesh(missileGeo, missileMat);
        missile.rotation.x = Math.PI / 2;
        missile.position.set(px + mx, -0.12, -0.1);
        this.droneGroup.add(missile);

        const seeker = new THREE.Mesh(new THREE.SphereGeometry(0.038, 8, 8), seekerMat);
        seeker.position.set(px + mx, -0.12, -0.58);
        this.droneGroup.add(seeker);
      });
    });

    // 4. Inverted-Y Empennage (V-Tail with Ventral Fin - Exact MQ-9 configuration)
    // Canted Upper V-Fins (Ruddervators)
    const finGeo = new THREE.BoxGeometry(0.04, 1.15, 0.48);

    // Left V-Fin (Angled up and left at 48°)
    const finL = new THREE.Mesh(finGeo, tacticalGreyMat);
    finL.position.set(-0.42, 0.45, 2.45);
    finL.rotation.z = 0.82;
    finL.rotation.x = 0.12;
    this.droneGroup.add(finL);

    // Right V-Fin (Angled up and right at 48°)
    const finR = new THREE.Mesh(finGeo, tacticalGreyMat);
    finR.position.set(0.42, 0.45, 2.45);
    finR.rotation.z = -0.82;
    finR.rotation.x = 0.12;
    this.droneGroup.add(finR);

    // Downward Ventral Fin (Extending straight down below tail)
    const ventralGeo = new THREE.BoxGeometry(0.04, 0.72, 0.48);
    const ventralFin = new THREE.Mesh(ventralGeo, tacticalGreyMat);
    ventralFin.position.set(0, -0.38, 2.38);
    ventralFin.rotation.x = -0.1;
    this.droneGroup.add(ventralFin);

    // 5. Rear Pusher Propeller & Polished Chrome Spinner Cone (Exact match to image!)
    this.propellerGroup = new THREE.Group();
    this.propellerGroup.position.set(0, 0.02, 2.68);
    this.droneGroup.add(this.propellerGroup);

    // Polished Conical Chrome Bullet Spinner Cone
    const spinnerGeo = new THREE.ConeGeometry(0.13, 0.38, 16);
    const spinnerMesh = new THREE.Mesh(spinnerGeo, polishedChromeMat);
    spinnerMesh.rotation.x = Math.PI / 2;
    spinnerMesh.position.set(0, 0, 0.18);
    this.propellerGroup.add(spinnerMesh);

    // 3 Pusher Blades (120° apart - translated once on creation)
    const bladeGeo = new THREE.BoxGeometry(0.035, 0.72, 0.08);
    bladeGeo.translate(0, 0.36, 0); // Translate once so root rotates at (0,0)
    this.propellerBlades = [];
    this.bladeMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.45,
      transparent: true,
      opacity: 0.42
    });

    [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].forEach(angle => {
      const blade = new THREE.Mesh(bladeGeo, this.bladeMat);
      blade.rotation.z = angle;
      this.propellerGroup.add(blade);
      this.propellerBlades.push(blade);
    });

    // Translucent Spinning Motion Blur Propeller Disc (active and spinning at high RPM)
    const blurDiscGeo = new THREE.CircleGeometry(0.76, 32);
    const blurDiscMat = new THREE.MeshBasicMaterial({
      color: 0xdde6ed,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    this.propBlurDisc = new THREE.Mesh(blurDiscGeo, blurDiscMat);
    this.propBlurDisc.position.set(0, 0, 0.06);
    this.propBlurDisc.visible = true;
    this.propellerGroup.add(this.propBlurDisc);

    // 6. Retractable Tricycle Landing Gear
    this.landingGear = new THREE.Group();
    const gearMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 });

    // Steerable Nose Gear
    const noseStrut = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.38, 8), gearMat);
    noseStrut.position.set(0, -0.22, -1.1);
    this.landingGear.add(noseStrut);

    const noseWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.045, 12), tireMat);
    noseWheel.rotation.z = Math.PI / 2;
    noseWheel.position.set(0, -0.4, -1.1);
    this.landingGear.add(noseWheel);

    // Twin Main Gear
    [-0.68, 0.68].forEach(gx => {
      const mainStrut = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.38, 8), gearMat);
      mainStrut.position.set(gx, -0.22, 0.2);
      mainStrut.rotation.z = (gx > 0 ? -0.12 : 0.12);
      this.landingGear.add(mainStrut);

      const mainWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.055, 12), tireMat);
      mainWheel.rotation.z = Math.PI / 2;
      mainWheel.position.set(gx + (gx > 0 ? 0.05 : -0.05), -0.4, 0.2);
      this.landingGear.add(mainWheel);
    });

    this.droneGroup.add(this.landingGear);
  }

  // ==========================================================================
  // 5. LIVE GIMBAL EO/IR CAM
  // ==========================================================================
  setupGimbalCamera() {
    this.gimbalPipContainer = document.getElementById('camFeedPip');
    if (!this.gimbalPipContainer) return;

    this.gimbalCamera = new THREE.PerspectiveCamera(45, 170 / 120, 0.1, 1400);
    this.gimbalRenderer = new THREE.WebGLRenderer({ antialias: true });
    this.gimbalRenderer.setSize(170, 120);
    this.gimbalPipContainer.appendChild(this.gimbalRenderer.domElement);
  }

  // ==========================================================================
  // 6. THREAT INTERCEPTOR COMBAT SYSTEM
  // ==========================================================================
  setupThreatSystem() {
    this.threatTimer = 0;
    this.threatInterval = 55;
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
      dronePos.x + (Math.random() - 0.5) * 140,
      dronePos.y + 25 + Math.random() * 20,
      dronePos.z + 200
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
  // 7. REAL-TIME FLIGHT DYNAMICS & CONTROL ENGINE
  // ==========================================================================
  update(dt, engineTelemetry, inputKeys) {
    const { rpm, engineRunning, throttlePct } = engineTelemetry;

    // Propeller spinning visual + motion blur disc
    if (this.propellerGroup && rpm > 40) {
      this.propellerGroup.rotation.z += (rpm / 60) * Math.PI * 2 * dt;
      if (this.propBlurDisc) {
        this.propBlurDisc.visible = (rpm > 2200);
      }
    }

    // Input Key Parsing
    const isForwardKey = !!(inputKeys['w'] || inputKeys['W'] || inputKeys['KeyW'] || inputKeys['ArrowUp'] || inputKeys['btnPitchUp']);
    const isClimbKey   = !!(inputKeys[' '] || inputKeys['Spacebar'] || inputKeys['Space'] || inputKeys['PageUp'] || inputKeys['btnThrUp']);
    const isDescentKey = !!(inputKeys['s'] || inputKeys['S'] || inputKeys['KeyS'] || inputKeys['ArrowDown'] || inputKeys['btnPitchDn']);
    const isBrakeKey   = !!(inputKeys['Control'] || inputKeys['PageDown'] || inputKeys['btnThrDn']);
    const isTakeoffKey = !!(inputKeys['t'] || inputKeys['T'] || inputKeys['KeyT'] || inputKeys['takeoff']);

    // Left and Right Steering Keys
    const isLeftKey  = !!(inputKeys['a'] || inputKeys['A'] || inputKeys['KeyA'] || inputKeys['ArrowLeft'] || inputKeys['btnYawL']);
    const isRightKey = !!(inputKeys['d'] || inputKeys['D'] || inputKeys['KeyD'] || inputKeys['ArrowRight'] || inputKeys['btnYawR']);

    // Crash Recovery
    if (this.flightState.isCrashed) {
      if (isForwardKey || isClimbKey || isTakeoffKey) {
        this.resetFlight();
      } else {
        this.renderer.render(this.scene, this.camera);
        return;
      }
    }

    if (this.takeoffCooldown > 0) {
      this.takeoffCooldown -= dt;
    }

    // Dynamic Celestial Time progression
    if (this.autoTimeProgression) {
      this.timeOfDay = (this.timeOfDay + dt * 0.08) % 24;
      this.updateCelestialPositions();
    }

    // --- A. AUTO-TAKEOFF SEQUENCER ---
    if (isTakeoffKey && this.flightState.onGround && !this.autoTakeoff.active) {
      this.autoTakeoff.active = true;
      this.autoTakeoff.stage = 'spool';
      this.takeoffCooldown = 15.0;
      if (!engineRunning && window.dashboard && window.dashboard.setEngineRunning) {
        window.dashboard.setEngineRunning(true);
      }
      window.physicsMLEngine.state.throttlePct = 100;
      if (window.speechAlertEngine) {
        window.speechAlertEngine.speak("Takeoff initiated. Spooling to full power. Climbing above clouds.", true);
      }
      if (window.dashboard) {
        window.dashboard.showAlert("🛫 TAKEOFF: Full throttle spool! Climbing into golden clouds.", "info");
      }
    }

    if (this.autoTakeoff.active) {
      window.physicsMLEngine.state.throttlePct = 100;
      if (this.flightState.onGround) {
        this.flightState.airspeedKt = Math.max(35, this.flightState.airspeedKt + 110 * dt);
        if (this.flightState.airspeedKt >= 24) {
          this.flightState.onGround = false;
          this.flightState.gearRetracted = true;
          this.flightState.pitchRad = 0.28;
          this.flightState.position.y = Math.max(4.0, this.flightState.position.y + 18.0 * dt);
          this.takeoffCooldown = 15.0;
          this.autoTakeoff.stage = 'climb';
          if (window.speechAlertEngine) {
            window.speechAlertEngine.speak("Airborne. Gear retracted. Ascending to cloud ceiling.", false);
          }
        }
      } else {
        if (this.flightState.position.y < this.autoTakeoff.targetY) {
          this.flightState.pitchRad = 0.26;
          this.flightState.position.y += 24.0 * dt;
        } else {
          // Level off right above the golden cloud blanket
          this.flightState.pitchRad = 0.012;
          this.autoTakeoff.active = false;
          window.physicsMLEngine.state.throttlePct = 80;
          if (window.speechAlertEngine) {
            window.speechAlertEngine.speak("Cruising above cloud blanket. Pilot has full flight controls.", false);
          }
          if (window.dashboard) {
            window.dashboard.showAlert("☁️ Cruising above golden cloud blanket! Use A/D to turn, W/S for pitch/speed.", "info");
          }
        }
      }
    }

    // Auto-start engine if user commands forward flight or climb while on runway
    if ((isForwardKey || isClimbKey) && !engineRunning && window.dashboard && window.dashboard.setEngineRunning) {
      window.dashboard.setEngineRunning(true);
    }

    // --- B. FLIGHT CONTROLS & FLY-BY-WIRE STEERING ---
    if (engineRunning || isForwardKey || isClimbKey) {
      // Throttle Management
      if (isForwardKey || isClimbKey) {
        window.physicsMLEngine.state.throttlePct = 100;
      } else if (isDescentKey || isBrakeKey) {
        window.physicsMLEngine.state.throttlePct = Math.max(35, window.physicsMLEngine.state.throttlePct - 40 * dt);
      } else if (!this.flightState.onGround && !this.landingApproach) {
        // Automatic cruising throttle (78%)
        window.physicsMLEngine.state.throttlePct += (78 - window.physicsMLEngine.state.throttlePct) * Math.min(1, dt * 2.0);
      }

      // Responsive Pitch / Climb Dynamics
      if (!this.autoTakeoff.active && !this.flightState.onGround) {
        if (this.landingApproach) {
          // Assisted landing glide slope
          if (this.flightState.position.y > 6.0) {
            this.flightState.pitchRad = -0.07;
            this.flightState.position.y = Math.max(0.42, this.flightState.position.y - 14.0 * dt);
          } else if (this.flightState.position.y > 1.2) {
            this.flightState.pitchRad = -0.02;
            this.flightState.position.y = Math.max(0.42, this.flightState.position.y - 4.0 * dt);
          } else {
            this.flightState.pitchRad = 0.02; // Auto-flare
            this.flightState.position.y = Math.max(0.42, this.flightState.position.y - 1.2 * dt);
          }
        } else if (isClimbKey) {
          // Spacebar: Direct powerful vertical climb
          this.flightState.pitchRad = Math.min(0.36, this.flightState.pitchRad + 1.6 * dt);
          this.flightState.position.y = Math.min(420, this.flightState.position.y + 22.0 * dt);
        } else if (isForwardKey) {
          // 'W' Key: High-speed forward cruise + climb if below clouds
          if (this.flightState.position.y < 78) {
            this.flightState.pitchRad += (0.22 - this.flightState.pitchRad) * Math.min(1, dt * 3.5);
            this.flightState.position.y = Math.min(420, this.flightState.position.y + 16.0 * dt);
          } else {
            this.flightState.pitchRad += (0.015 - this.flightState.pitchRad) * Math.min(1, dt * 3.0);
            this.flightState.position.y = Math.min(420, this.flightState.position.y + 2.5 * dt);
          }
        } else if (isDescentKey) {
          // 'S' Key: Controlled glide descent (NEVER reverse!)
          this.flightState.pitchRad = Math.max(-0.22, this.flightState.pitchRad - 1.2 * dt);
          this.flightState.position.y = Math.max(12.0, this.flightState.position.y - 12.0 * dt);
        } else {
          // Auto-level pitch
          this.flightState.pitchRad += (0.01 - this.flightState.pitchRad) * Math.min(1, dt * 3.0);
        }
      }

      // --- C. RESPONSIVE LEFT / RIGHT STEERING & COORDINATED BANKING ---
      let steerInput = 0;
      if (isRightKey) steerInput += 1.0; // Turn Right
      if (isLeftKey)  steerInput -= 1.0; // Turn Left

      if (steerInput !== 0) {
        // Bank wings into the turn: Right = positive bank, Left = negative bank
        const targetBank = steerInput * 0.52; // ~30 degrees bank angle
        this.flightState.bankRad += (targetBank - this.flightState.bankRad) * Math.min(1, dt * 6.0);

        // Turn rate coupled with bank angle and input
        const turnRate = 1.35 + Math.abs(this.flightState.bankRad) * 0.8;
        this.flightState.headingRad += steerInput * turnRate * dt;
      } else if (!this.flightState.onGround) {
        // Auto-level wings when keys are released
        this.flightState.bankRad += (0 - this.flightState.bankRad) * Math.min(1, dt * 5.0);

        // Subtle remaining bank still contributes smoothly to heading
        if (Math.abs(this.flightState.bankRad) > 0.02) {
          this.flightState.headingRad += this.flightState.bankRad * 0.6 * dt;
        }
      }

      // Rudder Yaw Controls (Q / E)
      if (inputKeys['q'] || inputKeys['Q'] || inputKeys['KeyQ']) this.flightState.headingRad -= 0.85 * dt;
      if (inputKeys['e'] || inputKeys['E'] || inputKeys['KeyE']) this.flightState.headingRad += 0.85 * dt;

      // Landing Command (L)
      if ((inputKeys['l'] || inputKeys['L'] || inputKeys['KeyL'] || inputKeys['land']) && !this.flightState.onGround) {
        this.autoTakeoff.active = false;
        this.landingApproach = true;
        this.takeoffCooldown = 0;
        this.flightState.gearRetracted = false;
        window.physicsMLEngine.state.throttlePct = 30;
        if (window.speechAlertEngine) {
          window.speechAlertEngine.speak("Initiating landing approach. Landing gear deployed.", true);
        }
      }
    } else {
      // Damping when engine off
      this.flightState.bankRad *= 0.92;
      this.flightState.pitchRad *= 0.92;
    }

    // --- D. AIRSPEED & STRICTLY POSITIVE FORWARD VELOCITY ---
    const throttleRatio = (window.physicsMLEngine.state.throttlePct || 0) / 100;
    const targetAirspeed = (engineRunning || isForwardKey) ? Math.max(48, throttleRatio * 92) : 0;
    this.flightState.airspeedKt += (targetAirspeed - this.flightState.airspeedKt) * Math.min(1, dt * 4.0);

    // Ground Roll & Snappy Rotation
    if (this.flightState.onGround && (isForwardKey || isClimbKey || this.autoTakeoff.active)) {
      if (!engineRunning && window.dashboard && window.dashboard.setEngineRunning) {
        window.dashboard.setEngineRunning(true);
      }
      window.physicsMLEngine.state.throttlePct = 100;
      this.flightState.airspeedKt = Math.max(28, this.flightState.airspeedKt + 85 * dt);

      if (this.flightState.airspeedKt >= 25) {
        this.flightState.onGround = false;
        this.flightState.gearRetracted = true;
        this.flightState.position.y = Math.max(3.8, this.flightState.position.y + 16.0 * dt);
        this.flightState.pitchRad = 0.26;
        this.takeoffCooldown = 15.0;
        if (window.speechAlertEngine) {
          window.speechAlertEngine.speak("Rotate. Airborne, gear retracted.", false);
        }
        if (window.dashboard) {
          window.dashboard.showAlert("🛫 AIRBORNE! Drone climbing into golden clouds. Use A/D to steer!", "info");
        }
      }
    }

    // Landing Gear Visibility
    if (this.landingGear) {
      this.landingGear.visible = !this.flightState.gearRetracted;
    }

    // --- E. 3D POSITION INTEGRATION (ALWAYS FORWARD, ZERO REVERSE) ---
    // In Three.js: Heading = 0 flies along -Z. Heading = PI/2 flies along +X.
    const forwardX = Math.sin(this.flightState.headingRad);
    const forwardZ = -Math.cos(this.flightState.headingRad);

    // Speed in world units (strictly positive)
    const forwardSpeedUnits = Math.max(12.0, (this.flightState.airspeedKt * 0.514) * 0.95);

    this.flightState.position.x += forwardX * forwardSpeedUnits * dt;
    this.flightState.position.z += forwardZ * forwardSpeedUnits * dt;

    if (!this.flightState.onGround) {
      this.flightState.altitudeFt = Math.round(Math.max(0, (this.flightState.position.y - 0.42) * 25));
      this.flightState.verticalSpeedFpm = (this.flightState.pitchRad * forwardSpeedUnits) * 60 * 3.28;

      // Safe Touchdown Check during landing approach
      if (this.landingApproach && this.takeoffCooldown <= 0 && this.flightState.position.y <= 0.48) {
        if (!this.flightState.gearRetracted && this.flightState.airspeedKt <= 85) {
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
        } else if (this.flightState.gearRetracted && this.flightState.position.y <= 0.40) {
          this.triggerCrash("CRASH: Belly landing with gear retracted!");
          return;
        } else if (this.flightState.airspeedKt > 85) {
          this.triggerCrash("CRASH ON TOUCHDOWN: Landing speed too high (>85 kt)!");
          return;
        }
      }
    } else {
      this.flightState.position.y = 0.42;
      this.flightState.altitudeFt = 0;
      this.flightState.verticalSpeedFpm = 0;
    }

    // --- F. SYNC DRONE MODEL 3D ORIENTATION ---
    // Aeronautical Convention:
    // 1. Heading: Rotate around Y by -headingRad so nose points towards (forwardX, 0, forwardZ)
    // 2. Pitch: Rotate around X by +pitchRad so nose tilts up
    // 3. Bank: Rotate around Z by -bankRad so right wing dips down on right bank
    this.droneGroup.position.copy(this.flightState.position);
    this.droneGroup.rotation.y = -this.flightState.headingRad;
    this.droneGroup.rotation.x = this.flightState.onGround ? 0 : this.flightState.pitchRad;
    this.droneGroup.rotation.z = this.flightState.onGround ? 0 : -this.flightState.bankRad;

    // --- G. UPDATE INFINITE ENVIRONMENTS ---
    this.updateMetropolisAndTerrain(false);
    this.updateCloudSea(this.flightState.position);
    this.updateCelestialPositions();

    // --- H. TAWS / TERRAIN OBSTACLE CHECK ---
    this.checkTerrainCollisions(forwardX, forwardZ);

    // --- I. THREAT COMBAT SYSTEM ---
    this.updateThreatCombat(dt);

    // --- J. SMOOTH THIRD-PERSON CHASE CAMERA ---
    this.updateCamera(dt, forwardX, forwardZ);

    // --- K. GIMBAL EO/IR FEED ---
    if (this.gimbalCamera && this.gimbalRenderer && this.turret) {
      const turretWorldPos = new THREE.Vector3();
      this.turret.getWorldPosition(turretWorldPos);
      this.gimbalCamera.position.copy(turretWorldPos);

      const target = turretWorldPos.clone().add(new THREE.Vector3(forwardX, -0.35, forwardZ).multiplyScalar(45));
      this.gimbalCamera.lookAt(target);
      this.gimbalRenderer.render(this.scene, this.gimbalCamera);
    }

    // Render Main 3D Viewport
    this.renderer.render(this.scene, this.camera);
  }

  // TAWS Terrain Collision Radar Check
  checkTerrainCollisions(fwdX, fwdZ) {
    if (this.flightState.onGround || (this.takeoffCooldown && this.takeoffCooldown > 0) || this.flightState.position.y >= 75) return;

    const dronePos = this.flightState.position;
    let collisionRiskAhead = false;

    for (let i = 0; i < this.buildingColliders.length; i++) {
      const b = this.buildingColliders[i];

      if (dronePos.y < b.height) {
        if (dronePos.x >= b.minX - 1.2 && dronePos.x <= b.maxX + 1.2 &&
            dronePos.z >= b.minZ - 1.2 && dronePos.z <= b.maxZ + 1.2) {
          this.triggerCrash("CRITICAL IMPACT: UAV Collided with Skyscraper Building!");
          return;
        }

        const aheadPos = dronePos.clone().add(new THREE.Vector3(fwdX, 0, fwdZ).multiplyScalar(50));
        if (aheadPos.x >= b.minX - 8 && aheadPos.x <= b.maxX + 8 &&
            aheadPos.z >= b.minZ - 8 && aheadPos.z <= b.maxZ + 8) {
          collisionRiskAhead = true;
        }
      }
    }

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

  // Smooth Chase Camera with Zero Inversion
  updateCamera(dt, fwdX, fwdZ) {
    const fwd = new THREE.Vector3(fwdX, 0, fwdZ);

    if (this.cameraMode === 'chase') {
      // Cinematic rear-quarter chase perspective (exact match to reference photo)
      const rightX = -fwdZ;
      const rightZ = fwdX;
      const behindOffset = fwd.clone().multiplyScalar(-7.4);
      const rightOffset = new THREE.Vector3(rightX, 0, rightZ).multiplyScalar(1.4);
      const heightOffset = new THREE.Vector3(0, 2.3, 0);
      const desiredCamPos = this.droneGroup.position.clone()
        .add(behindOffset)
        .add(rightOffset)
        .add(heightOffset);

      // Smooth tracking with high responsiveness
      this.camera.position.lerp(desiredCamPos, Math.min(1, dt * 6.5));

      // Aim at drone forward-mid fuselage
      const lookTarget = this.droneGroup.position.clone().add(new THREE.Vector3(0, 0.25, 0));
      this.camera.lookAt(lookTarget);
    } else if (this.cameraMode === 'cockpit') {
      // Nose SATCOM Cockpit View
      const nosePos = this.droneGroup.position.clone().add(fwd.clone().multiplyScalar(0.9)).add(new THREE.Vector3(0, 0.22, 0));
      this.camera.position.lerp(nosePos, Math.min(1, dt * 10.0));
      this.camera.lookAt(nosePos.clone().add(fwd.clone().multiplyScalar(40)));
    } else if (this.cameraMode === 'map') {
      // Top-Down Tactical Reconnaissance View
      const mapPos = new THREE.Vector3(
        this.droneGroup.position.x,
        this.droneGroup.position.y + 140,
        this.droneGroup.position.z + 0.01
      );
      this.camera.position.lerp(mapPos, Math.min(1, dt * 4.5));
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

    this.updateMetropolisAndTerrain(true);

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
