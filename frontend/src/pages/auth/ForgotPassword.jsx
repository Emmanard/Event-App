import LoadingIndicator from "components/LoadingIndicator";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "services/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scroll(0, 0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let data = await forgotPassword({ email });
      let msg = data.data.msg;
      window.toastify(msg, "success");
    } catch (error) {
      let msg = "Some error occured";
      let { status, data } = error.response;
      if (status == 400 || status == 401 || status == 500 || status == 404) {
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
                      Reset Password
                    </h3>
                    <form className="px-0 px-lg-4" onSubmit={handleSubmit}>
                      <div className="form-floating mb-3">
                        <input
                          type="email"
                          className="form-control shadow-none"
                          id="floatingInput"
                          required
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                        />
                        <label
                          htmlFor="floatingInput"
                          className="text-secondary"
                        >
                          Email address
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
