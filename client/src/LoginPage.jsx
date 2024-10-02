import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

function LoginPage() {
    let navigate = useNavigate();
    const [loginData, setLoginData] = useState({ username: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);

    const onChange = (event) =>
        setLoginData({ ...loginData, [event.target.name]: event.target.value });

    const onSubmitForm = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch(
                `${import.meta.env.VITE_SERVER_URL}/api/login`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include", // https://stackoverflow.com/questions/67020654/httponly-cookie-not-saved-in-browser
                    body: JSON.stringify(loginData),
                }
            );
            const bod = await response.json();
            sessionStorage.setItem("token", bod.token);

            if (response.ok) {
                navigate("/home");
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <>
            <form className="g-3 mt-3" onSubmit={onSubmitForm}>
                <div className="form-group has-validation">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        name="username"
                        className="form-control bg-dark border-dark text-white mb-3"
                        minLength={6}
                        maxLength={32}
                        spellCheck="false"
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        onChange={(e) => onChange(e)}
                        required
                    ></input>
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <div className="input-group mb-3">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            className="form-control bg-dark border-dark text-white"
                            minLength={8}
                            maxLength={64}
                            spellCheck="false"
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            onChange={(e) => onChange(e)}
                            required
                        ></input>
                        <div className="input-group-append">
                            <button
                                type="button"
                                className="btn btn-outline-secondary bg-dark text-white"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <i className="bi bi-eye-slash"></i>
                                ) : (
                                    <i className="bi bi-eye"></i>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
                <button className="btn btn-primary mr-3">Submit</button> New
                User? <a href="/signup">Create an account</a>
            </form>
        </>
    );
}

export default LoginPage;
