import PageContainer from "../components/PageContainer";
import { PageWaterCalendar } from "./PageWaterCalendar";
import WorkoutForm from "./WorkoutForm";
import { PageWeightGoal } from "./PageWeightGoal";
import { PageWeightTracker } from "./PageWeightTracker";

export const MainpageWaterRoute = {
    path: "/",
    element: [<PageWaterCalendar/>,<WorkoutForm/>,<PageWeightTracker/>]

}
