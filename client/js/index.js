function selectUser(name, role) {
    // Store user info in sessionStorage
    sessionStorage.setItem('currentUser', name);
    sessionStorage.setItem('currentRole', role);
    // Navigate to patient list
    window.location.href = 'patient-list.html';
}