
export var WaterGoal = 5000;

export var waterLogList = [];

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
