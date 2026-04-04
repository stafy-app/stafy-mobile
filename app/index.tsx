// app/index.tsx
import "../global.css";
import {Link, Redirect} from "expo-router"


export default function Page() {
    return (

        <Redirect href="/login" />
        /*<Link href={"/register"}>Register Page</Link> */

    );
}
