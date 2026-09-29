/**
 * ============================================================================
 * HYPER-DETAILED AEROSPACE UAV IC PROPULSION ENGINE CUTAWAY (DIGITAL TWIN)
 * ============================================================================
 * Features:
 * - 4-Cylinder Aircraft UAV Engine with CNC Aluminum Crankcase & Tubular Trusses
 * - Ultra-Dense Radial Air Cooling Fins & Borosilicate Cutaway Sleeves
 * - Forged Pistons with Ring Grooves, Wrist Pins & H-Beam Kinematic Connecting Rods
 * - DOHC Overhead Camshafts & Active Reciprocating Spring-Loaded Poppet Valves
 * - Dense Aerospace Electrical Wiring Loom, Braided Ignition Leads & CAN Conduit
 * - High-Pressure Fuel Rails with Anodized AN Fittings & Electronic Injectors
 * - Animated Fiery Combustion Chamber Flame Bursts on TDC Power Strokes
 * - Thermal Heat Damage Gradients: Cylinders turn glowing red with fiery embers
 *   when misfiring, overheating, or under missile shock load!
 * ============================================================================
 */

class Engine3DViewer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x08090d);

    // Camera setup
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(42, aspect, 0.1, 150);
    this.camera.position.set(5.2, 3.6, 6.8);

    // High performance renderer with ACES tone mapping
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.container.appendChild(this.renderer.domElement);

    // Industrial Studio Lighting Rig
    this.setupLighting();

    // Studio Grid Floor
    this.setupFloor();

    // Engine Master Hierarchy Group
    this.engineGroup = new THREE.Group();
    this.engineGroup.position.set(0, 0.15, 0);
    this.scene.add(this.engineGroup);

    // Kinematic & Component References
    this.pistons = [];
    this.connectingRods = [];
    this.crankThrows = [];
    this.valves = [];
    this.sparkLights = [];
    this.fireSpheres = [];
    this.cylinderHeads = [];
    this.cylinderBarrels = [];
    this.exhaustPipes = [];
    this.canSensors = {};
    this.crankAngle = 0;

    // Build the Complete Aerospace UAV Engine Model
    this.buildAerospaceEngine();

    // Orbit Controls Setup
    this.setupOrbitControls();

    // Resize Handler
    window.addEventListener('resize', () => this.onResize());

    // Kinematic calculation vector caches
    this._vA = new THREE.Vector3();
    this._vB = new THREE.Vector3();
  }

  setupLighting() {
    this.scene.add(new THREE.AmbientLight(0x94a3b8, 0.8));

    // Cool White Key Light
    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(6, 10, 8);
    key.castShadow = true;
    this.scene.add(key);

    // Aerospace Cyan Fill Light
    const fill = new THREE.DirectionalLight(0x00f0ff, 0.5);
    fill.position.set(-8, 4, -5);
    this.scene.add(fill);

    // Warm Thermal Rim Light
    const rim = new THREE.DirectionalLight(0xf59e0b, 0.4);
    rim.position.set(0, -4, -6);
    this.scene.add(rim);
  }

  setupFloor() {
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.MeshStandardMaterial({ color: 0x0c0e14, roughness: 0.9, metalness: 0.1 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.75;
    floor.receiveShadow = true;
    this.scene.add(floor);

    const grid = new THREE.GridHelper(30, 30, 0x1e293b, 0x0f172a);
    grid.position.y = -1.74;
    this.scene.add(grid);
  }

  // ==========================================================================
  // INTRICATE AEROSPACE ENGINE FABRICATION
  // ==========================================================================
  buildAerospaceEngine() {
    // Aerospace Materials
    const billetAlloyMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.85, roughness: 0.3 });
    const forgedSteelMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.2 });
    const darkCastMat = new THREE.MeshStandardMaterial({ color: 0x1e2430, metalness: 0.6, roughness: 0.7 });
    const copperMat = new THREE.MeshStandardMaterial({ color: 0xd97736, metalness: 0.8, roughness: 0.35 });
    const wireRedMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 });
    const wireBlueMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.5 });
    const braidedSteelMat = new THREE.MeshStandardMaterial({ color: 0x9ca3af, metalness: 0.9, roughness: 0.4 });

    // --- 1. AIRCRAFT TUBULAR ENGINE MOUNTING TRUSS & VIB-ISOLATORS ---
    const mountMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
    [[-2.0, -0.9], [2.0, -0.9], [-2.0, 0.9], [2.0, 0.9]].forEach(([x, z]) => {
      // Tubular strut
      const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.1, 12), mountMat);
      strut.position.set(x, -1.2, z);
      this.engineGroup.add(strut);

      // Rubber vibration-damper bushing
      const damper = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.12, 16), darkCastMat);
      damper.position.set(x, -0.7, z);
      this.engineGroup.add(damper);
    });

    const cradle = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.12, 2.2), mountMat);
    cradle.position.y = -0.75;
    this.engineGroup.add(cradle);

    // --- 2. CNC BILLET ALUMINUM CRANKCASE & LOWER OIL SUMP ---
    const crankcase = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.95, 1.6), billetAlloyMat);
    crankcase.position.set(0, -0.28, 0);
    this.engineGroup.add(crankcase);

    // Stiffening Gussets & Structural Ribs
    for (let r = -1.8; r <= 1.8; r += 0.45) {
      const rib = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.98, 1.65), billetAlloyMat);
      rib.position.set(r, -0.28, 0);
      this.engineGroup.add(rib);
    }

    // Lower Oil Sump with Cooling Ribs & Safety-Wired Drain Plug
    const oilSump = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.35, 1.2), darkCastMat);
    oilSump.position.set(0, -0.85, 0);
    this.engineGroup.add(oilSump);

    const drainPlug = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 6), forgedSteelMat);
    drainPlug.rotation.x = Math.PI / 2;
    drainPlug.position.set(1.4, -0.92, 0.62);
    this.engineGroup.add(drainPlug);

    // --- 3. FOUR RADIAL FINNED CYLINDERS WITH CUTAWAY SLEEVES ---
    const cylSpacing = 0.85;
    const cylXOffsets = [-1.275, -0.425, 0.425, 1.275];

    const cutawayMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.2,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    cylXOffsets.forEach((x, idx) => {
      const cylGroup = new THREE.Group();
      cylGroup.position.set(x, 0.72, 0);
      this.engineGroup.add(cylGroup);

      // Semi-transparent Borosilicate Glass Sleeve
      const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 1.25, 24, 1, true), cutawayMat);
      cylGroup.add(sleeve);
      this.cylinderBarrels.push(sleeve);

      // Ultra-Dense CNC Radial Cooling Fins (12 precision fins per cylinder)
      for (let finY = -0.52; finY <= 0.52; finY += 0.09) {
        const fin = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.02, 28), billetAlloyMat.clone());
        fin.position.y = finY;
        cylGroup.add(fin);
      }

      // Cylinder Head Block
      const headMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.35 });
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.38, 0.72), headMat);
      head.position.y = 0.78;
      cylGroup.add(head);
      this.cylinderHeads.push(head);

      // Cylinder Head Torqued Studs & Nuts
      [[-0.24, -0.24], [0.24, -0.24], [-0.24, 0.24], [0.24, 0.24]].forEach(([sx, sz]) => {
        const stud = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.14, 6), forgedSteelMat);
        stud.position.set(sx, 0.98, sz);
        cylGroup.add(stud);
      });

      // Intake & Exhaust Poppet Valves with Compression Springs
      [-0.14, 0.14].forEach((vz, vIdx) => {
        const valveGroup = new THREE.Group();
        valveGroup.position.set(0, 0.62, vz);

        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.5, 8), forgedSteelMat);
        valveGroup.add(stem);

        const spring = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.22, 12, 1, true), forgedSteelMat);
        spring.position.y = 0.12;
        valveGroup.add(spring);

        const valveHead = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.06, 12), forgedSteelMat);
        valveHead.position.y = -0.22;
        valveHead.rotation.x = Math.PI;
        valveGroup.add(valveHead);

        cylGroup.add(valveGroup);
        this.valves.push({ group: valveGroup, cylIdx: idx, isIntake: vIdx === 0 });
      });

      // Spark Plug with Spark Arc Light & Fire Combustion Burst Sphere
      const sparkPlug = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.025, 0.28, 8), forgedSteelMat);
      sparkPlug.position.set(0, 1.05, 0);
      cylGroup.add(sparkPlug);

      const sparkLight = new THREE.PointLight(0xff7700, 0, 1.5);
      sparkLight.position.set(0, 0.5, 0);
      cylGroup.add(sparkLight);

      // Fiery Combustion Burst Mesh
      const fireSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0 })
      );
      fireSphere.position.set(0, 0.5, 0);
      cylGroup.add(fireSphere);

      this.sparkLights.push(sparkLight);
      this.fireSpheres.push(fireSphere);

      // Electronic Fuel Injector Nozzle with Anodized Fitting
      const injector = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.02, 0.22, 8), copperMat);
      injector.rotation.x = 0.45;
      injector.position.set(0, 0.72, -0.48);
      cylGroup.add(injector);
    });

    // --- 4. FORGED PISTONS, WRIST PINS & H-BEAM CONNECTING RODS ---
    const pistonMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 });
    const rodMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.3 });

    cylXOffsets.forEach((x, i) => {
      // Piston with 3 Compression Ring Grooves
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.28, 24), pistonMat);
      p.position.set(x, 0.38, 0);
      this.engineGroup.add(p);
      this.pistons.push(p);

      // Wrist Pin
      const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.52, 12), forgedSteelMat);
      pin.rotation.z = Math.PI / 2;
      pin.position.set(0, -0.02, 0);
      p.add(pin);

      // H-Beam Rod
      const rod = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.05, 0.1), rodMat);
      rod.userData.baseLength = 1.05;
      this.engineGroup.add(rod);
      this.connectingRods.push(rod);
    });

    // --- 5. COUNTERWEIGHTED CRANKSHAFT & FLYWHEEL ---
    this.crankshaftGroup = new THREE.Group();
    this.crankshaftGroup.position.set(0, -0.45, 0);
    this.engineGroup.add(this.crankshaftGroup);

    const mainShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 4.2, 16), forgedSteelMat);
    mainShaft.rotation.z = Math.PI / 2;
    this.crankshaftGroup.add(mainShaft);

    cylXOffsets.forEach((x, i) => {
      const crankPhase = (i === 0 || i === 3) ? 0 : Math.PI;

      const throwGroup = new THREE.Group();
      throwGroup.position.set(x, 0, 0);
      throwGroup.rotation.x = crankPhase;
      this.crankshaftGroup.add(throwGroup);

      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.36, 0.18), forgedSteelMat);
      arm.position.set(0, 0.18, 0);
      throwGroup.add(arm);

      // Heavy Counterweight
      const counterWeight = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 0.09, 16, 1, false, 0, Math.PI),
        darkCastMat
      );
      counterWeight.rotation.z = Math.PI / 2;
      counterWeight.position.set(0, -0.12, 0);
      throwGroup.add(counterWeight);

      const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.14, 12), forgedSteelMat);
      pin.rotation.z = Math.PI / 2;
      pin.position.set(0, 0.32, 0);
      throwGroup.add(pin);

      this.crankThrows.push(pin);
    });

    // Rear Flywheel with Starter Ring Gear Teeth
    const flywheel = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.18, 36), darkCastMat);
    flywheel.rotation.z = Math.PI / 2;
    flywheel.position.set(2.15, 0, 0);
    this.crankshaftGroup.add(flywheel);

    // High Torque Starter Motor
    const starter = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.6, 16), darkCastMat);
    starter.rotation.z = Math.PI / 2;
    starter.position.set(1.8, -0.22, 0.65);
    this.engineGroup.add(starter);

    // --- 6. HIGH-PRESSURE FUEL RAIL & BRAIDED STAINLESS HOSES ---
    const fuelRail = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.2, 12), braidedSteelMat);
    fuelRail.rotation.z = Math.PI / 2;
    fuelRail.position.set(0, 1.45, -0.65);
    this.engineGroup.add(fuelRail);

    // Fuel hose with Anodized Fittings (Red/Blue aerospace AN-fittings)
    cylXOffsets.forEach(x => {
      const dropHose = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.35, 8), braidedSteelMat);
      dropHose.position.set(x, 1.25, -0.6);
      this.engineGroup.add(dropHose);

      const fitting = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.06, 6), wireBlueMat);
      fitting.position.set(x, 1.42, -0.65);
      this.engineGroup.add(fitting);
    });

    // --- 7. DENSE ELECTRICAL WIRING LOOM & IGNITION LEADS ---
    const ecuBox = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.35, 0.35), darkCastMat);
    ecuBox.position.set(-1.8, 1.5, 0.4);
    this.engineGroup.add(ecuBox);

    // Braided Red Spark Plug Leads running from ECU to each plug
    cylXOffsets.forEach((x, i) => {
      const p0 = new THREE.Vector3(-1.8, 1.5, 0.4);
      const p1 = new THREE.Vector3(x * 0.7, 1.8, 0.1);
      const p2 = new THREE.Vector3(x, 1.8, 0.0);
      const curve = new THREE.CatmullRomCurve3([p0, p1, p2]);
      const wire = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 16, 0.016, 6, false),
        i % 2 === 0 ? wireRedMat : wireBlueMat
      );
      this.engineGroup.add(wire);
    });

    // --- 8. EXHAUST HEADERS & GLOWING CERAMIC TURBOCHARGER ---
    const exhaustMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.85,
      roughness: 0.3,
      emissive: new THREE.Color(0x000000)
    });

    cylXOffsets.forEach(x => {
      const p0 = new THREE.Vector3(x, 0.72, 0.38);
      const p1 = new THREE.Vector3(x * 0.6, 0.4, 0.75);
      const p2 = new THREE.Vector3(1.6, 0.25, 0.95);
      const curve = new THREE.CatmullRomCurve3([p0, p1, p2]);
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 20, 0.055, 8, false), exhaustMat.clone());
      this.engineGroup.add(tube);
      this.exhaustPipes.push(tube);
    });

    // Turbocharger Volute Housing
    this.turboHousing = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.12, 16, 24), exhaustMat.clone());
    this.turboHousing.position.set(1.7, 0.25, 0.95);
    this.turboHousing.rotation.y = Math.PI / 2;
    this.engineGroup.add(this.turboHousing);

    // --- 9. CAN SENSOR NODES WITH REAL-TIME STATUS LEDS ---
    this.createCanSensorNode('rpm', 2.1, -0.2, 0.25, 'RPM HALL');
    this.createCanSensorNode('cht', 0.0, 1.55, 0.0, 'CHT ARRAY');
    this.createCanSensorNode('oil', 0.9, -0.75, 0.65, 'OIL PSI');
    this.createCanSensorNode('vib', -0.9, -0.3, -0.85, '3-AXIS ACCEL');
  }

  createCanSensorNode(key, x, y, z, label) {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    this.engineGroup.add(group);

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.16), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
    group.add(body);

    const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.25, 6), new THREE.MeshBasicMaterial({ color: 0x00f0ff }));
    wire.rotation.x = Math.PI / 2;
    wire.position.z = 0.14;
    group.add(wire);

    const led = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), new THREE.MeshBasicMaterial({ color: 0x00ff88 }));
    led.position.y = 0.08;
    group.add(led);

    this.canSensors[key] = { group, led };
  }

  setupOrbitControls() {
    this.isDragging = false;
    this.lastX = 0;
    this.lastY = 0;
    this.rotY = 0.45;
    this.rotX = 0.2;

    const dom = this.renderer.domElement;
    dom.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      this.rotY += (e.clientX - this.lastX) * 0.008;
      this.rotX = Math.max(-0.8, Math.min(0.8, this.rotX + (e.clientY - this.lastY) * 0.006));
      this.lastX = e.clientX;
      this.lastY = e.clientY;
    });

    window.addEventListener('mouseup', () => { this.isDragging = false; });

    dom.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.camera.position.multiplyScalar(1 + e.deltaY * 0.0015);
      this.camera.position.clampLength(3.0, 16.0);
    }, { passive: false });
  }

  // ==========================================================================
  // REAL-TIME KINEMATICS & THERMAL DAMAGE UPDATE
  // ==========================================================================
  update(dt, telemetry) {
    this.engineGroup.rotation.y = this.rotY;
    this.engineGroup.rotation.x = this.rotX;

    const rpm = telemetry.rpm || 0;
    const angularSpeed = (rpm / 60) * Math.PI * 2;
    this.crankAngle += angularSpeed * dt;

    // 1. Rotate Crankshaft
    this.crankshaftGroup.rotation.x = this.crankAngle;

    // 2. Kinematics for Pistons & H-Beam Rods
    this.pistons.forEach((piston, idx) => {
      const phase = this.crankAngle + ((idx === 0 || idx === 3) ? 0 : Math.PI);
      const pistonY = 0.38 + Math.sin(phase) * 0.32;
      piston.position.y = pistonY;

      const rod = this.connectingRods[idx];
      const crankPin = this.crankThrows[idx];

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
    });

    // 3. Poppet Valve Lift
    this.valves.forEach((v) => {
      const cylIdx = v.cylIdx;
      const phase = (this.crankAngle / 2) + ((cylIdx === 0 || cylIdx === 3) ? 0 : Math.PI);
      const lift = Math.max(0, Math.sin(phase + (v.isIntake ? 0 : Math.PI / 2))) * 0.09;
      v.group.position.y = 0.62 - lift;
    });

    // 4. Live Fiery Combustion Flame Flash on Power Stroke (TDC)
    this.sparkLights.forEach((sparkLight, idx) => {
      const phase = this.crankAngle + ((idx === 0 || idx === 3) ? 0 : Math.PI);
      const isPowerStroke = Math.sin(phase) > 0.92 && rpm > 100;
      const isMisfiring = window.physicsMLEngine.activeFaults.misfire && idx === window.physicsMLEngine.activeFaults.misfireCylinder;

      const fireMesh = this.fireSpheres[idx];

      if (isPowerStroke && !isMisfiring) {
        sparkLight.intensity = 2.4;
        fireMesh.material.opacity = 0.95;
        fireMesh.scale.setScalar(1.0 + Math.random() * 0.2);
      } else {
        sparkLight.intensity = 0;
        fireMesh.material.opacity = 0;
      }
    });

    // 5. Thermal Heat Glow & Overheating Animation
    const avgEgt = (telemetry.egt[0] + telemetry.egt[1] + telemetry.egt[2] + telemetry.egt[3]) / 4;
    const egtHeatRatio = Math.max(0, Math.min(1, (avgEgt - 200) / 650));

    this.exhaustPipes.forEach((pipe, i) => {
      const isMisfireCyl = window.physicsMLEngine.activeFaults.misfire && i === window.physicsMLEngine.activeFaults.misfireCylinder;
      const localRatio = isMisfireCyl ? Math.min(1, egtHeatRatio + 0.4) : egtHeatRatio;

      const emissiveColor = new THREE.Color().setHSL(0.04, 1.0, localRatio * 0.55);
      pipe.material.emissive.copy(emissiveColor);
    });

    if (this.turboHousing) {
      this.turboHousing.material.emissive.setHSL(0.05, 0.95, egtHeatRatio * 0.45);
    }

    // Cylinder Overheating Glow (If CHT > 145 or misfiring/attack)
    this.cylinderHeads.forEach((head, i) => {
      const cylCht = telemetry.cht[i];
      const isMisfire = window.physicsMLEngine.activeFaults.misfire && i === window.physicsMLEngine.activeFaults.misfireCylinder;

      if (cylCht > 150 || isMisfire) {
        head.material.emissive.setHex(0xff2200);
        head.material.emissiveIntensity = 0.7;
      } else {
        head.material.emissive.setHex(0x000000);
        head.material.emissiveIntensity = 0;
      }
    });

    // 6. Update Sensor LEDs
    this.updateSensorLeds(telemetry);

    this.camera.lookAt(0, 0.25, 0);
    this.renderer.render(this.scene, this.camera);
  }

  updateSensorLeds(telemetry) {
    if (!this.canSensors.rpm) return;

    const rpmStatus = telemetry.anomalyScore > 0.7 ? 0xff3355 : 0x00ff88;
    this.canSensors.rpm.led.material.color.setHex(rpmStatus);

    const maxCht = Math.max(...telemetry.cht);
    const chtStatus = maxCht > 165 ? 0xff3355 : maxCht > 145 ? 0xffaa00 : 0x00ff88;
    this.canSensors.cht.led.material.color.setHex(chtStatus);

    const oilStatus = (telemetry.engineRunning && telemetry.oilPressurePsi < 20) ? 0xff3355 : 0x00ff88;
    this.canSensors.oil.led.material.color.setHex(oilStatus);

    const vibStatus = telemetry.vibrationRmsG > 2.2 ? 0xff3355 : telemetry.vibrationRmsG > 1.4 ? 0xffaa00 : 0x00ff88;
    this.canSensors.vib.led.material.color.setHex(vibStatus);
  }

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
