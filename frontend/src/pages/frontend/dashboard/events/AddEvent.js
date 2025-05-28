import React, { useEffect, useRef, useState } from "react";
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
  UploadOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { addEvent } from "services/event";
import LoadingIndicator from "components/LoadingIndicator";
import ReactQuill from "react-quill";
import { uploadToCloudinary } from "services/cloudinary";

const { Dragger } = Upload;

export default function AddEvent() {
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [eventPrice, setEventPrice] = useState(null);
  const [taxRate] = useState(0.2);
  const [imgProgress, setImgProgress] = useState(0);
  const [imgLoading, setImgLoading] = useState(false);
  const eventFormRef = useRef();

  useEffect(() => window.scroll(0, 0), []);

  const uploadProps = {
    name: "file",
    multiple: false,
    fileList: [],
    customRequest: async ({ file, onSuccess, onError }) => {
      if (!file.type.startsWith("image/")) {
        window.toastify("Please select an image file", "error");
        return onError(new Error("Invalid file type"));
      }
      if (file.size > 5 * 1024 * 1024) {
        window.toastify("Image size should be less than 5MB", "error");
        return onError(new Error("File too large"));
      }

      try {
        setImgLoading(true);
        setImgProgress(25);
        const uploadResult = await uploadToCloudinary(file, "events");
        setImgProgress(75);
        setImage(uploadResult.url);
        setImgProgress(100);
        onSuccess(uploadResult);
      } catch (error) {
        window.toastify(error.message, "error");
        onError(error);
      } finally {
        setImgLoading(false);
        setTimeout(() => setImgProgress(0), 1000);
      }
    },
  };

  const onFinish = async (values) => {
    if (!image) return window.toastify("Image is required.", "error");

    const formattedDate = moment(values?.date?.$d).format("YYYY-MM-DD");
    const formattedTime = values?.time?.map((item) =>
      moment(item.$d).format("HH:mm")
    );
    const ticketPrice = Math.floor(Number(values?.ticketPrice) * (1 + taxRate));
    const formattedSchedule = values?.schedule?.map((item) => ({
      time: moment(item.time.$d).format("HH:mm"),
      details: item.details,
    }));

    const updatedSpeakers = await Promise.all(
      values?.speakers?.map(async (item) => {
        const file = item.img?.file;
        if (
          file &&
          (file.type === "image/png" || file.type === "image/jpeg") &&
          file.size <= 1024 * 1024
        ) {
          try {
            const uploadResult = await uploadToCloudinary(file, "speakers");
            return {
              ...item,
              img: uploadResult.url,
              imgPublicId: uploadResult.publicId,
            };
          } catch (error) {
            window.toastify(
              `Failed to upload speaker image: ${error.message}`,
              "error"
            );
          }
        }
        return item;
      }) || []
    );

    const body = {
      ...values,
      date: formattedDate,
      time: formattedTime,
      description,
      schedule: formattedSchedule,
      ticketPrice,
      image,
      speakers: updatedSpeakers,
    };

    setLoading(true);
    try {
      const { data } = await addEvent(body);
      window.toastify(data.msg, "success");
      eventFormRef.current.resetFields();
      setDescription("");
      setImage("");
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.msg ||
        "Some error occurred";
      window.toastify(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const preventEnter = (e) => e.key === "Enter" && e.preventDefault();
  const filterOption = (input, option) =>
    (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  const FormField = ({ label, name, rules, children, extra, ...props }) => (
    <Form.Item label={label} name={name} rules={rules} extra={extra} {...props}>
      {children}
    </Form.Item>
  );

  const renderDynamicList = (name, label, buttonText, renderFields) => (
    <div className="col-12 col-md-6">
      <label className="mb-2">{label}</label>
      <Form.List name={name}>
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <div
                key={key}
                className="row"
                style={{ marginBottom: 8, paddingTop: 20 }}
              >
                {renderFields(name, restField, remove)}
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

  return (
    <>
      <LoadingIndicator loading={loading} />
      <div className="container px-2 px-sm-4 py-5" id="add-events">
        <div className="card border-0 shadow-lg py-5 px-4">
          <h2 className="heading-stylling mb-5">Add Event</h2>
          <Form
            name="dynamic_form_nest_item"
            onFinish={onFinish}
            onValuesChange={(e) => setEventPrice(e?.ticketPrice)}
            autoComplete="off"
            layout="vertical"
            ref={eventFormRef}
          >
            <div className="row g-3">
              {/* Image Upload */}
              <div className="col-12 mb-5">
                {imgLoading ? (
                  <div className="my-3 text-center">
                    <Progress type="circle" percent={imgProgress} />
                  </div>
                ) : image ? (
                  <div className="text-center">
                    <img
                      src={image}
                      alt="Event"
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
                ) : (
                  <Dragger {...uploadProps}>
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">
                      Click or drag file to this area to upload
                    </p>
                    <p className="ant-upload-hint">
                      Upload any image file. Maximum file size allowed is 5MB.
                    </p>
                  </Dragger>
                )}
              </div>

              {/* Basic Fields */}
              <div className="col-12 col-md-6">
                <FormField
                  label="Title"
                  name="title"
                  rules={[
                    { required: true },
                    { max: 100, message: "Title cannot exceed 90 characters" },
                  ]}
                >
                  <Input
                    onKeyDown={preventEnter}
                    placeholder="Enter Event Title"
                    size="large"
                  />
                </FormField>
              </div>
              <div className="col-12 col-md-6">
                <FormField
                  label="Category"
                  name="category"
                  rules={[{ required: true }]}
                >
                  <Select
                    showSearch
                    size="large"
                    placeholder="Select Category"
                    filterOption={filterOption}
                    options={window?.categories?.map((item, index) => ({
                      key: `${item}-${index}`, // Added key for each option
                      value: item,
                      label: item,
                    }))}
                  />
                </FormField>
              </div>

              {/* Location Fields */}
              {[
                {
                  label: "Country",
                  name: "country",
                  options: window?.countries,
                  col: "col-12 col-md-4",
                },
                {
                  label: "City",
                  name: "city",
                  type: "input",
                  col: "col-12 col-md-4",
                },
                {
                  label: "Location of Event",
                  name: "location",
                  placeholder: "Enter Full Address",
                  col: "col-12 col-md-4",
                },
              ].map(({ label, name, options, type, placeholder, col }) => (
                <div key={name} className={col}>
                  <FormField
                    label={label}
                    name={name}
                    rules={[{ required: true }]}
                  >
                    {options ? (
                      <Select
                        showSearch
                        size="large"
                        placeholder={`Select ${label}`}
                        filterOption={filterOption}
                        options={options?.map((item, index) => ({
                          key: `${item}-${index}`, // Added key for each option
                          value: item,
                          label: item,
                        }))}
                      />
                    ) : (
                      <Input
                        onKeyDown={preventEnter}
                        placeholder={placeholder || `Enter ${label}`}
                        size="large"
                      />
                    )}
                  </FormField>
                </div>
              ))}

              {/* Date/Time Fields */}
              <div className="col-12 col-md-6">
                <FormField
                  label="Select Date"
                  name="date"
                  rules={[{ required: true }]}
                >
                  <DatePicker
                    className="w-100"
                    onKeyDown={preventEnter}
                    placeholder="Select Date"
                    size="large"
                    disabledDate={(current) =>
                      current && current < moment().startOf("day")
                    }
                    format="YYYY-MM-DD"
                  />
                </FormField>
              </div>
              <div className="col-12 col-md-6">
                <FormField
                  label="Time"
                  name="time"
                  rules={[{ required: true }]}
                >
                  <TimePicker.RangePicker
                    className="w-100"
                    onKeyDown={preventEnter}
                    size="large"
                    format="HH:mm"
                  />
                </FormField>
              </div>

              {/* Optional Fields */}
              {[
                {
                  label: "Organizer information",
                  name: "organizerInfo",
                  placeholder: "Enter organizer information",
                },
                {
                  label: "Event Rules and Policies",
                  name: "eventRules",
                  placeholder: "Enter Rules and Policies",
                },
              ].map(({ label, name, placeholder }) => (
                <div key={name} className="col-12 col-md-6">
                  <FormField label={label} name={name}>
                    <Input
                      onKeyDown={preventEnter}
                      placeholder={placeholder}
                      size="large"
                    />
                  </FormField>
                </div>
              ))}

              {/* Schedule List */}
              {renderDynamicList(
                "schedule",
                "Enter schedule",
                "Add Time",
                (name, restField, remove) => (
                  <>
                    <div className="col-12 col-lg-4">
                      <FormField
                        {...restField}
                        name={[name, "time"]}
                        rules={[
                          { required: true, message: "Time is required" },
                        ]}
                      >
                        <TimePicker
                          className="w-100"
                          onKeyDown={preventEnter}
                          format="HH:mm"
                        />
                      </FormField>
                    </div>
                    <div className="col-12 col-lg-7">
                      <FormField
                        {...restField}
                        name={[name, "details"]}
                        rules={[
                          { required: true, message: "Details is required" },
                        ]}
                      >
                        <Input
                          placeholder="Enter Details"
                          onKeyDown={preventEnter}
                        />
                      </FormField>
                    </div>
                    <div className="col-12 col-lg-1 pb-2 pb-lg-0">
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    </div>
                  </>
                )
              )}

              {/* Speakers List */}
              {renderDynamicList(
                "speakers",
                "Speakers / Performers",
                "Add Speaker / Performer",
                (name, restField, remove) => (
                  <>
                    <div className="col-12 col-lg-4">
                      <FormField {...restField} name={[name, "img"]}>
                        <Upload beforeUpload={() => false} className="w-100">
                          <button
                            className="btn btn-light border w-100"
                            type="button"
                          >
                            <UploadOutlined /> Image
                          </button>
                        </Upload>
                      </FormField>
                    </div>
                    {[
                      {
                        name: [name, "name"],
                        placeholder: "Enter Name",
                        required: true,
                      },
                      {
                        name: [name, "profession"],
                        placeholder: "Enter Profession",
                      },
                    ].map(({ name: fieldName, placeholder, required }) => (
                      <div key={fieldName[1]} className="col-12 col-lg-4">
                        <FormField
                          {...restField}
                          name={fieldName}
                          rules={
                            required
                              ? [
                                  {
                                    required: true,
                                    message: `${fieldName[1]} is required`,
                                  },
                                ]
                              : []
                          }
                        >
                          <Input
                            placeholder={placeholder}
                            onKeyDown={preventEnter}
                          />
                        </FormField>
                      </div>
                    ))}
                    <div className="col-12 col-lg-11">
                      <FormField
                        {...restField}
                        name={[name, "details"]}
                        rules={[
                          { required: true, message: "Details is required" },
                        ]}
                      >
                        <Input
                          placeholder="Enter Details"
                          onKeyDown={preventEnter}
                        />
                      </FormField>
                    </div>
                    <div className="col-12 col-lg-1 pb-2 pb-lg-0">
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    </div>
                  </>
                )
              )}

              {/* Price/Seats/Tags */}
              {[
                {
                  label: "Ticket Price",
                  name: "ticketPrice",
                  type: "number",
                  extra:
                    eventPrice > 0
                      ? `Ticket price for users will be ${Math.floor(
                          eventPrice * (1 + taxRate)
                        )}. Adjust if needed.`
                      : "",
                  placeholder: "Enter Ticket Price (Rs.)",
                },
                {
                  label: "Seats",
                  name: "seats",
                  type: "number",
                  placeholder: "Enter Total Seats",
                },
                {
                  label: "Event Relevant Tags",
                  name: "tags",
                  placeholder: "E.g. wedding, seminar",
                },
              ].map(({ label, name, type, extra, placeholder }) => (
                <div key={name} className="col-12 col-md-4">
                  <FormField
                    label={label}
                    name={name}
                    extra={extra}
                    rules={
                      name !== "tags"
                        ? [{ required: true, message: `${label} required` }]
                        : []
                    }
                  >
                    {type === "number" ? (
                      <InputNumber
                        className="w-100"
                        size="large"
                        min={1}
                        onKeyDown={preventEnter}
                        placeholder={placeholder}
                      />
                    ) : (
                      <Input
                        className="w-100"
                        size="large"
                        onKeyDown={preventEnter}
                        placeholder={placeholder}
                      />
                    )}
                  </FormField>
                </div>
              ))}

              {/* Description */}
              <div className="col-12">
                <label className="mb-3">Event Description</label>
                <ReactQuill
                  theme="snow"
                  placeholder="Say something about event..."
                  value={description}
                  onChange={setDescription}
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
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="spinner-border spinner-border-sm"></div>
                    ) : (
                      "Submit"
                    )}
                  </button>
                </Form.Item>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </>
  );
}