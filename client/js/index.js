function selectUser(name, role) {
    // Store user info in sessionStorage
    sessionStorage.setItem('currentUser', name);
    sessionStorage.setItem('currentRole', role);
    // Navigate to patient list
    window.location.href = '/patient-list';
}

// Auth guard — redirect to login if no token
if (!sessionStorage.getItem("auth_token")) {
  window.location.href = "/login";
}

// Logout function — call this from a logout button
function logout() {
//   sessionStorage.removeItem("auth_token");
  sessionStorage.clear();
  window.location.href = "/login";
}