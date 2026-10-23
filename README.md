# Avi India — Frontend

A new frontend project based on the structure and coding style of the supplied Tendtrix frontend. The original Tendtrix project is kept unchanged.

## Tech stack
- React + Vite
- React Router
- Tailwind CSS
- Axios API client
- Lucide React and Framer Motion

## Run locally
1. Install Node.js (LTS).
2. In this folder, run `npm install`.
3. Copy `.env.example` to `.env` if you want to configure the API URL.
4. Run `npm run dev`.

Default API base URL: `https://aiahm.onrender.com`

## Authentication endpoints configured
- `POST /auth/register`
- `POST /auth/request-login-otp`
- `POST /auth/verify-otp`
- `POST /auth/verify-email`
- `POST /auth/resend-otp`
- `POST /auth/refresh-token`
- `POST /auth/logout`

**Integration note:** the Swagger UI endpoint list does not expose the request/response schemas in this environment. The API methods are wired to the listed paths, but request fields and token response shapes must be confirmed against Swagger before treating the end-to-end flow as verified. Existing non-auth API modules and pages are retained as the structural reference and may still need their own API URL/configuration review.
