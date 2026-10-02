/**
 * ============================================================================
 * BESPOKE HOLOGRAPHIC 3D V-PROPULSION ENGINE (EXACT MATCH TO REFERENCE DESIGN)
 * ============================================================================
 * Faithful, hyper-detailed recreation of the cybernetic aero engine:
 * 1. Front Aerodynamic Ducted Turbine Fan:
 *    - Large outer cowl/shroud with glowing cyan rim & stepped inner duct
 *    - Aerodynamic central spinner bullet cone pointing forward
 *    - 18 rotating aerofoil turbine fan blades (actively spinning with RPM)
 *    - Stationary radial stator guide vanes
 * 2. Top Cylindrical Air Horn / Intake Funnel Plenum:
 *    - Vertical cylindrical plenum stack with flanged lip & golden wireframe
 *    - Twin curved boost intake runners feeding cylinder banks
 * 3. Tilted V-Bank Multi-Cylinder Reciprocating Assemblies:
 *    - 3 massive angled cylinders in the front bank tilted towards camera
 *    - 3 matching cylinders in the rear bank (full V-6 aero propulsion twin)
 *    - Dense horizontal CNC radial cooling fins with golden-amber wireframe
 *    - Borosilicate translucent cyan-blue cutaway barrels
 *    - Reciprocating forged pistons, wrist pins, and kinematic connecting rods
 *    - Fiery combustion flashes on power strokes
 * 4. Curved Side Exhaust Manifold & Main Horizontal Collector:
 *    - 3 curved header pipes emerging from cylinder heads
 *    - Thick horizontal collector pipe with glowing amber joint rings
 *    - Overlaid with dense golden constellation nodes
 * 5. Volumetric Deep-Blue Oil Sump:
 *    - Translucent bathtub pan with cooling corrugations & golden gasket seam
 * 6. Rear Bellhousing & Flange Ring:
 *    - Circular flange with bolt pattern at rear
 * 7. Real-Time 3D-to-2D Holographic Leader Lines & HUD Callout Cards:
 *    - Front Fan -> ROTOR PRESSURE (BAR)
 *    - Oil Sump -> OIL PRESSURE
 *    - Cylinder 2 -> TEMP / RPM
 *    - Cylinder 1 Head -> CYLINDER PRESSURE
 *    - Top Air Horn -> THERMAL CORE (with dual circular mini gauges)
 *    - Rear Head -> AI ANALYTICS SCORE
 *    - Bottom Right -> Digital Twin Telemetry mini sparkline
 * ============================================================================
 */

class Engine3DViewer {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.options = Object.assign({
      showHudCallouts: true,
      renderMode: 'holographic', // 'holographic' | 'solid' | 'thermal'
      autoRotate: false,
      isInspector: containerId === 'inspectorViewport'
    }, options);

    this.renderMode = this.options.renderMode;
    this.showHudCallouts = this.options.showHudCallouts;
    this.autoRotate = this.options.autoRotate;

    // Three.js Scene Setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060912);

    // Camera setup — framed at the exact 3/4 perspective matching the reference image!
    const aspect = (this.container.clientWidth || 800) / (this.container.clientHeight || 500);
    this.camera = new THREE.PerspectiveCamera(36, aspect, 0.1, 150);
    this.defaultCamPos = new THREE.Vector3(-0.6, 2.2, 5.2);
    this.camera.position.copy(this.defaultCamPos);
    this.targetLookAt = new THREE.Vector3(0.2, 0.1, 0);

    // High performance WebGL Renderer with ACES Filmic Tone Mapping
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(this.container.clientWidth || 800, this.container.clientHeight || 500);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.4;
    this.container.appendChild(this.renderer.domElement);

    // Create 3D-to-2D HUD Leader Lines Overlay
    this.setupHudOverlay();

    // Studio & Holographic Lighting Rig
    this.setupLighting();

    // Holographic Perspective Grid Floor
    this.setupFloor();

    // Ambient Holographic Particle Dust
    this.setupParticles();

    // Master Engine Hierarchy Group
    this.engineGroup = new THREE.Group();
    this.engineGroup.position.set(0, 0.05, 0);
    this.scene.add(this.engineGroup);

    // Kinematics & Component References
    this.fanRotor = null;
    this.fanBlades = [];
    this.pistons = [];
    this.connectingRods = [];
    this.crankThrows = [];
    this.cylinderHeads = [];
    this.cylinderBarrels = [];
    this.exhaustPipes = [];
    this.sparkLights = [];
    this.fireSpheres = [];
    this.wireframeMeshes = [];
    this.constellationPoints = [];
    this.solidMaterials = [];
    this.holoMaterials = [];
    this.anchorPoints = {};

    this.crankAngle = 0;
    this.fanAngle = 0;

    // Kinematic vectors
    this._vA = new THREE.Vector3();
    this._vB = new THREE.Vector3();
    this._tempV = new THREE.Vector3();

    // Build the Exact Holographic V-Engine from Reference
    this.buildExactVEngine();

    // Orbit Controls Setup
    this.setupOrbitControls();

    // Resize Handler
    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(this.container);

    // Apply initial visual mode
    this.setRenderMode(this.renderMode);
  }

  // ==========================================================================
  // HUD CALLOUT LEADER LINES OVERLAY (2D / 3D FUSION)
  // ==========================================================================
  setupHudOverlay() {
    this.hudLayer = document.createElement('div');
    this.hudLayer.className = 'engine-holo-hud-layer';
    this.hudLayer.style.position = 'absolute';
    this.hudLayer.style.top = '0';
    this.hudLayer.style.left = '0';
    this.hudLayer.style.width = '100%';
    this.hudLayer.style.height = '100%';
    this.hudLayer.style.pointerEvents = 'none';
    this.hudLayer.style.zIndex = '12';
    this.hudLayer.style.overflow = 'hidden';

    // SVG canvas for glowing leader lines
    this.svgLines = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svgLines.setAttribute('class', 'holo-svg-lines');
    this.svgLines.style.position = 'absolute';
    this.svgLines.style.top = '0';
    this.svgLines.style.left = '0';
    this.svgLines.style.width = '100%';
    this.svgLines.style.height = '100%';
    this.svgLines.style.pointerEvents = 'none';
    this.hudLayer.appendChild(this.svgLines);

    // Container for floating HUD cards
    this.hudCardsContainer = document.createElement('div');
    this.hudCardsContainer.className = 'holo-cards-container';
    this.hudCardsContainer.style.position = 'absolute';
    this.hudCardsContainer.style.top = '0';
    this.hudCardsContainer.style.left = '0';
    this.hudCardsContainer.style.width = '100%';
    this.hudCardsContainer.style.height = '100%';
    this.hudCardsContainer.style.pointerEvents = 'none';
    this.hudLayer.appendChild(this.hudCardsContainer);

    this.container.style.position = 'relative';
    this.container.appendChild(this.hudLayer);

    this.createHudCards();
  }

  createHudCards() {
    this.cards = {};

    // 1. Top Thermal Core Card (Matching exact reference layout with dual circular dials)
    this.cards.thermalCore = this.createCardElement('card-thermal-core', `
      <div class="h-card-header">
        <span class="h-card-tag">THERMAL CORE</span>
        <span class="h-card-sub">DEA OC-HEXESVER</span>
        <span class="h-card-icon">⚡</span>
      </div>
      <div class="h-card-body h-row-dual">
        <div class="h-mini-gauge-wrap">
          <svg class="h-mini-circle" viewBox="0 0 36 36">
            <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="3"/>
            <path id="hc_circle1" class="circle-fill" stroke-dasharray="75, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#00f0ff" stroke-width="3"/>
          </svg>
          <div class="h-mini-gauge-text"><span id="hc_chtVal">279</span>°C</div>
          <span class="h-mini-label">CHT 75.6%</span>
        </div>
        <div class="h-mini-gauge-wrap">
          <svg class="h-mini-circle" viewBox="0 0 36 36">
            <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="3"/>
            <path id="hc_circle2" class="circle-fill" stroke-dasharray="35, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#ffaa00" stroke-width="3"/>
          </svg>
          <div class="h-mini-gauge-text"><span id="hc_egtVal">219</span>°C</div>
          <span class="h-mini-label">OVERBE 3.5%</span>
        </div>
      </div>
    `);

    // 2. Cylinder Pressure Card (Leader Line 1)
    this.cards.cylPressure = this.createCardElement('card-cyl-pressure', `
      <div class="h-card-tag amber">CYLINDER PRESSURE</div>
      <div class="h-card-val-row">
        <span class="h-card-lbl">RPM</span>
        <span class="h-card-val" id="hc_rpm">1000</span>
        <span class="h-card-unit">kW</span>
      </div>
      <div class="h-card-val-row">
        <span class="h-card-lbl">PEAK</span>
        <span class="h-card-val accent" id="hc_peakBar">74.2</span>
        <span class="h-card-unit">bar</span>
      </div>
    `);

    // 3. Core Temp / RPM Card (Leader Line 2)
    this.cards.coreTemp = this.createCardElement('card-core-temp', `
      <div class="h-card-tag cyan">TEMP / RPM</div>
      <div class="h-card-val-row">
        <span class="h-card-lbl">TEMP</span>
        <span class="h-card-val" id="hc_coreTemp">198</span>
        <span class="h-card-unit">F/m</span>
      </div>
      <div class="h-card-val-row">
        <span class="h-card-lbl">LAMBDA</span>
        <span class="h-card-val" id="hc_lambda">14.7</span>
        <span class="h-card-unit">λ</span>
      </div>
    `);

    // 4. Oil Pressure Card (Leader Line 3)
    this.cards.oilPressure = this.createCardElement('card-oil-pressure', `
      <div class="h-card-tag amber">OIL PRESSURE</div>
      <div class="h-card-val-row">
        <span class="h-card-lbl">DPM</span>
        <span class="h-card-val" id="hc_oilPsi">307</span>
        <span class="h-card-unit">kW</span>
      </div>
      <div class="h-card-val-row">
        <span class="h-card-lbl">PRESS</span>
        <span class="h-card-val accent" id="hc_oilRealPsi">48.5</span>
        <span class="h-card-unit">psi</span>
      </div>
    `);

    // 5. Rotor Pressure (Bar) Card (Leader Line 4 - Front Fan)
    this.cards.rotorPressure = this.createCardElement('card-rotor-pressure', `
      <div class="h-card-tag cyan">ROTOR PRESSURE (BAR)</div>
      <div class="h-bar-indicator">
        <div class="h-bar-track"><div id="hc_fanBar1" class="h-bar-fill amber" style="width:78%;"></div></div>
        <div class="h-bar-track"><div id="hc_fanBar2" class="h-bar-fill cyan" style="width:52%;"></div></div>
      </div>
      <div class="h-card-val-row">
        <span class="h-card-lbl">PNP</span>
        <span class="h-card-val" id="hc_fanSpeed">3005</span>
        <span class="h-card-unit">mw</span>
      </div>
    `);

    // 6. AI Analytics Score Card (Top Right)
    this.cards.aiScore = this.createCardElement('card-ai-score', `
      <div class="h-card-tag neon">AI Analytics Score</div>
      <div class="h-card-val-row">
        <span class="h-card-lbl">Confidence</span>
        <span class="h-card-val" id="hc_aiConf">99.86%</span>
      </div>
      <div class="h-card-val-row">
        <span class="h-card-lbl">Current Power</span>
        <span class="h-card-val accent" id="hc_power">683</span>
        <span class="h-card-unit">kW</span>
      </div>
    `);

    // 7. Digital Twin Mini Telemetry Card (Bottom Right)
    this.cards.digitalTwin = this.createCardElement('card-digital-twin', `
      <div class="h-card-tag">Digital Twin Telemetry</div>
      <div class="h-spark-canvas-wrap">
        <canvas id="hc_sparkCanvas" width="120" height="30"></canvas>
      </div>
    `);
  }

  createCardElement(id, innerHtml) {
    const el = document.createElement('div');
    el.id = id;
    el.className = 'holo-hud-card';
    el.innerHTML = innerHtml;
    this.hudCardsContainer.appendChild(el);
    return el;
  }

  // ==========================================================================
  // LIGHTING RIG
  // ==========================================================================
  setupLighting() {
    this.ambientLight = new THREE.AmbientLight(0x38bdf8, 0.75);
    this.scene.add(this.ambientLight);

    // Front Key Light (Cyan Glow)
    this.keyLight = new THREE.DirectionalLight(0x00f0ff, 1.4);
    this.keyLight.position.set(-4, 6, 8);
    this.scene.add(this.keyLight);

    // Warm Golden-Amber Rim Light (Back & Upper Right)
    this.amberRimLight = new THREE.DirectionalLight(0xf59e0b, 1.1);
    this.amberRimLight.position.set(6, 4, 3);
    this.scene.add(this.amberRimLight);

    // Deep Blue Fill Light (Underneath)
    this.blueFillLight = new THREE.DirectionalLight(0x0284c7, 0.9);
    this.blueFillLight.position.set(0, -6, -4);
    this.scene.add(this.blueFillLight);

    // Core Volumetric Point Light (inside the engine block)
    this.corePointLight = new THREE.PointLight(0x00f0ff, 1.6, 9);
    this.corePointLight.position.set(0.2, 0.4, 0);
    this.scene.add(this.corePointLight);

    // Fan Shroud Amber Halo Light
    this.fanHaloLight = new THREE.PointLight(0xffaa00, 1.3, 5);
    this.fanHaloLight.position.set(-1.6, 0.1, 0.6);
    this.scene.add(this.fanHaloLight);
  }

  // ==========================================================================
  // HOLOGRAPHIC STUDIO GRID FLOOR
  // ==========================================================================
  setupFloor() {
    const floorGeo = new THREE.PlaneGeometry(36, 36);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x05070f,
      roughness: 0.9,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.65;
    floor.receiveShadow = true;
    this.scene.add(floor);

    this.grid = new THREE.GridHelper(36, 36, 0x00f0ff, 0x0d1728);
    this.grid.position.y = -1.64;
    this.grid.material.opacity = 0.45;
    this.grid.material.transparent = true;
    this.scene.add(this.grid);

    // Concentric Target Rings on the floor
    for (let r of [1.8, 3.2, 4.6]) {
      const ringGeo = new THREE.RingGeometry(r - 0.015, r, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: r === 3.2 ? 0.28 : 0.14,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = -1.63;
      this.scene.add(ring);
    }
  }

  // ==========================================================================
  // FLOATING HOLOGRAPHIC TECH PARTICLES
  // ==========================================================================
  setupParticles() {
    const particleCount = 200;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const cCyan = new THREE.Color(0x00f0ff);
    const cAmber = new THREE.Color(0xffaa00);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.2) * 6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12;

      const c = Math.random() > 0.45 ? cCyan : cAmber;
      colors[i * 3 + 0] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const pMat = new THREE.PointsMaterial({
      size: 0.052,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    this.particleCloud = new THREE.Points(geom, pMat);
    this.scene.add(this.particleCloud);
  }

  // ==========================================================================
  // EXACT BESPOKE 3D ENGINE FABRICATION (IMAGE REPLICA)
  // ==========================================================================
  buildExactVEngine() {
    // --- Materials (Holographic Cyber Glass, Amber Wireframe & Blue Sump) ---
    this.matHoloCyan = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: new THREE.Color(0x00f0ff),
      emissiveIntensity: 0.22,
      metalness: 0.2,
      roughness: 0.1,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.holoMaterials.push(this.matHoloCyan);

    this.matHoloDeepBlue = new THREE.MeshStandardMaterial({
      color: 0x0369a1,
      emissive: new THREE.Color(0x0284c7),
      emissiveIntensity: 0.4,
      metalness: 0.3,
      roughness: 0.15,
      transparent: true,
      opacity: 0.68,
      side: THREE.DoubleSide
    });
    this.holoMaterials.push(this.matHoloDeepBlue);

    this.matAmberGlow = new THREE.MeshStandardMaterial({
      color: 0xffaa00,
      emissive: new THREE.Color(0xf59e0b),
      emissiveIntensity: 0.8,
      metalness: 0.5,
      roughness: 0.2
    });
    this.solidMaterials.push(this.matAmberGlow);

    this.matSolidSteel = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.95,
      roughness: 0.2
    });
    this.solidMaterials.push(this.matSolidSteel);

    this.lineAmberMat = new THREE.LineBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0.85
    });

    this.lineCyanMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.75
    });

    // ------------------------------------------------------------------------
    // 1. FRONT AERODYNAMIC DUCTED TURBINE FAN (LEFT SIDE HERO)
    // ------------------------------------------------------------------------
    this.buildFrontDuctedFan();

    // ------------------------------------------------------------------------
    // 2. TOP CYLINDRICAL AIR HORN / INTAKE FUNNEL PLENUM
    // ------------------------------------------------------------------------
    this.buildTopAirHorn();

    // ------------------------------------------------------------------------
    // 3. TILTED V-BANK CYLINDERS WITH CNC RADIAL COOLING FINS
    // ------------------------------------------------------------------------
    this.buildVBankCylinders();

    // ------------------------------------------------------------------------
    // 4. CURVED SIDE EXHAUST MANIFOLD & HORIZONTAL COLLECTOR
    // ------------------------------------------------------------------------
    this.buildCurvedExhaustSystem();

    // ------------------------------------------------------------------------
    // 5. VOLUMETRIC DEEP-BLUE OIL SUMP & CRANKCASE
    // ------------------------------------------------------------------------
    this.buildCrankcaseAndSump();

    // ------------------------------------------------------------------------
    // 6. REAR BELLHOUSING & MOUNTING FLANGE
    // ------------------------------------------------------------------------
    this.buildRearBellhousing();

    // ------------------------------------------------------------------------
    // 7. INTERNAL CRANKSHAFT & KINEMATICS
    // ------------------------------------------------------------------------
    this.buildCrankshaft();
  }

  // ==========================================================================
  // PART 1: FRONT AERODYNAMIC DUCTED TURBINE FAN (HERO OF THE IMAGE)
  // ==========================================================================
  buildFrontDuctedFan() {
    this.fanGroup = new THREE.Group();
    // Positioned at X = -1.6 (left side in reference image)
    this.fanGroup.position.set(-1.6, 0.1, 0);
    this.engineGroup.add(this.fanGroup);

    // Anchor point for Leader Line 4 (Rotor Pressure)
    this.anchorPoints.frontFan = new THREE.Vector3(-1.6, 0.1, 1.05);

    // --- Outer Cylindrical Cowl / Shroud ---
    const cowlGeo = new THREE.CylinderGeometry(1.18, 1.18, 0.44, 48, 1, true);
    const cowl = new THREE.Mesh(cowlGeo, this.matHoloCyan);
    cowl.rotation.z = Math.PI / 2;
    this.fanGroup.add(cowl);
    this.addWireframeOverlay(cowl, this.lineCyanMat);
    this.addConstellationPoints(cowlGeo, 0x00f0ff, 0.055, this.fanGroup, new THREE.Euler(0, 0, Math.PI / 2));

    // Outer Glowing Amber Rim Ring
    const outerAmberRim = new THREE.Mesh(
      new THREE.TorusGeometry(1.19, 0.038, 16, 48),
      this.matAmberGlow
    );
    outerAmberRim.rotation.y = Math.PI / 2;
    outerAmberRim.position.x = -0.21;
    this.fanGroup.add(outerAmberRim);

    // Inner Glowing Cyan Rim Ring
    const innerCyanRim = new THREE.Mesh(
      new THREE.TorusGeometry(1.19, 0.026, 16, 48),
      new THREE.MeshBasicMaterial({ color: 0x00f0ff })
    );
    innerCyanRim.rotation.y = Math.PI / 2;
    innerCyanRim.position.x = 0.21;
    this.fanGroup.add(innerCyanRim);

    // Stepped Inner Duct Ring (visible in image inside the shroud)
    const innerDuctGeo = new THREE.CylinderGeometry(0.98, 0.98, 0.36, 40, 1, true);
    const innerDuct = new THREE.Mesh(innerDuctGeo, this.matHoloCyan);
    innerDuct.rotation.z = Math.PI / 2;
    this.fanGroup.add(innerDuct);
    this.addWireframeOverlay(innerDuct, this.lineAmberMat);

    // Stationary Radial Stator Vanes (8 aero struts supporting the hub)
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const vaneGeo = new THREE.BoxGeometry(0.04, 1.05, 0.08);
      const vane = new THREE.Mesh(vaneGeo, this.matHoloCyan);
      vane.position.set(0.1, Math.cos(angle) * 0.55, Math.sin(angle) * 0.55);
      vane.rotation.x = angle;
      this.fanGroup.add(vane);
    }

    // --- ROTATING ROTOR ASSEMBLY (SPINS RAPIDLY WITH RPM) ---
    this.fanRotor = new THREE.Group();
    this.fanRotor.position.set(-0.06, 0, 0);
    this.fanGroup.add(this.fanRotor);

    // Central Aerodynamic Spinner Bullet Cone (pointing forward along -X)
    const spinnerGeo = new THREE.ConeGeometry(0.36, 0.65, 32);
    const spinner = new THREE.Mesh(spinnerGeo, this.matHoloCyan);
    spinner.rotation.z = Math.PI / 2;
    spinner.position.x = -0.32;
    this.fanRotor.add(spinner);
    this.addWireframeOverlay(spinner, this.lineCyanMat);

    // Central Rotor Hub
    const hubGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.26, 28);
    const hub = new THREE.Mesh(hubGeo, this.matHoloCyan);
    hub.rotation.z = Math.PI / 2;
    this.fanRotor.add(hub);
    this.addWireframeOverlay(hub, this.lineAmberMat);

    // 18 Aerodynamic Turbine Fan Blades (exactly matching the image!)
    const numBlades = 18;
    const bladeGeo = new THREE.BoxGeometry(0.12, 0.72, 0.024);

    for (let b = 0; b < numBlades; b++) {
      const angle = (b / numBlades) * Math.PI * 2;
      const blade = new THREE.Mesh(bladeGeo, this.matHoloCyan);

      blade.position.set(0.01, Math.cos(angle) * 0.68, Math.sin(angle) * 0.68);
      blade.rotation.x = angle;
      blade.rotation.y = 0.44; // Aerodynamic blade pitch twist

      this.fanRotor.add(blade);
      this.fanBlades.push(blade);

      // Add delicate golden wireframe edge on every 2nd blade
      if (b % 2 === 0) {
        this.addWireframeOverlay(blade, this.lineAmberMat);
      }
    }
  }

  // ==========================================================================
  // PART 2: TOP CYLINDRICAL AIR HORN / INTAKE FUNNEL PLENUM
  // ==========================================================================
  buildTopAirHorn() {
    this.airHornGroup = new THREE.Group();
    // Positioned in the center top valley at X = 0.35, Y = 1.6, Z = 0
    this.airHornGroup.position.set(0.35, 1.55, 0);
    this.engineGroup.add(this.airHornGroup);

    // Anchor point for Top Thermal Core Card
    this.anchorPoints.thermalCore = new THREE.Vector3(0.35, 1.85, 0);

    // Main Cylindrical Air Horn Stack
    const stackGeo = new THREE.CylinderGeometry(0.34, 0.28, 0.58, 32);
    const stack = new THREE.Mesh(stackGeo, this.matHoloCyan);
    this.airHornGroup.add(stack);
    this.addWireframeOverlay(stack, this.lineAmberMat);
    this.addConstellationPoints(stackGeo, 0xffaa00, 0.06, this.airHornGroup);

    // Top Machined Lip Flange Ring (glowing amber)
    const lipRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.35, 0.04, 16, 32),
      this.matAmberGlow
    );
    lipRing.rotation.x = Math.PI / 2;
    lipRing.position.y = 0.29;
    this.airHornGroup.add(lipRing);

    // Base Mount Flange
    const baseFlange = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.42, 0.08, 32),
      this.matHoloCyan
    );
    baseFlange.position.y = -0.28;
    this.airHornGroup.add(baseFlange);
    this.addWireframeOverlay(baseFlange, this.lineCyanMat);

    // Twin Curved Intake Boost Runners (branching down into the engine block)
    [-0.32, 0.32].forEach((z, i) => {
      const p0 = new THREE.Vector3(0, -0.25, 0);
      const p1 = new THREE.Vector3(0, -0.5, z * 0.8);
      const p2 = new THREE.Vector3(0.1, -0.75, z * 1.2);
      const curve = new THREE.CatmullRomCurve3([p0, p1, p2]);
      const runner = new THREE.Mesh(new THREE.TubeGeometry(curve, 16, 0.05, 8, false), this.matHoloCyan);
      this.airHornGroup.add(runner);
      this.addWireframeOverlay(runner, this.lineAmberMat);
    });
  }

  // ==========================================================================
  // PART 3: TILTED V-BANK CYLINDERS (PROMINENT HERO CYLINDERS IN IMAGE)
  // ==========================================================================
  buildVBankCylinders() {
    // In the image, there are 3 large visible cylinders along the length of the engine,
    // tilted towards the viewer at an angle!
    const cylXOffsets = [-0.65, 0.35, 1.35];
    const bankTilt = 0.58; // ~33 degrees tilt towards +Z (camera)

    // Anchor points
    this.anchorPoints.cylPressure = new THREE.Vector3(-0.65, 1.3, 0.65);
    this.anchorPoints.coreTemp = new THREE.Vector3(0.35, 0.65, 0.55);
    this.anchorPoints.aiScore = new THREE.Vector3(1.35, 1.3, 0.65);

    // 1. FRONT TILTED BANK (3 Cylinders tilted towards +Z)
    cylXOffsets.forEach((x, idx) => {
      const cylGroup = new THREE.Group();
      cylGroup.position.set(x, 0.45, 0.25);
      cylGroup.rotation.x = bankTilt;
      this.engineGroup.add(cylGroup);

      // Translucent Borosilicate Cylinder Barrel
      const barrelGeo = new THREE.CylinderGeometry(0.38, 0.38, 1.35, 28, 1, true);
      const barrel = new THREE.Mesh(barrelGeo, this.matHoloCyan);
      cylGroup.add(barrel);
      this.cylinderBarrels.push(barrel);
      this.addWireframeOverlay(barrel, this.lineCyanMat);

      // Constellation Points over the Cylinder
      this.addConstellationPoints(barrelGeo, 0xffaa00, 0.065, cylGroup);

      // Dense CNC Radial Cooling Fins (14 razor-sharp disc fins per cylinder)
      for (let finY = -0.55; finY <= 0.55; finY += 0.082) {
        const finGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.022, 32);
        const fin = new THREE.Mesh(finGeo, this.matHoloCyan);
        fin.position.y = finY;
        cylGroup.add(fin);

        // Add golden wireframe ring on each fin
        this.addWireframeOverlay(fin, this.lineAmberMat);
      }

      // Top Cylinder Head Cap (circular beveled cap matching the image!)
      const headCapGeo = new THREE.CylinderGeometry(0.42, 0.44, 0.36, 32);
      const headCap = new THREE.Mesh(headCapGeo, this.matHoloCyan);
      headCap.position.y = 0.85;
      cylGroup.add(headCap);
      this.cylinderHeads.push(headCap);
      this.addWireframeOverlay(headCap, this.lineAmberMat);

      // Glowing Amber Head Retaining Studs / Bolts
      for (let b = 0; b < 6; b++) {
        const bAngle = (b / 6) * Math.PI * 2;
        const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.12, 6), this.matAmberGlow);
        bolt.position.set(Math.cos(bAngle) * 0.32, 1.04, Math.sin(bAngle) * 0.32);
        cylGroup.add(bolt);
      }

      // Overhead Valvetrain Pushrod Tubes (running alongside the cylinder)
      [-0.24, 0.24].forEach(px => {
        const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 1.25, 8), this.matHoloCyan);
        tube.position.set(px, 0.35, -0.38);
        cylGroup.add(tube);
        this.addWireframeOverlay(tube, this.lineAmberMat);
      });

      // Spark Plug with Fiery Combustion Flash
      const sparkPlug = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.025, 0.28, 8), this.matAmberGlow);
      sparkPlug.position.set(0, 1.15, 0);
      cylGroup.add(sparkPlug);

      const sparkLight = new THREE.PointLight(0xffaa00, 0, 2.0);
      sparkLight.position.set(0, 0.6, 0);
      cylGroup.add(sparkLight);

      const fireSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0, blending: THREE.AdditiveBlending })
      );
      fireSphere.position.set(0, 0.6, 0);
      cylGroup.add(fireSphere);

      this.sparkLights.push(sparkLight);
      this.fireSpheres.push(fireSphere);

      // Reciprocating Piston
      const pistonGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.28, 24);
      const piston = new THREE.Mesh(pistonGeo, this.matHoloCyan);
      piston.position.set(0, 0.35, 0);
      cylGroup.add(piston);
      this.pistons.push({ mesh: piston, cylGroup: cylGroup });
      this.addWireframeOverlay(piston, this.lineAmberMat);

      // Wrist Pin
      const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.54, 12), this.matAmberGlow);
      pin.rotation.z = Math.PI / 2;
      pin.position.set(0, -0.02, 0);
      piston.add(pin);

      // H-Beam Connecting Rod
      const rod = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.15, 0.1), this.matHoloCyan);
      rod.userData.baseLength = 1.15;
      this.engineGroup.add(rod);
      this.connectingRods.push(rod);
      this.addWireframeOverlay(rod, this.lineCyanMat);
    });

    // 2. REAR MATCHING BANK (3 Cylinders tilted towards -Z for complete V-6 engine block)
    cylXOffsets.forEach((x) => {
      const rearGroup = new THREE.Group();
      rearGroup.position.set(x, 0.45, -0.25);
      rearGroup.rotation.x = -bankTilt;
      this.engineGroup.add(rearGroup);

      const rearBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 1.35, 24, 1, true), this.matHoloCyan);
      rearGroup.add(rearBarrel);
      this.addWireframeOverlay(rearBarrel, this.lineCyanMat);

      for (let finY = -0.55; finY <= 0.55; finY += 0.1) {
        const fin = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.02, 28), this.matHoloCyan);
        fin.position.y = finY;
        rearGroup.add(fin);
      }

      const rearHead = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.44, 0.36, 28), this.matHoloCyan);
      rearHead.position.y = 0.85;
      rearGroup.add(rearHead);
      this.addWireframeOverlay(rearHead, this.lineAmberMat);
    });
  }

  // ==========================================================================
  // PART 4: CURVED SIDE EXHAUST MANIFOLD & HORIZONTAL COLLECTOR PIPE
  // ==========================================================================
  buildCurvedExhaustSystem() {
    this.exhaustGroup = new THREE.Group();
    this.engineGroup.add(this.exhaustGroup);

    const cylXOffsets = [-0.65, 0.35, 1.35];

    // 3 Distinct Curved Header Pipes (emerging from cylinders and curving down)
    cylXOffsets.forEach((x, i) => {
      const p0 = new THREE.Vector3(x, 0.75, 0.48);
      const p1 = new THREE.Vector3(x + 0.15, 0.32, 0.82);
      const p2 = new THREE.Vector3(x + 0.25, -0.15, 0.95);
      const curve = new THREE.CatmullRomCurve3([p0, p1, p2]);

      const tubeGeo = new THREE.TubeGeometry(curve, 24, 0.075, 12, false);
      const tube = new THREE.Mesh(tubeGeo, this.matHoloCyan);
      this.exhaustGroup.add(tube);
      this.exhaustPipes.push(tube);
      this.addWireframeOverlay(tube, this.lineAmberMat);

      // Glowing Amber Constellation Points all over the curved exhaust pipes!
      this.addConstellationPoints(tubeGeo, 0xffaa00, 0.065, this.exhaustGroup);

      // Glowing Joint Rings on the pipes (matching the image!)
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.022, 12, 24), this.matAmberGlow);
      ring.position.copy(p1);
      ring.rotation.x = Math.PI / 4;
      this.exhaustGroup.add(ring);
    });

    // Thick Horizontal Collector Pipe running along the side of the engine
    const colP0 = new THREE.Vector3(-0.55, -0.15, 0.95);
    const colP1 = new THREE.Vector3(0.55, -0.15, 0.95);
    const colP2 = new THREE.Vector3(1.65, -0.15, 0.95);
    const colP3 = new THREE.Vector3(2.1, -0.22, 0.85); // curves toward rear
    const colCurve = new THREE.CatmullRomCurve3([colP0, colP1, colP2, colP3]);

    const colGeo = new THREE.TubeGeometry(colCurve, 32, 0.11, 16, false);
    this.collectorPipe = new THREE.Mesh(colGeo, this.matHoloCyan);
    this.exhaustGroup.add(this.collectorPipe);
    this.exhaustPipes.push(this.collectorPipe);
    this.addWireframeOverlay(this.collectorPipe, this.lineAmberMat);
    this.addConstellationPoints(colGeo, 0xffaa00, 0.07, this.exhaustGroup);

    // Glowing Collector Rings
    [-0.4, 0.6, 1.6].forEach(cx => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.125, 0.025, 12, 24), this.matAmberGlow);
      ring.position.set(cx, -0.15, 0.95);
      ring.rotation.y = Math.PI / 2;
      this.exhaustGroup.add(ring);
    });
  }

  // ==========================================================================
  // PART 5: CRANKCASE BLOCK & VOLUMETRIC DEEP-BLUE OIL SUMP
  // ==========================================================================
  buildCrankcaseAndSump() {
    // 1. Sculpted Crankcase Main Body
    const caseGeo = new THREE.CylinderGeometry(0.92, 0.92, 3.4, 32);
    this.crankcase = new THREE.Mesh(caseGeo, this.matHoloCyan);
    this.crankcase.rotation.z = Math.PI / 2;
    this.crankcase.position.set(0.35, -0.25, 0);
    this.engineGroup.add(this.crankcase);
    this.addWireframeOverlay(this.crankcase, this.lineCyanMat);

    // Lateral Stiffening Ribs
    for (let r = -1.1; r <= 1.8; r += 0.45) {
      const ribRing = new THREE.Mesh(new THREE.TorusGeometry(0.93, 0.025, 12, 32), this.matHoloCyan);
      ribRing.rotation.y = Math.PI / 2;
      ribRing.position.set(r, -0.25, 0);
      this.engineGroup.add(ribRing);
      this.addWireframeOverlay(ribRing, this.lineAmberMat);
    }

    // 2. Volumetric Deep-Blue Oil Sump (Bathtub shape matching the reference image!)
    const sumpGeo = new THREE.BoxGeometry(2.7, 0.68, 1.45);
    this.oilSump = new THREE.Mesh(sumpGeo, this.matHoloDeepBlue);
    this.oilSump.position.set(0.35, -0.96, 0);
    this.engineGroup.add(this.oilSump);
    this.addWireframeOverlay(this.oilSump, this.lineCyanMat);
    this.addConstellationPoints(sumpGeo, 0x00f0ff, 0.055, this.engineGroup, null, new THREE.Vector3(0.35, -0.96, 0));

    // Anchor point for Leader Line 3 (Oil Pressure)
    this.anchorPoints.oilPressure = new THREE.Vector3(-0.35, -0.68, 0.76);

    // Glowing Golden-Amber Gasket Seam Line between Sump and Crankcase
    const gasketGeo = new THREE.BoxGeometry(2.72, 0.04, 1.48);
    const gasket = new THREE.Mesh(gasketGeo, this.matAmberGlow);
    gasket.position.set(0.35, -0.62, 0);
    this.engineGroup.add(gasket);

    // Vertical Sump Cooling Corrugations (matching the image)
    for (let c = -0.9; c <= 1.6; c += 0.38) {
      const corr = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.62, 1.52), this.matHoloDeepBlue);
      corr.position.set(c, -0.96, 0);
      this.engineGroup.add(corr);
    }
  }

  // ==========================================================================
  // PART 6: REAR BELLHOUSING & MOUNTING FLANGE RING
  // ==========================================================================
  buildRearBellhousing() {
    this.bellGroup = new THREE.Group();
    // Positioned at rear face X = 2.15
    this.bellGroup.position.set(2.15, -0.15, 0);
    this.engineGroup.add(this.bellGroup);

    // Large Circular Rear Flange
    const flangeGeo = new THREE.CylinderGeometry(1.08, 1.08, 0.16, 40);
    const flange = new THREE.Mesh(flangeGeo, this.matHoloCyan);
    flange.rotation.z = Math.PI / 2;
    this.bellGroup.add(flange);
    this.addWireframeOverlay(flange, this.lineCyanMat);

    // Rear Outer Flange Rim
    const flangeRim = new THREE.Mesh(new THREE.TorusGeometry(1.09, 0.03, 16, 40), this.matAmberGlow);
    flangeRim.rotation.y = Math.PI / 2;
    flangeRim.position.x = 0.08;
    this.bellGroup.add(flangeRim);

    // Perimeter Bolt Pattern
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.22, 6), this.matAmberGlow);
      bolt.rotation.z = Math.PI / 2;
      bolt.position.set(0.08, Math.cos(angle) * 0.95, Math.sin(angle) * 0.95);
      this.bellGroup.add(bolt);
    }
  }

  // ==========================================================================
  // PART 7: INTERNAL KINEMATIC CRANKSHAFT
  // ==========================================================================
  buildCrankshaft() {
    this.crankshaftGroup = new THREE.Group();
    this.crankshaftGroup.position.set(0.35, -0.38, 0);
    this.engineGroup.add(this.crankshaftGroup);

    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 3.2, 16), this.matSolidSteel);
    shaft.rotation.z = Math.PI / 2;
    this.crankshaftGroup.add(shaft);

    const cylXOffsets = [-0.65, 0.35, 1.35];
    cylXOffsets.forEach((x, i) => {
      const phase = (i * Math.PI * 2) / 3;

      const throwGroup = new THREE.Group();
      throwGroup.position.set(x - 0.35, 0, 0);
      throwGroup.rotation.x = phase;
      this.crankshaftGroup.add(throwGroup);

      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.34, 0.16), this.matSolidSteel);
      arm.position.set(0, 0.17, 0);
      throwGroup.add(arm);

      // Counterweight
      const cw = new THREE.Mesh(
        new THREE.CylinderGeometry(0.38, 0.38, 0.09, 16, 1, false, 0, Math.PI),
        this.matHoloCyan
      );
      cw.rotation.z = Math.PI / 2;
      cw.position.set(0, -0.1, 0);
      throwGroup.add(cw);

      const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.14, 12), this.matAmberGlow);
      pin.rotation.z = Math.PI / 2;
      pin.position.set(0, 0.3, 0);
      throwGroup.add(pin);

      this.crankThrows.push(pin);
    });
  }

  // ==========================================================================
  // HOLOGRAPHIC CYBER WIREFRAME & CONSTELLATION MESH HELPERS
  // ==========================================================================
  addWireframeOverlay(mesh, lineMaterial) {
    if (!mesh || !mesh.geometry) return;
    const wireGeo = new THREE.WireframeGeometry(mesh.geometry);
    const wireLines = new THREE.LineSegments(wireGeo, lineMaterial.clone());
    mesh.add(wireLines);
    this.wireframeMeshes.push(wireLines);
    return wireLines;
  }

  addConstellationPoints(geometry, colorHex, pointSize = 0.06, parentGroup = this.engineGroup, rotation = null, position = null) {
    if (!geometry) return;
    const ptsMat = new THREE.PointsMaterial({
      color: colorHex,
      size: pointSize,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending
    });
    const pts = new THREE.Points(geometry, ptsMat);
    if (rotation) pts.rotation.copy(rotation);
    if (position) pts.position.copy(position);
    parentGroup.add(pts);
    this.constellationPoints.push(pts);
    return pts;
  }

  // ==========================================================================
  // VISUAL RENDER MODES (HOLOGRAPHIC vs SOLID vs THERMAL)
  // ==========================================================================
  setRenderMode(mode) {
    this.renderMode = mode;

    if (mode === 'holographic') {
      this.wireframeMeshes.forEach(w => w.visible = true);
      this.constellationPoints.forEach(p => p.visible = true);
      this.matHoloCyan.opacity = 0.45;
      this.matHoloDeepBlue.opacity = 0.68;
      this.ambientLight.intensity = 0.75;
      this.corePointLight.intensity = 1.6;
      this.showHudCallouts = true;
      if (this.hudLayer) this.hudLayer.style.display = 'block';
    } else if (mode === 'solid') {
      this.wireframeMeshes.forEach(w => w.visible = false);
      this.constellationPoints.forEach(p => p.visible = false);
      this.matHoloCyan.opacity = 0.95;
      this.matHoloDeepBlue.opacity = 0.95;
      this.ambientLight.intensity = 1.1;
      this.corePointLight.intensity = 0.4;
    } else if (mode === 'thermal') {
      this.wireframeMeshes.forEach(w => w.visible = true);
      this.constellationPoints.forEach(p => p.visible = true);
      this.matHoloCyan.opacity = 0.6;
    }
  }

  toggleHudCallouts() {
    this.showHudCallouts = !this.showHudCallouts;
    if (this.hudLayer) {
      this.hudLayer.style.display = this.showHudCallouts ? 'block' : 'none';
    }
    return this.showHudCallouts;
  }

  // ==========================================================================
  // ORBIT CONTROLS & TOUCH DRAG
  // ==========================================================================
  setupOrbitControls() {
    this.isDragging = false;
    this.lastX = 0;
    this.lastY = 0;
    this.rotY = -0.32; // Default viewing angle matching the reference image!
    this.rotX = 0.18;

    const dom = this.renderer.domElement;
    dom.style.cursor = 'grab';

    dom.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      dom.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      this.rotY += (e.clientX - this.lastX) * 0.007;
      this.rotX = Math.max(-0.85, Math.min(0.85, this.rotX + (e.clientY - this.lastY) * 0.005));
      this.lastX = e.clientX;
      this.lastY = e.clientY;
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
      dom.style.cursor = 'grab';
    });

    // Zoom via Mouse Wheel
    dom.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.camera.position.multiplyScalar(1 + e.deltaY * 0.0015);
      this.camera.position.clampLength(2.6, 16.0);
    }, { passive: false });

    // Touch support for tablets & mobile
    dom.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.lastX = e.touches[0].clientX;
        this.lastY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!this.isDragging || e.touches.length !== 1) return;
      this.rotY += (e.touches[0].clientX - this.lastX) * 0.007;
      this.rotX = Math.max(-0.85, Math.min(0.85, this.rotX + (e.touches[0].clientY - this.lastY) * 0.005));
      this.lastX = e.touches[0].clientX;
      this.lastY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', () => { this.isDragging = false; }, { passive: true });
  }

  // ==========================================================================
  // REAL-TIME KINEMATICS, THERMAL GLOW & HUD LEADER LINES UPDATE
  // ==========================================================================
  update(dt, telemetry) {
    if (this.autoRotate && !this.isDragging) {
      this.rotY += dt * 0.32;
    }

    this.engineGroup.rotation.y = this.rotY;
    this.engineGroup.rotation.x = this.rotX;

    const rpm = telemetry.rpm || 0;
    const angularSpeed = (rpm / 60) * Math.PI * 2;
    this.crankAngle += angularSpeed * dt;

    // 1. Rotate Front Turbine Fan Blades (Spinning rapidly around X axis)
    if (this.fanRotor) {
      this.fanAngle += angularSpeed * dt * 1.35;
      this.fanRotor.rotation.x = this.fanAngle;
    }

    // 2. Rotate Crankshaft
    if (this.crankshaftGroup) {
      this.crankshaftGroup.rotation.x = this.crankAngle;
    }

    // 3. Reciprocating Kinematics: Pistons & Connecting Rods
    this.pistons.forEach((pObj, idx) => {
      const piston = pObj.mesh;
      const phase = this.crankAngle + ((idx * Math.PI * 2) / 3);
      const pistonY = 0.35 + Math.sin(phase) * 0.28;
      piston.position.y = pistonY;

      const rod = this.connectingRods[idx];
      const crankPin = this.crankThrows[idx];

      if (rod && crankPin) {
        piston.getWorldPosition(this._vA);
        crankPin.getWorldPosition(this._vB);

        const localA = this.engineGroup.worldToLocal(this._vA.clone());
        const localB = this.engineGroup.worldToLocal(this._vB.clone());
        const mid = localA.clone().add(localB).multiplyScalar(0.5);
        const dir = localB.clone().sub(localA);
        const len = Math.max(0.05, dir.length());

        rod.position.copy(mid);
        rod.scale.set(1, len / rod.userData.baseLength, 1);
        rod.quaternion.copy(
          new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
        );
      }
    });

    // 4. Live Combustion Chamber Fiery Flash on Power Strokes
    this.sparkLights.forEach((sparkLight, idx) => {
      const phase = this.crankAngle + ((idx * Math.PI * 2) / 3);
      const isPowerStroke = Math.sin(phase) > 0.91 && rpm > 100;
      const isMisfiring = window.physicsMLEngine && window.physicsMLEngine.activeFaults &&
        window.physicsMLEngine.activeFaults.misfire && idx === window.physicsMLEngine.activeFaults.misfireCylinder;

      const fireMesh = this.fireSpheres[idx];

      if (isPowerStroke && !isMisfiring) {
        sparkLight.intensity = 2.8;
        if (fireMesh) {
          fireMesh.material.opacity = 0.95;
          fireMesh.scale.setScalar(1.0 + Math.random() * 0.25);
        }
      } else {
        sparkLight.intensity = 0;
        if (fireMesh) fireMesh.material.opacity = 0;
      }
    });

    // 5. Thermal Heat Glow along Exhaust Runners & Collector
    const egtArray = telemetry.egt || [25, 25, 25, 25];
    const avgEgt = (egtArray[0] + egtArray[1] + egtArray[2] + egtArray[3]) / 4;
    const egtHeatRatio = Math.max(0, Math.min(1, (avgEgt - 200) / 680));

    this.exhaustPipes.forEach((pipe, i) => {
      const isMisfireCyl = window.physicsMLEngine && window.physicsMLEngine.activeFaults &&
        window.physicsMLEngine.activeFaults.misfire && i === window.physicsMLEngine.activeFaults.misfireCylinder;
      const localRatio = isMisfireCyl ? Math.min(1, egtHeatRatio + 0.35) : egtHeatRatio;

      const emissiveColor = new THREE.Color().setHSL(0.04, 1.0, localRatio * 0.65);
      pipe.material.emissive.copy(emissiveColor);
    });

    // 6. Drift Subtle Ambient Particles
    if (this.particleCloud) {
      this.particleCloud.rotation.y += dt * 0.04;
    }

    // 7. Update Holographic Leader Lines & Floating HUD Cards
    if (this.showHudCallouts) {
      this.updateHudLeaderLines(telemetry);
    }

    // Render Scene
    this.camera.lookAt(this.targetLookAt);
    this.renderer.render(this.scene, this.camera);
  }

  // ==========================================================================
  // DYNAMIC 3D-TO-2D HUD LEADER LINES TRACKING
  // ==========================================================================
  updateHudLeaderLines(telemetry) {
    if (!this.svgLines || !this.container) return;

    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (w <= 0 || h <= 0) return;

    const toScreen = (vLocal) => {
      this._tempV.copy(vLocal).applyMatrix4(this.engineGroup.matrixWorld);
      this._tempV.project(this.camera);
      return {
        x: (this._tempV.x * 0.5 + 0.5) * w,
        y: (-(this._tempV.y * 0.5) + 0.5) * h,
        z: this._tempV.z
      };
    };

    // Update Telemetry Data into HTML Cards
    const avgCht = Math.round(((telemetry.cht || [25, 25, 25, 25]).reduce((a, b) => a + b, 0)) / 4);
    const avgEgt = Math.round(((telemetry.egt || [25, 25, 25, 25]).reduce((a, b) => a + b, 0)) / 4);
    const rpmVal = Math.round(telemetry.rpm || 0);
    const powerKw = (rpmVal > 100 ? (rpmVal * (telemetry.throttlePct || 0) * 0.015).toFixed(1) : '0.0');

    // Thermal Core Card
    const chtEl = document.getElementById('hc_chtVal');
    const egtEl = document.getElementById('hc_egtVal');
    if (chtEl) chtEl.textContent = avgCht;
    if (egtEl) egtEl.textContent = avgEgt;

    // Cylinder Pressure Card
    const rpmEl = document.getElementById('hc_rpm');
    const barEl = document.getElementById('hc_peakBar');
    if (rpmEl) rpmEl.textContent = rpmVal;
    if (barEl) barEl.textContent = (telemetry.cylinderPressureBar || 1.0).toFixed(1);

    // Core Temp Card
    const coreTempEl = document.getElementById('hc_coreTemp');
    if (coreTempEl) coreTempEl.textContent = avgCht;

    // Oil Pressure Card
    const oilPsiEl = document.getElementById('hc_oilPsi');
    const oilRealPsiEl = document.getElementById('hc_oilRealPsi');
    if (oilPsiEl) oilPsiEl.textContent = Math.round((telemetry.oilPressurePsi || 0) * 6.5);
    if (oilRealPsiEl) oilRealPsiEl.textContent = Math.round(telemetry.oilPressurePsi || 0);

    // AI Score Card
    const aiConfEl = document.getElementById('hc_aiConf');
    const powerEl = document.getElementById('hc_power');
    if (aiConfEl) {
      const conf = Math.max(92.0, (1.0 - (telemetry.anomalyScore || 0)) * 100).toFixed(2);
      aiConfEl.textContent = `${conf}%`;
    }
    if (powerEl) powerEl.textContent = powerKw;

    // Rotor Fan Card
    const fanSpeedEl = document.getElementById('hc_fanSpeed');
    if (fanSpeedEl) fanSpeedEl.textContent = Math.round(rpmVal * 0.55);

    // Draw SVG Leader Lines (Exact match to reference lines!)
    let svgHtml = '';

    const drawLeader = (anchorLocal, cardId, cardAnchorSide, color = '#00f0ff') => {
      const card = document.getElementById(cardId);
      if (!card) return;

      const p3d = toScreen(anchorLocal);
      if (p3d.z > 1.0) {
        card.style.opacity = '0';
        return;
      }
      card.style.opacity = '1';

      const cardRect = card.getBoundingClientRect();
      const contRect = this.container.getBoundingClientRect();

      let targetX = cardAnchorSide === 'right' ?
        (cardRect.right - contRect.left) :
        (cardRect.left - contRect.left);
      let targetY = (cardRect.top - contRect.top) + cardRect.height * 0.5;

      const originX = p3d.x;
      const originY = p3d.y;

      const elbowX = cardAnchorSide === 'right' ? originX + 28 : originX - 28;
      const elbowY = originY;

      svgHtml += `
        <circle cx="${originX.toFixed(1)}" cy="${originY.toFixed(1)}" r="3" fill="${color}" />
        <circle cx="${originX.toFixed(1)}" cy="${originY.toFixed(1)}" r="6.5" fill="none" stroke="${color}" stroke-width="1.2" opacity="0.6"/>
        <polyline points="${originX.toFixed(1)},${originY.toFixed(1)} ${elbowX.toFixed(1)},${elbowY.toFixed(1)} ${targetX.toFixed(1)},${targetY.toFixed(1)}"
          fill="none" stroke="${color}" stroke-width="1.5" opacity="0.85" />
      `;
    };

    // Draw all lines matching the reference image layout:
    // 1. Line to Cylinder Head #1 (Amber) -> CYLINDER PRESSURE
    if (this.anchorPoints.cylPressure) drawLeader(this.anchorPoints.cylPressure, 'card-cyl-pressure', 'right', '#ffaa00');

    // 2. Line to Cylinder Barrel #2 (Cyan) -> TEMP / RPM
    if (this.anchorPoints.coreTemp) drawLeader(this.anchorPoints.coreTemp, 'card-core-temp', 'right', '#00f0ff');

    // 3. Line to Oil Sump Seam (Amber) -> OIL PRESSURE
    if (this.anchorPoints.oilPressure) drawLeader(this.anchorPoints.oilPressure, 'card-oil-pressure', 'right', '#ffaa00');

    // 4. Line to Front Turbine Fan Shroud (Cyan) -> ROTOR PRESSURE (BAR)
    if (this.anchorPoints.frontFan) drawLeader(this.anchorPoints.frontFan, 'card-rotor-pressure', 'right', '#00f0ff');

    // 5. Line to Top Air Horn (Cyan) -> THERMAL CORE
    if (this.anchorPoints.thermalCore) drawLeader(this.anchorPoints.thermalCore, 'card-thermal-core', 'left', '#00f0ff');

    // 6. Line to Rear Cylinder Head (Neon) -> AI Analytics Score
    if (this.anchorPoints.aiScore) drawLeader(this.anchorPoints.aiScore, 'card-ai-score', 'left', '#00ff88');

    this.svgLines.innerHTML = svgHtml;
  }

  // ==========================================================================
  // CAMERA COMPONENT HIGHLIGHTING
  // ==========================================================================
  highlightComponent(compId) {
    if (!this.camera) return;

    if (compId === 'fan' || compId === 'turbine') {
      this.camera.position.set(-2.8, 1.4, 3.2);
      this.targetLookAt.set(-1.6, 0.1, 0);
    } else if (compId === 'cylinders') {
      this.camera.position.set(0.35, 2.6, 3.8);
      this.targetLookAt.set(0.35, 0.6, 0.3);
    } else if (compId === 'pistons' || compId === 'conrods') {
      this.camera.position.set(0.35, 1.2, 3.8);
      this.targetLookAt.set(0.35, 0.3, 0.2);
    } else if (compId === 'valves' || compId === 'sparkplugs') {
      this.camera.position.set(0.35, 3.2, 2.8);
      this.targetLookAt.set(0.35, 0.9, 0.3);
    } else if (compId === 'crankshaft' || compId === 'lubrication') {
      this.camera.position.set(0.35, -0.6, 4.0);
      this.targetLookAt.set(0.35, -0.6, 0);
    } else if (compId === 'exhaust' || compId === 'turbo') {
      this.camera.position.set(1.4, 0.8, 3.4);
      this.targetLookAt.set(0.6, -0.1, 0.8);
    } else {
      this.camera.position.copy(this.defaultCamPos);
      this.targetLookAt.set(0.2, 0.1, 0);
    }
  }

  // ==========================================================================
  // RESIZE HANDLER
  // ==========================================================================
  onResize() {
    if (!this.container) return;
    const w = this.container.clientWidth || 500;
    const h = this.container.clientHeight || 400;
    if (w <= 0 || h <= 0) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }
}

window.Engine3DViewer = Engine3DViewer;
