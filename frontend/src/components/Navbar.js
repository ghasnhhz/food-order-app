import { logoutUser } from "../api";

export default function Navbar({ isLoggedIn, onLogout }) {
  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      await logoutUser(token);
      localStorage.removeItem("token");
      onLogout();
    }
  };

  return (
    <nav>
      <h1>Food Order App</h1>
      {isLoggedIn ? (
        <button onClick={handleLogout}>Logout</button>
      ) : (
        <span>Please login</span>
      )}
    </nav>
  );
}