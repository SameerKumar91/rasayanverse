# 🧪 RasayanVerse — Virtual Chemistry Laboratory

> **Learn. Experiment. Understand.**

RasayanVerse is a student-focused **Virtual Chemistry Laboratory and Learning Platform** developed as a B.Tech Computer Engineering minor project.

The website combines chemistry learning, interactive virtual practicals, an interactive 118-element periodic table, and a chemistry knowledge center in one responsive platform.

---

## 📌 Project Overview

RasayanVerse is designed to help students understand chemistry through:

- Interactive virtual chemistry practicals
- Step-by-step experiment procedures
- Chemistry concepts and formulas
- Visual diagrams and reaction examples
- Interactive periodic table with all 118 elements
- Observation and result sections
- Practical quizzes
- Responsive and dark-mode-friendly UI

The main idea is to connect:

**Concept → Procedure → Virtual Experiment → Observation → Result → Quiz**

---

## ✨ Main Features

### 🏠 Home Page
- RasayanVerse branding
- Chemistry laboratory-themed interface
- Featured experiments
- Navigation to all major sections
- Responsive layout
- Dark mode

### 🧪 Experiments
The platform contains **15 chemistry practicals**:

| No. | Practical |
|---:|---|
| 01 | Acid–Base Titration |
| 02 | Determination of pH |
| 03 | Acid–Base Indicators |
| 04 | Preparation of Standard Solution |
| 05 | Separation by Filtration |
| 06 | Crystallization of Copper Sulphate |
| 07 | Hardness of Water |
| 08 | Flame Test |
| 09 | Chloride Ion Test |
| 10 | Sulphate Ion Test |
| 11 | Carbonate Ion Test |
| 12 | Preparation of Soap |
| 13 | Redox Titration |
| 14 | Heat of Neutralization |
| 15 | Buffer Solution & pH |

Each practical follows a common learning flow:

**Learn Basics → Aim → Apparatus → Chemicals → Safety → Procedure → Virtual Lab → Observation → Result → Quiz**

### 📚 Learn Chemistry
The Learn Chemistry section contains **24 basic chemistry topics** with:

- Simple explanations
- Important formulas
- Chemical reactions
- Examples
- Visual SVG diagrams
- Search
- Topic categories
- Detailed topic popup

Topics include atoms, subatomic particles, electronic configuration, valency, periodic table, chemical bonding, ionic/covalent/metallic bonds, chemical equations, reactions, acids and bases, pH, indicators, solutions, mole concept, stoichiometry, redox and laboratory safety.

### ⚛️ Periodic Table
- All **118 elements**
- Proper periodic-table layout
- Groups and periods
- Element categories
- Atomic number
- Symbol
- Element name
- Atomic weight
- Discovery information
- State at 20°C
- Group and period
- Interactive element details
- Search/filter functionality
- Lanthanides and actinides
- Responsive layout

### ℹ️ About
Provides:
- Project introduction
- Project idea
- Objectives
- Platform features
- Purpose of RasayanVerse

### ✉️ Contact
Provides:
- Project information
- Institution information
- Department information
- Contact section
- Links to the main platform sections

---

## 🛠️ Technology Stack

RasayanVerse is currently implemented as a lightweight frontend website.

### Frontend
- HTML5
- CSS3
- JavaScript
- SVG

### UI / Design
- Custom CSS
- Responsive CSS
- CSS animations
- Dark mode
- Chemistry laboratory visual elements

### No backend required
The current version is a frontend-only project.

No:
- PHP server
- MySQL database
- Node backend
- Login system
- External API

is required to run the current website.

---

## 📁 Project Structure

```text
RasayanHTML/
│
├── index.html
├── experiments.html
├── learn-chemistry.html
├── periodic-table.html
├── about.html
├── contact.html
│
├── periodic-table.css
├── periodic-table.js
├── learn-chemistry.css
├── learn-chemistry.js
├── about.css
├── contact.css
│
├── assets/
│   └── icons/
│       └── logo.svg
│
├── css/
│   ├── style.css
│   ├── laboratory.css
│   └── responsive.css
│
├── js/
│   ├── main.js
│   ├── theme.js
│   └── experiments.js
│
└── experiments/
    ├── practical-01/
    ├── practical-02/
    ├── practical-03/
    ├── ...
    └── practical-15/
```

Each practical contains:

```text
practical-XX/
├── index.html
├── practical.css
└── practical.js
```

---

## 🚀 How to Run

### Method 1 — Directly in Browser

1. Extract the project ZIP.
2. Open the project folder.
3. Double-click:

```text
index.html
```

4. The website will open in your browser.

### Method 2 — VS Code

1. Open the `RasayanHTML` folder in VS Code.
2. Install **Live Server** if required.
3. Open `index.html`.
4. Click **Go Live**.
5. Open the displayed localhost address.

No installation of Node.js, PHP, MySQL or XAMPP is required for the current frontend version.

---

## 🌙 Dark Mode

Dark mode is controlled through:

```text
js/theme.js
```

The same theme system is used across the main website pages.

The project uses shared CSS variables so the visual design remains consistent between light and dark themes.

---

## 🎨 Design System

RasayanVerse uses a consistent chemistry-learning visual style:

- Blue as the primary interface color
- Teal for laboratory accents
- Soft backgrounds
- Rounded cards
- Clean typography
- Chemistry/laboratory illustrations
- Consistent navbar
- Consistent footer
- Responsive layouts

The goal is to keep every page visually connected as one website.

---

## 🔬 Virtual Practical Interaction

The practical pages use JavaScript to simulate laboratory activities.

Examples:

### Acid–Base Titration
```text
Add HCl
↓
Add Indicator
↓
Add NaOH
↓
Reach Endpoint
↓
Record Observation
↓
Calculate Result
```

### pH Determination
```text
Select Sample
↓
Place Electrode
↓
Measure
↓
Stabilize Reading
↓
Display pH
↓
Classify Solution
```

Other practicals provide their own chemistry-specific interactions such as precipitation, filtration, heating, crystallization, flame testing, redox reactions and buffer behavior.

---

## 📱 Responsive Design

The website is designed for:

- Desktop
- Laptop
- Tablet
- Mobile

Shared responsive rules are maintained in:

```text
css/responsive.css
```

Individual pages can also contain page-specific responsive rules where necessary.

---

## 🧪 Educational Purpose

RasayanVerse is intended as an educational and demonstration platform.

Virtual experiments are simplified simulations designed to help students understand:

- Laboratory sequence
- Chemical concepts
- Expected observations
- Basic calculations
- Reaction behavior
- Safety concepts

The simulations should not be treated as a replacement for supervised real laboratory work.

---

## 🎓 Project Type

**Project:** Minor Project  
**Domain:** Web Development + Chemistry Education  
**Platform:** Virtual Chemistry Laboratory  
**Target Users:** Students and chemistry learners

**Institution:** Silver Oak University  
**College:** College of Technology  
**Program:** Bachelor of Technology — Computer Engineering

---

## 🔮 Future Scope

Possible future improvements include:

- User accounts and authentication
- Student progress tracking
- Database integration
- Teacher/admin dashboard
- More advanced laboratory simulations
- 3D laboratory environment
- Real-time experiment analytics
- More chemistry animations
- Experiment result history
- Online assessments
- Certificate generation
- React-based component architecture
- Backend API integration

---

## 🧪 Final Testing Checklist

Before submission, verify:

- [ ] Home page opens correctly
- [ ] Navbar works on every page
- [ ] Dark mode works everywhere
- [ ] Footer is consistent
- [ ] All 15 practicals open
- [ ] Practical buttons work
- [ ] Practical reset works
- [ ] Practical quizzes work
- [ ] Learn Chemistry search works
- [ ] Learn Chemistry topics open
- [ ] Periodic table contains all 118 elements
- [ ] Periodic table element details work
- [ ] About page opens
- [ ] Contact page opens
- [ ] Mobile layout works
- [ ] No broken local links
- [ ] No JavaScript console errors

---

## 👨‍💻 Project Branding

**रसायनVerse**

**VIRTUAL CHEMISTRY LAB**

**Learn. Experiment. Understand.**

---

## 📄 License / Academic Use

This project is intended for academic and educational use as a student minor project.

---

## 🙏 Acknowledgement

RasayanVerse was developed to make chemistry learning more visual, interactive and practical for students.

**Thank you for exploring RasayanVerse! 🧪⚗️**
