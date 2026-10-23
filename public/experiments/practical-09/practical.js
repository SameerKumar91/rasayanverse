/*
 * RasayanVerse — repaired virtual laboratory controller
 * This file intentionally keeps the practical-specific steps/data from the
 * supplied project while fixing action unlocking, sample selection, reset,
 * progress state, observation updates, visual state changes and quiz scoring.
 */
document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const PRACTICAL_NO = 9;
    const steps = [{"title":"Prepare sample","text":"Click Prepare Sample."},{"title":"Add acid","text":"Add dilute nitric acid to prepare the test."},{"title":"Add AgNO₃","text":"Click Add Silver Nitrate."},{"title":"Observe precipitate","text":"A white AgCl precipitate forms for a chloride-positive sample."},{"title":"Record inference","text":"Record whether chloride is present."}];
    const config = {"required":false,"scene":"chloride","complete":"A white silver chloride precipitate indicated the presence of chloride ions.","fixed":["Test sample","AgNO₃ added","White precipitate","AgCl formed","Completed"]};

    let current = 1;
    let selected = null;
    let done = false;
    let busy = false;

    const qs = (selector) => document.querySelector(selector);
    const buttons = [...document.querySelectorAll(".lab-action-button")];
    const sampleButtons = [...document.querySelectorAll(".sample-choice")];

    const instructionTitle = qs("#instructionTitle");
    const instructionText = qs("#instructionText");
    const progress = qs("#instructionProgress");
    const count = qs("#instructionCount");
    const status = qs("#labStatus");
    const reading = qs("#readingValue");
    const colour = qs("#colourValue");
    const endpoint = qs("#endpointValue");
    const indicator = qs("#endpointIndicator");
    const resultHeading = qs("#resultHeading");
    const resultText = qs("#resultText");
    const reset = qs("#resetExperiment");
    const quizSubmit = qs("#quizSubmit");
    const quizResult = qs("#quizResult");
    const sceneEl = qs(".concept-lab-scene");

    const setText = (el, value) => { if (el) el.textContent = value; };

    function observationValues() {
        if (config.values && selected && config.values[selected]) return config.values[selected];
        return config.fixed || ["Complete","—","—","—","Recorded"];
    }

    function updateObservation() {
        const cells = [...document.querySelectorAll('[id^="obs"]')];
        const vals = observationValues();
        cells.forEach((cell, index) => setText(cell, vals[index] ?? "—"));
    }

    function selectionRequiredNow() {
        if (!config.required && !config.selection_at) return false;
        if (config.selection_at) return current === config.selection_at && !selected;
        return current === 1 && !selected;
    }

    function updateSceneState() {
        if (!sceneEl) return;
        for (let n=1; n<=6; n++) sceneEl.classList.remove(`progress-${n}`);
        sceneEl.classList.add(`progress-${Math.min(current, steps.length)}`);
        sceneEl.classList.toggle("completed", done);
        sceneEl.classList.toggle("sample-acidic", selected === "Acidic Sample");
        sceneEl.classList.toggle("sample-neutral", selected === "Distilled Water");
        sceneEl.classList.toggle("sample-basic", selected === "Basic Sample");
        sceneEl.classList.toggle("choice-soft", selected === "Soft Water");
        sceneEl.classList.toggle("choice-moderate", selected === "Moderate Water");
        sceneEl.classList.toggle("choice-hard", selected === "Hard Water");
        sceneEl.classList.toggle("choice-sodium", selected === "Sodium Salt");
        sceneEl.classList.toggle("choice-potassium", selected === "Potassium Salt");
        sceneEl.classList.toggle("choice-copper", selected === "Copper Salt");
        sceneEl.classList.toggle("choice-acid", selected === "Add Acid");
        sceneEl.classList.toggle("choice-base", selected === "Add Base");
    }

    function update() {
        const step = steps[current - 1] || steps[steps.length - 1];
        setText(instructionTitle, step.title);
        setText(instructionText, step.text);
        setText(count, `Step ${Math.min(current, steps.length)} of ${steps.length}`);
        if (progress) progress.style.width = `${(Math.min(current, steps.length) / steps.length) * 100}%`;
        setText(reading, `${Math.min(current, steps.length)} / ${steps.length}`);

        buttons.forEach((button, index) => {
            const isCurrent = index === current - 1;
            button.disabled = done || busy || !isCurrent || selectionRequiredNow();
        });

        if (indicator && !done) {
            indicator.classList.remove("reached");
            indicator.innerHTML = `<span></span> ${selectionRequiredNow() ? "Choose the required sample first." : "Complete the current action to continue."}`;
        }

        updateObservation();
        updateSceneState();
    }

    function selectSample(button) {
        if (done || busy) return;
        selected = button.dataset.sample || button.textContent.trim();
        sampleButtons.forEach((b) => b.classList.toggle("selected", b === button));
        setText(colour, selected);
        setText(status, "Selection recorded");
        if (endpoint) endpoint.textContent = "Ready";
        update();
    }

    sampleButtons.forEach((button) => button.addEventListener("click", () => selectSample(button)));

    function performStep() {
        if (done || busy) return;
        if (selectionRequiredNow()) {
            setText(status, "Choose an option first");
            sampleButtons[0]?.focus();
            return;
        }

        const button = buttons[current - 1];
        if (!button) return;

        busy = true;
        button.classList.add("working");
        setText(status, "Performing…");
        updateSceneState();

        window.setTimeout(() => {
            button.classList.remove("working");
            busy = false;

            if (current < steps.length) {
                current += 1;
                setText(status, "Step completed");
                setText(endpoint, current === steps.length ? "Final action ready" : "In progress");
                update();
                return;
            }

            done = true;
            current = steps.length;
            buttons.forEach((b) => b.disabled = true);
            setText(status, "Practical completed");
            setText(endpoint, "Completed");
            if (indicator) {
                indicator.classList.add("reached");
                indicator.innerHTML = "<span></span> Practical completed successfully.";
            }
            const vals = observationValues();
            setText(colour, vals[1] || selected || "Observation recorded");
            setText(resultHeading, "Practical completed successfully.");
            setText(resultText, config.complete);
            updateObservation();
            updateSceneState();
        }, 500);
    }

    buttons.forEach((button) => button.addEventListener("click", performStep));

    if (reset) reset.addEventListener("click", () => window.location.reload());

    if (quizSubmit && quizResult) {
        const answers = { q1: "a", q2: "a", q3: "a" };
        quizSubmit.addEventListener("click", () => {
            let score = 0;
            Object.entries(answers).forEach(([question, answer]) => {
                const selectedAnswer = document.querySelector(`input[name="${question}"]:checked`);
                if (selectedAnswer?.value === answer) score += 1;
            });
            const message = score === 3
                ? "Excellent! You understand this practical very well. 🎉"
                : score === 2
                    ? "Good work! Review the procedure once more."
                    : "Keep learning! Review the concept and try the quiz again.";
            quizResult.innerHTML = `Score: <strong>${score}/3</strong><br>${message}`;
            quizResult.classList.add("show");
        });
    }

    update();
});
