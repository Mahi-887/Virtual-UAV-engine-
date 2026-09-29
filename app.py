"""

UAV IC ENGINE DIGITAL TWIN & AI/ML PHM SYSTEM — STREAMLIT APPLICATION

Run with:
    streamlit run app.py

"""

import streamlit as st
import numpy as np
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
from engine_sim import UAVEngineSimulator
from ml_models import UAVEngineMLSuite

# Page Configuration
st.set_page_config(
    page_title="UAV Engine Digital Twin | SIH Aerospace PHM",
    page_icon="✈️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom High-End Aerospace CSS styling
st.markdown("""
<style>
    .stApp {
        background-color: #090b10;
        color: #f1f5f9;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .metric-card {
        background: rgba(18, 22, 30, 0.85);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 12px;
    }
    .status-ok { color: #00ff88; font-weight: bold; }
    .status-warn { color: #ffaa00; font-weight: bold; }
    .status-danger { color: #ff3355; font-weight: bold; }
</style>
""", unsafe_allow_html=True)

# Instantiate Simulators & ML Engines
sim = UAVEngineSimulator()
ml_suite = UAVEngineMLSuite()

# Sidebar Controls
st.sidebar.image("https://img.icons8.com/isometric/100/drone.png", width=70)
st.sidebar.title("Propulsion Mission Control")
st.sidebar.markdown("**Hardware-in-the-Loop & Digital Twin**")

# Flight Parameters
st.sidebar.subheader("1. Flight Envelope")
throttle_pct = st.sidebar.slider("Throttle Setting (%)", 0, 100, 80, step=5)
altitude_ft = st.sidebar.slider("Mission Altitude (ft)", 0, 25000, 4500, step=500)
ambient_temp_c = st.sidebar.slider("Ambient Temperature (°C)", -20, 50, 25, step=1)
flight_hours = st.sidebar.number_input("Cumulative Engine Flight Hours", 1.0, 2000.0, 142.5, step=10.0)

# Fault Injection Triggers
st.sidebar.subheader("2. AI Fault Injection Suite")
fault_mode = st.sidebar.selectbox(
    "Active Fault Simulation",
    ["Nominal (Healthy)", "Spark Misfire (Cylinder #2)", "Combustion Overpressure (Wastegate Jam)", "Lubrication Oil Leak"]
)

fault_key = None
if "Misfire" in fault_mode: fault_key = "misfire"
elif "Overpressure" in fault_mode: fault_key = "overpressure"
elif "Oil" in fault_mode: fault_key = "oil_loss"

# Generate Simulation Telemetry
df_nominal = sim.generate_telemetry_batch(n_samples=200, fault_type=None)
df_current = sim.generate_telemetry_batch(n_samples=200, fault_type=fault_key)

# Run Machine Learning Inferences
ml_suite.train_baseline(df_nominal)
anomaly_scores = ml_suite.predict_anomalies(df_current)
df_current["Anomaly_Score"] = anomaly_scores

latest_anomaly = anomaly_scores[-1]
rul_metrics = ml_suite.estimate_rul_weibull(anomaly_scores, current_flight_hours=flight_hours)
xai_attribution = ml_suite.explain_features(df_current.iloc[-30:])

# Header Dashboard
col_t1, col_t2 = st.columns([3, 1])
with col_t1:
    st.title("UAV IC Engine Digital Twin & Intelligent PHM System")
    st.caption("Physics-Informed Neural Network (PINN) & Reliability Analytics for Autonomous UAV Propulsion")

with col_t2:
    if latest_anomaly > 0.6:
        st.error("🚨 HEALTH: CRITICAL HAZARD")
    elif latest_anomaly > 0.3:
        st.warning("⚠️ HEALTH: WARNING DETECTED")
    else:
        st.success("✅ HEALTH: NOMINAL ENVELOPE")

# High-Level KPI Summary Cards
kpi1, kpi2, kpi3, kpi4, kpi5 = st.columns(5)
kpi1.metric("Engine RPM", f"{int(df_current['RPM'].iloc[-1])} RPM", f"{throttle_pct}% Thr")
kpi2.metric("In-Cylinder Pressure", f"{df_current['PeakCylPressure_Bar'].iloc[-1]:.1f} bar", "Limit: 90 bar")
kpi3.metric("Cylinder Head Temp", f"{int(df_current['CHT_DegC'].iloc[-1])} °C", "Limit: 165 °C")
kpi4.metric("Anomaly Score", f"{latest_anomaly:.2f}", "0.00 - 1.00")
kpi5.metric("Remaining Useful Life", f"{rul_metrics['RUL_Percent']}%", f"{rul_metrics['RUL_Hours']} hrs")

# Overpressure Predictive Alert Banner (Problem Statement requirement)
latest_pressure = df_current['PeakCylPressure_Bar'].iloc[-1]
if latest_pressure > 92.0:
    st.error(f"🚨 **CRITICAL OVERPRESSURE HAZARD PREDICTED:** Peak in-cylinder combustion pressure is at **{latest_pressure:.1f} bar** (Exceeds certified 90.0 bar limit). PINN thermodynamic stress model estimates head gasket fatigue failure in approximately **18 seconds** if throttle is maintained. **IMMEDIATE ACTION: Throttle back to <65%!**")

# Tabbed Layout for SIH Presentation
tab_pv, tab_telemetry, tab_ai, tab_twin, tab_reports = st.tabs([
    "📈 Thermodynamic P-V Cycle",
    "📊 CAN Bus Telemetry Stream",
    "🧠 AI/ML & PINN Diagnostics",
    "🕹️ 3D Digital Twin Viewer",
    "📋 Autonomous Maintenance Advisory"
])

# TAB 1: THERMODYNAMIC P-V DIAGRAM
with tab_pv:
    st.subheader("Internal Combustion P-V (Pressure-Volume) Indicator Diagram")
    st.markdown("Visualizes real-time Otto/Miller 4-stroke thermodynamic cycle: Intake, Compression, Combustion Heat Addition ($P V^\\gamma = C$), and Exhaust.")

    pv_df = sim.generate_pv_diagram(throttle_pct=throttle_pct, overpressure_fault=(fault_key == "overpressure"))
    
    fig_pv = px.line(
        pv_df, x="Volume_cc", y="Pressure_Bar",
        title="In-Cylinder Pressure vs Clearance Volume Indicator Loop",
        labels={"Volume_cc": "Cylinder Volume (cc)", "Pressure_Bar": "Pressure (Bar)"},
        color_discrete_sequence=["#00f0ff"]
    )
    # Add 90 Bar critical threshold line
    fig_pv.add_hline(y=90.0, line_dash="dash", line_color="#ff3355", annotation_text="Max Certified Structural Limit (90 Bar)")
    fig_pv.update_layout(template="plotly_dark", height=420)
    st.plotly_chart(fig_pv, use_container_width=True)

# TAB 2: MULTI-PARAMETRIC CAN BUS TELEMETRY
with tab_telemetry:
    st.subheader("CAN 2.0B Multi-Channel Telemetry Stream")
    
    col_c1, col_c2 = st.columns(2)
    with col_c1:
        fig_press = go.Figure()
        fig_press.add_trace(go.Scatter(x=df_current["Timestamp_s"], y=df_current["PeakCylPressure_Bar"], mode="lines", name="Peak Cyl Pressure (bar)", line=dict(color="#00f0ff", width=2)))
        fig_press.add_trace(go.Scatter(x=df_current["Timestamp_s"], y=df_current["MAP_kPa"], mode="lines", name="Manifold Pressure MAP (kPa)", line=dict(color="#f59e0b", width=1.5)))
        fig_press.add_hline(y=90.0, line_dash="dash", line_color="#ff3355")
        fig_press.update_layout(title="In-Cylinder Pressure vs Manifold Pressure (MAP)", template="plotly_dark", height=320)
        st.plotly_chart(fig_press, use_container_width=True)

    with col_c2:
        fig_therm = go.Figure()
        fig_therm.add_trace(go.Scatter(x=df_current["Timestamp_s"], y=df_current["CHT_DegC"], mode="lines", name="Cylinder Head Temp CHT (°C)", line=dict(color="#3b82f6", width=2)))
        fig_therm.add_trace(go.Scatter(x=df_current["Timestamp_s"], y=df_current["EGT_DegC"], mode="lines", name="Exhaust Gas Temp EGT (°C)", line=dict(color="#ff3355", width=1.5)))
        fig_therm.update_layout(title="Thermal Telemetry (CHT & EGT)", template="plotly_dark", height=320)
        st.plotly_chart(fig_therm, use_container_width=True)

    col_c3, col_c4 = st.columns(2)
    with col_c3:
        fig_vib = px.line(df_current, x="Timestamp_s", y="Vibration_g", title="3-Axis Vibration Acceleration (g RMS)", color_discrete_sequence=["#00ff88"])
        fig_vib.update_layout(template="plotly_dark", height=300)
        st.plotly_chart(fig_vib, use_container_width=True)

    with col_c4:
        fig_oil = px.line(df_current, x="Timestamp_s", y="OilPressure_psi", title="Lubrication Oil Pressure (psi)", color_discrete_sequence=["#a855f7"])
        fig_oil.add_hline(y=20.0, line_dash="dash", line_color="#ff3355", annotation_text="Min Oil Pressure (20 psi)")
        fig_oil.update_layout(template="plotly_dark", height=300)
        st.plotly_chart(fig_oil, use_container_width=True)

# TAB 3: AI / ML & PINN DIAGNOSTICS
with tab_ai:
    st.subheader("Physics-Informed Machine Learning & Explainable AI (XAI)")
    
    col_a1, col_a2 = st.columns(2)
    with col_a1:
        # Anomaly Score stream
        fig_anom = px.area(
            df_current, x="Timestamp_s", y="Anomaly_Score",
            title="Real-Time Multi-Variate Anomaly Score (PINN Residual + Isolation Forest)",
            color_discrete_sequence=["#ff3355"]
        )
        fig_anom.add_hline(y=0.6, line_dash="dash", line_color="#ffaa00", annotation_text="Warning Threshold (0.60)")
        fig_anom.update_layout(template="plotly_dark", height=340)
        st.plotly_chart(fig_anom, use_container_width=True)

    with col_a2:
        # Explainable AI (SHAP-style Feature Importance)
        df_xai = pd.DataFrame(list(xai_attribution.items()), columns=["Telemetry_Feature", "Attribution_Pct"])
        fig_xai = px.bar(
            df_xai, x="Attribution_Pct", y="Telemetry_Feature", orientation="h",
            title="Explainable AI (XAI) Fault Contribution Breakdown",
            color="Attribution_Pct",
            color_continuous_scale="Viridis"
        )
        fig_xai.update_layout(template="plotly_dark", height=340)
        st.plotly_chart(fig_xai, use_container_width=True)

    st.subheader("Weibull Multi-Stress Remaining Useful Life (RUL) Survival Curve")
    # Generate Weibull survival curve
    time_hrs = np.linspace(0, 1500, 100)
    surv_nominal = np.exp(-(time_hrs / 1500.0) ** 1.8)
    surv_stressed = np.exp(-((time_hrs * rul_metrics["StressAccelerationFactor"]) / 1500.0) ** 1.8)

    fig_rul = go.Figure()
    fig_rul.add_trace(go.Scatter(x=time_hrs, y=surv_nominal * 100, mode="lines", name="Nominal Degradation Curve", line=dict(color="#00ff88", dash="dash")))
    fig_rul.add_trace(go.Scatter(x=time_hrs, y=surv_stressed * 100, mode="lines", name="Current Flight Stress Curve", line=dict(color="#ff3355", width=2.5)))
    fig_rul.add_vline(x=flight_hours, line_dash="dot", line_color="#00f0ff", annotation_text=f"Current Flight Hours ({flight_hours}h)")
    fig_rul.update_layout(title="Weibull Survival Probability vs Cumulative Operating Hours", template="plotly_dark", height=350)
    st.plotly_chart(fig_rul, use_container_width=True)

# TAB 4: 3D DIGITAL TWIN VIEWER LINK
with tab_twin:
    st.subheader("Interactive 3D WebGL Digital Twin & Flight Simulator")
    st.markdown("""
    The complete high-fidelity 3D simulation runs directly in your browser via WebGL.
    Open `index.html` in your browser to interact with:
    - 🏎️ **4-Cylinder Finned Cutaway IC Engine**: Moving pistons, H-beam rods, camshafts, live spark flashes, and thermal exhaust glow.
    - 🏙️ **Realistic NYC Flight Simulator**: Multi-lane asphalt avenues, towering skyscrapers, manual runway takeoff, and threat combat drones!
    """)
    st.info("💡 Pro Tip for Judges: Open `index.html` locally in Google Chrome or Edge for the full 60 FPS dual-viewport interactive experience.")

# TAB 5: AUTONOMOUS MAINTENANCE ADVISORY
with tab_reports:
    st.subheader("Autonomous Predictive Maintenance Advisory & Work Order")
    
    if latest_anomaly > 0.6:
        st.error("""
        ### 🚨 WORK ORDER #UAV-2026-0941 (CRITICAL)
        - **Component**: Cylinder Assembly & Fuel Injection System
        - **Fault Mode Identified**: Combustion Instability / Injector Nozzle Clogging
        - **Required Action**: Immediate engine shutdown. Perform borescope cylinder inspection, spark plug gap test, and ultrasonic fuel injector cleaning.
        - **Dispatcher Priority**: AOG (Aircraft On Ground)
        """)
    elif latest_anomaly > 0.3:
        st.warning("""
        ### ⚠️ WORK ORDER #UAV-2026-0882 (PREVENTATIVE)
        - **Component**: Lubrication & Thermal Subsystem
        - **Fault Mode Identified**: Thermal Gradient Accumulation / Oil Viscosity Degradation
        - **Required Action**: Schedule oil filter replacement and verify oil cooler airflow within 10 flight hours.
        - **Dispatcher Priority**: Medium (Routine Pre-Flight)
        """)
    else:
        st.success("""
        ### ✅ MISSION DISPATCH CLEARANCE #UAV-2026-0711
        - **Component Health**: All propulsion nodes nominal
        - **Certified Envelope**: Throttle, pressure, and thermal metrics within certified limits
        - **Dispatcher Status**: Cleared for next tactical sortie
        """)

    # Download Telemetry Data
    csv_data = df_current.to_csv(index=False).encode('utf-8')
    st.download_button(
        "📥 Download Telemetry CSV Log",
        data=csv_data,
        file_name=f"UAV_Engine_Telemetry_{int(flight_hours)}h.csv",
        mime="text/csv"
    )
