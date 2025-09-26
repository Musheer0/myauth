🔐 Auth System – NestJS, PostgreSQL, Redis

A production-ready authentication and session management system built with NestJS, PostgreSQL (Neon), and Redis (Upstash).
Designed for web and mobile clients, this service provides secure user registration, email verification, login, multi-factor authentication (MFA), session management, and OAuth integration.


---

🚀 Features

Email + Password Authentication

Email Verification Flow

JWT-based Sessions

Multi-Factor Authentication (MFA)

Session Management (list, revoke, logout others)

Password Reset Flow

Google OAuth (Web)

Rate Limiting (Redis-backed)

Caching for session & user lookups

DB Sessions (stored in Postgres for audit & multi-device login)



---

🛠️ Tech Stack

NestJS – framework

PostgreSQL (Neon) – user & session storage

Redis (Upstash) – caching & rate-limit store

JWT – stateless authentication



---

📦 Installation

# clone repo
git clone https://github.com/Musheer0/myauth
cd  myauth 

# install deps
npm install

# setup environment variables
cp .env.example .env

# run migrations
npm run prisma:migrate

# start dev server
npm run start:dev


---

⚙️ Environment Variables

wip


---

📡 API Reference

Below is the list of routes exposed by the service.


---

🔑 Authentication Routes

Sign Up

POST /api/v1/auth/sign-up

Registers a new user with email + password.
Returns verification token info.

// request
{
  "email": "user@example.com",
  "password": "mypassword123"
}

// response
{
  "verification_id": "6f9619ff-8b86-d011-b42d-00cf4fc964ff",
  "expires_at": "2025-09-21T12:34:56.000Z"
}


---

Verify Email

POST /api/v1/auth/verify-email

Verifies the email using the code. Returns a session token.

// request
{
  "token_id": "6f9619ff-8b86-d011-b42d-00cf4fc964ff",
  "code": "123456"
}

// response
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}


---

Resend Verification Email

POST /api/v1/auth/resend/verification/email

Resends the email verification token.

// request
{ "email": "user@example.com" }

// response
{
  "verification_id": "6f9619ff-8b86-d011-b42d-00cf4fc964ff",
  "expires_at": "2025-09-21T12:34:56.000Z"
}


---

🔐 Sign In Flow

Sign In with Credentials

POST /api/v1/auth/sign-in/credentials

Authenticates using email + password. May require MFA.

// request
{
  "email": "user@example.com",
  "password": "mypassword123"
}

// success response
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}

// if MFA required
{
  "error": "mfa_required",
  "verification_id": "6f9619ff-8b86-d011-b42d...",
  "expires_at": "2025-09-21T12:34:56.000Z",
  "message": "Login blocked. Multi-factor authentication required."
}


---

Sign In with MFA

POST /api/v1/auth/sign-in/mfa

Completes MFA login flow.

// request
{
  "token_id": "6f9619ff-8b86-d011-b42d-00cf4fc964ff",
  "code": "123456"
}

// response
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}


---

👤 User & Session Routes

Get Current User

GET /api/v1/auth/me (Auth Required)

Returns current session + user profile.

{
  "session": {
    "id": "cm1vxinrh0000vqy9bikt1j6k",
    "expires_at": "2025-09-28T12:34:56.000Z",
    "client": "web",
    "ip": "192.168.1.1",
    "parsed_location": "Mangalore, India"
  },
  "user": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "is_email_verified": true,
    "image_url": "https://example.com/avatar.png"
  }
}


---

Logout Current User

DELETE /api/v1/auth/logout

Invalidates the current session.

{ "success": true }


---

Logout All Other Sessions

DELETE /api/v1/auth/logout/all

Logs out user from all other devices.

{ "success": true }


---

Get All Sessions

GET /api/v1/auth/me/all

Lists all active sessions.

[
  {
    "primary": true,
    "id": "cm1vxinrh0000vqy9bikt1j6k",
    "ip": "192.168.1.1",
    "parsed_location": "Mangalore, India"
  },
  {
    "primary": false,
    "id": "cm1vxinrh0001vqy9bikt1j7l",
    "ip": "172.16.0.5",
    "parsed_location": "Bangalore, India"
  }
]


---

🔒 MFA Routes

Enable MFA

PATCH /api/v1/auth/enable/mfa

{ "mfa_enabled": true }

Disable MFA

PATCH /api/v1/auth/disable/mfa

{ "mfa_enabled": false }


---

🔑 Password Reset

Generate Reset Token

GET /api/v1/auth/reset/password

// request
{ "email": "user@example.com" }

// response
{
  "verification_id": "6f9619ff-8b86-d011-b42d...",
  "expires_at": "2025-09-21T12:34:56.000Z"
}

Change Password

PATCH /api/v1/auth/reset/password

// request
{
  "token_id": "6f9619ff-8b86-d011-b42d...",
  "code": "123456",
  "password": "newPassword123"
}

// response
{ "success": true }


---

🌐 Google OAuth (Web)

Get Google OAuth URL

GET /api/v1/auth/sign-in/google/web?redirect_uri={callback}&state={optional}

Redirects user to Google’s OAuth consent screen.

OAuth Callback

POST /api/v1/auth/sign-in/google/web/callback

Handles Google callback and signs in the user.

// success
{
  "success": true,
  "state": "some-random-state",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}

// MFA required
{
  "error": "mfa_required",
  "verification_id": "6f9619ff-...",
  "expires_at": "2025-09-21T12:34:56.000Z"
}


---

🧪 Rate Limiting

Configured via Redis Upstash

Default: 10 requests / 60 seconds per IP

Applied on sensitive endpoints like login & sign-up



---

📊 Session Storage

Sessions stored in Postgres

Includes:

device/client info

IP + geo-location

last used timestamp


Enables multi-device login & revocation



---

🗂️ Folder Structure (simplified)

src/
  auth/
    controllers/
    services/
    strategies/
    dto/
  common/
    interceptors/
    guards/
    filters/
  config/
  main.ts


---

✅ Todo / Future

[ ] Support for Apple & GitHub OAuth

[ ] Admin dashboard for session management



---

📜 License

MIT – free to use & modify.