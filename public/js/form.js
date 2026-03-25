import {
  createDrink,
  getDrinkById,
  updateDrink,
} from "./api.js";
import { loadUserStatus } from "./auth.js";

const authNavLink = document.querySelector("#authNavLink");
const drinkForm = document.querySelector("#drinkForm");
const formTitle = document.querySelector("#formTitle");
const formSubtitle = document.querySelector("#formSubtitle");
const formMessage = document.querySelector("#formMessage");
const submitButton = document.querySelector("#submitButton");

const brandInput = document.querySelector("#brand");
const drinkNameInput = document.querySelector("#drinkName");
const sizeOzInput = document.querySelector("#sizeOz");
const caffeineMgInput = document.querySelector("#caffeineMg");
const sugarGInput = document.querySelector("#sugarG");
const ratingInput = document.querySelector("#rating");
const purchasedAtInput = document.querySelector("#purchasedAt");
const notesInput = document.querySelector("#notes");

const params = new URLSearchParams(window.location.search);
const drinkId = params.get("id");
const isEditMode = Boolean(drinkId);

function showMessage(message, type = "error") {
  formMessage.textContent = message;
  formMessage.className = `message ${type}`;
  formMessage.hidden = false;
}

function clearMessage() {
  formMessage.hidden = true;
  formMessage.textContent = "";
  formMessage.className = "message";
}

function setSubmittingState(isSubmitting) {
  submitButton.disabled = isSubmitting;
  submitButton.textContent = isSubmitting
    ? isEditMode
      ? "Saving..."
      : "Adding..."
    : isEditMode
      ? "Save Changes"
      : "Save Drink";
}

function formatDateTimeLocal(value) {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  const localDate = new Date(date.getTime() - offsetMs);
  return localDate.toISOString().slice(0, 16);
}

function buildPayload() {
  return {
    brand: brandInput.value.trim(),
    drinkName: drinkNameInput.value.trim(),
    sizeOz: sizeOzInput.value.trim(),
    caffeineMg: caffeineMgInput.value.trim(),
    sugarG: sugarGInput.value.trim(),
    rating: ratingInput.value.trim(),
    purchasedAt: purchasedAtInput.value ? new Date(purchasedAtInput.value).toISOString() : "",
    notes: notesInput.value.trim(),
  };
}

function populateForm(drink) {
  brandInput.value = drink.brand || "";
  drinkNameInput.value = drink.drinkName || "";
  sizeOzInput.value = drink.sizeOz ?? "";
  caffeineMgInput.value = drink.caffeineMg ?? "";
  sugarGInput.value = drink.sugarG ?? "";
  ratingInput.value = drink.rating ?? "";
  purchasedAtInput.value = drink.purchasedAt ? formatDateTimeLocal(drink.purchasedAt) : "";
  notesInput.value = drink.notes || "";
}

async function loadDrinkForEdit() {
  if (!isEditMode) {
    formTitle.textContent = "Add Drink";
    formSubtitle.textContent = "Save a new drink to your personal tracker.";
    submitButton.textContent = "Save Drink";

    if (!purchasedAtInput.value) {
      purchasedAtInput.value = formatDateTimeLocal();
    }

    return;
  }

  formTitle.textContent = "Edit Drink";
  formSubtitle.textContent = "Update one of your saved drinks.";
  submitButton.textContent = "Save Changes";

  try {
    const drink = await getDrinkById(drinkId);
    populateForm(drink);
  } catch (error) {
    showMessage(error.message || "Failed to load drink.");
  }
}

async function initFormPage() {
  const user = await loadUserStatus();

  if (!user) {
    showMessage("You need to sign in before you can save drinks.");
    drinkForm.hidden = true;
    return;
  }

  await loadDrinkForEdit();
}

drinkForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessage();
  setSubmittingState(true);

  try {
    const payload = buildPayload();

    if (isEditMode) {
      await updateDrink(drinkId, payload);
      showMessage("Drink updated successfully.", "success");
    } else {
      await createDrink(payload);
      showMessage("Drink added successfully.", "success");
      drinkForm.reset();
      purchasedAtInput.value = formatDateTimeLocal();
    }

    window.setTimeout(() => {
      window.location.href = "/dashboard";
    }, 700);
  } catch (error) {
    showMessage(error.message || "Failed to save drink.");
  } finally {
    setSubmittingState(false);
  }
});

await initFormPage();