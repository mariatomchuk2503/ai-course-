// =============================================================
//  ДАНІ КУРСУ
//  Щоб змінити текст на сайті — правте його тут.
// =============================================================

// ----- Маршрути -----
const ROUTES = {
  A: {
    short: "А · Починаю",
    score: "0–4 бали в тесті",
    name: "Маршрут А — «Починаю»",
    who: "Для тих, хто тільки знайомиться з ШІ або пробував його кілька разів.",
    tasks: "Прості: одну тему розглядаємо з погляду кількох предметів.",
    support: "Багато: готові шаблони запитів і покрокові інструкції.",
    role: "Учасник команди з чіткою невеликою частиною роботи.",
    tip: "Беріть готові шаблони запитів і змінюйте в них лише тему та клас."
  },
  B: {
    short: "Б · Вже пробую",
    score: "5–8 балів у тесті",
    name: "Маршрут Б — «Вже пробую»",
    who: "Для тих, хто вже користується ШІ, але поки без системи.",
    tasks: "Середні: прийом з одного предмета допомагає розв'язати задачу іншого.",
    support: "Помірно: шаблони-підказки, які ви доповнюєте самі.",
    role: "Відповідаєте за свою частину проєкту.",
    tip: "Доповнюйте шаблони своїм контекстом: рівень групи, мета, формат."
  },
  C: {
    short: "В · Впевнено користуюсь",
    score: "9–12 балів у тесті",
    name: "Маршрут В — «Впевнено користуюсь»",
    who: "Для тих, хто впевнено працює з ШІ й готовий допомагати колегам.",
    tasks: "Складні: реальна життєва проблема, де предмети працюють разом.",
    support: "Мінімум: лише вимоги до результату, решту вирішуєте самі.",
    role: "Лідер команди: організовуєте роботу і допомагаєте колегам.",
    tip: "Складайте власні запити, діліться ними в банку запитів курсу."
  }
};

// ----- Модулі: кожен містить кроки (зустрічі, завдання, результат) -----
// type: "meet" — зустріч у Zoom, "self" — самостійно, "consult" — консультація, "live" — очна зустріч
const MODULES = [
  {
    id: "m0", code: "М0", title: "Знайомство і тест", weeks: "Тиждень 1", hours: 1,
    goal: "Дізнатися, з чого ви починаєте, і підібрати ваш маршрут.",
    result: "Ваш маршрут А, Б або В",
    steps: [
      { type: "self", title: "Коротка анкета", time: "10 хв", text: "Кілька питань про ваш досвід, предмети і те, чого хочете навчитися." },
      { type: "self", title: "Вхідний тест", time: "10 хв", text: "12 питань про ШІ. Це не оцінка — тест лише підбирає маршрут.", action: "test" },
      { type: "self", title: "«Мій ШІ-портрет»", time: "20 хв", text: "Три записи на спільній дошці Padlet: що ви вже знаєте про ШІ, що вас непокоїть і чого чекаєте від курсу." }
    ]
  },
  {
    id: "m1", code: "М1", title: "Як думає машина", weeks: "Тижні 1–2", hours: 4,
    goal: "Зрозуміти, як ШІ створює відповіді, чому помиляється і як ним користуватися безпечно.",
    result: "Пам'ятка «Світлофор ШІ» для вашого закладу",
    steps: [
      { type: "meet", title: "Зустріч «Як думає машина»", time: "45 хв", list: [
        "Вправа на настрій і знайомство",
        "Гра Quick, Draw!: бачимо, як ШІ вчиться впізнавати малюнки",
        "Обговорюємо: чому ШІ вгадав одне і не вгадав інше",
        "Просто про головне: як ШІ складає текст, що таке «галюцинації» і упередженість",
        "Робочий аркуш «Перевірка здорового глузду»: ставимо ШІ каверзні питання"
      ]},
      { type: "consult", title: "Консультація «Запитання — відповіді»", time: "Тиждень 2", text: "Розбираємо все, що залишилось незрозумілим." },
      { type: "self", title: "Пам'ятка «Світлофор ШІ»", time: "1,5 год", text: "Зелене — можна сміливо (ідеї, чернетки), жовте — тільки після перевірки (факти, цифри), червоне — не можна (персональні дані учнів)." },
      { type: "self", title: "Самоперевірка", time: "15 хв", text: "6 коротких питань, щоб переконатися, що все зрозуміло." }
    ]
  },
  {
    id: "m2", code: "М2", title: "Створюємо матеріали з ШІ", weeks: "Тижні 3–4", hours: 6,
    goal: "Навчитися писати хороші запити і робити з ШІ завдання різного рівня та наочність.",
    result: "Набір завдань трьох рівнів з вашої теми + картинка чи схема до нього",
    steps: [
      { type: "meet", title: "Зустріч «Від поганого запиту до хорошого»", time: "45 хв", list: [
        "Пишемо короткий запит «Склади 5 задач з теми…» і дивимось, що вийшло",
        "Шукаємо, чого бракує у відповіді",
        "Формула хорошого запиту: роль → контекст → завдання → формат → критерії",
        "У парах з колегою іншого предмета переписуємо запит",
        "2–3 пари показують свої «до» і «після»"
      ]},
      { type: "meet", title: "Зустріч «Наочність за 15 хвилин»", time: "45 хв", list: [
        "Один запит — три різні генератори зображень: порівнюємо",
        "Як описати картинку, щоб ШІ зрозумів",
        "Робота на станціях: створюємо наочність до своєї теми",
        "Викладаємо роботи на спільну дошку"
      ]},
      { type: "self", title: "Завдання трьох рівнів", time: "2 год", text: "Візьміть свою тему і зробіть з ШІ завдання для слабших, середніх і сильніших учнів. Адаптуйте одне завдання для учнів з особливими освітніми потребами." },
      { type: "self", title: "Наочність до теми", time: "2 год", text: "Зробіть картинку, схему чи інфографіку до своїх завдань." }
    ]
  },
  {
    id: "m3", code: "М3", title: "Перевіряємо ШІ", weeks: "Тиждень 5", hours: 4,
    goal: "Звикнути перевіряти все, що видає ШІ, і домовитися з учнями про чесне використання ШІ.",
    result: "Чек-лист перевірки + правила роботи з ШІ для вашої групи",
    steps: [
      { type: "meet", title: "Зустріч «Знайди помилку»", time: "45 хв", list: [
        "Вправа «Помилка, яка мене навчила»",
        "Набір А: тексти від ШІ, у яких сховані помилки, — шукаємо",
        "6 типів помилок ШІ і як кожну перевірити",
        "Тренуємось на картках",
        "Набір Б: перевіряємо себе ще раз — помилок знаходимо більше"
      ]},
      { type: "consult", title: "Консультація", time: "1 год", text: "Розбираємо складні випадки з вашої практики." },
      { type: "self", title: "Чек-лист перевірки", time: "1 год", text: "Короткий список: що перевірити, перш ніж давати матеріал від ШІ учням." },
      { type: "self", title: "Домовленість з учнями", time: "1 год", text: "Прості правила для вашої групи: коли можна користуватися ШІ і як про це чесно сказати." }
    ]
  },
  {
    id: "m4", code: "М4", title: "Міжпредметний міст", weeks: "Тиждень 6", hours: 5,
    goal: "Знайти з ШІ, як ваша тема пов'язана з іншими предметами, і зробити з цього завдання.",
    result: "Карта зв'язків вашої теми + одне міжпредметне завдання",
    steps: [
      { type: "meet", title: "Зустріч «Міжпредметний міст»", time: "45 хв", list: [
        "Вправа «Павутина»: як усе пов'язане",
        "Завдання «Міжпредметний міст»: шукаємо з ШІ, де ваша тема перетинається з іншими",
        "Які зв'язки справжні, а які притягнуті за вуха",
        "Три рівні: поруч, разом, у реальній проблемі — на прикладах",
        "Збираємо команди для проєкту"
      ]},
      { type: "consult", title: "Консультація", time: "1 год", text: "Допомога командам з вибором теми." },
      { type: "self", title: "Карта зв'язків і завдання", time: "3 год, у команді", text: "Разом з колегами інших предметів малюєте карту зв'язків теми і складаєте міжпредметне завдання." }
    ]
  },
  {
    id: "m5", code: "М5", title: "Проєкт у команді", weeks: "Тижні 7–9", hours: 8,
    goal: "У команді з колегами створити міжпредметне заняття чи проєкт для своїх учнів.",
    result: "Готовий сценарій заняття або проєкту",
    steps: [
      { type: "meet", title: "Зустріч «Студія проєктів»", time: "45 хв", list: [
        "Вправа «Подяка колезі»",
        "5 форматів на вибір: урок, квест чи кейс, ШІ-помічник для учнів, подкаст чи відео, STEM-проєкт",
        "Команди обирають формат",
        "«Ліфтова презентація»: 2 хвилини про ідею",
        "Консультації з кожною командою"
      ]},
      { type: "consult", title: "Тиждень 8: проміжний звіт", time: "Консультація", text: "Показуєте, що вже зроблено, і отримуєте поради." },
      { type: "self", title: "Тиждень 9: готовий продукт", time: "6 год, у команді", text: "Доводите проєкт до кінця і оцінюєте роботи інших команд." }
    ]
  },
  {
    id: "m6", code: "М6", title: "Галерея проєктів", weeks: "Тиждень 10", hours: 2,
    goal: "Показати свій проєкт, побачити свій прогрес і вирішити, що робити далі.",
    result: "Захищений проєкт, особистий план і сертифікат",
    steps: [
      { type: "live", title: "Очна зустріч «Галерея проєктів»", time: "2 год", list: [
        "Вправа «Моя зона стійкості»",
        "Кожна команда: до 7 хвилин презентації і 3 хвилини запитань",
        "Повторний тест — порівнюємо з початком",
        "«Повернення до портрета»: що змінилось від першого тижня",
        "Особистий план: що вже застосовую, що застосую далі",
        "Сертифікати"
      ]}
    ]
  }
];

// ----- Питання тесту (correct — номер правильної відповіді, рахуємо з 0) -----
const QUESTIONS = [
  { q: "Як працює ШІ-чат, коли пише відповідь?",
    a: ["Шукає готову відповідь в інтернеті", "Підбирає найімовірніші наступні слова на основі текстів, на яких навчався", "Розуміє тему так само, як людина", "Спершу перевіряє факти, потім відповідає"], correct: 1 },
  { q: "Що таке «галюцинація» ШІ?",
    a: ["Збій програми", "Відповідь, яка звучить правдиво, але насправді вигадана", "Відмова відповідати", "Надто довга відповідь"], correct: 1 },
  { q: "Чому на те саме питання ШІ може відповісти по-різному?",
    a: ["Бо відповідь щоразу складається наново, з елементом випадковості", "Бо ШІ втомлюється", "Це завжди означає помилку", "Бо відповідь залежить від часу доби"], correct: 0 },
  { q: "Який запит дасть найкращі завдання?",
    a: ["«Склади завдання з електротехніки»",
        "«Ти методист. Склади 5 задач з електротехніки для 2 курсу (електромонтаж), середній рівень, з розв'язками та критеріями оцінювання»",
        "«Електротехніка, задачі, швидко»",
        "«Придумай щось цікаве для студентів»"], correct: 1 },
  { q: "Відповідь ШІ вам не підійшла. Що краще зробити?",
    a: ["Взяти як є", "Вирішити, що ШІ не годиться", "Уточнити запит: додати подробиці, приклад, бажаний вигляд відповіді", "Кілька разів надіслати той самий запит"], correct: 2 },
  { q: "Що найбільше допоможе ШІ зробити матеріал саме для вашої групи?",
    a: ["Рівень групи, мета заняття і яким має бути результат", "Лише тема", "Лише обсяг тексту", "Нічого додавати не треба"], correct: 0 },
  { q: "ШІ послався на наукову статтю. Що робите?",
    a: ["Використовую як є", "Перевіряю, чи така стаття існує і чи там справді це написано", "Довіряю, якщо звучить солідно", "Прошу ШІ підтвердити, що стаття справжня"], correct: 1 },
  { q: "Як перевірити задачу з розрахунками, яку склав ШІ?",
    a: ["Довіритися — ШІ добре рахує", "Розв'язати самому або звірити з надійним джерелом", "Спитати той самий ШІ, чи все правильно", "Прості задачі перевіряти не треба"], correct: 1 },
  { q: "Чи може ШІ бути упередженим?",
    a: ["Ні, ніколи", "Так, бо він учився на текстах, де бувають стереотипи", "Лише в безкоштовних версіях", "Лише в політичних темах"], correct: 1 },
  { q: "Що не можна вводити в публічний ШІ-сервіс?",
    a: ["Тему заняття", "Загальні питання про методику", "Персональні дані учнів: прізвища, оцінки, характеристики", "Прохання дати ідеї для вправи"], correct: 2 },
  { q: "Учень здав роботу, повністю написану ШІ, як свою. Що доречніше?",
    a: ["Нічого — ШІ можна всім", "Одразу поставити 0 без розмови", "Звіритися з правилами закладу, поговорити з учнем і домовитися чесно вказувати ШІ", "Перевірити детектором і на цьому вирішити"], correct: 2 },
  { q: "Чи можна покладатися на детектори ШІ-тексту?",
    a: ["Так, вони не помиляються", "Ні, вони часто помиляються, тож не можуть бути єдиним доказом", "Так, для коротких текстів", "Так, але лише для англійської"], correct: 1 }
];

// ----- Словничок -----
const GLOSSARY = [
  ["ШІ (штучний інтелект)", "Програми, які вміють робити те, для чого зазвичай потрібна людина: писати тексти, розпізнавати картинки, відповідати на питання."],
  ["Запит (промпт)", "Те, що ви пишете ШІ. Чим більше подробиць (для кого, навіщо, у якому вигляді), тим краща відповідь."],
  ["Формула хорошого запиту", "Роль → контекст → завдання → формат → критерії. Наприклад: «Ти вчитель фізики. Група 2 курсу, слабкий рівень. Склади 5 задач. Таблицею. З відповідями»."],
  ["Галюцинація", "Коли ШІ впевнено пише неправду: вигадує факти, цифри чи джерела. Тому все важливе треба перевіряти."],
  ["Упередженість", "ШІ може повторювати стереотипи, бо вчився на текстах людей, у яких вони трапляються."],
  ["Маршрут", "Ваш шлях курсом: А, Б або В. Відрізняється кількістю підказок і складністю завдань, а не темами."],
  ["Світлофор ШІ", "Пам'ятка: зелене — можна сміливо, жовте — тільки після перевірки, червоне — не можна."],
  ["Міжпредметне завдання", "Завдання, для якого потрібні знання з кількох предметів одразу. Наприклад, розрахувати кошторис ремонту: математика + технологія + економіка."],
  ["СЕЕН", "Соціально-емоційне та етичне навчання. Короткі вправи на початку зустрічі, які допомагають зосередитися і зняти напругу."],
  ["Padlet", "Онлайн-дошка, на яку всі учасники можуть додавати записи й картинки."],
  ["Академічна доброчесність", "Чесність у навчанні. Щодо ШІ — це чесно казати, де і як ви ним користувалися."],
  ["Персональні дані", "Будь-що, за чим можна впізнати людину: прізвище, оцінки, фото, характеристика. У публічні ШІ-сервіси їх не вводять."]
];

const TYPE_LABEL = { meet: "Зустріч у Zoom", self: "Самостійно", consult: "Консультація", live: "Очна зустріч" };

// =============================================================
//  ЗБЕРЕЖЕННЯ В БРАУЗЕРІ (маршрут і виконані кроки)
// =============================================================
const store = {
  get(key, fallback) {
    try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); }
    catch (e) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }
};
let myRoute = store.get("course-route", null);
let done = store.get("course-done", {});            // { "m1-0": true, ... }
let openModule = store.get("course-open", "m0");

const $ = (id) => document.getElementById(id);
const allSteps = () => MODULES.flatMap((m) => m.steps.map((s, i) => ({ m, i, key: m.id + "-" + i })));

// =============================================================
//  ВКЛАДКИ
// =============================================================
const TABS = ["home", "modules", "routes", "test", "help"];

function showTab(name) {
  if (!TABS.includes(name)) name = "home";
  TABS.forEach((t) => { $("panel-" + t).hidden = t !== name; });
  document.querySelectorAll(".nav-tab").forEach((b) => {
    const on = b.dataset.tab === name;
    b.classList.toggle("is-active", on);
    b.setAttribute("aria-selected", on);
  });
  if (location.hash !== "#" + name) history.replaceState(null, "", "#" + name);
  window.scrollTo({ top: 0 });
}

document.querySelectorAll(".nav-tab").forEach((b) => b.addEventListener("click", () => showTab(b.dataset.tab)));
document.addEventListener("click", (e) => {
  const go = e.target.closest("[data-go]");
  if (go) { e.preventDefault(); showTab(go.dataset.go); }
});
window.addEventListener("hashchange", () => showTab(location.hash.slice(1)));

// =============================================================
//  МІЙ КУРС (панель на головній)
// =============================================================
function renderDashboard() {
  const steps = allSteps();
  const count = steps.filter((s) => done[s.key]).length;
  const percent = Math.round((count / steps.length) * 100);
  $("dash-progress").textContent = percent + " %";
  $("dash-bar").style.width = percent + "%";
  $("dash-progress-text").textContent = `Виконано ${count} з ${steps.length} кроків`;

  if (myRoute) {
    $("dash-route").textContent = ROUTES[myRoute].short;
    $("dash-route-text").textContent = ROUTES[myRoute].tip;
    $("dash-route-btn").textContent = "Про мій маршрут";
    $("dash-route-btn").dataset.go = "routes";
  }

  // наступний крок: перший невиконаний
  const next = steps.find((s) => !done[s.key]);
  const btn = $("dash-next-btn");
  if (!myRoute) {
    $("dash-next").textContent = "Пройти вхідний тест";
    $("dash-next-module").textContent = "Модуль М0 · 10 хвилин";
    btn.onclick = () => showTab("test");
  } else if (next) {
    $("dash-next").textContent = next.m.steps[next.i].title;
    $("dash-next-module").textContent = `${next.m.code} · ${next.m.title}`;
    btn.onclick = () => { openModule = next.m.id; store.set("course-open", openModule); renderModules(); showTab("modules"); };
  } else {
    $("dash-next").textContent = "Курс пройдено!";
    $("dash-next-module").textContent = "Вітаємо з завершенням";
    btn.onclick = () => showTab("modules");
  }
}

function renderTimeline() {
  $("timeline").innerHTML = MODULES.map((m) => `
    <li><span class="timeline__week">${m.weeks}</span>
      <button class="timeline__link" data-module="${m.id}">${m.code} · ${m.title}</button>
      <span class="muted small">${m.hours} год</span></li>`).join("");
}
$("timeline").addEventListener("click", (e) => {
  const b = e.target.closest("[data-module]");
  if (b) { openModule = b.dataset.module; store.set("course-open", openModule); renderModules(); showTab("modules"); }
});

// =============================================================
//  МОДУЛІ
// =============================================================
function moduleProgress(m) {
  const n = m.steps.filter((s, i) => done[m.id + "-" + i]).length;
  return { n, total: m.steps.length };
}

function renderModules() {
  $("module-list").innerHTML = MODULES.map((m) => {
    const p = moduleProgress(m);
    const complete = p.n === p.total;
    return `<li><button class="module-item ${m.id === openModule ? "is-active" : ""}" data-module="${m.id}">
      <span class="module-item__code ${complete ? "is-done" : ""}">${complete ? "✓" : m.code}</span>
      <span class="module-item__text"><b>${m.title}</b><span class="muted small">${m.weeks} · ${p.n}/${p.total}</span></span>
    </button></li>`;
  }).join("");

  const m = MODULES.find((x) => x.id === openModule) || MODULES[0];
  const routeTip = myRoute ? `<p class="tip"><b>Порада для маршруту ${ROUTES[myRoute].short}:</b> ${ROUTES[myRoute].tip}</p>` : "";

  $("module-detail").innerHTML = `
    <span class="label">${m.code} · ${m.weeks} · ${m.hours} год</span>
    <h2>${m.title}</h2>
    <p class="muted">${m.goal}</p>
    ${routeTip}
    <ol class="steps">
      ${m.steps.map((s, i) => {
        const key = m.id + "-" + i;
        const body = s.list
          ? `<ul class="step__list">${s.list.map((li) => `<li>${li}</li>`).join("")}</ul>`
          : `<p class="muted">${s.text}</p>`;
        const action = s.action === "test" ? `<button class="btn btn--small" data-go="test">Відкрити тест</button>` : "";
        return `<li class="step ${done[key] ? "is-done" : ""}">
          <div class="step__head">
            <span class="badge badge--${s.type}">${TYPE_LABEL[s.type]}</span>
            <span class="muted small">${s.time}</span>
          </div>
          <h3>${s.title}</h3>
          ${body}
          <div class="step__foot">
            <label class="check"><input type="checkbox" data-step="${key}" ${done[key] ? "checked" : ""}> Виконано</label>
            ${action}
          </div>
        </li>`;
      }).join("")}
    </ol>
    <div class="result-box"><span class="label">Що у вас буде після модуля</span><b>${m.result}</b></div>`;
}

$("module-list").addEventListener("click", (e) => {
  const b = e.target.closest("[data-module]");
  if (!b) return;
  openModule = b.dataset.module;
  store.set("course-open", openModule);
  renderModules();
  if (window.innerWidth < 860) $("module-detail").scrollIntoView({ behavior: "smooth" });
});

$("module-detail").addEventListener("change", (e) => {
  const key = e.target.dataset.step;
  if (!key) return;
  if (e.target.checked) done[key] = true; else delete done[key];
  store.set("course-done", done);
  renderModules();
  renderDashboard();
});

// =============================================================
//  МАРШРУТИ
// =============================================================
function showRoute(id) {
  const r = ROUTES[id];
  $("route-score").textContent = r.score;
  $("route-name").textContent = r.name;
  $("route-who").textContent = r.who;
  $("route-tasks").textContent = r.tasks;
  $("route-support").textContent = r.support;
  $("route-role").textContent = r.role;
  document.querySelectorAll(".route-tab").forEach((t) => t.classList.toggle("is-active", t.dataset.route === id));
}
document.querySelectorAll(".route-tab").forEach((t) => t.addEventListener("click", () => showRoute(t.dataset.route)));

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

  myRoute = score <= 4 ? "A" : score <= 8 ? "B" : "C";
  store.set("course-route", myRoute);
  done["m0-1"] = true;                          // крок «Вхідний тест» виконано
  store.set("course-done", done);

  const r = ROUTES[myRoute];
  $("test-result").innerHTML = `
    <div class="result__score">${score} / ${QUESTIONS.length}</div>
    <h2>${r.name}</h2>
    <p class="muted">${r.who} Викладач перегляне результат і підтвердить маршрут.</p>
    ${mistakes.length ? `<h3>Варто повторити</h3><ul class="mistakes">${mistakes.join("")}</ul>` : "<p>Усі відповіді правильні!</p>"}
    <div class="result__buttons">
      <button class="btn" data-go="modules">До модулів</button>
      <button class="btn btn--ghost" data-go="home">На головну</button>
    </div>`;
  $("test-result").hidden = false;
  $("test-result").scrollIntoView({ behavior: "smooth" });
  renderAll();
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
//  ЗАПУСК
// =============================================================
function renderAll() {
  renderDashboard();
  renderModules();
  showRoute(myRoute || "B");
}
renderTimeline();
renderGlossary();
renderAll();
showTab(location.hash.slice(1) || "home");
