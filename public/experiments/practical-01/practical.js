/* =========================================================
   RASAYANVERSE
   PRACTICAL 01
   ACID–BASE TITRATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {


        /* =================================================
           STATE
        ================================================== */

        const state = {

            step: 1,

            acidAdded: false,

            indicatorAdded: false,

            volume: 0,

            endpointReached: false

        };


        const ENDPOINT =
            10.0;



        /* =================================================
           ELEMENTS
        ================================================== */

        const addAcid =
            document.getElementById("addAcid");

        const addIndicator =
            document.getElementById("addIndicator");

        const addNaOH =
            document.getElementById("addNaOH");

        const resetButton =
            document.getElementById(
                "resetExperiment"
            );


        const acidLiquid =
            document.getElementById(
                "acidLiquid"
            );

        const buretteSolution =
            document.getElementById(
                "buretteSolution"
            );

        const fallingDrop =
            document.getElementById(
                "fallingDrop"
            );

        const buretteValve =
            document.getElementById(
                "buretteValve"
            );


        const buretteValue =
            document.getElementById(
                "buretteValue"
            );

        const readingValue =
            document.getElementById(
                "readingValue"
            );

        const colourValue =
            document.getElementById(
                "colourValue"
            );

        const endpointValue =
            document.getElementById(
                "endpointValue"
            );


        const endpointIndicator =
            document.getElementById(
                "endpointIndicator"
            );


        const instructionTitle =
            document.getElementById(
                "instructionTitle"
            );

        const instructionText =
            document.getElementById(
                "instructionText"
            );

        const instructionProgress =
            document.getElementById(
                "instructionProgress"
            );

        const instructionCount =
            document.getElementById(
                "instructionCount"
            );

        const labStatus =
            document.getElementById(
                "labStatus"
            );


        const observationFinal =
            document.getElementById(
                "observationFinal"
            );

        const observationUsed =
            document.getElementById(
                "observationUsed"
            );

        const observationEndpoint =
            document.getElementById(
                "observationEndpoint"
            );


        const resultHeading =
            document.getElementById(
                "resultHeading"
            );

        const resultText =
            document.getElementById(
                "resultText"
            );



        /* =================================================
           PROCEDURE INSTRUCTIONS
        ================================================== */

        const instructions = {

            1: {

                title:
                    "Add the acid sample",

                text:
                    "Click “Add HCl Sample” to place 10 mL of hydrochloric acid in the conical flask."

            },

            2: {

                title:
                    "Add phenolphthalein",

                text:
                    "Now add a few drops of phenolphthalein indicator. The acidic solution remains colourless."

            },

            3: {

                title:
                    "Add NaOH slowly",

                text:
                    "Click “Add NaOH Drop” to deliver NaOH from the burette. Watch the volume and colour carefully."

            },

            4: {

                title:
                    "Endpoint reached",

                text:
                    "A faint pink colour has appeared. The acid has reached the titration endpoint."

            }

        };



        /* =================================================
           UPDATE INSTRUCTIONS
        ================================================== */

        function updateInstructions() {

            const current =
                instructions[state.step];


            if (!current) {
                return;
            }


            instructionTitle.textContent =
                current.title;


            instructionText.textContent =
                current.text;


            instructionCount.textContent =
                `Step ${state.step} of 4`;


            instructionProgress.style.width =
                `${state.step * 25}%`;

        }



        /* =================================================
           UPDATE READINGS
        ================================================== */

        function updateReadings() {

            const formattedVolume =
                state.volume.toFixed(1);


            buretteValue.textContent =
                `${formattedVolume} mL`;


            readingValue.textContent =
                `${formattedVolume} mL`;


            if (state.endpointReached) {

                colourValue.textContent =
                    "Faint Pink";

                endpointValue.textContent =
                    "Reached";

            } else if (
                state.volume >= 7
            ) {

                colourValue.textContent =
                    "Very Pale Pink";

                endpointValue.textContent =
                    "Approaching";

            } else if (
                state.volume > 0
            ) {

                colourValue.textContent =
                    "Colourless";

                endpointValue.textContent =
                    "Not reached";

            } else {

                colourValue.textContent =
                    "Colourless";

                endpointValue.textContent =
                    "Not reached";

            }

        }



        /* =================================================
           ADD ACID
        ================================================== */

        function handleAddAcid() {

            if (state.acidAdded) {
                return;
            }


            state.acidAdded = true;

            state.step = 2;


            addAcid.disabled = true;

            addIndicator.disabled = false;


            labStatus.textContent =
                "Acid sample prepared";


            acidLiquid.style.height =
                "52%";


            updateInstructions();

            updateReadings();

        }



        /* =================================================
           ADD INDICATOR
        ================================================== */

        function handleAddIndicator() {

            if (
                !state.acidAdded ||
                state.indicatorAdded
            ) {
                return;
            }


            state.indicatorAdded = true;

            state.step = 3;


            addIndicator.disabled = true;

            addNaOH.disabled = false;


            labStatus.textContent =
                "Indicator added";


            updateInstructions();

            updateReadings();

        }



        /* =================================================
           ADD NaOH
        ================================================== */

        function handleAddNaOH() {

            if (
                !state.indicatorAdded ||
                state.endpointReached
            ) {
                return;
            }


            state.volume =
                Math.min(
                    ENDPOINT,
                    Number(
                        (
                            state.volume + 0.5
                        ).toFixed(1)
                    )
                );


            /* Drop animation */

            fallingDrop.classList.remove(
                "active"
            );


            void fallingDrop.offsetWidth;


            fallingDrop.classList.add(
                "active"
            );


            /* Valve movement */

            buretteValve.style.transform =
                "translateX(-50%) rotate(12deg)";


            setTimeout(
                () => {

                    buretteValve.style.transform =
                        "translateX(-50%)";

                },
                180
            );


            /* Burette liquid */

            const remaining =
                78 -
                (
                    state.volume /
                    ENDPOINT
                ) * 58;


            buretteSolution.style.height =
                `${Math.max(
                    20,
                    remaining
                )}%`;


            /* Endpoint */

            if (
                state.volume >= ENDPOINT
            ) {

                reachEndpoint();

            }


            updateReadings();

        }



        /* =================================================
           ENDPOINT
        ================================================== */

        function reachEndpoint() {

            state.endpointReached =
                true;

            state.step = 4;


            acidLiquid.classList.add(
                "endpoint"
            );


            addNaOH.disabled = true;


            labStatus.textContent =
                "Endpoint reached";


            endpointIndicator.classList.add(
                "reached"
            );


            endpointIndicator.innerHTML =
                `
                    <span></span>
                    Endpoint reached — faint pink colour is visible.
                `;


            observationFinal.textContent =
                "10.0 mL";


            observationUsed.textContent =
                "10.0 mL";


            observationEndpoint.textContent =
                "Faint pink";


            resultHeading.textContent =
                "Titration endpoint reached successfully.";


            resultText.textContent =
                "The standard NaOH solution required 10.0 mL to neutralize the 10 mL HCl sample. For the simplified 1:1 reaction HCl + NaOH → NaCl + H₂O, this corresponds to approximately 0.10 M HCl.";


            updateInstructions();

            updateReadings();

        }



        /* =================================================
           RESET
        ================================================== */

        function resetExperiment() {

            state.step = 1;

            state.acidAdded = false;

            state.indicatorAdded = false;

            state.volume = 0;

            state.endpointReached = false;


            addAcid.disabled = false;

            addIndicator.disabled = true;

            addNaOH.disabled = true;


            acidLiquid.classList.remove(
                "endpoint"
            );


            acidLiquid.style.height =
                "48%";


            buretteSolution.style.height =
                "78%";


            fallingDrop.classList.remove(
                "active"
            );


            endpointIndicator.classList.remove(
                "reached"
            );


            endpointIndicator.innerHTML =
                `
                    <span></span>
                    Keep adding NaOH slowly.
                `;


            labStatus.textContent =
                "Ready";


            observationFinal.textContent =
                "—";


            observationUsed.textContent =
                "—";


            observationEndpoint.textContent =
                "—";


            resultHeading.textContent =
                "Complete the virtual titration to obtain the result.";


            resultText.textContent =
                "At the endpoint, the volume of standard NaOH used will be used to determine the concentration of the HCl sample.";


            updateInstructions();

            updateReadings();

        }



        /* =================================================
           EVENTS
        ================================================== */

        addAcid.addEventListener(
            "click",
            handleAddAcid
        );


        addIndicator.addEventListener(
            "click",
            handleAddIndicator
        );


        addNaOH.addEventListener(
            "click",
            handleAddNaOH
        );


        resetButton.addEventListener(
            "click",
            resetExperiment
        );



        /* =================================================
           QUIZ
        ================================================== */

        const quizSubmit =
            document.getElementById(
                "quizSubmit"
            );


        const quizResult =
            document.getElementById(
                "quizResult"
            );


        quizSubmit.addEventListener(
            "click",
            () => {

                const answers = {

                    q1: "b",

                    q2: "a",

                    q3: "b"

                };


                let score = 0;


                Object.keys(answers)
                    .forEach(
                        (question) => {

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
                        "Excellent! You understand the titration experiment very well. 🎉";

                } else if (score === 2) {

                    message =
                        "Good work! Review the endpoint and apparatus once more.";

                } else {

                    message =
                        "Keep learning! Review the practical steps and try the quiz again.";

                }


                quizResult.innerHTML =
                    `
                        Score:
                        <strong>
                            ${score}/3
                        </strong>
                        <br>
                        ${message}
                    `;


                quizResult.classList.add(
                    "show"
                );


                quizResult.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest"
                });

            }
        );



        /* =================================================
           INITIALIZE
        ================================================== */

        updateInstructions();

        updateReadings();

    }
);