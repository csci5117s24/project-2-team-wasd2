import "../css/Header.css";
import { Link, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { useLocation } from 'react-router-dom'; 

function Header() {
    const [isNarrow, setIsNarrow] = useState(false);

    useEffect(
        () => {
            function handleResize() {
                const windowWidth = window.innerWidth;
                if (windowWidth < 900) {
                    setIsNarrow(true);
                } else {
                    setIsNarrow(false);
                }
            }
            handleResize();
            window.addEventListener("resize", handleResize);
            return () => {
                window.removeEventListener("resize", handleResize);
            }
        }
    )

    if (isNarrow) {
        return <MobileHeader/>
    } else {
        return <NormalHeader/>
    }
}

function NormalHeader() {
    return (
        <div className="level header">
            <div className="level-left">
                <div className="level-item">
                    <NavLink to="/">
                        <img className="logo" src="/logo.svg" alt="logo"></img>
					</NavLink>
                </div>
                <div className="level-item">
                    <MenuNav/>
                </div>
            </div>
            <div className="level-right">
                <div className="level-item">
                    <UserInfo/>
                </div>
            </div>
        </div>
    )
}

function MobileHeader() {
    return (
        <div className="header">
            <img className="mobile-logo" src="/options.svg" alt="logo"></img>
            <DropdownNav/>
            <UserInfo/>
        </div>
    )
}

function MenuNav() {
    const [selected, setSelected] = useState("");
    const {pathname} = useLocation();

    useEffect(() => {
        console.log(pathname);
        if (pathname.startsWith("/water")) {
            setSelected("water");
        } else if (pathname.startsWith("/weight")) {
            setSelected("weight");
        } else if (pathname.startsWith("/exercise")) {
            setSelected("exercise");
        } else {
            setSelected("");
        }
        return () => {};
      },[pathname]);

    return (
        <div className="nav">
            <NavItem desc="Log Water" to="/water" isSelected={selected==="water"}/>
            <NavItem desc="Log Weight" to="/weight" isSelected={selected==="weight"}/>
            <NavItem desc="Log Exercise" to="/exercise" isSelected={selected==="exercise"}/>
        </div>
    )
}

function NavItem({desc, to, isSelected}) {
    const className = isSelected ? "selected-menu" : "menu";
    return (
        <div className={className}>
            <Link to={to}>{desc}</Link>
        </div>
    )
}

function DropdownNav() {

    const [isActive, setIsActive] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState("Home");
    const dropdownClass = isActive ? "dropdown is-active" : "dropdown";

    function showOrHideMenu() {
        setIsActive(!isActive);
    }

    function selectMenu(menu) {
        setSelectedMenu(menu);
        setIsActive(false);
    }

    return (
        <div className={dropdownClass}>
            <div className="dropdown-trigger">
                <button className="" aria-haspopup="true" aria-controls="dropdown-menu" onClick={showOrHideMenu}>
                    <span>{selectedMenu}</span>
                </button>
            </div>
            <div className="dropdown-menu" id="dropdown-menu" role="menu">
                <div class="dropdown-content">
                    <Link className="dropdown-item" to="/" onClick={()=>selectMenu("Home")}> Home </Link>
                    <Link className="dropdown-item" to="/water" onClick={()=>selectMenu("Log Water")}> Log Water </Link>
                    <Link className="dropdown-item" to="/weight" onClick={()=>selectMenu("Log Weight")}> Log Weight </Link>
                    <Link className="dropdown-item" to="/exercise" onClick={()=>selectMenu("Log Exercise")}> Log Exercise </Link>
                </div>
            </div>
            </div>
    )
}

function UserInfo() {
    const [avtarUrl, setAvtarUrl] = useState("");

    useEffect( () => {
        setAvtarUrl("https://avatars.githubusercontent.com/u/35808021?v=4");
        return () => {}
        }, []
    )

    function login() {
        setAvtarUrl("https://avatars.githubusercontent.com/u/35808021?v=4");
    }

    function logout() {
        setAvtarUrl("");
    }

    return (
        <div className="user-info">
            {avtarUrl && <img className="avatar" src={avtarUrl} alt="avatar"/>}
            {avtarUrl ? 
                <button className="button is-primay" onClick={logout}>Log Out</button> : 
                <button className="button is-primay" onClick={login}>Log In</button>}
        </div>
    )
}


export default Header;