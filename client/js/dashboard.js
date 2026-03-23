// Load patient data from session
let patientData = null;

window.onload = function() {
    const selectedPatient = sessionStorage.getItem('selectedPatient');
    
    if (selectedPatient) {
        patientData = JSON.parse(selectedPatient);
        console.log(patientData);
        updateDashboardWithPatientData(patientData);
    }
};

function updateDashboardWithPatientData(patient) {
    // Update patient information
    const patientInfoHTML = `
        <div class="info-item">
            <div class="info-label">Patient Name</div>
            <div class="info-value">${patient.name}</div>
        </div>
        <div class="info-item">
            <div class="info-label">MRN</div>
            <div class="info-value">${patient.mrn}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Date of Birth</div>
            <div class="info-value">${patient.dob}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Insurance</div>
            <div class="info-value">${patient.insurance}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Policy Number</div>
            <div class="info-value">${patient.policyNumber}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Phone</div>
            <div class="info-value">${patient.phone}</div>
        </div>
    `;
    
    const patientInfoContainer = document.querySelector('.patient-info');
    if (patientInfoContainer) {
        patientInfoContainer.innerHTML = patientInfoHTML;
    }

    // Update claim details
    const claimDetailsHTML = `
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
        <div class="claim-item" style="border-left-color: #f59e0b;">
            <div class="claim-label">Status</div>
            <div class="claim-value" style="color: #f59e0b;">Under Review</div>
        </div>
    `;
    
    const claimDetailsContainer = document.querySelector('.claim-details');
    if (claimDetailsContainer) {
        claimDetailsContainer.innerHTML = claimDetailsHTML;
    }

    // Update transcription with patient-specific info
    const firstTranscript = document.querySelector('.transcript-line');
    if (firstTranscript && patient) {
        const agentText = firstTranscript.querySelector('div:last-child');
        if (agentText) {
            agentText.textContent = `Hello, this is the Epic Claims Resolution Center. I'm calling regarding claim ${patient.claimId} for ${patient.name}. May I speak with someone who can help resolve this claim?`;
        }
    }
}

function goBack() {
    window.location.href = '/patient-list';
}

function jumpIn() {
    alert('Jump In feature - Agent taking over call control!');
    // In a real application, this would enable live intervention in the call
}

// Simulate live transcription updates
function addTranscriptLine(speaker, text) {
    const transcriptionBox = document.getElementById('transcription');
    const newLine = document.createElement('div');
    newLine.className = 'transcript-line';
    newLine.innerHTML = `
        <div class="speaker">${speaker}:</div>
        <div>${text}</div>
    `;
    transcriptionBox.appendChild(newLine);
    transcriptionBox.scrollTop = transcriptionBox.scrollHeight;
}

// Example: Simulate new transcript after 5 seconds
setTimeout(() => {
    addTranscriptLine('Agent', 'I have the surgical notes and pre-authorization number PAC-2024-456123. I can submit these immediately to expedite the review.');
}, 5000);

// Add button click handlers
document.addEventListener('DOMContentLoaded', function() {

    if (!sessionStorage.getItem("auth_token") || !selectedPatient) {
        window.location.href = "/login";
        return;``
    }

    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.textContent.trim();
            console.log('Action clicked:', action);
            // In a real application, this would trigger actual backend calls
            if (!action.includes('Jump In')) {
                alert(`Action triggered: ${action}`);
            }
        });
    });
});

// Update call duration
let duration = 227; // 3:47 in seconds
setInterval(() => {
    duration++;
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    const durationText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    const agentInfo = document.querySelector('.agent-info p');
    if (agentInfo) {
        agentInfo.textContent = `Duration: ${durationText} | Confidence Level: ${Math.floor(Math.random() * 5) + 90}%`;
    }
}, 1000);