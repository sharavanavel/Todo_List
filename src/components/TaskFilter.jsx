// TaskFilter.jsx — buttons to switch between All / Active / Completed views.
const FILTERS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

function TaskFilter({ currentFilter, onChangeFilter }) {
  return (
    <div className="task-filter">
      {FILTERS.map((filter) => (
        <button
          key={filter.value}
          className={filter.value === currentFilter ? "active" : ""}
          onClick={() => onChangeFilter(filter.value)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}

export default TaskFilter;
