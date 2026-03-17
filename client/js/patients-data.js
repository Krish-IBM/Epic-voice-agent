
async function loadPatients() {
  try {
    const response = await fetch('../patients.json');
    const data = await response.json();
    let patientsData = data.patients;
    console.log(patientsData);
    // Now you can use the data here
    console.log('Total patients:', patientsData.length);
    displayPatients(patientsData);  // Call your display function
  } catch (error) {
    console.error('Error loading JSON:', error);
  }
}
// Call it when page loads
loadPatients();