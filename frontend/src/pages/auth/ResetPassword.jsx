import LoadingIndicator from "components/LoadingIndicator";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { resetPassword } from "services/auth";

export default function ResetPassword() {
  const { token, email } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scroll(0, 0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return window.toastify("Password does not match", "error");
    }
    let body = {
      email,
      password: confirmPassword,
    };
    setLoading(true);
    try {
      let data = await resetPassword(token, body);
      let msg = data.data.msg;
      window.toastify(msg, "success");
      navigate("/auth/login");
    } catch (error) {
      let msg = "Some error occured";
      let { status, data } = error.response;
      if (status == 400 || status == 500 || status == 404) {
        msg = data.message;
        window.toastify(msg, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoadingIndicator loading={loading} />
      <div id="auth-page-right">
        <div className="container">
          <div className="row">
            <div className="col-12 col-md-8 col-lg-6 offset-0 offset-md-2 offset-lg-3">
              <div className="card shadow-lg rounded-5 border-0 mt-3 mb-4">
                <div className="row  g-0">
                  <div className="col p-3 p-md-4 p-lg-5 my-4">
                    <h3 className="text-warning text-center mb-5">
                      Change Password
                    </h3>
                    <form className="px-0 px-lg-4" onSubmit={handleSubmit}>
                      <div className="form-floating mb-3">
                        <input
                          type="email"
                          className="form-control shadow-none"
                          id="floatingInput"
                          value={email}
                          disabled
                          placeholder="Email"
                        />
                        <label
                          htmlFor="floatingInput"
                          className="text-secondary"
                        >
                          Your Email
                        </label>
                      </div>
                      <div className="form-floating mb-3">
                        <input
                          type="password"
                          className="form-control shadow-none"
                          id="floatingInput"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="New Password"
                        />
                        <label
                          htmlFor="floatingInput"
                          className="text-secondary"
                        >
                          New Password
                        </label>
                      </div>
                      <div className="form-floating mb-3">
                        <input
                          type="password"
                          className="form-control shadow-none"
                          id="floatingInput1"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm Password"
                        />
                        <label
                          htmlFor="floatingInput1"
                          className="text-secondary"
                        >
                          Confirm Password
                        </label>
                      </div>
                      <div className="my-5">
                        <button
                          className="button-stylling w-100 py-3 rounded bg-info border-0"
                          type="submit"
                        >
                          <span className="text">Reset Password</span>
                          <span>Reset Password</span>
                        </button>
                      </div>
                      <p className="text-center text-secondary">
                        Know your password?{" "}
                        <Link to="/auth/login" className="text-decoration-none">
                          Login
                        </Link>
                      </p>
                    </form>
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
