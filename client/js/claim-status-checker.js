let GROQ_CLAIM_CHEKCER_KEY = "key-here";
let GROQ_CLAIM_CHECKER_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';


function checkClaimStatus(history) {
    console.log(history);
}

// ─── CLAIM STATUS CHECK ───────────────────────────────────
async function checkClaimStatus(history) {
    if (!history || history.length === 0) return;

    try {
        const transcript = history
            .map(m => `${m.role === 'assistant' ? 'Agent' : 'Insurance Rep'}: ${m.content}`)
            .join('\n');

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: [
                    {
                        role: 'system',
                        content: `You are a medical billing analyst. Based on the call transcript provided, determine if the claim status should be updated.
Return ONLY a valid JSON object with no extra text, no markdown, no explanation.
The JSON must have exactly these fields:
{
  "shouldUpdate": true or false,
  "newStatus": one of "resolved", "pending", "denied", "under_review", "approved"
  "reason": one short sentence explaining why
}`
                    },
                    {
                        role: 'user',
                        content: `Here is the call transcript:\n\n${transcript}`
                    }
                ],
                max_tokens: 100,
                temperature: 0.1
            })
        });

        const data = await response.json();
        const raw = data.choices?.[0]?.message?.content?.trim();
        const result = JSON.parse(raw);

        console.log('📋 Claim analysis:', result);

        if (result.shouldUpdate && result.newStatus && patientData?.id) {
            await updateClaimStatus(patientData.id, result.newStatus, result.reason);
        }
    } catch (err) {
        console.error('Claim status check failed:', err);
    }
}

async function updateClaimStatus(patientId, newStatus, reason) {
    try {
        const res = await fetch(`/api/patients/${patientId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (res.ok) {
            appendTranscript('System', `✅ Claim status updated to "${newStatus}" — ${reason}`);

            // Update the status value displayed in the claim details card
            const statusEl = document.querySelector('.claim-details .claim-item:last-child .claim-value');
            if (statusEl) {
                statusEl.textContent = newStatus.replace('_', ' ');
                statusEl.style.color = newStatus === 'resolved' || newStatus === 'approved'
                    ? '#22c55e'
                    : newStatus === 'denied'
                    ? '#ef4444'
                    : '#f59e0b';
            }
        } else {
            console.error('Failed to update claim status');
        }
    } catch (err) {
        console.error('PATCH error:', err);
    }
}