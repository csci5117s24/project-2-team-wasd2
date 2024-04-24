
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
        "picture": "/delete_these_pictures_later/Heavy_weight.png",
        "timestamp": 1713202337616
    },
    {
        "value": 95,
        "unit": "kg",
        "picture": "/delete_these_pictures_later/Middle_weight.png",
        "timestamp": 1713301337616
    },
    {
        "value": 92,
        "unit": "kg",
        "picture": "/delete_these_pictures_later/Light_weight.png",
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
watergoal = {
    value: 5000,
    unit: "ml", // ml / oz
}

// single water log
waterlog = {
    id: "123",
    userid: "456",
    value: 5000,
    unit: "ml", // ml / oz
    create_time: 1713400348865
}

// daily statistics (for last 7 days)
dailyStatistics = [
    {label: "Apr 1", value: 2000, unit: "ml"},
    {label: "Apr 2", value: 3000, unit: "ml"},
    {label: "Apr 3", value: 3000, unit: "ml"},
    {label: "Apr 4", value: 2500, unit: "ml"},
    {label: "Apr 5", value: 0, unit: "ml"},
    {label: "Apr 6", value: 300, unit: "ml"},
    {label: "Apr 7", value: 3000, unit: "ml"},
]

// weekly statistics (for last 4 weeks)
weeklyStatistics = [
    {label: "Mar17-Mar23", value: 14000, unit: "ml"},
    {label: "Mar24-Mar30", value: 30000, unit: "ml"},
    {label: "Mar31-Apr6", value: 10000, unit: "ml"},
    {label: "Apr7-Apr13", value: 25000, unit: "ml"},
]

// monthly statistics (for last 12 weeks)
mothlyStatistics = [
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
