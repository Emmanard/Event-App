import React, { useState } from 'react'
import { Input, Select } from 'antd'
import { useAuthContext } from 'context/AuthContext';
import LoadingIndicator from 'components/LoadingIndicator';
import { updateUser } from 'services/auth';
import ReactQuill from 'react-quill';

export default function PersonalDetails() {
  const { TextArea } = Input;
  const { user, setToggle, toggle } = useAuthContext();
  const [firstName, setFirstName] = useState(user?.firstName ? user?.firstName : "")
  const [lastName, setLastName] = useState(user?.lastName ? user?.lastName : "")
  const [idCard, setIdCard] = useState(user?.idCard ? user?.idCard : "")
  const [phone, setPhone] = useState(user?.phone ? user?.phone : "")
  const [profession, setProfession] = useState(user?.profession ? user?.profession : "")
  const [country, setCountry] = useState(user?.country ? user?.country : "")
  const [city, setCity] = useState(user?.city ? user?.city : "")
  const [description, setDescription] = useState(user?.description ? user?.description : "")
  const [loading, setLoading] = useState(false)
  // const [setDescription, setDescription] = useState('');

  const handleChange = (html) => {
    setDescription(html);
  };

  const filterOption = (input, option) =>
    (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

  const handleSubmit = async (e) => {
    e.preventDefault();
    let fullName = `${firstName} ${lastName}`;

    let body = {
      firstName, lastName, fullName, idCard, phone, profession, country, city, description
    }

    setLoading(true)
    try {
      let { data } = await updateUser(user?._id, body);
      window.toastify(data.msg, "success");
      setToggle(!toggle)
    } catch (error) {
      let msg = "Some error occured";
      let { status, data } = error.response;
      if (status == 400 || status == 401 || status == 500) {
        msg = data.message;
        window.toastify(msg, "error");
      }
    } finally {
      setLoading(false)
    }
  }
  return (
    <>
      <LoadingIndicator loading={loading} />

      <div className='container'>
        <form onSubmit={handleSubmit}>
          <div className="row g-3 g-sm-4 py-5">
            <div className="col-12 col-md-6">
              <label htmlFor="userId" className='mb-2'>User ID</label>
              <Input placeholder="Your user id" id='userId' value={user?.userID} disabled size='large' />
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="email" className='mb-2'>Email Address</label>
              <Input placeholder="Your email" id='email' value={user?.email} disabled size='large' />
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="firstName" className='mb-2'>First Name</label>
              <Input placeholder="Enter your first name" value={firstName} onChange={e => setFirstName(e.target.value)} id='firstName' size='large' />
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="lastName" className='mb-2'>Last Name</label>
              <Input placeholder="Enter your last name" value={lastName} onChange={e => setLastName(e.target.value)} id='lastName' size='large' />
            </div>

            <div className="col-12 col-md-6">
              <label htmlFor="phone" className='mb-2'>Phone Number</label>
              <Input placeholder="Enter your phone number" value={phone} onChange={e => setPhone(e.target.value)} id='phone' size='large' />
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="profession" className='mb-2'>Profession</label>
              <Input placeholder="Enter your profession" value={profession} onChange={e => setProfession(e.target.value)} id='profession' size='large' />
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="country" className='mb-2'>Country</label>
              <Select
                showSearch
                size='large'
                id='country'
                value={country}
                onChange={e => setCountry(e)}
                style={{ width: "100%" }}
                placeholder="Select country"
                optionFilterProp="children"
                filterOption={filterOption}
                options={window?.countries?.map((item, i) => {
                  return {
                    value: item,
                    label: item,
                  }
                })}
              />
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="city" className='mb-2'>City</label>
              <Input placeholder="Enter your city" value={city} onChange={e => setCity(e.target.value)} id='city' size='large' />
            </div>

            <div className="col-12 ">
              <label htmlFor="description" className='mb-2'>Description</label>
              {/* <TextArea
                showCount
                id='description'
                value={description}
                onChange={e => setDescription(e.target.value)}
                maxLength={1000}
                autoSize
                placeholder="Enter your description..."
                style={{
                  minHeight: 140
                }}
              /> */}

              <ReactQuill
                theme="snow" // Specify Quill theme
                value={description}
                onChange={handleChange}
              />
            </div>
            <div className="col-12 mt-5">
              <button className='button-stylling-1 px-5 ms-auto'>Update</button>
            </div>
          </div>
        </form>
      </div>
    </>
  )
}
