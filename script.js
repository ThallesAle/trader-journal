let currentDate = new Date();

let tradeData =
  JSON.parse(localStorage.getItem("tradesPro")) || {};

let initialBalance =
  Number(localStorage.getItem("initialBalance")) || 0;

let monthlyGoal =
  Number(localStorage.getItem("monthlyGoal")) || 0;

let chart;

let selectedTradeKey = null;

const calendar =
  document.getElementById("calendar");

const monthYear =
  document.getElementById("monthYear");

/* =========================
   CONFIG CHART
========================= */

Chart.defaults.color = "#94a3b8";

Chart.defaults.font.family =
  "Segoe UI";

Chart.defaults.borderColor =
  "rgba(255,255,255,0.05)";

/* =========================
   SALVAR DADOS
========================= */

function saveAll() {

  localStorage.setItem(
    "tradesPro",
    JSON.stringify(tradeData)
  );

  localStorage.setItem(
    "initialBalance",
    initialBalance
  );

  localStorage.setItem(
    "monthlyGoal",
    monthlyGoal
  );

}

/* =========================
   DARK / LIGHT MODE
========================= */

function toggleTheme() {

  document.body.classList.toggle(
    "light-mode"
  );

  const isLight =
    document.body.classList.contains(
      "light-mode"
    );

  localStorage.setItem(
    "theme",
    isLight ? "light" : "dark"
  );

}

function loadTheme() {

  const savedTheme =
    localStorage.getItem("theme");

  if (savedTheme === "light") {

    document.body.classList.add(
      "light-mode"
    );

  }

}

/* =========================
   MODAL
========================= */

function openTradeModal(key, day, value) {

  selectedTradeKey = key;

  document.getElementById(
    "tradeModal"
  ).style.display = "flex";

  document.getElementById(
    "selectedDateText"
  ).innerText =
    `Operação do dia ${day}`;

  document.getElementById(
    "tradeValueInput"
  ).value = value || "";

}

function closeTradeModal() {

  document.getElementById(
    "tradeModal"
  ).style.display = "none";

}

function saveTrade() {

  const input = Number(
    document.getElementById(
      "tradeValueInput"
    ).value
  );

  if (isNaN(input)) {

    return alert("Valor inválido");

  }

  tradeData[selectedTradeKey] = input;

  saveAll();

  renderCalendar();

  updateStats();

  updateChart();

  closeTradeModal();

}

/* =========================
   BANCA
========================= */

function setInitialBalance() {

  const value = Number(
    document.getElementById(
      "initialBalanceInput"
    ).value
  );

  if (isNaN(value) || value < 0) {

    return alert("Valor inválido");

  }

  initialBalance = value;

  saveAll();

  updateStats();

  updateChart();

}

function deposit() {

  const value = Number(
    document.getElementById(
      "depositInput"
    ).value
  );

  if (isNaN(value) || value <= 0) {

    return alert("Valor inválido");

  }

  initialBalance += value;

  document.getElementById(
    "depositInput"
  ).value = "";

  saveAll();

  updateStats();

  updateChart();

}

function withdraw() {

  const value = Number(
    document.getElementById(
      "withdrawInput"
    ).value
  );

  if (isNaN(value) || value <= 0) {

    return alert("Valor inválido");

  }

  initialBalance -= value;

  document.getElementById(
    "withdrawInput"
  ).value = "";

  saveAll();

  updateStats();

  updateChart();

}

/* =========================
   META
========================= */

function setMonthlyGoal() {

  const value = Number(
    document.getElementById(
      "goalInput"
    ).value
  );

  if (isNaN(value) || value < 0) {

    return alert("Meta inválida");

  }

  monthlyGoal = value;

  saveAll();

  updateStats();

}

/* =========================
   RISCO
========================= */

function calculateRisk() {

  const riskPercent = Number(
    document.getElementById(
      "riskPercentInput"
    ).value
  );

  if (
    isNaN(riskPercent)
    || riskPercent <= 0
  ) {

    return alert(
      "Percentual inválido"
    );

  }

  const year =
    currentDate.getFullYear();

  const month =
    currentDate.getMonth();

  let saldoMes = 0;

  Object.keys(tradeData)
    .forEach(key => {

      if (
        key.startsWith(
          `${year}-${month}`
        )
      ) {

        saldoMes += tradeData[key];

      }

    });

  const bancaAtual =
    initialBalance + saldoMes;

  const risco =
    (bancaAtual * riskPercent)
    / 100;

  document.getElementById(
    "riskResult"
  ).innerText =
    "R$ " + risco.toFixed(2);

}

/* =========================
   CALENDÁRIO
========================= */

function renderCalendar() {

  calendar.innerHTML = "";

  const year =
    currentDate.getFullYear();

  const month =
    currentDate.getMonth();

  monthYear.innerText =
    currentDate.toLocaleString(
      "pt-BR",
      {
        month: "long",
        year: "numeric"
      }
    );

  const firstDay =
    new Date(year, month, 1).getDay();

  const daysInMonth =
    new Date(year, month + 1, 0).getDate();

  const weekdays = [
    "Dom",
    "Seg",
    "Ter",
    "Qua",
    "Qui",
    "Sex",
    "Sáb"
  ];

  weekdays.forEach(d => {

    const div =
      document.createElement("div");

    div.classList.add("weekday");

    div.innerText = d;

    calendar.appendChild(div);

  });

  for (let i = 0; i < firstDay; i++) {

    calendar.appendChild(
      document.createElement("div")
    );

  }

  for (let day = 1; day <= daysInMonth; day++) {

    const key =
      `${year}-${month}-${day}`;

    const div =
      document.createElement("div");

    div.classList.add("day");

    const value =
      tradeData[key];

    let emoji = "";

    if (value > 0) {

      emoji = "😄";

      div.classList.add("gain");

    }

    if (value < 0) {

      emoji = "😢";

      div.classList.add("loss");

    }

    div.innerHTML = `

      <strong>${day}</strong>

      <div class="day-profit">
        ${
          value !== undefined
          ? "R$ " + value.toFixed(2)
          : ""
        }
      </div>

      <div class="day-emoji">
        ${emoji}
      </div>

    `;

div.onclick = () => {

  const currentValue =
    tradeData[key] || "";

  const input = prompt(
    `Digite o valor da operação do dia ${day}:`,
    currentValue
  );

  if (input === null) return;

  const number = Number(input);

  if (isNaN(number)) {

    return alert("Valor inválido");

  }

  tradeData[key] = number;

  saveAll();

  renderCalendar();

  updateStats();

  updateChart();

};

    calendar.appendChild(div);

  }

  updateStats();

}

/* =========================
   ESTATÍSTICAS
========================= */

function updateStats() {

  const year =
    currentDate.getFullYear();

  const month =
    currentDate.getMonth();

  let gains = 0;

  let losses = 0;

  let saldoMes = 0;

  Object.keys(tradeData)
    .forEach(key => {

      if (
        key.startsWith(
          `${year}-${month}`
        )
      ) {

        const value =
          tradeData[key];

        saldoMes += value;

        if (value > 0) gains++;

        if (value < 0) losses++;

      }

    });

  const total =
    gains + losses;

  const winrate =
    total > 0
      ? (
          (gains / total) * 100
        ).toFixed(1)
      : 0;

  const bancaAtual =
    initialBalance + saldoMes;

  const crescimento =
    initialBalance > 0
      ? (
          (saldoMes / initialBalance)
          * 100
        ).toFixed(2)
      : 0;

  const metaPercent =
    monthlyGoal > 0
      ? (
          (saldoMes / monthlyGoal)
          * 100
        )
      : 0;

  document.getElementById(
    "gains"
  ).innerText = gains;

  document.getElementById(
    "losses"
  ).innerText = losses;

  document.getElementById(
    "saldo"
  ).innerText =
    saldoMes.toFixed(2);

  document.getElementById(
    "winrate"
  ).innerText =
    winrate + "%";

  document.getElementById(
    "currentBalance"
  ).innerText =
    bancaAtual.toLocaleString(
      "pt-BR",
      {
        minimumFractionDigits: 2
      }
    );

  document.getElementById(
    "growthPercent"
  ).innerText =
    crescimento + "%";

  document.getElementById(
    "goalPercent"
  ).innerText =
    metaPercent.toFixed(1) + "%";

  const goalBar =
    document.getElementById(
      "goalBar"
    );

  if (goalBar) {

    goalBar.style.width =
      Math.min(metaPercent, 100)
      + "%";

  }

  const goalProgressBar =
    document.getElementById(
      "goalProgressBar"
    );

  if (goalProgressBar) {

    goalProgressBar.style.width =
      Math.min(metaPercent, 100)
      + "%";

  }

}

/* =========================
   CHART
========================= */

function updateChart() {

  const year =
    currentDate.getFullYear();

  const month =
    currentDate.getMonth();

  const daysInMonth =
    new Date(
      year,
      month + 1,
      0
    ).getDate();

  let saldo = 0;

  let labels = [];

  let data = [];

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {

    const key =
      `${year}-${month}-${day}`;

    if (tradeData[key]) {

      saldo += tradeData[key];

    }

    labels.push(day);

    data.push(
      initialBalance + saldo
    );

  }

  if (chart) {

    chart.destroy();

  }

  chart = new Chart(

    document.getElementById(
      "chart"
    ),

    {

      type: "line",

      data: {

        labels: labels,

        datasets: [{

          label:
            "Evolução da Banca",

          data: data,

          borderWidth: 3,

          borderColor:
            "#22c55e",

          backgroundColor:
            "rgba(34,197,94,0.15)",

          fill: true,

          tension: 0.4,

          pointRadius: 4,

          pointHoverRadius: 7,

          pointBackgroundColor:
            "#22c55e"

        }]

      },

      options: {

        responsive: true,

        maintainAspectRatio: false,

        interaction: {

          intersect: false,

          mode: "index"

        },

        plugins: {

          legend: {

            display: false

          }

        },

        scales: {

          x: {

            grid: {

              display: false

            }

          },

          y: {

            grid: {

              color:
                "rgba(255,255,255,0.06)"

            }

          }

        }

      }

    }

  );

}

/* =========================
   CONTROLES
========================= */

function changeMonth(direction) {

  currentDate.setMonth(
    currentDate.getMonth()
    + direction
  );

  renderCalendar();

  updateChart();

}

/* =========================
   INICIAR
========================= */

document.getElementById(
  "initialBalanceInput"
).value = initialBalance;

document.getElementById(
  "goalInput"
).value = monthlyGoal;

loadTheme();

renderCalendar();

updateChart();