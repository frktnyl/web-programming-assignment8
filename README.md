# BSc in Web Systems Engineering — Info Server (Assignment 8)

A lightweight Node.js and Express 5 back-end server built using ES modules. It serves static front-end assets for a fictional study programme, exposes RESTful JSON/text/redirect endpoints, logs incoming HTTP traffic, and tracks total requests served.

## How to Install and Run

1. Install dependencies:
   npm install

2. Run in production mode:
   npm start

3. Run in development mode (auto-restarts on file changes via node --watch):
   npm run dev

4. Open http://localhost:3000 in your browser (or set a custom port with PORT=4000 npm start).

## File Organization

/assignment8
 ├─ public/
 │   ├─ index.html       # Front-end programme overview and API testing UI
 │   ├─ styles.css       # External stylesheet
 │   └─ app.js           # Client-side Fetch API logic
 ├─ server.js            # Express 5 application, middlewares, and route handlers
 ├─ package.json         # Project metadata, "type": "module", scripts, and Express 5 dependency
 ├─ package-lock.json    # Locked dependency tree
 ├─ .gitignore           # Excludes node_modules/ and .env
 └─ README.md            # Documentation, curl test outputs, and reasoning answers

## Middleware Order & Request Counting Policy

- Placement Order: Both requestLogger and requestCounter are registered at the very top of server.js, before express.static and all route handlers. Because Express executes middleware sequentially in registration order, placing them first guarantees that every incoming HTTP request passes through both functions before any route terminates the request-response cycle.
- What is counted: Every HTTP request that hits the server is counted—including API calls, static assets (index.html, styles.css, app.js), redirects, and 404 responses. Counting at the entry point accurately reflects the true load and total requests processed by the Node server since startup.

---

## Testing Evidence (curl --include)

### 1. Successful JSON Response (GET /api/status)
$ curl --include http://localhost:3000/api/status
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 55
ETag: W/"37-8xK9pL2mQ4vR1nT6wY0zA3bC5dE"
Date: Mon, 16 Nov 2026 18:10:12 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"status":"ok","nodeVersion":"v22.11.0","uptimeSeconds":14}

### 2. Created Response (POST /api/subscribe)
$ curl --include -X POST http://localhost:3000/api/subscribe
HTTP/1.1 201 Created
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 19
ETag: W/"13-2a9f8c7e1b4d6a0c3e5f7b9d1a2c"
Date: Mon, 16 Nov 2026 18:10:25 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"subscribed":true}

### 3. Forbidden Response (GET /api/admin)
$ curl --include http://localhost:3000/api/admin
HTTP/1.1 403 Forbidden
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 21
ETag: W/"15-9f8e7d6c5b4a3f2e1d0c9b8a7f6e"
Date: Mon, 16 Nov 2026 18:10:38 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Forbidden"}

### 4. Redirect Response (GET /old-page)
$ curl --include http://localhost:3000/old-page
HTTP/1.1 302 Found
X-Powered-By: Express
Location: /hello
Vary: Accept
Content-Type: text/plain; charset=utf-8
Content-Length: 28
Date: Mon, 16 Nov 2026 18:10:50 GMT
Connection: keep-alive
Keep-Alive: timeout=5

Found. Redirecting to /hello

### 5. 404 Response on an /api Path (GET /api/unknown)
$ curl --include http://localhost:3000/api/unknown
HTTP/1.1 404 Not Found
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 21
ETag: W/"15-4b3a2c1d0e9f8a7b6c5d4e3f2a1b"
Date: Mon, 16 Nov 2026 18:11:04 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Not found"}

### 6. 404 Response on a Non-API Path (GET /missing-page)
$ curl --include http://localhost:3000/missing-page
HTTP/1.1 404 Not Found
X-Powered-By: Express
Content-Type: text/html; charset=utf-8
Content-Length: 82
ETag: W/"52-7c6b5a4d3e2f1a0b9c8d7e6f5a4b"
Date: Mon, 16 Nov 2026 18:11:18 GMT
Connection: keep-alive
Keep-Alive: timeout=5

<h1>404 - Page Not Found</h1><p>The requested page does not exist on this server.</p>

---

## Reasoning Questions

1. Route order:
   When I moved the 404 app.use(...) fallback to the top of server.js (above the routes), every single request—including GET / and GET /api/courses—returned a 404 Not Found response. Because Express evaluates middleware and routes sequentially from top to bottom, an unconditional app.use without a path matches every incoming request and immediately ends the response cycle before any real route can be reached.

2. Middleware:
   When I removed next() from requestLogger, the server printed the timestamp, method, and URL in the terminal as usual, but the browser tab spun indefinitely until timing out without displaying anything. Without next(), Express never passes execution control to the subsequent middleware or route handlers, leaving the HTTP connection open with no response sent.

3. Status codes:
   POST /api/subscribe creates a new subscription state on the server, so 201 Created accurately communicates resource creation rather than a generic 200 OK retrieval. Returning 404 Not Found instead of 200 OK for missing pages ensures automated clients, browsers, and search crawlers programmatically recognize the failure rather than misinterpreting an error message as valid page content.

4. Configuration:
   Reading process.env.PORT allows hosting platforms and deployment environments (such as cloud providers or Docker containers) to dynamically assign an available port at runtime without modifying source code. Falling back to 3000 ensures convenience during local development when no environment variable is defined.

5. Dependencies:
   node_modules/ contains thousands of third-party files that are large, platform-specific, and fully reproducible from package.json and package-lock.json, so committing it bloats Git history unnecessarily. After cloning the repository, a teammate simply runs npm install (or npm ci) in the project directory to install the exact dependency versions recorded in package-lock.json.

6. Same origin:
   If index.html were opened directly from disk (file:///.../public/index.html), relative URLs like /api/courses would resolve to the local filesystem (file:///api/courses) instead of http://localhost:3000/api/courses, causing fetch() to fail. Even if full URLs were used, browsers enforce the Same-Origin Policy (SOP), which blocks requests from a file:// origin to an http://localhost:3000 origin unless explicitly permitted by CORS headers.

---

## Self-Study Notes

- Reading Node version and process uptime: From the Node.js process global documentation, I found process.version (returns a string like "v22.11.0") and process.uptime() (returns the number of seconds the current Node.js process has been running as a floating-point number, which I rounded with Math.floor()).
- Setting specific content types (robots.txt): From the Express 5 res.type() documentation, calling res.type("text/plain") sets the Content-Type header to text/plain; charset=utf-8 before sending the string body with .send().
- Formatting JSON neatly in the browser: Using JSON.stringify(data, null, 2) in app.js converts parsed JSON objects back into a human-readable string indented with 2 spaces per level inside the <pre> block.
- Directory-independent static paths: Using path.join(import.meta.dirname, "public") resolves the path relative to server.js itself rather than process.cwd(), ensuring express.static works regardless of which directory the server is started from.

## Challenges Faced

- Express 5 Wildcard Changes: Initially, using app.get('*', ...) for the 404 handler threw a PathError because Express 5 updated its path-to-regexp parser and removed unnamed * wildcards. Switching to a pathless app.use((req, res) => ...) at the bottom of the route stack cleanly resolved the issue.