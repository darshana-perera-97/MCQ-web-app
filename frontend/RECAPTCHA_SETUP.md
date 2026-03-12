# Google reCAPTCHA v2 Setup Instructions

This project uses Google reCAPTCHA v2 (checkbox “I’m not a robot”) on **student login**, **student signup**, and **admin login**. Follow these steps to enable it.

---

## 1. Create a reCAPTCHA v2 site (if you don’t have one)

1. Go to [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin).
2. Sign in with your Google account.
3. Click **+ Create** (or “Create”).
4. Fill in:
   - **Label**: e.g. “MCQ Web App”
   - **reCAPTCHA type**: choose **reCAPTCHA v2** → **“I’m not a robot” Checkbox**
   - **Domains**: add your frontend domain(s), e.g.:
     - `localhost` (for local dev)
     - `gov-exam.nexgenai.asia` (your production domain)
5. Accept the terms and click **Submit**.
6. Copy the **Site Key** (for the frontend) and the **Secret Key** (for the backend). You’ll add these in the next steps.

---

## 2. Frontend: add the Site Key

1. In the **frontend** folder, create or edit the **`.env`** file.
2. Add (use your actual site key from step 1):

   ```env
   REACT_APP_RECAPTCHA_SITE_KEY=your_site_key_here
   ```

3. Save the file. Restart the dev server (`npm start`) or run a new build (`npm run build`) so the variable is picked up.

---

## 3. Backend: add the Secret Key

1. In the **backend** folder, create or edit the **`.env`** file.
2. Add (use your actual secret key from step 1):

   ```env
   RECAPTCHA_SECRET=your_secret_key_here
   ```

3. Save the file and restart the backend server.

---

## 4. Verify it works

1. Open your app (e.g. `http://localhost:3000/login`).
2. You should see the reCAPTCHA checkbox (“I’m not a robot”) above the Sign In / Create Account button.
3. Complete the captcha and log in or sign up. The request should succeed.
4. If you leave the captcha unchecked and submit, you should see: “Please complete the captcha”.

---

## Optional: run without reCAPTCHA

- **Frontend**: If `REACT_APP_RECAPTCHA_SITE_KEY` is not set (or empty), the reCAPTCHA widget is hidden and no token is sent.
- **Backend**: If `RECAPTCHA_SECRET` is not set (or empty), the server skips verification and accepts the request.

So you can develop or run the app without configuring reCAPTCHA; the forms still work.

---

## Where it’s used

| Screen        | What’s protected   |
|---------------|--------------------|
| Student Login | Login form         |
| Student Signup| Multi-step signup  |
| Admin Login   | Admin login form   |

---

## Troubleshooting

| Issue | What to check |
|-------|----------------|
| Widget not showing | Ensure `REACT_APP_RECAPTCHA_SITE_KEY` is set in `frontend/.env` and you restarted the dev server. |
| “Captcha verification failed” | Ensure `RECAPTCHA_SECRET` in `backend/.env` matches the **Secret Key** for the same reCAPTCHA site. |
| “Captcha expired” | Tokens are single-use and time-limited. Ask the user to complete the captcha again and submit. |
| Wrong domain | In [reCAPTCHA Admin](https://www.google.com/recaptcha/admin), add the exact domain (e.g. `localhost` or your production host). |

---

## Files involved

- **Frontend**
  - `src/components/RecaptchaWidget.js` – reCAPTCHA v2 checkbox (only renders when site key is set).
  - `src/components/LoginSignup.js` – student login/signup with captcha.
  - `src/components/AdminLogin.js` – admin login with captcha.
  - `src/components/MultiStepSignup.js` – passes captcha token on final submit.
  - `src/context/AuthContext.js` – login/signup accept and send `recaptchaToken`.
  - `src/services/api.js` – user and admin login/signup send `recaptchaToken` in the request body.

- **Backend**
  - `services/recaptchaService.js` – verifies the token with Google.
  - `controllers/userController.js` – verifies captcha on login and signup.
  - `routes/adminRoutes.js` – verifies captcha on admin login.
