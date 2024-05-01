
export var WaterGoal = 5000;

export var waterLogList = [
];

export function UpdateWaterGoal(value) {
    WaterGoal = value;
}


export function UpdateWaterLogList(newList) {
    waterLogList = newList;
}


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
        "picture": "weight_images/yfccv6acbg6pee8gsu4s",
        "timestamp": 1713301337616
    },
    {
        "value": 92,
        "unit": "kg",
        "picture": "weight_images/yfccv6acbg6pee8gsu4s",
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


// water log data structures
// water goal 
const watergoal = {
    value: 5000,
    unit: "ml", // ml / oz
}

// single water log
const waterlog = {
    id: "123",
    userid: "456",
    value: 5000,
    unit: "ml", // ml / oz
    create_time: 1713400348865
}

// daily statistics (for last 7 days)
const dailyStatistics = [
    {label: "Apr 1", value: 2000, unit: "ml"},
    {label: "Apr 2", value: 3000, unit: "ml"},
    {label: "Apr 3", value: 3000, unit: "ml"},
    {label: "Apr 4", value: 2500, unit: "ml"},
    {label: "Apr 5", value: 0, unit: "ml"},
    {label: "Apr 6", value: 300, unit: "ml"},
    {label: "Apr 7", value: 3000, unit: "ml"},
]

// weekly statistics (for last 4 weeks)
const weeklyStatistics = [
    {label: "Mar17-Mar23", value: 14000, unit: "ml"},
    {label: "Mar24-Mar30", value: 30000, unit: "ml"},
    {label: "Mar31-Apr6", value: 10000, unit: "ml"},
    {label: "Apr7-Apr13", value: 25000, unit: "ml"},
]

// monthly statistics (for last 12 weeks)
const mothlyStatistics = [
    {label: "May", value: 3000, unit: "ml"},
    {label: "Jun", value: 2500, unit: "ml"},
    {label: "Jul", value: 0, unit: "ml"},
    {label: "Aug", value: 300, unit: "ml"},
    {label: "Sep", value: 3000, unit: "ml"},
    {label: "Oct", value: 4000, unit: "ml"},
    {label: "Nov", value: 4000,unit: "ml"},
    {label: "Dec", value: 5000, unit: "ml"},
    {label: "Jan", value: 5000, unit: "ml"},
    {label: "Feb", value: 3500,unit: "ml"},
    {label: "Mar", value: 2000,unit: "ml"},
    {label: "Apr", value: 3000,unit: "ml"},
]


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

