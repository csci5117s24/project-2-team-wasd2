import React from 'react';
import styles from '../css/WorkoutForm.module.css';

function WorkoutList({ workouts, handleAddToGoal }) {
    return (
        <div className={styles.workoutList}>
            <h2>Workouts List</h2>
            {workouts.map((workout, index) => (
                <div key={index} className={styles.workoutItem}>
                    <h3>{workout.title}</h3>
                    <p>{workout.description}</p>
                    <p>Calories: {workout.calories}</p>
                    {workout.count > 0 && <p className={styles.selectedWorkout}>Selected Workout {workout.count}x</p>}
                    <button onClick={() => handleAddToGoal(workout.id)}>Add to Goal</button>
                </div>
            ))}
        </div>
    );
}

export default WorkoutList;
