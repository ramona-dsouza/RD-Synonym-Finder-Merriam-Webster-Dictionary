
# RD Synonym Finder — Merriam-Webster Dictionary API

Synonym Archive is a single-service web application that delivers a branded synonym discovery experience on top of the Merriam-Webster Thesaurus API. The runtime model is intentionally compact: one Express process serves both static assets and API routes, allowing deterministic local and deploy-time behavior without a second web server tier.

## Local Development

### 1. Clone the repository

```bash
git clone https://github.com/ramona-dsouza/RD-Synonym-Finder-Merriam-Webster-Dictionary.git
cd RD-Synonym-Finder-Merriam-Webster-Dictionary 
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create environment file

Create a `.env` file in the project root:

```
MERRIAM_WEBSTER_API_KEY=your_api_key_here
```

### 4. Start the server

```bash
node server.js
```

Then open your browser to:

```
http://localhost:3000
```

The app should now be running locally.


## Problem Context

Direct browser access to third-party dictionary APIs exposes private keys, fragments request governance, and complicates lifecycle controls such as rate limiting and observability. The system addresses this by shifting all provider communication to the server boundary while preserving low-latency user interaction in the browser.

The UI requirement is not purely functional. The product also enforces a clear visual identity through Bootstrap-based layout composition, custom typography, and editorial treatment of search and results.

## Architectural Approach

The architecture is a thin backend-for-frontend pattern:

- `server.js` initializes Express, loads environment variables with `dotenv`, and exposes a namespaced API endpoint at `/api/synonyms`.
- The backend proxies requests to Merriam-Webster using `node-fetch`, forwarding provider JSON responses and status semantics to the client.
- Static assets are served from the repository root via `express.static`, with `index.html` as the entry document for non-API GET routes.
- The frontend (`index.html` + `script.js`) calls only `/api/synonyms?word=...`, never the upstream provider directly.
- Presentation is implemented with Bootstrap 5 CDN resources and inline custom CSS, while interaction logic remains in vanilla JavaScript.

## Key Technical Decisions

- API key isolation is enforced by reading `MERRIAM_WEBSTER_API_KEY` from environment configuration instead of embedding secrets in client code.
- Route separation is explicit: `/api/*` is reserved for backend interfaces and static files are served outside the API namespace.
- CORS middleware is enabled to support cross-origin frontends where needed without changing API handler logic.
- Query input is URL-encoded server-side before proxy dispatch to preserve correctness for multi-word and special-character terms.
- The frontend uses relative API routing (`/api/synonyms`) to avoid hardcoded host assumptions across environments.

## Edge Case Handling

- Empty query input is rejected server-side with `400` and a structured error payload.
- Missing API key configuration returns `500` with a clear operational message.
- Upstream connectivity or provider failures are normalized into `502` responses.
- Unknown API paths under `/api` return JSON `404` responses instead of falling through to HTML handlers.
- The client renders explicit loading, empty-result, and failure states to prevent ambiguous UI behavior.

## Skills Demonstrated

- Secure service boundary design for third-party API integration.
- Practical backend-for-frontend implementation in Express with clean route segmentation.
- Resilient client-state handling for asynchronous request workflows.
- Intentional UI system design using Bootstrap primitives plus custom brand styling.
- Environment-driven configuration and dependency-managed Node.js runtime setup.

## Production Hardening Opportunities

- Introduce request-level rate limiting and abuse controls on `/api/synonyms`.
- Add structured logging, correlation IDs, and metrics for end-to-end observability.
- Implement response caching for hot query terms to reduce upstream latency and cost.
- Add contract and integration tests for proxy behavior, status propagation, and client rendering states.
- Apply stricter CORS policy, HTTP security headers, and timeout/retry strategies for external requests.
- Externalize CSS/JS build artifacts with asset versioning and compression for deployment efficiency.
- Separating css, effectively. This takes old css and gives it a new look/feel 

The backend then proxies the request to Merriam-Webster and returns JSON to the frontend.

**Notes:** Synonym. A thesaurus web application that uses a backend-for-frontend proxy to protect API credentials, centralize provider access, and deliver a branded low-latency search experience
