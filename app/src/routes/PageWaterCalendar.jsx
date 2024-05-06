import { useEffect, useState } from "react";
import PageContainer from "../components/PageContainer";
// import Calendar from 'react-calendar'
import { BarChart } from "../components/Charts";
import { Link } from "react-router-dom";
import { SendGet } from "../common/http";
import ReactLoading from 'react-loading';
import { Button }   from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Calendar } from "../components/ui/calendar";

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
    const [loading, setLoading] = useState(true);

    async function handleClickDay(value, e) {
        console.log("clicked on date: ", value);
        setSelectedDate(value);
    }

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const date = selectedDate.toLocaleDateString();
            const logs = await SendGet("/api/waterlog", {date: date});
            setLoading(false);
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
                    mode="single"
                    selected={selectedDate}
                    onSelect={(value, e) => handleClickDay(value, e)}
                    className="rounded-md border"
                    />
            </div>
            {loading ? <div className="center-items"><ReactLoading type="bars" color="#3EA4F0" /></div> : 
            <LogList waterLogs={waterLogs}></LogList>}
        </div>
    )
}

function NavigationBar() {
    return (
        <div className="sub-nav">
            <img className="icon" src="/water_drop.svg" alt="to water log"/>
            <Button asChild variant="link">
            <Link to="/water"> Back to Water Log</Link>
            </Button>
        </div>
    )
}


function HistoryChart() {
    const today = new Date();
    const [dateRange, setDateRange] = useState("days");
    const [chartData, setChartData] = useState({});
    const [charTitle, setChartTitle] = useState("");
    const [endDate, setEndDate] = useState(new Date());

    const placeholderData = [{label:"", value:0}, {label:"", value:0}, {label:"", value:0},{label:"", value:0}, {label:"", value: 0}];

    useEffect(()=>{
        setChartData(placeholderData);
        showLast7Day();
    }, []);

    async function showLast7Day() {
        setChartData(placeholderData);
        const title = "Last 7 days";
        setDateRange("days");
        setChartTitle(title);
        const data = await SendGet("/api/water/stats", {rangeType: "days", dateStr: endDate.toLocaleDateString()});
        setChartData(data.dataset);
    }

    async function showLast4Week() {
        setChartData(placeholderData);
        const title = "Last 4 weeks";
        setChartTitle(title);
        setDateRange("weeks");
        const data = await SendGet("/api/water/stats", {rangeType: "weeks", dateStr: endDate.toLocaleDateString()})
        setChartData(data.dataset);
    }

    async function showLast12Month() {
        setChartData(placeholderData);
        const title = "Last 12 months";
        setChartTitle(title);
        setDateRange("months");
        const data = await SendGet("/api/water/stats", {rangeType: "months", dateStr: endDate.toLocaleDateString()})
        setChartData(data.dataset);
    }

    function getDateDiff() {
        if (dateRange === "days") {
            return 7
        } else if (dateRange === "weeks") {
            return 28
        } else {
            return 365
        }
    }

    async function handleClickPre() {
        let newEndDate = endDate;
        newEndDate.setDate(newEndDate.getDate() - getDateDiff());
        setEndDate(newEndDate);
        if(dateRange === "days") {
            showLast7Day();
        } else if (dateRange === "weeks") {
            showLast4Week();
        } else if (dateRange === "months") {
            showLast12Month();
        }
    }

    async function handleClickNext() {
        let newEndDate = endDate;
        newEndDate.setDate(newEndDate.getDate() + getDateDiff());
        setEndDate(newEndDate);
        if(dateRange === "days") {
            showLast7Day();
        } else if (dateRange === "weeks") {
            showLast4Week();
        } else if (dateRange === "months") {
            showLast12Month();
        }
    }

    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Water Log History</CardTitle>
                    <CardDescription>Check your water intake history</CardDescription>
                    <br/>
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
                <br/>
                <BarChart dataset={chartData} title={charTitle}/>
                <div className="h-container">
                    <Button className="button" style={{margin: "1rem", marginBottom: "0"}} onClick={handleClickPre}> prev</Button>
                    {endDate < today &&
                    <Button className="button" style={{margin: "1rem", marginBottom: "0"}} onClick={handleClickNext}> next </Button>}
                </div>
                </CardHeader>
            </Card>
        </div>
    )
}

function ChartButton({description, clicked, handleClick}) {

    const className = clicked ? "button is-info" : "button";

    return (
        <Button className={className} onClick={handleClick}>{description}</Button>
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