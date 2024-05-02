import { useState } from "react";
import { keepTwoDecimal } from "../common/utils";

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

    return(
        <div className="card level input-card">
            <div className="level-left">
                    <p>{title}</p>
            </div>
            <div className="level-right">
                <div className="level-item">
                    <input className="input" type="text" value={data.value} onChange={e=>handleValueChange(e)}></input>
                </div>
                <div className="level-item">
                    <span className={unit===units[0] ? "selected-span" : "clickable-span"} onClick={toFirstUnit}>{units[0]}</span> 
                    | <span className={unit===units[1] ? "selected-span" : "clickable-span"} onClick={toSecondUnit}>{units[1]}</span>
                </div>
            </div>
        </div>
    )
}