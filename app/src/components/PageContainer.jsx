import { Outlet } from "react-router-dom";
import Header from "./Header";
import "../css/PageContainer.css";


function PageContainer() {
    return (
        <div>
            <nav className="navbar">
                <Header></Header>
            </nav>
            <div  className="hero is-fullheight-with-navbar">
                <div className="content-container">
                    <Outlet></Outlet>
                </div>
            </div>
        </div>
    )
}

export default PageContainer;