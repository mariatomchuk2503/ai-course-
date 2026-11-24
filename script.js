// =============================================================
//  ЛОГІКА САЙТУ
//  Зміст курсу — у data.js, налаштування — у firebase-config.js
// =============================================================

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmtH = (h) => String(h).replace(".", ",");

// =============================================================
//  СТАН КОРИСТУВАЧА
//  Без входу — зберігається в браузері.
//  Після входу — у хмарі (Firebase) і копія в браузері.
// =============================================================
const emptyState = () => ({
  name: "", subject: "", route: null, score: null, finalScore: null,
  done: {}, checks: {}, quiz: {}, completedAt: null
});

const local = {
  get(key) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch (e) { return null; } },
  set(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }
};

function loadGuest() {
  const saved = local.get("course-state");
  if (saved) return { ...emptyState(), ...saved };
  // перенесення прогресу зі старої версії сайту
  const s = emptyState();
  s.route = local.get("course-route");
  s.done = local.get("course-done") || {};
  return s;
}

let user = null;              // { uid, email } після входу
let state = loadGuest();
let openModule = local.get("course-open") || "m0";
let viewRoute = null;         // яку картку маршруту показано в модулі

function save() {
  if (user) {
    local.set("course-state-" + user.uid, state);
    if (window.Cloud && window.Cloud.enabled) window.Cloud.save(state);
  } else {
    local.set("course-state", state);
  }
}

// =============================================================
//  ПРОГРЕС І ЗНАЧКИ
// =============================================================
const stepKey = (m, i) => m.id + "-" + i;
const allSteps = () => MODULES.flatMap((m) => m.steps.map((s, i) => ({ m, i, key: stepKey(m, i) })));
const moduleProgress = (m) => {
  const n = m.steps.filter((s, i) => state.done[stepKey(m, i)]).length;
  return { n, total: m.steps.length, complete: n === m.steps.length };
};
const earnedBadges = () => MODULES.filter((m) => moduleProgress(m).complete).map((m) => m.id);
const courseComplete = () => MODULES.every((m) => moduleProgress(m).complete);
const inFinalStage = () => MODULES.slice(0, 6).every((m) => moduleProgress(m).complete);

// Змінює стан і показує нові значки
function update(fn) {
  const before = earnedBadges();
  fn();
  if (courseComplete() && !state.completedAt) state.completedAt = new Date().toISOString();
  save();
  const fresh = earnedBadges().filter((id) => !before.includes(id));
  if (fresh.length) {
    const b = BADGES[fresh[0]];
    toast(`${b.icon} Новий значок: «${b.name}»`);
  }
  renderAll();
}

let toastTimer;
function toast(text) {
  const t = $("toast");
  t.textContent = text;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 3500);
}

// =============================================================
//  ВКЛАДКИ
// =============================================================
const TABS = ["home", "modules", "routes", "test", "resources", "glossary", "help", "account", "certificate", "privacy"];

let firstShow = true;
function showTab(name) {
  if (!TABS.includes(name)) {
    // посилання на блок усередині «Ресурсів»
    if (name && name.startsWith("res-") && $(name)) { showTab("resources"); $(name).scrollIntoView({ behavior: "smooth" }); return; }
    name = "home";
  }
  TABS.forEach((t) => { $("panel-" + t).hidden = t !== name; });
  document.querySelectorAll(".nav-tab").forEach((b) => {
    const on = b.dataset.tab === name;
    b.classList.toggle("is-active", on);
    b.setAttribute("aria-selected", on);
  });
  if (name === "certificate") renderCertificate();
  if (location.hash !== "#" + name) history[firstShow ? "replaceState" : "pushState"](null, "", "#" + name);
  firstShow = false;
  window.scrollTo({ top: 0 });
}

document.querySelectorAll(".nav-tab").forEach((b) => b.addEventListener("click", () => showTab(b.dataset.tab)));
document.addEventListener("click", (e) => {
  const go = e.target.closest("[data-go]");
  if (go) { e.preventDefault(); showTab(go.dataset.go); }
});
window.addEventListener("popstate", () => showTab(location.hash.slice(1)));

function openModuleTab(id) {
  openModule = id;
  local.set("course-open", id);
  viewRoute = null;
  renderModules();
  showTab("modules");
}

// =============================================================
//  МІЙ КУРС (кабінет)
// =============================================================
function renderDashboard() {
  const first = (state.name || "").trim().split(/\s+/)[0];
  $("home-title").textContent = first ? `Вітаємо, ${first}!` : "Вітаємо на курсі!";
  $("guest-banner").hidden = !!user || !(window.Cloud && window.Cloud.enabled);

  const steps = allSteps();
  const count = steps.filter((s) => state.done[s.key]).length;
  const percent = Math.round((count / steps.length) * 100);
  $("dash-progress").textContent = percent + " %";
  $("dash-bar").style.width = percent + "%";
  $("dash-progress-text").textContent = `Виконано ${count} з ${steps.length} кроків`;
  $("dash-scores").textContent = state.score === null ? ""
    : `Тест на початку: ${state.score}/12` + (state.finalScore !== null ? ` · наприкінці: ${state.finalScore}/12` : "");

  const rBtn = $("dash-route-btn");
  if (state.route) {
    $("dash-route").textContent = ROUTES[state.route].short;
    $("dash-route-text").textContent = ROUTES[state.route].tip;
    rBtn.textContent = "Про мій маршрут";
    rBtn.dataset.go = "routes";
  } else {
    $("dash-route").textContent = "Ще не визначено";
    $("dash-route-text").textContent = "Пройдіть короткий тест, і ми підберемо завдання під ваш рівень.";
    rBtn.textContent = "Пройти тест";
    rBtn.dataset.go = "test";
  }

  const next = steps.find((s) => !state.done[s.key]);
  const btn = $("dash-next-btn");
  if (!state.route) {
    $("dash-next").textContent = "Пройти вхідний тест";
    $("dash-next-module").textContent = "Модуль М0 · 10 хвилин";
    btn.onclick = () => showTab("test");
  } else if (next) {
    $("dash-next").textContent = next.m.steps[next.i].title;
    $("dash-next-module").textContent = `${next.m.code} · ${next.m.title}`;
    btn.onclick = () => openModuleTab(next.m.id);
  } else {
    $("dash-next").textContent = "Курс пройдено!";
    $("dash-next-module").textContent = "Вітаємо із завершенням";
    btn.onclick = () => showTab("certificate");
  }

  // прогрес по модулях
  $("mod-progress").innerHTML = MODULES.map((m) => {
    const p = moduleProgress(m);
    return `<button class="mp ${p.complete ? "is-done" : ""}" data-module="${m.id}">
      <span class="mp__code">${m.code}</span>
      <span class="mp__body"><b>${m.title}</b>
        <span class="progress progress--thin"><span class="progress__bar" style="width:${(p.n / p.total) * 100}%"></span></span>
      </span>
      <span class="muted small">${p.n}/${p.total}</span>
    </button>`;
  }).join("");

  // значки
  const got = earnedBadges();
  $("badges").innerHTML = MODULES.map((m) => {
    const b = BADGES[m.id], on = got.includes(m.id);
    return `<div class="badge-card ${on ? "is-on" : ""}" title="${on ? "Отримано" : "Завершіть модуль " + m.code}">
      <span class="badge-card__icon">${on ? b.icon : "🔒"}</span>
      <b>${b.name}</b><span class="muted small">${m.code}</span></div>`;
  }).join("");

  // свідоцтво
  $("cert-teaser").innerHTML = courseComplete()
    ? `<div class="banner banner--ok"><div><b>🎓 Курс завершено!</b> Ваше свідоцтво про проходження курсу готове.</div><button class="btn btn--small" data-go="certificate">Відкрити свідоцтво</button></div>`
    : `<div class="banner"><div><b>🎓 Свідоцтво про проходження курсу</b> стане доступним, коли всі кроки буде виконано (зараз ${percent} %).</div></div>`;
}

function renderTimeline() {
  $("timeline").innerHTML = MODULES.map((m) => `
    <li><span class="timeline__week">${m.weeks}</span>
      <button class="timeline__link" data-module="${m.id}">${m.code} · ${m.title}</button>
      <span class="muted small">${fmtH(m.hours[0])} год</span></li>`).join("");
}
document.addEventListener("click", (e) => {
  const b = e.target.closest(".timeline [data-module], .mod-progress [data-module]");
  if (b) openModuleTab(b.dataset.module);
});

// =============================================================
//  МОДУЛІ
// =============================================================
function renderModules() {
  $("module-list").innerHTML = MODULES.map((m) => {
    const p = moduleProgress(m);
    return `<li><button class="module-item ${m.id === openModule ? "is-active" : ""}" data-module="${m.id}">
      <span class="module-item__code ${p.complete ? "is-done" : ""}">${p.complete ? "✓" : m.code}</span>
      <span class="module-item__text"><b>${m.title}</b><span class="muted small">${m.weeks} · ${p.n}/${p.total}</span></span>
    </button></li>`;
  }).join("");

  const m = MODULES.find((x) => x.id === openModule) || MODULES[0];
  const [total, theory, practice, self] = m.hours;
  const p = moduleProgress(m);
  const routeTip = state.route ? `<p class="tip"><b>Порада для маршруту ${ROUTES[state.route].short}:</b> ${ROUTES[state.route].tip}</p>` : "";

  const hoursRow = [
    theory ? `теорія ${fmtH(theory)} год` : "",
    practice ? `практика ${fmtH(practice)} год` : "",
    self ? `самостійно ${fmtH(self)} год` : ""
  ].filter(Boolean).join(" · ");

  // Кроки
  const stepsHtml = m.steps.map((s, i) => {
    const key = stepKey(m, i);
    const body = s.list
      ? `<ul class="step__list">${s.list.map((li) => `<li>${li}</li>`).join("")}</ul>`
      : `<p class="muted">${s.text}</p>`;
    const action = s.action === "test" ? `<button class="btn btn--small" data-go="test">Відкрити тест</button>`
      : s.link ? `<button class="btn btn--small btn--ghost" data-go="${s.link}">Відкрити ресурси</button>` : "";
    return `<li class="step ${state.done[key] ? "is-done" : ""}">
      <div class="step__head">
        <span class="badge badge--${s.type}">${TYPE_LABEL[s.type]}</span>
        <span class="muted small">${s.time}</span>
      </div>
      <h3>${s.title}</h3>
      ${body}
      <div class="step__foot">
        <label class="check"><input type="checkbox" data-step="${key}" ${state.done[key] ? "checked" : ""}> Виконано</label>
        ${action}
      </div>
    </li>`;
  }).join("");

  // Завдання за маршрутами
  let routeHtml = "";
  if (m.routeTasks) {
    const r = viewRoute || state.route || "A";
    const t = m.routeTasks[r];
    routeHtml = `<details class="sec" open><summary>Завдання для вашого маршруту</summary>
      <div class="route-tabs route-tabs--small">
        ${["A", "B", "C"].map((id) => `<button class="route-tab ${id === r ? "is-active" : ""}" data-mroute="${id}">${ROUTES[id].short}${id === state.route ? " ★" : ""}</button>`).join("")}
      </div>
      <div class="route-task route-task--${r}">
        <b>Картка ${ROUTES[r].short.split(" ")[0]} · ${t.title}</b>
        <ol>${t.items.map((x) => `<li>${x}</li>`).join("")}</ol>
      </div>
      ${!state.route ? `<p class="muted small">Ваш маршрут ще не визначено. <a href="#test" data-go="test">Пройдіть тест</a>, і тут одразу відкриється ваша картка.</p>` : ""}
    </details>`;
  }

  // Самоперевірка
  let checkHtml = "";
  if (m.check && m.check.quiz) {
    const saved = state.quiz[m.id];
    checkHtml = `<details class="sec" open><summary>Самоперевірка</summary>
      <form class="mini-quiz" id="mini-quiz" data-module="${m.id}">
        ${m.check.quiz.map((q, i) => `<fieldset class="question question--small">
          <legend><span class="question__num">${i + 1}.</span>${q.q}</legend>
          ${q.a.map((a, j) => {
            const picked = saved && saved.answers[i] === j;
            const mark = saved ? (j === q.correct ? "is-right" : picked ? "is-wrong" : "") : "";
            return `<label class="option ${mark}"><input type="radio" name="mq${i}" value="${j}" ${picked ? "checked" : ""}><span>${a}</span></label>`;
          }).join("")}
        </fieldset>`).join("")}
        <button class="btn" type="submit">Перевірити</button>
        ${saved ? `<p class="quiz-score ${saved.score >= 5 ? "ok" : ""}">Результат: ${saved.score} з ${m.check.quiz.length}. ${saved.score >= 5 ? "Модуль зараховано ✓" : "Перегляньте матеріал ще раз і спробуйте знову."}</p>` : ""}
      </form>
    </details>`;
  } else if (m.check && m.check.list) {
    checkHtml = `<details class="sec" open><summary>${m.check.title || "Самоперевірка: чи готовий ваш продукт"}</summary>
      <div class="checklist">${m.check.list.map((c, i) => {
        const k = m.id + "-c" + i;
        return `<label class="check check--top"><input type="checkbox" data-check="${k}" ${state.checks[k] ? "checked" : ""}> <span>${c}</span></label>`;
      }).join("")}</div>
    </details>`;
  }

  $("module-detail").innerHTML = `
    <span class="label">${m.code} · ${m.weeks} · ${fmtH(total)} год</span>
    <h2>${m.title}</h2>
    <p class="lead">${m.goal}</p>
    <div class="meta-row">
      <span class="pill">${hoursRow}</span>
      <span class="pill ${p.complete ? "pill--ok" : ""}">Виконано ${p.n} з ${p.total}</span>
    </div>
    ${routeTip}

    <div class="two-col">
      <div class="box"><span class="label">Після модуля ви</span>
        <ul class="ticks">${m.outcomes.map((o) => `<li>${o}</li>`).join("")}</ul></div>
      <div class="box"><span class="label">Ключові теми</span>
        <ul class="dots">${m.topics.map((t) => `<li>${t}</li>`).join("")}</ul></div>
    </div>

    <details class="sec" open><summary>Як проходить модуль</summary>
      <ol class="steps">${stepsHtml}</ol>
    </details>

    ${routeHtml}

    <details class="sec"><summary>Інструменти</summary>
      <div class="chips">${m.tools.map((t) => `<span class="chip chip--static">${t}</span>`).join("")}</div>
      <p class="muted small">Посилання на інструменти — у розділі <a href="#resources" data-go="resources">«Ресурси»</a>.</p>
    </details>

    <div class="result-box">
      <span class="label">Що у вас буде після модуля</span><b>${m.product}</b>
      <span class="muted small">Як оцінюється: ${m.control}</span>
    </div>

    ${checkHtml}

    <div class="module-nav">
      ${MODULES.indexOf(m) > 0 ? `<button class="btn btn--ghost btn--small" data-module-nav="${MODULES[MODULES.indexOf(m) - 1].id}">← ${MODULES[MODULES.indexOf(m) - 1].code}</button>` : "<span></span>"}
      ${MODULES.indexOf(m) < MODULES.length - 1 ? `<button class="btn btn--small" data-module-nav="${MODULES[MODULES.indexOf(m) + 1].id}">${MODULES[MODULES.indexOf(m) + 1].code} →</button>` : ""}
    </div>`;
}

$("module-list").addEventListener("click", (e) => {
  const b = e.target.closest("[data-module]");
  if (!b) return;
  openModule = b.dataset.module;
  local.set("course-open", openModule);
  viewRoute = null;
  renderModules();
  if (window.innerWidth < 860) $("module-detail").scrollIntoView({ behavior: "smooth" });
});

$("module-detail").addEventListener("click", (e) => {
  const r = e.target.closest("[data-mroute]");
  if (r) { viewRoute = r.dataset.mroute; renderModules(); return; }
  const n = e.target.closest("[data-module-nav]");
  if (n) { openModule = n.dataset.moduleNav; local.set("course-open", openModule); viewRoute = null; renderModules(); $("module-detail").scrollIntoView({ behavior: "smooth" }); }
});

$("module-detail").addEventListener("change", (e) => {
  const key = e.target.dataset.step;
  const chk = e.target.dataset.check;
  if (key) update(() => { if (e.target.checked) state.done[key] = true; else delete state.done[key]; });
  if (chk) update(() => { if (e.target.checked) state.checks[chk] = true; else delete state.checks[chk]; });
});

$("module-detail").addEventListener("submit", (e) => {
  if (e.target.id !== "mini-quiz") return;
  e.preventDefault();
  const m = MODULES.find((x) => x.id === e.target.dataset.module);
  const data = new FormData(e.target);
  const answers = m.check.quiz.map((q, i) => data.get("mq" + i) === null ? null : Number(data.get("mq" + i)));
  if (answers.includes(null)) { toast("Дайте відповідь на всі питання"); return; }
  const score = answers.filter((a, i) => a === m.check.quiz[i].correct).length;
  update(() => {
    state.quiz[m.id] = { answers, score };
    const idx = m.steps.findIndex((s) => s.title === "Самоперевірка");
    if (idx >= 0 && score >= 5) state.done[stepKey(m, idx)] = true;
  });
});

// =============================================================
//  МАРШРУТИ
// =============================================================
let shownRoute = "B";
function showRoute(id) {
  shownRoute = id;
  const r = ROUTES[id];
  $("route-score").textContent = r.score;
  $("route-name").textContent = r.name;
  $("route-who").textContent = r.who;
  $("route-tasks").textContent = r.tasks;
  $("route-support").textContent = r.support;
  $("route-role").textContent = r.role;
  const mine = state.route === id;
  $("route-choose").textContent = mine ? "Це ваш маршрут ✓" : "Обрати цей маршрут";
  $("route-choose").disabled = mine;
  document.querySelectorAll("#panel-routes .route-tab").forEach((t) => t.classList.toggle("is-active", t.dataset.route === id));
}
document.querySelectorAll("#panel-routes .route-tab").forEach((t) => t.addEventListener("click", () => showRoute(t.dataset.route)));
$("route-choose").addEventListener("click", () => {
  update(() => { state.route = shownRoute; });
  toast("Маршрут змінено: " + ROUTES[shownRoute].short);
});

// =============================================================
//  ТЕСТ
// =============================================================
const form = $("test-form");
const letters = ["а", "б", "в", "г"];

form.innerHTML = QUESTIONS.map((item, i) => `
  <fieldset class="question">
    <legend><span class="question__num">${i + 1}.</span>${item.q}</legend>
    ${item.a.map((text, j) => `
      <label class="option"><input type="radio" name="q${i}" value="${j}"><span>${letters[j]}) ${text}</span></label>`).join("")}
  </fieldset>`).join("");

form.addEventListener("change", () => {
  const answered = Array.from(new FormData(form).keys()).length;
  $("test-bar").style.width = (answered / QUESTIONS.length) * 100 + "%";
  $("test-progress").textContent = `Відповідей: ${answered} з ${QUESTIONS.length}`;
  $("test-submit").disabled = answered < QUESTIONS.length;
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(form);
  let score = 0;
  const mistakes = [];
  QUESTIONS.forEach((item, i) => {
    if (Number(data.get("q" + i)) === item.correct) score++;
    else mistakes.push(`<li><b>${item.q}</b><br>Правильно: ${item.a[item.correct]}</li>`);
  });

  const final = inFinalStage();   // перед «Галереєю проєктів» тест — вихідна діагностика
  update(() => {
    if (final) {
      state.finalScore = score;
      state.done["m6-1"] = true;
    } else {
      state.score = score;
      state.route = score <= 4 ? "A" : score <= 8 ? "B" : "C";
      state.done["m0-1"] = true;
    }
  });

  const r = ROUTES[state.route];
  $("test-result").innerHTML = final
    ? `<div class="result__score">${score} / ${QUESTIONS.length}</div>
       <h2>Вихідна діагностика</h2>
       <p class="muted">На початку курсу: ${state.score ?? "—"} з 12. Зараз: ${score} з 12.</p>
       ${mistakes.length ? `<h3>Варто повторити</h3><ul class="mistakes">${mistakes.join("")}</ul>` : "<p>Усі відповіді правильні!</p>"}
       <div class="result__buttons"><button class="btn" data-go="home">До мого курсу</button></div>`
    : `<div class="result__score">${score} / ${QUESTIONS.length}</div>
       <h2>${r.name}</h2>
       <p class="muted">${r.who} Викладач перегляне результат і підтвердить маршрут.</p>
       ${mistakes.length ? `<h3>Варто повторити</h3><ul class="mistakes">${mistakes.join("")}</ul>` : "<p>Усі відповіді правильні!</p>"}
       <div class="result__buttons">
         <button class="btn" data-go="modules">До модулів</button>
         <button class="btn btn--ghost" data-go="home">На головну</button>
       </div>`;
  $("test-result").hidden = false;
  $("test-result").scrollIntoView({ behavior: "smooth" });
});

function renderTestLead() {
  $("test-lead").textContent = inFinalStage()
    ? "Вихідна діагностика: ті самі 12 питань, що й на початку. Порівняємо, що змінилося."
    : "12 коротких питань, близько 10 хвилин. Це не оцінка: тест лише допомагає підібрати ваш маршрут.";
}

// =============================================================
//  РЕСУРСИ
// =============================================================
function renderResources() {
  $("resources").innerHTML = `
    <section class="res" id="res-traffic">
      <h2 class="section-title">Пам'ятка «Світлофор ШІ»</h2>
      <div class="traffic">
        <div class="traffic__col traffic__col--green"><b>🟢 Можна</b><ul>${TRAFFIC.green.map((x) => `<li>${x}</li>`).join("")}</ul></div>
        <div class="traffic__col traffic__col--yellow"><b>🟡 Обережно: лише після перевірки</b><ul>${TRAFFIC.yellow.map((x) => `<li>${x}</li>`).join("")}</ul></div>
        <div class="traffic__col traffic__col--red"><b>🔴 Не можна</b><ul>${TRAFFIC.red.map((x) => `<li>${x}</li>`).join("")}</ul></div>
      </div>
      <p class="tip"><b>Головне правило:</b> довіряй, але перевіряй. Жоден матеріал від ШІ не потрапляє до учнів без перевірки педагогом.</p>
    </section>

    <section class="res" id="res-prompt">
      <h2 class="section-title">Як скласти якісний запит</h2>
      <div class="formula">
        ${[["Роль", "ким має бути ШІ?"], ["Контекст", "для кого?"], ["Завдання", "що створити?"], ["Формат", "як подати?"], ["Критерії", "що обов'язково?"]]
          .map(([a, b], i) => `<div class="formula__item"><span>${i + 1}</span><b>${a}</b><small>${b}</small></div>`).join("")}
      </div>
      <h3 class="sub">Готові запити — скопіюйте і замініть слова в [дужках]</h3>
      <div class="prompts">
        ${PROMPTS.map((p, i) => `<div class="prompt"><div class="prompt__head"><b>${p.title}</b>
          <button class="btn btn--small btn--ghost" data-copy="${i}">Копіювати</button></div><p>${p.text}</p></div>`).join("")}
      </div>
      <h3 class="sub">Фрази-підсилювачі</h3>
      <ul class="boosters">${BOOSTERS.map(([a, b]) => `<li><b>${a}</b> — ${b}</li>`).join("")}</ul>
    </section>

    <section class="res" id="res-errors">
      <h2 class="section-title">6 типів помилок ШІ</h2>
      <div class="errors">${ERROR_TYPES.map(([t, w, h], i) => `<div class="err"><span class="err__n">${i + 1}</span><b>${t}</b><p class="muted">${w}</p><p><b>Перевірка:</b> ${h}</p></div>`).join("")}</div>
      <p class="tip"><b>Як запобігти:</b> у запиті вказуйте клас і рівень, просіть розв'язання і джерела, забороняйте вигадувати факти. Результат завжди перевіряйте за чек-листом. Детектори ШІ-тексту помиляються, тому не можуть бути єдиним доказом.</p>
    </section>

    <section class="res" id="res-agreement">
      <h2 class="section-title">Шаблон «Домовленість з класом про використання ШІ»</h2>
      <div class="agreement">${AGREEMENT.map(([a, b]) => `<div><b>${a}</b><p class="muted">${b}</p></div>`).join("")}</div>
    </section>

    <section class="res" id="res-tools">
      <h2 class="section-title">Яким інструментом зробити</h2>
      <div class="tools">${TOOLS.map(([task, name, url]) => `<a class="tool" href="${url}" target="_blank" rel="noopener"><span class="muted small">${task}</span><b>${name} ↗</b></a>`).join("")}</div>
      <h3 class="sub">П'ять запитань перед вибором інструмента</h3>
      <ol class="boosters">
        <li>Для якої задачі? (текст, зображення, відео, вправа)</li>
        <li>Чи впорається те, що в мене вже є?</li>
        <li>Чи є безкоштовна версія і які в неї обмеження?</li>
        <li>Чи коректно працює українська — і в запиті, і в результаті?</li>
        <li>Чи можна давати учням (вік, захист даних)?</li>
      </ol>
    </section>`;
}
document.addEventListener("click", (e) => {
  const c = e.target.closest("[data-copy]");
  if (!c) return;
  const text = PROMPTS[Number(c.dataset.copy)].text;
  (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject())
    .then(() => toast("Запит скопійовано"))
    .catch(() => toast("Не вдалося скопіювати: виділіть текст вручну"));
});
document.addEventListener("click", (e) => {
  const a = e.target.closest(".res-nav a");
  if (!a) return;
  e.preventDefault();
  $(a.getAttribute("href").slice(1)).scrollIntoView({ behavior: "smooth" });
});

// =============================================================
//  СЛОВНИЧОК
// =============================================================
function renderGlossary(filter = "") {
  const f = filter.trim().toLowerCase();
  const items = GLOSSARY.filter(([t, d]) => !f || t.toLowerCase().includes(f) || d.toLowerCase().includes(f));
  $("glossary").innerHTML = items.length
    ? items.map(([t, d]) => `<details class="term"><summary>${t}</summary><p>${d}</p></details>`).join("")
    : `<p class="muted">Нічого не знайдено. Спробуйте інше слово.</p>`;
}
$("help-search").addEventListener("input", (e) => renderGlossary(e.target.value));

// =============================================================
//  ДОПОМОГА: контакти, відгук, FAQ
// =============================================================
function renderHelp() {
  const S = window.SITE;
  $("contacts").innerHTML = `
    <span class="label">Зв'язатися з викладачем</span>
    <b class="next">${esc(S.leader)}</b>
    <p><a href="mailto:${esc(S.email)}">✉️ ${esc(S.email)}</a></p>
    <p class="muted"><b>Консультації:</b> ${esc(S.consultations)}</p>
    ${S.chatLink ? `<a class="btn btn--small btn--ghost" href="${esc(S.chatLink)}" target="_blank" rel="noopener">💬 ${esc(S.chatName)}</a>` : ""}
    <p class="muted small">Відповідаємо протягом 1–2 робочих днів.</p>`;
  const fb = $("feedback-btn");
  fb.href = S.feedbackForm || `mailto:${S.email}?subject=${encodeURIComponent("Відгук про курс")}`;
  $("faq").innerHTML = FAQ.map(([q, a]) => `<details class="term"><summary>${q}</summary><p>${a}</p></details>`).join("");
  $("footer-left").textContent = `Курс розробила ${S.leader}` + (S.startDate ? ` · Старт: ${S.startDate}` : "");
}

// =============================================================
//  СВІДОЦТВО
// =============================================================
function renderCertificate() {
  const box = $("certificate");
  if (!courseComplete()) {
    const p = Math.round(allSteps().filter((s) => state.done[s.key]).length / allSteps().length * 100);
    box.innerHTML = `<div class="narrow"><h1 class="page-title">Свідоцтво</h1>
      <p class="page-lead">Свідоцтво стане доступним, коли всі кроки курсу буде позначено як виконані. Зараз виконано ${p} %.</p>
      <button class="btn" data-go="modules">До модулів</button></div>`;
    return;
  }
  const date = new Date(state.completedAt || Date.now()).toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" });
  box.innerHTML = `
    <div class="cert-tools no-print">
      ${!state.name ? `<label class="field">Ваше ім'я та прізвище для свідоцтва<input type="text" id="cert-name" maxlength="80"></label>` : ""}
      <button class="btn" onclick="window.print()">Роздрукувати або зберегти PDF</button>
    </div>
    <div class="cert">
      <div class="cert__mark">ШІ</div>
      <p class="cert__kind">Свідоцтво</p>
      <p class="cert__small">засвідчує, що</p>
      <p class="cert__name" id="cert-name-out">${esc(state.name) || "&nbsp;"}</p>
      <p class="cert__small">успішно завершив(ла) навчання за програмою курсу</p>
      <p class="cert__course">«${esc(window.SITE.courseName)}»</p>
      <p class="cert__small">обсягом 30 годин (1 кредит ЄКТС)${state.route ? `, маршрут ${ROUTES[state.route].short.split(" ")[0]}` : ""}</p>
      <div class="cert__badges">${MODULES.map((m) => `<span title="${BADGES[m.id].name}">${BADGES[m.id].icon}</span>`).join("")}</div>
      <div class="cert__foot"><span>Ведуча курсу: ${esc(window.SITE.leader)}</span><span>${date}</span></div>
    </div>`;
  const inp = $("cert-name");
  if (inp) inp.addEventListener("input", () => { $("cert-name-out").textContent = inp.value || " "; });
}

// =============================================================
//  АКАУНТ: зв'язок з auth.js
// =============================================================
function renderAccount() {
  const enabled = window.Cloud && window.Cloud.enabled;
  $("auth-off").hidden = enabled !== false;
  $("auth-forms").hidden = !!user || enabled === false;
  $("profile").hidden = !user;
  const label = user ? ((state.name || "").trim().split(/\s+/)[0] || "Кабінет") : "Увійти";
  $("account-label").textContent = label;
  $("account-avatar").textContent = user ? (state.name || user.email || "?").trim()[0].toUpperCase() : "?";
  $("account-btn").classList.toggle("is-in", !!user);
  if (user) {
    $("profile-email").value = user.email || "";
    const f = $("form-profile");
    if (document.activeElement.form !== f) { f.name.value = state.name || ""; f.subject.value = state.subject || ""; }
  }
}

document.querySelectorAll("[data-auth]").forEach((b) => b.addEventListener("click", () => {
  document.querySelectorAll("[data-auth]").forEach((x) => x.classList.toggle("is-active", x === b));
  $("form-login").hidden = b.dataset.auth !== "login";
  $("form-register").hidden = b.dataset.auth !== "register";
  authMsg("");
}));

function authMsg(text, ok) {
  $("auth-msg").textContent = text;
  $("auth-msg").classList.toggle("ok", !!ok);
}

function cloudReady() {
  if (window.Cloud && window.Cloud.enabled) return true;
  authMsg("Реєстрація тимчасово недоступна. Спробуйте пізніше або напишіть викладачу.");
  return false;
}

function busy(formEl, on) { formEl.querySelectorAll("button").forEach((b) => { b.disabled = on; }); }

$("form-login").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target;
  if (!cloudReady()) return;
  busy(f, true); authMsg("Входимо…", true);
  try { await window.Cloud.login(f.email.value.trim(), f.password.value); authMsg(""); f.reset(); showTab("home"); }
  catch (err) { authMsg(window.Cloud.errorText(err)); }
  busy(f, false);
});

$("form-register").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target;
  if (!cloudReady()) return;
  busy(f, true); authMsg("Створюємо акаунт…", true);
  try {
    await window.Cloud.register({ name: f.name.value.trim(), subject: f.subject.value.trim(), email: f.email.value.trim(), password: f.password.value });
    authMsg(""); f.reset(); showTab("home");
    toast("Акаунт створено. Ласкаво просимо!");
  } catch (err) { authMsg(window.Cloud.errorText(err)); }
  busy(f, false);
});

$("forgot-btn").addEventListener("click", async () => {
  const email = $("form-login").email.value.trim();
  if (!cloudReady()) return;
  if (!email) { authMsg("Введіть email у поле вище, і ми надішлемо посилання для зміни пароля."); return; }
  try { await window.Cloud.reset(email); authMsg("Лист для зміни пароля надіслано. Перевірте пошту (і папку «Спам»).", true); }
  catch (err) { authMsg(window.Cloud.errorText(err)); }
});

$("form-profile").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = e.target;
  update(() => { state.name = f.name.value.trim(); state.subject = f.subject.value.trim(); });
  $("profile-msg").textContent = "Збережено ✓";
  setTimeout(() => { $("profile-msg").textContent = ""; }, 2500);
});

$("logout-btn").addEventListener("click", async () => {
  await window.Cloud.logout();
  showTab("home");
  toast("Ви вийшли з акаунта");
});

// Викликає auth.js, коли користувач увійшов або вийшов
window.App = {
  // cloud — дані з хмари (або null, якщо акаунт новий)
  onAuth(u, cloud, profile) {
    user = u;
    if (u) {
      if (cloud) {
        state = { ...emptyState(), ...cloud };
      } else {
        // новий акаунт: забираємо прогрес, зроблений без входу
        state = { ...emptyState(), ...loadGuest(), ...(profile || {}) };
        save();
      }
    } else {
      state = loadGuest();
    }
    renderAll();
  },
  cached(uid) { return local.get("course-state-" + uid); },
  saveError(text) { toast("⚠️ " + text); },
  setCloudStatus() { renderAccount(); renderDashboard(); }
};

// =============================================================
//  ЗАПУСК
// =============================================================
function renderAll() {
  renderDashboard();
  renderModules();
  renderAccount();
  renderTestLead();
  showRoute(state.route || shownRoute);
}
renderTimeline();
renderGlossary();
renderResources();
renderHelp();
renderAll();
showTab(location.hash.slice(1) || "home");
