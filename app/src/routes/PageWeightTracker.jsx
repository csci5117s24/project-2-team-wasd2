import { useEffect, useState } from "react";
import { SendGet, SendPost, SendUpdate, SendDelete } from "../common/http";
import { InputWithTwoUnits } from '../components/InputWithTwoUnits';
import PageContainer from "../components/PageContainer";
import '../css/PageWeight.css'

import CloudinaryUploadWidget from "../components/CloudinaryUploadWidget";
import { Cloudinary } from "@cloudinary/url-gen";
import { AdvancedImage, responsive, placeholder } from "@cloudinary/react";

import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Chart, registerables } from 'chart.js';
import { Link } from "react-router-dom";
Chart.register(...registerables, annotationPlugin);

const oneDayInMilliSec = 1000 * 24 * 60 * 60;

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
const cloudinaryURL = "https://res.cloudinary.com/dtjacou0b/image/upload/v1714500953/"

async function getWeightGoal() {
    const goal = await SendGet("/api/weight/goal", {});
    return goal.goal;
}
async function getWeightLogs() {
    const logs = await SendGet("/api/weight", {});
    return logs.weightlog;
}
async function newWeightLog(log) {
    const res = await SendPost("/api/weight", {...log});
	if (!res) {
		return "";
	}
    return res.id;
}

async function updateWeightLog(log) {
    await SendUpdate("/api/weight" , {...log});
}
async function deleteWeightLog(id) {
    await SendDelete("/api/weight", {_id: id});
}


export function PageWeightTracker() {
    const [goal, setGoal] = useState({value: 0, unit: "kg", deadline: 0});
    const [weightLogs, setWeightLogs] = useState([]);
    const [showAddLog, setShowAddLog] = useState(false);

    useEffect(() => {
        async function fetchData() {
			Promise.all([
				getWeightGoal(),
				getWeightLogs()
			]).then(([curGoal, curLogs]) => {
				if (curGoal !== null) {
					setGoal(curGoal);
				} else {
					window.location.href = "/weight/goal"
				}
				setWeightLogs(curLogs);
			}).catch(error => {console.error(error)});
        }
        fetchData();
    }, []);

	const loggedToday = weightLogs.length !== 0 && (weightLogs[weightLogs.length-1].timestamp >= Date.now() - oneDayInMilliSec);
	let daysLeft = "-";
	if (goal.deadline !== 0) {
		daysLeft = Math.floor((new Date(goal.deadline) - new Date(new Date().toLocaleDateString())) / (oneDayInMilliSec)) + 1;
	}

    function editLog(data, picture) {
		let wls = [...weightLogs]
        var idx = wls.findIndex(wl => wl._id === data._id);
		if (data.value) {
			wls[idx].value = data.value;
			wls[idx].unit = data.unit;
		} else {
			return;
		}
		if (picture) {
			wls[idx].picture = picture;
		} else {
			return;
		}
		updateWeightLog(weightLogs[idx])
        setWeightLogs(wls);
    }

    async function deleteLog(id) {
		if (window.confirm("Are you sure you want to delete this log?")){
			deleteWeightLog(id);
			setWeightLogs(weightLogs.filter(wl => wl._id !== id));
		}
    }

	async function addWeightLog(data, picture) {
        const logId = await newWeightLog({...data, timestamp: Date.now(), picture});
		if (!logId) {
			return
		}
        const newLog = {
			_id: logId,
            value: data.value,
            unit: data.unit,
			picture: picture,
			timestamp: Date.now()
        }
        setWeightLogs([...weightLogs, newLog]);
    }
	
    return (
        <div className="container">
            <div className="motto-container">
                <p className="motto">Balance for Better: Choose Health!</p>
                <img src="/quote-right.svg" alt="quote"></img>
            </div>
			<div className="weight-header">
				<span>Goal: {goal.value ? "" + goal.value + " " + goal.unit : "0 kg" } </span>
				<span style={{marginLeft:'2rem'}}> {daysLeft}  Days Left </span>
				<br/>
				<Link to="/weight/goal"> Edit Goal</Link>
			</div>
			<button className="button is-primary" style={{marginBottom: '1rem'}} onClick={()=> setShowAddLog(true)}>Record Weight for Today</button>
            {showAddLog && <WeightLogModal
                showModal={showAddLog}
                setShowModal={setShowAddLog}
                weightLog={loggedToday ? weightLogs[weightLogs.length - 1] : undefined} 
                unit={goal.unit} 
                addOrUpdateLog={loggedToday ? editLog : addWeightLog}/>}
			<div className="card section">
			<LineChart logs={weightLogs} goal={goal}/>
            <WeightLogList weightLogs={weightLogs} editLog={editLog} deleteLog={deleteLog}/>
			</div>
        </div>
    )
}

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
        <div className="weightLogItem" onClick={()=>setShowBubble(!showBubble)}>
            <img className="cactus" src={cloudinaryURL + log.picture} alt="Uploaded content"/>
            <p>{log.value + log.unit}</p>
            { showBubble &&
                <div className="one">
                    <button className="button is-info" style={{marginRight: '0.5rem'}} onClick={()=>setShowEditLog(true)}>Edit</button>
                    <button className="button is-danger" style={{marginLeft: '0.5rem'}} onClick={()=>deleteLog(log._id)}>Delete</button>
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

	/*
	==================================================================
	Credit to team Ajay, I this Cloudinary setup code from their tech share
	https://github.com/csci5117s24/Ajay-cloudinary-tech-share
	==================================================================
	*/
	const [publicId, setPublicId] = useState(weightLog && weightLog.picture);
	const [cloudName] = useState("dtjacou0b");
	const [uploadPreset] = useState("o9lheqnh");

	const [uwConfig] = useState({
		cloudName,
		uploadPreset,
		multiple: false,
		folder: "weight_images",
		context: {alt: "user_uploaded"},
		clientAllowedFormats: ["image"],
		maxImageFileSize: 2000000,
		maxImageWidth: 2000,
		maxImageHeight: 2000,
		sources: ["local", "camera"]
	});

	const cld = new Cloudinary({
		cloud: {
		  cloudName
		}
	});

	const myImage = cld.image(publicId);
	// END of team Ajay credits

    function handleInputChange(e) {
		let newData = {...data}

        if (e.value) {
            let newValue = parseFloat(e.value);
            if (isNaN(newValue)) {
                alert("invalid value!");
                return
            }
			newData.value = newValue;
        } else {
			newData.value = e.value;
		}

		if (e.unit){
			newData.unit = e.unit
		}
        setData(newData);
    }

    function handleSubmit(data, picture) {
		if (picture){
			addOrUpdateLog(data, picture);
		} else {
			addOrUpdateLog(data, "weight_images/d2heysixbf56qpdnwnu7");
		}
		setShowModal(false);
    }



    const className = showModal ? "modal is-active" : "modal";

    return (
        <div className={className}>
            <div className="modal-background"></div>
            <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">{weightLog ? "Edit Weight Log" : "New Weight Log"}</p>
                    <button className="delete" aria-label="close" onClick={() => setShowModal(false)}></button>
                </header>
                <section className="weight-modal modal-card-body">
					<InputWithTwoUnits 
						title="Current Weight:"
						units={["kg", "lbs"]} 
						coefs={[1.0/kgToLbsCoefficient, kgToLbsCoefficient]}
						data={data}
						handleInputChange={handleInputChange}/>
					<br/>
					<p>Upload a picture:</p>
					<CloudinaryUploadWidget uwConfig={uwConfig} setPublicId={setPublicId} />
					<div style={{ maxWidth: "40%", display: "flex", marginLeft: "30%", marginTop: "15px"}}>
						<AdvancedImage
						style={{ maxWidth: "100%" }}
						cldImg={myImage}
						plugins={[responsive(), placeholder()]}
						/>
					</div>
                </section>
                <footer className="modal-card-foot">
                <div className="buttons">
                    <button className="button is-success" onClick={() => handleSubmit(data, publicId)}>Submit</button>
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
			data: logs && logs.map(log => {
				// Scale the units if they do not match up
				if (log.unit !== goal.unit){
					if (goal.unit === "kg"){
						return log.value / kgToLbsCoefficient
					} else {
						return log.value * kgToLbsCoefficient
					}
				} else {
					return log.value
		  		}}),
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
				  yMin: goal.value,
				  yMax: goal.value,
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