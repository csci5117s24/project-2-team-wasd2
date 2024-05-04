import { useState, useEffect } from "react";
import PageContainer from "../components/PageContainer";
import { InputWithTwoUnits } from '../components/InputWithTwoUnits';
import { SendGet, SendPost } from "../common/http";


export const WeightGoalRoute = {
    path: "/weight",
    element: <PageContainer></PageContainer>,
    children: [
        {
            path: "/weight/goal",
            element: <PageWeightGoal/>
        }
    ]
}

const kgToLbsCoefficient = 2.20462;

async function getWeightGoal() {
    const goal = await SendGet("/api/weight/goal", {});
    return goal.goal;
}
async function setWeightGoal(goal) {
	console.log("Set Weight goal")
	console.log(goal)
    await SendPost("/api/weight/goal", goal);
}

export function PageWeightGoal() {
    const [current, setCurrent] = useState({value: 0, unit: "kg"});
    const [goal, setGoal] = useState({value: 0, unit: "kg"});
    const [deadline, setDeadline] = useState(0);
	let g = null

    useEffect(() => {
        async function fetchData() {
            const curGoal = await getWeightGoal();
			g = curGoal;
			console.log(curGoal)
        }
        fetchData();
    }, []);

    async function setWeightData() {
		let dl = deadline.target && deadline.target.value
		await setWeightGoal({...goal, deadline: dl});
		window.location.href = "/weight";
    }

    return (
        <div className="container">
            <h1 className="primary-title">Set up Weight Goal</h1>
            <InputWithTwoUnits 
                title="Current Weight" 
                units={["kg", "lbs"]} 
                coefs={[1.0/kgToLbsCoefficient, kgToLbsCoefficient]}
                data={current}
                handleInputChange={setCurrent}/>
            <InputWithTwoUnits 
                title="Weight Goal" 
                units={["kg", "lbs"]} 
                coefs={[1.0/kgToLbsCoefficient, kgToLbsCoefficient]}
                data={goal}
                handleInputChange={setGoal}/>
			<CalendarInput 
                title="Goal Deadline" 
                data={deadline}
                handleInputChange={setDeadline}/>
            <button className="button is-primary" onClick={setWeightData}>Set as Goal</button>

        </div>
    )

}



export function CalendarInput({ title, data, handleInputChange }) {
    return(
        <div className="card level input-card">
            <div className="level-left">
                <div className="level-item">
                    <p>{title}</p>
                </div>
            </div>
            <div className="level-right">
                <div className="level-item">
                    <input type="date" value={data.value} onChange={e=>handleInputChange(e)}></input>
                </div>
            </div>
        </div>
    )
}