import React, { useState, useEffect } from 'react';
import styles from '../css/WorkoutForm.module.css';
import { SendGet, SendDelete, SendUpdate } from '../common/http'; 

function WorkoutList({  fetchTrigger }) {
    const [workouts, setWorkouts] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        title: '',
        description: '',
        calories: ''
    });

    const fetchWorkouts = async () => {
        console.log("Fetching workouts...");
        const result = await SendGet('/api/exercise/logs');
        if (result && result.exerciseLogs) {
            const validWorkouts = result.exerciseLogs.filter(w => w.title && w.description && w.calories !== null);
            setWorkouts(validWorkouts);
        } else {
            setWorkouts([]);
        }
    };

    useEffect(() => {
        fetchWorkouts();  
        // this will call API infinitely
        // const interval = setInterval(fetchWorkouts, 2000);  
        // return () => clearInterval(interval);  
    }, [fetchTrigger]);

    const handleDeleteWorkout = async (_id) => {
        SendDelete(`/api/exercise/${_id}`); // async delete
        setWorkouts(workouts.filter(workout => String(workout._id) !== String(_id)));
    };

    const handleEditClick = (workout) => {
        setEditingId(workout._id);
        setEditFormData({
            title: workout.title,
            description: workout.description,
            calories: workout.calories
        });
    };

    const handleEditFormChange = (event) => {
        const { name, value } = event.target;
        setEditFormData({
            ...editFormData,
            [name]: value
        });
    };

    const handleEditFormSubmit = async (event) => {
        event.preventDefault();
        const updatedWorkout = {
            title: editFormData.title,
            description: editFormData.description,
            calories: editFormData.calories
        };
    
        try {
            await SendUpdate(`/api/exercise/${editingId}`, updatedWorkout);
            fetchWorkouts();
            setEditingId(null);
        } catch (error) {
            console.error("Error processing the save operation:", error);
        }
    };
    

    return (
        <div className={styles.workoutList}>
            <h2>Workouts List</h2>
            {workouts.length > 0 ? workouts.map((workout) => (
                <div key={workout._id} className={styles.workoutItem}>
                    {editingId === workout._id ? (
                        <form onSubmit={handleEditFormSubmit} className={styles.editSaveActions}>
                            <input type="text" name="title" value={editFormData.title} onChange={handleEditFormChange} />
                            <input type="text" name="description" value={editFormData.description} onChange={handleEditFormChange} />
                            <input type="number" name="calories" value={editFormData.calories} onChange={handleEditFormChange} />
                            <button type="submit" className={`${styles.button} ${styles.green}`}>Save</button>
                            <button type="button" onClick={() => setEditingId(null)} className={styles.button}>Cancel</button>
                        </form>
                    ) : (
                        <div>
                            <h3>{workout.title}</h3>
                            <p>{workout.description}</p>
                            <p>Calories: {workout.calories}</p>
                            <div className={styles.workoutActions}>
                                <button onClick={() => {
                                    setEditingId(workout._id);
                                    setEditFormData({ title: workout.title, description: workout.description, calories: workout.calories });
                                }} className={styles.button}>Edit</button>
                                <button onClick={() => handleDeleteWorkout(workout._id)} className={`${styles.button} ${styles.red}`}>Delete</button>
                            </div>
                        </div>
                    )}
                </div>
            )) : <p>No workouts available.</p>}
        </div>
    );
}

export default WorkoutList;
