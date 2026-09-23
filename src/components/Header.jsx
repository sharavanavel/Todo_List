// Header.jsx — displays the app title and today's date.
function Header() {
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="header">
      <h1>📋 My Daily Tasks</h1>
      <p className="header-date">{today}</p>
    </header>
  );
}

export default Header;
