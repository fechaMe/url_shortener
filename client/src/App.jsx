import React from "react";
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
import Home from "./Home.jsx";
import LoginPage from "./LoginPage.jsx";
import SignupPage from "./SignupPage.jsx";
import Redirect from "./Redirect.jsx";
import ErrorPage from "./ErrorPage.jsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <LoginPage />,
        errorElement: <ErrorPage />,
    },
    {
        loader: async () => {
            try {
                const token = sessionStorage.getItem("token");
                if (token == null) {
                    throw new Response("Unauthorized", { status: 401 });
                }
                const response = await fetch(
                    `${import.meta.env.VITE_SERVER_URL}/api/authenticate`,
                    {
                        method: "POST",
                        headers: {
                            Authorization: "Bearer " + token,
                        },
                        credentials: "include", // https://stackoverflow.com/questions/67020654/httponly-cookie-not-saved-in-browser
                    }
                );
                if (response.ok){
                    return null;
                } else {
                    throw new Response("Unauthorized", { status: 401 });
                }
            } catch (err) {
                console.error(err);
            }
        },
        path: "/home",
        element: <Home />,
        errorElement: <LoginPage />,
    },
    // {
    //     path: "/home",
    //     element: true ? <Home /> : <Navigate to="/login" />,
    //     errorElement: <ErrorPage />,
    //     // children: [
    //     //     {
    //     //         path: "/home",
    //     //         element: <Home />,
    //     //     }
    //     // ]
    // },
    {
        path: "/login",
        element: <LoginPage />,
    },
    {
        path: "/signup",
        element: <SignupPage />,
    },
    {
        path: "/:id",
        element: <Redirect />,
        errorElement: <ErrorPage />,
        loader: async ({ params }) => {
            console.log(params.id);
            if (params.id !== "abcde") {
                throw new Response("Not Found", { status: 404 });
            }
            return null;
        },
    },
]);

function App() {
    return (
        <>
            <RouterProvider router={router} />
        </>
    );
}

export default App;
