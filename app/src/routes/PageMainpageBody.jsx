import PageContainer from "../components/PageContainer";
import {PageWaterCalendar } from "./PageWaterCalendar";
import WorkoutForm from "./WorkoutForm";
import { PageWeightTracker } from "./PageWeightTracker";

export const MainpageBodyRoute = {
    path: "/",
    element: <PageContainer/>,
    children: [
        {
        path: "/",
        element: [<PageWaterCalendar/>,<WorkoutForm/>,<PageWeightTracker/>]
        }
    ]
}
