# Can You Use It?

A three-minute React lab for INFS4321 Human–Computer Interaction. Students design an event card and a registration form, use both to complete a new task, and revise one design decision. Field notes connect observations to PACT, DIRA, recognition versus recall and formative evaluation.

## Run at the booth

Open the included offline.html in a modern browser, even without an internet connection. The game embeds its fonts, illustration, styles, and React runtime. The leaderboard uses local storage on the booth device where available. Audio starts muted.

## Edit the React project

Install Node.js 20 or later.

    npm ci
    npm test
    npm run build
    npm start

Open http://localhost:4173. The dist folder includes a self-contained game, its offline copy, and the downloadable project ZIP.

The design options, scoring thresholds, and workshops are in src/game.mjs. The game screens and timing live in src/main.jsx. Reusable components are in src/ui.jsx, with styles in src/style.css.

## Score and timing

Seven choices contribute to five checks. Reading earns one point each for a 4.5∶1 normal-text contrast ratio and the booth’s 18 px size target. The button earns one point each for label contrast of 4.5∶1 and the booth’s 44 px height target. The other checks award up to two points each for recognizable links, persistent input labels with format guidance, and a session control suited to three visible alternatives. The form accepts invented workshop codes and session names. It never submits a real registration.

The observed task evidence includes reading time, location time, registration time, incorrect time answers, missed targets during the location task and rejected registration attempts. Timings and errors are independent of the design score. The board saves the initial score and breaks ties using time. The previous edition’s scores remain available in a separate leaderboard section.

The layout uses a 100dvh shell with a 100vh fallback. The header and footer stay in view. The workspace scrolls when extra room is needed for text zoom, the onscreen keyboard or an expanded review. Dialogs and hidden tabs pause the task clock. After 45 seconds of inactivity the booth offers a ten-second countdown with an option to keep playing.

The glare overlay is an illustration of washed-out viewing conditions. It leaves the computed score unchanged.
