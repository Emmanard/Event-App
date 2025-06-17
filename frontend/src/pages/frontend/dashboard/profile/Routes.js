import React, { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import Overview from "pages/frontend/dashboard/profile/Overview";
import MyEvents from "../events/MyEvents";
import ProfileHeader from "./ProfileHeader";
import { getUser } from "services/auth";
import LoadingIndicator from "components/LoadingIndicator";

export default function Index() {
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    setLoading(true);
    try {
      let { data } = await getUser();
      setUserData(data?.data);
    } catch (error) {
      let msg = "Some error occured";
      let { status, data } = error.response;
      if (status == 400 || status == 401 || status == 500) {
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

      <ProfileHeader userData={userData} />
      <Routes>
        <Route path="/" element={<Overview userData={userData} />} />
        <Route path="events" element={<MyEvents />} />
        {/* Use existing MyEvents component */}
      </Routes>
    </>
  );
}
