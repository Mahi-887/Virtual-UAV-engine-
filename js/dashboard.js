/**
 * ============================================================================
 * UAV PROPULSION DIGITAL TWIN — MASTER DASHBOARD & CONTROLLER
 * ============================================================================
 */

class DashboardController {
  constructor() {
    this.keys = {};
    this.audioEnabled = false;
    this.audioCtx = null;
    this.engineOsc = null;
    this.engineGain = null;

    // Viewport Instances
    this.engineViewer = null;
    this.flightViewer = null;
    this.inspectorViewer = null;

    // Mission Replay State
    this.replayMode = false;
    this.activeMissionKey = 'misfire_incident';
    this.replayTime = 0;
    this.replaySpeed = 1.0;
    this.isReplayPlaying = false;

    // Live Mission Flight Tracker
    this.sortieStartTime = performance.now();
    this.peakAltitudeFt = 0;
    this.peakAirspeedKt = 0;
    this.lastLoggedPhase = '';

    // UI Element Cache
    this.cacheElements();

    // Setup Event Listeners
    this.bindEvents();

    // Setup Interactive Sensors & Engine Knowledge Encyclopedia
    this.setupKnowledgeEncyclopedia();

    // Start Real-Time Animation Loop
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.mainLoop(t));
  }

  logFlightEvent(eventText, type = 'info') {
    const elapsedSec = Math.floor((performance.now() - this.sortieStartTime) / 1000);
    const m = Math.floor(elapsedSec / 60);
    const s = elapsedSec % 60;
    const timeStr = `T+${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    const logEl = document.getElementById('bbEventLog');
    if (logEl) {
      const color = type === 'danger' ? 'var(--accent-danger)' : type === 'warn' ? 'var(--accent-amber)' : 'var(--accent-cyan)';
      const div = document.createElement('div');
      div.style.color = color;
      div.textContent = `• [${timeStr}] ${eventText}`;
      logEl.appendChild(div);
      logEl.scrollTop = logEl.scrollHeight;
    }
  }

  cacheElements() {
    // Buttons & Toggles
    this.btnEngineToggle = document.getElementById('engineToggle');
    this.btnFaultMisfire = document.getElementById('btnFaultMisfire');
    this.btnFaultOverpressure = document.getElementById('btnFaultOverpressure');
    this.btnFaultOil = document.getElementById('btnFaultOil');
    this.btnFaultClear = document.getElementById('btnFaultClear');
    this.btnRefuel = document.getElementById('btnRefuel');
    this.btnTakeoff = document.getElementById('btnTakeoff');
    this.btnAudioToggle = document.getElementById('btnAudioToggle');

    // Sliders & Controls
    this.sliderWeather = document.getElementById('sliderWeather');
    this.sliderTimeOfDay = document.getElementById('sliderTimeOfDay');
    this.weatherLabel = document.getElementById('weatherLabel');
    this.timeLabel = document.getElementById('timeLabel');

    // HUD & Telemetry Displays
    this.hudRpm = document.getElementById('hudRpm');
    this.hudAlt = document.getElementById('hudAlt');
    this.hudSpd = document.getElementById('hudSpd');
    this.hudHdg = document.getElementById('hudHdg');
    this.hudThr = document.getElementById('hudThr');
    this.hudFuel = document.getElementById('hudFuel');
    this.hudStatus = document.getElementById('hudStatus');

    // Sidebar Displays
    this.sideRpm = document.getElementById('sideRpm');
    this.sidePressure = document.getElementById('sidePressure');
    this.sideCht = document.getElementById('sideCht');
    this.sideEgt = document.getElementById('sideEgt');
    this.sideOil = document.getElementById('sideOil');
    this.sideFuel = document.getElementById('sideFuel');
    this.sideVib = document.getElementById('sideVib');
    this.sideBattery = document.getElementById('sideBattery');
    this.sideAltCurrent = document.getElementById('sideAltCurrent');

    // Gauges & Bars
    this.anomScoreVal = document.getElementById('anomScoreVal');
    this.anomBar = document.getElementById('anomBar');
    this.rulVal = document.getElementById('rulVal');
    this.rulBar = document.getElementById('rulBar');
    this.fuelBar = document.getElementById('fuelBar');
    this.fuelLevelVal = document.getElementById('fuelLevelVal');
    this.airframeVal = document.getElementById('airframeVal');
    this.airframeBar = document.getElementById('airframeBar');
    this.healthBadge = document.getElementById('healthBadge');

    // Banners
    this.alertBanner = document.getElementById('alertBanner');
    this.hazardBanner = document.getElementById('hazardBanner');

    // Sensors
    this.sRpm = document.getElementById('sRpm');
    this.sCht = document.getElementById('sCht');
    this.sOil = document.getElementById('sOil');
    this.sVib = document.getElementById('sVib');
    this.sFuel = document.getElementById('sFuel');
    this.sAirframe = document.getElementById('sAirframe');

    // Replay Elements
    this.replayScrubber = document.getElementById('replayScrubber');
    this.replayTimeLabel = document.getElementById('replayTimeLabel');
    this.btnReplayPlay = document.getElementById('btnReplayPlay');
  }

  bindEvents() {
    // 1. Keyboard Controls
    window.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
      if (e.key === 't' || e.key === 'T') {
        this.keys['takeoff'] = true;
      }
      if (e.key === 'l' || e.key === 'L') {
        this.keys['land'] = true;
      }
      if (e.key === 'r' || e.key === 'R') {
        if (this.flightViewer) this.flightViewer.resetFlight();
        this.logFlightEvent("Flight reset to runway centerline.", 'info');
      }
      if (e.key === 'm' || e.key === 'M') {
        if (window.speechAlertEngine) {
          const isMuted = window.speechAlertEngine.muteToggle();
          const btnMute = document.getElementById('btnFlightMuteAlarm');
          if (btnMute) btnMute.textContent = isMuted ? "🔕 UNMUTE (M)" : "🔔 MUTE (M)";
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
      if (e.key === 't' || e.key === 'T') {
        this.keys['takeoff'] = false;
      }
      if (e.key === 'l' || e.key === 'L') {
        this.keys['land'] = false;
      }
    });

    // 2. Tactile On-Screen Flight Controller Buttons
    const bindPad = (elementId, keyMap) => {
      const el = document.getElementById(elementId);
      if (!el) return;
      const press = (ev) => { ev.preventDefault(); this.keys[keyMap] = true; el.classList.add('pressed'); };
      const release = (ev) => { ev.preventDefault(); this.keys[keyMap] = false; el.classList.remove('pressed'); };
      el.addEventListener('pointerdown', press);
      el.addEventListener('pointerup', release);
      el.addEventListener('pointerleave', release);
      el.addEventListener('pointercancel', release);
    };

    bindPad('btnThrUp', 'btnThrUp');
    bindPad('btnThrDn', 'btnThrDn');
    bindPad('btnPitchUp', 'btnPitchUp');
    bindPad('btnPitchDn', 'btnPitchDn');
    bindPad('btnYawL', 'btnYawL');
    bindPad('btnYawR', 'btnYawR');

    // Takeoff Button (UI Button or 'T' key)
    if (this.btnTakeoff) {
      this.btnTakeoff.addEventListener('click', () => {
        if (this.flightViewer) {
          if (this.flightViewer.flightState.isCrashed) {
            this.flightViewer.resetFlight();
          }
          if (!window.physicsMLEngine.state.engineRunning) {
            this.setEngineRunning(true);
          }
          window.physicsMLEngine.state.throttlePct = 100;
          this.flightViewer.autoTakeoff.active = true;
          this.flightViewer.autoTakeoff.stage = 'climb';
          this.flightViewer.takeoffCooldown = 15.0;
          this.flightViewer.flightState.airspeedKt = Math.max(55, this.flightViewer.flightState.airspeedKt);
          this.flightViewer.flightState.onGround = false;
          this.flightViewer.flightState.gearRetracted = true;
          this.flightViewer.flightState.pitchRad = 0.28;
          this.flightViewer.flightState.position.y = Math.max(4.0, this.flightViewer.flightState.position.y);
          if (window.speechAlertEngine) {
            window.speechAlertEngine.speak("Takeoff initiated. Spooling to full power. Tactical climb above skyline.", true);
          }
          this.logFlightEvent("Takeoff initiated. Tactical climb to cruising altitude above city skyline.", 'info');
          this.showAlert("🛫 TAKEOFF: Climbing above city skyscrapers! Use W/S or D-Pad for climb/dive, A/D to steer.", "info");
        }
      });
    }

    // Reset Flight Button
    const btnFlightReset = document.getElementById('btnFlightReset');
    if (btnFlightReset) {
      btnFlightReset.addEventListener('click', () => {
        if (this.flightViewer) this.flightViewer.resetFlight();
        this.logFlightEvent("Flight reset to runway centerline via UI.", 'info');
        this.showAlert("🔄 Flight reset to runway centerline. Ready for takeoff.", "info");
      });
    }

    // Landing Button (UI Button or 'L' key)
    const btnLand = document.getElementById('btnLand');
    if (btnLand) {
      btnLand.addEventListener('click', () => {
        if (this.flightViewer && !this.flightViewer.flightState.onGround) {
          window.physicsMLEngine.state.throttlePct = 25;
          this.flightViewer.flightState.gearRetracted = false;
          this.flightViewer.flightState.pitchRad = -0.04;
          this.flightViewer.landingApproach = true;
          this.flightViewer.takeoffCooldown = 0;
          if (window.speechAlertEngine) {
            window.speechAlertEngine.speak("Initiating landing approach. Landing gear deployed.", true);
          }
          this.logFlightEvent("Landing approach initiated. Gear deployed.", 'warn');
          this.showAlert("🛬 Landing approach active. Aligning glide slope with runway.", "warn");
        }
      });
    }

    // Flight Viewport Header Buttons (Direct Engine Start/Stop & Mute)
    const btnFlightEngineToggle = document.getElementById('btnFlightEngineToggle');
    if (btnFlightEngineToggle) {
      btnFlightEngineToggle.addEventListener('click', () => {
        this.setEngineRunning(!window.physicsMLEngine.state.engineRunning);
      });
    }

    const btnFlightMuteAlarm = document.getElementById('btnFlightMuteAlarm');
    if (btnFlightMuteAlarm) {
      btnFlightMuteAlarm.addEventListener('click', () => {
        if (window.speechAlertEngine) {
          const isMuted = window.speechAlertEngine.muteToggle();
          btnFlightMuteAlarm.textContent = isMuted ? "🔕 UNMUTE ALARM (M)" : "🔔 MUTE ALARM (M)";
        }
      });
    }

    // Center Alert Modal Dismiss Button
    const btnDismissCenterAlert = document.getElementById('btnDismissCenterAlert');
    if (btnDismissCenterAlert) {
      btnDismissCenterAlert.addEventListener('click', () => {
        if (window.speechAlertEngine) {
          window.speechAlertEngine.dismissAlert();
        }
      });
    }

    // Refuel Button
    if (this.btnRefuel) {
      this.btnRefuel.addEventListener('click', () => {
        window.physicsMLEngine.refuel();
        if (window.speechAlertEngine) {
          window.speechAlertEngine.speak("Refueling complete. Fuel tank at one hundred percent.", true);
        }
        this.showAlert("Aircraft successfully refueled to 100% capacity.", "info");
      });
    }

    // 3. Engine Start/Stop Toggle (Sidebar)
    if (this.btnEngineToggle) {
      this.btnEngineToggle.addEventListener('click', () => {
        this.setEngineRunning(!window.physicsMLEngine.state.engineRunning);
      });
    }

    // 4. Fault Injections with Center Pulse Alerts
    if (this.btnFaultMisfire) {
      this.btnFaultMisfire.addEventListener('click', () => {
        window.physicsMLEngine.triggerMisfire(true, 1);
        if (window.speechAlertEngine) {
          window.speechAlertEngine.triggerCriticalAlert(
            "CYLINDER #2 MISFIRE",
            "Severe spark ignition irregularity & 2.8g vibration surge detected!",
            "Alert! Spark ignition misfire on cylinder number two! Vibration surge detected!"
          );
        }
        this.showAlert("FAULT INJECTED: Spark/Ignition Misfire on Cylinder #2!", "danger");
      });
    }

    if (this.btnFaultOverpressure) {
      this.btnFaultOverpressure.addEventListener('click', () => {
        window.physicsMLEngine.triggerOverpressure(true);
        if (window.speechAlertEngine) {
          window.speechAlertEngine.triggerCriticalAlert(
            "OVERPRESSURE HAZARD",
            "Cylinder pressure exceeded 90 bar! Wastegate failure — risk of head gasket blowout!",
            "Warning! In-cylinder overpressure spike! Turbocharger wastegate failure!"
          );
        }
        this.showAlert("FAULT INJECTED: Turbocharger Wastegate Stuck — Cylinder Overpressure!", "danger");
      });
    }

    if (this.btnFaultOil) {
      this.btnFaultOil.addEventListener('click', () => {
        window.physicsMLEngine.triggerOilLoss(true);
        if (window.speechAlertEngine) {
          window.speechAlertEngine.triggerCriticalAlert(
            "OIL PRESSURE COLLAPSE",
            "Lubrication line ruptured — pressure dropped below 20 psi! High friction seizure risk!",
            "Warning! Lubrication line rupture! Oil pressure collapsing!"
          );
        }
        this.showAlert("FAULT INJECTED: Lubrication Line Rupture — Oil Pressure Collapsing!", "danger");
      });
    }

    if (this.btnFaultClear) {
      this.btnFaultClear.addEventListener('click', () => {
        window.physicsMLEngine.clearAllFaults();
        if (window.speechAlertEngine) {
          window.speechAlertEngine.dismissAlert();
          window.speechAlertEngine.speak("All simulated faults cleared. Systems nominal.", true);
        }
        this.showAlert("All simulated faults cleared. Systems nominal.", "info");
      });
    }

    // 5. Weather & Time of Day Sliders
    if (this.sliderWeather) {
      this.sliderWeather.addEventListener('input', () => {
        const val = parseInt(this.sliderWeather.value, 10);
        const temps = [22, 38, 48];
        const labels = ["Normal (22°C)", "Hot (38°C)", "Desert Extreme (48°C)"];
        this.weatherLabel.textContent = labels[val];
        window.physicsMLEngine.state.ambientTempC = temps[val];
      });
    }

    if (this.sliderTimeOfDay) {
      this.sliderTimeOfDay.addEventListener('input', () => {
        const val = parseFloat(this.sliderTimeOfDay.value);
        const h = Math.floor(val);
        const m = Math.round((val % 1) * 60);
        this.timeLabel.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        if (this.flightViewer && this.flightViewer.setTimeOfDay) {
          this.flightViewer.autoTimeProgression = false;
          this.flightViewer.setTimeOfDay(val);
        }
      });
    }

    // Celestial Quick Buttons (Day, Sunset, Night, Auto)
    const setTimeMode = (hours, auto = false) => {
      if (this.sliderTimeOfDay) {
        this.sliderTimeOfDay.value = hours;
        const h = Math.floor(hours);
        const m = Math.round((hours % 1) * 60);
        this.timeLabel.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      }
      if (this.flightViewer && this.flightViewer.setTimeOfDay) {
        this.flightViewer.autoTimeProgression = auto;
        this.flightViewer.setTimeOfDay(hours);
      }
      document.querySelectorAll('.celestial-btn').forEach(b => b.classList.remove('active'));
    };

    const btnDay = document.getElementById('btnTimeDay');
    if (btnDay) btnDay.addEventListener('click', () => { setTimeMode(12.0); btnDay.classList.add('active'); });

    const btnSunset = document.getElementById('btnTimeSunset');
    if (btnSunset) btnSunset.addEventListener('click', () => { setTimeMode(18.5); btnSunset.classList.add('active'); });

    const btnNight = document.getElementById('btnTimeNight');
    if (btnNight) btnNight.addEventListener('click', () => { setTimeMode(0.0); btnNight.classList.add('active'); });

    const btnAuto = document.getElementById('btnTimeAuto');
    if (btnAuto) btnAuto.addEventListener('click', () => {
      const current = parseFloat((this.sliderTimeOfDay && this.sliderTimeOfDay.value) || 12);
      setTimeMode(current, true);
      btnAuto.classList.add('active');
    });

    // DRDO Prognostics HUD Collapse Toggle
    const btnToggleProg = document.getElementById('btnToggleProgPanel');
    const hudProg = document.getElementById('drdoPrognosticsHud');
    if (btnToggleProg && hudProg) {
      btnToggleProg.addEventListener('click', () => {
        hudProg.classList.toggle('collapsed');
        btnToggleProg.textContent = hudProg.classList.contains('collapsed') ? '▲' : '▼';
      });
    }

    // 6. Navigation Tabs & Fullscreen Flight Game Mode
    const overviewTab = document.getElementById('tab-overview');
    const btnToggleFlightMode = document.getElementById('btnToggleFlightMode');

    this.setFlightFullscreen = (isFullscreen) => {
      if (!overviewTab) return;
      if (isFullscreen) {
        overviewTab.classList.add('fullscreen-flight');
        if (btnToggleFlightMode) btnToggleFlightMode.textContent = "◫ SPLIT DUAL VIEW";
      } else {
        overviewTab.classList.remove('fullscreen-flight');
        if (btnToggleFlightMode) btnToggleFlightMode.textContent = "⛶ FULLSCREEN GAME";
      }
      setTimeout(() => {
        if (this.flightViewer) this.flightViewer.onResize();
        if (this.engineViewer) this.engineViewer.onResize();
      }, 50);
    };

    this.switchToTab = (targetView) => {
      const tabs = document.querySelectorAll('.tab-btn');
      tabs.forEach(t => {
        const dt = t.getAttribute('data-tab');
        t.classList.toggle('active', dt === targetView);
      });

      if (targetView === 'flight-game') {
        document.querySelectorAll('.tab-content').forEach(view => view.classList.remove('active'));
        if (overviewTab) {
          overviewTab.classList.add('active');
          this.setFlightFullscreen(true);
        }
      } else if (targetView === 'overview') {
        document.querySelectorAll('.tab-content').forEach(view => view.classList.remove('active'));
        if (overviewTab) {
          overviewTab.classList.add('active');
          this.setFlightFullscreen(false);
        }
      } else {
        document.querySelectorAll('.tab-content').forEach(view => view.classList.remove('active'));
        const activeContainer = document.getElementById(`tab-${targetView}`);
        if (activeContainer) activeContainer.classList.add('active');

        if (targetView === 'engine-inspector' && !this.inspectorViewer) {
          this.inspectorViewer = new Engine3DViewer('inspectorViewport');
        }
      }

      const doResizes = () => {
        if (this.engineViewer) this.engineViewer.onResize();
        if (this.flightViewer) this.flightViewer.onResize();
        if (this.inspectorViewer) this.inspectorViewer.onResize();
        window.dispatchEvent(new Event('resize'));
      };
      doResizes();
      setTimeout(doResizes, 50);
      setTimeout(doResizes, 150);
    };

    if (btnToggleFlightMode) {
      btnToggleFlightMode.addEventListener('click', () => {
        const isCurrentlyFullscreen = overviewTab.classList.contains('fullscreen-flight');
        this.switchToTab(isCurrentlyFullscreen ? 'overview' : 'flight-game');
      });
    }

    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetView = tab.getAttribute('data-tab');
        if (targetView) {
          window.location.hash = targetView;
          this.switchToTab(targetView);
        }
      });
    });

    // Check URL Hash on Load & Hash Changes
    const checkHashNav = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && ['overview', 'flight-game', 'engine-inspector', 'ai-diagnostics', 'replay', 'reports'].includes(hash)) {
        this.switchToTab(hash);
      }
    };
    window.addEventListener('hashchange', checkHashNav);
    setTimeout(checkHashNav, 100);

    // 7. Camera Buttons
    ['chase', 'cockpit', 'map'].forEach(mode => {
      const btn = document.getElementById(`camBtn_${mode}`);
      if (btn) {
        btn.addEventListener('click', () => {
          if (this.flightViewer) this.flightViewer.setCameraMode(mode);
          ['chase', 'cockpit', 'map'].forEach(m => {
            const b = document.getElementById(`camBtn_${m}`);
            if (b) b.classList.toggle('active', m === mode);
          });
        });
      }
    });

    // 8. Replay System Events
    this.bindReplayControls();

    // 9. Report Export Button
    const btnExportReport = document.getElementById('btnExportReport');
    if (btnExportReport) {
      btnExportReport.addEventListener('click', () => this.exportMissionReport());
    }

    // 10. Audio Mute Toggle
    if (this.btnAudioToggle) {
      this.btnAudioToggle.addEventListener('click', () => {
        this.audioEnabled = !this.audioEnabled;
        this.btnAudioToggle.textContent = this.audioEnabled ? "🔊 Sound ON" : "🔇 Sound OFF";
        if (this.audioEnabled && !this.audioCtx) {
          this.initAudioSynthesizer();
        }
      });
    }
  }

  // ==========================================================================
  // UNIFIED ENGINE CONTROLLER (TOP NAVBAR & FLIGHT VIEWPORT HEADER)
  // ==========================================================================
  setEngineRunning(isRunning) {
    window.physicsMLEngine.state.engineRunning = isRunning;

    // 1. Update Sidebar / Top Engine Toggle Button
    if (this.btnEngineToggle) {
      this.btnEngineToggle.textContent = isRunning ? "STOP ENGINE" : "START ENGINE";
      this.btnEngineToggle.className = isRunning ? "btn-action danger" : "btn-action primary";
    }

    // 2. Update Flight Viewport Header Button
    const btnFlightEngine = document.getElementById('btnFlightEngineToggle');
    if (btnFlightEngine) {
      btnFlightEngine.textContent = isRunning ? "STOP ENGINE" : "START ENGINE";
      btnFlightEngine.className = isRunning ? "btn-action danger" : "btn-action primary";
    }

    if (isRunning) {
      if (window.speechAlertEngine) {
        window.speechAlertEngine.speak("Engine started. Systems nominal.", true);
      }
      if (!this.audioCtx && this.audioEnabled) {
        this.initAudioSynthesizer();
      }
    } else {
      if (window.speechAlertEngine) {
        window.speechAlertEngine.speak("Engine shutdown.", true);
        window.speechAlertEngine.stopAlarmBeeper();
      }
    }
  }

  // ==========================================================================
  // REPLAY SYSTEM WIRING
  // ==========================================================================
  bindReplayControls() {
    if (!this.replayScrubber) return;

    this.replayScrubber.addEventListener('input', () => {
      this.replayTime = parseFloat(this.replayScrubber.value);
      this.updateReplayFrame(this.replayTime);
    });

    if (this.btnReplayPlay) {
      this.btnReplayPlay.addEventListener('click', () => {
        this.isReplayPlaying = !this.isReplayPlaying;
        this.btnReplayPlay.textContent = this.isReplayPlaying ? "PAUSE" : "PLAY";
      });
    }

    // Mission Preset Selectors
    document.querySelectorAll('.mission-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.mission-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.activeMissionKey = card.getAttribute('data-mission');
        this.replayTime = 0;
        this.replayScrubber.value = 0;
        const preset = window.MISSION_DATASETS[this.activeMissionKey];
        if (preset) {
          this.replayScrubber.max = preset.durationSeconds;
          this.showAlert(`Loaded Mission Profile: ${preset.name}`, "info");
        }
      });
    });
  }

  updateReplayFrame(t) {
    const preset = window.MISSION_DATASETS[this.activeMissionKey];
    if (!preset) return;

    this.replayTimeLabel.textContent = `T+${Math.floor(t)}s / ${preset.durationSeconds}s`;

    // Apply mission profile to physics engine
    window.physicsMLEngine.state.engineRunning = true;
    window.physicsMLEngine.state.ambientTempC = preset.ambientTemp;
    window.physicsMLEngine.state.throttlePct = preset.throttleProfile(t);
    window.physicsMLEngine.state.altitudeFt = preset.altitudeProfile(t);

    if (preset.anomalyInjectionAt && t >= preset.anomalyInjectionAt) {
      window.physicsMLEngine.triggerMisfire(true, 1);
    } else {
      window.physicsMLEngine.clearAllFaults();
    }
  }

  // ==========================================================================
  // WEB AUDIO SYNTHESIZER (ENGINE SOUND & ALERTS)
  // ==========================================================================
  initAudioSynthesizer() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();

      // Engine fundamental hum oscillator
      this.engineOsc = this.audioCtx.createOscillator();
      this.engineOsc.type = 'sawtooth';
      this.engineGain = this.audioCtx.createGain();
      this.engineGain.gain.setValueAtTime(0.01, this.audioCtx.currentTime);

      // Lowpass filter for deep piston thump
      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280, this.audioCtx.currentTime);

      this.engineOsc.connect(filter);
      filter.connect(this.engineGain);
      this.engineGain.connect(this.audioCtx.destination);

      this.engineOsc.start();
    } catch (e) {
      console.warn("Audio synthesis not available:", e);
    }
  }

  updateAudio(rpm, isRunning) {
    if (!this.audioCtx || !this.audioEnabled || !this.engineOsc) return;

    if (isRunning && rpm > 100) {
      // 4-cylinder engine firing frequency = (RPM / 60) * 2
      const firingFreq = Math.max(30, (rpm / 60) * 2);
      this.engineOsc.frequency.setTargetAtTime(firingFreq, this.audioCtx.currentTime, 0.1);
      this.engineGain.gain.setTargetAtTime(0.08, this.audioCtx.currentTime, 0.1);
    } else {
      this.engineGain.gain.setTargetAtTime(0.001, this.audioCtx.currentTime, 0.1);
    }
  }

  // ==========================================================================
  // MASTER REAL-TIME SIMULATION & ANIMATION LOOP
  // ==========================================================================
  mainLoop(now) {
    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    // Handle Mission Replay time step if active
    if (this.isReplayPlaying) {
      const preset = window.MISSION_DATASETS[this.activeMissionKey];
      if (preset) {
        this.replayTime += dt * this.replaySpeed;
        if (this.replayTime > preset.durationSeconds) this.replayTime = 0;
        this.replayScrubber.value = this.replayTime;
        this.updateReplayFrame(this.replayTime);
      }
    }

    // 1. Update Physics-Informed AI Engine
    const isAirborne = this.flightViewer ? !this.flightViewer.flightState.onGround : false;
    const altitude = this.flightViewer ? this.flightViewer.flightState.altitudeFt : 0;

    // Handle Manual Throttle from Keyboard
    if (window.physicsMLEngine.state.engineRunning && !this.isReplayPlaying) {
      if (this.keys['ArrowUp']) {
        window.physicsMLEngine.state.throttlePct = Math.min(100, window.physicsMLEngine.state.throttlePct + 35 * dt);
      }
      if (this.keys['ArrowDown']) {
        window.physicsMLEngine.state.throttlePct = Math.max(0, window.physicsMLEngine.state.throttlePct - 35 * dt);
      }
    }

    const telemetry = window.physicsMLEngine.update(dt, {
      throttle: window.physicsMLEngine.state.throttlePct,
      isRunning: window.physicsMLEngine.state.engineRunning,
      altitude: altitude,
      ambientTemp: window.physicsMLEngine.state.ambientTempC,
      isAirborne: isAirborne
    });

    // 2. Update Audio Synthesizer
    this.updateAudio(telemetry.rpm, telemetry.engineRunning);

    // 3. Render 3D Engine Digital Twin
    if (this.engineViewer) {
      this.engineViewer.update(dt, telemetry);
    }
    if (this.inspectorViewer) {
      this.inspectorViewer.update(dt, telemetry);
    }

    // 4. Render 3D Flight Simulator & Drone
    if (this.flightViewer) {
      this.flightViewer.update(dt, telemetry, this.keys);
    }

    // 5. Update Telemetry Charts & FFT Analyzer
    if (window.telemetryCharts) {
      window.telemetryCharts.pushSample(telemetry);
      window.telemetryCharts.renderPressureChart('canvasPressure');
      window.telemetryCharts.renderVibrationFft('canvasVibrationFft', telemetry.rpm, telemetry.vibrationRmsG);
      window.telemetryCharts.renderAnomalyChart('canvasAnomaly');
    }

    // 6. Refresh UI HUD & Telemetry Metric Displays
    this.refreshUiDisplays(telemetry);

    requestAnimationFrame((t) => this.mainLoop(t));
  }

  // ==========================================================================
  // UI TELEMETRY REFRESH
  // ==========================================================================
  refreshUiDisplays(telemetry) {
    const flight = this.flightViewer ? this.flightViewer.flightState : { airspeedKt: 0, altitudeFt: 0, headingRad: 0, onGround: true, airframeIntegrityPct: 100 };

    // HUD Metrics
    if (this.hudRpm) this.hudRpm.textContent = Math.round(telemetry.rpm);
    if (this.hudAlt) this.hudAlt.textContent = Math.round(flight.altitudeFt).toLocaleString();
    if (this.hudSpd) this.hudSpd.textContent = Math.round(flight.airspeedKt);
    if (this.hudThr) this.hudThr.textContent = `${Math.round(telemetry.throttlePct)}%`;
    if (this.hudFuel) this.hudFuel.textContent = `${Math.round(telemetry.fuelLevelL)}L`;

    let hdgDeg = Math.round((flight.headingRad * 180 / Math.PI) % 360);
    if (hdgDeg < 0) hdgDeg += 360;
    if (this.hudHdg) this.hudHdg.textContent = `${String(hdgDeg).padStart(3, '0')}°`;

    if (this.hudStatus) {
      if (!telemetry.engineRunning) this.hudStatus.textContent = "ENGINE SHUTDOWN";
      else if (flight.onGround) this.hudStatus.textContent = "ON RUNWAY (BUILD SPEED & TAKEOFF)";
      else this.hudStatus.textContent = "AIRBORNE / EN-ROUTE";
    }

    // Sidebar Displays
    if (this.sideRpm) this.sideRpm.textContent = Math.round(telemetry.rpm);
    if (this.sidePressure) {
      this.sidePressure.textContent = `${telemetry.cylinderPressureBar.toFixed(1)} bar`;
      this.sidePressure.className = telemetry.cylinderPressureBar > 90 ? "v danger" : telemetry.cylinderPressureBar > 75 ? "v warn" : "v";
    }
    const avgCht = Math.round((telemetry.cht[0] + telemetry.cht[1] + telemetry.cht[2] + telemetry.cht[3]) / 4);
    const avgEgt = Math.round((telemetry.egt[0] + telemetry.egt[1] + telemetry.egt[2] + telemetry.egt[3]) / 4);
    if (this.sideCht) this.sideCht.textContent = `${avgCht}°C`;
    if (this.sideEgt) this.sideEgt.textContent = `${avgEgt}°C`;
    if (this.sideOil) this.sideOil.textContent = `${Math.round(telemetry.oilPressurePsi)} psi`;
    if (this.sideFuel) this.sideFuel.textContent = `${telemetry.fuelFlowLph.toFixed(1)} L/h`;
    if (this.sideVib) this.sideVib.textContent = `${telemetry.vibrationRmsG.toFixed(2)} g`;
    if (this.sideBattery) this.sideBattery.textContent = `${telemetry.batteryVoltage.toFixed(1)} V`;
    if (this.sideAltCurrent) this.sideAltCurrent.textContent = `${telemetry.alternatorCurrentA.toFixed(1)} A`;

    // Gauges
    if (this.anomScoreVal) this.anomScoreVal.textContent = telemetry.anomalyScore.toFixed(2);
    if (this.anomBar) {
      this.anomBar.style.width = `${telemetry.anomalyScore * 100}%`;
      this.anomBar.className = telemetry.anomalyScore > 0.6 ? "gauge-fill danger" : telemetry.anomalyScore > 0.3 ? "gauge-fill amber" : "gauge-fill cyan";
    }

    if (this.rulVal) this.rulVal.textContent = `${Math.round(telemetry.rulPercent)}% (${Math.round(telemetry.rulHours)}h)`;
    if (this.rulBar) {
      this.rulBar.style.width = `${telemetry.rulPercent}%`;
      this.rulBar.className = telemetry.rulPercent < 35 ? "gauge-fill danger" : telemetry.rulPercent < 60 ? "gauge-fill amber" : "gauge-fill green";
    }

    const fuelPct = (telemetry.fuelLevelL / 45) * 100;
    if (this.fuelLevelVal) this.fuelLevelVal.textContent = `${Math.round(fuelPct)}%`;
    if (this.fuelBar) {
      this.fuelBar.style.width = `${fuelPct}%`;
      this.fuelBar.className = fuelPct < 20 ? "gauge-fill danger" : fuelPct < 40 ? "gauge-fill amber" : "gauge-fill green";
    }

    // Airframe Combat Damage
    if (this.airframeVal) this.airframeVal.textContent = `${Math.round(flight.airframeIntegrityPct)}%`;
    if (this.airframeBar) {
      this.airframeBar.style.width = `${flight.airframeIntegrityPct}%`;
      this.airframeBar.className = flight.airframeIntegrityPct < 40 ? "gauge-fill danger" : flight.airframeIntegrityPct < 70 ? "gauge-fill amber" : "gauge-fill green";
    }

    // Overall Health Status Badge
    if (this.healthBadge) {
      this.healthBadge.textContent = telemetry.healthStatus;
      this.healthBadge.className = telemetry.healthStatus === 'CRITICAL' ? "badge danger" : telemetry.healthStatus === 'WARNING' ? "badge warn" : "badge ok";
    }

    // Sensors
    this.updateSensorChips(telemetry, flight);

    // Hazard Banner & Center Alert Modal (Overpressure & Overheating prediction)
    if (telemetry.pressureHazardAlert) {
      this.hazardBanner.style.display = 'flex';
      this.hazardBanner.innerHTML = `<strong>⚠️ ${telemetry.pressureHazardAlert.title}:</strong> ${telemetry.pressureHazardAlert.riskDescription} <span style="margin-left:auto; color:#ffdd00;">${telemetry.pressureHazardAlert.action}</span>`;
      
      if (this.lastHazardTitle !== telemetry.pressureHazardAlert.title) {
        this.lastHazardTitle = telemetry.pressureHazardAlert.title;
        if (window.speechAlertEngine) {
          window.speechAlertEngine.triggerCriticalAlert(
            telemetry.pressureHazardAlert.title,
            telemetry.pressureHazardAlert.riskDescription + " — " + telemetry.pressureHazardAlert.action,
            telemetry.pressureHazardAlert.title + ". " + telemetry.pressureHazardAlert.action
          );
        }
      }
    } else {
      this.hazardBanner.style.display = 'none';
      this.lastHazardTitle = null;
    }

    // GPWS / TAWS Terrain Warning Banner in Flight Viewport
    const tawsBanner = document.getElementById('tawsBanner');
    if (tawsBanner) {
      tawsBanner.style.display = (flight.terrainWarningActive && !flight.onGround) ? 'block' : 'none';
    }

    // Low Fuel Warning & Flameout
    if (fuelPct < 15 && telemetry.fuelLevelL > 0) {
      this.alertBanner.style.display = 'flex';
      this.alertBanner.textContent = `⚠️ LOW FUEL EMERGENCY: Fuel level at ${Math.round(fuelPct)}%! Refuel immediately to avoid flameout.`;
      if (window.speechAlertEngine) {
        window.speechAlertEngine.speak("Caution! Fuel level low! Refuel immediately!", false, 12000);
      }
    } else if (telemetry.fuelLevelL <= 0) {
      this.alertBanner.style.display = 'flex';
      this.alertBanner.textContent = `🚨 ENGINE FLAMEOUT: Fuel completely exhausted! Click REFUEL button to replenish.`;
      if (!this.fuelFlameoutAlertTriggered) {
        this.fuelFlameoutAlertTriggered = true;
        if (window.speechAlertEngine) {
          window.speechAlertEngine.triggerCriticalAlert(
            "ENGINE FLAMEOUT",
            "Fuel completely exhausted! Loss of propulsion power — prepare for emergency glide descent!",
            "Emergency! Engine flameout! Fuel completely exhausted!"
          );
        }
      }
    } else if (telemetry.fuelLevelL > 5) {
      this.fuelFlameoutAlertTriggered = false;
    }

    // Auto-Stop Audio Beeper when all systems return to NOMINAL
    if (telemetry.healthStatus === 'NOMINAL' && !flight.terrainWarningActive && !telemetry.pressureHazardAlert) {
      if (window.speechAlertEngine && window.speechAlertEngine.isAlarmBeeping) {
        window.speechAlertEngine.stopAlarmBeeper();
      }
    }

    // --- DRDO PROGNOSTICS HUD WIDGET UPDATE ---
    const prog = telemetry.prognostics;
    const hudBadge = document.getElementById('hudProgBadge');
    const hudHazard = document.getElementById('hudProgHazard');
    const hudCountdown = document.getElementById('hudProgCountdown');
    const hudConf = document.getElementById('hudProgConfidence');
    const hudAction = document.getElementById('hudProgAction');

    if (prog && hudBadge) {
      hudBadge.textContent = prog.severity;
      hudBadge.className = prog.severity === 'CRITICAL' ? 'prognostic-badge danger' : prog.severity === 'WARNING' ? 'prognostic-badge warn' : 'prognostic-badge';
      if (hudHazard) {
        hudHazard.textContent = prog.active ? prog.predictedFailure : 'None (Safe Flight Envelope)';
        hudHazard.style.color = prog.severity === 'CRITICAL' ? '#f87171' : prog.severity === 'WARNING' ? '#fbbf24' : '#38bdf8';
      }
      if (hudCountdown) {
        hudCountdown.textContent = prog.timeToFailureSec ? `${prog.timeToFailureSec}s` : '--';
        hudCountdown.style.color = prog.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b';
      }
      if (hudConf) {
        hudConf.textContent = `${prog.confidencePct}% · ${prog.subsystem || 'Nominal'}`;
      }
      if (hudAction) {
        hudAction.innerHTML = `&bull; Action: ${prog.action}`;
      }
    }

    // --- 12-SENSOR HIGH-FIDELITY HEALTH MATRIX UPDATE ---
    const s = telemetry.sensors;
    if (s) {
      const updateSensorCell = (id, sensor) => {
        const el = document.getElementById(id);
        if (el && sensor) {
          el.textContent = `${sensor.val}${sensor.unit === '°C' ? '°' : sensor.unit === 'psi' ? 'p' : sensor.unit === 'kPa' ? 'k' : sensor.unit === 'L/h' ? 'L' : ''}`;
          el.className = sensor.status === 'CRITICAL' ? 'sensor-cell-stat danger' : sensor.status === 'WARN' ? 'sensor-cell-stat warn' : 'sensor-cell-stat';
        }
      };
      updateSensorCell('sc_cht1', s.cht1);
      updateSensorCell('sc_cht2', s.cht2);
      updateSensorCell('sc_cht3', s.cht3);
      updateSensorCell('sc_cht4', s.cht4);
      updateSensorCell('sc_egt', s.egt);
      updateSensorCell('sc_map', s.map);
      updateSensorCell('sc_oil_p', s.oil_p);
      updateSensorCell('sc_oil_t', s.oil_t);
      updateSensorCell('sc_flow', s.fuel_flow);
      updateSensorCell('sc_bus', s.bus_v);
      updateSensorCell('sc_pitot', s.pitot);
      updateSensorCell('sc_imu', s.imu_g);
    }

    // Synchronize Live Telemetry across all other tabs
    this.updateTab2Inspector(telemetry, flight);
    this.updateTab3Analytics(telemetry, flight);
    this.updateTab4BlackBox(telemetry, flight);
    this.updateTab5WorkOrders(telemetry, flight);

    // Update XAI Bars on Analytics Tab
    this.updateXaiBars();
  }

  updateSensorChips(telemetry, flight) {
    const setChip = (el, isFault, isWarn) => {
      if (!el) return;
      el.className = isFault ? "s-status danger" : isWarn ? "s-status warn" : "s-status ok";
      el.textContent = isFault ? "FAULT" : isWarn ? "DRIFT" : "OK";
    };

    const setPill = (id, isFault, isWarn) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.className = isFault ? "game-sensor-pill danger" : isWarn ? "game-sensor-pill warn" : "game-sensor-pill";
    };

    const isMisfire = window.physicsMLEngine.activeFaults.misfire;
    const isChtHigh = Math.max(...telemetry.cht) > 165;
    const isChtWarn = Math.max(...telemetry.cht) > 145;
    const isOilLow = telemetry.engineRunning && telemetry.oilPressurePsi < 20;
    const isVibHigh = telemetry.vibrationRmsG > 2.5;
    const isVibWarn = telemetry.vibrationRmsG > 1.5;
    const isFuelCrit = telemetry.fuelLevelL < 5;
    const isFuelWarn = telemetry.fuelLevelL < 15;
    const isTawsActive = flight.terrainWarningActive;

    // Sidebar chips
    setChip(this.sRpm, isMisfire, false);
    setChip(this.sCht, isChtHigh, isChtWarn);
    setChip(this.sOil, isOilLow, false);
    setChip(this.sVib, isVibHigh, isVibWarn);
    setChip(this.sFuel, isFuelCrit, isFuelWarn);
    setChip(this.sAirframe, flight.airframeIntegrityPct < 40, flight.airframeIntegrityPct < 75);

    // Bottom Screen Pills
    setPill('gPillRpm', isMisfire, false);
    setPill('gPillCht', isChtHigh, isChtWarn);
    setPill('gPillOil', isOilLow, false);
    setPill('gPillVib', isVibHigh, isVibWarn);
    setPill('gPillFuel', isFuelCrit, isFuelWarn);
    setPill('gPillTaws', isTawsActive, false);
  }

  updateXaiBars() {
    const xai = window.physicsMLEngine.xaiContributions;
    for (let key in xai) {
      const bar = document.getElementById(`xai_${key.replace(/[^a-zA-Z]/g, '')}`);
      const val = document.getElementById(`xaiVal_${key.replace(/[^a-zA-Z]/g, '')}`);
      if (bar) bar.style.width = `${xai[key]}%`;
      if (val) val.textContent = `${xai[key]}%`;
    }
  }

  // ==========================================================================
  // CROSS-TAB LIVE SYNCHRONIZATION IMPLEMENTATIONS
  // ==========================================================================
  updateTab2Inspector(telemetry, flight) {
    const elStatus = document.getElementById('inspFlightStatus');
    if (elStatus) {
      if (flight.isCrashed) {
        elStatus.textContent = "CRASHED / GROUNDED";
        elStatus.style.color = "var(--accent-danger)";
      } else if (!telemetry.engineRunning) {
        elStatus.textContent = "ENGINE OFF (COLD)";
        elStatus.style.color = "var(--text-muted)";
      } else if (flight.onGround) {
        elStatus.textContent = "RUNWAY PRE-TAKEOFF";
        elStatus.style.color = "var(--accent-cyan)";
      } else {
        elStatus.textContent = `AIRBORNE SORTIE (${Math.round(flight.altitudeFt)} FT)`;
        elStatus.style.color = "var(--accent-neon-green)";
      }
    }

    const elEnv = document.getElementById('inspFlightEnvelope');
    if (elEnv) elEnv.textContent = `${Math.round(flight.altitudeFt)} FT / ${Math.round(flight.airspeedKt)} KT`;

    const elThr = document.getElementById('inspThrottle');
    if (elThr) elThr.textContent = `${Math.round(telemetry.throttlePct)}%`;

    const elRpm = document.getElementById('inspRpm');
    if (elRpm) elRpm.textContent = `${Math.round(telemetry.rpm)} RPM`;

    const elPress = document.getElementById('inspPressure');
    if (elPress) {
      elPress.textContent = `${telemetry.cylinderPressureBar.toFixed(1)} bar`;
      elPress.style.color = telemetry.cylinderPressureBar > 90 ? "var(--accent-danger)" : telemetry.cylinderPressureBar > 75 ? "var(--accent-amber)" : "#fff";
    }

    const elSpark = document.getElementById('inspSpark');
    if (elSpark) elSpark.textContent = `${(22.0 + (telemetry.rpm / 1000) * 1.5).toFixed(1)}° BTDC`;

    const elAfr = document.getElementById('inspAfr');
    if (elAfr) elAfr.textContent = `${telemetry.airFuelRatio.toFixed(1)} (1.00)`;

    const elPiston = document.getElementById('inspPistonSpeed');
    if (elPiston) elPiston.textContent = `${((2 * 0.061 * telemetry.rpm) / 60).toFixed(1)} m/s`;

    const elVib = document.getElementById('inspVib');
    if (elVib) elVib.textContent = `${telemetry.vibrationRmsG.toFixed(2)} g`;

    const elHeat = document.getElementById('inspHeatRejection');
    if (elHeat) elHeat.textContent = `${((telemetry.rpm / 5800) * 32.5 * (telemetry.throttlePct / 100)).toFixed(1)} kW`;

    // Per-cylinder CHTs
    for (let i = 0; i < 4; i++) {
      const elCyl = document.getElementById(`inspCyl${i + 1}Cht`);
      if (elCyl && telemetry.cht[i] !== undefined) {
        elCyl.textContent = `${Math.round(telemetry.cht[i])}°C`;
        elCyl.style.color = telemetry.cht[i] > 165 ? "var(--accent-danger)" : telemetry.cht[i] > 140 ? "var(--accent-amber)" : "var(--accent-cyan)";
      }
    }
  }

  updateTab3Analytics(telemetry, flight) {
    const elState = document.getElementById('aiDroneState');
    if (elState) {
      elState.textContent = flight.isCrashed ? "AIRCRAFT CRASHED" : !telemetry.engineRunning ? "GROUND STANDBY" : flight.onGround ? "ON RUNWAY" : "AIRBORNE SORTIE";
      elState.style.color = flight.isCrashed ? "var(--accent-danger)" : flight.onGround ? "var(--accent-cyan)" : "var(--accent-neon-green)";
    }

    const elAlt = document.getElementById('aiDroneAlt');
    if (elAlt) elAlt.textContent = `${Math.round(flight.altitudeFt).toLocaleString()} FT`;

    const elSpd = document.getElementById('aiDroneSpd');
    if (elSpd) elSpd.textContent = `${Math.round(flight.airspeedKt)} KT`;

    const elThr = document.getElementById('aiDroneThr');
    if (elThr) elThr.textContent = `${Math.round(telemetry.throttlePct)}%`;

    const elHealth = document.getElementById('aiDroneHealth');
    if (elHealth) {
      elHealth.textContent = telemetry.healthStatus;
      elHealth.style.color = telemetry.healthStatus === 'CRITICAL' ? "var(--accent-danger)" : telemetry.healthStatus === 'WARNING' ? "var(--accent-amber)" : "var(--accent-neon-green)";
    }

    // Update KPI Cards
    const elLoss = document.getElementById('kpiPinnLoss');
    if (elLoss) {
      const dynamicLoss = (0.008 + (telemetry.anomalyScore * 0.052)).toFixed(3);
      elLoss.textContent = dynamicLoss;
      elLoss.style.color = dynamicLoss > 0.035 ? "var(--accent-danger)" : dynamicLoss > 0.02 ? "var(--accent-amber)" : "var(--accent-cyan)";
    }

    const elKpiPress = document.getElementById('kpiPressure');
    if (elKpiPress) {
      elKpiPress.textContent = `${telemetry.cylinderPressureBar.toFixed(1)} bar`;
      elKpiPress.style.color = telemetry.cylinderPressureBar > 90 ? "var(--accent-danger)" : telemetry.cylinderPressureBar > 75 ? "var(--accent-amber)" : "#fff";
    }

    const elKpiDeg = document.getElementById('kpiDegradation');
    if (elKpiDeg) {
      const degRate = (0.012 + (telemetry.vibrationRmsG * 0.016) + (telemetry.anomalyScore * 0.068)).toFixed(3);
      elKpiDeg.textContent = `${degRate}%/hr`;
    }

    const elKpiDrift = document.getElementById('kpiDrift');
    if (elKpiDrift) {
      const conf = (100 - (telemetry.sensorDriftScore * 100)).toFixed(1);
      elKpiDrift.textContent = `${conf}%`;
    }
  }

  updateTab4BlackBox(telemetry, flight) {
    if (flight.altitudeFt > this.peakAltitudeFt) this.peakAltitudeFt = flight.altitudeFt;
    if (flight.airspeedKt > this.peakAirspeedKt) this.peakAirspeedKt = flight.airspeedKt;

    const elapsedSec = Math.floor((performance.now() - this.sortieStartTime) / 1000);
    const m = Math.floor(elapsedSec / 60);
    const s = elapsedSec % 60;
    const timeStr = `SORTIE T+${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

    const elTime = document.getElementById('bbSortieTime');
    if (elTime) elTime.textContent = timeStr;

    const elCoords = document.getElementById('bbCoordinates');
    if (elCoords && flight.position) {
      elCoords.textContent = `X: ${Math.round(flight.position.x)}m, Y: ${Math.round(flight.position.y)}m, Z: ${Math.round(flight.position.z)}m`;
    }

    const elAlt = document.getElementById('bbAltitude');
    if (elAlt) elAlt.textContent = `${Math.round(flight.altitudeFt).toLocaleString()} FT`;
    const elPeakAlt = document.getElementById('bbPeakAlt');
    if (elPeakAlt) elPeakAlt.textContent = `${Math.round(this.peakAltitudeFt).toLocaleString()} FT`;

    const elSpd = document.getElementById('bbSpeed');
    if (elSpd) elSpd.textContent = `${Math.round(flight.airspeedKt)} KT`;
    const elPeakSpd = document.getElementById('bbPeakSpd');
    if (elPeakSpd) elPeakSpd.textContent = `${Math.round(this.peakAirspeedKt)} KT`;

    const elRpm = document.getElementById('bbRpm');
    if (elRpm) elRpm.textContent = `${Math.round(telemetry.rpm)} RPM`;

    const elGload = document.getElementById('bbGload');
    if (elGload) {
      const gVal = (1.0 + (telemetry.vibrationRmsG * 0.4)).toFixed(2);
      elGload.textContent = `${gVal} g`;
    }

    const currentPhase = flight.isCrashed ? "CRASHED" : !telemetry.engineRunning ? "STANDBY" : flight.onGround ? "ON RUNWAY" : flight.altitudeFt < 500 ? "ROTATION / CLIMB" : "CRUISE FLIGHT";
    const elPhase = document.getElementById('bbPhase');
    if (elPhase) elPhase.textContent = currentPhase;

    // Log significant flight milestones automatically
    if (this.lastLoggedPhase !== currentPhase) {
      this.lastLoggedPhase = currentPhase;
      if (currentPhase === "ROTATION / CLIMB") {
        this.logFlightEvent(`Takeoff initiated. Airspeed ${Math.round(flight.airspeedKt)} KT, pitch rotation, gear retracted.`, 'info');
      } else if (currentPhase === "CRUISE FLIGHT") {
        this.logFlightEvent(`En-route cruise profile established at ${Math.round(flight.altitudeFt)} FT.`, 'info');
      } else if (currentPhase === "CRASHED") {
        this.logFlightEvent(`Emergency flight impact. Airframe stress exceeded bounds!`, 'danger');
      }
    }
  }

  updateTab5WorkOrders(telemetry, flight) {
    const elBadge = document.getElementById('repBadge');
    if (elBadge) {
      elBadge.textContent = `STATUS: ${telemetry.healthStatus}`;
      elBadge.className = telemetry.healthStatus === 'CRITICAL' ? "badge danger" : telemetry.healthStatus === 'WARNING' ? "badge warn" : "badge ok";
    }

    const elStatus = document.getElementById('repSortieStatus');
    if (elStatus) {
      if (flight.isCrashed) {
        elStatus.textContent = "AOG (AIRCRAFT ON GROUND - CRASHED)";
        elStatus.style.color = "var(--accent-danger)";
      } else if (!telemetry.engineRunning) {
        elStatus.textContent = "ON GROUND - PRE-FLIGHT";
        elStatus.style.color = "var(--text-muted)";
      } else if (flight.onGround) {
        elStatus.textContent = "ON RUNWAY - READY TO ROLL";
        elStatus.style.color = "var(--accent-cyan)";
      } else {
        elStatus.textContent = `ACTIVE SORTIE (${Math.round(flight.altitudeFt)} FT @ ${Math.round(flight.airspeedKt)} KT)`;
        elStatus.style.color = "var(--accent-neon-green)";
      }
    }

    const elAlt = document.getElementById('repAltitude');
    if (elAlt) elAlt.textContent = `${Math.round(flight.altitudeFt).toLocaleString()} FT`;

    const elSpd = document.getElementById('repSpeed');
    if (elSpd) elSpd.textContent = `${Math.round(flight.airspeedKt)} KT`;

    const elAnom = document.getElementById('repAnomalyScore');
    if (elAnom) {
      const riskStr = telemetry.anomalyScore > 0.6 ? "CRITICAL" : telemetry.anomalyScore > 0.3 ? "MODERATE" : "LOW";
      elAnom.textContent = `${telemetry.anomalyScore.toFixed(2)} (${riskStr})`;
      elAnom.style.color = telemetry.anomalyScore > 0.6 ? "var(--accent-danger)" : telemetry.anomalyScore > 0.3 ? "var(--accent-amber)" : "var(--accent-neon-green)";
    }

    const elRul = document.getElementById('repRul');
    if (elRul) elRul.textContent = `${Math.round(telemetry.rulPercent)}% (${Math.round(telemetry.rulHours).toLocaleString()} hrs)`;

    // Dynamic Work Order Body
    const woBox = document.getElementById('repWorkOrderBox');
    const woHeader = document.getElementById('repWoHeader');
    const woBody = document.getElementById('repWoBody');
    if (woBox && woHeader && woBody) {
      if (flight.isCrashed) {
        woBox.style.background = "rgba(255,51,85,0.12)";
        woBox.style.borderColor = "var(--accent-danger)";
        woHeader.style.color = "var(--accent-danger)";
        woHeader.textContent = "🚨 EMERGENCY WORK ORDER #UAV-CRASH-01: AIRFRAME IMPACT";
        woBody.textContent = "Aircraft suffered terrain/ground impact. Immediate ground safety inspection required. Perform full airframe NDT scan, propeller hub integrity check, and engine mount realignment.";
      } else if (window.physicsMLEngine.activeFaults.overpressureBoost || telemetry.cylinderPressureBar > 90) {
        woBox.style.background = "rgba(255,51,85,0.12)";
        woBox.style.borderColor = "var(--accent-danger)";
        woHeader.style.color = "var(--accent-danger)";
        woHeader.textContent = `🚨 CRITICAL WORK ORDER #UAV-OVERPRESS: PEAK PRESSURE ${telemetry.cylinderPressureBar.toFixed(1)} BAR`;
        woBody.textContent = "Combustion overpressure spike exceeded structural endurance (90 bar certified limit). Action required: Borescope inspection of cylinder head gasket, torque verification of cylinder bolts, and turbo wastegate valve service.";
      } else if (window.physicsMLEngine.activeFaults.misfire) {
        woBox.style.background = "rgba(255,51,85,0.12)";
        woBox.style.borderColor = "var(--accent-danger)";
        woHeader.style.color = "var(--accent-danger)";
        woHeader.textContent = "🚨 CRITICAL WORK ORDER #UAV-MISFIRE: CYLINDER #2 COMBUSTION LOSS";
        woBody.textContent = "Cylinder #2 spark misfire / injector nozzle clogging detected. Action required: Replace cylinder #2 spark plug, clean ultrasonic fuel injector, and run dyno compression test.";
      } else if (window.physicsMLEngine.activeFaults.oilLoss) {
        woBox.style.background = "rgba(255,170,0,0.12)";
        woBox.style.borderColor = "var(--accent-amber)";
        woHeader.style.color = "var(--accent-amber)";
        woHeader.textContent = `⚠️ PREVENTATIVE WORK ORDER #UAV-LUBRICATION: OIL PRESSURE ${Math.round(telemetry.oilPressurePsi)} PSI`;
        woBody.textContent = "Boundary lubrication regime detected. Action required: Inspect crankshaft journal bearings, replace oil scavenge filter, and verify oil cooler thermal efficiency.";
      } else if (flight.airframeIntegrityPct < 70) {
        woBox.style.background = "rgba(255,170,0,0.12)";
        woBox.style.borderColor = "var(--accent-amber)";
        woHeader.style.color = "var(--accent-amber)";
        woHeader.textContent = `⚠️ STRUCTURAL WORK ORDER #UAV-COMBAT: INTEGRITY ${Math.round(flight.airframeIntegrityPct)}%`;
        woBody.textContent = "Airframe sustained combat threat / proximity blast shock. Action required: Inspect carbon-fiber wing spars and tail empennage for delamination before next flight sortie.";
      } else {
        woBox.style.background = "rgba(0,255,136,0.06)";
        woBox.style.borderColor = "rgba(0,255,136,0.25)";
        woHeader.style.color = "var(--accent-neon-green)";
        woHeader.textContent = "✅ MISSION DISPATCH CLEARANCE #UAV-2026-CLEAR";
        woBody.textContent = "All propulsion and thermodynamic parameters are within certified operational envelope. Zero active mechanical anomalies. Aircraft cleared for mission sortie.";
      }
    }
  }

  showAlert(message, type = "info") {
    if (!this.alertBanner) return;
    this.alertBanner.style.display = 'flex';
    this.alertBanner.className = `alert-banner ${type}`;
    this.alertBanner.textContent = message;
    setTimeout(() => {
      if (this.alertBanner.textContent === message) {
        this.alertBanner.style.display = 'none';
      }
    }, 4000);
  }

  // ==========================================================================
  // MISSION REPORT GENERATOR
  // ==========================================================================
  exportMissionReport() {
    const state = window.physicsMLEngine.state;
    const report = `# UAV PROPULSION PHM EXECUTIVE MISSION REPORT
Generated: ${new Date().toISOString()}
Aircraft Call-sign: UAV-TWIN-01 | Propulsion: 4-Cylinder Turbocharged IC Engine

## 1. Executive Health Summary
- Engine Status: ${state.healthStatus}
- Overall Anomaly Score: ${(state.anomalyScore * 100).toFixed(1)}%
- Estimated RUL Remaining: ${state.rulPercent.toFixed(1)}% (${state.rulHours.toFixed(0)} flight hours remaining)
- Total Flight Hours Accumulated: ${state.totalFlightHours.toFixed(1)} hrs

## 2. Telemetry Maximums & Stress Parameters
- Peak Combustion In-Cylinder Pressure: ${state.cylinderPressureBar.toFixed(1)} bar (Limit: 90 bar)
- Manifold Absolute Pressure (MAP): ${state.mapKpa.toFixed(1)} kPa
- Max Cylinder Head Temp (CHT): ${Math.max(...state.cht).toFixed(1)} °C (Critical: 165 °C)
- Max Exhaust Gas Temp (EGT): ${Math.max(...state.egt).toFixed(1)} °C (Critical: 850 °C)
- Vibration Peak Spectrum: ${state.vibrationRmsG.toFixed(2)} g RMS
- Lubrication Oil Pressure: ${state.oilPressurePsi.toFixed(1)} psi (Nominal: 45 psi)
- 28V Electrical Bus Voltage: ${state.batteryVoltage.toFixed(1)} VDC

## 3. Autonomous AI Maintenance Advisory
${state.anomalyScore > 0.6 ? 
"- CRITICAL ACTION: Immediate grounding recommended for borescope cylinder inspection and fuel injector ultrasonic cleaning." : 
state.anomalyScore > 0.3 ? 
"- WARNING: Schedule oil filter inspection and spark plug gap calibration within next 10 flight hours." : 
"- NOMINAL: All thermodynamic and mechanical indices within certified operational envelope. Cleared for next sortie."}

---
*Report certified by Physics-Informed Digital Twin Edge AI Engine.*
`;

    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `UAV_Engine_PHM_Report_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    this.showAlert("Executive Mission Report downloaded successfully.", "info");
  }

  // ==========================================================================
  // INTERACTIVE SENSORS & ENGINE KNOWLEDGE ENCYCLOPEDIA CONTROLLER
  // ==========================================================================
  setupKnowledgeEncyclopedia() {
    const modal = document.getElementById('uavGuideModal');
    const btnOpenGuide = document.getElementById('btnOpenGuideModal');
    const btnOpenEngineComp = document.getElementById('btnOpenEngineCompModal');
    const btnCloseGuide = document.getElementById('btnCloseGuideModal');
    const guideTabs = document.querySelectorAll('.guide-tab-btn');
    const searchInput = document.getElementById('guideSearchInput');
    const sensorsGrid = document.getElementById('guideSensorsGrid');
    const compGrid = document.getElementById('guideComponentsGrid');
    const partCard = document.getElementById('enginePartFloatingCard');
    const btnClosePartCard = document.getElementById('btnClosePartCard');
    const btnPartCardDeepDive = document.getElementById('btnPartCardDeepDive');
    const compBadges = document.querySelectorAll('.comp-badge');
    const interactiveSensors = document.querySelectorAll('.interactive-sensor');

    if (!modal) return;

    let activePartId = 'cylinders';

    const openGuideModal = (tabName = 'sensors', targetId = null) => {
      modal.style.display = 'flex';
      switchGuideTab(tabName);
      if (targetId) {
        setTimeout(() => {
          const card = document.getElementById(`card_${targetId}`);
          if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            card.style.borderColor = 'var(--accent-cyan)';
            card.style.boxShadow = '0 0 25px rgba(0, 240, 255, 0.6)';
            setTimeout(() => {
              card.style.borderColor = '';
              card.style.boxShadow = '';
            }, 2500);
          }
        }, 150);
      }
    };

    const closeGuideModal = () => {
      modal.style.display = 'none';
    };

    const switchGuideTab = (tabName) => {
      guideTabs.forEach(t => {
        t.classList.toggle('active', t.dataset.guideTab === tabName);
      });
      const tabSensors = document.getElementById('guideSensorsTab');
      const tabComps = document.getElementById('guideComponentsTab');
      const tabPilot = document.getElementById('guidePilotTab');
      if (tabSensors) tabSensors.style.display = (tabName === 'sensors') ? 'block' : 'none';
      if (tabComps) tabComps.style.display = (tabName === 'components') ? 'block' : 'none';
      if (tabPilot) tabPilot.style.display = (tabName === 'pilot') ? 'block' : 'none';
    };

    if (btnOpenGuide) btnOpenGuide.addEventListener('click', () => openGuideModal('sensors'));
    if (btnOpenEngineComp) btnOpenEngineComp.addEventListener('click', () => openGuideModal('components'));
    if (btnCloseGuide) btnCloseGuide.addEventListener('click', closeGuideModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeGuideModal();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.style.display === 'flex') {
        closeGuideModal();
      }
    });

    guideTabs.forEach(t => {
      t.addEventListener('click', () => switchGuideTab(t.dataset.guideTab));
    });

    // Populate Sensors Encyclopedia Cards
    const kb = window.uavKnowledgeBase || {};
    if (sensorsGrid && kb.sensors) {
      sensorsGrid.innerHTML = '';
      for (const [key, s] of Object.entries(kb.sensors)) {
        const card = document.createElement('div');
        card.className = 'guide-card';
        card.id = `card_${key}`;
        card.dataset.name = `${s.name} ${s.category} ${s.code} ${s.techType}`.toLowerCase();
        card.innerHTML = `
          <div class="guide-card-top">
            <span class="guide-card-name">${s.name}</span>
            <span class="guide-card-badge">${s.code}</span>
          </div>
          <div class="guide-card-desc"><strong>Sensor Type:</strong> ${s.techType}<br><strong>Role:</strong> ${s.role}</div>
          <div class="guide-card-row"><span class="k">Subsystem Category:</span><span class="v">${s.category}</span></div>
          <div class="guide-card-row"><span class="k">Certified Safe Envelope:</span><span class="v" style="color:var(--accent-neon-green);">${s.normalRange}</span></div>
          <div class="guide-card-row"><span class="k">Advisory Warning Threshold:</span><span class="v" style="color:var(--accent-amber);">${s.warningRange}</span></div>
          <div class="guide-card-row"><span class="k">Critical Failure Threshold:</span><span class="v" style="color:var(--accent-danger);">${s.criticalRange}</span></div>
          <div class="guide-card-callout danger"><strong>⚠️ Risk if Failed:</strong> ${s.failureImpact}</div>
          <div class="guide-card-callout ok"><strong>🧠 PINN &amp; EKF AI Fusion:</strong> ${s.howAiUsesIt}</div>
        `;
        sensorsGrid.appendChild(card);
      }
    }

    // Populate Engine Cutaway Components Cards
    if (compGrid && kb.components) {
      compGrid.innerHTML = '';
      for (const [key, c] of Object.entries(kb.components)) {
        const card = document.createElement('div');
        card.className = 'guide-card';
        card.id = `card_${key}`;
        card.dataset.name = `${c.name} ${c.material} ${c.role}`.toLowerCase();
        card.innerHTML = `
          <div class="guide-card-top">
            <span class="guide-card-name">${c.name}</span>
            <span class="guide-card-badge">ROTAX 914</span>
          </div>
          <div class="guide-card-desc"><strong>Aerospace Material:</strong> ${c.material}<br><strong>Function:</strong> ${c.role}</div>
          <div class="guide-card-row"><span class="k">Thermodynamic Physics:</span><span class="v">${c.thermodynamics}</span></div>
          <div class="guide-card-callout danger"><strong>⚠️ Common Failure Modes:</strong> ${c.failureModes}</div>
          <div class="guide-card-callout ok"><strong>🧠 AI Prognostic Monitoring:</strong> ${c.aiMonitoring}</div>
        `;
        compGrid.appendChild(card);
      }
    }

    // Search Filter
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const allCards = modal.querySelectorAll('.guide-card');
        allCards.forEach(card => {
          const text = card.dataset.name || '';
          card.style.display = text.includes(query) ? 'flex' : 'none';
        });
      });
    }

    // Click on 12 EKF Matrix sensor cells opens deep info
    interactiveSensors.forEach(cell => {
      cell.addEventListener('click', () => {
        const sensorKey = cell.dataset.sensor;
        if (sensorKey) openGuideModal('sensors', sensorKey);
      });
    });

    // Engine Cutaway Component Badges
    compBadges.forEach(badge => {
      badge.addEventListener('click', () => {
        compBadges.forEach(b => b.classList.remove('active'));
        badge.classList.add('active');
        const compId = badge.dataset.comp;
        activePartId = compId;

        if (this.engineViewer && this.engineViewer.highlightComponent) {
          this.engineViewer.highlightComponent(compId);
        }

        if (compId === 'all' || !partCard) {
          if (partCard) partCard.style.display = 'none';
          return;
        }

        const info = kb.components ? kb.components[compId] : null;
        if (info && partCard) {
          document.getElementById('partCardTitle').textContent = info.name.toUpperCase();
          document.getElementById('partCardMaterial').textContent = info.material;
          document.getElementById('partCardRole').textContent = info.role;
          document.getElementById('partCardFailure').textContent = info.failureModes;
          partCard.style.display = 'block';
        }
      });
    });

    if (btnClosePartCard && partCard) {
      btnClosePartCard.addEventListener('click', () => {
        partCard.style.display = 'none';
      });
    }

    if (btnPartCardDeepDive) {
      btnPartCardDeepDive.addEventListener('click', () => {
        openGuideModal('components', activePartId);
      });
    }
  }
}

// Global initialization upon window load
window.addEventListener('DOMContentLoaded', () => {
  window.dashboard = new DashboardController();
  window.dashboard.engineViewer = new Engine3DViewer('engineViewport');
  window.flightViewer = window.dashboard.flightViewer = new Flight3DViewer('flightViewport');
});
