import { Bar } from "react-chartjs-2";

/*
    ctx: the container dom element
    dataset: {"label1" : value1, "label2":  value2}
 */
function BarChart({ dataset, title }) {
    var labels = [];
    var datapoints = [];
    for (let i = 0; i < dataset.length; i++) {
        labels.push(dataset[i].label);
        datapoints.push(dataset[i].value);
    }

    const data = {
        labels: labels,
        datasets: [{
            // label: title,
            data: datapoints,
        }]
    }

    const options = {
        scales: {
            y: {
              beginAtZero: true
            }
        },
        plugins: {
            title: {
              display: false
            },
            legend: {
                display: false
            }
        }
    }
    return (
        <>
        {
            dataset.length > 0 &&
            <div>
                <h1>{title}</h1>
                <Bar data={data} options={options}/>
            </div>
        }
        </>
    )
}

export default BarChart;