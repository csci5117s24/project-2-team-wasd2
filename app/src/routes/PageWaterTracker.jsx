import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageContainer from "../components/PageContainer";
import { UpdateWaterGoal, UpdateWaterLogList, WaterGoal, waterLogList } from "../common/mock_data";
import LiquidGuage from "../components/LiquidGauge";
import styles from '../css/WorkoutForm.module.css';

export const WaterTrackerRoute = {
    path: "/water",
    element: <PageContainer></PageContainer>,
    children: [
        {
            path: "/water",
            element: <PageWaterTracker/>
        }
    ]
}

export function PageWaterTracker() {
    const [goal, setGoal] = useState({});
    const [achieved, setAchieved] = useState(0);
    const [waterLogs, setWaterLogs] = useState([]);
    // const [showAddLog, setShowAddLog] = useState(false);

    useEffect(() => {
        function fetchData() {
            // get goal
            var curGoal = {value: WaterGoal, unit: "ml"}
            // get water logs
            var curLogs = waterLogList;
            setGoal(curGoal);
            setWaterLogs(curLogs);
            setAchieved(calAchieved());
        }
        fetchData();
    }, [waterLogs]);

    function calAchieved() {
        var total = 0;
        for (let i = 0; i < waterLogs.length; i++) {
            total += waterLogs[i].value;
        }
        return Math.round(total/goal.value*100);
    }

    async function updateGoal(newGoal, isSubmit) {
        if (isSubmit) {
            UpdateWaterGoal(newGoal.value);
            setGoal(newGoal);
            setAchieved(calAchieved());
        } else {
            setGoal(newGoal);
        }
    }

    function editLog(data) {
        console.log("edit log");
        var idx = waterLogList.findIndex(nl => nl.id === data.id);
        waterLogList[idx].value = data.value;
        setWaterLogs(waterLogList);
        setAchieved(calAchieved());
    }

    function deleteLog(id) {
        console.log("delete log");
        UpdateWaterLogList(waterLogList.filter(wl => wl.id !== id));
        setWaterLogs(waterLogList);
    }

    async function newWaterLog(data) {
        var newLog = {
            value: data.value,
            unit: data.unit,
        }
        newLog.id = Date.now();
        waterLogList.push(newLog);
        const newLogs = [...waterLogs, newLog];
        setWaterLogs(newLogs);
    }

    return (
        <div className="container">
            <div className="motto-container">
                <p className="motto">Hydrate to Elevate: Fuel Your Life with H<sub>2</sub>O!</p>
                <img src="/quote-right.svg" alt="quote"></img>
            </div>
            <div className={styles.container}>
            <NavigationBar goal={goal} updateGoal={updateGoal}/>
            <div className="columns">
                <div className="column is-two-fifths">
                    <LiquidGuage style={{ margin: 'auto' }}
                            radius={75}
                            value={achieved}/>
                    <h1><span>{achieved}%</span> of your goal achieved</h1>
                </div>
                
                <div className="column auto">
                    <NewWaterLog unit={goal.unit} addWaterLog={newWaterLog}/>
                </div>
            </div>
            <WaterLogList waterLogs={waterLogs} editLog={editLog} deleteLog={deleteLog}></WaterLogList>
            </div>
        </div>
    )
}

function NavigationBar({ goal, updateGoal}) {
    
    // const [editGoal, setEditGoal] = useState(false);

    // function enableEditGoal() {
    //     setEditGoal(true);
    // }

    // function handleGoalChange(e) {
    //     var newValue = e.target.value;
    //     if (newValue) {
    //         newValue = parseInt(newValue);
    //         if (isNaN(newValue)) {
    //             alert("invalid value!");
    //             return
    //         }
    //     }
    //     updateGoal({
    //         value: newValue,
    //         unit: goal.unit,
    //     }, false);
    // }

    // function confirmEditGoal() {
    //     updateGoal(goal, true);
    //     setEditGoal(false);
    // }

    return (
        <div className="sub-nav">
            <img className="icon" src="/target.svg" alt="icon"></img>
            <span style={{marginLeft: '1rem', marginRight: '1rem'}}>{"" + goal.value + " " + goal.unit }</span>
            <Link to="/water/goal">
                <img className="functional-icon" src="/edit_fill.svg" alt="edit goal"/>
            </Link>
            {/* {editGoal ? <input type="text" 
                    value={goal.value} disabled={!editGoal}
                    onChange={e=>handleGoalChange(e)}
                    /> : <span>{goal.value}</span>} <span>{goal.unit}</span>
            { !editGoal 
                    ? <img className="functional-icon" src="/edit_fill.svg" alt="edit" onClick={enableEditGoal}/>
                    : <img className="functional-icon" src="/done.svg" alt="edit" onClick={confirmEditGoal}/>} */}
            <div className="calendar-icon">
                <Link to="/water/calendar"><img className="icon" src="/calendar.svg" alt="calendar"/></Link>
            </div>
        </div>
    )
}

function WaterLogList({ waterLogs, editLog, deleteLog }) {
    const loglist = waterLogs.map(wl => 
        <div className="cell" key={wl.id}>
            <LogItem log={wl} editLog={editLog} deleteLog={deleteLog} />
        </div>
        )

    return (
        <div className="section fixed-grid log-list">
            { loglist }
        </div>
    )
}

function LogItem({log, editLog, deleteLog}) {
    
    // const [showBubble, setShowBubble] = useState(false);
    const [showEditLog, setShowEditLog] = useState(false);

    return (
        <div className="card waterlog-item">
            <div className="level">
                <div className="level-left">
                    <div className="level-item">
                        <img className="cactus" src="/cactus.svg" alt="decoration"/>
                    </div>
                    <div className="level-item">
                        <p>{log.value + log.unit}</p>
                    </div>
                </div>
                <div className="level-right">
                    <div className="level-item">
                        <button className="button is-info" onClick={()=>setShowEditLog(true)}>Edit</button>
                    </div>
                    <button className="level-item button is-danger" onClick={()=>deleteLog(log.id)}>Delete</button>
                </div>
            </div>
            {showEditLog && <WaterLogModal 
                showModal={showEditLog} 
                setShowModal={setShowEditLog}
                waterLog={log}
                unit={log.unit}
                addOrUpdateLog={editLog}/>}
        </div>
    )
    // return (
    //     <div onClick={()=>setShowBubble(!showBubble)}>
    //         <img className="cactus" src="/cactus.svg" alt="decoration"/>
    //         <p>{log.value + log.unit}</p>
    //         { showBubble &&
    //             <div className="one">
    //                 <button className="button is-info" onClick={()=>setShowEditLog(true)}>Edit</button>
    //                 <button className="button is-danger" onClick={()=>deleteLog(log.id)}>Delete</button>
    //             </div> 
    //         }
    //         {showEditLog && <WaterLogModal 
    //             showModal={showEditLog} 
    //             setShowModal={setShowEditLog}
    //             waterLog={log}
    //             unit={log.unit}
    //             addOrUpdateLog={editLog}/>}
    //     </div>
    // )
}


function WaterLogModal({ showModal, setShowModal, waterLog, unit, addOrUpdateLog}) {

    const [data, setData] = useState(waterLog);

    function handleInputChange(e) {
        var newValue = e.target.value;
        if (newValue) {
            newValue = parseInt(newValue);
            if (isNaN(newValue)) {
                alert("invalid value!");
                return
            }
        }
        setData({
            id: data ? data.id : 0,
            value: newValue,
            unit: unit,
        });
    }

    function handleSubmit(data) {
        addOrUpdateLog(data);
        setShowModal(false);
    }

    const className = showModal ? "modal is-active" : "modal";

    return (
        <div className={className}>
            <div className="modal-background"></div>
            <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">{waterLog ? "Edit Water Log" : "New Water Log"}</p>
                    <button className="delete" aria-label="close" onClick={() => setShowModal(false)}></button>
                </header>
                <section className="modal-card-body">
                    <input value={data ? data.value : 0} onChange={e => handleInputChange(e)}></input> 
                    <span>{data ? data.unit : unit}</span>
                </section>
                <footer className="modal-card-foot">
                <div className="buttons">
                    <button className="button is-success" onClick={() => handleSubmit(data)}>Submit</button>
                </div>
                </footer>
            </div>
        </div>
    )
}

function NewWaterLog({unit, addWaterLog}) {

    const [value, setValue] = useState(0);

    function handleInputChange(e) {
        var newValue = e.target.value;
        if (newValue) {
            newValue = parseInt(newValue);
            if (isNaN(newValue)) {
                alert("invalid value!");
                return
            }
        }
        setValue(newValue);
    }

    function handleSubmit(value) {
        addWaterLog({value: value, unit: unit});
        setValue(0);
    }

    return (
        <div>
            <div className="new-water-input">
                <input className="input" type="text" value={value} onChange={e => handleInputChange(e)}></input> 
                <span>{unit}</span>
            </div>
            <button className="button new-water-log" onClick={() => handleSubmit(value)}>Drink More Water </button>
        </div>
    )
}