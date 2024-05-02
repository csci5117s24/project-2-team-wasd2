import React, { useState } from 'react';
import styles from '../css/WorkoutForm.module.css';
import PageContainer from "../components/PageContainer";
import WorkoutList from './WorkoutList'; // Importing the new WorkoutList component

export const WorkOutFormRoute = {
    path: "/exercise",
    element: <PageContainer></PageContainer>,
    children: [
        {
            path: "/exercise",
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
        const newWorkout = { 
            id: workouts.length + 1, 
            title, 
            description, 
            calories: parseInt(calories, 10),
            count: 0  
        };
        setWorkouts([...workouts, newWorkout]);
        setTitle('');
        setDescription('');
        setCalories(0);
    };
    const handleAddToGoal = (workoutId) => {
        const workout = workouts.find(w => w.id === workoutId);
        if (workout) {
            setCalorieGoal(currentGoal => Math.max(0, currentGoal - workout.calories));
            setWorkouts(currentWorkouts => currentWorkouts.map(w => {
                if (w.id === workoutId) {
                    return { ...w, count: (w.count || 0) + 1 };
                }
                return w;
            }));
        }
    };

    const handleSave = () => {
        setCalorieGoal(newGoal);
        setEditMode(false);
    };

    return (
        <>
        <h2>Add Workout</h2>
        <div className={styles.container}>
            {/* Calorie Goal */}
            <div className = {styles.editContainer}>
                {editMode ? (
                    <>
                        <input type="number" value={newGoal} onChange={e => setNewGoal(parseInt(e.target.value, 10))} />
                        <button className= {styles.saveButton} onClick={handleSave}>Save</button>
                    </>
                ) : (
                    <>
                        <h2>Calorie Goal: {calorieGoal}</h2>
                        <button className= {styles.editButton} onClick={() => setEditMode(true)}>edit</button>
                    </>
                )}
            </div>

            {/* Workout Form */}
            <form onSubmit={handleSubmit}>
                <input type="text" className={styles.formInput} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Workout Title" />
                <textarea className={styles.textarea} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
                <input type="number" className={styles.formNumber} value={calories} onChange={(e) => setCalories(e.target.value)} placeholder="Calories Burned" />
                <button type="submit" className={styles.formButton}>Add Workout</button>
            </form>

            {/* List of Workouts */}      
        </div>
         <div className={styles.listSection}>
            <WorkoutList workouts={workouts} handleAddToGoal={handleAddToGoal} />
        </div>  
     </>
     
    );
}

export default WorkoutForm;
