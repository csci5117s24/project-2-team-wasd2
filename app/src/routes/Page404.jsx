import Header from "../components/Header"

export default function Page404() {
    return (
        <div className="main-page-container">
            <div>
                <Header></Header>
            </div>
            <div className="main-page-body">
                <h1 className="primary-title">404 Not Found</h1>
            </div>
        </div>
    )
}