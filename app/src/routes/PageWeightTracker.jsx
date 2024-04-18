import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageContainer from "../components/PageContainer";
import { weightGoal, weightDeadline, weightLogList, UpdateWeightGoal, UpdateWeightLogList } from "../common/mock_data";
import { InputWithTwoUnits } from '../components/InputWithTwoUnits';
import '../css/PageWeight.css'
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import annotationPlugin from 'chartjs-plugin-annotation';

import { Chart, registerables } from 'chart.js';
Chart.register(...registerables, annotationPlugin);

export const WeightTrackerRoute = {
    path: "/weight",
    element: <PageContainer></PageContainer>,
    children: [
        {
            path: "/weight",
            element: <PageWeightTracker/>
        }
    ]
}

const kgToLbsCoefficient = 2.20462;

function PageWeightTracker() {
    const [goal, setGoal] = useState({});
    const [weightLogs, setWeightLogs] = useState([]);
    const [showAddLog, setShowAddLog] = useState(false);

    useEffect(() => {
        async function fetchData() {
            // get goal
            var curGoal = {goal: weightGoal, deadline: weightDeadline}
            // get weight logs
            var curLogs = weightLogList;
            setGoal(curGoal);
            setWeightLogs(curLogs);
        }
        fetchData();
    }, []);

    async function updateGoal(newGoal, isSubmit) {
        if (isSubmit) {
            UpdateWeightGoal(newGoal.goal, newGoal.deadline);
            setGoal(newGoal);
        } else {
            setGoal(newGoal);
        }
    }

    function editLog(data, picture) {
        var idx = weightLogList.findIndex(nl => nl.timestamp === data.timestamp);
		if (data.value) {
			weightLogList[idx].value = data.value;
		} else {
			return;
		}
		if (picture) {
			weightLogList[idx].picture = picture;
		} else {
			return;
		}
        setWeightLogs(weightLogList);
    }

    function deleteLog(id) {
        UpdateWeightLogList(weightLogList.filter(wl => wl.timestamp !== id));
        setWeightLogs(weightLogList);
    }

    async function newWeightLog(data, picture) {
        var newLog = {
            value: data.value,
            unit: data.unit,
			picture: picture,
        }
        newLog.timestamp = Date.now();
        weightLogList.push(newLog);
        setWeightLogs(weightLogList);
    }
	
    return (
        <div className="container">
            <h1 className="primary-title">Weight Logs</h1>
            <button className="button is-primary" onClick={()=> setShowAddLog(true)}>Record Weight for Today</button>
            {showAddLog && <WeightLogModal
                showModal={showAddLog}
                setShowModal={setShowAddLog}
                weightLog={undefined} 
                unit={goal.unit} 
                addOrUpdateLog={newWeightLog}/>}
			<LineChart logs={weightLogs} goal={weightGoal}/>
            <WeightLogList weightLogs={weightLogs} editLog={editLog} deleteLog={deleteLog}/>
        </div>
    )
}
//            <NavigationBar goal={goal} updateGoal={updateGoal}/>
/*
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
                    <Link to="/weight/calendar"><img className="icon" src="/calendar.svg" alt="calendar"/></Link>
                </div>
            </div>
        </div>
    )
}
*/
function WeightLogList({ weightLogs, editLog, deleteLog }) {
    const loglist = weightLogs.map(wl => 
        <div className="cell" key={wl.timestamp}>
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
            <img className="cactus" src={log.picture} alt="Uploaded content"/>
            <p>{log.value + log.unit}</p>
            { showBubble &&
                <div className="one">
                    <button className="button is-info" onClick={()=>setShowEditLog(true)}>Edit</button>
                    <button className="button is-danger" onClick={()=>deleteLog(log.timestamp)}>Delete</button>
                </div> 
            }
            {showEditLog && <WeightLogModal 
                showModal={showEditLog} 
                setShowModal={setShowEditLog}
                weightLog={log}
                unit={log.unit}
                addOrUpdateLog={editLog}/>}
        </div>
    )
}


function WeightLogModal({ showModal, setShowModal, weightLog, unit, addOrUpdateLog}) {
	const [data, setData] = useState(weightLog ? weightLog: {value: 0, unit:"kg"});
	const [picture, setPicture] = useState(weightLog && weightLog.picture);

    function handleInputChange(e) {
        var newValue = e.value ? e.value: 0;
        if (newValue) {
            newValue = parseInt(newValue);
            if (isNaN(newValue)) {
                alert("invalid value!");
                return
            }
        }
        setData({
            id: data ? data.timestamp : 0,
            value: newValue,
            unit: unit,
        });
    }

    function handleSubmit(data, picture) {
		if (picture){
			addOrUpdateLog(data, picture);
		} else {
			addOrUpdateLog(data, "/cactus.svg");
		}
		setShowModal(false);
    }

	function handleImageChange(e) {
		const file = e.target.files[0];
		if (file) {
		  const reader = new FileReader();
		  reader.onloadend = () => {
			setPicture(reader.result);
		  };
		  reader.readAsDataURL(file);
		} else {
		  setPicture('');
		}
	  };

    const className = showModal ? "modal is-active" : "modal";

    return (
        <div className={className}>
            <div className="modal-background"></div>
            <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">{weightLog ? "Edit Weight Log" : "New Weight Log"}</p>
                    <button className="delete" aria-label="close" onClick={() => setShowModal(false)}></button>
                </header>
                <section className="modal-card-body">
					<InputWithTwoUnits 
						title="Enter your current weight:"
						units={["kg", "lbs"]} 
						coefs={[1.0/kgToLbsCoefficient, kgToLbsCoefficient]}
						data={data}
						handleInputChange={setData}/>
					<br/>
					<p>Upload a picture:</p>
					<input type="file" accept="image/*" onChange={e => handleImageChange(e)}></input>
					{picture && <img class='picture-preview' src={picture} alt="Uploaded" />}
                </section>
                <footer className="modal-card-foot">
                <div className="buttons">
                    <button className="button is-success" onClick={() => handleSubmit(data, picture)}>Submit</button>
                </div>
                </footer>
            </div>
        </div>
    )
}

function LineChart({logs, goal}) {
	let dates = []
	for (var l of logs){
		let d = new Date(l.timestamp);
		dates.push(`${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()}`)
	}
	const data = {
		labels: dates,
		datasets: [
		  {
			label: 'Your Weight Progress',
			data: logs && logs.map(log => log.value),
			fill: false,
			backgroundColor: 'rgb(75, 192, 192)',
			borderColor: 'rgba(75, 192, 192, 0.2)',
		  },
		],
	  };
	  
	  const options = {
		scales: {
			x: {
				display: true
			},
			y: {
			beginAtZero: false
			}
		},
		plugins: {
			annotation: {
			  annotations: {
				goal: {
				  type: 'line',
				  yMin: goal,
				  yMax: goal,
				  borderWidth: 2,
				  borderColor: 'blue',
				  borderDash: [5, 5], // This creates a dashed line pattern
				  label: {
					content: 'Goal Weight',
					enabled: true,
					position: 'center'
				  }
				}
			  }
			}
		  }
	  };
	return <Line data={data} options={options} />
}