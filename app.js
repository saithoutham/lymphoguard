const patients = [
  {
    id: "LG-2024-0089",
    name: "James Williams",
    diagnosis: "NSCLC, stage III",
    physician: "Dr. Maya Rao",
    week: 4.1,
    alc: 420,
    nadir: 360,
    risk: "High",
    riskClass: "high",
    wearable: "6 min ago",
    alert: "Critical",
    score: 65
  },
  {
    id: "LG-2024-0203",
    name: "Robert Torres",
    diagnosis: "Esophageal SCC",
    physician: "Dr. Maya Rao",
    week: 3.6,
    alc: 650,
    nadir: 510,
    risk: "Intermediate",
    riskClass: "medium",
    wearable: "18 min ago",
    alert: "Warning",
    score: 74
  },
  {
    id: "LG-2024-0147",
    name: "Margaret Chen",
    diagnosis: "NSCLC, stage II",
    physician: "Dr. Maya Rao",
    week: 2.8,
    alc: 1080,
    nadir: 820,
    risk: "Low",
    riskClass: "low",
    wearable: "22 min ago",
    alert: "None",
    score: 88
  },
  {
    id: "LG-2024-0241",
    name: "Elena Park",
    diagnosis: "Limited-stage SCLC",
    physician: "Dr. Maya Rao",
    week: 5.0,
    alc: 710,
    nadir: 590,
    risk: "Intermediate",
    riskClass: "medium",
    wearable: "31 min ago",
    alert: "Lab due",
    score: 71
  }
];

const navy = "#0B1F3A";
const muted = "#6B7280";
const red = "#C2413B";
const line = "#E5E5E5";
const ciFill = "rgba(11, 31, 58, 0.08)";

const tooltipOptions = {
  enabled: true,
  backgroundColor: "#0D0D0D",
  titleFont: { family: "DM Sans", size: 13, weight: "700" },
  bodyFont: { family: "DM Sans", size: 13 },
  padding: 12,
  displayColors: false
};

const crosshairPlugin = {
  id: "lymphoguardCrosshair",
  afterDraw(chart) {
    if (!chart.tooltip || !chart.tooltip.getActiveElements().length) return;
    const activePoint = chart.tooltip.getActiveElements()[0];
    const x = activePoint.element.x;
    const { top, bottom } = chart.chartArea;
    const ctx = chart.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(11,31,58,0.18)";
    ctx.stroke();
    ctx.restore();
  }
};

const centerTextPlugin = {
  id: "centerText",
  afterDraw(chart, args, options) {
    if (!options || !options.text) return;
    const { ctx, chartArea } = chart;
    const x = (chartArea.left + chartArea.right) / 2;
    const y = (chartArea.top + chartArea.bottom) / 2;
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = navy;
    ctx.font = "700 56px DM Sans";
    ctx.fillText(options.text, x, y - 6);
    ctx.fillStyle = muted;
    ctx.font = "500 13px DM Sans";
    ctx.fillText("immune fitness", x, y + 36);
    ctx.restore();
  }
};

function baseScaleOptions() {
  return {
    x: {
      grid: { color: "rgba(0,0,0,0.04)", drawBorder: false },
      ticks: { color: muted, font: { family: "DM Sans" } }
    },
    y: {
      grid: { color: "rgba(0,0,0,0.06)", drawBorder: false },
      ticks: { color: muted, font: { family: "DM Sans" } }
    }
  };
}

function getPatient() {
  const params = new URLSearchParams(window.location.search);
  const requested = params.get("id");
  return patients.find((patient) => patient.id === requested) || patients[0];
}

function navigateTo(url) {
  window.location.href = url;
}

function initLanding() {
  document.querySelectorAll("[data-nav]").forEach((button) => {
    button.addEventListener("click", () => navigateTo(button.dataset.nav));
  });
}

function initDashboard() {
  const tbody = document.querySelector("[data-patient-table]");
  if (tbody) {
    tbody.innerHTML = patients.map((patient) => `
      <tr data-patient-id="${patient.id}" tabindex="0">
        <td><span class="patient-id"><strong>${patient.id}</strong><span class="muted small">${patient.name}</span></span></td>
        <td>${patient.diagnosis}</td>
        <td>${patient.week.toFixed(1)}</td>
        <td>${patient.alc} cells/uL</td>
        <td>${patient.nadir} cells/uL</td>
        <td><span class="risk"><span class="dot ${patient.riskClass}"></span>${patient.risk}</span></td>
        <td><span class="muted">${patient.wearable}</span></td>
        <td>${patient.alert}</td>
      </tr>
    `).join("");

    tbody.querySelectorAll("tr").forEach((row) => {
      const openPatient = () => navigateTo(`patient.html?id=${row.dataset.patientId}`);
      row.addEventListener("click", openPatient);
      row.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") openPatient();
      });
    });
  }

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;
      if (action === "acknowledge") {
        button.textContent = "Acknowledged";
        button.disabled = true;
      }
    });
  });
}

function initPatientDetail() {
  const patient = getPatient();
  document.querySelector("[data-patient-name]").textContent = patient.name;
  document.querySelector("[data-patient-meta]").textContent = `${patient.diagnosis} | Treating physician: ${patient.physician}`;
  document.querySelector("[data-score]").textContent = patient.score;

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.action === "review") {
        button.textContent = "Escalation opened";
      }
      if (button.dataset.action === "order-lab") {
        button.textContent = "CBC order drafted";
      }
    });
  });

  const weeks = ["0", "1", "2", "3", "4", "5", "6"];
  new Chart(document.getElementById("alcChart"), {
    type: "line",
    plugins: [crosshairPlugin],
    data: {
      labels: weeks,
      datasets: [
        {
          label: "90% CI lower",
          data: [1710, 1280, 900, 610, 350, 330, 390],
          borderColor: "transparent",
          pointRadius: 0,
          tension: 0.38
        },
        {
          label: "90% CI upper",
          data: [2050, 1620, 1240, 860, 590, 610, 720],
          borderColor: "transparent",
          backgroundColor: ciFill,
          pointRadius: 0,
          fill: "-1",
          tension: 0.38
        },
        {
          label: "Measured ALC",
          data: [1880, 1440, 1020, 710, patient.alc, null, null],
          borderColor: navy,
          backgroundColor: navy,
          borderWidth: 3,
          pointRadius: 4,
          pointHoverRadius: 7,
          tension: 0.32
        },
        {
          label: "Predicted trajectory",
          data: [1880, 1460, 1040, 740, 500, patient.nadir, 430],
          borderColor: muted,
          borderDash: [7, 7],
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 5,
          tension: 0.32
        },
        {
          label: "Grade 3 threshold",
          data: [500, 500, 500, 500, 500, 500, 500],
          borderColor: red,
          borderDash: [6, 6],
          borderWidth: 2,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "nearest", intersect: false, axis: "x" },
      plugins: {
        tooltip: {
          ...tooltipOptions,
          callbacks: {
            title(items) {
              return `Week ${items[0].label}`;
            },
            label(item) {
              return `${item.dataset.label}: ${item.formattedValue} cells/uL`;
            }
          }
        },
        legend: {
          labels: { color: muted, font: { family: "DM Sans" }, usePointStyle: true }
        }
      },
      scales: baseScaleOptions()
    }
  });

  makeMiniChart("stepsChart", "Daily Steps", [6200, 5900, 5300, 4920, 4610, 4300, 4180], "#0B1F3A");
  makeMiniChart("hrChart", "Resting HR", [72, 74, 77, 80, 83, 85, 86], "#0B1F3A");
  makeMiniChart("hrvChart", "HRV", [34, 31, 29, 27, 24, 22, 21], "#0B1F3A");
  makeGauge("fitnessGauge", patient.score);
}

function makeMiniChart(id, label, values, color) {
  new Chart(document.getElementById(id), {
    type: "line",
    data: {
      labels: ["D1", "D2", "D3", "D4", "D5", "D6", "D7"],
      datasets: [{
        label,
        data: values,
        borderColor: color,
        backgroundColor: "transparent",
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 6,
        tension: 0.35
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "nearest", intersect: false },
      plugins: {
        tooltip: tooltipOptions,
        legend: { display: false }
      },
      scales: {
        x: { display: false },
        y: { display: false }
      }
    }
  });
}

function makeGauge(id, score) {
  new Chart(document.getElementById(id), {
    type: "doughnut",
    plugins: [centerTextPlugin],
    data: {
      labels: ["Score", "Remaining"],
      datasets: [{
        data: [score, 100 - score],
        backgroundColor: [navy, "#ECECEC"],
        borderWidth: 0,
        hoverOffset: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "78%",
      plugins: {
        tooltip: {
          ...tooltipOptions,
          callbacks: {
            label(item) {
              return `${item.label}: ${item.raw}`;
            }
          }
        },
        legend: { display: false },
        centerText: { text: String(score) }
      }
    }
  });
}

function initPortal() {
  const patient = patients[0];
  document.querySelector("[data-portal-name]").textContent = patient.name.split(" ")[0];
  makeGauge("portalGauge", patient.score);
  new Chart(document.getElementById("portalAlc"), {
    type: "line",
    data: {
      labels: ["Week 0", "Week 1", "Week 2", "Week 3", "Week 4", "Week 5"],
      datasets: [{
        label: "Immune cell count",
        data: [1880, 1440, 1020, 710, 420, 360],
        borderColor: navy,
        backgroundColor: "transparent",
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 7,
        tension: 0.35
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "nearest", intersect: false },
      plugins: {
        tooltip: {
          ...tooltipOptions,
          callbacks: {
            label(item) {
              return `ALC: ${item.formattedValue} cells/uL`;
            }
          }
        },
        legend: { display: false }
      },
      scales: baseScaleOptions()
    }
  });

  document.querySelectorAll(".energy-btn").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".energy-btn").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      document.querySelector("[data-check-status]").textContent = `Energy level ${button.textContent} selected.`;
    });
  });

  document.querySelectorAll("[data-fever]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-fever]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      document.querySelector("[data-check-status]").textContent = button.dataset.fever === "yes"
        ? "Fever response recorded. Care team review flagged."
        : "No fever recorded.";
    });
  });

  document.querySelector("[data-contact]").addEventListener("click", () => {
    alert("Care team contact request sent.");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  if (page === "landing") initLanding();
  if (page === "dashboard") initDashboard();
  if (page === "patient") initPatientDetail();
  if (page === "portal") initPortal();
});
