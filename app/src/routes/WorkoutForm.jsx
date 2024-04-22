import React, { useState } from 'react';
import styles from '../css/WorkoutForm.module.css';
import PageContainer from "../components/PageContainer";


export const WorkOutFormRoute = {
    path: "/exercise",
    element: <PageContainer></PageContainer>,
    children: [
        {
            path: "/exercise/workoutform",
            element: <WorkoutForm/>
        }
    ]
  }
  export const MainpageWorkoutFormRoute = {
    path: "/",
    element: <WorkoutForm/>,

}

export function WorkoutForm() {
    const [workouts, setWorkouts] = useState([]);
    const [calorieGoal, setCalorieGoal] = useState(1000);
    const [editMode, setEditMode] = useState(false);
    const [newGoal, setNewGoal] = useState(1000);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [calories, setCalories] = useState(0);

    const handleSubmit = (e) => {
        e.preventDefault();
        const newWorkout = { title, description, calories: parseInt(calories, 10) };
        setWorkouts([...workouts, newWorkout]);
        setTitle('');
        setDescription('');
        setCalories(0);
    };

    const handleAddToGoal = (workoutCalories) => {
        setCalorieGoal(currentGoal => Math.max(0, currentGoal - workoutCalories));
    };

    const handleSave = () => {
        setCalorieGoal(newGoal);
        setEditMode(false);
    };

    return (
        <div className={styles.container}>
            {/* Calorie Goal */}
            <div>
                {editMode ? (
                    <>
                        <input type="number" value={newGoal} onChange={e => setNewGoal(parseInt(e.target.value, 10))} />
                        <button onClick={handleSave}>Save</button>
                    </>
                ) : (
                    <>
                        <h2>Calorie Goal: {calorieGoal}</h2>
                        <button onClick={() => setEditMode(true)}>Edit</button>
                    </>
                )}
            </div>

            {/* Workout Form */}
            <h2>Add Workout</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" className={styles.formInput} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Workout Title" />
                <textarea className={styles.textarea} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
                <input type="number" className={styles.formNumber} value={calories} onChange={(e) => setCalories(e.target.value)} placeholder="Calories Burned" />
                <button type="submit" className={styles.formButton}>Add Workout</button>
            </form>

            {/* List of Workouts */}
            <div className={styles.workoutList}>
                <h2>Workouts List</h2>
                {workouts.map((workout, index) => (
                    <div key={index} className={styles.workoutItem}>
                        <h3>{workout.title}</h3>
                        <p>{workout.description}</p>
                        <p>Calories: {workout.calories}</p>
                        <button onClick={() => handleAddToGoal(workout.calories)}>Add to Goal</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default WorkoutForm;
