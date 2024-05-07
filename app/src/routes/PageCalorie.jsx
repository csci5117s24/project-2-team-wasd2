import React, { useState, useEffect } from 'react';
import { SendGet, SendDelete, SendPost } from '../common/http'; 
import PageContainer from '../components/PageContainer';
import { Link } from 'react-router-dom';
import ProgressBar from "@ramonak/react-progress-bar";

export const CalorieRoute = {
    path: "/exercise",
    element: <PageContainer></PageContainer>,
    children: [
        {
            path: "/exercise",
            element: <PageCalorie/>
        }
    ]
} 


async function getWorkouts() {
    const result = await SendGet('/api/exercise/logs');
    return result.exerciseLogs;
}

async function setCalorieGoal(newGoal) {
    const now = new Date();
    await SendPost('/api/calorie/goal',
        {goal: newGoal, timestamp: now.getTime(), localeDate: now.toLocaleDateString()});
}

async function getCalorieGoal() {
    const result = await SendGet('/api/calorie/goal');
    return result.goal;
}

async function newCalorieLog(workoutId) {
    const now = new Date();
    const result = await SendPost('/api/calorie/log',
        {exerciseId: workoutId, timestamp: now.getTime(), localeDate: now.toLocaleDateString()});
    return result.id;
}

async function deleteCalorieLog(logid) {
    await SendDelete('/api/calorie/log', {logId: logid});
}

async function getCalorieLogs() {
    const today = new Date().toLocaleDateString();
    const result = await SendGet('/api/calorie/logs', {dateStr: today});
    return result.calorieLogs;
}


function PageCalorie() {
    const [goal, setGoal] = useState(0);
    const [editGoal, setEditGoal] = useState(false);
    const [calorieLogs, setCalorieLogs] = useState([]);
    const [workouts, setWorkouts] = useState([]);
    const [achieved, setAchieved] = useState(0);

    useEffect(()=>{
        async function fetchData() {
            Promise.all([
                getWorkouts(),
                getCalorieGoal(),
                getCalorieLogs()
            ]).then(([workoutList, calorieGoal, calorieLogs]) => {
                let curAchieved = 0;
                if (calorieGoal) {
                    curAchieved = calAchieved(calorieLogs, calorieGoal.goal)
                    setGoal(calorieGoal.goal);
                }
                setWorkouts(workoutList);
                setCalorieLogs(calorieLogs);
                setAchieved(curAchieved);
            }).catch(error=>{console.error(error)});
        }
        fetchData();
    }, [])

    function calAchieved(calorieLogs, goal) {
        if (goal === 0) {
            return 0
        }
        let sum = 0;
        for (let i = 0; i < calorieLogs.length; i++) {
            sum += calorieLogs[i].calories;
        }
        return Math.round(sum*100/goal);
    }

    async function updateGoal() {
        if (!goal || goal === 0) {
            alert("calorie goal can not be empty or zero!");
            return
        }
        await setCalorieGoal(goal);
        const newAchieved = calAchieved(calorieLogs, goal);
        setEditGoal(false);
        setAchieved(newAchieved);
    }

    async function addCalorieLog(workoutId) {
        if (goal === 0) {
            alert("pls set up your calorie goal first!");
            return
        }
        const newLogId = await newCalorieLog(workoutId);
        const workoutIdx = workouts.findIndex((item)=>item._id === workoutId);
        const theWorkout = workouts[workoutIdx];
        const newCaloreLog = {
            _id: newLogId,
            exerciseName: theWorkout.title,
            calories: theWorkout.calories
        }
        const newLogs = [...calorieLogs, newCaloreLog];
        const newAchieved = calAchieved(newLogs, goal);
        setCalorieLogs(newLogs);
        setAchieved(newAchieved);
    }

    async function removeCalorieLog(id) {
        deleteCalorieLog(id);
        const newLogs = calorieLogs.filter(cl => cl._id !== id);
        const newAchieved = calAchieved(newLogs, goal);
        setCalorieLogs(newLogs);
        setAchieved(newAchieved);
    }

    async function handleGoalChange(e) {
        let newGoal = e.target.value;
        if (newGoal) {
            newGoal = parseInt(newGoal);
            if (newGoal=== undefined) {
                alert("please enter integer value");
                return
            }
        } 
        setGoal(newGoal);
    }

    return (
        <div>
            <div className="motto-container">
                <p className="motto">Strength for Life: Embrace Fitness, Choose Wellness!</p>
                <img src="/quote-right.svg" alt="quote"></img>
            </div>
            <div>
                <div className='section'>
                {editGoal ? 
                    <div className='calorie-goal'>
                        <input type='text' value={goal} onChange={(e) => {handleGoalChange(e)}}></input>
                        <button onClick={updateGoal}>submit</button>
                    </div> :
                    <div className='calorie-goal'>
                        <span>Daily Calorie Goal: <span style={{fontWeight: 'bold'}}>{goal}</span></span> <button onClick={()=>{setEditGoal(true)}}>edit</button>
                    </div>}
                <div style={{padding: '0 10%'}}><ProgressBar completed={achieved} bgColor="#836FFF"/></div>
                </div>
                <h1 className='third-title'>Your Workouts 
                    <span className='title-link'><Link className='title-link' to="/exercise/workout"> Manage</Link></span>
                </h1>
                {workouts.length === 0 ? 
                <div style={{marginBottom:'2rem'}}>You have no workouts yet. Click <Link to="/exercise/workout">here</Link> to add some. </div> :
                <WorkoutList workouts={workouts} addCalorieLog={addCalorieLog}/>
                }
            
                <h1 className='third-title'>Your Exercise Logs for Today</h1>
                <Link to="/exercise/calendar" style={{color: 'var(--my-blue)'}}> History</Link>
                <CaloriesLogList calorieLogs={calorieLogs} deleteLog={removeCalorieLog}/>
            </div>
        </div>
    )
}


function CaloriesLogList({calorieLogs, deleteLog}) {
    const items = calorieLogs.map((cl) => {
        return (
            <div className='cell card item-container' key={cl._id}>
                <p >{cl.exerciseName}</p>
                <p style={{fontSize:'1.5rem', fontWeight:"bold", color: 'var(--my-blue)'}}> {cl.calories} calories</p>
                <button className='button' onClick={() => {deleteLog(cl._id)}}>Delete</button>
            </div>
        )
    })

    return (
        <div className='section'>
            <div className='grid'>
                { items }
            </div>
        </div>
    )
}

function WorkoutList({workouts, addCalorieLog}) {
    const items = workouts.map((wo) => <WorkoutItem workout={wo} addToCalorie={addCalorieLog}/>)
    return (
        <div className='section'>
            <div className='grid'>
                { items }
            </div>
        </div>
    )
}

function WorkoutItem({workout, addToCalorie}) {
    return (
        <div className='cell card workout-item-container' key={workout._id}>
            <div><img src='/workout.jpeg' alt='workout'></img></div>
            <div>
                <h1 style={{fontSize: '1.5rem', fontWeight:'bold'}}>{workout.title}</h1>
                <p>{workout.description}</p>
                <p>{workout.calories}</p>
                <button className='button' onClick={() => { addToCalorie(workout._id) }}>Add to Calorie</button>
            </div>
        </div>
    )
}
