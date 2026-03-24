const showActivePatientClaims = document.getElementById('show-active-patients');
const showResolvedPatientClaims = document.getElementById('show-resolved-patients');


showActivePatientClaims.addEventListener('click', () => {
    current_patient_type_displayed = "active";
    renderPatientList(current_patient_type_displayed);
    showResolvedPatientClaims.classList.remove("active");
    showActivePatientClaims.classList.add("active");
});

showResolvedPatientClaims.addEventListener('click', () => {
    current_patient_type_displayed = "resolved";
    renderPatientList(current_patient_type_displayed);
    showResolvedPatientClaims.classList.add("active");
    showActivePatientClaims.classList.remove("active");
});



function partitionPatientsByStatus(patients) {
  const resolved = [];
  const unresolved = [];

  for (const patient of patients) {
    if (patient.status === 'resolved') {
      resolved.push(patient);
    } else {
      unresolved.push(patient);
    }
  }

  return { resolved, unresolved };
}

