# TypeFlow — Typing Speed Test

A beginner-friendly, browser-based typing speed website inspired by the general idea of modern typing-test platforms, but designed with its own UI and feature set.

## Main features
- User ID + password login
- Create a local account
- Dashboard with personal stats
- 15 / 30 / 60 / 120 second tests
- Easy / Medium / Hard / Code Mix modes
- Live WPM, accuracy and error count
- Correct/incorrect character highlighting
- Test history
- Personal best WPM and accuracy
- Practice streak
- Daily challenge
- Achievements
- Progress trend chart
- Dark mode
- Focus mode
- Optional typing sounds toggle
- Copy result
- Responsive layout for desktop/tablet/mobile
- No backend required

## How to run
1. Extract the ZIP.
2. Open `index.html` in Chrome or Edge.
3. Click **Create ID** and make a user account.
4. Login and start typing.

For a more realistic development setup, use VS Code + Live Server, or run:
`python -m http.server 8000`
Then open `http://localhost:8000`.

## Important
This is a frontend/local-storage project. Passwords and results are stored in the browser for demonstration purposes. For a production website, use a real backend, hashed passwords, sessions/JWT, a database, HTTPS, and server-side validation.

## Calculation
The project uses the common typing convention of 5 characters per word:
WPM = correct characters / 5 / elapsed minutes.

Accuracy = correct characters / typed characters × 100.

Typing.com documents the same 5-keystroke word convention for WPM. See:
https://support.typing.com/en/articles/9048321
