
import "./_newsletter.scss";

export default function Index() {
  return (
    <div>
      <div id="newsletter-section">
        <div className="container-fluid p-0">
          <div className="container px-3">
            <div className="card p-4 p-sm-5 rounded-pill border-0 shadow-lg">
              <form>
                <div className="row g-3 d-flex justify-content-center">
                  <div className="col-12 col-md-11">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control py-2 py-md-3 border-3 border-warning bg-transparent "
                        placeholder="Enter you email here..."
                        aria-label="Recipient's username"
                        aria-describedby="basic-addon2"
                      />
                      <button className="button-stylling input-group-text px-4 px-md-5 py-2 py-md-3 bg-warning border-0">
                        <span className="text d-flex align-items-center">
                          <span className="d-none d-sm-block">Subscribe</span>
                          <i className="bx bx-send bx-tada ms-2 fs-4"></i>
                        </span>
                        <span className="d-flex align-items-center">
                          Let's Go
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
