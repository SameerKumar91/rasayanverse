/* =========================================================
   RASAYANVERSE
   PRACTICAL 02
   DETERMINATION OF pH
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       STATE
    ===================================================== */

    const state = {
        step: 1,
        selectedSample: null,
        measuring: false,

        readings: {
            hcl: false,
            water: false,
            naoh: false
        }
    };


    /* =====================================================
       SAMPLE DATA
    ===================================================== */

    const samples = {

        hcl: {
            name: "Hydrochloric Acid",
            formula: "HCl",
            ph: 2,
            nature: "Acidic"
        },

        water: {
            name: "Distilled Water",
            formula: "H₂O",
            ph: 7,
            nature: "Neutral"
        },

        naoh: {
            name: "Sodium Hydroxide",
            formula: "NaOH",
            ph: 12,
            nature: "Basic"
        }

    };


    /* =====================================================
       HELPER
    ===================================================== */

    function $(id) {
        return document.getElementById(id);
    }


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const resetExperiment =
        $("resetExperiment");

    const measurePh =
        $("measurePh");

    const meterValue =
        $("meterValue");

    const phSolution =
        $("phSolution");

    const sampleValue =
        $("sampleValue");

    const formulaValue =
        $("formulaValue");

    const readingValue =
        $("readingValue");

    const natureValue =
        $("natureValue");

    const measurementIndicator =
        $("measurementIndicator");

    const labStatus =
        $("labStatus");

    const instructionTitle =
        $("instructionTitle");

    const instructionText =
        $("instructionText");

    const instructionProgress =
        $("instructionProgress");

    const instructionCount =
        $("instructionCount");


    const electrodeSystem =
        document.querySelector(
            ".ph-electrode-system"
        );


    const sampleButtons =
        document.querySelectorAll(
            ".sample-lab-button"
        );


    /* =====================================================
       CHECK REQUIRED ELEMENTS
    ===================================================== */

    if (!measurePh) {
        console.error(
            "Practical 02: #measurePh button not found."
        );
        return;
    }

    if (!electrodeSystem) {
        console.error(
            "Practical 02: .ph-electrode-system not found."
        );
        return;
    }


    /* =====================================================
       INSTRUCTIONS
    ===================================================== */

    const instructions = {

        1: {
            title: "Select a sample",

            text:
                "Choose HCl, distilled water or NaOH to begin the pH measurement."
        },

        2: {
            title: "Place the electrode",

            text:
                "The pH electrode is positioned vertically above the beaker. Lower it into the solution without touching the bottom."
        },

        3: {
            title: "Measure the pH",

            text:
                "The pH meter is measuring the solution. Wait for the digital reading to stabilize."
        },

        4: {
            title: "Record the pH",

            text:
                "Record the stable pH value and identify whether the solution is acidic, neutral or basic."
        }

    };


    /* =====================================================
       UPDATE INSTRUCTIONS
    ===================================================== */

    function updateInstructions() {

        const instruction =
            instructions[state.step];

        if (!instruction) {
            return;
        }


        if (instructionTitle) {

            instructionTitle.textContent =
                instruction.title;

        }


        if (instructionText) {

            instructionText.textContent =
                instruction.text;

        }


        if (instructionCount) {

            instructionCount.textContent =
                `Step ${state.step} of 4`;

        }


        if (instructionProgress) {

            instructionProgress.style.width =
                `${state.step * 25}%`;

        }

    }


    /* =====================================================
       UPDATE LAB STATUS
    ===================================================== */

    function setLabStatus(text) {

        if (labStatus) {
            labStatus.textContent = text;
        }

    }


    /* =====================================================
       UPDATE INDICATOR
    ===================================================== */

    function setIndicator(text, success = false) {

        if (!measurementIndicator) {
            return;
        }


        measurementIndicator.classList.toggle(
            "reached",
            success
        );


        measurementIndicator.innerHTML = `
            <span></span>
            ${text}
        `;

    }


    /* =====================================================
       CHANGE SOLUTION
    ===================================================== */

    function changeSolution(sampleId) {

        if (!phSolution) {
            return;
        }


        if (sampleId === "hcl") {

            phSolution.style.background =
                "linear-gradient(180deg, rgba(248,113,113,.62), rgba(239,68,68,.78))";

        }

        else if (sampleId === "water") {

            phSolution.style.background =
                "linear-gradient(180deg, rgba(186,230,253,.72), rgba(125,211,252,.78))";

        }

        else if (sampleId === "naoh") {

            phSolution.style.background =
                "linear-gradient(180deg, rgba(147,197,253,.72), rgba(96,165,250,.82))";

        }

    }


    /* =====================================================
       SELECT SAMPLE
    ===================================================== */

    function selectSample(sampleId) {

        if (state.measuring) {
            return;
        }


        const sample =
            samples[sampleId];

        if (!sample) {
            return;
        }


        state.selectedSample =
            sampleId;

        state.step =
            2;


        /* Remove previous selected state */

        sampleButtons.forEach(
            button => {

                button.classList.remove(
                    "selected"
                );

            }
        );


        /* Select clicked button */

        const clickedButton =
            document.querySelector(
                `.sample-lab-button[data-sample="${sampleId}"]`
            );


        if (clickedButton) {

            clickedButton.classList.add(
                "selected"
            );

        }


        /* Update observation panel */

        if (sampleValue) {

            sampleValue.textContent =
                sample.name;

        }


        if (formulaValue) {

            formulaValue.textContent =
                sample.formula;

        }


        if (readingValue) {

            readingValue.textContent =
                "—";

        }


        if (natureValue) {

            natureValue.textContent =
                "—";

        }


        if (meterValue) {

            meterValue.textContent =
                "--";

        }


        /* Change liquid */

        changeSolution(sampleId);


        /* Reset electrode position */

        electrodeSystem.classList.remove(
            "inserted"
        );


        /* Enable measure button */

        measurePh.disabled =
            false;


        setLabStatus(
            "Sample selected"
        );


        setIndicator(
            "Sample selected. Click “Measure pH” to begin."
        );


        updateInstructions();

    }


    /* =====================================================
       SAMPLE BUTTON EVENTS
    ===================================================== */

    sampleButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                function () {

                    const sampleId =
                        this.dataset.sample;

                    selectSample(sampleId);

                }
            );

        }
    );


    /* =====================================================
       MEASURE pH
    ===================================================== */

    measurePh.addEventListener(
        "click",
        function () {

            if (
                !state.selectedSample ||
                state.measuring
            ) {

                return;

            }


            const sample =
                samples[state.selectedSample];


            if (!sample) {
                return;
            }


            state.measuring =
                true;

            state.step =
                3;


            measurePh.disabled =
                true;


            setLabStatus(
                "Electrode inserted"
            );


            setIndicator(
                "The electrode is inside the solution. The pH reading is stabilizing..."
            );


            updateInstructions();


            /*
             * IMPORTANT ELECTRODE POSITION
             *
             * The CSS centers the entire electrode
             * system over the center of the beaker.
             *
             * Adding .inserted moves the COMPLETE
             * electrode vertically downward.
             *
             * It does NOT move left/right.
             */

            electrodeSystem.classList.add(
                "inserted"
            );


            /* Wait for electrode animation */

            setTimeout(
                function () {

                    if (!state.measuring) {
                        return;
                    }


                    startReadingAnimation(
                        sample
                    );

                },
                750
            );

        }
    );


    /* =====================================================
       pH READING ANIMATION
    ===================================================== */

    function startReadingAnimation(
        sample
    ) {

        setLabStatus(
            "Reading pH"
        );


        setIndicator(
            "Measuring hydrogen-ion activity. Please wait for a stable reading..."
        );


        state.step =
            3;


        updateInstructions();


        let values;


        if (sample.ph === 2) {

            values = [
                8.8,
                6.9,
                5.1,
                3.8,
                2.9,
                2.3,
                2.0
            ];

        }

        else if (sample.ph === 7) {

            values = [
                5.8,
                6.3,
                6.6,
                6.9,
                7.1,
                7.0,
                7.0
            ];

        }

        else {

            values = [
                8.0,
                9.1,
                10.0,
                10.9,
                11.6,
                12.1,
                12.0
            ];

        }


        let index =
            0;


        const timer =
            setInterval(
                function () {

                    if (!state.measuring) {

                        clearInterval(
                            timer
                        );

                        return;

                    }


                    if (
                        index >=
                        values.length
                    ) {

                        clearInterval(
                            timer
                        );


                        finishMeasurement(
                            sample
                        );


                        return;

                    }


                    const currentValue =
                        values[index];


                    if (meterValue) {

                        meterValue.textContent =
                            currentValue.toFixed(1);

                    }


                    if (readingValue) {

                        readingValue.textContent =
                            currentValue.toFixed(1);

                    }


                    index++;

                },
                450
            );

    }


    /* =====================================================
       FINISH MEASUREMENT
    ===================================================== */

    function finishMeasurement(
        sample
    ) {

        state.measuring =
            false;

        state.step =
            4;


        /* Final meter value */

        if (meterValue) {

            meterValue.textContent =
                sample.ph.toFixed(1);

        }


        if (readingValue) {

            readingValue.textContent =
                sample.ph.toFixed(1);

        }


        if (natureValue) {

            natureValue.textContent =
                sample.nature;

        }


        /* Record */

        state.readings[
            state.selectedSample
        ] = true;


        setLabStatus(
            "Measurement complete"
        );


        setIndicator(
            `Stable pH reading obtained: ${sample.ph}.`,
            true
        );


        updateObservation(
            state.selectedSample,
            sample
        );


        updateResult();


        updateInstructions();


        /*
         * Keep electrode INSIDE the beaker.
         *
         * The CSS .inserted state keeps it aligned
         * vertically with the beaker.
         */

        electrodeSystem.classList.add(
            "inserted"
        );

    }


    /* =====================================================
       OBSERVATION TABLE
    ===================================================== */

    function updateObservation(
        sampleId,
        sample
    ) {

        const map = {

            hcl: [
                "observationHcl",
                "natureHcl"
            ],

            water: [
                "observationWater",
                "natureWater"
            ],

            naoh: [
                "observationNaoh",
                "natureNaoh"
            ]

        };


        const ids =
            map[sampleId];


        if (!ids) {
            return;
        }


        const phCell =
            $(ids[0]);


        const natureCell =
            $(ids[1]);


        if (phCell) {

            phCell.textContent =
                sample.ph;

        }


        if (natureCell) {

            natureCell.textContent =
                sample.nature;

        }

    }


    /* =====================================================
       RESULT
    ===================================================== */

    function updateResult() {

        const completed =
            Object.values(
                state.readings
            ).filter(Boolean).length;


        const resultHeading =
            $("resultHeading");


        const resultText =
            $("resultText");


        if (!resultHeading ||
            !resultText) {

            return;

        }


        if (completed === 3) {

            resultHeading.textContent =
                "pH determination completed successfully.";


            resultText.textContent =
                "The observed pH values were 2 for hydrochloric acid, 7 for distilled water and 12 for sodium hydroxide. The samples were classified as acidic, neutral and basic respectively.";

            return;

        }


        if (!state.selectedSample) {

            return;

        }


        const sample =
            samples[
                state.selectedSample
            ];


        resultHeading.textContent =
            `${sample.name} measured successfully.`;


        resultText.textContent =
            `The stable pH reading was ${sample.ph}. The solution is ${sample.nature.toLowerCase()}. Measure the remaining samples to complete the observation.`;

    }


    /* =====================================================
       RESET
    ===================================================== */

    if (resetExperiment) {

        resetExperiment.addEventListener(
            "click",
            resetLab
        );

    }


    function resetLab() {

        state.step =
            1;

        state.selectedSample =
            null;

        state.measuring =
            false;


        state.readings = {

            hcl: false,

            water: false,

            naoh: false

        };


        /* Buttons */

        sampleButtons.forEach(
            button => {

                button.classList.remove(
                    "selected"
                );

            }
        );


        measurePh.disabled =
            true;


        /* Meter */

        if (meterValue) {

            meterValue.textContent =
                "--";

        }


        if (sampleValue) {

            sampleValue.textContent =
                "—";

        }


        if (formulaValue) {

            formulaValue.textContent =
                "—";

        }


        if (readingValue) {

            readingValue.textContent =
                "—";

        }


        if (natureValue) {

            natureValue.textContent =
                "—";

        }


        /* Solution */

        if (phSolution) {

            phSolution.style.background =
                "linear-gradient(180deg,rgba(191,219,254,.72),rgba(147,197,253,.82))";

        }


        /* Electrode */

        electrodeSystem.classList.remove(
            "inserted"
        );


        /* Status */

        setLabStatus(
            "Ready"
        );


        setIndicator(
            "Select a sample to begin."
        );


        /* Observation */

        [
            "observationHcl",
            "natureHcl",
            "observationWater",
            "natureWater",
            "observationNaoh",
            "natureNaoh"
        ].forEach(
            function (id) {

                const cell =
                    $(id);

                if (cell) {

                    cell.textContent =
                        "—";

                }

            }
        );


        /* Result */

        const resultHeading =
            $("resultHeading");


        const resultText =
            $("resultText");


        if (resultHeading) {

            resultHeading.textContent =
                "Complete the virtual pH experiment to obtain the result.";

        }


        if (resultText) {

            resultText.textContent =
                "Measure the given solutions and record their stable pH values.";

        }


        updateInstructions();

    }


    /* =====================================================
       QUIZ
    ===================================================== */

    const quizSubmit =
        $("quizSubmit");


    const quizResult =
        $("quizResult");


    if (quizSubmit) {

        quizSubmit.addEventListener(
            "click",
            function () {

                const answers = {

                    q1: "b",

                    q2: "b",

                    q3: "c"

                };


                let score =
                    0;


                Object.keys(
                    answers
                ).forEach(
                    function (question) {

                        const selected =
                            document.querySelector(
                                `input[name="${question}"]:checked`
                            );


                        if (
                            selected &&
                            selected.value ===
                            answers[question]
                        ) {

                            score++;

                        }

                    }
                );


                let message;


                if (score === 3) {

                    message =
                        "Excellent! You understand the pH experiment very well. 🎉";

                }

                else if (score === 2) {

                    message =
                        "Good work! Review the pH scale once more.";

                }

                else {

                    message =
                        "Keep learning! Review the pH concept and try the quiz again.";

                }


                if (quizResult) {

                    quizResult.innerHTML = `
                        Score:
                        <strong>${score}/3</strong>
                        <br>
                        ${message}
                    `;


                    quizResult.classList.add(
                        "show"
                    );

                }

            }
        );

    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    updateInstructions();

});