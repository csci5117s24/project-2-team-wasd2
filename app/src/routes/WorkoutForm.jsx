
import React, { useState, useEffect } from 'react';
import styles from '../css/WorkoutForm.module.css';
import PageContainer from "../components/PageContainer";
import WorkoutList from './WorkoutList';
import { SendGet, SendPost } from '../common/http';
import { Link } from 'react-router-dom';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "../components/ui/card";
  import { Input } from "../components/ui/input";
  import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
  

export const WorkOutFormRoute = {
    path: "/exercise",
    element: <PageContainer></PageContainer>,
    children: [
        {
            path: "/exercise/workout",
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

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [calories, setCalories] = useState(0);
    const [fetchTrigger, setFetchTrigger] = useState(0); 


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
                setFetchTrigger(prev => prev + 1);  

            }
        } catch (error) {
            console.error("Error in posting workout:", error);
        }
    };
    
    
    return (
        <div className='section'>
            <div className="sub-nav">
                <Button asChild variant="link">
                <Link to="/exercise" style={{color: 'var(--my-blue)'}}> Back to Daily Exercise Log</Link>
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Log your workouts here</CardTitle>
                    <CardDescription>Track your workouts and calories burned</CardDescription>
                </CardHeader>
            <form onSubmit={handleSubmit}>
                <Input type="text" className={styles.formInput} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Workout Title" />
                <Textarea className={styles.textarea} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
                <Input type="number" className={styles.formNumber} value={calories} onChange={(e) => setCalories(e.target.value)} placeholder="Calories Burned" />
                <Button type="submit" className={styles.formButton}>Add Workout</Button>
            </form>
            </Card>
            <br />
            <br />
            <WorkoutList  fetchTrigger={fetchTrigger} />
        </div>  
    );
}

export default WorkoutForm;
