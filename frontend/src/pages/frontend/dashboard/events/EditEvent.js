import React, { useEffect, useRef, useState, useCallback } from "react";
import "./_events.scss";
import {
  Input,
  Select,
  Form,
  Button,
  DatePicker,
  Upload,
  TimePicker,
  InputNumber,
  Progress,
} from "antd";
import {
  InboxOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { getEditEvent, updateEvent } from "services/event";
import LoadingIndicator from "components/LoadingIndicator";
import ReactQuill from "react-quill";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { uploadToCloudinary, deleteFromCloudinary } from "services/cloudinary";

const { Dragger } = Upload;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const eventFormRef = useRef();

  const [state, setState] = useState({
    isLoading: true,
    loading: false,
    imgLoading: false,
    imgProgress: 0,
    description: "",
    event: {},
    image: "",
    eventPrice: null,
    currentImagePublicId: null,
    taxRate: 0.2,
  });

  const handleError = (error, defaultMsg = "Some error occurred") => {
    const { status, data } = error.response || {};
    const msg = [400, 401, 413, 500].includes(status)
      ? data?.message || data?.msg
      : defaultMsg;
    window.toastify(msg, "error");
  };

  const extractPublicId = (imageUrl) => {
    if (!imageUrl?.includes("cloudinary.com")) return null;
    const filename = imageUrl.split("/").pop();
    return `events/${filename.split(".")[0]}`;
  };

  // Wrap getEvent in useCallback to fix the dependency issue
  const getEvent = useCallback(async () => {
    try {
      const { data } = await getEditEvent(id);
      const eventData = data?.data;

      setState((prev) => ({
        ...prev,
        event: eventData,
        description: eventData?.description || "",
        image: eventData?.image || "",
        currentImagePublicId: extractPublicId(eventData?.image),
      }));
    } catch (error) {
      console.log(error);
      handleError(error);
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [id]); // Add id as dependency

  useEffect(() => {
    window.scroll(0, 0);
    getEvent();
  }, [getEvent]); // Now include getEvent in dependency array

  const uploadProps = {
    name: "file",
    multiple: false,
    fileList: [],
    customRequest: async ({ file, onSuccess, onError }) => {
      // Enhanced file validation like AddEvent component
      if (!file.type.startsWith("image/")) {
        window.toastify("Please select an image file", "error");
        return onError(new Error("Invalid file type"));
      }

      if (file.size > MAX_FILE_SIZE) {
        window.toastify("Image size should be less than 5MB", "error");
        return onError(new Error("File too large"));
      }

      try {
        setState((prev) => ({ ...prev, imgLoading: true, imgProgress: 25 }));

        // Delete old image if exists
        if (state.currentImagePublicId) {
          try {
            await deleteFromCloudinary(state.currentImagePublicId);
          } catch (deleteError) {
            console.warn("Failed to delete old image:", deleteError);
          }
        }

        setState((prev) => ({ ...prev, imgProgress: 50 }));
        const response = await uploadToCloudinary(file, "events");
        setState((prev) => ({ ...prev, imgProgress: 75 }));

        setState((prev) => ({
          ...prev,
          image: response.url,
          currentImagePublicId: response.publicId,
          imgLoading: false,
          imgProgress: 100,
        }));

        onSuccess(response);

        // Reset progress after a delay
        setTimeout(() => {
          setState((prev) => ({ ...prev, imgProgress: 0 }));
        }, 1000);
      } catch (error) {
        window.toastify(error.message, "error");
        setState((prev) => ({ ...prev, imgLoading: false, imgProgress: 0 }));
        onError(error);
      }
    },
    onDrop: (e) => console.log("Dropped files", e.dataTransfer.files),
  };

  const formatFormData = (values) => ({
    ...values,
    date: moment(values?.date?.$d).format("YYYY-MM-DD"),
    time: values?.time?.map((item) => moment(item.$d).format("HH:mm")),
    ticketPrice: Math.floor(Number(values?.ticketPrice) * (1 + state.taxRate)),
    schedule: values?.schedule?.map((item) => ({
      time: moment(item?.time.$d).format("HH:mm"),
      details: item.details,
    })),
    description: state.description,
    image: state.image,
  });

  const onFinish = async (values) => {
    if (!state.image) {
      return window.toastify("Image is required.", "error");
    }

    setState((prev) => ({ ...prev, loading: true }));

    try {
      const body = formatFormData(values);
      const { data } = await updateEvent(id, body);

      setState((prev) => ({ ...prev, image: "" }));
      window.toastify(data.msg, "success");
      navigate("/dashboard/events/myEvents");
    } catch (error) {
      console.log(error);
      handleError(error);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
      getEvent();
    }
  };

  const formatInitialValues = (eventData) => {
    if (!eventData) return {};

    const timeRange = eventData.time
      ? [
          eventData.time[0] ? dayjs(eventData.time[0], "HH:mm") : null,
          eventData.time[1] ? dayjs(eventData.time[1], "HH:mm") : null,
        ]
      : [null, null];

    return {
      ...eventData,
      date: eventData.date ? dayjs(eventData.date) : null,
      time: timeRange,
      schedule: eventData.schedule?.map((item) => ({
        time: dayjs(item.time, "HH:mm"),
        details: item.details,
      })),
      speakers: eventData.speakers?.map((item) => ({
        name: item.name,
        details: item.details,
        profession: item.profession,
        img: item.img,
      })),
    };
  };

  const createSelectOptions = (items) =>
    items?.map((item) => ({ value: item, label: item })) || [];

  const FormInput = ({ label, name, rules, ...props }) => (
    <Form.Item label={label} name={name} rules={rules}>
      <Input size="large" {...props} />
    </Form.Item>
  );

  const FormSelect = ({ label, name, rules, options, ...props }) => (
    <Form.Item label={label} name={name} rules={rules}>
      <Select
        showSearch
        size="large"
        style={{ width: "100%" }}
        optionFilterProp="children"
        filterOption={(input, option) =>
          (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
        }
        options={options}
        {...props}
      />
    </Form.Item>
  );

  const DynamicFormList = ({ name, title, buttonText, renderFields }) => (
    <div className="col-12 col-md-6">
      <label className="mb-2">{title}</label>
      <Form.List name={name}>
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <div
                key={key}
                className="row"
                style={{ display: "flex", marginBottom: 8, paddingTop: 20 }}
              >
                {renderFields(name, restField)}
                <div className="col-12 col-lg-1 pb-2 pb-lg-0">
                  <MinusCircleOutlined onClick={() => remove(name)} />
                </div>
              </div>
            ))}
            <Form.Item className="mt-2">
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
              >
                {buttonText}
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    </div>
  );

  const renderScheduleFields = (name, restField) => (
    <>
      <div className="col-12 col-lg-4">
        <Form.Item
          {...restField}
          name={[name, "time"]}
          rules={[{ required: true, message: "Time is required" }]}
        >
          <TimePicker className="w-100" format={"HH:mm"} />
        </Form.Item>
      </div>
      <div className="col-12 col-lg-7">
        <Form.Item
          {...restField}
          name={[name, "details"]}
          rules={[{ required: true, message: "Details is required" }]}
        >
          <Input placeholder="Enter Details" />
        </Form.Item>
      </div>
    </>
  );

  const renderSpeakerFields = (name, restField) => (
    <>
      <div className="col-12 col-lg-6">
        <Form.Item
          {...restField}
          name={[name, "name"]}
          rules={[{ required: true, message: "Name is required" }]}
        >
          <Input
            placeholder="Enter Name"
            onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
          />
        </Form.Item>
      </div>
      <div className="col-12 col-lg-6">
        <Form.Item {...restField} name={[name, "profession"]}>
          <Input
            placeholder="Enter Profession"
            onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
          />
        </Form.Item>
      </div>
      <div className="col-12 col-lg-11">
        <Form.Item
          {...restField}
          name={[name, "details"]}
          rules={[{ required: true, message: "Details is required" }]}
        >
          <Input
            placeholder="Enter Details"
            onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
          />
        </Form.Item>
      </div>
    </>
  );

  return (
    <>
      <LoadingIndicator loading={state.loading} />
      <div className="container px-2 px-sm-4 py-5" id="add-events">
        <div className="card border-0 shadow-lg py-5 px-4">
          <h2 className="heading-stylling mb-5">Edit Event</h2>
          {state.isLoading ? (
            <div className="my-5 text-center">
              <div className="spinner-grow bg-info"></div>
              <div className="spinner-grow bg-warning mx-3"></div>
              <div className="spinner-grow bg-info"></div>
            </div>
          ) : (
            <Form
              name="dynamic_form_nest_item"
              onFinish={onFinish}
              initialValues={formatInitialValues(state.event)}
              onValuesChange={(e) =>
                setState((prev) => ({ ...prev, eventPrice: e?.ticketPrice }))
              }
              autoComplete="off"
              layout="vertical"
              ref={eventFormRef}
            >
              <div className="row g-3">
                {/* Image Upload Section */}
                <div className="col-12 mb-5">
                  {state.imgLoading ? (
                    <div className="my-3 text-center">
                      <Progress type="circle" percent={state.imgProgress} />
                    </div>
                  ) : (
                    <>
                      {!state.image ? (
                        <Dragger {...uploadProps}>
                          <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                          </p>
                          <p className="ant-upload-text">
                            Click or drag file to this area to upload
                          </p>
                          <p className="ant-upload-hint">
                            Upload any image file. Maximum file size allowed is
                            5MB.
                          </p>
                        </Dragger>
                      ) : (
                        <div className="text-center">
                          <img
                            src={state.image}
                            alt="Event Picture"
                            className="img-fluid"
                            style={{ maxHeight: "400px", objectFit: "contain" }}
                          />
                          <Dragger
                            {...uploadProps}
                            style={{
                              width: "fit-content",
                              background: "#9accc9",
                              margin: "10px auto",
                            }}
                          >
                            Change Picture
                          </Dragger>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Form Fields */}
                <div className="col-12 col-md-6">
                  <FormInput
                    label="Title"
                    name="title"
                    placeholder="Enter Event Title"
                    rules={[
                      { required: true },
                      {
                        max: 100,
                        message: "Title cannot exceed 90 characters",
                      },
                    ]}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <FormSelect
                    label="Category"
                    name="category"
                    placeholder="Select Category"
                    rules={[{ required: true }]}
                    options={createSelectOptions(window?.categories)}
                  />
                </div>
                <div className="col-12 col-md-4">
                  <FormSelect
                    label="Country"
                    name="country"
                    placeholder="Select Country"
                    rules={[{ required: true }]}
                    options={createSelectOptions(window?.countries)}
                  />
                </div>
                <div className="col-12 col-md-4">
                  <FormInput
                    label="City"
                    name="city"
                    placeholder="Enter City"
                    rules={[{ required: true }]}
                  />
                </div>
                <div className="col-12 col-md-4">
                  <FormInput
                    label="Location of Event"
                    name="location"
                    placeholder="Enter Full Address"
                    rules={[{ required: true }]}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <Form.Item
                    label="Select Date"
                    name="date"
                    rules={[{ required: true }]}
                  >
                    <DatePicker
                      className="w-100"
                      placeholder="Select Date"
                      size="large"
                      disabledDate={(current) =>
                        current && current < moment().startOf("day")
                      }
                      format="YYYY-MM-DD"
                    />
                  </Form.Item>
                </div>
                <div className="col-12 col-md-6">
                  <Form.Item
                    label="Time"
                    name="time"
                    rules={[{ required: true }]}
                  >
                    <TimePicker.RangePicker
                      className="w-100"
                      size="large"
                      format={"HH:mm"}
                    />
                  </Form.Item>
                </div>
                <div className="col-12 col-md-6">
                  <FormInput
                    label="Organizer information"
                    name="organizerInfo"
                    placeholder="Enter organizer information"
                  />
                </div>
                <div className="col-12 col-md-6">
                  <FormInput
                    label="Event Rules and Policies"
                    name="eventRules"
                    placeholder="Enter Rules and Policies"
                  />
                </div>

                {/* Dynamic Lists */}
                <DynamicFormList
                  name="schedule"
                  title="Enter schedule"
                  buttonText="Add Time"
                  renderFields={renderScheduleFields}
                />
                <DynamicFormList
                  name="speakers"
                  title="Speakers / Performers"
                  buttonText="Add Speaker / Performer"
                  renderFields={renderSpeakerFields}
                />

                {/* Price and Seats */}
                <div className="col-12 col-md-4">
                  <Form.Item
                    label="Ticket Price"
                    name="ticketPrice"
                    extra={
                      state.eventPrice > 0
                        ? `Ticket price for users will be ${Math.floor(
                            state.eventPrice * (1 + state.taxRate)
                          )}. Adjust if needed.`
                        : ""
                    }
                    rules={[
                      { required: true, message: "Ticket price required" },
                    ]}
                  >
                    <InputNumber
                      className="w-100"
                      size="large"
                      min={1}
                      placeholder="Enter Ticket Price (Rs.)"
                    />
                  </Form.Item>
                </div>
                <div className="col-12 col-md-4">
                  <Form.Item
                    label="Seats"
                    name="seats"
                    rules={[{ required: true, message: "Seats required" }]}
                  >
                    <InputNumber
                      min={1}
                      className="w-100"
                      size="large"
                      placeholder="Enter Total Seats"
                    />
                  </Form.Item>
                </div>
                <div className="col-12 col-md-4">
                  <FormInput
                    label="Event Relevant Tags"
                    name="tags"
                    placeholder="E.g. wedding, seminar"
                  />
                </div>

                {/* Description */}
                <div className="col-12">
                  <label className="mb-3">Event Description</label>
                  <ReactQuill
                    theme="snow"
                    placeholder="Say something about event..."
                    value={state.description}
                    onChange={(html) =>
                      setState((prev) => ({ ...prev, description: html }))
                    }
                  />
                </div>

                <div className="col-12 text-danger">
                  Fields with (*) are required.
                </div>
                <div className="col-12">
                  <Form.Item>
                    <button
                      type="submit"
                      className="button-stylling-1 px-5 ms-auto"
                      disabled={state.loading}
                    >
                      {state.loading ? (
                        <div className="spinner-border spinner-border-sm"></div>
                      ) : (
                        "Submit"
                      )}
                    </button>
                  </Form.Item>
                </div>
              </div>
            </Form>
          )}
        </div>
      </div>
    </>
  );
}
