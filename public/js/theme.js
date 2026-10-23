/* =========================================================
   RASAYANVERSE
   THEME CONTROLLER
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const themeToggle =
        document.getElementById("themeToggle");

    const themeIcon =
        document.getElementById("themeIcon");


    const STORAGE_KEY =
        "rasayanverse-theme";


    /* =====================================================
       GET SAVED THEME
    ====================================================== */

    const getSavedTheme = () => {

        const savedTheme =
            localStorage.getItem(STORAGE_KEY);

        if (
            savedTheme === "light" ||
            savedTheme === "dark"
        ) {
            return savedTheme;
        }

        return "light";
    };


    /* =====================================================
       APPLY THEME
    ====================================================== */

    const applyTheme = (theme) => {

        document.documentElement.setAttribute(
            "data-theme",
            theme
        );


        localStorage.setItem(
            STORAGE_KEY,
            theme
        );


        updateThemeButton(theme);

    };


    /* =====================================================
       UPDATE BUTTON
    ====================================================== */

    const updateThemeButton = (theme) => {

        if (!themeIcon || !themeToggle) {
            return;
        }


        if (theme === "dark") {

            themeIcon.textContent = "☀";

            themeToggle.setAttribute(
                "aria-label",
                "Switch to light mode"
            );

            themeToggle.setAttribute(
                "title",
                "Switch to light mode"
            );

        } else {

            themeIcon.textContent = "☾";

            themeToggle.setAttribute(
                "aria-label",
                "Switch to dark mode"
            );

            themeToggle.setAttribute(
                "title",
                "Switch to dark mode"
            );

        }

    };


    /* =====================================================
       INITIAL THEME
    ====================================================== */

    const initialTheme =
        getSavedTheme();

    applyTheme(initialTheme);


    /* =====================================================
       TOGGLE THEME
    ====================================================== */

    if (themeToggle) {

        themeToggle.addEventListener(
            "click",
            () => {

                const currentTheme =
                    document.documentElement.getAttribute(
                        "data-theme"
                    ) || "light";


                const nextTheme =
                    currentTheme === "light"
                        ? "dark"
                        : "light";


                applyTheme(nextTheme);

            }
        );

    }


    /* =====================================================
       SYSTEM THEME IS NOT USED
       -----------------------------------------------------
       RasayanVerse intentionally starts in light mode
       unless the user previously selected dark mode.
    ====================================================== */

});