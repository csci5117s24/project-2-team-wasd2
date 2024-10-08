import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageContainer from "../components/PageContainer";
import LiquidGuage from "../components/LiquidGauge";
import { SendDelete, SendGet, SendUpdate, SendPost } from "../common/http";
import ReactLoading from 'react-loading';

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

async function getWaterGoal() {
    const goal = await SendGet("/api/water/goal", {});
    return goal.goal;
}

async function newWaterLog(value, unit) {
    const now = new Date();
    const res = await SendPost("/api/water", 
        {value: value, unit: unit, timestamp: now.getTime(), localeDate: now.toLocaleDateString()});
    if (!res) {
        return "";
    }
    return res.id;
}

async function getWaterLogs() {
    const today = new Date();
    const logs = await SendGet("/api/waterlog", {date: today.toLocaleDateString()});
    return logs.waterlog;
}

async function updateWaterLog(id, value, unit) {
    await SendUpdate("/api/water" , {id: id, value: value, unit: unit});
}

async function deleteWaterLog(id) {
    await SendDelete("/api/water", {id: id});
}

export function PageWaterTracker() {
    const [goal, setGoal] = useState({});
    const [achieved, setAchieved] = useState(0);
    const [waterLogs, setWaterLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);

            Promise.all([
                getWaterGoal(),
                getWaterLogs()
            ]).then(([curGoal, curLogs]) => {
                if (!curGoal) {
                    window.location.href = "/water/goal";
                }
                const newAchieved = calAchieved(curLogs, curGoal);
                setGoal({value: curGoal.value, unit: curGoal.unit});
                setWaterLogs(curLogs);
                setAchieved(newAchieved);
                setLoading(false);

            }).catch(error=>{console.log(error)});
        }
        fetchData();
    }, []);

    function calAchieved(waterLogs, goal) {
        var total = 0;
        for (let i = 0; i < waterLogs.length; i++) {
            total += waterLogs[i].value;
        }
        return Math.round(total/goal.value*100);
    }

    async function editLog(data) {
        updateWaterLog(data.id, data.value, data.unit);
        const newWaterLogs = waterLogs.map((log)=>{
            if (log._id === data.id) {
                var updatedLog = log;
                updatedLog.value = data.value;
                updatedLog.unit = data.unit;
                return updatedLog;
            } else {
                return log;
            }
        })
        const newAchieved = calAchieved(newWaterLogs, goal);
        setWaterLogs(newWaterLogs);
        setAchieved(newAchieved);
    }

    async function deleteLog(id) {
        if (!window.confirm("Are you sure you want to delete this log?")){
			return
		}
        deleteWaterLog(id);
        const newWaterLogs = waterLogs.filter(wl => wl._id !== id);
        const newAchieved = calAchieved(newWaterLogs, goal);
        setWaterLogs(newWaterLogs);
        setAchieved(newAchieved)
    }

    async function addWaterLog(data) {
        const logId = await newWaterLog(data.value, data.unit);
        if (!logId) {
            return
        }
        const newLog = {
            _id: logId,
            id: logId,
            value: data.value,
            unit: data.unit,
        }
        const newLogs = [...waterLogs, newLog];
        const newAchieved = calAchieved(newLogs, goal);
        setWaterLogs(newLogs);
        setAchieved(newAchieved);
    }

    return (
        <div className="container">
            <div className="motto-container">
                <p className="motto">Hydrate to Elevate: Fuel Your Life with H<sub>2</sub>O!</p>
                <img src="/quote-right.svg" alt="quote"></img>
            </div>
            <h1 className="third-title">Record Your Water Intake for Today</h1>
            {loading ? <div className="center-items"><ReactLoading type="bars" color="#836FFF" /></div> : 
            <div className="card section ">
                <NavigationBar goal={goal}/>
                <div className="columns" >
                    <div className="column is-half">
                        <LiquidGuage style={{ margin: 'auto' }}
                                radius={75}
                                value={achieved}/>
                        <h1><span>{achieved}%</span> of your goal achieved</h1>
                    </div>
                    
                    <div className="column auto">
                        <NewWaterLog unit={goal.unit} addWaterLog={addWaterLog}/>
                    </div>
                </div>
                <WaterLogList waterLogs={waterLogs} editLog={editLog} deleteLog={deleteLog}></WaterLogList>
            </div>}
        </div>
    )
}

function NavigationBar({ goal}) {

    return (
        <div className="sub-nav">
            <img className="icon" src="/target.svg" alt="icon"></img>
            <span style={{ fontSize:'1.3rem', marginLeft: '1rem', marginRight: '1rem'}}>{"" + goal.value + " " + goal.unit }</span>
            <Link to="/water/goal">
                <div style={{ height:'1.5rem', width: '1.5rem', margin: '0.2rem'}} ><img src="/edit_fill.svg" alt="edit goal"/></div>
            </Link>
            <div className="calendar-icon">
                <Link to="/water/calendar"><img className="icon" src="/calendar.svg" alt="calendar"/></Link>
            </div>
        </div>
    )
}

function WaterLogList({ waterLogs, editLog, deleteLog }) {
    const loglist = waterLogs.map(wl => 
        <div key={wl.id}>
            <LogItem log={wl} editLog={editLog} deleteLog={deleteLog} />
        </div>
        )

    return (
        <div className="section log-list-container">
            { loglist }
        </div>
    )
}

function LogItem({log, editLog, deleteLog}) {
    
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
                    <button className="level-item button is-danger" onClick={()=>deleteLog(log._id)}>Delete</button>
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
}


function WaterLogModal({ showModal, setShowModal, waterLog, unit, addOrUpdateLog}) {

    const [data, setData] = useState({id: waterLog._id, value: waterLog.value, unit: waterLog.unit});

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
            <button className="button new-water-log is-primary" onClick={() => handleSubmit(value)}>Drink More Water </button>
        </div>
    )
}