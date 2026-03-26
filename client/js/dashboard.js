// ─── PATIENT DATA ─────────────────────────────────────────
let patientData = null;

window.onload = function () {
    const selectedPatient = sessionStorage.getItem('selectedPatient');
    if (selectedPatient) {
        patientData = JSON.parse(selectedPatient);
        updateDashboardWithPatientData(patientData);
    } else {
        window.location.href = "/";
    }
};

function updateDashboardWithPatientData(patient) {
    const patientInfoHTML = `
        <div class="info-item"><div class="info-label">Patient Name</div><div class="info-value">${patient.name}</div></div>
        <div class="info-item"><div class="info-label">MRN</div><div class="info-value">${patient.mrn}</div></div>
        <div class="info-item"><div class="info-label">Date of Birth</div><div class="info-value">${patient.dob}</div></div>
        <div class="info-item"><div class="info-label">Insurance</div><div class="info-value">${patient.insurance}</div></div>
        <div class="info-item"><div class="info-label">Policy Number</div><div class="info-value">${patient.policyNumber}</div></div>
        <div class="info-item"><div class="info-label">Phone</div><div class="info-value">${patient.phone}</div></div>
    `;
    const patientInfoContainer = document.querySelector('.patient-info');
    if (patientInfoContainer) patientInfoContainer.innerHTML = patientInfoHTML;

    const claimDetailsHTML = `
        <div class="claim-item"><div class="claim-label">Claim ID</div><div class="claim-value">${patient.claimId}</div></div>
        <div class="claim-item"><div class="claim-label">Service Date</div><div class="claim-value">${patient.serviceDate}</div></div>
        <div class="claim-item"><div class="claim-label">Provider</div><div class="claim-value">${patient.provider}</div></div>
        <div class="claim-item"><div class="claim-label">Claim Amount</div><div class="claim-value">${patient.claimAmount}</div></div>
        <div class="claim-item"><div class="claim-label">Claim Type</div><div class="claim-value">${patient.claimType}</div></div>
        <div class="claim-item" style="border-left-color: #f59e0b;">
            <div class="claim-label">Status</div>
            <div class="claim-value" style="color: #f59e0b;">Under Review</div>
        </div>
    `;
    const claimDetailsContainer = document.querySelector('.claim-details');
    if (claimDetailsContainer) claimDetailsContainer.innerHTML = claimDetailsHTML;
}

function goBack() {
    window.location.href = '/patient-list';
}

// ─── CALL DURATION TIMER ──────────────────────────────────
let duration = 0;
let timerInterval = null;

function startTimer() {
    timerInterval = setInterval(() => {
        duration++;
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        const el = document.getElementById('call-duration');
        if (el) el.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

// ─── VOICE AGENT STATE ────────────────────────────────────
let isAgentActive = false;
let isListening = false;
let recognition = null;
let audioContext = null;
let analyser = null;
let micStream = null;
let animationFrameId = null;
let conversationHistory = [];

const GROQ_API_KEY = 'groq_key_here';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

function buildSystemPrompt() {
    const p = patientData || {};
    return `You are an AI medical billing specialist agent calling an insurance company on behalf of Epic Claims Resolution Center.
You are making an outbound call to resolve a specific claim. You are not talking to the patient.

CLAIM YOU ARE RESOLVING:
- Patient Name: ${p.name || 'Unknown'}
- Patient DOB: ${p.dob || 'N/A'}
- Insurance Company: ${p.insurance || 'N/A'}
- Policy Number: ${p.policyNumber || 'N/A'}
- Claim ID: ${p.claimId || 'N/A'}
- Service Date: ${p.serviceDate || 'N/A'}
- Provider: ${p.provider || 'N/A'}
- Claim Amount: ${p.claimAmount || 'N/A'}
- Claim Type: ${p.claimType || 'N/A'}
- Current Status: ${p.status || 'N/A'}

YOUR GOAL:
Resolve this claim as efficiently as possible. Depending on what the insurance rep tells you, navigate these scenarios:

1. CLAIM IS PENDING
- Ask specifically what is blocking it (missing documentation, prior auth, coding issue)
- Push to get a resolution timeline
- Confirm what exactly needs to be submitted and to where

2. CLAIM NEEDS DOCUMENTATION
- Confirm exactly which documents are needed
- Ask for a fax number or submission portal
- Get a reference number for the call

3. CLAIM IS DENIED
- Ask for the specific denial reason and denial code
- Request a peer-to-peer review if clinically denied
- Ask about the appeals process and deadline

4. CLAIM IS APPROVED
- Confirm the approved amount and expected payment date
- Ask if an EOB has been issued
- Thank the rep and close the call professionally

CONVERSATION RULES:
- You initiated this call so lead it with purpose and confidence
- Keep responses short, 1 to 3 sentences max, this is a voice call
- Never use markdown, bullet points, or any formatting
- Ask one question at a time
- Always get a reference number before ending the call
- If transferred or put on hold, acknowledge it and wait patiently`;
}

// ─── TOGGLE AGENT ─────────────────────────────────────────
async function toggleAgent() {
    if (!isAgentActive) {
        await startAgent();
    } else {
        stopAgent();
    }
}

async function startAgent() {
    isAgentActive = true;
    updateAgentUI(true);
    startTimer();
    conversationHistory = [];

    const opening = patientData
        ? `Hello, this is the Epic Claims Resolution Center calling regarding claim ${patientData.claimId} for ${patientData.name}. May I speak with someone in claims processing?`
        : `Hello, this is the Epic Claims Resolution Center. May I speak with someone in claims processing?`;

    conversationHistory.push({ role: 'assistant', content: opening });

    appendTranscript('Agent', opening);
    await speak(opening);
    if (isAgentActive) {
        setTimeout(() => startListening(), 1000);
    }
}

function stopAgent() {
    isAgentActive = false;
    isListening = false;
    stopTimer();
    stopMic();
    stopWaveform();
    updateAgentUI(false);
    window.speechSynthesis.cancel();
    if (recognition) {
        recognition.abort();
        recognition = null;
    }
    appendTranscript('System', 'Call ended.');
}

// ─── UI STATE ─────────────────────────────────────────────
function updateAgentUI(active) {
    const btn = document.getElementById('agent-toggle-btn');
    const statusDot = document.getElementById('agent-status-dot');
    const statusText = document.getElementById('agent-status-text');
    const waveform = document.getElementById('waveform-container');

    if (active) {
        btn.textContent = '⏹ End Call';
        btn.classList.add('active');
        statusDot.classList.add('live');
        statusText.textContent = 'Live Call';
        waveform.style.display = 'flex';
    } else {
        btn.textContent = '▶ Start Call';
        btn.classList.remove('active');
        statusDot.classList.remove('live');
        statusText.textContent = 'Agent Idle';
        waveform.style.display = 'none';
        document.getElementById('call-duration').textContent = '0:00';
        duration = 0;
    }
}

// ─── SPEECH RECOGNITION (STT) ─────────────────────────────
function startListening() {
    if (isListening) return; // 🔒 prevent double-start

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        appendTranscript('System', 'Speech recognition not supported in this browser.');
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let interimEl = null;

    recognition.onstart = () => {
        isListening = true;
        startMicVisualizer();
        setListeningIndicator(true);
    };

    recognition.onresult = (event) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                final += event.results[i][0].transcript;
            } else {
                interim += event.results[i][0].transcript;
            }
        }

        if (interim) {
            if (!interimEl) {
                interimEl = document.createElement('div');
                interimEl.className = 'transcript-line interim';
                interimEl.innerHTML = `<div class="speaker rep-speaker">Insurance Rep:</div><div class="interim-text"></div>`;
                document.getElementById('transcription').appendChild(interimEl);
                scrollTranscript();
            }
            interimEl.querySelector('.interim-text').textContent = interim;
        }

        if (final.trim()) {
            if (interimEl) { interimEl.remove(); interimEl = null; }
            appendTranscript('Insurance Rep', final.trim());
            handleRepResponse(final.trim());
        }
    };

    recognition.onend = () => {
        isListening = false;
        setListeningIndicator(false);
        stopMicVisualizer();
        if (interimEl) { interimEl.remove(); interimEl = null; }

        if (isAgentActive) {
            setTimeout(() => {
                if (isAgentActive && !isListening) startListening();
            }, 500);
        }
    };

    recognition.onerror = (e) => {
        // Suppress aborted and no-speech — both are normal browser behavior
        if (e.error !== 'no-speech' && e.error !== 'aborted') {
            appendTranscript('System', `Mic error: ${e.error}`);
        }
        isListening = false;
        setListeningIndicator(false);

        if (isAgentActive) {
            const delay = e.error === 'aborted' ? 800 : 500;
            setTimeout(() => {
                if (isAgentActive && !isListening) startListening();
            }, delay);
        }
    };

    recognition.start();
}

function setListeningIndicator(on) {
    const indicator = document.getElementById('listening-indicator');
    if (indicator) indicator.style.opacity = on ? '1' : '0';
}

// ─── GROQ AI RESPONSE ─────────────────────────────────────
async function handleRepResponse(repText) {
    conversationHistory.push({ role: 'user', content: repText });

    const thinkingEl = appendTranscript('Agent', '...', true);

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: [
                    { role: 'system', content: buildSystemPrompt() },
                    ...conversationHistory
                ],
                max_tokens: 150,
                temperature: 0.6
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Groq request failed: ${response.status} ${errText}`);
        }

        const data = await response.json();
        const agentReply = data.choices?.[0]?.message?.content?.trim();

        if (agentReply) {
            conversationHistory.push({ role: 'assistant', content: agentReply });
            thinkingEl.querySelector('.transcript-text').textContent = agentReply;
            await speak(agentReply);
            if (isAgentActive) {
                setTimeout(() => startListening(), 1000);
            }
        } else {
            thinkingEl.querySelector('.transcript-text').textContent = '[No response from AI]';
        }
    } catch (err) {
        thinkingEl.querySelector('.transcript-text').textContent = `[Error: ${err.message}]`;
        console.error('Groq error:', err);
    }
}

// ─── TTS (Web Speech API) ─────────────────────────────────
function speak(text) {
    return new Promise((resolve) => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 1;
        utterance.volume = 1;
        utterance.onend = resolve;
        utterance.onerror = resolve;
        window.speechSynthesis.speak(utterance);
    });
}

// ─── TRANSCRIPT ───────────────────────────────────────────
function clearTranscriptPlaceholder() {
    const box = document.getElementById('transcription');
    const placeholder = box.querySelector('.transcript-placeholder');
    if (placeholder) placeholder.remove();
}

function appendTranscript(speaker, text, isThinking = false) {
    clearTranscriptPlaceholder();
    const box = document.getElementById('transcription');
    const line = document.createElement('div');
    const isAgent = speaker === 'Agent';
    const isSystem = speaker === 'System';

    line.className = `transcript-line ${isAgent ? 'agent-line' : isSystem ? 'system-line' : 'rep-line'}`;
    line.innerHTML = `
        <div class="speaker ${isAgent ? 'agent-speaker' : isSystem ? 'system-speaker' : 'rep-speaker'}">${speaker}:</div>
        <div class="transcript-text ${isThinking ? 'thinking' : ''}">${text}</div>
    `;
    box.appendChild(line);
    scrollTranscript();
    return line;
}

function scrollTranscript() {
    const box = document.getElementById('transcription');
    box.scrollTop = box.scrollHeight;
}

// ─── WAVEFORM VISUALIZER ──────────────────────────────────
async function startMicVisualizer() {
    try {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 64;
        const source = audioContext.createMediaStreamSource(micStream);
        source.connect(analyser);
        drawWaveform();
    } catch (e) {
        console.warn('Mic visualizer error:', e);
    }
}

function stopMicVisualizer() {
    cancelAnimationFrame(animationFrameId);
    if (audioContext) { audioContext.close(); audioContext = null; }
}

function stopMic() {
    if (micStream) {
        micStream.getTracks().forEach(t => t.stop());
        micStream = null;
    }
}

function drawWaveform() {
    const canvas = document.getElementById('waveform-canvas');
    if (!canvas || !analyser) return;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
        animationFrameId = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.2;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * canvas.height;
            const alpha = 0.5 + (dataArray[i] / 255) * 0.5;
            ctx.fillStyle = `rgba(34, 197, 94, ${alpha})`;
            ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
            x += barWidth;
        }
    }
    draw();
}

function stopWaveform() {
    cancelAnimationFrame(animationFrameId);
    const canvas = document.getElementById('waveform-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

// ─── ACTION BUTTONS ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    if (!sessionStorage.getItem('auth_token')) {
        window.location.href = '/login';
        return;
    }

    document.querySelectorAll('.btn-action').forEach(btn => {
        btn.addEventListener('click', function () {
            const action = this.textContent.trim();
            console.log('Action clicked:', action);
            alert(`Action triggered: ${action}`);
        });
    });
});