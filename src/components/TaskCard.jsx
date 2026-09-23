// TaskCard.jsx — displays a single task, its optional due date/time,
// priority, category, a checkbox, a small edit panel and a delete button.
import { useState } from "react";
import {
  formatDueDateTime,
  buildMailtoLink,
} from "../services/notificationService.js";

function TaskCard({ task, onToggle, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [dueDate, setDueDate] = useState(task.dueDate || "");
  const [dueTime, setDueTime] = useState(task.dueTime || "");

  function saveChanges() {
    // Empty inputs become null again, so "no time chosen" stays clean.
    onUpdate(task.id, { dueDate: dueDate || null, dueTime: dueTime || null });
    setIsEditing(false);
  }

  const dueText = formatDueDateTime(task); // "" when no date was chosen

  return (
    <li className={`task-card ${task.completed ? "completed" : ""}`}>
      <div className="task-card-main">
        <label className="task-card-label">
          <input type="checkbox" checked={task.completed} onChange={onToggle} />
          <span className="task-title">{task.title}</span>
        </label>

        <div className="task-card-actions">
          {/* 1-click email reminder for this task */}
          {dueText && (
            <a
              className="email-button"
              href={buildMailtoLink(task)}
              title="Email this reminder to yourself"
            >
              ✉️
            </a>
          )}
          <button
            className="edit-button"
            onClick={() => setIsEditing(!isEditing)}
            aria-label={`Edit schedule for: ${task.title}`}
          >
            🕑
          </button>
          <button
            className="delete-button"
            onClick={onDelete}
            aria-label={`Delete task: ${task.title}`}
          >
            ✕
          </button>
        </div>
      </div>

      {task.description && <p className="task-description">{task.description}</p>}

      {/* Little badges for priority and category */}
      <p className="task-badges">
        <span className={`badge priority-${(task.priority || "Normal").toLowerCase()}`}>
          {task.priority || "Normal"}
        </span>
        <span className="badge category">{task.category || "General"}</span>
      </p>

      {/* Show the schedule only when the task actually has one. */}
      {dueText && <p className="task-due">Due: {dueText}</p>}

      {/* Clean status line: only appears after the email was sent. */}
      {task.emailSent && <p className="email-status">✅ Email sent via EmailJS</p>}

      {isEditing && (
        <div className="task-edit">
          <input
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            aria-label="Edit due date"
          />
          <input
            type="time"
            value={dueTime}
            onChange={(event) => setDueTime(event.target.value)}
            aria-label="Edit due time"
          />
          <button onClick={saveChanges}>Save</button>
        </div>
      )}
    </li>
  );
}

export default TaskCard;
