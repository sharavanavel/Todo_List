// TaskSummary.jsx — shows quick stats about the tasks.
function TaskSummary({ tasks }) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const remaining = total - completed;

  return (
    <div className="task-summary">
      <span>Total: {total}</span>
      <span>Done: {completed}</span>
      <span>Left: {remaining}</span>
    </div>
  );
}

export default TaskSummary;
