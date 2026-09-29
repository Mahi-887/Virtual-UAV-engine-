/**
 * ============================================================================
 * HIGH-PERFORMANCE REAL-TIME TELEMETRY CHARTS & FFT VIBRATION ANALYZER
 * ============================================================================
 */

class TelemetryCharts {
  constructor() {
    this.bufferSize = 60;
    this.pressureHistory = [];
    this.thermalHistory = [];
    this.anomalyHistory = [];
    this.vibHistory = [];

    // Pre-fill initial buffer
    for (let i = 0; i < this.bufferSize; i++) {
      this.pressureHistory.push({ pCyl: 1.0, map: 101.3 });
      this.thermalHistory.push({ cht: 25, egt: 25 });
      this.anomalyHistory.push({ anomaly: 0.02, rul: 100 });
      this.vibHistory.push(0.2);
    }
  }

  pushSample(telemetry) {
    const avgCht = (telemetry.cht[0] + telemetry.cht[1] + telemetry.cht[2] + telemetry.cht[3]) / 4;
    const avgEgt = (telemetry.egt[0] + telemetry.egt[1] + telemetry.egt[2] + telemetry.egt[3]) / 4;

    this.pressureHistory.push({
      pCyl: telemetry.cylinderPressureBar,
      map: telemetry.mapKpa
    });
    this.thermalHistory.push({ cht: avgCht, egt: avgEgt });
    this.anomalyHistory.push({ anomaly: telemetry.anomalyScore, rul: telemetry.rulPercent });
    this.vibHistory.push(telemetry.vibrationRmsG);

    if (this.pressureHistory.length > this.bufferSize) this.pressureHistory.shift();
    if (this.thermalHistory.length > this.bufferSize) this.thermalHistory.shift();
    if (this.anomalyHistory.length > this.bufferSize) this.anomalyHistory.shift();
    if (this.vibHistory.length > this.bufferSize) this.vibHistory.shift();
  }

  // Draw Pressure Dynamics (Cylinder Pressure & Manifold Pressure)
  renderPressureChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.clientWidth;
    const h = canvas.height = canvas.clientHeight;

    ctx.clearRect(0, 0, w, h);

    // Background Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    for (let y = 0; y < h; y += h / 4) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Critical Overpressure Hazard Threshold Line (90 Bar)
    const critY = h - (90 / 130) * h;
    ctx.strokeStyle = 'rgba(255, 51, 85, 0.4)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(0, critY); ctx.lineTo(w, critY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#ff3355';
    ctx.font = '9px monospace';
    ctx.fillText('CRITICAL THRESHOLD: 90 BAR', 10, critY - 4);

    // Draw In-Cylinder Peak Pressure (Cyan line)
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    this.pressureHistory.forEach((pt, i) => {
      const x = (i / (this.bufferSize - 1)) * w;
      const y = h - (pt.pCyl / 130) * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw MAP Manifold Pressure (Yellow line)
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    this.pressureHistory.forEach((pt, i) => {
      const x = (i / (this.bufferSize - 1)) * w;
      const y = h - (pt.map / 160) * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  // Draw Vibration FFT Spectrum Analyzer
  renderVibrationFft(canvasId, rpm, vibRms) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.clientWidth;
    const h = canvas.height = canvas.clientHeight;

    ctx.clearRect(0, 0, w, h);

    const numBins = 48;
    const binW = (w / numBins) - 2;
    const f0 = (rpm / 60); // 1X Fundamental shaft frequency

    for (let b = 0; b < numBins; b++) {
      const freqHz = b * 3.5;
      // Synthesize FFT peaks at 1X shaft harmonics (f0), 2X (piston), and 4X (firing)
      let magnitude = 0.05 + Math.random() * 0.04;

      const is1X = Math.abs(freqHz - f0) < 4;
      const is2X = Math.abs(freqHz - (f0 * 2)) < 5;
      const is4X = Math.abs(freqHz - (f0 * 4)) < 6;

      if (is1X) magnitude += (vibRms * 0.45);
      if (is2X) magnitude += (vibRms * 0.35);
      if (is4X) magnitude += (vibRms * 0.55);

      if (window.physicsMLEngine.activeFaults.misfire) {
        // Severe sub-harmonic flutter at 0.5X frequency
        if (Math.abs(freqHz - (f0 * 0.5)) < 4) magnitude += 0.75;
      }

      const barHeight = Math.min(h - 10, magnitude * (h * 0.85));
      const x = b * (binW + 2);
      const y = h - barHeight;

      // Color coding (green -> amber -> red)
      let grad = ctx.createLinearGradient(0, y, 0, h);
      if (magnitude > 0.6) {
        grad.addColorStop(0, '#ff3355');
        grad.addColorStop(1, '#660011');
      } else if (magnitude > 0.3) {
        grad.addColorStop(0, '#f59e0b');
        grad.addColorStop(1, '#452000');
      } else {
        grad.addColorStop(0, '#00ff88');
        grad.addColorStop(1, '#003318');
      }

      ctx.fillStyle = grad;
      ctx.fillRect(x, y, binW, barHeight);
    }
  }

  // Draw Anomaly Score & RUL Curves
  renderAnomalyChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.clientWidth;
    const h = canvas.height = canvas.clientHeight;

    ctx.clearRect(0, 0, w, h);

    // Anomaly Line (Red / Amber)
    ctx.strokeStyle = '#ff3355';
    ctx.lineWidth = 2;
    ctx.beginPath();
    this.anomalyHistory.forEach((pt, i) => {
      const x = (i / (this.bufferSize - 1)) * w;
      const y = h - (pt.anomaly * h);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // RUL Trendline (Green)
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    this.anomalyHistory.forEach((pt, i) => {
      const x = (i / (this.bufferSize - 1)) * w;
      const y = h - ((pt.rul / 100) * h);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }
}

window.telemetryCharts = new TelemetryCharts();
