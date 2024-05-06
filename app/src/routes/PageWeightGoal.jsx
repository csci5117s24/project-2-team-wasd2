import { useState, useEffect } from "react";
import PageContainer from "../components/PageContainer";
import { InputWithTwoUnits } from '../components/InputWithTwoUnits';
import { SendGet, SendPost } from "../common/http";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";



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
    await SendPost("/api/weight/goal", goal);
}

export function PageWeightGoal() {
    const [current, setCurrent] = useState({value: 0, unit: "kg"});
    const [goal, setGoal] = useState({value: 0, unit: "kg"});
    const [deadline, setDeadline] = useState(0);

    useEffect(() => {
        async function fetchData() {
            const curGoal = await getWeightGoal();
            setGoal({value: curGoal.value, unit: curGoal.unit});
            setDeadline(curGoal.deadline);
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
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">Set up Weight Goal</h1>
            <br/>
            <InputWithTwoUnits 
                title="Current Weight" 
                units={["kg", "lbs"]} 
                coefs={[1.0/kgToLbsCoefficient, kgToLbsCoefficient]}
                data={current}
                handleInputChange={setCurrent}/>
            <br/>
            <InputWithTwoUnits 
                title="Weight Goal" 
                units={["kg", "lbs"]} 
                coefs={[1.0/kgToLbsCoefficient, kgToLbsCoefficient]}
                data={goal}
                handleInputChange={setGoal}/>
            <br/>
			<CalendarInput 
                title="Goal Deadline" 
                data={deadline}
                handleInputChange={setDeadline}/>
            <br/>
            <Button className="button is-primary" onClick={setWeightData}>Set as Goal</Button>

        </div>
    )

}



export function CalendarInput({ title, data, handleInputChange }) {
    return(
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <Input type="date" value={data} onChange={e=>handleInputChange(e)}></Input>
                </CardHeader>
            </Card>
        </div>
    )
}