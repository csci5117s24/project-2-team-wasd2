import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";
import "../css/PageContainer.css";


function PageContainer() {
    return (
        <div className="hero is-fullheight">
            <div className="hero-head">
                <Header></Header>
            </div>
            <div className="hero-body">
                <div className="content-container">
                    <Outlet></Outlet>
                </div>
            </div>
            <div className="hero-foot">
                <Footer></Footer>
            </div>
        </div>
    )
}

export default PageContainer;