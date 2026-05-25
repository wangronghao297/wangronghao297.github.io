let data = {};
let selectedCategory = "recent";

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
  const empty = document.getElementById("article-empty");
  list.innerHTML = "";

  const articles = getVisibleItems(data.articles);
  empty.hidden = articles.length > 0;

  articles.forEach((article) => {
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
    card.addEventListener("click", () => openArticle(article));
    list.appendChild(card);
  });
}

function renderPhotos() {
  const list = document.getElementById("photo-list");
  const empty = document.getElementById("photo-empty");
  list.innerHTML = "";

  const photos = getVisibleItems(data.photos);
  empty.hidden = photos.length > 0;

  photos.forEach((photo) => {
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

function renderDirectory() {
  const list = document.getElementById("category-list");
  list.innerHTML = "";

  const categories = [
    {
      slug: "recent",
      name: "最近内容",
      description: "首页先看少量最新更新",
      count: Math.min(data.articles.length, 2) + Math.min(data.photos.length, 2),
    },
    ...data.categories.map((category) => ({
      ...category,
      count:
        data.articles.filter((item) => item.category === category.slug).length +
        data.photos.filter((item) => item.category === category.slug).length,
    })),
  ];

  categories.forEach((category) => {
    const button = document.createElement("button");
    button.className = "category-button";
    button.type = "button";
    button.dataset.category = category.slug;
    button.setAttribute(
      "aria-pressed",
      String(category.slug === selectedCategory),
    );
    button.innerHTML = `
      <span>
        <strong>${category.name}</strong>
        <small>${category.description}</small>
      </span>
      <em>${category.count}</em>
    `;
    button.addEventListener("click", () => selectCategory(category.slug));
    list.appendChild(button);
  });

  renderContentHeading();
}

function selectCategory(category) {
  selectedCategory = category;
  history.replaceState(null, "", `#${category}`);
  renderDirectory();
  renderArticles();
  renderPhotos();
  document.getElementById("content").scrollIntoView({ behavior: "smooth" });
}

function getVisibleItems(items) {
  if (selectedCategory === "recent") return items.slice(0, 2);
  return items.filter((item) => item.category === selectedCategory);
}

function renderContentHeading() {
  const current =
    selectedCategory === "recent"
      ? { name: "最近内容", description: "先放一部分最新文章和照片，其余内容可以按分类查看。" }
      : data.categories.find((category) => category.slug === selectedCategory);

  if (!current) return;
  setText("content-title", current.name);
  setText("content-description", current.description);
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

function openArticle(article) {
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
    selectedCategory = getInitialCategory();
    renderSiteMeta();
    renderDirectory();
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

function getInitialCategory() {
  const hash = decodeURIComponent(window.location.hash.replace("#", ""));
  if (hash && data.categories.some((category) => category.slug === hash)) {
    return hash;
  }
  return "recent";
}
