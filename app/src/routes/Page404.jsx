import Header from "../components/Header"

export default function Page404() {
    return (
        <div className="main-page-container">
            <div>
                <Header></Header>
            </div>
            <div className="main-page-body">
                <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">404 Not Found</h1>
            </div>
        </div>
    )
}