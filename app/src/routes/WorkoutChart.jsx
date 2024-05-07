import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import PageContainer from "../components/PageContainer";
import { SendGet } from '../common/http';
import { Link } from 'react-router-dom';


export const WorkoutCalendarRoute = {
    path: "/exercise",
    element: <PageContainer></PageContainer>,
    children: [
        {
            path: "/exercise/calendar",
            element: <WorkoutChart />
        }
    ]
}

export default function WorkoutChart () {
    const today = new Date();
    const [endDay, setEndDay] = useState(new Date());

    // Initial state setup for a week's data
    const initialData = [
        { day: 'Monday', consumed: 0, goal: 2000 },
        { day: 'Tuesday', consumed: 0, goal: 2000 },
        { day: 'Wednesday', consumed: 0, goal: 2000 },
        { day: 'Thursday', consumed: 0, goal: 2000 },
        { day: 'Friday', consumed: 0, goal: 2000 },
        { day: 'Saturday', consumed: 0, goal: 2000 },
        { day: 'Sunday', consumed: 0, goal: 2000 }
    ];
    const [days, setDays] = useState(initialData);

    async function getStats(endDate) {
        let tomorrow = new Date(endDate.toLocaleDateString());
        tomorrow.setDate(tomorrow.getDate() +1);
        const result = await SendGet("/api/calorie/stats", 
            {endDate: endDate.toLocaleDateString(), endTime: tomorrow.getTime()});
        const stats = result.stats.map((stat) => {return {day: stat.date, goal: stat.calorieGoal, consumed: stat.calories}});
        return stats;
    }

    useEffect(() => {
        async function fetchData() {
            const stats = await getStats(endDay);
            setDays(stats);
        }
        fetchData();
    }, [])

    async function handleClickPre() {
        let newEndDate = endDay;
        newEndDate.setDate(newEndDate.getDate() - 7);
        const stats = await getStats(newEndDate);
        setEndDay(newEndDate);
        setDays(stats);
    }

    async function handleClickNext() {
        let newEndDate = endDay;
        newEndDate.setDate(newEndDate.getDate() + 7);
        const stats = await getStats(newEndDate);
        setEndDay(newEndDate);
        setDays(stats);
    }

    

    // Data for the chart
    const data = {
        labels: days.map(day => day.day),
        datasets: [
            {
                label: 'Calories Consumed',
                data: days.map(day => day.consumed),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
            {
                label: 'Calorie Goal',
                data: days.map(day => day.goal),
                borderColor: 'rgb(54, 162, 235)',
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
            }
        ]
    };

    const options = {
        scales: {
            y: {
                beginAtZero: true
            }
        },
        plugins: {
            legend: {
                display: true
            }
        }
    };

    return (
        <div className='section'>
            <div className="sub-nav">
                <Link to="/exercise" style={{color: 'var(--my-blue)'}}> Back to Daily Exercise Log</Link>
            </div>
            <h1 className='primary-title'>Weekly Calorie Tracker</h1>
            <Line data={data} options={options} />
            <div className="h-container">
                    <button className="button" style={{margin: "1rem", marginBottom: "0"}} onClick={handleClickPre}> pre </button>
                    {endDay < today &&
                    <button className="button" style={{margin: "1rem", marginBottom: "0"}} onClick={handleClickNext}> next </button>}
            </div>
        </div>
    );
}

