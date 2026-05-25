let data = {};

const setText = (id, value) => {
  const node = document.getElementById(id);
  if (node && value) node.textContent = value;
};

const setAttribute = (id, attribute, value) => {
  const node = document.getElementById(id);
  if (node && value) node.setAttribute(attribute, value);
};

function renderSiteMeta() {
  document.title = data.name;
  setText("site-name", data.name);
  setText("hero-kicker", data.hero.kicker);
  setText("hero-title", data.hero.title);
  setText("hero-subtitle", data.hero.subtitle);
  setText("intro-text", data.intro);
  setText("about-text", data.about);
  setText("footer-text", `© ${new Date().getFullYear()} ${data.name}`);
  setText("mail-link", data.email);
  setAttribute("mail-link", "href", `mailto:${data.email}`);
  setAttribute("hero-image", "src", data.hero.image);
}

function renderArticles() {
  const list = document.getElementById("article-list");
  list.innerHTML = "";

  data.articles.forEach((article, index) => {
    const card = document.createElement("button");
    card.className = "article-card";
    card.type = "button";
    card.innerHTML = `
      <img src="${article.cover}" alt="${article.title}" loading="lazy" />
      <span class="article-card-content">
        <span class="article-date">${article.date}</span>
        <strong>${article.title}</strong>
        <span>${article.excerpt}</span>
      </span>
    `;
    card.addEventListener("click", () => openArticle(index));
    list.appendChild(card);
  });
}

function renderPhotos() {
  const list = document.getElementById("photo-list");
  list.innerHTML = "";

  data.photos.forEach((photo) => {
    const figure = document.createElement("figure");
    figure.className = "photo-card";
    figure.innerHTML = `
      <img src="${photo.src}" alt="${photo.title}" loading="lazy" />
      <figcaption>
        <strong>${photo.title}</strong>
        <span>${photo.location}</span>
      </figcaption>
    `;
    list.appendChild(figure);
  });
}

function renderProfile() {
  const list = document.getElementById("profile-list");
  list.innerHTML = "";

  data.profile.forEach((item) => {
    const label = Array.isArray(item) ? item[0] : item.label;
    const value = Array.isArray(item) ? item[1] : item.value;
    const term = document.createElement("dt");
    const description = document.createElement("dd");
    term.textContent = label;
    description.textContent = value;
    list.append(term, description);
  });
}

function openArticle(index) {
  const article = data.articles[index];
  const dialog = document.getElementById("article-dialog");
  setText("dialog-date", article.date);
  setText("dialog-title", article.title);

  const body = document.getElementById("dialog-body");
  body.innerHTML = "";
  article.body.forEach((paragraph) => {
    const p = document.createElement("p");
    p.textContent = paragraph;
    body.appendChild(p);
  });

  dialog.showModal();
}

document.getElementById("close-dialog").addEventListener("click", () => {
  document.getElementById("article-dialog").close();
});

document.getElementById("article-dialog").addEventListener("click", (event) => {
  if (event.target.id === "article-dialog") event.target.close();
});

async function init() {
  try {
    const response = await fetch("./site-data.json");
    if (!response.ok) throw new Error("Cannot load site data");
    data = await response.json();
    renderSiteMeta();
    renderArticles();
    renderPhotos();
    renderProfile();
  } catch (error) {
    document.body.insertAdjacentHTML(
      "afterbegin",
      `<div class="load-error">网站数据暂时没有加载成功，请稍后刷新。</div>`,
    );
    console.error(error);
  }
}

init();
