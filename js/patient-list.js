// Mock patient data
const patients = [
    {
        id: 1,
        name: "Sarah Johnson",
        mrn: "MRN-2024-789456",
        dob: "03/15/1985",
        insurance: "Blue Cross PPO",
        policyNumber: "BC-458-9821-01",
        phone: "(555) 123-4567",
        claimId: "CLM-2024-00987",
        serviceDate: "02/10/2024",
        provider: "Dr. Michael Chen",
        claimAmount: "$2,450.00",
        claimType: "Outpatient Surgery",
        status: "pending"
    },
    {
        id: 2,
        name: "Robert Martinez",
        mrn: "MRN-2024-654321",
        dob: "07/22/1978",
        insurance: "Aetna HMO",
        policyNumber: "AET-789-4561-02",
        phone: "(555) 234-5678",
        claimId: "CLM-2024-00988",
        serviceDate: "02/12/2024",
        provider: "Dr. Lisa Wang",
        claimAmount: "$1,850.00",
        claimType: "MRI Scan",
        status: "active"
    },
    {
        id: 3,
        name: "Emily Davis",
        mrn: "MRN-2024-456789",
        dob: "11/08/1992",
        insurance: "United Healthcare",
        policyNumber: "UHC-321-7894-03",
        phone: "(555) 345-6789",
        claimId: "CLM-2024-00989",
        serviceDate: "02/14/2024",
        provider: "Dr. James Foster",
        claimAmount: "$890.00",
        claimType: "Physical Therapy",
        status: "pending"
    },
    {
        id: 4,
        name: "Michael Brown",
        mrn: "MRN-2024-987654",
        dob: "05/30/1965",
        insurance: "Medicare",
        policyNumber: "MED-654-3219-04",
        phone: "(555) 456-7890",
        claimId: "CLM-2024-00990",
        serviceDate: "02/15/2024",
        provider: "Dr. Sarah Mitchell",
        claimAmount: "$3,200.00",
        claimType: "Cardiac Procedure",
        status: "active"
    },
    {
        id: 5,
        name: "Jennifer Wilson",
        mrn: "MRN-2024-321654",
        dob: "09/12/1988",
        insurance: "Cigna PPO",
        policyNumber: "CIG-987-6543-05",
        phone: "(555) 567-8901",
        claimId: "CLM-2024-00991",
        serviceDate: "02/16/2024",
        provider: "Dr. Robert Kim",
        claimAmount: "$1,450.00",
        claimType: "Diagnostic Testing",
        status: "resolved"
    },
    {
        id: 6,
        name: "David Lee",
        mrn: "MRN-2024-147258",
        dob: "12/25/1975",
        insurance: "Humana",
        policyNumber: "HUM-147-2583-06",
        phone: "(555) 678-9012",
        claimId: "CLM-2024-00992",
        serviceDate: "02/17/2024",
        provider: "Dr. Amanda Cruz",
        claimAmount: "$2,100.00",
        claimType: "Laboratory Services",
        status: "pending"
    },
    {
        id: 7,
        name: "Lisa Anderson",
        mrn: "MRN-2024-963852",
        dob: "04/18/1990",
        insurance: "Kaiser Permanente",
        policyNumber: "KP-852-9630-07",
        phone: "(555) 789-0123",
        claimId: "CLM-2024-00993",
        serviceDate: "02/18/2024",
        provider: "Dr. Thomas Wright",
        claimAmount: "$780.00",
        claimType: "Consultation",
        status: "active"
    }
];

let selectedPatient = null;

// Initialize page
window.onload = function() {
    // Load user info from session
    const userName = sessionStorage.getItem('currentUser');
    const userRole = sessionStorage.getItem('currentRole');
    
    if (!userName) {
        window.location.href = 'index.html';
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
        window.location.href = 'epic_claims_dashboard.html';
    }
}

function viewHistory() {
    alert('View History feature - Coming soon!');
}

function logout() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}
