"""
===============================================================================
UAV IC ENGINE THERMODYNAMIC SIMULATION MODEL (PYTHON BACKEND)
===============================================================================
Simulates:
- 4-Stroke IC Engine Cycle (Otto/Miller)
- P-V (Pressure-Volume) Indicator Diagram
- Thermodynamic Energy Balance: Q_in = W_shaft + Q_exhaust + Q_cool + Q_friction
- CAN 2.0B Sensor Telemetry Stream Generator
===============================================================================
"""

import numpy as np
import pandas as pd

class UAVEngineSimulator:
    def __init__(self):
        # Engine Specifications (Rotax 914 / UAV Aerospace IC Engine)
        self.cylinders = 4
        self.displacement_cc = 1211.0
        self.bore_mm = 79.5
        self.stroke_mm = 61.0
        self.compression_ratio = 10.5
        self.gamma = 1.35  # Polytropic expansion index
        self.rated_power_kw = 84.5
        self.max_rpm = 5800
        self.idle_rpm = 800

    def generate_pv_diagram(self, throttle_pct=80.0, overpressure_fault=False):
        """
        Calculates the thermodynamic Pressure-Volume (P-V) indicator curve
        for one complete cylinder cycle (0 to 180 to 360 to 540 to 720 crank deg).
        """
        v_clearance = (self.displacement_cc / self.cylinders) / (self.compression_ratio - 1)
        v_swept = self.displacement_cc / self.cylinders

        theta = np.linspace(0, 4 * np.pi, 360)
        # Cylinder volume as a function of crank angle
        # V(theta) = Vc + (Vs/2) * (1 - cos(theta))
        volume = v_clearance + (v_swept / 2.0) * (1 - np.cos(theta))

        # Manifold pressure in bar
        map_bar = 0.4 + (throttle_pct / 100.0) * 0.65
        if overpressure_fault:
            map_bar *= 1.45

        pressure = np.zeros_like(theta)

        for i, t in enumerate(theta):
            # Phase 1: Intake (0 to pi)
            if t < np.pi:
                pressure[i] = map_bar
            # Phase 2: Compression (pi to 2*pi)
            elif t < 2 * np.pi:
                v_ratio = (v_clearance + v_swept) / volume[i]
                pressure[i] = map_bar * (v_ratio ** self.gamma)
            # Phase 3: Combustion & Expansion (2*pi to 3*pi)
            elif t < 3 * np.pi:
                peak_factor = 3.2 if not overpressure_fault else 4.6
                p_max = map_bar * (self.compression_ratio ** self.gamma) * peak_factor
                v_ratio = v_clearance / volume[i]
                pressure[i] = p_max * (v_ratio ** self.gamma)
            # Phase 4: Exhaust (3*pi to 4*pi)
            else:
                pressure[i] = 1.05  # Slight exhaust backpressure

        return pd.DataFrame({
            "CrankAngle_Deg": np.degrees(theta),
            "Volume_cc": volume,
            "Pressure_Bar": pressure
        })

    def generate_telemetry_batch(self, n_samples=200, fault_type=None):
        """
        Generates multi-parameter CAN bus telemetry dataframe for ML training & testing.
        """
        np.random.seed(42)
        time_series = np.linspace(0, 100, n_samples)
        
        throttle = 75.0 + 5.0 * np.sin(time_series * 0.1) + np.random.normal(0, 1.2, n_samples)
        throttle = np.clip(throttle, 0, 100)

        rpm = self.idle_rpm + (self.max_rpm - self.idle_rpm) * (throttle / 100.0) + np.random.normal(0, 15, n_samples)
        map_kpa = 40.0 + (throttle / 100.0) * 65.0 + np.random.normal(0, 1.0, n_samples)
        
        # Peak In-Cylinder Pressure
        cyl_pressure = (map_kpa / 10.0) * (self.compression_ratio ** 1.35) * 0.28 + np.random.normal(0, 1.5, n_samples)

        # Thermal Telemetry
        cht = 35.0 + (throttle / 100.0) * 95.0 + np.random.normal(0, 1.5, n_samples)
        egt = 400.0 + (throttle / 100.0) * 380.0 + np.random.normal(0, 4.0, n_samples)

        # Lubrication & Vibration
        oil_psi = 30.0 + (rpm / self.max_rpm) * 35.0 + np.random.normal(0, 1.0, n_samples)
        vib_g = 0.3 + (rpm / self.max_rpm) * 0.9 + np.random.normal(0, 0.05, n_samples)

        # Electrical 28V Bus
        bus_voltage = 28.2 + np.random.normal(0, 0.15, n_samples)
        alt_current = 15.0 + (throttle / 100.0) * 20.0 + np.random.normal(0, 0.8, n_samples)

        # Fault Injections
        if fault_type == "misfire":
            # Cylinder misfire causes RPM jitter, CHT drop, unburnt fuel EGT rise, violent vibration
            rpm[80:150] -= np.random.uniform(150, 400, 70)
            egt[80:150] += np.random.uniform(60, 120, 70)
            vib_g[80:150] += np.random.uniform(2.0, 3.5, 70)

        elif fault_type == "overpressure":
            # Turbo wastegate failure
            cyl_pressure[90:160] += np.random.uniform(25, 45, 70)
            map_kpa[90:160] += np.random.uniform(25, 40, 70)
            cht[90:160] += np.random.uniform(25, 40, 70)

        elif fault_type == "oil_loss":
            # Lubrication breakdown
            oil_psi[70:160] = np.maximum(5.0, oil_psi[70:160] - np.linspace(5, 35, 90))
            vib_g[100:160] += np.random.uniform(1.5, 2.8, 60)

        return pd.DataFrame({
            "Timestamp_s": time_series,
            "Throttle_Pct": throttle,
            "RPM": rpm,
            "MAP_kPa": map_kpa,
            "PeakCylPressure_Bar": cyl_pressure,
            "CHT_DegC": cht,
            "EGT_DegC": egt,
            "OilPressure_psi": oil_psi,
            "Vibration_g": vib_g,
            "BusVoltage_V": bus_voltage,
            "AltCurrent_A": alt_current
        })
