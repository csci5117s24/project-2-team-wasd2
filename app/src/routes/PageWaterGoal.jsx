import { useState } from "react";
import PageContainer from "../components/PageContainer";
import { keepTwoDecimal } from "../common/utils";
import { UpdateWaterGoal } from "../common/mock_data";


export const WaterGoalRoute = {
    path: "/water",
    element: <PageContainer></PageContainer>,
    children: [
        {
            path: "/water/goal",
            element: <PageWaterGoal></PageWaterGoal>
        }
    ]
}


const cmToInCoefficient = 0.3937007874;
const kgToLbsCoefficient = 2.20462;
const ozToMlCoefficient = 29.5735;


function PageWaterGoal() {
    const [height, setHeight] = useState({value: 0, unit: "cm"});
    const [weight, setWeight] = useState({value: 0, unit: "kg"});
    const [goal, setGoal] = useState({value: undefined, unit: "ml"});

    function calculateGoal() {
        var weightInKg = weight.unit === "kg" ? weight.value : weight.value * (1.0/kgToLbsCoefficient);
        var heightInCm = height.unit === "cm" ? height.value : height.value * (1.0/cmToInCoefficient);
        var intakeInMl = Math.round((weightInKg + heightInCm) * 10);
        setGoal({value: intakeInMl, unit: "ml"});
    }

    async function setWaterGoal() {
        UpdateWaterGoal(goal.value);
    }

    return (
        <div className="container">
            <h1 className="primary-title">See how much you need</h1>
            <InputWithTwoUnits 
                title="Height" 
                units={["cm", "in"]} 
                coefs={[1.0/cmToInCoefficient, cmToInCoefficient]}
                data={height}
                handleInputChange={setHeight}/>
            <InputWithTwoUnits 
                title="Weight" 
                units={["kg", "lbs"]} 
                coefs={[1.0/kgToLbsCoefficient, kgToLbsCoefficient]}
                data={weight}
                handleInputChange={setWeight}/>
            <button className="button is-primary" onClick={calculateGoal}>Calculate</button>

            {
            goal.value !== undefined &&
            <div className="goal-container">
                <h1 className="secondary-title">suggested daily water intake</h1>
                <WaterIntakeGoal data={goal} handleGoalChange={setGoal}/>
                <button className="button is-primary" onClick={setWaterGoal}>set as goal</button>
            </div>
            }
        </div>
    )

}


function InputWithTwoUnits({ title, units, coefs, data, handleInputChange }) {

    const [unit, setUnit] = useState(data.unit);

    function toFirstUnit() {
        if (unit === units[0]) {
            return
        } 
        const newValue = keepTwoDecimal(data.value * coefs[0]);
        handleInputChange({value: newValue, unit: units[0]});
        setUnit(units[0]);
    }

    function toSecondUnit() {
        if (unit === units[1]) {
            return
        }
        const newValue = keepTwoDecimal(data.value * coefs[1]);
        handleInputChange({value: newValue, unit: units[1]});
        setUnit(units[1]);
    }

    function handleValueChange(e) {
        var newValue = e.target.value;
        if (newValue) {
            newValue = parseFloat(e.target.value);
            if (isNaN(newValue)) {
                alert("invalid number!");
                return
            }  
        }
        handleInputChange({value: newValue, unit: unit});
    }

    return(
        <div className="card level input-card">
            <div className="level-left">
                <div className="level-item">
                    <p>{title}</p>
                </div>
            </div>
            <div className="level-right">
                <div className="level-item">
                    <input type="text" value={data.value} onChange={e=>handleValueChange(e)}></input>
                </div>
                <div className="level-item">
                    <span className={unit===units[0] ? "selected-span" : "clickable-span"} onClick={toFirstUnit}>{units[0]}</span> 
                    | <span className={unit===units[1] ? "selected-span" : "clickable-span"} onClick={toSecondUnit}>{units[1]}</span>
                </div>
            </div>
        </div>
    )
}

function WaterIntakeGoal({data, handleGoalChange}) {

    const [unit, setUnit] = useState(data.unit);

    function mlToOz() {
        if (unit === "oz") {
            return
        }
        handleGoalChange({value: keepTwoDecimal(data.value * (1.0/ozToMlCoefficient)), unit: "oz"});
        setUnit("oz");

    }

    function ozToMl() {
        if (unit === "ml") {
            return
        }
        handleGoalChange({value: keepTwoDecimal(data.value * ozToMlCoefficient), unit: "ml"});
        setUnit("ml");
    }

    function handleInputChange(e) {
        var newValue = e.target.value;
        if (newValue) {
            newValue = parseInt(e.target.value);
            if (isNaN(newValue)) {
                alert("invalid integer!");
                return
            }
        }
        handleGoalChange({value: newValue, unit: unit});
    }

    return (
        <div className="goal-container">
            <div>
                <input type="text" 
                    className="input-water-goal"
                    value={data.value} 
                    onChange={e=>handleInputChange(e)} /> 
            </div>
            <span className={unit==="ml" ? "selected-span" : "clickable-span"} onClick={ozToMl}>ml</span> 
            | <span className={unit==="oz" ? "selected-span" : "clickable-span"} onClick={mlToOz}>oz</span>
        </div>
    )
}