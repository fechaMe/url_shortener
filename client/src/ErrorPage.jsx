import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
    const error = useRouteError();
    console.error(error);

    return (
        <div id="error-page">
            <h1 className="text-center text-white">{error.status}error {error.data}</h1>
        </div>
    );
}
