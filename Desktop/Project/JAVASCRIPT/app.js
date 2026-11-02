const BASE_URL =
  "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies";

const dropdowns = document.querySelectorAll(".dropdown select");
const btn = document.querySelector("form button");
const fromCurr = document.querySelector(".from select");
const toCurr = document.querySelector(".to select");
const swapIcon = document.querySelector(".dropdown i");
const amountInput = document.querySelector(".amount input");

const resultLine = document.getElementById("resultLine");
const resultMain = document.getElementById("resultMain");
const resultRate = document.getElementById("resultRate");

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
const currencyNames = new Intl.DisplayNames(["en"], { type: "currency" });

const fmt = (n) =>
  Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });

const showResult = (line, main, rate) => {
  resultLine.innerText = line;
  resultMain.innerText = main;
  resultRate.innerText = rate;
  resultMain.style.fontSize = main.startsWith("Exchange rate") ? "18px" : "";
};

const getName = (code) => {
  try {
    return `${regionNames.of(countryList[code])} ${currencyNames.of(code)}`;
  } catch (e) {
    return "";
  }
};

const fillOptions = (select, keep) => {
  const current =
    keep || select.value || (select.name === "from" ? "USD" : "PKR");
  select.innerHTML = "";
  for (let code in countryList) {
    let opt = document.createElement("option");
    opt.innerText = code;
    opt.value = code;
    if (code === current) opt.selected = true;
    select.append(opt);
  }
};

const updateFlag = (element) => {
  let currCode = element.value;
  let countryCode = countryList[currCode];
  if (!countryCode) return;
  let box = element.parentElement;
  box.querySelector("img").src =
    `https://flagsapi.com/${countryCode}/flat/64.png`;
  const label = box.querySelector(".curr-label");
  if (label) label.innerText = currCode;
};

const getRate = async () => {
  let amtVal = amountInput.value;
  if (amtVal === "" || amtVal < 1) {
    amtVal = 1;
    amountInput.value = "1";
  }

  const from = fromCurr.value.toLowerCase();
  const to = toCurr.value.toLowerCase();

  showResult("", "Fetching...", "");

  try {
    let response = await fetch(`${BASE_URL}/${from}.json`);
    let data = await response.json();
    let rate = data[from][to];
    if (rate === undefined) throw new Error("no rate");

    showResult(
      `${fmt(amtVal)} ${fromCurr.value} =`,
      `${fmt(amtVal * rate)} ${toCurr.value}`,
      `1 ${fromCurr.value} = ${fmt(rate)} ${toCurr.value}`
    );
  } catch (err) {
    showResult("", "Exchange rate not available", "");
  }
};

const panels = [];
let errorShown = false;
const closeAll = () => {
  panels.forEach((p) => p.classList.remove("open"));
  if (errorShown) {
    errorShown = false;
    getRate();
  }
};

for (let select of dropdowns) {
  fillOptions(select);

  const box = select.parentElement;
  const wrap = box.parentElement;

  const label = document.createElement("span");
  label.className = "curr-label";
  label.innerText = select.value;
  const arrow = document.createElement("span");
  arrow.className = "curr-arrow";
  arrow.innerText = "▾";
  box.append(label, arrow);

  const panel = document.createElement("div");
  panel.className = "picker-panel";
  const search = document.createElement("input");
  search.type = "text";
  search.placeholder = "Search country...";
  search.className = "search-box";
  const list = document.createElement("div");
  list.className = "picker-list";
  panel.append(search, list);
  wrap.append(panel);
  panels.push(panel);

  const renderList = (filter) => {
    list.innerHTML = "";
    let count = 0;
    for (let code in countryList) {
      const name = getName(code);
      if (filter && !(code + " " + name).toLowerCase().includes(filter))
        continue;
      const item = document.createElement("div");
      item.className = "picker-item";
      item.innerHTML = `<img loading="lazy" src="https://flagsapi.com/${countryList[code]}/flat/32.png"><b>${code}</b><span>${name}</span>`;
      item.addEventListener("click", () => {
        errorShown = false;
        select.value = code;
        updateFlag(select);
        closeAll();
        getRate();
      });
      list.append(item);
      count++;
    }
    if (!count) {
  list.innerHTML = '<div class="picker-empty">Exchange rate not available</div>';
      showResult("", "Exchange rate not available", "");
      errorShown = true;
    } else if (errorShown) {
      errorShown = false;
      getRate();
    }
  };

  box.addEventListener("click", () => {
    const wasOpen = panel.classList.contains("open");
    closeAll();
    if (!wasOpen) {
      search.value = "";
      renderList("");
      panel.classList.add("open");
      search.focus();
    }
  });

  search.addEventListener("input", () =>
    renderList(search.value.trim().toLowerCase())
  );
}

document.addEventListener("click", (e) => {
  if (!e.target.closest(".from, .to")) closeAll();
});

btn.addEventListener("click", (evt) => {
  evt.preventDefault();
  getRate();
});

amountInput.addEventListener("input", getRate);

window.addEventListener("load", () => {
  updateFlag(fromCurr);
  updateFlag(toCurr);
  getRate();
});

if (swapIcon) {
  let rotation = 0;
  swapIcon.style.transition = "transform 0.4s";

  swapIcon.addEventListener("click", () => {
    const f = fromCurr.value;
    const t = toCurr.value;
    fillOptions(fromCurr, t);
    fillOptions(toCurr, f);
    updateFlag(fromCurr);
    updateFlag(toCurr);
    errorShown = false;
    closeAll();
    rotation += 180;
    swapIcon.style.transform = `rotate(${rotation}deg)`;
    getRate();
  });
}s