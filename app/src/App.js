import './App.css';
import { Outlet } from 'react-router-dom';
import UserContext from './components/UserContext';
import { useEffect, useState } from 'react';

// todo: new auth 



function App() {

  const [userinfo, setUserinfo] = useState({});

  useEffect(() => {
    async function getuserinfo() {
      const resp = await fetch("/.auth/me");
      if (!resp.ok) {
        throw new Error("Network response was not OK"); 
      }
      const data = await resp.json();
      console.log(data);
      setUserinfo(data.clientPrincipal);
      // if (userinfo) {
      //   localStorage.setItem("userinfo", JSON.stringify(userinfo));
      //   window.location.href = "/todos";
      // }
    }
    getuserinfo();
  }, []
  )

  // const userInfo = getuserinfo();
  console.log("userinfo in app: ", userinfo);

  return (
    <UserContext.Provider value={userinfo}>
      <div className="App">
        <Outlet></Outlet>
      </div>
    </UserContext.Provider>
  );
}

export default App;
