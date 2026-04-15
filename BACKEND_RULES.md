# RAILROVERR DIRECTIVE: HIGH-CONCURRENCY PROXY ARCHITECTURE

## 1. Project Overview & Tech Stack
- **Framework:** Next.js 16 (App Router) exclusively.
- **Language:** Strict TypeScript. No `any` types.
- **Database/Cache:** Redis (Upstash / ioredis). No relational databases; this data is flat and highly transient.
- **Validation:** Zod for all incoming requests and outgoing scraper payloads.

## 2. Core Architecture: Functional Domain Modules
We use a **Domain-Driven** modular structure. This isolates the scraping logic from the routing logic.

```text
└── src/
    ├── app/
    │   └── api/
    │       └── search/
    │           └── route.ts             // The "Dumb Pipe" (Next.js App Router)
    └── modules/
        └── trains/
            ├── train.service.ts         // Business/Scraping orchestration
            ├── train.cache.ts           // Redis interactions (The Shield)
            ├── train.schema.ts          // Zod validations & TS Interfaces
    └── utils/
        └── fetcher.ts                   // Unified HTTP client (User-Agent rotation)
        
3. Strict Coding Rules (NON-NEGOTIABLE)
PURE FUNCTIONAL PROGRAMMING (NO CLASSES): Strictly ban the class keyword and this context. Use pure exported objects and arrow functions.

THE REDIS FIRST MANDATE: Upstream train APIs are heavily rate-limited. Every service function MUST check the train.cache.ts layer before invoking the fetcher.ts utility. If a cache miss occurs, fetch the data, immediately write it back to Redis with a strict TTL (e.g., 5 minutes), and then return it.

NO RELATIONAL OVERHEAD: Do not attempt to normalize this data into relational tables. Store the scraped JSON payloads as flat strings in Redis keys (e.g., trains:search:NDLS:BCT:12-04-2026).

STANDARD ERROR HANDLING (NO THROWS): Services must never throw new Error() up to the route handler. Return a standardized payload:

TypeScript
// Error
return { success: false, message: "Upstream API timeout", statusCode: 502 };
// Success
return { success: true, data: resultPayload };
4. The 5 Laws of App Router Deployment
THE ZOMBIE RULE: Never comment out dead imports. Delete them. Unused SDKs crash serverless functions.

THE LOCKFILE PACT: Never manually edit package.json. Always run pnpm install. Keep the pnpm-lock.yaml synced for Vercel.

THE STRICT-RETURN ROUTE ARCHITECTURE: Next.js App Router functions (export async function GET(req: NextRequest)) must NEVER return undefined.

Define the return type: Promise<NextResponse>.

Every code path (including every if and catch block) MUST end with return NextResponse.json(...).

THE CLOUD-NAKED PRINCIPLE: Assume Vercel knows nothing. All Redis URLs and scraping proxy tokens must be added to Vercel Environment Variables before pushing.

THE FALLBACK PARSER: If the upstream HTML/JSON structure changes unexpectedly, catch the parsing error gracefully, return a 502 (Bad Gateway), and log the raw payload for debugging. Do not crash the Node process.

End of Document