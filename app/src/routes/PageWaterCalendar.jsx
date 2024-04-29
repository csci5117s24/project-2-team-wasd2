import { useEffect, useState } from "react";
import PageContainer from "../components/PageContainer";
import Calendar from 'react-calendar'
import { waterLogList } from "../common/mock_data";
import BarChart from "../components/BarChart";
import { Link } from "react-router-dom";

export const WaterCalendarRoute = {
    path: "/water",
    element: <PageContainer></PageContainer>,
    children: [
        {
            path: "/water/calendar",
            element: <PageWaterCalendar/>
        }
    ]
}

export const MainpageWaterCalendarRoute = {
    path: "/",
    element: <PageWaterCalendar/>,

}

export function PageWaterCalendar() {
    const [value, setValue] = useState(new Date());
    const [waterLogs, setWaterLogs] = useState([]);

    async function handleClickDay(value, e) {
        console.log("clicked on date: ", value);
        setValue(value);
        setWaterLogs(waterLogList);
    }

    return (
        <div className="container">
            <NavigationBar/>
            <HistoryChart/>
            <div className="calendar-container">
                <Calendar 
                    calendarType="gregory"
                    onClickDay={(value, e) => handleClickDay(value, e)} 
                    value={value}/>
            </div>
            <LogList waterLogs={waterLogs}></LogList>
        </div>
    )
}

function NavigationBar() {
    return (
        <div className="sub-nav">
            <img className="icon" src="/water_drop.svg" alt="to water log"/>
            <Link to="/water"> Back to Water Log</Link>
        </div>
    )
}


function HistoryChart() {

    const [dateRange, setDateRange] = useState("days");
    const [chartData, setChartData] = useState({});
    const [charTitle, setChartTitle] = useState("");

    useEffect(()=>{showLast7Day()},[]);

    function showLast7Day() {
        const title = "Last 7 days"
        const data = [
            {label: "Apr 1", value: 2000},
            {label: "Apr 2", value: 3000},
            {label: "Apr 3", value: 3000},
            {label: "Apr 4", value: 2500},
            {label: "Apr 5", value: 0},
            {label: "Apr 6", value: 300},
            {label: "Apr 7", value: 3000},
        ]
        setChartData(data);
        setChartTitle(title);
        setDateRange("days");
    }

    function showLast4Week() {
        const title = "Last 4 weeks"
        const data = [
            {label: "Mar17-Mar23", value: 14000},
            {label: "Mar24-Mar30", value: 30000},
            {label: "Mar31-Apr6", value: 10000},
            {label: "Apr7-Apr13", value: 25000},
        ]
        setChartData(data);
        setChartTitle(title);
        setDateRange("weeks");
    }

    function showLast12Month() {
        const title = "Last 12 months"
        const data = [
            {label: "May", value: 3000},
            {label: "Jun", value: 2500},
            {label: "Jul", value: 0},
            {label: "Aug", value: 300},
            {label: "Sep", value: 3000},
            {label: "Oct", value: 4000},
            {label: "Nov", value: 4000},
            {label: "Dec", value: 5000},
            {label: "Jan", value: 5000},
            {label: "Feb", value: 3500},
            {label: "Mar", value: 2000},
            {label: "Apr", value: 3000},
        ]
        setChartData(data);
        setChartTitle(title);
        setDateRange("months");
    }

    return (
        <div className="card chart-container">
            <div className="container has-text-centered">
                <div className="level">
                    <ChartButton description="Days" 
                        clicked={dateRange === "days"} 
                        handleClick={showLast7Day}/>
                    <ChartButton description="Weeks" 
                        clicked={dateRange === "weeks"} 
                        handleClick={showLast4Week}/>
                    <ChartButton description="Months" 
                        clicked={dateRange === "months"} 
                        handleClick={showLast12Month}/>
                </div>
                <BarChart dataset={chartData} title={charTitle}/>
            </div>
        </div>
    )

}

function ChartButton({description, clicked, handleClick}) {

    const className = clicked ? "button is-info" : "button";

    return (
        <button className={className} onClick={handleClick}>{description}</button>
    )
}

function LogList({waterLogs}) {
    const listItems = waterLogs.map(wl => 
        <li>
            <div className="level">
                <div className="level-left">
                    <div className="level-item">
                        <img className="cactus-log" src="/cactus.svg" alt="cactus"></img>
                    </div>
                </div>
                <div className="level-right">
                    <div className="level-item">
                        <p>{"" + wl.value + wl.unit}</p>
                    </div>
                </div>
            </div>
        </li>
    )

    return (
        <ul>
            {listItems}
        </ul>
    )

}