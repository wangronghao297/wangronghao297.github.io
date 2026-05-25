let data = {};

const pageType = window.PAGE_TYPE || "home";
const params = new URLSearchParams(window.location.search);

const setText = (id, value) => {
  const node = document.getElementById(id);
  if (node && value !== undefined && value !== null) node.textContent = value;
};

const setAttribute = (id, attribute, value) => {
  const node = document.getElementById(id);
  if (node && value) node.setAttribute(attribute, value);
};

const clearNode = (node) => {
  if (node) node.innerHTML = "";
};

const articleUrl = (article) =>
  `./article.html?slug=${encodeURIComponent(article.slug)}`;

const categoryUrl = (slug) =>
  `./category.html?category=${encodeURIComponent(slug)}`;

function getCategory(slug) {
  return data.categories.find((category) => category.slug === slug);
}

function getCategoryName(slug) {
  return getCategory(slug)?.name || "未分类";
}

function renderSiteMeta() {
  document.title =
    pageType === "home" ? data.name : `${document.title} | ${data.name}`;
  setText("site-name", data.name);
  setText("footer-text", `© ${new Date().getFullYear()} ${data.name}`);
  setText("mail-link", data.email);
  setAttribute("mail-link", "href", `mailto:${data.email}`);

  if (pageType === "home") {
    setText("hero-kicker", data.hero.kicker);
    setText("hero-title", data.hero.title);
    setText("hero-subtitle", data.hero.subtitle);
    setText("intro-text", data.intro);
    setText("about-text", data.about);
    setAttribute("hero-image", "src", data.hero.image);
  }
}

function renderCategoryCards(containerId, options = {}) {
  const list = document.getElementById(containerId);
  if (!list) return;
  clearNode(list);

  const categories = data.categories.map((category) => ({
    ...category,
    count:
      options.mode === "photo-filter"
        ? data.photos.filter((item) => item.category === category.slug).length
        : data.articles.filter((item) => item.category === category.slug)
            .length +
          data.photos.filter((item) => item.category === category.slug).length,
  }));

  if (options.includeAll) {
    const allButton = createCategoryButton({
      slug: "all",
      name: "全部照片",
      description: "查看所有照片，不按分类筛选。",
      count: data.photos.length,
      href: "./photos.html",
      active: !params.get("category"),
    });
    list.appendChild(allButton);
  }

  categories.forEach((category) => {
    list.appendChild(
      createCategoryButton({
        ...category,
        href:
          options.mode === "photo-filter"
            ? `./photos.html?category=${encodeURIComponent(category.slug)}`
            : categoryUrl(category.slug),
        active: options.activeCategory === category.slug,
      }),
    );
  });
}

function createCategoryButton(category) {
  const link = document.createElement("a");
  link.className = "category-button";
  link.href = category.href;
  link.setAttribute("aria-current", category.active ? "page" : "false");
  link.innerHTML = `
    <span>
      <strong>${category.name}</strong>
      <small>${category.description}</small>
    </span>
    <em>${category.count}</em>
  `;
  return link;
}

function renderArticles(items, options = {}) {
  const list = document.getElementById("article-list");
  const empty = document.getElementById("article-empty");
  if (!list) return;
  clearNode(list);

  if (empty) empty.hidden = items.length > 0;

  items.forEach((article) => {
    const card = document.createElement("a");
    card.className = "article-card";
    card.href = articleUrl(article);
    card.innerHTML = `
      <img src="${article.cover}" alt="${article.title}" loading="lazy" />
      <span class="article-card-content">
        <span class="article-date">${article.date} · ${getCategoryName(article.category)}</span>
        <strong>${article.title}</strong>
        <span>${article.excerpt}</span>
      </span>
    `;
    list.appendChild(card);
  });

  if (options.limitNote && items.length === options.limit) {
    const more = document.createElement("a");
    more.className = "text-link";
    more.href = "./categories.html";
    more.textContent = "查看全部分类";
    list.insertAdjacentElement("afterend", more);
  }
}

function renderPhotos(items) {
  const list = document.getElementById("photo-list");
  const empty = document.getElementById("photo-empty");
  if (!list) return;
  clearNode(list);

  if (empty) empty.hidden = items.length > 0;

  items.forEach((photo) => {
    const figure = document.createElement("figure");
    figure.className = "photo-card";
    figure.innerHTML = `
      <img src="${photo.src}" alt="${photo.title}" loading="lazy" />
      <figcaption>
        <strong>${photo.title}</strong>
        <span>${photo.location} · ${getCategoryName(photo.category)}</span>
      </figcaption>
    `;
    list.appendChild(figure);
  });
}

function renderProfile() {
  const list = document.getElementById("profile-list");
  if (!list) return;
  clearNode(list);

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

function renderHome() {
  renderCategoryCards("category-list");
  renderArticles(data.articles.slice(0, 2));
  renderPhotos(data.photos.slice(0, 2));
  renderProfile();
}

function renderCategoriesPage() {
  renderCategoryCards("category-list");
}

function renderCategoryPage() {
  const slug = params.get("category") || data.categories[0]?.slug;
  const category = getCategory(slug);

  if (!category) {
    setText("category-title", "没有找到这个分类");
    setText("category-description", "请返回分类目录重新选择。");
    renderArticles([]);
    renderPhotos([]);
    return;
  }

  document.title = `${category.name} | ${data.name}`;
  setText("category-title", category.name);
  setText("category-description", category.description);
  renderArticles(data.articles.filter((article) => article.category === slug));
  renderPhotos(data.photos.filter((photo) => photo.category === slug));
}

function renderArticlePage() {
  const slug = params.get("slug");
  const article = data.articles.find((item) => item.slug === slug);

  if (!article) {
    document.title = `文章不存在 | ${data.name}`;
    setText("article-title", "文章不存在");
    setText("article-excerpt", "请从分类目录重新进入文章。");
    return;
  }

  document.title = `${article.title} | ${data.name}`;
  setText("article-meta", `${article.date} · ${getCategoryName(article.category)}`);
  setText("article-title", article.title);
  setText("article-excerpt", article.excerpt);
  setAttribute("article-cover", "src", article.cover);
  setAttribute("article-cover", "alt", article.title);

  const body = document.getElementById("article-body");
  clearNode(body);
  article.body.forEach((paragraph) => {
    const p = document.createElement("p");
    p.textContent = paragraph;
    body.appendChild(p);
  });

  renderComments(article);
}

function renderPhotosPage() {
  const category = params.get("category");
  const activeCategory = category && getCategory(category) ? category : null;
  const photos = activeCategory
    ? data.photos.filter((photo) => photo.category === activeCategory)
    : data.photos;

  renderCategoryCards("photo-filter-list", {
    includeAll: true,
    mode: "photo-filter",
    activeCategory,
  });
  renderPhotos(photos);
}

function renderAboutPage() {
  document.title = `关于 | ${data.name}`;
  setText("about-text", data.about);
  renderProfile();
}

function renderComments(article) {
  const root = document.getElementById("comments-root");
  if (!root || !data.comments?.repoId || !data.comments?.categoryId) return;

  const script = document.createElement("script");
  script.src = "https://giscus.app/client.js";
  script.async = true;
  script.crossOrigin = "anonymous";
  script.setAttribute("data-repo", data.comments.repo);
  script.setAttribute("data-repo-id", data.comments.repoId);
  script.setAttribute("data-category", data.comments.category);
  script.setAttribute("data-category-id", data.comments.categoryId);
  script.setAttribute("data-mapping", "specific");
  script.setAttribute("data-term", article.slug);
  script.setAttribute("data-strict", "1");
  script.setAttribute("data-reactions-enabled", "1");
  script.setAttribute("data-emit-metadata", "0");
  script.setAttribute("data-input-position", "bottom");
  script.setAttribute("data-theme", "light");
  script.setAttribute("data-lang", "zh-CN");
  script.setAttribute("data-loading", "lazy");
  root.appendChild(script);
}

async function init() {
  try {
    const response = await fetch("./site-data.json");
    if (!response.ok) throw new Error("Cannot load site data");
    data = await response.json();

    renderSiteMeta();

    if (pageType === "home") renderHome();
    if (pageType === "categories") renderCategoriesPage();
    if (pageType === "category") renderCategoryPage();
    if (pageType === "article") renderArticlePage();
    if (pageType === "photos") renderPhotosPage();
    if (pageType === "about") renderAboutPage();
  } catch (error) {
    document.body.insertAdjacentHTML(
      "afterbegin",
      `<div class="load-error">网站数据暂时没有加载成功，请稍后刷新。</div>`,
    );
    console.error(error);
  }
}

init();
