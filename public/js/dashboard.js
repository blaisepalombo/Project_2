import { getDrinks, getDrinkStats, deleteDrink, getCurrentUser } from "./api.js";
import { loadUserStatus, handleLogout } from "./auth.js";

const authStatus = document.querySelector("#authStatus");
const logoutButton = document.querySelector("#logoutButton");
const addDrinkLink = document.querySelector("#addDrinkLink");
const loginPopup = document.querySelector("#loginPopup");
const closeLoginPopup = document.querySelector("#closeLoginPopup");
const filterForm = document.querySelector("#filterForm");
const resetFiltersButton = document.querySelector("#resetFilters");
const drinksGrid = document.querySelector("#drinksGrid");
const messageBox = document.querySelector("#messageBox");
const resultsMeta = document.querySelector("#resultsMeta");
const pageLabel = document.querySelector("#pageLabel");
const prevPage = document.querySelector("#prevPage");
const nextPage = document.querySelector("#nextPage");

const statTotal = document.querySelector("#statTotal");
const statCaffeine = document.querySelector("#statCaffeine");
const statRating = document.querySelector("#statRating");
const statBrand = document.querySelector("#statBrand");

let currentPage = 1;
let isLoggedIn = false;

function showMessage(message, type = "error") {
  messageBox.textContent = message;
  messageBox.className = `message ${type}`;
  messageBox.hidden = false;
}

function clearMessage() {
  messageBox.hidden = true;
  messageBox.textContent = "";
  messageBox.className = "message";
}

function openLoginPopup() {
  if (loginPopup) {
    loginPopup.hidden = false;
  }
}

function closePopup() {
  if (loginPopup) {
    loginPopup.hidden = true;
  }
}

function formatDate(value) {
  if (!value) return "No purchase date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No purchase date";
  return date.toLocaleString();
}

function setStats(stats) {
  const overview = stats?.overview || {};
  const topBrand = stats?.topBrands?.[0]?.brand || "--";

  statTotal.textContent = overview.totalDrinks ?? 0;
  statCaffeine.textContent =
    overview.averageCaffeineMg != null
      ? `${Math.round(overview.averageCaffeineMg)} mg`
      : "--";
  statRating.textContent =
    overview.averageRating != null
      ? Number(overview.averageRating).toFixed(1)
      : "--";
  statBrand.textContent = topBrand;
}

function createDrinkCard(drink) {
  const article = document.createElement("article");
  article.className = "drink-card";

  article.innerHTML = `
    <div>
      <h3>${drink.brand} - ${drink.drinkName}</h3>
      <p class="muted">${drink.notes || "No notes added."}</p>
    </div>

    <div class="drink-meta">
      <span class="badge">${drink.sizeOz} oz</span>
      <span class="badge">${drink.caffeineMg ?? 0} mg caffeine</span>
      <span class="badge">${drink.sugarG ?? 0} g sugar</span>
      <span class="badge">Rating: ${drink.rating ?? "--"}</span>
    </div>

    <p class="muted">Purchased: ${formatDate(drink.purchasedAt)}</p>

    <div class="card-actions">
      <a class="btn btn-secondary" href="/form?id=${encodeURIComponent(drink._id)}">Edit</a>
      <button class="btn btn-primary" type="button" data-delete-id="${drink._id}">Delete</button>
    </div>
  `;

  const deleteButton = article.querySelector("[data-delete-id]");
  deleteButton.addEventListener("click", async () => {
    const confirmed = window.confirm("Delete this drink?");
    if (!confirmed) return;

    try {
      await deleteDrink(drink._id);
      showMessage("Drink deleted successfully.", "success");
      await loadDashboard();
    } catch (error) {
      showMessage(error.message || "Failed to delete drink.");
    }
  });

  return article;
}

function getFiltersFromForm() {
  const formData = new FormData(filterForm);
  return {
    brand: formData.get("brand")?.trim(),
    search: formData.get("search")?.trim(),
    minCaffeine: formData.get("minCaffeine"),
    maxCaffeine: formData.get("maxCaffeine"),
    minRating: formData.get("minRating"),
    maxRating: formData.get("maxRating"),
    sort: formData.get("sort"),
    limit: formData.get("limit"),
    page: currentPage,
  };
}

async function loadDashboard() {
  clearMessage();

  try {
    const filters = getFiltersFromForm();

    const [drinkResult, statsResult] = await Promise.all([
      getDrinks(filters),
      getDrinkStats(filters),
    ]);

    drinksGrid.innerHTML = "";

    const drinks = drinkResult.data || [];
    const pagination = drinkResult.pagination || {};
    const total = pagination.total ?? 0;
    const totalPages = pagination.totalPages ?? 1;

    resultsMeta.textContent = `${total} result${total === 1 ? "" : "s"} found`;
    pageLabel.textContent = `Page ${pagination.page || 1} of ${totalPages || 1}`;
    prevPage.disabled = (pagination.page || 1) <= 1;
    nextPage.disabled = (pagination.page || 1) >= (totalPages || 1);

    if (drinks.length === 0) {
      drinksGrid.innerHTML = `<p class="muted">No drinks found for the current filters.</p>`;
    } else {
      drinks.forEach((drink) => {
        drinksGrid.appendChild(createDrinkCard(drink));
      });
    }

    setStats(statsResult);
  } catch (error) {
    showMessage(error.message || "Failed to load drinks.");
  }
}

filterForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  currentPage = 1;
  await loadDashboard();
});

resetFiltersButton?.addEventListener("click", async () => {
  filterForm.reset();
  filterForm.querySelector("#sort").value = "newest";
  filterForm.querySelector("#limit").value = "9";
  currentPage = 1;
  await loadDashboard();
});

prevPage?.addEventListener("click", async () => {
  if (currentPage > 1) {
    currentPage -= 1;
    await loadDashboard();
  }
});

nextPage?.addEventListener("click", async () => {
  currentPage += 1;
  await loadDashboard();
});

logoutButton?.addEventListener("click", async () => {
  try {
    await handleLogout("/");
  } catch (error) {
    showMessage("Logout failed.");
  }
});

addDrinkLink?.addEventListener("click", async (event) => {
  if (isLoggedIn) return;

  event.preventDefault();

  try {
    const data = await getCurrentUser();
    isLoggedIn = Boolean(data?.user);

    if (isLoggedIn) {
      window.location.href = "/form";
      return;
    }
  } catch (error) {
    isLoggedIn = false;
  }

  openLoginPopup();
});

closeLoginPopup?.addEventListener("click", closePopup);

loginPopup?.addEventListener("click", (event) => {
  if (event.target === loginPopup) {
    closePopup();
  }
});

async function init() {
  const user = await loadUserStatus(authStatus);
  isLoggedIn = Boolean(user);
  closePopup();
  await loadDashboard();
}

await init();