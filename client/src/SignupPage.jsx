import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { zxcvbnOptions, zxcvbn } from "@zxcvbn-ts/core";
const zxcvbnCommonPackage = await import("@zxcvbn-ts/language-common");
const zxcvbnEnPackage = await import("@zxcvbn-ts/language-en");
import "./App.css";

const options = {
    // recommended
    dictionary: {
        ...zxcvbnCommonPackage.dictionary,
        ...zxcvbnEnPackage.dictionary,
    },
    // recommended
    graphs: zxcvbnCommonPackage.adjacencyGraphs,
    // recommended
    useLevenshteinDistance: true,
    // optional
    translations: zxcvbnEnPackage.translations,
};
zxcvbnOptions.setOptions(options);

function SignupPage() {
    let navigate = useNavigate();
    const [loginData, setLoginData] = useState({ username: "", password: "" });

    const onChange = (event) =>
        setLoginData({ ...loginData, [event.target.name]: event.target.value });

    const onSubmitForm = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch(
                `${import.meta.env.VITE_SERVER_URL}/api/signup`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include", // https://stackoverflow.com/questions/67020654/httponly-cookie-not-saved-in-browser
                    body: JSON.stringify({
                        username: loginData.username,
                        password: loginData.password,
                    }),
                }
            );

            if (response.ok) {
                navigate("/login");
            }
        } catch (err) {
            console.error(err);
        }
    };

    //https://codesandbox.io/p/sandbox/password-zxcvbn-react-ts-3lt0q?file=%2Fsrc%2FApp.tsx%3A31%2C1
    const [result, setResult] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    // const deferredPassword = useDeferredValue(loginData.password);

    useEffect(() => {
        // https://stackoverflow.com/questions/77009292/what-is-useeffect-in-react
        if (loginData.password === "") return;
        setResult(zxcvbn(loginData.password));
    }, [loginData.password]);

    let strength = { 1: "Weak", 2: "Weak", 3: "Good", 4: "Strong" };

    const progressBarStyle = (score = 0) => {
        let initialStyle = {
            display: "flex",
            clear: "left",
            backgroundColor: "#e9ecef",
            flexDirection: "column",
            borderRadius: ".25rem",
            width: "0%",
            height: "100",
            justifyContent: "center",
            textAlign: "center",
        };

        let transformedStyle = {};
        switch (score) {
            case 1:
                transformedStyle = { backgroundColor: "#c83522", width: "25%" };
                break;
            case 2:
                transformedStyle = { backgroundColor: "#8b6609", width: "50%" };
                break;
            case 3:
                transformedStyle = { backgroundColor: "#175ddc", width: "75%" };
                break;
            case 4:
                transformedStyle = {
                    backgroundColor: "#017e45",
                    width: "100%",
                };
                break;
            default:
                transformedStyle = { backgroundColor: "#e9ecef", width: "0%" };
        }
        initialStyle = {
            ...initialStyle,
            ...transformedStyle,
            transition: "all .6s",
        };

        return initialStyle;
    };
    return (
        <>
            <form className="g-3 needs-validation mt-3" onSubmit={onSubmitForm}>
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
                    <div className="progress mb-3">
                        <div
                            className="progress-bar text-white"
                            style={progressBarStyle(result.score)}
                            role="progressbar"
                            aria-valuenow={result.score}
                            aria-valuemin="0"
                            aria-valuemax="4"
                        >
                            {result.score > 0 && strength[result.score]}
                        </div>
                    </div>
                </div>
                <div className="form-group mb-3">
                    <label htmlFor="retypePassword">Re-type Password</label>
                    <div className="input-group mb-3">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="retypePassword"
                            className="form-control bg-dark border-dark text-white"
                            pattern={loginData.password}
                            spellCheck="false"
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            onChange={(e) => onChange(e)}
                            onPaste={(e) => {
                                e.preventDefault();
                                return false;
                            }}
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
                <button className="btn btn-primary">Submit</button> Already have
                an account? <a href="/login">Sign in</a>
            </form>
        </>
    );
}
// https://github.com/ai/nanoid/blob/main/index.js
export default SignupPage;
