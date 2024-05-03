
import React, { useState, useEffect } from 'react';
import styles from '../css/WorkoutForm.module.css';
import PageContainer from "../components/PageContainer";
import WorkoutList from './WorkoutList';
import { SendGet, SendPost, SendDelete, SendUpdate } from '../common/http';

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

    useEffect(() => {
        const fetchWorkouts = async () => {
            const result = await SendGet('/api/exercise/logs');
            setWorkouts(result.workoutlog || []);
        };
        fetchWorkouts();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !description || !calories) {
            console.log('Please fill all fields.');
            return;
        }
        const newWorkout = { title, description, calories: parseInt(calories, 10) };
        console.log("Submitting new workout:", newWorkout);
    
        try {
            const result = await SendPost('/api/exercise', newWorkout);
            console.log("Results:", result);
            
            if (result && result.id) {
                setWorkouts([...workouts, { ...newWorkout, id: result.id, count: 0 }]);
                setTitle('');
                setDescription('');
                setCalories(0);
            }
        } catch (error) {
            console.error("Error in posting workout:", error);
        }
    };
    
    
    

    const handleAddToGoal = async (workoutId) => {
        const workout = workouts.find(w => w.id === workoutId);
        console.log("Selected workout for adding to goal:", workout);
        if (workout) {
            try {
                console.log("Sending POST request to update calorie goal:", workout);
                const response = await SendPost('/api/calorieGoal/update', {
                    workoutId: workout.id,
                    caloriesBurned: workout.calories
                });
    
                console.log("Response received:", response);
                if (response.status === 200) {
                    console.log("Calorie goal updated successfully:", response.jsonBody);
                    setCalorieGoal(currentGoal => Math.max(0, currentGoal - workout.calories));
                    setWorkouts(currentWorkouts => currentWorkouts.map(w => {
                        if (w.id === workoutId) {
                            return { ...w, count: (w.count || 0) + 1 };
                        }
                        return w;
                    }));
                } else {
                    console.error("Failed to update calorie goal:", response.jsonBody.error);
                }
            } catch (error) {
                console.error("Error updating calorie goal:", error);
            }
        } else {
            console.log("No workout found with the given ID:", workoutId);
        }
    };
    
    

    const handleSave = async () => {
        // save goal engpoint needed here
        setCalorieGoal(newGoal);
        setEditMode(false);
    };

    return (
        <div>
            <div className="motto-container">
                <p className="motto">Strength for Life: Embrace Fitness, Choose Wellness!</p>
                <img src="/quote-right.svg" alt="quote"></img>
            </div>
            <div className={styles.container}>
                <div className={styles.editContainer}>
                    {editMode ? (
                        <>
                            <input type="number" value={newGoal} onChange={e => setNewGoal(parseInt(e.target.value, 10))} />
                            <button className={styles.saveButton} onClick={handleSave}>Save</button>
                        </>
                    ) : (
                        <>
                            <h2>Calorie Goal: {calorieGoal}</h2>
                            <button className={styles.editButton} onClick={() => setEditMode(true)}>Edit</button>
                        </>
                    )}
                </div>
            </div>
            <h1>Log Workouts here:</h1>
            <form onSubmit={handleSubmit}>
                <input type="text" className={styles.formInput} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Workout Title" />
                <textarea className={styles.textarea} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
                <input type="number" className={styles.formNumber} value={calories} onChange={(e) => setCalories(e.target.value)} placeholder="Calories Burned" />
                <button type="submit" className={styles.formButton}>Add Workout</button>
            </form>
            <WorkoutList workouts={workouts} handleAddToGoal={handleAddToGoal} />
        </div>  
    );
}

export default WorkoutForm;
