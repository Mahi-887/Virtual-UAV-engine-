/**
 * ============================================================================
 * MISSION DATASETS FOR HISTORICAL REPLAY & SIMULATION SCENARIOS
 * ============================================================================
 * 1. High Altitude Reconnaissance (22,000 ft, low ambient pressure, thin air)
 * 2. Hot Desert Endurance Flight (48°C ambient, thermal soak, max continuous load)
 * 3. Rapid Throttle Transient Stress (Acrobatic / evasive maneuvers)
 * 4. Critical Injector Clog & Misfire Incident (In-flight failure scenario)
 * ============================================================================
 */

const MISSION_DATASETS = {
  high_altitude: {
    name: "High Altitude Reconnaissance (FL220)",
    durationSeconds: 120,
    description: "Simulates flight at 22,000 ft altitude. Tests turbocharger boost compensation, lean mixture stability, and thin air cooling performance.",
    ambientTemp: -18,
    altitudeProfile: (t) => Math.min(22000, t * 250),
    throttleProfile: (t) => (t < 20 ? 85 : 72),
    anomalyInjectionAt: null
  },

  hot_desert: {
    name: "Hot Desert Endurance (Operation Thar)",
    durationSeconds: 150,
    description: "Sustained cruise under extreme 48°C ambient temperatures. High cylinder head thermal soak, oil degradation, and detonation risk.",
    ambientTemp: 48,
    altitudeProfile: (t) => 3500,
    throttleProfile: (t) => 82,
    anomalyInjectionAt: 45 // Inject overheating warning
  },

  rapid_throttle: {
    name: "Rapid Throttle Transient Stress Test",
    durationSeconds: 90,
    description: "Evaluates ECU fuel map transient response, manifold pressure overshoot, and turbo lag during aggressive throttle chops.",
    ambientTemp: 28,
    altitudeProfile: (t) => 1500,
    throttleProfile: (t) => (Math.sin(t * 0.4) > 0 ? 95 : 30),
    anomalyInjectionAt: null
  },

  misfire_incident: {
    name: "Cylinder #2 Misfire & Injector Failure",
    durationSeconds: 120,
    description: "Real mission incident replay: At T+35s, Cylinder #2 suffers injector nozzle clogging followed by ignition misfire, vibration surge, and RUL decay.",
    ambientTemp: 32,
    altitudeProfile: (t) => 4500,
    throttleProfile: (t) => 78,
    anomalyInjectionAt: 35
  }
};

window.MISSION_DATASETS = MISSION_DATASETS;
