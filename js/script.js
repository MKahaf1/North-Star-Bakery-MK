/* =========================================================
   North Star Bakery - Main Script
   Touchstone 4: Interactivity and Client-Side Data

   1. Pre-order list (Products page): customers add items,
      change quantities, and remove items. The list is saved
      in localStorage so it stays when they reload the page
      or move to the Contact page.
   2. Saved list on the Contact page: shows the list and
      copies it into the "Item details" field.
   3. Form validation (Contact page): checks each field and
      shows an error message right below it.
   ========================================================= */

/* ---------- Data ---------- */

// Array of product objects shown on the Products page
const PRODUCTS = [
  { id: "artisan-loaf", name: "Artisan bread loaf", price: "$5–$12 per loaf" },
  { id: "pastry-box", name: "Assorted pastry box", price: "$18–$30 per box" },
  { id: "celebration-cake", name: "Celebration cake", price: "$35–$90 per cake" },
  { id: "signature-loaf", name: "Signature Loaf", price: "$5–$12 per loaf" }
];

const STORAGE_KEY = "northStarPreorderList";
const MAX_QUANTITY = 12;

// The customer's list: an array of objects like { id: "pastry-box", quantity: 2 }
let preorderList = [];

/* ---------- Storage functions ---------- */

// Reads the saved list from localStorage (or returns an empty list)
function loadList() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return [];
  }
  try {
    const parsed = JSON.parse(saved);
    // Keep only items that still match a real product
    return parsed.filter(function (item) {
      return findProduct(item.id) && item.quantity > 0;
    });
  } catch (error) {
    // Saved data was damaged, so start fresh instead of breaking the page
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

// Writes the current list to localStorage
function saveList() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preorderList));
}

/* ---------- List helper functions ---------- */

// Finds a product object in PRODUCTS by its id
function findProduct(productId) {
  return PRODUCTS.find(function (product) {
    return product.id === productId;
  });
}

// Finds an item already in the customer's list
function findListItem(productId) {
  return preorderList.find(function (item) {
    return item.id === productId;
  });
}

// Adds up the quantities of every item in the list
function getTotalItems() {
  let total = 0;
  preorderList.forEach(function (item) {
    total += item.quantity;
  });
  return total;
}

// Adds one of a product, or increases its quantity if it's already listed
function addToList(productId) {
  const item = findListItem(productId);
  if (item) {
    if (item.quantity < MAX_QUANTITY) {
      item.quantity += 1;
    }
  } else {
    preorderList.push({ id: productId, quantity: 1 });
  }
  saveList();
}

// Changes an item's quantity by +1 or -1 (removes it at 0)
function changeQuantity(productId, amount) {
  const item = findListItem(productId);
  if (!item) {
    return;
  }
  item.quantity += amount;
  if (item.quantity > MAX_QUANTITY) {
    item.quantity = MAX_QUANTITY;
  }
  if (item.quantity <= 0) {
    removeFromList(productId);
    return;
  }
  saveList();
}

// Removes a product from the list completely
function removeFromList(productId) {
  preorderList = preorderList.filter(function (item) {
    return item.id !== productId;
  });
  saveList();
}

// Empties the list
function clearList() {
  preorderList = [];
  saveList();
}

// Turns the list into plain text, e.g. "2 x Assorted pastry box"
function listToText() {
  return preorderList
    .map(function (item) {
      return item.quantity + " x " + findProduct(item.id).name;
    })
    .join("\n");
}

/* ---------- Products page: display functions ---------- */

// Builds one <li> for the list, with - / + and Remove buttons
function createListItem(item) {
  const product = findProduct(item.id);
  const li = document.createElement("li");

  const info = document.createElement("div");
  info.className = "item-info";
  const name = document.createElement("strong");
  name.textContent = product.name;
  const price = document.createElement("span");
  price.textContent = product.price;
  info.append(name, price);

  const controls = document.createElement("div");
  controls.className = "item-controls";

  const minus = document.createElement("button");
  minus.type = "button";
  minus.className = "qty-btn";
  minus.textContent = "−";
  minus.setAttribute("aria-label", "Remove one " + product.name);
  minus.addEventListener("click", function () {
    changeQuantity(item.id, -1);
    renderProductsPage();
  });

  const quantity = document.createElement("span");
  quantity.className = "qty";
  quantity.textContent = item.quantity;

  const plus = document.createElement("button");
  plus.type = "button";
  plus.className = "qty-btn";
  plus.textContent = "+";
  plus.setAttribute("aria-label", "Add one more " + product.name);
  plus.disabled = item.quantity >= MAX_QUANTITY;
  plus.addEventListener("click", function () {
    changeQuantity(item.id, 1);
    renderProductsPage();
  });

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "remove-btn";
  remove.textContent = "Remove";
  remove.setAttribute("aria-label", "Remove " + product.name + " from list");
  remove.addEventListener("click", function () {
    removeFromList(item.id);
    renderProductsPage();
  });

  controls.append(minus, quantity, plus, remove);
  li.append(info, controls);
  return li;
}

// Redraws the "My Pre-Order List" panel from the preorderList array
function renderList() {
  const listElement = document.getElementById("preorder-items");
  const emptyMessage = document.getElementById("list-empty");
  const actions = document.getElementById("list-actions");

  listElement.innerHTML = "";
  preorderList.forEach(function (item) {
    listElement.appendChild(createListItem(item));
  });

  const hasItems = preorderList.length > 0;
  emptyMessage.hidden = hasItems;
  actions.hidden = !hasItems;
}

// Updates each "Add" button to show how many are already in the list
function updateAddButtons() {
  document.querySelectorAll(".add-btn").forEach(function (button) {
    const item = findListItem(button.dataset.productId);
    if (item) {
      button.textContent = "Add another (" + item.quantity + " in list)";
    } else {
      button.textContent = "Add to my pre-order list";
    }
    button.disabled = item ? item.quantity >= MAX_QUANTITY : false;
  });
}

// Refreshes everything on the Products page that depends on the list
function renderProductsPage() {
  renderList();
  updateAddButtons();
}

// Sets up the Products page buttons
function initProductsPage() {
  document.querySelectorAll(".add-btn").forEach(function (button) {
    button.addEventListener("click", function () {
      const productId = button.dataset.productId;
      addToList(productId);
      renderProductsPage();

      // Confirmation right below the button that was clicked
      const status = button.parentElement.querySelector(".add-status");
      status.textContent = findProduct(productId).name + " added. Your list now has " +
        getTotalItems() + " item(s) — see My Pre-Order List at the bottom of the page.";
    });
  });

  document.getElementById("clear-list").addEventListener("click", function () {
    clearList();
    renderProductsPage();
    document.querySelectorAll(".add-status").forEach(function (status) {
      status.textContent = "";
    });
  });

  renderProductsPage();
}

/* ---------- Contact page: saved list ---------- */

// Shows the saved list above the form (hidden if the list is empty)
function renderContactList() {
  const box = document.getElementById("contact-list");
  const listElement = document.getElementById("contact-list-items");

  listElement.innerHTML = "";
  preorderList.forEach(function (item) {
    const li = document.createElement("li");
    li.textContent = item.quantity + " x " + findProduct(item.id).name;
    listElement.appendChild(li);
  });
  box.hidden = preorderList.length === 0;
}

// Copies the list into "Item details" without erasing what the user typed
function copyListToForm() {
  const details = document.getElementById("item-details");
  const listText = listToText();

  if (details.value.includes(listText)) {
    showCopyStatus("Your list is already in Item details.");
    return;
  }
  details.value = details.value.trim() === ""
    ? listText
    : details.value.trim() + "\n" + listText;

  document.getElementById("request-type").value = "pre-order";
  updateCharCount(details);
  validateField("item-details");
  validateField("request-type");
  showCopyStatus("Added to Item details. You can edit the text before sending.");
}

function showCopyStatus(message) {
  document.getElementById("copy-status").textContent = message;
}

/* ---------- Contact page: form validation ---------- */

// Builds a "YYYY-MM-DD" string from the user's local date.
// (Comparing these strings avoids time zone problems with new Date("YYYY-MM-DD").)
function toDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

// Returns a date string a number of days from today
function daysFromToday(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDateString(date);
}

// Object of rules: one check function per field id.
// Each check returns an error message, or "" when the value is valid.
const validationRules = {
  "name": function (value) {
    if (value === "") return "Please enter your name.";
    if (value.length < 2) return "Name must be at least 2 characters.";
    if (!/^[A-Za-z][A-Za-z .'-]*$/.test(value)) {
      return "Name can only use letters, spaces, hyphens, periods, and apostrophes.";
    }
    return "";
  },
  "email": function (value) {
    if (value === "") return "Please enter your email address.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      return "Enter an email in the format name@example.com.";
    }
    return "";
  },
  "pickup-date": function (value) {
    if (value === "") return "Please choose a pickup date.";
    if (value < daysFromToday(1)) return "Pickup must be at least one day from today so we have time to bake.";
    if (value > daysFromToday(60)) return "Pickup dates can be booked up to 60 days ahead.";
    return "";
  },
  "request-type": function (value) {
    if (value === "") return "Please choose a request type.";
    return "";
  },
  "item-details": function (value) {
    if (value === "") return "Please tell us what you'd like to order or ask.";
    if (value.length < 10) return "Please add a little more detail (at least 10 characters).";
    if (value.length > 500) return "Item details must be 500 characters or fewer.";
    return "";
  },
  "allergy-notes": function (value) {
    if (value.length > 300) return "Allergy notes must be 300 characters or fewer.";
    return "";
  }
};

// Character limits for the live counters
const charLimits = { "item-details": 500, "allergy-notes": 300 };

// Shows or clears the message under one field
function showError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errorElement = document.getElementById(fieldId + "-error");
  errorElement.textContent = message;
  if (message) {
    field.classList.add("invalid");
    field.setAttribute("aria-invalid", "true");
  } else {
    field.classList.remove("invalid");
    field.removeAttribute("aria-invalid");
  }
}

// Checks one field against its rule; returns true when valid
function validateField(fieldId) {
  const field = document.getElementById(fieldId);
  const message = validationRules[fieldId](field.value.trim());
  showError(fieldId, message);
  return message === "";
}

// Checks every field; returns a list of the ids that failed
function validateForm() {
  const invalidFields = [];
  Object.keys(validationRules).forEach(function (fieldId) {
    if (!validateField(fieldId)) {
      invalidFields.push(fieldId);
    }
  });
  return invalidFields;
}

// Updates the "0 / 500 characters" counter under a textarea
function updateCharCount(textarea) {
  const counter = document.getElementById(textarea.id + "-count");
  counter.textContent = textarea.value.length + " / " + charLimits[textarea.id] + " characters";
}

// Shows a message at the top of the form
function showFormStatus(message, type) {
  const status = document.getElementById("form-status");
  status.textContent = message;
  status.className = "form-status " + type;
  status.hidden = false;
}

function handleSubmit(event) {
  event.preventDefault(); // stop the page from reloading or sending bad data

  const invalidFields = validateForm();
  if (invalidFields.length > 0) {
    showFormStatus("Please fix the " + invalidFields.length +
      " highlighted field(s) below. Everything you typed has been kept.", "error");
    document.getElementById(invalidFields[0]).focus();
    return;
  }

  const name = document.getElementById("name").value.trim();
  showFormStatus("Thank you, " + name + "! Your request has been received. " +
    "We'll email you to confirm your pickup.", "success");

  event.target.reset();
  clearList();
  renderContactList();
  showCopyStatus("");
  updateCharCount(document.getElementById("item-details"));
  updateCharCount(document.getElementById("allergy-notes"));
}

function handleReset() {
  // The browser clears the fields right after this event, so wait a moment
  setTimeout(function () {
    Object.keys(validationRules).forEach(function (fieldId) {
      showError(fieldId, "");
    });
    updateCharCount(document.getElementById("item-details"));
    updateCharCount(document.getElementById("allergy-notes"));
    document.getElementById("form-status").hidden = true;
  }, 0);
}

// Sets up the Contact page
function initContactPage(form) {
  // JavaScript shows its own messages, so turn off the browser's pop-up bubbles.
  // (Without JavaScript, the HTML "required" attributes still work.)
  form.setAttribute("novalidate", "");

  // Limit the date picker to tomorrow through 60 days from now
  const dateInput = document.getElementById("pickup-date");
  dateInput.min = daysFromToday(1);
  dateInput.max = daysFromToday(60);

  Object.keys(validationRules).forEach(function (fieldId) {
    const field = document.getElementById(fieldId);

    // Check a field when the user leaves it
    field.addEventListener("blur", function () {
      if (field.value.trim() !== "" || field.classList.contains("invalid")) {
        validateField(fieldId);
      }
    });

    // Once a field shows an error, re-check it as the user fixes it
    field.addEventListener("input", function () {
      if (field.classList.contains("invalid")) {
        validateField(fieldId);
      }
      if (charLimits[fieldId]) {
        updateCharCount(field);
      }
    });
  });

  // Selects fire "change" rather than "input" in some browsers
  document.getElementById("request-type").addEventListener("change", function () {
    validateField("request-type");
  });

  form.addEventListener("submit", handleSubmit);
  form.addEventListener("reset", handleReset);
  document.getElementById("copy-list").addEventListener("click", copyListToForm);

  renderContactList();
}

/* ---------- Start ---------- */

// Runs when the page loads: get the saved list, then set up this page
function init() {
  preorderList = loadList();

  if (document.getElementById("preorder-items")) {
    initProductsPage();
  }

  const form = document.querySelector("form");
  if (form) {
    initContactPage(form);
  }
}

init();
