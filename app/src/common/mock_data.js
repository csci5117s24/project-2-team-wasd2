
export var WaterGoal = 5000;

export var waterLogList = [];

export function UpdateWaterGoal(value) {
    WaterGoal = value;
}


export function UpdateWaterLogList(newList) {
    waterLogList = newList;
}


export var weightGoal = 64;

export var weightDeadline = '2024-05-24';

export var weightLogList = [];

export function UpdateWeightGoal(goal, deadline) {
    weightGoal = goal;
	weightDeadline = deadline;

}

export function UpdateWeightLogList(newList) {
    weightLogList = newList;
}
