import { NavLink } from "react-router-dom";
import "../css/Footer.css";


function Footer() {
    return (
        <nav className="tabs is-boxed is-fullwidth footer">
            <div className="container">
                <ul>
                    <li><NavLink to="/water">Log Water</NavLink></li>
                    <li><NavLink to="/weight">Log Weight</NavLink></li>
                    <li><NavLink to="/exercise/workoutform">Log Exercise</NavLink></li>
                </ul>
            </div>
        </nav>
    )
}

export default Footer;