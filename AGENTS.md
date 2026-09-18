# Scope and simplicity

- Implement only what the user explicitly asks for. Do not add extra features, polish, infrastructure, or speculative abstractions.
- Keep the app as simple, concise, and barebones as possible while fulfilling the request.
- Prefer native HTML, browser APIs, and existing code over libraries or elaborate solutions.
- Do not write code comments, including inline comments, documentation comments, HTML comments, or CSS comments.
- Do not write tests or add test files, test scripts, or testing setup.

# Stack and dependencies

- Use SvelteKit with Bun for package management and commands.
- Do not add a Node adapter or production deployment setup unless requested.
- Avoid adding libraries. Before installing a library, ask the user and explain why it is needed.

# Styling

- Start with zero styling and native browser controls.
- Add only the minimal styling needed for explicitly requested behavior, such as square pictures, floating search results, selection highlighting, and inline icons.
- Do not add themes, CSS frameworks, decorative styling, or an unsolicited redesign.

# Data and terminology

- Use "workout" rather than "lift" in the app and code.
- Keep workout types in `data/workoutTypes.json` and each person's history in `data/people/<name>.jsonl`.
- Store profile pictures using the person's name with a `.png`, `.jpeg`, `.jpg`, or `.webp` extension.
- Keep full names in stored data and identifiers. Name truncation is for display only.
- Destructive UI actions must use a browser confirmation with a short English sentence identifying what will be deleted and any associated data that will be removed.

# Running and verification

- Never start a development or app server on your own. The user manages running servers.
- Use build checks and manual inspection when appropriate, without writing tests.
- Do not add or delete real user records merely to verify a change.

# Git

- For each new feature, create a branch with a concise kebab-case name describing the broadest requested goal.
- Do not commit, merge, delete the feature branch, or push until the user explicitly says the feature is good to go.
- After that approval, commit with a clear message describing the agreed changes, merge into `main`, delete the feature branch, and push with the available full permissions.
