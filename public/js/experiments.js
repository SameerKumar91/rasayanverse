/* =========================================================
   RASAYANVERSE
   EXPERIMENT DATA & UTILITIES
   ========================================================= */


/* =========================================================
   ALL 15 PRACTICALS
   ========================================================= */

const RASAYAN_EXPERIMENTS = [

    {
        number: 1,
        slug: "practical-01",
        title: "Acid–Base Titration",
        category: "Acid • Base",
        shortDescription:
            "Determine an unknown concentration using a controlled titration.",
        icon: "⚗",
        color: "blue"
    },

    {
        number: 2,
        slug: "practical-02",
        title: "Determination of pH",
        category: "Analysis",
        shortDescription:
            "Explore acidic, neutral and basic solutions using a pH scale.",
        icon: "pH",
        color: "teal"
    },

    {
        number: 3,
        slug: "practical-03",
        title: "Acid–Base Indicators",
        category: "Acid • Base",
        shortDescription:
            "Observe how indicators respond to acidic, neutral and basic solutions.",
        icon: "◉",
        color: "purple"
    },

    {
        number: 4,
        slug: "practical-04",
        title: "Preparation of Standard Solution",
        category: "Solution Preparation",
        shortDescription:
            "Prepare a solution with a known concentration using accurate measurements.",
        icon: "⚗",
        color: "blue"
    },

    {
        number: 5,
        slug: "practical-05",
        title: "Separation by Filtration",
        category: "Separation",
        shortDescription:
            "Separate an insoluble solid from a liquid using filtration.",
        icon: "▱",
        color: "teal"
    },

    {
        number: 6,
        slug: "practical-06",
        title: "Crystallization of Copper Sulphate",
        category: "Separation",
        shortDescription:
            "Prepare copper sulphate crystals through controlled crystallization.",
        icon: "◈",
        color: "purple"
    },

    {
        number: 7,
        slug: "practical-07",
        title: "Hardness of Water",
        category: "Water Analysis",
        shortDescription:
            "Determine water hardness using an EDTA titration procedure.",
        icon: "💧",
        color: "blue"
    },

    {
        number: 8,
        slug: "practical-08",
        title: "Flame Test",
        category: "Qualitative Test",
        shortDescription:
            "Identify metal ions by observing characteristic flame colours.",
        icon: "🔥",
        color: "orange"
    },

    {
        number: 9,
        slug: "practical-09",
        title: "Chloride Ion Test",
        category: "Qualitative Test",
        shortDescription:
            "Identify chloride ions through formation of a white precipitate.",
        icon: "🧪",
        color: "teal"
    },

    {
        number: 10,
        slug: "practical-10",
        title: "Sulphate Ion Test",
        category: "Qualitative Test",
        shortDescription:
            "Detect sulphate ions through a characteristic precipitation reaction.",
        icon: "🧪",
        color: "blue"
    },

    {
        number: 11,
        slug: "practical-11",
        title: "Carbonate Ion Test",
        category: "Qualitative Test",
        shortDescription:
            "Identify carbonate ions through gas evolution and limewater testing.",
        icon: "◎",
        color: "teal"
    },

    {
        number: 12,
        slug: "practical-12",
        title: "Preparation of Soap",
        category: "Organic Chemistry",
        shortDescription:
            "Prepare soap through the saponification of vegetable oil.",
        icon: "✦",
        color: "green"
    },

    {
        number: 13,
        slug: "practical-13",
        title: "Redox Titration",
        category: "Redox Chemistry",
        shortDescription:
            "Study an oxidation–reduction reaction using titration.",
        icon: "⚗",
        color: "purple"
    },

    {
        number: 14,
        slug: "practical-14",
        title: "Heat of Neutralization",
        category: "Thermochemistry",
        shortDescription:
            "Observe temperature change during an acid–base neutralization.",
        icon: "🌡",
        color: "orange"
    },

    {
        number: 15,
        slug: "practical-15",
        title: "Buffer Solution & pH",
        category: "Solutions",
        shortDescription:
            "Prepare a buffer and observe its resistance to pH changes.",
        icon: "pH",
        color: "green"
    }

];


/* =========================================================
   GET EXPERIMENT BY NUMBER
   ========================================================= */

function getExperimentByNumber(number) {

    const numericNumber =
        Number(number);

    return RASAYAN_EXPERIMENTS.find(
        (experiment) =>
            experiment.number === numericNumber
    ) || null;

}


/* =========================================================
   GET EXPERIMENT BY SLUG
   ========================================================= */

function getExperimentBySlug(slug) {

    return RASAYAN_EXPERIMENTS.find(
        (experiment) =>
            experiment.slug === slug
    ) || null;

}


/* =========================================================
   GET ALL EXPERIMENTS
   ========================================================= */

function getAllExperiments() {

    return [...RASAYAN_EXPERIMENTS];

}


/* =========================================================
   GET NEXT EXPERIMENT
   ========================================================= */

function getNextExperiment(number) {

    const currentNumber =
        Number(number);

    return (
        getExperimentByNumber(
            currentNumber + 1
        ) || null
    );

}


/* =========================================================
   GET PREVIOUS EXPERIMENT
   ========================================================= */

function getPreviousExperiment(number) {

    const currentNumber =
        Number(number);

    return (
        getExperimentByNumber(
            currentNumber - 1
        ) || null
    );

}


/* =========================================================
   CREATE EXPERIMENT URL
   ========================================================= */

function getExperimentUrl(number) {

    const formattedNumber =
        String(number).padStart(2, "0");

    return `experiments/practical-${formattedNumber}/index.html`;

}


/* =========================================================
   SEARCH EXPERIMENTS
   ========================================================= */

function searchExperiments(searchTerm) {

    if (!searchTerm) {
        return getAllExperiments();
    }


    const query =
        String(searchTerm)
            .trim()
            .toLowerCase();


    if (!query) {
        return getAllExperiments();
    }


    return RASAYAN_EXPERIMENTS.filter(
        (experiment) => {

            return (
                experiment.title
                    .toLowerCase()
                    .includes(query) ||

                experiment.category
                    .toLowerCase()
                    .includes(query) ||

                experiment.shortDescription
                    .toLowerCase()
                    .includes(query)
            );

        }
    );

}


/* =========================================================
   EXPORT TO WINDOW
   ---------------------------------------------------------
   Normal HTML pages can use these functions directly.
   ========================================================= */

window.RasayanExperiments = {

    all: RASAYAN_EXPERIMENTS,

    getByNumber:
        getExperimentByNumber,

    getBySlug:
        getExperimentBySlug,

    getAll:
        getAllExperiments,

    getNext:
        getNextExperiment,

    getPrevious:
        getPreviousExperiment,

    getUrl:
        getExperimentUrl,

    search:
        searchExperiments

};