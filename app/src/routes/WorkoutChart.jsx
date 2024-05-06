import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import PageContainer from "../components/PageContainer";
import { SendGet } from '../common/http';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';


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
        const result = await SendGet("/api/calorie/stats", {endDate: endDate.toLocaleDateString()});
        const stats = result.stats.map((stat) => {return {day: stat.date, goal: stat.calorieGoal, consumed: stat.calories}});
        // setDays(stats);
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

    
    // Handle changes in calorie input
    function handleCalorieInput(dayIndex, consumed) {
        const newDays = days.map((day, index) => {
            if (index === dayIndex) {
                return { ...day, consumed: parseInt(consumed, 10) };
            }
            return day;
        });
        setDays(newDays);
    }

    // Handle changes in goal input
    function handleGoalInput(dayIndex, goal) {
        const newDays = days.map((day, index) => {
            if (index === dayIndex) {
                return { ...day, goal: parseInt(goal, 10) };
            }
            return day;
        });
        setDays(newDays);
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
                <Button asChild variant="link">
                <Link to="/exercise" style={{color: 'var(--my-blue)'}}> Back to Daily Exercise Log</Link>
                </Button>
            </div>
            <h1 className='scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl'>Weekly Calorie Tracker</h1>
            {/* {days.map((day, index) => (
                <div key={index}>
                    <div>{day.day}</div>
                    <input
                        type="number"
                        placeholder="Enter calories consumed"
                        value={day.consumed}
                        onChange={(e) => handleCalorieInput(index, e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Set calorie goal"
                        value={day.goal}
                        onChange={(e) => handleGoalInput(index, e.target.value)}
                    />
                </div>
            ))} */}
            <Line data={data} options={options} />
            <div className="h-container">
                    <Button className="button" style={{margin: "1rem", marginBottom: "0"}} onClick={handleClickPre}> prev </Button>
                    {endDay < today &&
                    <Button className="button" style={{margin: "1rem", marginBottom: "0"}} onClick={handleClickNext}> next </Button>}
            </div>
        </div>
    );
}

