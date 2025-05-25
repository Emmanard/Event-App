import LoadingIndicator from "components/LoadingIndicator";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { resendOTP, verifyOTP } from "services/auth";

export default function VerifyOTP() {
  const location = useLocation();
  const userEmail = location.state?.email;
  const [email, setEmail] = useState(userEmail);
  const [otp, setOTP] = useState();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scroll(0, 0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let body = {
      email,
      otp,
    };
    setLoading(true);
    try {
      let data = await verifyOTP(body);
      let msg = data.data.msg;
      window.toastify(msg, "success");
      navigate("/auth/login");
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

  const handleResend = async () => {
    setLoading(true);
    try {
      let data = await resendOTP({ email });
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
            <div className="col">
              <div className="card shadow-lg rounded-5 border-0 mt-3 mb-4">
                <div className="row row-cols-1 row-cols-md-2  g-0">
                  <div className="col p-3 p-md-4 p-lg-5 my-4">
                    <h3 className="text-center text-warning mb-5">
                      Verify Your Email
                    </h3>
                    <form className="px-0 px-lg-4" onSubmit={handleSubmit}>
                      <div className="form-floating mb-3">
                        <input
                          type="email"
                          className="form-control shadow-none"
                          id="floatingInput"
                          value={email}
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
                      <div className="form-floating mb-3">
                        <input
                          type="number"
                          className="form-control shadow-none"
                          required
                          maxLength={4}
                          id="floatingInput1"
                          onChange={(e) => setOTP(e.target.value)}
                          placeholder="Enter OTP"
                        />
                        <label
                          htmlFor="floatingInput1"
                          className="text-secondary"
                        >
                          Enter OTP
                        </label>
                      </div>
                      <div className="d-flex justify-content-end">
                        <button
                          className="btn btn-link text-decoration-none"
                          type="button"
                          onClick={handleResend}
                        >
                          Resend OTP
                        </button>
                      </div>
                      <div className="my-5">
                        <button
                          className="button-stylling w-100 py-3 rounded bg-info border-0"
                          type="submit"
                        >
                          <span className="text">Verify</span>
                          <span>Verify</span>
                        </button>
                      </div>
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
