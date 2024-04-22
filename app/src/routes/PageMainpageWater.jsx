import PageContainer from "../components/PageContainer";
import { PageWaterCalendar } from "./PageWaterCalendar";
import WorkoutForm from "./WorkoutForm";

export const MainpageWaterRoute = {
    path: "/",
    element: <PageContainer></PageContainer>,
    children: [
        {
            path: "/",
            element: [<PageWaterCalendar/>,<WorkoutForm/>]
        }
    ]

}
