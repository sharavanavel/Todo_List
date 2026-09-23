// TaskList.jsx — renders a TaskCard for every task it receives.
import TaskCard from "./TaskCard.jsx";

function TaskList({ tasks, onToggleTask, onDeleteTask, onUpdateTask }) {
  if (tasks.length === 0) {
    return <p className="empty-message">No tasks here. Add one above! 🎉</p>;
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggle={() => onToggleTask(task.id)}
          onDelete={() => onDeleteTask(task.id)}
          onUpdate={onUpdateTask}
        />
      ))}
    </ul>
  );
}

export default TaskList;
