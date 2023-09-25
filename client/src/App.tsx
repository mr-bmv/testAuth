import React, { useEffect, useState } from "react";

interface User {
  id: number;
  login: string;
}

interface AuthResponse {
  token: string;
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const token = query.get("token");

    if (token) {
      const user = JSON.parse(atob(token.split(".")[1])) as User;
      setUser(user);
    }
  }, []);

  const login = () => {
    window.location.href = "http://localhost:3001/login";
  };

  const logout = () => {
    setUser(null);
  };
  return (
    <div className="App">
      {user ? (
        <>
          <h1>Welcome, {user.login}!</h1>
          <button onClick={logout}>LogOut</button>
        </>
      ) : (
        <button onClick={login}>LogIn</button>
      )}
    </div>
  );
};

export default App;
