import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

function Home() {
    let navigate = useNavigate();
    const [url, setUrl] = useState(false);
    const [shortUrls, setShortUrls] = useState([]);

    useEffect(() => {
        // https://stackoverflow.com/questions/77009292/what-is-useeffect-in-react
        (async function () {
            try {
                const token = sessionStorage.getItem("token");
                console.log(token);
                const response = await fetch(
                    `${import.meta.env.VITE_SERVER_URL}/api/urls`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: "Bearer " + token,
                        },
                        credentials: "include", // https://stackoverflow.com/questions/67020654/httponly-cookie-not-saved-in-browser
                    }
                );
                console.log(response);
                const bod = await response.json();
                console.log(bod);
                setShortUrls(bod);
            } catch (err) {
                console.error(err);
            }
        })();
    }, []);

    const onSubmitUrl = async (event) => {
        try {
            const token = sessionStorage.getItem("token");
            console.log(token);
            const response = await fetch(
                `${import.meta.env.VITE_SERVER_URL}/api/urls`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + token,
                    },
                    credentials: "include", // https://stackoverflow.com/questions/67020654/httponly-cookie-not-saved-in-browser
                    body: JSON.stringify({ url }),
                }
            );
            const bod = await response.json();
            setShortUrls([
                ...shortUrls,
                { short_url: bod.short, long_url: url },
            ]);
        } catch (err) {
            console.error(err);
        }
    };

    const onDeleteUrl = async (idx, short_url, event) => {
        try {
            const token = sessionStorage.getItem("token");
            console.log(token);
            const response = await fetch(
                `${import.meta.env.VITE_SERVER_URL}/api/urls`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + token,
                    },
                    credentials: "include", // https://stackoverflow.com/questions/67020654/httponly-cookie-not-saved-in-browser
                    body: JSON.stringify({ short_url }),
                }
            );
            //   const bod = await response.json();
            if (response.ok) {
                setShortUrls(shortUrls.filter((e, i) => i !== idx));
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <>
            <button
                type="button"
                className="btn btn-primary float-end"
                onClick={(event) => {
                    sessionStorage.clear();
                    navigate("/login");
                }}
            >
                Sign out
            </button>
            <form className="g-3 mt-3 mb-3">
                <div className="form-group">
                    <label htmlFor="url">Enter Url</label>
                    <div className="input-group mb-3">
                        <input
                            type="text"
                            name="password"
                            className="form-control bg-dark border-dark text-white"
                            maxLength={200}
                            spellCheck="false"
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            onChange={(e) => setUrl(e.target.value)}
                        ></input>
                        <div className="input-group-append">
                            <button
                                type="button"
                                className="btn btn-outline-secondary bg-dark text-white"
                                onClick={(e) => onSubmitUrl(e)}
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            </form>
            <div className="bg-dark border-dark text-white w-50 d-flex mx-auto table-responsive card">
                <table className="table table-dark table-striped table-hover table-bordered table-align-middle">
                    <caption className="mt-3 mx-auto text-center text-white">
                        List of Short Urls
                    </caption>
                    <thead>
                        <tr>
                            <th scope="col">Short Url</th>
                            <th scope="col">Target Url</th>
                            <th scope="col">Delete</th>
                        </tr>
                    </thead>
                    <tbody className="table-group-divider">
                        {shortUrls.map((e, idx) => {
                            console.log(e, idx);
                            const shortUrlLink =
                                import.meta.env.VITE_SERVER_URL +
                                "/" +
                                e.short_url;
                            return (
                                <tr>
                                    <td>
                                        <a href={shortUrlLink}>
                                            {shortUrlLink}
                                        </a>
                                    </td>
                                    <td>
                                        <a href={e.long_url}>{e.long_url}</a>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-outline-secondary bg-dark text-white"
                                            type="button"
                                            onClick={(event) =>
                                                onDeleteUrl(
                                                    idx,
                                                    e.short_url,
                                                    event
                                                )
                                            }
                                        >
                                            <i className="bi bi-trash3"></i>
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </>
    );
}

export default Home;
