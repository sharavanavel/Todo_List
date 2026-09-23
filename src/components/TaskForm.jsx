// TaskForm.jsx — inputs for adding a new task.
// The date and the time inputs are BOTH optional: leave them empty
// and the task is simply saved without a schedule.
import { useState } from "react";

function TaskForm({ onAddTask }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(""); // "2026-09-19" or ""
  const [dueTime, setDueTime] = useState(""); // "14:30" or ""
  const [priority, setPriority] = useState("Normal"); // Low | Normal | High
  const [category, setCategory] = useState("General"); // free text

  function handleSubmit(event) {
    event.preventDefault(); // stop the page from reloading
    const trimmed = title.trim();
    if (trimmed === "") return; // ignore empty tasks

    // Empty inputs are saved as null, never as an empty string.
    onAddTask({
      title: trimmed,
      description: description.trim() || null,
      dueDate: dueDate || null,
      dueTime: dueTime || null,
      priority,
      category: category.trim() || "General",
    });

    // Clear the inputs back to their defaults.
    setTitle("");
    setDescription("");
    setDueDate("");
    setDueTime("");
    setPriority("Normal");
    setCategory("General");
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="What do you need to do today?"
        aria-label="New task title"
      />

      <input
        type="text"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Description (optional)"
        aria-label="Description (optional)"
      />

      <div className="task-form-row">
        <label className="field">
          <span>Due date (optional)</span>
          <input
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            aria-label="Due date (optional)"
          />
        </label>

        {/* 👇 The optional time picker, e.g. 14:30 */}
        <label className="field">
          <span>Time (optional)</span>
          <input
            type="time"
            value={dueTime}
            onChange={(event) => setDueTime(event.target.value)}
            aria-label="Due time (optional)"
          />
        </label>
      </div>

      <div className="task-form-row">
        <label className="field">
          <span>Priority</span>
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
            aria-label="Priority"
          >
            <option value="Low">Low</option>
            <option value="Normal">Normal</option>
            <option value="High">High</option>
          </select>
        </label>

        <label className="field">
          <span>Category</span>
          <input
            type="text"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            placeholder="e.g. Work, Home, Study"
            aria-label="Category"
          />
        </label>
      </div>

      <button type="submit">Add Task</button>
    </form>
  );
}

export default TaskForm;
