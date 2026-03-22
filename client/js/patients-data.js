
async function loadPatients() {
  try {
    const response = await fetch("/api/patients");
    const patientsData = await response.json();``
    const sorted = patientsData.sort((a, b) => a.id.localeCompare(b.id));
    console.log(sorted);
    // Now you can use the data here
    console.log('Total patients:', sorted.length);
    displayPatients(sorted);  // Call your display function
  } catch (error) {
    console.error('Error loading JSON:', error);
  }
}
// Call it when page loads
loadPatients();