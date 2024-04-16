import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageContainer from "../components/PageContainer";
import { UpdateWaterGoal, UpdateWaterLogList, WaterGoal, waterLogList } from "../common/mock_data";

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

function PageWaterTracker() {
    const [goal, setGoal] = useState({});
    const [achieved, setAchieved] = useState(0);
    const [waterLogs, setWaterLogs] = useState([]);
    const [showAddLog, setShowAddLog] = useState(false);

    useEffect(() => {
        async function fetchData() {
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
            <NavigationBar goal={goal} updateGoal={updateGoal}/>
            <h1 className="primary-title"><span>{achieved}%</span> of your goal achieved</h1>
            <button className="button is-primary" onClick={()=> setShowAddLog(true)}>Add Water</button>
            {showAddLog && <WaterLogModal
                showModal={showAddLog}
                setShowModal={setShowAddLog}
                waterLog={undefined} 
                unit={goal.unit} 
                addOrUpdateLog={newWaterLog}/>}
            <WaterLogList waterLogs={waterLogs} editLog={editLog} deleteLog={deleteLog}></WaterLogList>
        </div>
    )
}

function NavigationBar({ goal, updateGoal}) {
    
    const [editGoal, setEditGoal] = useState(false);

    function enableEditGoal() {
        setEditGoal(true);
    }

    function handleGoalChange(e) {
        var newValue = e.target.value;
        if (newValue) {
            newValue = parseInt(newValue);
            if (isNaN(newValue)) {
                alert("invalid value!");
                return
            }
        }
        updateGoal({
            value: newValue,
            unit: goal.unit,
        }, false);
    }

    function confirmEditGoal() {
        updateGoal(goal, true);
        setEditGoal(false);
    }

    return (
        <div className="level">
            <div className="level-left">
                <div className="level-item">
                    <img className="icon" src="/water_drop.svg" alt="icon"></img>
                </div>
                <div className="level-item">
                    <input type="text" 
                    value={goal.value} disabled={!editGoal}
                    onChange={e=>handleGoalChange(e)}
                    /> <span>{goal.unit}</span>
                </div>
                <div className="level-item">
                    { !editGoal 
                    ? <img className="icon" src="/edit_fill.svg" alt="edit" onClick={enableEditGoal}></img>
                    : <button onClick={confirmEditGoal}>Confirm</button>}
                </div>
            </div>
            <div className="level-right">
                <div className="level-item">
                    <Link to="/water/calendar"><img className="icon" src="/calendar.svg" alt="calendar"/></Link>
                </div>
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
        <div className="grid">
            { loglist }
        </div>
    )
}

function LogItem({log, editLog, deleteLog}) {
    
    const [showBubble, setShowBubble] = useState(false);
    const [showEditLog, setShowEditLog] = useState(false);

    return (
        <div onClick={()=>setShowBubble(!showBubble)}>
            <img className="cactus" src="/cactus.svg" alt="decoration"/>
            <p>{log.value + log.unit}</p>
            { showBubble &&
                <div className="one">
                    <button className="button is-info" onClick={()=>setShowEditLog(true)}>Edit</button>
                    <button className="button is-danger" onClick={()=>deleteLog(log.id)}>Delete</button>
                </div> 
            }
            {showEditLog && <WaterLogModal 
                showModal={showEditLog} 
                setShowModal={setShowEditLog}
                waterLog={log}
                unit={log.unit}
                addOrUpdateLog={editLog}/>}
        </div>
    )
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