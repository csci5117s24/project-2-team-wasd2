import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import PageContainer from "../components/PageContainer";


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
        <div>
            <h1>Weekly Calorie Tracker</h1>
            {days.map((day, index) => (
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
            ))}
            <Line data={data} options={options} />
        </div>
    );
}

