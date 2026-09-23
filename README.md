# Personal Daily Task Manager — Version 3

A simple, beginner-friendly to-do app built with **React + Vite**. You can add
tasks (with an **optional** due date and time, description, priority and
category), mark them as done, filter between All / Active / Completed, get a
**reminder notification** when a scheduled task's time arrives — and now send a
**real email reminder to your Gmail** via [EmailJS](https://www.emailjs.com/)
(free tier, no backend needed).

---

> **🗄️ Version 3 + MongoDB:** tasks are now saved in MongoDB through a small Express backend
> in `server/`. Setup, Atlas and deployment steps are in **[DEPLOYMENT.md](./DEPLOYMENT.md)**.
> Short version: `npm run install:all`, create `server/.env` (see `server/.env.example`),
> then run `npm run server` and `npm run dev` in two terminals.

## 1. What you need installed

Before you start, install these two free tools:

1. **Node.js (LTS version)** — includes `npm`, the package manager.
   Download from <https://nodejs.org> and install with the default options.
   Check it works by opening a terminal and running:
   ```bash
   node --version
   npm --version
   ```
   Both commands should print a version number.

2. **Visual Studio Code** — the code editor.
   Download from <https://code.visualstudio.com>.
   Recommended extension (optional): **ES7+ React/Redux/React-Native snippets**.

---

## 2. How to run the project in VS Code

1. **Open the folder** in VS Code:
   `File → Open Folder…` and select the `personal-task-manager` folder
   (unzip it first if you downloaded it as a ZIP).

2. **Open VS Code's built-in terminal:**
   `` Terminal → New Terminal `` (or press `` Ctrl + ` `` / `` Cmd + ` `` on Mac).
   The terminal opens inside the project folder automatically.

3. **Install the dependencies** (only needed once, or after `package.json` changes):
   ```bash
   npm install
   ```
   This reads `package.json` and downloads React, Vite and EmailJS into a new
   `node_modules/` folder. It can take a minute.

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open the app in your browser** at:
   ```
   http://localhost:5173
   ```

6. **Edit and see instant results.** While `npm run dev` is running, any change
   you save in VS Code appears in the browser immediately (this is Vite's
   "hot module replacement").

7. **Stop the server** at any time by pressing `Ctrl + C` in the terminal.

### Other available commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the dev server with live reload |
| `npm run build` | Builds a production-ready version into the `dist/` folder |
| `npm run preview` | Serves the built `dist/` folder locally so you can check it |

---

## 3. ⚙️ Enter your Gmail address and EmailJS keys (do this first!)

Everything you need to configure is at the **top of one file**:

- **File to open:** `src/services/notificationService.js`
- **Lines to edit:** **lines 15–20**

It looks exactly like this:

```js
// ==========================================
// 🔑 EMAILJS & GMAIL CONFIGURATION
// Fill in your credentials from https://www.emailjs.com/
// ==========================================
export const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';     // line 15
export const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';   // line 16
export const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';     // line 17

// 👉 CONFIGURE YOUR GMAIL ADDRESS HERE:
export const USER_GMAIL = 'your-email@gmail.com';        // line 20
```

Replace the four placeholder values with your own (keep the quotes), save the
file, and the app picks it up instantly. The Gmail address is also shown at
the bottom of the app page, so you can confirm it worked.

> **Don't have the keys yet?** The app still works! The checker simply logs a
> friendly console message instead of sending. Follow the next section to get
> free keys in about 5 minutes.

---

## 4. 📧 How to get free EmailJS keys (step-by-step)

EmailJS lets a front-end-only app send real emails through your Gmail account.
The free tier allows 200 emails/month — plenty for personal reminders.

### Step 1 — Create a free account

1. Go to <https://www.emailjs.com/> and click **Sign Up**.
2. Register with your email and confirm it.

### Step 2 — Connect your Gmail ("Email Service")

1. In the EmailJS dashboard, open **Email Services** (left sidebar).
2. Click **Add New Service** and choose **Gmail**.
3. Click **Connect Account** and sign in with the Gmail you want reminders sent
   from (usually the same address you put in `USER_GMAIL`).
4. Give it a name like "My Gmail" and click **Create Service**.
5. EmailJS shows a **Service ID**, e.g. `service_abc123`.
   👉 Copy it into `src/services/notificationService.js` **line 15**
   (`EMAILJS_SERVICE_ID`).

### Step 3 — Create the email template

1. Open **Email Templates** (left sidebar) → **Create New Template**.
2. Set the template content. In the **Subject** put, for example:
   ```
   ⏰ Reminder: {{task_title}}
   ```
3. In the **Content** (body) put exactly these variables:
   ```
   Task: {{task_title}}
   Details: {{task_description}}
   Due date: {{due_date}}
   Due time: {{due_time}}
   Priority: {{priority}}
   Category: {{category}}
   ```
4. In the **To Email** field on the right ("Settings"/"To" tab) put:
   ```
   {{to_email}}
   ```
5. Save the template. EmailJS shows a **Template ID**, e.g. `template_xyz789`.
   👉 Copy it into **line 16** (`EMAILJS_TEMPLATE_ID`).

> ⚠️ The names inside `{{...}}` must match exactly: `task_title`,
> `task_description`, `due_date`, `due_time`, `priority`, `category`,
> `to_email`. These are what `sendTaskEmailReminder()` sends.

### Step 4 — Copy your Public Key

1. Open **Account** (left sidebar) → **General**.
2. Find **Public Key**, e.g. `AbCdEfGhIjKlMnOp`.
3. 👉 Copy it into **line 17** (`EMAILJS_PUBLIC_KEY`).

### Step 5 — Test it

1. Save the file, wait for the browser to reload.
2. Add a task with **today's date** and a time **1–2 minutes in the future**
   (e.g. now is 14:30 → set 14:32).
3. Keep the app tab open. When the time arrives you'll get a browser
   notification, and within a few seconds the reminder email lands in your
   Gmail inbox. The task card then shows **✅ Email sent via EmailJS**.

**Troubleshooting:** open the browser console (`F12` → Console). Every step is
logged with a `[notifications]` prefix, including a clear explanation if the
keys are missing or if EmailJS rejected the send.

---

## 5. The optional time feature

- The "Add Task" form has a **Due date** input and a **Time** input
  (`<input type="time" />`). **Both are optional.**
- Leave them empty → the task is saved with `dueDate: null` and `dueTime: null`
  and behaves exactly like a normal to-do.
- Pick only a date → the app assumes **09:00** as the reminder time.
- Pick a date *and* a time (e.g. `14:30`) → that exact moment is used.
- When a task has a schedule, the card shows it in a friendly format:
  `Due: 19/09/2026 at 02:30 PM`.
- Click the 🕑 button on any task card to **edit or clear** its date and time
  later. Clearing the fields sets them back to `null`.

---

## 6. How the notification + email check works

Everything lives in **`src/services/notificationService.js`**, and the checker
itself runs in a `useEffect` inside **`src/App.jsx`**.

1. When the app starts, it asks the browser for notification permission once.
   Click **Allow** in the browser popup.
2. A timer (`setInterval`) runs **every 30 seconds** — change
   `CHECK_INTERVAL_MS` in `App.jsx` if you want it faster or slower.
3. On each tick it looks at every task and skips it if the task is completed,
   has no date, or has already fired a reminder (`emailSent: true` or the
   task's id is in the `alreadyNotified` Set).
4. If the task's `dueDate` + `dueTime` is **now or in the past**, it fires:
   - a **browser notification** (or a plain `alert()` if notifications are
     blocked),
   - a **real email via EmailJS** to your `USER_GMAIL` address. If the keys
     are still placeholders, nothing is sent — instead a friendly console
     message explains exactly what to do (press `F12` → Console to see it),
   - when the email succeeds, the task is marked `emailSent: true` and the
     card displays **✅ Email sent via EmailJS**,
   - a **1-click email option**: the ✉️ button on the task card opens your mail
     app with the reminder already written and addressed to your Gmail.
5. Each task reminds/emails **only once** — no spam every 30 seconds.
   Editing a task's time resets that, so it can remind again at the new moment.

---

## 7. Project structure — what each file does

```
personal-task-manager/
├── index.html                  The single HTML page. React mounts into <div id="root">.
├── package.json                Lists dependencies (React, Vite, @emailjs/browser) and npm scripts.
├── vite.config.js              Vite configuration: enables the React plugin and sets the dev port.
├── public/                     Static files (images, icons) served as-is at the site root.
├── src/
│   ├── main.jsx                Entry point: finds #root and renders <App />.
│   ├── App.jsx                 Root component: tasks state, add/edit/toggle/delete, reminder checker.
│   ├── App.css                 All global styles (plain CSS, no framework).
│   ├── services/
│   │   └── notificationService.js  👉 Your EmailJS keys + Gmail (lines 15–20), notifications, email sending.
│   └── components/
│       ├── Header.jsx          App title and today's date.
│       ├── TaskForm.jsx        Title, description, date, time, priority, category; sends the new task up to App.
│       ├── TaskSummary.jsx     Small stats bar: Total / Done / Left.
│       ├── TaskFilter.jsx      All / Active / Completed filter buttons.
│       ├── TaskList.jsx        Maps over tasks and renders one TaskCard per task.
│       └── TaskCard.jsx        One task row: complete, badges, due date/time, email status, edit 🕑, email ✉️, delete ✕.
└── README.md                   This file.
```

---

## 8. How the data flows (important for beginners)

- **`App.jsx` is the single source of truth.** It keeps the `tasks` array in
  React state with `useState`, and defines `addTask`, `updateTask`,
  `toggleTask`, and `deleteTask`.
- **A task object looks like this:**
  ```js
  { id: 1758271200000, title: "Call the dentist", description: "Ask about cleaning",
    completed: false, dueDate: "2026-09-19", dueTime: "14:30",
    priority: "High", category: "Health", emailSent: false }
  ```
  `dueDate`, `dueTime` and `description` are `null` when you leave those
  inputs empty.
- **Data goes down as props.** App passes `tasks` to `TaskSummary` and
  `TaskList`, and `TaskList` passes each single `task` to `TaskCard`.
- **Events go up as callbacks.** When you click "Add Task", `TaskForm` calls
  `onAddTask({ title, description, dueDate, dueTime, priority, category })` —
  which is really App's `addTask`. The same pattern is used for editing,
  toggling and deleting.
- **Filtering is computed, not stored.** App derives `visibleTasks` from the
  current filter before rendering.

---

## 9. Ideas for what to build next (Version 4+)

- Save tasks to `localStorage` so they survive a page refresh
- A "Clear completed" button and sorting by priority
- Overdue highlighting (red when a task is past its time)
- Try Tailwind CSS or a component library for styling

Happy coding! 🚀
