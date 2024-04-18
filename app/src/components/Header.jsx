import "../css/Header.css";
import { NavLink } from "react-router-dom";

function Header() {
    return (
        <div className="level header">
            <div className="level-left">
                <div className="level-item">
                    <NavLink to="/">
						<img className="icon" src="/cactus.svg" alt="cactus logo"></img>
                    	<span>Our App Name</span>
					</NavLink>
                </div>
            </div>
        </div>
    )
}

export default Header;