import { useEffect, useState } from "react";
import PageContainer from "../components/PageContainer";
import Calendar from 'react-calendar'
import { BarChart } from "../components/Charts";
import { Link } from "react-router-dom";
import { SendGet } from "../common/http";

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

export function PageWaterCalendar() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [waterLogs, setWaterLogs] = useState([]);

    async function handleClickDay(value, e) {
        console.log("clicked on date: ", value);
        setSelectedDate(value);
    }

    useEffect(() => {
        async function fetchData() {
            const date = selectedDate.toLocaleDateString();
            const logs = await SendGet("/api/waterlog", {date: date});
            setWaterLogs(logs.waterlog);
        }
        fetchData();
    }, [selectedDate])

    return (
        <div className="container">
            <NavigationBar/>
            <HistoryChart/>
            <div className="calendar-container">
                <Calendar 
                    calendarType="gregory"
                    onClickDay={(value, e) => handleClickDay(value, e)} 
                    value={selectedDate}/>
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

    async function showLast7Day() {
        const title = "Last 7 days";
        setDateRange("days");
        setChartTitle(title);
        const data = await SendGet("/api/water/stats", {rangeType: "days"})
        setChartData(data.dataset);
    }

    async function showLast4Week() {
        const title = "Last 4 weeks";
        setChartTitle(title);
        setDateRange("weeks");
        const data = await SendGet("/api/water/stats", {rangeType: "weeks"})
        setChartData(data.dataset);
    }

    async function showLast12Month() {
        const title = "Last 12 months";
        setChartTitle(title);
        setDateRange("months");
        const data = await SendGet("/api/water/stats", {rangeType: "months"})
        setChartData(data.dataset);
    }

    return (
        <div className="card chart-container">
            <div className="container has-text-centered">
                <div className="date-range-buttons">
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
    function toLocaleTime(utcTime) {
        let res = new Date(utcTime);
        return res.toLocaleDateString() + " " + res.toLocaleTimeString();
    }

    const listItems = waterLogs.map(wl => 
        <li>
            <div className="waterlog-single">
                <img className="cactus-log" src="/cactus.svg" alt="cactus"></img>
                <p>{"" + wl.value + wl.unit}</p>
                <p className="create-time">{toLocaleTime(wl.createDate)}</p>
            </div>
        </li>
    )

    return (
        <ul className="waterlog-list">
            {listItems}
        </ul>
    )

}