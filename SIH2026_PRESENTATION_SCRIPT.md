# 🏆 SMART INDIA HACKATHON 2026 (SIH 2026) — OFFICIAL PITCH SCRIPT & DEFENSE GUIDE
**Problem Statement ID:** `SIH26054` | **Theme:** Robotics and Drones | **Category:** Software  
**Organization:** Defence Research and Development Organisation (DRDO)  
**Project Title:** **ENGINE-TWIN** — *AI-Enabled Real-Time Digital Twin System for Health Monitoring, Fault Prediction and Mission Reliability Enhancement of Aero Piston Engines used in MALE UAVs*  
**Presentation File:** [`SIH2026_ENGINE_TWIN_OFFICIAL.pptx`](file:///c:/Users/Asus/Desktop/sih-project/SIH2026_ENGINE_TWIN_OFFICIAL.pptx)  
**Live Working Prototype:** [https://mahi-887.github.io/Virtual-UAV-engine-/](https://mahi-887.github.io/Virtual-UAV-engine-/)  

---

## ⏱️ 7-Minute Winning Presentation Flow for Judges

### 📌 Slide 1: Title Slide (Time: 0:00 - 0:45)
- **What to say:**
  > "Respected Judges, we present **ENGINE-TWIN**, an AI-Enabled, Real-Time Digital Twin for Aero Piston Engines powering Medium-Altitude Long-Endurance (MALE) UAVs like DRDO TAPAS and Rustom-II.
  > Modern military UAV sorties operate in critical contested border environments. Current engine health monitoring relies on dumb, reactive threshold alarms that alert pilots *after* catastrophic mechanical damage has already occurred.
  > Our solution bridges this gap with a physics-informed AI digital twin that provides continuous state estimation, early anomaly warning, and actionable remaining useful life (RUL) predictions."

---

### 📌 Slide 2: Proposed Solution & Closed-Loop Digital Twin (Time: 0:45 - 1:45)
- **Key Concepts on Slide:**
  - `SENSE` $\to$ `ANALYZE` $\to$ `PREDICT` $\to$ `EXPLAIN` $\to$ `REPLAY`
  - Closed-loop synchronization between Flight State, Engine Telemetry, Physics Baseline, and AI/RUL Analytics.
- **What to say:**
  > "Our proposed architecture transitions military UAV operations from *reactive threshold alarms* to *predictive engine intelligence*.
  > We fuse a real-time thermodynamic physics engine with an AI layer combining an Isolation Forest and Weibull RUL model ($\beta=1.8, \eta=1500\text{ h}$).
  > Every component is mirrored into a 60 FPS WebGL 3D cutaway twin and tactical flight simulator driven by a single unified telemetry pipeline operating at 10 Hz with zero page reloads."

---

### 📌 Slide 3: Technical Approach — 5-Layer Architecture (Time: 1:45 - 2:45)
- **Key Concepts on Slide:**
  - 5 Layers: 01 Flight Control $\to$ 02 Synthetic Data $\to$ 03 Data Ingestion $\to$ 04 Digital Twin + AI $\to$ 05 3D + Dashboard
  - Fixed JSON Contract & Physics Equations (Rotational Inertia, CHT Heat Balance, EGT Combustion, Hydrodynamic Lube, BSFC Fuel Flow).
- **What to say:**
  > "Our 5-layer modular architecture is completely source-agnostic. 
  > In Layer 1 and 2, we simulate aerodynamic and ISA atmospheric lapse rates. 
  > In Layer 3, we define an immutable JSON telemetry contract that is swappable for real CAN 2.0B / ECU / FADEC feeds without changing downstream AI logic.
  > In Layer 4, the Physics-Informed Neural Network (PINN) computes thermodynamic energy balance residuals:
  > $$\mathcal{L} = MSE + \lambda |Q_{comb} - (W_{shaft} + Q_{exh} + Q_{cool} + Q_{fric})|$$
  > Any deviation between physical laws and observed sensor streams isolates mechanical anomalies before standard alarms can detect them."

---

### 📌 Slide 4: Prototype Walkthrough — Live Screenshots (Time: 2:45 - 3:45)
- **Key Concepts on Slide:**
  - Dual Viewport (3D Flight Simulator over NYC landscape + 3D Engine Cutaway side-by-side)
  - 12-Sensor CAN Telemetry Matrix, Real-time Gauges, and Live Fault Injection buttons.
- **What to say:**
  > "Here are direct captures of our working prototype submitted today.
  > On the left, commanders have a 3D tactical flight simulator tracking real aerodynamic lift and climb.
  > On the right, our 3D engine cutaway visualizes reciprocating pistons, crankshaft rotation, and valve timing in real time.
  > Operators can test fault injection live: injecting a cylinder misfire or turbo overpressure boost immediately highlights the failing component in red, updates the DRDO Early Warning HUD, and delivers directional audio speech alerts."

---

### 📌 Slide 5: Validation Numbers & Parameters (Time: 3:45 - 4:45)
- **Key Concepts on Slide:**
  - 10 Telemetry Channels mapped to real-world sensors (RPM Hall, Piezo Pressure Transducer, CHT Thermocouple, Oil Transducer, IMU Vibration).
  - Rotax 914 Turbo specifications: 1211 cc, 84.5 kW, 88.5 bar max cylinder pressure, 138°C continuous CHT limit.
- **What to say:**
  > "We calibrated our digital twin against certified aero piston engine specs from the Rotax 914 Turbo class used in defense UAVs.
  > Every synthetic channel maps 1-to-1 to physical avionics hardware: RPM Hall sensors, K-type thermocouples, and piezo vibration sensors.
  > Under nominal flight, the engine operates at 73% RUL ($\approx 1089$ hours). When a bearing leak or overboost is injected, RUL degrades dynamically and a Time-To-Failure (TTF) countdown guides the pilot on safe return-to-base."

---

### 📌 Slide 6: Feasibility, Challenges & 3-Phase Roadmap (Time: 4:45 - 5:30)
- **Key Concepts on Slide:**
  - Software-only now, 10 Hz real-time WebSocket, Docker Compose deployment.
  - Challenges $\to$ Mitigation (Lack of aero run-to-failure data, sensor drift vs engine faults).
  - Phased path: Phase 1 (Synthetic) $\to$ Phase 2 (HIL + ECU feed) $\to$ Phase 3 (Flight-test integration).
- **What to say:**
  > "Addressing judge concerns on real-world feasibility: since real military aero-engine failure data is classified and scarce, we mitigate this by validating thermodynamic physics residuals first. 
  > Our deployment roadmap outlines a clear 3-phase path: today's Phase 1 synthetic validation transitions to Phase 2 Hardware-in-the-Loop (HIL) rig testing with CAN bus transceivers, leading to Phase 3 Ground Control Station deployment."

---

### 📌 Slide 7: Impact & Operational Benefits (Time: 5:30 - 6:15)
- **Key Concepts on Slide:**
  - Pipeline: Live Data $\to$ Twin State $\to$ Early Signal $\to$ Action $\to$ Replay
  - Stakeholder impact: UAV Operator, Propulsion Team, Test & Validation, DRDO Fleet Command.
- **What to say:**
  > "ENGINE-TWIN delivers tangible defense benefits across the operational lifecycle:
  > For UAV pilots: eliminates unexpected in-flight flameouts during critical surveillance sorties.
  > For maintenance crews: condition-based overhaul replaces blind hourly scheduled servicing, saving crores in depot turnaround time.
  > And for fleet command: provides post-mission black box incident replay to continually train diagnostic AI models."

---

### 📌 Slide 8: Research Base & Live Demo Story (Time: 6:15 - 7:00)
- **Key Concepts on Slide:**
  - Official SIH Problem Statement SIH26054 alignment.
  - 5-step demo narrative: Start $\to$ Throttle Up $\to$ Fault Injection $\to$ 3D Visualize $\to$ Predict & Advise.
  - Judge Takeaway: Cause $\to$ Effect transparency.
- **What to say:**
  > "In summary, ENGINE-TWIN fulfills every mandate of SIH Problem Statement SIH26054 with an active, deployed prototype.
  > We invite the jury to test the 5-step causal sequence live on our GitHub deployment. Thank you, and we welcome your questions."

---

## 🛡️ Judge Q&A Defense Cheat Sheet (DRDO / Technical Jury)

| Question from Judges | Winning Response Strategy |
|---|---|
| **Q1: "How do you distinguish between sensor failure and actual engine mechanical failure?"** | *"We utilize an Extended Kalman Filter (EKF) innovation covariance matrix. If a single sensor drifts (e.g. CHT #1 rises while CHT #2-4, EGT, and oil pressure stay constant), the algorithm flags sensor drift. If thermodynamic residual across energy balance diverges simultaneously, it confirms genuine mechanical breakdown."* |
| **Q2: "Why use Physics-Informed Neural Networks (PINNs) instead of pure deep learning?"** | *"Pure black-box deep learning (like standard LSTMs) requires thousands of catastrophic engine failure cycles to train, which do not exist for military aircraft. PINNs embed physical governing laws (conservation of energy and mass) into the loss function, allowing reliable anomaly detection even with zero prior failure training data."* |
| **Q3: "Can this system run on edge avionics or only in ground control stations?"** | *"Both. The lightweight PINN inference and Weibull analytics execute in sub-millisecond cycles on embedded ARM processors (e.g. NVIDIA Jetson or Raspberry Pi CM4). The 3D WebGL digital twin runs in the Ground Control Station (GCS) browser using WebSockets over the standard UAV telemetry downlink."* |
| **Q4: "What is your latency and bandwidth footprint?"** | *"Our JSON telemetry payload is under 380 bytes per sample. At 10 Hz transmission, it consumes less than 3.8 KB/s—well within standard defense tactical datalinks (e.g. NATO STANAG 4586)."* |
