import LoadingIndicator from "components/LoadingIndicator";
import { useAuthContext } from "context/AuthContext";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "services/auth";

const initialState = { email: "", password: "" };
export default function Login() {
  const [state, setState] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const { toggle, setToggle } = useAuthContext();
  const [pathName, setPathName] = useState("/");
  const navigate = useNavigate();

  useEffect(() => {
    window.scroll(0, 0);
    if (!window.location.pathname.includes("/auth/login")) {
      setPathName(window.location.pathname);
    }
  }, []);
  const handleChange = (e) => {
    setState((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let data = await loginUser(state);
      let msg = data.data.msg;
      let jwtoken = data.data.jwtoken;
      let userData = data.data.data;
      localStorage.setItem("jwtoken", jwtoken);
      localStorage.setItem("user", JSON.stringify(userData));
      window.toastify(msg, "success");
      // navigate(pathName);
      setToggle(!toggle);
      window.location.href = pathName; // Change '/new-route' to your desired route
    } catch (error) {
      let msg = "Some error occured";
      let { status, data } = error.response;
      if (
        status === 400 ||
        status === 401 ||
        status === 500 ||
        status === 403
      ) {
        msg = data.message;
        window.toastify(msg, "error");
        if (status === 403) {
          navigate("/auth/verifyOTP", { state: { email: state.email } });
        }
      }
    } finally {
      setLoading(false);
      setToggle(!toggle);
    }
  };

  return (
    <>
      <LoadingIndicator loading={loading} />
      <div id="auth-page-right">
        <div className="container">
          <div className="row">
            <div className="col">
              <div className="card shadow-lg rounded-5 border-0 mt-3 mb-4">
                <div className="row row-cols-1 row-cols-md-2  g-0">
                  <div className="col p-3 p-md-4 p-lg-5 my-4">
                    <h3 className="text-warning text-center mb-5">Login</h3>
                    <form className="px-0 px-lg-4" onSubmit={handleSubmit}>
                      <div className="form-floating mb-3">
                        <input
                          type="email"
                          className="form-control shadow-none"
                          id="floatingInput"
                          required
                          name="email"
                          onChange={handleChange}
                          placeholder="name@example.com"
                        />
                        <label
                          htmlFor="floatingInput"
                          className="text-secondary"
                        >
                          Email address
                        </label>
                      </div>
                      <div className="form-floating mb-3">
                        <input
                          type="password"
                          className="form-control shadow-none"
                          id="floatingInput1"
                          required
                          name="password"
                          onChange={handleChange}
                          placeholder="Enter Password"
                        />
                        <label
                          htmlFor="floatingInput1"
                          className="text-secondary"
                        >
                          Password
                        </label>
                      </div>
                      <div className="d-flex justify-content-end">
                        <Link
                          className="text-decoration-none"
                          to="/auth/forgot-password"
                        >
                          Forgot Password?
                        </Link>
                      </div>
                      <div className="my-5">
                        <button
                          className="button-stylling w-100 py-3 rounded bg-info border-0"
                          type="submit"
                        >
                          <span className="text">Log in</span>
                          <span>Log in</span>
                        </button>
                      </div>
                      <p className="text-center text-secondary">
                        Don't have an account?{" "}
                        <Link
                          to="/auth/register"
                          className="text-decoration-none"
                        >
                          Register
                        </Link>
                      </p>
                    </form>
                  </div>
                  <div className="col text-light d-none d-md-block">
                    <div className="row  d-flex align-items-center justify-content-center">
                      <div className="col-9 text-center">
                        <h1 className="fw-bold">
                          Join us to explore the world
                        </h1>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
