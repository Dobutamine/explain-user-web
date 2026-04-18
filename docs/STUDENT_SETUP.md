# Student Setup Guide

Welcome to the Explain project. This guide takes you from a fresh laptop to a running development environment, on a branch of your own, ready to contribute.

Follow the sections in order. You should not need to skip ahead — each step builds on the one before it.

---

## 1. What you're building

Explain is a physiological simulation web app for neonatology. It models cardiac and respiratory systems with real-time interactive visualization. The UI is built with Vue 3 and the Quasar Framework; the simulation engine itself runs in a dedicated Web Worker so the interface stays responsive.

Once you are set up, read `CLAUDE.md` in the repo root for an architecture overview before you start making changes.

---

## 2. Before you start

You will need:

- A laptop running **macOS**, **Windows 10 / 11**, or a recent **Linux** distribution (Ubuntu/Debian are the best-tested).
- A **GitHub account**, with access to this project's repository granted by the instructor.
- **Administrator / sudo rights** on your laptop (needed to install Node.js and Git).
- A stable internet connection — the first `yarn install` downloads several hundred MB of packages.

---

## 3. Install Node.js (version 24 LTS)

The project's `package.json` accepts Node 16, 18, 20, 22 or 24. To keep everyone on the same page, **please install Node 24 LTS**. The easiest, cross-platform way is through `nvm` (Node Version Manager), which lets you switch Node versions later without reinstalling.

Goto https://nodejs.org/en/download to install Node.js


### Verify

On any OS, open a new terminal and check:

```bash
node --version
```

You should see something like `v24.11.x`. If you do, Node is installed correctly.

---

## 4. Install Git

### macOS

```bash
xcode-select --install
```

This installs Git along with the Apple command line developer tools.

### Windows

Download **Git for Windows** from <https://git-scm.com/download/win> and run the installer. Accept the default options. This also installs **Git Bash**, which gives you a Unix-style terminal that you will want to use for the rest of this guide.

### Linux

```bash
sudo apt-get install -y git
```

### Configure Git

On every platform, tell Git who you are (use the same name and email as your GitHub account):

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

---

## 5. Install VS Code and the recommended extensions

1. Download and install **VS Code** from <https://code.visualstudio.com>.
2. Later, when you open the project folder, VS Code will detect `.vscode/extensions.json` and prompt you to *"Install recommended extensions"*. Click yes. The recommendations are:
   - **Vue.volar** — Vue 3 language support (syntax, autocompletion).


## 6. Create a GitHub Personal Access Token (PAT)

You will clone over HTTPS, which requires a PAT instead of your account password.

1. In a browser go to **GitHub → your avatar → Settings → Developer settings → Personal access tokens → Fine-grained tokens**.
2. Click **Generate new token**.
3. Fill in:
   - **Token name**: something recognizable, e.g. `explain-laptop-2026`.
   - **Expiration**: 90 days.
   - **Repository access**: *Only select repositories*, and pick the Explain repository.
   - **Permissions**: under *Repository permissions*, set **Contents: Read and write** and **Pull requests: Read and write**.
4. Click **Generate token** and **copy the token now** — GitHub will not show it again. Paste it somewhere safe (e.g. your password manager).
5. On Linux, enable Git's credential store so you only have to type the token once:

   ```bash
   git config --global credential.helper store
   ```

   macOS (Keychain) and Windows (Credential Manager) will cache it automatically.

---

## 7. Clone the repository

In a terminal, from the folder where you want the project to live:

```bash
git clone git@github.com:Dobutamine/explain-user-web.git
cd <explain-user-wenb>
```

When Git prompts for credentials:

- **Username**: your GitHub username.
- **Password**: paste the **Personal Access Token** from step 6 (not your GitHub password).

---

## 8. Enable Corepack and install dependencies

This project uses **Yarn 4.1.1 (Berry)**, which is pinned inside the repository at `.yarn/releases/yarn-4.1.1.cjs`. You should **not** `npm install -g yarn` — instead, enable Corepack, which ships with Node 20 and will automatically use the version Yarn pinned by the project.

Run once, anywhere:

```bash
corepack enable
```

Then, inside the project folder:

```bash
yarn
```

The first install can take a few minutes. When it's done, you'll have a `node_modules/` folder alongside `src/`. (The project uses `nodeLinker: node-modules` so everything lives where you'd expect.)

---

## 9. Create your own branch from `explain-labs`

Each student works on their own branch. **Never branch from `main`** — `main` is production. Always branch from `explain-labs`, which is the shared experimental base.

Naming convention: `student/<yourname>/<topic>`, e.g. `student/anna/ecls-tuning`.

```bash
git fetch origin
git checkout explain-labs
git pull
git checkout -b student/<yourname>/<topic>
git push -u origin student/<yourname>/<topic>
```

The `-u` on the push sets up tracking so future `git push` and `git pull` commands know which remote branch to talk to.

---

## 10. Run the development server

Still inside the project folder:

```bash
yarn dev
```

(equivalent to `quasar dev` — both work).

Once it compiles, open <http://localhost:8080> in your browser. The app uses hash-mode routing, so the running URL will be something like `http://localhost:8080/#/`.

The simulation backend is hosted at `https://explain-user.com` — there is **no local backend to set up**. The dev server talks to the remote API directly.

Edits to files in `src/` will hot-reload in the browser automatically.

---

## 11. Verify your setup

Tick each item off:

- [ ] `node --version` prints `v20.x.x`
- [ ] `yarn --version` prints `4.1.1`
- [ ] `git branch --show-current` prints `student/<yourname>/<topic>`
- [ ] `yarn dev` starts without errors
- [ ] The browser shows the login / main page at <http://localhost:8080/#/>
- [ ] Editing a `.vue` file in `src/` causes the browser to hot-reload

If every box is ticked, you are fully set up.

---

## 12. Daily workflow

At the start of each session, pull the latest changes from `explain-labs` into your branch:

```bash
git fetch origin
git merge origin/explain-labs
```

(or `git rebase origin/explain-labs` if you prefer a linear history).

As you work:

```bash
git add <files you changed>
git commit -m "Short description of what you changed"
git push
```

When a feature is ready for review, open a **Pull Request on GitHub targeting `explain-labs`** (not `main`).

---

## 13. Troubleshooting

**`yarn` prints "This project's configured package manager is Yarn …" and refuses to run.**
Run `corepack enable` once, then try `yarn` again.

**Windows: native compilation errors during `yarn install`.**
Install **Visual Studio Build Tools** and select the *"Desktop development with C++"* workload. Reboot and re-run `yarn`.

**Linux: `node-gyp` errors during `yarn install`.**
```bash
sudo apt-get install -y build-essential python3
```
Then re-run `yarn`.

**Port 8080 already in use.**
```bash
yarn dev --port 8081
```

**Browser shows a blank page.**
Open the browser DevTools console (F12). Most boot-time errors come from either an incomplete `yarn install` or the wrong Node version. Re-check section 3 and 8.

**Git push is rejected with "non-fast-forward".**
Someone else (or you, on another machine) pushed to your branch. Run `git pull --rebase` and try `git push` again.

---

## 14. Next steps

You are now set up to contribute. Before making changes, please read:

- **`CLAUDE.md`** — architecture overview: the worker-based simulation engine, the three-tier event system (`explain.on()` for fast data, Pinia store for slow/state data, `$bus` for UI-to-UI events), the model hierarchy in `src/explain/`, and the boot-file order.

Welcome aboard, and happy hacking.
