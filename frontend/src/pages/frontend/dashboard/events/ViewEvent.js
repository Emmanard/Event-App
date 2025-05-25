import { Avatar, Modal } from "antd";
import "./_events.scss";
import React, { useEffect, useState } from "react";
import { getEditEvent } from "services/event";
import FavoriteTwoToneIcon from "@mui/icons-material/FavoriteTwoTone";
import VisibilityTwoToneIcon from "@mui/icons-material/VisibilityTwoTone";
import { UserOutlined } from "@ant-design/icons";

export default function ViewEvent({ open, setOpen, id }) {
  const [event, setEvent] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getEvent();
  }, []);

  const getEvent = async () => {
    try {
      let { data } = await getEditEvent(id);
      setEvent(data?.data);
    } catch (error) {
      console.log(error);
      let msg = "Some error occured";
      let { status, data } = error.response;
      if (status == 400 || status == 401 || status == 500 || status == 413) {
        msg = data.message || data.msg;
        window.toastify(msg, "error");
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div>
      <Modal
        title={""}
        centered
        open={open}
        onOk={() => setOpen(false)}
        onCancel={() => setOpen(false)}
        width={1000}
        footer={[]}
        className="event-modal my-2"
      >
        <div className="container-fluid">
          {isLoading ? (
            <div className="row">
              <div className="col">
                <div className="my-5 text-center">
                  <div className="spinner-grow bg-info"></div>
                  <div className="spinner-grow bg-warning mx-3"></div>
                  <div className="spinner-grow bg-info"></div>
                  <div>Loading...</div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="row mt-5">
                <div className="col">
                  <img
                    src={event?.image}
                    alt="event image"
                    className="w-100 img-fluid rounded-3"
                  />
                </div>
              </div>
              <div className="row mt-3">
                <div className="col-12 mb-4">
                  <div className="d-block d-sm-flex justify-content-between">
                    <h4>{event?.title}</h4>
                    <div className="ms-2">
                      <span className="d-flex align-items-center">
                        <FavoriteTwoToneIcon className="me-1 text-danger" />
                        <span className="text-danger">
                          {event?.likes.length}
                        </span>
                        <VisibilityTwoToneIcon className="ms-3 me-1 text-primary" />
                        <span className="text-primary">
                          {event?.views.length}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-sm-6 col-md-4 mt-4 mt-sm-0">
                  <strong className="text-warning">Category: </strong>
                  {event?.category}
                </div>
                <div className="col-12 col-sm-6 col-md-4 mt-2 mt-sm-0">
                  <strong className="text-warning">Country: </strong>
                  {event?.country}
                </div>
                <div className="col-12 col-sm-6 col-md-4 mt-2 mt-sm-3 mt-md-0">
                  <strong className="text-warning">Status: </strong>
                  {event?.status}
                </div>
                <div className="col-12 col-sm-6 col-md-4 mt-2 mt-sm-3">
                  <strong className="text-warning">City: </strong>
                  {event?.city}
                </div>
                <div className="col-12 col-sm-6 col-md-4 mt-2 mt-sm-3 pb-0 pb-sm-4">
                  <strong className="text-warning">Event Date: </strong>
                  {event?.date?.split("T")[0]}
                </div>
                <div className="col-12 col-sm-6 col-md-4 mt-2 mt-sm-3 pb-4">
                  <strong className="text-warning">Created At: </strong>
                  {event?.createdAt?.split("T")[0]}
                </div>
                <hr />
                <div className="col-12 mb-2">
                  <strong className="text-warning">Time Range:</strong>
                  <div className="row border rounded border-info text-center p-2 mx-1 mx-sm-3 mt-2">
                    <div className="col">
                      {event?.time ? event?.time[0] : ""}
                    </div>
                    <div className="col">
                      <i className="bx bx-right-arrow-alt bx-fade-left fs-4 text-info"></i>
                    </div>
                    <div className="col">
                      {event?.time ? event?.time[1] : ""}
                    </div>
                  </div>
                </div>
                <div className="col-12 mt-2">
                  <strong className="text-warning">Location:</strong>
                  <p>{event?.location}</p>
                </div>
                <div className="col-12 mt-2">
                  <strong className="text-warning">
                    Organizer Information:
                  </strong>
                  <p>{event?.organizerInfo}</p>
                </div>
                <div className="col-12 mt-2">
                  <strong className="text-warning">Rules and Policies:</strong>
                  <p>{event?.eventRules}</p>
                </div>
                <hr />
                {event?.schedule && event?.schedule.length > 0 && (
                  <div className="col-12 col-md-6 mt-2 pb-3">
                    <strong className="text-warning ">Schedule</strong>
                    <ol className="list-group list-group-numbered mt-3">
                      {event?.schedule?.map((item, i) => {
                        return (
                          <li
                            className="list-group-item d-flex justify-content-between align-items-start"
                            key={i}
                          >
                            <div className="ms-2 me-auto">
                              <div className="fw-bold">{item.time}</div>
                              <p>{item.details}</p>
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                )}
                {event?.speakers && event?.speakers.length > 0 && (
                  <>
                    <div className="col-12 col-md-6 mt-2 pb-3">
                      <strong className="text-warning ">Speakers</strong>
                      <ol className="list-group list-group-numbered mt-3">
                        {event?.speakers?.map((item, i) => {
                          return (
                            <li
                              className="list-group-item d-flex justify-content-between align-items-start"
                              key={i}
                            >
                              <div className="ms-2">
                                <Avatar
                                  size="small"
                                  src={item?.img}
                                  icon={<UserOutlined />}
                                />
                              </div>
                              <div className="ms-2 me-auto">
                                <div>
                                  <strong>{item.name}</strong> (
                                  {item?.profession})
                                </div>
                                <p>{item.details}</p>
                              </div>
                            </li>
                          );
                        })}
                      </ol>
                    </div>
                    <hr />
                  </>
                )}
                <div className="col-12 col-md-4 mt-2">
                  <strong className="text-warning">Ticket Price</strong>
                  <p>
                    <strong>Rs. </strong>
                    {event?.ticketPrice}
                  </p>
                </div>
                <div className="col-12 col-md-4 mt-2">
                  <strong className="text-warning">Total Seats</strong>
                  <p>{event?.seats}</p>
                </div>
                <div className="col-12 col-md-4 mt-2">
                  <strong className="text-warning">Related Tags</strong>
                  <p>{event?.tags}</p>
                </div>

                <div className="col-12">
                  <strong className="text-warning">Description</strong>
                  <div
                    className="mt-4 border rounded p-3"
                    dangerouslySetInnerHTML={{
                      __html: event?.description
                        ? event?.description
                        : "No description added yet",
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
