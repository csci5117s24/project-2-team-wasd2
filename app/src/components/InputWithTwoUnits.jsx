import { useState } from "react";
import { keepTwoDecimal } from "../common/utils";
import { CardTitle, Card, CardContent, CardDescription, CardFooter, CardHeader } from "./ui/card";
import { Input } from "./ui/input";
import { color } from "@cloudinary/url-gen/qualifiers/background";

export function InputWithTwoUnits({ title, units, coefs, data, handleInputChange }) {

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

    return (
        <div>
            <Card>
                <CardContent>
                     <CardTitle>{title}</CardTitle>
                     <br/>
                        <Input style={{
                            color: "black",
                        }} className="input" type="text" value={data.value} onChange={e=>handleValueChange(e)}></Input>
                        <br/>
                        <span className={unit===units[0] ? "selected-span" : "clickable-span"} onClick={toFirstUnit}>{units[0]}</span> 
                        | <span className={unit===units[1] ? "selected-span" : "clickable-span"} onClick={toSecondUnit}>{units[1]}</span>
                </CardContent>
            </Card>
        </div>
    )
}