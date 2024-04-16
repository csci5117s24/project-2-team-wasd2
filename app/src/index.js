import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { WaterGoalRoute } from './routes/PageWaterGoal';
import { WaterTrackerRoute } from './routes/PageWaterTracker';
import { WaterCalendarRoute } from './routes/PageWaterCalendar';
import { Chart, registerables} from 'chart.js';

Chart.register(...registerables); // register char.js

// create the router -- paths are configured here
const router = createBrowserRouter([
  {
    path: "/",
    element: <App/>,
    children: [
      WaterGoalRoute,
      WaterTrackerRoute,
      WaterCalendarRoute,
    ]
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
// make the router the default component
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
