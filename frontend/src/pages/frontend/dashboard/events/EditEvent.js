import React, { useEffect, useState } from 'react';
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  TimePicker,
  Upload,
} from 'antd';
import dayjs from 'dayjs';
import { UploadOutlined } from '@ant-design/icons';
import { uploadToCloudinary, deleteFromCloudinary } from 'config/Cloudinary';

const { Option } = Select;
const max_image_width = 900;
const max_image_height = 500;

const EditEvent = ({ initialEventData, onSubmit }) => {
  const [form] = Form.useForm();
  const [event, setEvent] = useState(initialEventData || {});
  const [image, setImage] = useState(event?.image || '');
  const [imgLoading, setImgLoading] = useState(false);
  const [imgProgress, setImgProgress] = useState(0);

  useEffect(() => {
    if (initialEventData) {
      form.setFieldsValue({
        ...initialEventData,
        date: initialEventData.date ? dayjs(initialEventData.date) : null,
        time: initialEventData.time
          ? initialEventData.time.map((t) => dayjs(t, 'HH:mm'))
          : [],
      });
      setImage(initialEventData.image || '');
    }
  }, [initialEventData, form]);

  const handleImageUpload = async ({ file, onSuccess, onError }) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = async () => {
      const width = img.width;
      const height = img.height;

      if (width === max_image_width && height === max_image_height) {
        try {
          setImgLoading(true);
          setImgProgress(0);

          if (event?.publicId) {
            await deleteFromCloudinary(event.publicId);
          }

          const result = await uploadToCloudinary(file, 'events');
          setImage(result.url);
          setEvent((prev) => ({ ...prev, publicId: result.publicId }));
          onSuccess(result);
        } catch (error) {
          window.toastify(error.message, 'error');
          onError(error);
        } finally {
          setImgLoading(false);
        }
      } else {
        window.toastify(
          `Image must be ${max_image_width}x${max_image_height}px. Yours is ${width}x${height}px.`,
          'error'
        );
        onError();
      }
    };
  };

  const handleFinish = (values) => {
    const formattedDate = values.date ? values.date.format('YYYY-MM-DD') : '';
    const formattedTimes = values.time
      ? values.time.map((t) => t.format('HH:mm'))
      : [];

    const payload = {
      ...values,
      date: formattedDate,
      time: formattedTimes,
      image,
      publicId: event.publicId,
    };

    onSubmit(payload);
  };

  const uploadProps = {
    name: 'file',
    customRequest: handleImageUpload,
    showUploadList: false,
  };

  return (
    <Form
      layout="vertical"
      form={form}
      onFinish={handleFinish}
      initialValues={{
        ticketPrice: 0,
      }}
    >
      <Form.Item name="title" label="Event Title" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="description" label="Description" rules={[{ required: true }]}>
        <Input.TextArea rows={4} />
      </Form.Item>

      <Form.Item name="category" label="Category" rules={[{ required: true }]}>
        <Select>
          <Option value="music">Music</Option>
          <Option value="sports">Sports</Option>
          <Option value="tech">Tech</Option>
        </Select>
      </Form.Item>

      <Form.Item name="date" label="Date" rules={[{ required: true }]}>
        <DatePicker />
      </Form.Item>

      <Form.Item name="time" label="Time" rules={[{ required: true }]}>
        <TimePicker.RangePicker format="HH:mm" />
      </Form.Item>

      <Form.Item name="ticketPrice" label="Ticket Price">
        <InputNumber min={0} prefix="₦" style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item label="Event Banner">
        <Upload {...uploadProps}>
          <Button icon={<UploadOutlined />} loading={imgLoading}>
            {image ? 'Change Image' : 'Upload Image'}
          </Button>
        </Upload>
        {image && (
          <img
            src={image}
            alt="Event Banner"
            style={{ marginTop: 10, width: 300, height: 167 }}
          />
        )}
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={imgLoading}>
            Update Event
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default EditEvent;
