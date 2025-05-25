import React from "react";
import BookmarkAddTwoToneIcon from "@mui/icons-material/BookmarkAddTwoTone";
import AssignmentIndTwoToneIcon from "@mui/icons-material/AssignmentIndTwoTone";
import { Avatar, Input, InputNumber } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

export default function RightCol({ event }) {
  const formatNumber = (num) => {
    num = num ? num : 0;
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  return (
    <div style={{ position: "sticky", top: 90 }}>
      <div className="card border-0 shadow py-4 rounded-4">
        <div className="row mx-0">
          <div className="col-9 col-sm-7 col-md-12 col-lg-9 col-xl-7 bg-warning py-2 rounded-end d-flex justify-content-center">
            <h5 className="fw-bold text-light d-flex align-items-center">
              <BookmarkAddTwoToneIcon />{" "}
              <span className="ms-2">Book This Event</span>
            </h5>
          </div>
        </div>
        <div className="container mt-4">
          <form>
            <div className="row row-cols-1 px-2 px-sm-3 px-md-1 px-lg-3 g-3">
              <div className="col">
                <Input size="large" placeholder="Enter Full Name" />
              </div>
              <div className="col">
                <Input size="large" placeholder="Enter Email" />
              </div>
              <div className="col">
                <InputNumber
                  size="large"
                  className="w-100"
                  placeholder="Enter Phone"
                />
              </div>
              <div className="col">
                <InputNumber
                  size="large"
                  className="w-100"
                  placeholder="Quantity"
                />
              </div>
              <div className="col">
                <button
                  className="button-stylling w-100 py-3 rounded bg-info border-0"
                  type="submit"
                >
                  <span className="text">Submit Now</span>
                  <span>Book Ticket</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* added by */}
      <div className="card border-0 shadow rounded-4 py-4 mt-4">
        <div className="row mx-0">
          <div className="col-7 col-sm-6 col-md-10 col-lg-9 col-xl-6 bg-warning py-2 rounded-end d-flex justify-content-center">
            <h5 className="fw-bold text-light d-flex align-items-center">
              <AssignmentIndTwoToneIcon />{" "}
              <span className="ms-2">Added By</span>
            </h5>
          </div>
        </div>
        <div className="container mt-4">
          <div className="text-center my-4">
            <Link to={"#"}>
              <Avatar
                shape="square"
                size={100}
                src={event?.addedBy?.image}
                icon={<UserOutlined />}
              />
            </Link>
          </div>
          <div className="row mb-3">
            <div className="col">
              Followers: {formatNumber(event?.addedBy?.followers?.length)}
            </div>
            <div className="col">
              Following: {formatNumber(event?.addedBy?.following?.length)}
            </div>
          </div>
          <div>
            {event?.addedBy?.fullName && event?.addedBy?.fullName !== "" && (
              <>
                <h6 className="text-warning">Full Name</h6>
                <p>{event?.addedBy?.fullName}</p>
              </>
            )}

            {event?.addedBy?.profession &&
              event?.addedBy?.profession !== "" && (
                <>
                  <h6 className="text-warning">Profession</h6>
                  <p>{event?.addedBy?.profession}</p>
                </>
              )}

            {event?.addedBy?.email && event?.addedBy?.email !== "" && (
              <>
                <h6 className="text-warning">Email</h6>
                <p>{event?.addedBy?.email}</p>
              </>
            )}

            {event?.addedBy?.phone && event?.addedBy?.phone !== "" && (
              <>
                <h6 className="text-warning">Phone</h6>
                <p>{event?.addedBy?.phone}</p>
              </>
            )}

            {event?.addedBy?.country && event?.addedBy?.country !== "" && (
              <>
                <h6 className="text-warning">Country</h6>
                <p>{event?.addedBy?.country}</p>
              </>
            )}

            {event?.addedBy?.city && event?.addedBy?.city !== "" && (
              <>
                <h6 className="text-warning">City</h6>
                <p>{event?.addedBy?.city}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
