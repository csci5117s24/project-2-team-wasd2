import './App.css';
import { Outlet } from 'react-router-dom';
import UserContext from './components/UserContext';
import { useEffect, useState } from 'react';


function App() {

  const [userinfo, setUserinfo] = useState({});

  useEffect(() => {
    async function getuserinfo() {
      const resp = await fetch("/.auth/me");
      if (!resp.ok) {
        throw new Error("Network response was not OK"); 
      }
      const data = await resp.json();
      setUserinfo(data.clientPrincipal);
    }
    getuserinfo();
  }, []
  )

  return (
    <UserContext.Provider value={userinfo}>
      <div className="App">
        <Outlet></Outlet>
      </div>
    </UserContext.Provider>
  );
}

export default App;
