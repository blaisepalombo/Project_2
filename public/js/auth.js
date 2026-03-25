import { API_BASE, getCurrentUser, logoutUser } from "./api.js";

function getDisplayName(user) {
  if (!user) return "";
  if (user.displayName && user.displayName.trim()) {
    return user.displayName.trim().split(" ")[0];
  }
  if (user.email) {
    return user.email.split("@")[0];
  }
  return "there";
}

function updateHeaderAuth(user) {
  const authNavLink = document.querySelector("#authNavLink");
  if (!authNavLink) return;

  if (user) {
    authNavLink.textContent = "Logout";
    authNavLink.setAttribute("href", "#");
    authNavLink.onclick = async (event) => {
      event.preventDefault();
      await handleLogout("/index.html");
    };
  } else {
    authNavLink.textContent = "Sign in";
    authNavLink.setAttribute("href", `${API_BASE}/auth/google`);
    authNavLink.onclick = null;
  }
}

function updateHeroAuth(user) {
  const heroAuthButton = document.querySelector("#heroAuthButton");
  const heroWelcome = document.querySelector("#heroWelcome");

  if (!heroAuthButton || !heroWelcome) return;

  if (user) {
    heroAuthButton.hidden = true;
    heroWelcome.hidden = false;
    heroWelcome.textContent = `Welcome ${getDisplayName(user)}`;
  } else {
    heroAuthButton.hidden = false;
    heroWelcome.hidden = true;
    heroWelcome.textContent = "";
  }
}

function updateStatusTarget(user, targetElement) {
  if (!targetElement) return;

  if (user) {
    const name = user.displayName || "User";
    targetElement.textContent = `Viewing your dashboard as ${name}.`;
  } else {
    targetElement.innerHTML = `You are not signed in. <a href="${API_BASE}/auth/google">Sign in with Google</a> to view and manage your drinks.`;
  }
}

export async function loadUserStatus(targetElement = null) {
  try {
    const data = await getCurrentUser();
    const user = data?.user || null;

    updateHeaderAuth(user);
    updateHeroAuth(user);
    updateStatusTarget(user, targetElement);

    return user;
  } catch (error) {
    updateHeaderAuth(null);
    updateHeroAuth(null);
    updateStatusTarget(null, targetElement);
    return null;
  }
}

export async function handleLogout(redirectTo = "/index.html") {
  await logoutUser();
  window.location.href = redirectTo;
}