// App.jsx — the root component. It owns the task list state and
// passes data and handler functions down to the child components.
// Tasks are stored in MongoDB (via the backend API in src/services/api.js).
// It also runs the REMINDER CHECKER (see the useEffect below).
import { useState, useEffect, useRef } from "react";
import Header from "./components/Header.jsx";
import TaskForm from "./components/TaskForm.jsx";
import TaskFilter from "./components/TaskFilter.jsx";
import TaskList from "./components/TaskList.jsx";
import TaskSummary from "./components/TaskSummary.jsx";
import {
  USER_GMAIL,
  requestNotificationPermission,
  getTaskDueDateTime,
  sendTaskReminder,
} from "./services/notificationService.js";
import { fetchTasks, createTask, patchTask, removeTask } from "./services/api.js";

// How often the reminder checker looks at your tasks (30 seconds).
const CHECK_INTERVAL_MS = 30 * 1000;

function App() {
  const [tasks, setTasks] = useState([]); // loaded from MongoDB below
  const [loadError, setLoadError] = useState(null);
  const [filter, setFilter] = useState("all"); // "all" | "active" | "completed"

  // Remembers which tasks already fired, so you are not alerted twice
  // and the email does NOT spam you every 30 seconds.
  const alreadyNotified = useRef(new Set());

  // Ask for notification permission once, when the app starts.
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Load all tasks from MongoDB once, when the app starts.
  useEffect(() => {
    fetchTasks()
      .then(setTasks)
      .catch((err) => {
        console.error("Could not load tasks:", err);
        setLoadError("Could not load tasks. Is the server running?");
      });
  }, []);

  // ----------------------------------------------------------
  // THE REMINDER CHECKER
  // Every 30 seconds it walks through the tasks and asks:
  // "is this task unfinished, scheduled, and is its time here yet?"
  // If yes → browser notification + REAL email via EmailJS,
  // then the task is marked with emailSent: true so it only
  // happens once per task.
  // ----------------------------------------------------------
  useEffect(() => {
    function checkReminders() {
      const now = new Date();

      tasks.forEach((task) => {
        if (task.completed) return; // finished tasks never remind
        if (task.emailSent) return; // email already sent for this task
        if (alreadyNotified.current.has(task.id)) return; // already fired

        const due = getTaskDueDateTime(task);
        if (!due) return; // no date chosen → nothing to schedule

        if (due <= now) {
          alreadyNotified.current.add(task.id);

          // sendTaskReminder is async: notification first, then the email.
          sendTaskReminder(task).then(({ emailResult }) => {
            if (emailResult === "sent") {
              // Save to MongoDB so it is remembered after a page refresh.
              patchTask(task.id, { emailSent: true }).catch(console.error);
              // Mark the task so the card shows "✅ Email sent via EmailJS"
              // and the checker never emails about it again.
              setTasks((current) =>
                current.map((t) => (t.id === task.id ? { ...t, emailSent: true } : t))
              );
            }
          });
        }
      });
    }

    checkReminders(); // run once immediately
    const timer = setInterval(checkReminders, CHECK_INTERVAL_MS);
    return () => clearInterval(timer); // clean up when the app closes
  }, [tasks]);

  // Add a new task (called by TaskForm). All schedule fields are optional.
  // MongoDB creates the id, so we wait for the saved task to come back.
  async function addTask({ title, description = null, dueDate = null, dueTime = null, priority = "Normal", category = "General" }) {
    try {
      const saved = await createTask({ title, description, dueDate, dueTime, priority, category });
      setTasks((current) => [...current, saved]);
    } catch (err) {
      console.error("Add failed:", err);
    }
  }

  // Edit an existing task, e.g. change or clear its date/time.
  async function updateTask(id, changes) {
    // Re-schedule: allow this task to notify/email again with its new time.
    alreadyNotified.current.delete(id);
    try {
      const saved = await patchTask(id, { ...changes, emailSent: false });
      setTasks((current) => current.map((task) => (task.id === id ? saved : task)));
    } catch (err) {
      console.error("Update failed:", err);
    }
  }

  // Flip a task's completed flag (called by TaskCard).
  async function toggleTask(id) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    try {
      const saved = await patchTask(id, { completed: !task.completed });
      setTasks((current) => current.map((t) => (t.id === id ? saved : t)));
    } catch (err) {
      console.error("Toggle failed:", err);
    }
  }

  // Remove a task (called by TaskCard).
  async function deleteTask(id) {
    try {
      await removeTask(id);
      setTasks((current) => current.filter((task) => task.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  }

  // Apply the current filter before rendering the list.
  const visibleTasks = tasks.filter((task) => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  return (
    <div className="app">
      <Header />
      <main className="container">
        {loadError && <p className="empty-message">{loadError}</p>}
        <TaskForm onAddTask={addTask} />
        <TaskSummary tasks={tasks} />
        <TaskFilter currentFilter={filter} onChangeFilter={setFilter} />
        <TaskList
          tasks={visibleTasks}
          onToggleTask={toggleTask}
          onDeleteTask={deleteTask}
          onUpdateTask={updateTask}
        />
        <p className="gmail-note">
          Reminder emails are addressed to: <strong>{USER_GMAIL}</strong>
          <br />
          Change it in <code>src/services/notificationService.js</code> (line 20).
        </p>
      </main>
    </div>
  );
}

export default App;
