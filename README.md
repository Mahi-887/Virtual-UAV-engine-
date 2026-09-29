# 🚁 Virtual UAV Engine — Digital Twin & Intelligent PHM System

> **Smart India Hackathon (SIH)** — Physics-Informed Predictive Health Monitoring (PHM), 3D Digital Twin, and Telemetry Analysis Platform for High-Performance UAV Engines.

---

## 🌟 Overview

The **Virtual UAV Engine Digital Twin** is an intelligent diagnostic and prognostics platform designed for modern Unmanned Aerial Vehicles (UAVs). Moving beyond static threshold-based warnings, it couples thermodynamic cycle physics with deep learning to provide real-time anomaly detection, Remaining Useful Life (RUL) estimation, failure forecasting, and interactive 3D telemetry visualizations.

---

## ⚡ Key Features

- **Physics-Informed Neural Network (PINN):** Combines thermodynamic laws (energy conservation, $P\text{-}V$ cycle, BMEP) with deep neural networks to isolate true mechanical faults from atmospheric changes.
- **Interactive 3D Engine Cutaway (WebGL / Three.js):** Real-time visualization of engine components (crankshaft, pistons, cylinders, valves) responding dynamically to telemetry and thermal stress gradients.
- **Realistic 3D Flight Simulation:** Cockpit telemetry visualization with manual flight dynamics, altitude/pressure scaling, and simulated combat threat/damage injection.
- **Predictive Failure Forecasting:** Real-time overpressure and thermal runaway forecasting predicting time-to-failure before catastrophic damage occurs.
- **Weibull RUL Prognostics:** Multi-stress damage accumulation model (thermal fatigue, vibration strain, bearing friction) for accurate component life calculation.
- **Sensor Drift & CAN 2.0B Telemetry Bus:** Sensor fusion and Extended Kalman Filter (EKF) implementation to detect sensor anomalies and drift.
- **Autonomous Maintenance Advisory:** Generates automated actionable repair work orders and risk assessments based on detected fault signatures.

---

## 🛠️ Technology Stack

- **Backend:** Python (Flask / Flask-CORS)
- **Scientific Computing & ML:** NumPy, SciPy, Scikit-learn
- **Frontend:** Modern Web Dashboard (HTML5, Vanilla CSS3, JavaScript ES6+)
- **3D Visualization:** Three.js (WebGL Engine Cutaway & Flight Simulators)
- **Analytics & Charts:** Chart.js

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.9+ installed
- Modern Web Browser (Chrome, Firefox, Edge, Safari) with WebGL enabled

### 2. Installation

Clone the repository:
```bash
git clone https://github.com/Mahi-887/Virtual-UAV-engine-.git
cd Virtual-UAV-engine-
```

Install Python dependencies:
```bash
pip install -r requirements.txt
```

### 3. Run the Application

Start the backend server:
```bash
python app.py
```

Open the dashboard:
- Simply open `index.html` in your web browser or access the local server at `http://localhost:5000`.

---

## 📂 Project Structure

```plaintext
Virtual-UAV-engine-/
├── app.py                      # Flask API & real-time telemetry streaming server
├── engine_sim.py              # Thermodynamic cycle & physics simulation engine
├── ml_models.py               # PINN, anomaly detection, Weibull RUL models
├── requirements.txt           # Python package dependencies
├── index.html                 # Main mission control & 3D digital twin dashboard
├── css/
│   └── styles.css             # Glassmorphism UI & responsive styling
├── js/
│   ├── dashboard.js           # Core mission control logic & state orchestration
│   ├── engine3d.js            # Three.js 3D mechanical engine cutaway
│   ├── flight3d.js            # Three.js 3D UAV flight & combat simulation
│   ├── physics_ml_engine.js   # Client-side physics & telemetry calculations
│   ├── charts.js              # Real-time multi-sensor telemetry charts
│   ├── speech_alerts.js       # Audio synthesized warning announcements
│   └── data_samples.js        # Baseline telemetry scenarios and fault datasets
└── EXPLANATION_FOR_JUDGES.md  # Detailed technical evaluation guide for SIH judges
```

---

## 📖 Technical Documentation

For an in-depth breakdown of the thermodynamic formulas, machine learning loss functions, and evaluation criteria, refer to:
👉 **[EXPLANATION_FOR_JUDGES.md](EXPLANATION_FOR_JUDGES.md)**

---

## 👨‍💻 Authors & Acknowledgments

- **Mahendra Malviya** ([@Mahi-887](https://github.com/Mahi-887))
- Developed for the **Smart India Hackathon (SIH)**
