
# J.P. Kirana Ledger

A professional daily cash flow management application tailored for small businesses (Kirana stores).

## Features

- **Daily Transaction Recording**: Track income and expenses easily.
- **Offline Support**: Works without internet using LocalStorage and syncs when online.
- **Multi-User Sync**: Link multiple devices (e.g., Shop Owner & Family) to a single ledger ID.
- **Financial Analytics**: Visual charts and weekly summaries.
- **AI Insights**: Integrated Google Gemini AI to answer questions about your finances (requires API Key).
- **Secure Access**: PIN-based lock screen.

## Tech Stack

- **Frontend**: React (ES Modules), Tailwind CSS
- **Database**: Firebase Firestore (with Offline Persistence)
- **AI**: Google Gemini API via `@google/genai` SDK
- **Charts**: Recharts

## Setup & Running

This project uses **ES Modules** and **Import Maps**, meaning it runs directly in modern browsers without a complex build step (Webpack/Vite), though it is best served via a static file server.

1. **Configure Firebase**:
   - Open `services/firebase.ts`.
   - Update the `getFirebaseConfig` object with your own Firebase project credentials.

2. **Configure AI (Optional)**:
   - AI features require a Google Gemini API Key.
   - For a production deployment, this should be handled via a backend proxy. For local testing, you can set it in `services/geminiService.ts`.

3. **Run Locally**:
   - You can use any static server. For example, if you have Python installed:
     ```bash
     python3 -m http.server
     ```
   - Or using VS Code's "Live Server" extension.

## License

Private / Proprietary
