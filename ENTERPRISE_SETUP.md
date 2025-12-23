# Custom Chatbot — Enterprise Setup & Deployment Guide

This document describes how to install, develop, build, test, package, and deploy the `custom-chatbot` repository in an enterprise environment. It covers local developer setup, workspaces, packaging the `packages/chatbot-client` widget for reuse, CI/CD guidance (GitHub Actions examples), publishing to registries (npm / private registries), Docker deployment, security notes, and troubleshooting.

**Target audience:** internal engineers, release managers, DevOps.

**Paths referenced in this doc**
- Root repo: `~/Workspace/personal/custom-chatbot`
- Demo app (SPA): `./src` (root `src/`)
- Client package: `./packages/chatbot-client`

---

**Prerequisites**
- Node.js (LTS) — recommended: 18.x or 20.x. Use `nvm` to manage versions.
- npm (bundled with Node) or `pnpm` (if your enterprise uses pnpm). The repo uses npm workspaces.
- Git access to the repo and any private registries (Artifactory / Nexus) credentials.
- Docker (optional) for container builds and deployments.
- CI provider credentials (GitHub Actions runners have environment secrets configured).

---

**1. Clone & initial setup**

1. Clone the repo (use your enterprise Git URL):

```bash
git clone git@your-enterprise.git:team/custom-chatbot.git ~/Workspace/personal/custom-chatbot
cd ~/Workspace/personal/custom-chatbot
```

2. Pick a Node version (use `nvm`):

```bash
nvm install --lts
nvm use --lts
node -v
npm -v
```

3. Install dependencies (workspace-aware):

```bash
# from repo root
npm install
```

Notes:
- The repo uses npm workspaces. This single `npm install` will install root dependencies and link local packages in `packages/*`.
- If your enterprise blocks direct npmjs registry access, configure `.npmrc` to point to your internal registry (Artifactory/Nexus) before running `npm install`.

---

**2. Local development workflows**

Option A — Develop the reusable widget (recommended for library-first workflow):
- Make the widget living source in `packages/chatbot-client/src`.
- Use the demo app (root `src/`) to consume the package via workspace linking.

Start demo app (webpack dev server):

```bash
# from repo root
npm start
# opens dev server (http://localhost:3000)
```

Editing `packages/chatbot-client/src/Chatbot.jsx` will reflect in the demo app (workspaces provide local linking; HMR is handled by the dev server).

Option B — Prototype in demo app first:
- Iterate on `src/components/` inside the demo app.
- When stable, extract widget into `packages/chatbot-client`.

Which to choose:
- Choose A if the widget will be reused by other teams or published.
- Choose B for fast prototyping.

---

**3. Testing**

The demo app already contains Jest + React Testing Library tests. Run tests from repo root:

```bash
npm test
```

For package-level tests (recommended), add tests under `packages/chatbot-client/src/__tests__/` and run with the workspace or directly inside the package:

```bash
# run from package folder
cd packages/chatbot-client
npm install   # if not already installed via workspace
npm test      # if you add a test script
```

CI should run tests for all packages (see CI example below).

---

**4. Building and packaging the client widget**

The client package (`packages/chatbot-client`) uses Rollup to produce ESM and CJS builds in `dist/`.

Build steps:

```bash
# from repo root (workspaces linked)
# ensure dependencies installed
npm install
# build the client package
npm --workspace=packages/chatbot-client run build
# or inside the package
cd packages/chatbot-client
npm install
npm run build
```

After success you should see `packages/chatbot-client/dist/index.esm.js` and `index.cjs.js`.

Recommended packaging options for enterprise consumers:
- Keep `react` and `react-dom` as `peerDependencies` (already declared). Consumers must provide React.
- Ship CSS either as a separate file (`dist/styles.css`) or inline into the JS bundle. Decide which pattern works for your teams.

Local pack test:

```bash
cd packages/chatbot-client
npm pack   # produces a tarball you can install elsewhere
# In another project:
# npm install ../path/custom-chatbot-client-0.1.0.tgz
```

---

**5. Publishing the client package**

Enterprise options:
- Publish to the public npm registry (npmjs.org). Requires `npm login` and a public package name.
- Publish to an internal registry (Artifactory, Nexus, GitHub Packages). Use internal registry for enterprise distribution.

Publish steps (internal registry example):

1. Configure `.npmrc` (do not commit credentials):

```
# example for Artifactory or npm registry proxy
registry=https://your.artifact.registry/repository/npm-all/
//your.artifact.registry/repository/npm-all/:_authToken=${NPM_TOKEN}
```

2. Build and publish:

```bash
cd packages/chatbot-client
npm run build
# set env NPM_TOKEN in your shell or CI before publish
npm publish --access restricted   # or omit access if internal
```

CI publishing is preferred (see GitHub Actions below) — do not commit secrets in repo.

---

**6. Docker & production deployment**

This repository includes a `Dockerfile` in the root that builds the demo app and serves it with nginx (multi-stage). Example commands:

```bash
# Build image locally
cd ~/Workspace/personal/custom-chatbot
docker build -t custom-chatbot:latest .
# Run
docker run -p 8080:80 custom-chatbot:latest
# Open http://localhost:8080
```

Enterprise deploy targets:
- Kubernetes (EKS/GKE/AKS, deploy the image to container registry and create deployment/service).
- Cloud Run, ECS, or managed containers (upload image to ECR / GCR / ACR).
- Static hosts: build to `dist/` then host on S3 + CloudFront, or Vercel/Netlify for static frontends.

Security: store secrets (API keys for LLM providers) in environment variables (Kubernetes secrets, Cloud Run env/secret manager, or CI/Pipeline secrets). Do not embed secrets in the client bundle.

---

**7. Backend (LLM proxy) — recommended pattern**

If you plan to call LLM providers (OpenAI, Anthropic, etc.), implement a server-side proxy to keep keys secret and add rate-limiting and validation.

Simple Node/Express pattern:

```js
// server/index.js (example)
import express from 'express';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  // call LLM API using server-side env var process.env.OPENAI_API_KEY
  // return a sanitized reply
});

app.listen(process.env.PORT || 3001);
```

Containerize and deploy this backend separately; set `apiUrl` in the widget to the backend route.

---

**8. CI/CD: GitHub Actions example**

Below is a minimal two-workflow approach: `ci.yml` runs tests and builds; `publish.yml` runs on tag and publishes the package.

`/.github/workflows/ci.yml` (high-level):

```yaml
name: CI
on: [push, pull_request]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Use Node
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm --workspace=packages/chatbot-client run build
```

`/.github/workflows/publish.yml` (publish on tag):

```yaml
name: Publish
on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm --workspace=packages/chatbot-client run build
      - name: Publish package
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
        run: |
          cd packages/chatbot-client
          npm publish --access public
```

Notes for enterprise registries: change `registry-url` and publish command as needed and use appropriate secret (e.g., `ARTIFACTORY_TOKEN`).

---

**9. Security, compliance, and enterprise best practices**

- Secrets: store in CI secrets (GitHub `Secrets`), cloud secret manager (AWS Secrets Manager, GCP Secret Manager), or Kubernetes secrets.
- API Keys: never embed keys in the client; always use server-side proxy.
- SBOM and vulnerability scanning: integrate tools such as `npm audit`, Snyk, or OSS scanning in CI.
- Access control: use private registries for internal packages; restrict publish permissions.
- Signing & provenance: consider artifact signing and reproducible builds for high-security environments.

---

**10. Versioning & release process**

- Use semantic versioning (MAJOR.MINOR.PATCH). Prefer `npm version` or `semantic-release` in CI to automate versioning and changelogs.
- Keep a `CHANGELOG.md` and document breaking changes.

---

**11. Troubleshooting**

- `npm install` fails in enterprise: ensure `.npmrc` points to the correct internal registry and credentials are configured. If proxies exist, set `HTTP_PROXY` / `HTTPS_PROXY` env vars.
- Build fails (rollup not found): ensure `npm ci` from repo root installed workspace devDependencies (or run `npm install` inside the package if your enterprise blocks workspace installs).
- Tests fail: run `npm test -- --watch` locally and inspect console errors; fix or isolate failing tests.

---

**12. Quick reference: common commands**

```bash
# repo root
npm install               # install workspace deps
npm start                 # start demo app (dev server)
npm test                  # run tests
npm run build             # build demo app (root build if defined)

# build client package
npm --workspace=packages/chatbot-client run build

# publish client package manually
cd packages/chatbot-client
npm run build
npm publish --access public

# build docker image
docker build -t custom-chatbot:latest .
docker run -p 8080:80 custom-chatbot:latest
```

---

**13. Next recommended actions for your enterprise setup**
- Configure internal registry `.npmrc` and verify `npm install` works behind your corporate network.
- Add CI workflows to run tests and build/publish artifacts to your internal registry.
- Implement a lightweight serverless backend for secure LLM calls and store its secrets in the cloud secret manager.
- Decide on style shipping (bundle CSS or ship a `dist/styles.css`) and document it in the package `README.md`.

---

If you'd like, I can:
- Add a curated `/.github/workflows/ci.yml` and `publish.yml` configured for your internal registry, or
- Swap Rollup for `tsup` (simpler bundler) and update the `packages/chatbot-client` build script, or
- Bundle CSS into the package JS (so consumers only import the component). 

Tell me which of the above you want next and I will implement it.
