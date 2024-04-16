import "../css/Header.css";


function Header() {
    return (
        <div className="level header">
            <div className="level-left">
                <div className="level-item">
                    <img className="icon" src="/logo512.png" alt="logo"></img>
                    <span>Our App Name</span>
                </div>
            </div>
        </div>
    )
}

export default Header;