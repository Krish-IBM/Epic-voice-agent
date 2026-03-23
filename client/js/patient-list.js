// Patient data - loaded from patients-data.js
let patients = [];
let selectedPatient = null;

// Initialize page
function displayPatients(patientsData) {
    // Load patients from the patientsData global variable
    if (typeof patientsData !== 'undefined' && patientsData) {
        patients = patientsData;
    } else {
        console.error('Error: Patient data not loaded');
        alert('Error loading patient data. Please refresh the page.');
        return;
    }

    // Load user info from session
    const userName = sessionStorage.getItem('currentUser');
    const userRole = sessionStorage.getItem('currentRole');
    
    if (!userName) {
        window.location.href = '/';
        return;
    }

    document.getElementById('userName').textContent = userName;
    document.getElementById('userRole').textContent = userRole;

    // Populate patient list
    renderPatientList(patients);

    // Setup search
    document.getElementById('searchInput').addEventListener('input', handleSearch);
};

function renderPatientList(patientsToRender) {
    const patientList = document.getElementById('patientList');
    patientList.innerHTML = '';

    patientsToRender.forEach(patient => {
        const card = document.createElement('div');
        card.className = 'patient-card';
        if (selectedPatient && selectedPatient.id === patient.id) {
            card.classList.add('selected');
        }
        
        card.innerHTML = `
            <div class="patient-header">
                <div>
                    <div class="patient-name">${patient.name}</div>
                    <div class="patient-mrn">${patient.mrn}</div>
                </div>
                <div class="status-badge ${patient.status}">${patient.status.toUpperCase()}</div>
            </div>
            <div class="patient-info">
                <div>
                    <span class="info-label">Claim:</span>
                    <span class="info-value">${patient.claimId}</span>
                </div>
                <div>
                    <span class="info-label">Amount:</span>
                    <span class="info-value">${patient.claimAmount}</span>
                </div>
                <div>
                    <span class="info-label">Type:</span>
                    <span class="info-value">${patient.claimType}</span>
                </div>
                <div>
                    <span class="info-label">Date:</span>
                    <span class="info-value">${patient.serviceDate}</span>
                </div>
            </div>
        `;
        
        card.onclick = () => selectPatient(patient);
        patientList.appendChild(card);
    });
}

function selectPatient(patient) {
    selectedPatient = patient;
    
    // Update UI
    document.getElementById('emptyState').classList.add('hidden');
    document.getElementById('patientDetail').classList.remove('hidden');

    // Populate patient info
    document.getElementById('patientInfo').innerHTML = `
        <div class="detail-item">
            <div class="detail-label">Patient Name</div>
            <div class="detail-value">${patient.name}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">MRN</div>
            <div class="detail-value">${patient.mrn}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Date of Birth</div>
            <div class="detail-value">${patient.dob}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Insurance</div>
            <div class="detail-value">${patient.insurance}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Policy Number</div>
            <div class="detail-value">${patient.policyNumber}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Phone</div>
            <div class="detail-value">${patient.phone}</div>
        </div>
    `;

    // Populate claim details
    document.getElementById('claimDetails').innerHTML = `
        <div class="claim-item">
            <div class="claim-label">Claim ID</div>
            <div class="claim-value">${patient.claimId}</div>
        </div>
        <div class="claim-item">
            <div class="claim-label">Service Date</div>
            <div class="claim-value">${patient.serviceDate}</div>
        </div>
        <div class="claim-item">
            <div class="claim-label">Provider</div>
            <div class="claim-value">${patient.provider}</div>
        </div>
        <div class="claim-item">
            <div class="claim-label">Claim Amount</div>
            <div class="claim-value">${patient.claimAmount}</div>
        </div>
        <div class="claim-item">
            <div class="claim-label">Claim Type</div>
            <div class="claim-value">${patient.claimType}</div>
        </div>
        <div class="claim-item" style="border-left-color: ${getStatusColor(patient.status)};">
            <div class="claim-label">Status</div>
            <div class="claim-value" style="color: ${getStatusColor(patient.status)};">${patient.status.toUpperCase()}</div>
        </div>
    `;

    // Re-render patient list to show selection
    renderPatientList(patients);
}

function getStatusColor(status) {
    const colors = {
        'pending': '#f59e0b',
        'active': '#10b981',
        'resolved': '#0ea5e9'
    };
    return colors[status] || '#718096';
}

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = patients.filter(patient => 
        patient.name.toLowerCase().includes(searchTerm) ||
        patient.mrn.toLowerCase().includes(searchTerm) ||
        patient.claimId.toLowerCase().includes(searchTerm)
    );
    renderPatientList(filtered);
}

function launchVoiceAgent() {
    if (selectedPatient) {
        // Store selected patient in session
        sessionStorage.setItem('selectedPatient', JSON.stringify(selectedPatient));
        // Navigate to voice agent dashboard
        window.location.href = '/agent-dashboard';
    }
}

function viewHistory() {
    alert('View History feature - Coming soon!');
}

function logout() {
    sessionStorage.clear();
    window.location.href = '/';
}
