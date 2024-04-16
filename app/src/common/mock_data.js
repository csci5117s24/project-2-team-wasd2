
export var WaterGoal = 5000;

export var waterLogList = [];

export function UpdateWaterGoal(value) {
    WaterGoal = value;
}


export function UpdateWaterLogList(newList) {
    waterLogList = newList;
}