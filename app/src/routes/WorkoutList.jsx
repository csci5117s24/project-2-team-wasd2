import React, { useState, useEffect } from 'react';
import styles from '../css/WorkoutForm.module.css';
import { SendGet, SendDelete } from '../common/http'; 

function WorkoutList({ handleAddToGoal }) {
    const [workouts, setWorkouts] = useState([]);

    useEffect(() => {
        const fetchWorkouts = async () => {
            console.log("Fetching workouts...");
            const result = await SendGet('/api/exercise/logs');
            console.log("Received workouts:", result);
            if (result && result.exerciseLogs) {
                const validWorkouts = result.exerciseLogs.filter(w => {
                    console.log("Checking workout:", w);
                    console.log("Title:", w.title);
                    console.log("Description:", w.description);
                    console.log("Calories:", w.calories);
                    return w.title && w.description && w.calories !== null;
                });
                console.log("Valid workouts:", validWorkouts);
                setWorkouts(validWorkouts);
            } else {
                console.log("No workouts received.");
                setWorkouts([]);
            }
        };
        fetchWorkouts();
    }, []);

    const handleAddToGoalWithLog = (id) => {
        console.log("Adding workout with ID:", id); // Log the ID here
        handleAddToGoal(id); // Then proceed with the original function
    };

    return (
        <div className={styles.workoutList}>
            <h2>Workouts List</h2>
            {workouts.length > 0 ? workouts.map((workout, index) => (
                <div key={index} className={styles.workoutItem}>
                    <h3>{workout.title}</h3>
                    <p>{workout.description}</p>
                    <p>Calories: {workout.calories}</p>
                    {workout.count > 0 && <p className={styles.selectedWorkout}>Selected Workout {workout.count}x</p>}
                    <button onClick={() => handleAddToGoalWithLog(workout.id)}>Add to Goal</button>
                    
                </div>
            )) : <p>No workouts available.</p>}
        </div>
    );
}


export default WorkoutList;
