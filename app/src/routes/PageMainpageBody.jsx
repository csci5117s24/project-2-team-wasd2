import { Children, useEffect, useState } from "react";
import PageContainer from "../components/PageContainer";
import Calendar from 'react-calendar'
import { waterLogList } from "../common/mock_data";
import BarChart from "../components/BarChart";
import { Link } from "react-router-dom";
import { MainpageWaterCalendarRoute, PageWaterCalendar } from "./PageWaterCalendar";
import WorkoutForm from "./WorkoutForm";
import { PageWeightGoal } from "./PageWeightGoal";
import { PageWeightTracker } from "./PageWeightTracker";

export const MainpageBodyRoute = {
    path: "/",
    element: [<PageWaterCalendar/>,<WorkoutForm/>,<PageWeightTracker/>]

}
