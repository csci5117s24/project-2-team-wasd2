export var weightGoal = 85;

export var weightDeadline = '2024-05-24';

export var weightLogList = [
    {
        "value": 100,
        "unit": "kg",
        "picture": "weight_images/h39unei0psruufabcha3",
        "timestamp": 1713202337616
    },
    {
        "value": 95,
        "unit": "kg",
        "picture": "weight_images/k8i8lvx90iqp4rjemkkz",
        "timestamp": 1713301337616
    },
    {
        "value": 92,
        "unit": "kg",
        "picture": "weight_images/d2heysixbf56qpdnwnu7",
        "timestamp": 1713400348865
    }
];

export function UpdateWeightGoal(goal, deadline) {
    weightGoal = goal;
	weightDeadline = deadline;

}

export function UpdateWeightLogList(newList) {
    weightLogList = newList;
}


//workouts
function listWorkouts() {
    return [
        {id: 1, title: "Morning Run", description: "A quick morning run around the park", calories: 300},
        {id: 2, title: "Bike Ride", description: "Cycling through the city to the office", calories: 250},
        {id: 3, title: "Swimming", description: "Half an hour swimming session", calories: 400}
    ];
}

function createWorkout(workout) {
    console.log('Creating workout:', workout);
    return { ...workout, id: new Date().getTime() }; 
}

function updateWorkout(workoutId, workout) {
    console.log(`Updating workout ${workoutId}:`, workout);
    return { ...workout, id: workoutId };
}

function deleteWorkout(workoutId) {
    console.log(`Deleting workout with ID: ${workoutId}`);
    return { message: "Workout deleted successfully" };
}

function getCalorieGoal() {
    return { calorieGoal: 1500 };
}
function updateCalorieGoal(calorieGoal) {
    const timestamp = new Date().toISOString();
    console.log(`Updating calorie goal to: ${calorieGoal} at: ${timestamp}`);
    return { calorieGoal, timestamp };
}

