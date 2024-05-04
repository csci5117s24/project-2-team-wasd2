import Header from "../components/Header";
import { useContext, useEffect, useState } from "react";
import UserContext from "../components/UserContext";
import "../css/PageMain.css";
import { LineChart } from "../components/Charts";
import { SendGet } from "../common/http";
import ReactLoading from 'react-loading';

export const MainpageRoute = {
    path: "/",
    element: <PageMain/>
}

function PageMain() {
    const userinfo  = useContext(UserContext);
    const content = userinfo && userinfo.userDetails ? <LoggedInMainPage/> : <NotLoggedInMainPage/>;
    
    return  (
        <div className="main-page-container">
            <div>
                <Header></Header>
            </div>
            <div className="main-page-body">
                {content}
            </div>
        </div>
    )
}


function LoggedInMainPage() {
    
    return (
        <div>
            <h1 style={{textAlign: "center"}}> Welcome Back</h1>
            <p style={{ textAlign:"center", margin: "0", marginBottom: "2rem"}}>Here is your daily summary</p>
            <DailyCharts/>
        </div>
    )
}

function NotLoggedInMainPage() {
    function login() {
        window.location.href = "/.auth/login/aadb2c";
    }
    return (
        <div className="columns">
            <div className="column is-three-fifths">
                <h1>Health Tracker</h1>
                <p>This app will help you keep track of your water drinking, weight change, and exercises
                    to make sure you are reaching your daily and weekly goals.
                    <br/>Log in to get started.</p>
                <div className="login-button-container">
                    <button onClick={login}>Log In</button>
                </div>
            </div>
            <div className="column auto">
                <div className="figure">
                    <img src="/human_figures.svg"/>
                </div>
            </div>
        </div>
    )
}

function DailyCharts() {
    const [waterData, setWaterData] = useState({});
    const [weightData, setWeightData] = useState({});
    const [exerciseData, setExerciseData] = useState({});
    const [loading, setLoading] = useState(true);

    const mockdata = [ {label: "Apr 1", value: 2000},
    {label: "Apr 2", value: 3000},
    {label: "Apr 3", value: 3000},
    {label: "Apr 4", value: 2500},
    {label: "Apr 5", value: 0},
    {label: "Apr 6", value: 300},
    {label: "Apr 7", value: 3000},]

    useEffect(()=>{
        async function fetchData() {
            setLoading(true);
            const today = new Date().toLocaleDateString();
            const water = await SendGet("/api/water/stats", {rangeType: "days", dateStr: today});
            setWaterData(water.dataset);
            setWaterData(water.dataset);
            setWeightData(mockdata);
            const exercise = await SendGet("/api/calorie/stats", {endDate: today});
            const chartData = exercise.stats.map((stat) => {return {label: stat.date, value: stat.calories}})
            setExerciseData(chartData);
            setLoading(false);
        }
        fetchData();
    }, [])

    if (loading) {
        return (
            <div className="main-page-body">
                <ReactLoading type="bars" color="#14F3CB" />
            </div>
        )
    } else {
        return (
            <div className="columns">
                <div className="column is-one-third">
                    <LineChart dataset={waterData} title={"water drinking"}></LineChart>
                </div>
                <div className="column is-one-third">
                    <LineChart dataset={weightData} title={"weight change"}></LineChart>
                </div>
                <div className="column is-one-third">
                    <LineChart dataset={exerciseData} title={"calorie consumed"}></LineChart>
                </div>
            </div>
        )
    }
}