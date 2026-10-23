/* =========================================================
   RASAYANVERSE
   MAIN WEBSITE JAVASCRIPT
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       PAGE LOADER
    ====================================================== */

    const pageLoader = document.getElementById("pageLoader");

    if (pageLoader) {

        const hideLoader = () => {
            pageLoader.classList.add("hidden");

            setTimeout(() => {
                pageLoader.style.display = "none";
            }, 550);
        };

        if (document.readyState === "complete") {
            setTimeout(hideLoader, 500);
        } else {
            window.addEventListener("load", () => {
                setTimeout(hideLoader, 500);
            });
        }
    }


    /* =====================================================
       MOBILE MENU
    ====================================================== */

    const mobileMenuButton =
        document.getElementById("mobileMenuButton");

    const mobileNav =
        document.getElementById("mobileNav");

    if (mobileMenuButton && mobileNav) {

        mobileMenuButton.addEventListener("click", () => {

            const isOpen =
                mobileNav.classList.toggle("open");

            mobileMenuButton.setAttribute(
                "aria-expanded",
                isOpen ? "true" : "false"
            );

            document.body.classList.toggle(
                "menu-open",
                isOpen
            );

        });


        /* Close menu after clicking a link */

        const mobileLinks =
            mobileNav.querySelectorAll("a");

        mobileLinks.forEach((link) => {

            link.addEventListener("click", () => {

                mobileNav.classList.remove("open");

                mobileMenuButton.setAttribute(
                    "aria-expanded",
                    "false"
                );

                document.body.classList.remove(
                    "menu-open"
                );

            });

        });

    }


    /* =====================================================
       NAVBAR SCROLL EFFECT
    ====================================================== */

    const navbar =
        document.getElementById("navbar");

    const updateNavbar = () => {

        if (!navbar) {
            return;
        }

        if (window.scrollY > 20) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }

    };

    updateNavbar();

    window.addEventListener(
        "scroll",
        updateNavbar,
        { passive: true }
    );


    /* =====================================================
       SMOOTH INTERNAL LINKS
    ====================================================== */

    const internalLinks =
        document.querySelectorAll(
            'a[href^="#"]'
        );

    internalLinks.forEach((link) => {

        link.addEventListener("click", (event) => {

            const targetId =
                link.getAttribute("href");

            if (
                !targetId ||
                targetId === "#"
            ) {
                return;
            }

            const target =
                document.querySelector(targetId);

            if (!target) {
                return;
            }

            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        });

    });


    /* =====================================================
       SCROLL REVEAL
    ====================================================== */

    const revealElements =
        document.querySelectorAll(
            ".experiment-card, " +
            ".capability-card, " +
            ".workflow-step, " +
            ".resource-card, " +
            ".reaction-visual"
        );

    if (
        revealElements.length &&
        "IntersectionObserver" in window
    ) {

        revealElements.forEach((element) => {

            element.style.opacity = "0";

            element.style.transform =
                "translateY(18px)";

            element.style.transition =
                "opacity 0.6s ease, " +
                "transform 0.6s ease";

        });


        const revealObserver =
            new IntersectionObserver(
                (entries, observer) => {

                    entries.forEach((entry) => {

                        if (!entry.isIntersecting) {
                            return;
                        }

                        entry.target.style.opacity = "1";

                        entry.target.style.transform =
                            "translateY(0)";

                        observer.unobserve(
                            entry.target
                        );

                    });

                },
                {
                    threshold: 0.12
                }
            );


        revealElements.forEach((element) => {

            revealObserver.observe(element);

        });

    }


    /* =====================================================
       EXPERIMENT CARD HOVER EFFECT
    ====================================================== */

    const experimentCards =
        document.querySelectorAll(
            ".experiment-card"
        );

    experimentCards.forEach((card) => {

        card.addEventListener(
            "mouseenter",
            () => {

                card.style.setProperty(
                    "--card-hover",
                    "1"
                );

            }
        );


        card.addEventListener(
            "mouseleave",
            () => {

                card.style.setProperty(
                    "--card-hover",
                    "0"
                );

            }
        );

    });


    /* =====================================================
       ESCAPE KEY
       Close mobile menu
    ====================================================== */

    document.addEventListener(
        "keydown",
        (event) => {

            if (event.key !== "Escape") {
                return;
            }

            if (
                mobileNav &&
                mobileNav.classList.contains("open")
            ) {

                mobileNav.classList.remove("open");

                if (mobileMenuButton) {

                    mobileMenuButton.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }

                document.body.classList.remove(
                    "menu-open"
                );

            }

        }
    );


    /* =====================================================
       UPDATE CURRENT YEAR
    ====================================================== */

    const yearElements =
        document.querySelectorAll(
            "[data-current-year]"
        );

    yearElements.forEach((element) => {

        element.textContent =
            new Date().getFullYear();

    });

});