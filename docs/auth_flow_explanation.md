# Authentication & Invitation Flow Design

This document explains the architecture of the authentication flows, how client invitation token link generation/entry works, and the design decisions behind the chosen approach.

---

## 1. General Authentication Flow

The application supports three authentication paths, which issue a stateless **JWT (JSON Web Token)** upon completion:

*   **Google OAuth Flow** ([`google_login`](file:///Users/vaaheesan/Desktop/CTS-NPN/telecom-backend/app/api/auth.py#L294-L450)):
    *   The frontend authenticates the user via Google and forwards either the `id_token` or `access_token` to the backend.
    *   The backend validates the token directly with Google's APIs (`oauth2.googleapis.com/tokeninfo` or `googleapis.com/oauth2/v3/userinfo`).
    *   Upon successful validation, the backend matches the email to an existing user. If the email doesn't exist, it auto-provisions a new record:
        *   If the email matches an active invitation, the user is provisioned as a `client` staff member.
        *   If the email is the Master Admin (`vaahee21@gmail.com`), the user is provisioned as a master client.
        *   Otherwise, the user is provisioned as a standard `customer`.
*   **Standard Register Flow** ([`register_user`](file:///Users/vaaheesan/Desktop/CTS-NPN/telecom-backend/app/api/auth.py#L453-L500)):
    *   Users register using an email and password.
    *   The backend hashes the password using **Bcrypt** ([`get_password_hash`](file:///Users/vaaheesan/Desktop/CTS-NPN/telecom-backend/app/core/security.py#L28-L32)).
    *   It generates a 6-digit verification OTP and saves it to the database with a timestamp.
    *   It dispatches an OTP email to the user. The user remains unverified until they hit the [`verify_otp`](file:///Users/vaaheesan/Desktop/CTS-NPN/telecom-backend/app/api/auth.py#L609-L640) endpoint within 10 minutes.
*   **Standard Login Flow** ([`login_user`](file:///Users/vaaheesan/Desktop/CTS-NPN/telecom-backend/app/api/auth.py#L503-L528)):
    *   The backend verifies the entered password against the stored Bcrypt hash using [`verify_password`](file:///Users/vaaheesan/Desktop/CTS-NPN/telecom-backend/app/core/security.py#L35-L42).
*   **JWT Session Handling** ([`create_access_token`](file:///Users/vaaheesan/Desktop/CTS-NPN/telecom-backend/app/core/security.py#L45-L57)):
    *   For all successful logins, the server returns an `access_token` signed with a HS256-hashed JWT secret containing the user's email (`sub`) and `role`. 
    *   Protected API routes use [`get_current_user`](file:///Users/vaaheesan/Desktop/CTS-NPN/telecom-backend/app/core/security.py#L84-L113) to parse the `Authorization: Bearer <token>` header, validate the signature, check the expiry, and load the active database user profile.

---

## 2. Client Invitation & Token Link Flow

For staff/operator onboarding, we use a secure token link flow instead of standard self-registration:

### Step A: Generation ([`invite_client`](file:///Users/vaaheesan/Desktop/CTS-NPN/telecom-backend/app/api/auth.py#L727-L800))
1. The **Master Admin** (`vaahee21@gmail.com`) submits an invitation request containing the candidate's email, target department, and a temporary password.
2. The backend generates a cryptographically secure random identifier (**UUIDv4**) token: `token = str(uuid.uuid4())`.
3. It stores the metadata in the `ClientInvitation` staging table (saving the hashed password, email, department, token, and sets an expiration window of 7 days).
4. The backend constructs a redirect link pointing to its own domain: 
   ```
   http://<backend_url>/api/auth/lnk/{token}
   ```
5. An HTML email containing this link is dispatched to the invitee.

### Step B: Entry & Redirection ([`resolve_short_link`](file:///Users/vaaheesan/Desktop/CTS-NPN/telecom-backend/app/api/auth.py#L868-L881))
1. When the user clicks the link in their email, they hit the backend endpoint `GET /api/auth/lnk/{token}`.
2. The backend looks up the token. If valid, it returns a `307 Temporary Redirect` response pointing to the frontend activation path:
   ```
   http://<frontend_url>/auth/activate?token={token}
   ```

### Step C: Provisioning & Activation ([`activate_client`](file:///Users/vaaheesan/Desktop/CTS-NPN/telecom-backend/app/api/auth.py#L804-L864))
1. The frontend parses the `token` parameter from the URL and submits it via a `POST` request to `/api/auth/activate-client`.
2. The backend checks that:
   * The token exists and is valid.
   * The token has not expired (`expires_at > now`).
   * The account has not already been activated.
3. Upon validation, it flags the invitation as `is_activated = True`.
4. It creates a new `User` record with the `client` role, maps them to the pre-configured `department_id`, applies the pre-hashed password, and marks their email as verified (`email_verified = True`), allowing them to log in immediately.

---

## 3. Why We Chose This Approach (and Not Others)

| Approach | How it Works | Why We Rejected It |
| :--- | :--- | :--- |
| **Direct Registration** | Anyone can navigate to a sign-up page and choose their role/department. | **High Risk**: Untrusted actors could sign up as internal staff or assign themselves to departments, resulting in privilege escalation. |
| **Direct Frontend Link in Email** | Email link points straight to `frontend/auth/activate?token=abc`. | **Brittle Routing**: If the frontend routing architecture changes or moves, all pending invitation emails in users' inboxes are broken. It also prevents backend-side click verification or tracking. |
| **Instant Provisioning** | Create the User record in the `users` table immediately when the invitation is sent, marked as "inactive". | **Database Pollution**: Inviting users who never accept or click the link fills the primary `users` database table with dead accounts and conflicts with future sign-up constraints. |

### Key Advantages of the Chosen Design:
1. **Decoupled Redirection Route (`/api/auth/lnk/{token}`)**: By acting as an intermediary redirection service, the backend abstracts away where the activation frontend actually lives. If the frontend route changes, we update one environment variable (`FRONTEND_URL`) on the backend without invalidating already sent emails.
2. **Lazy Provisioning (Staging Table)**: Storing invitations in a `ClientInvitation` table keeps the main `User` table clean. A `User` record is only created when activation is completed, protecting the primary data model from junk records.
3. **Security Constraints**: 
   * **Unguessable Tokens**: UUIDv4 tokens are secure against brute-force enumerations.
   * **Stricter Privilege Escalation Controls**: Since staff roles/departments are pre-allocated by the Master Admin at the time of invitation and stored safely on the server side, candidates cannot modify their role or department assignment during activation.
   * **Expiration Windows**: The 7-day expiration constraint limits the duration for which compromised invitation links remain active.
