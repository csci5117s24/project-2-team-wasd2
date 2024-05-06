import Header from "../components/Header";
import { useContext, useEffect, useState } from "react";
import UserContext from "../components/UserContext";
import "../css/PageMain.css";
import { LineChart } from "../components/Charts";
import { SendGet } from "../common/http";
import ReactLoading from 'react-loading';
import { Button } from "../components/ui/button";

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
                <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">Health Tracker</h1>
                <p className="leading-7 [&:not(:first-child)]:mt-6">Want to track your health? Experience the all-in-one water, weight, exercise and calorie tracker right here.
                </p>
                <p className="leading-7 [&:not(:first-child)]:mt-6">Log in to get started</p>
                <div className="login-button-container">
                    <Button onClick={login}>Log In</Button>
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
    const placeHolderData = [ {label: "", value: 0},
    {label: "", value: 0},
    {label: "", value: 0},
    {label: "", value: 0},
    {label: "", value: 0},
    {label: "", value: 0},
    {label: "", value: 0}]

    const [waterData, setWaterData] = useState(placeHolderData);
    const [weightData, setWeightData] = useState(placeHolderData);
    const [exerciseData, setExerciseData] = useState(placeHolderData);

    useEffect(()=>{
        async function fetchData() {

            const today = new Date().toLocaleDateString();
            Promise.all([
                SendGet("/api/water/stats", {rangeType: "days", dateStr: today}),
                SendGet("/api/weight/stats", {endDate: today}),
                SendGet("/api/calorie/stats", {endDate: today}),
            ]).then(([water, weight, exercise]) => {
                const weightData = weight.stats.map((stat) => {return {label: stat.date, value: stat.value}});
                const exerciseData = exercise.stats.map((stat) => {return {label: stat.date, value: stat.calories}})
                setWaterData(water.dataset);
                setWeightData(weightData);
                setExerciseData(exerciseData);
            }).catch(error=>{console.log(error)});
        }
        fetchData();
    }, [])

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