const states = {
    start: "start",
    collect_name: "collect_name",
    collect_dob: "collect_dob",
    verify_identity: "verify_identity",
    determine_issue: "determine_issue",
    handle_balance: "handle_balance",
    handle_claim_status: "handle_claim_status",
    handle_payment_plan: "handle_payment_plan",
    closing: "closing"
}

function detectIntent(input) {
    const text = input.toLowerCase();
    if (text.includes("bill") || text.includes("balance")) return "ask_balance";
    if (text.includes("claim") || text.includes("status")) return "ask_claim_status";
    if (text.includes("payment plan")) return "ask_payment_plan";
    if (text.match(/[a-z]+ [a-z]+/)) return "provide_name";
    if (text.match(/\d{1,2}[-\/ ]\d{1,2}[-\/ ]\d{2,4}/)) return "provide_dob";
    if (text.includes("bye")) return "goodbye";
    return "none";
}


function createEngine() {
    return {
        state: states.start,
        memory: {
            name: null,
            dob: null
        },
        handle(input) {
            const intent = detectIntent(input);
            switch (this.state) {
                case states.start:
                    this.state = states.collect_name;
                    return "Hello, I can help with medical billing. May I have your full name?";
                case states.collect_name:
                    if (intent === "provide_name") {
                        this.memory.name = input;
                        this.state = states.collect_dob;
                        return "Thank you. What is your date of birth?";
                    }
                    return "Please provide your full name.";
                case states.collect_dob:
                    if (intent === "provide_dob") {
                        this.memory.dob = input;
                        this.state = states.determine_issue;
                        return "Thanks. How can I help with your billing today?";
                    }
                    return "Please provide your date of birth.";
                case states.determine_issue:
                    if (intent === "ask_balance") {
                        this.state = states.handle_balance;
                        return "Your balance is 423 dollars. Would you like details?";
                    }
                    if (intent === "ask_claim_status") {
                        this.state = states.handle_claim_status;
                        return "Your claim is still pending. Would you like more information?";
                    }
                    if (intent === "ask_payment_plan") {
                        this.state = states.handle_payment_plan;
                        return "You qualify for a payment plan. Would you like to set it up?";
                    }
                    return "I can help with bills, claims, or payment plans. What would you like to do?";
                case states.handle_balance:
                    if (intent === "goodbye") {
                        this.state = states.closing;
                        return "Thank you for calling. Goodbye.";
                    }
                    return "Your bill is due to your deductible not being met. Anything else you need?";
                case states.handle_claim_status:
                    if (intent === "goodbye") {
                        this.state = states.closing;
                        return "Okay. Have a great day.";
                    }
                    return "Your claim is being reviewed. Anything else?";
                case states.handle_payment_plan:
                    if (intent === "goodbye") {
                        this.state = states.closing;
                        return "Goodbye.";
                    }
                    return "Your payment plan is now active. Anything else?";
                case states.closing:
                    return "Goodbye.";
                default:
                    return "I’m not sure what to do. Let's start over.";
            }
        }
    };
}

// Example usage:
// const bot = createEngine();
// console.log(bot.handle("hi"));
// console.log(bot.handle("Sarah Thompson"));
// console.log(bot.handle("04/09/1981"));
// console.log(bot.handle("I have a bill"));