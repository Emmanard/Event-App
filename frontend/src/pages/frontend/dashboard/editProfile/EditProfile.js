import { Avatar, Input, Menu, Progress } from "antd";
import "./_editProfile.scss";
import { UserOutlined } from "@ant-design/icons";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import { useEffect, useState } from "react";
import PersonalDetails from "./PersonalDetails";
import ChangePassword from "./ChangePassword";
import {  updateUser } from "services/auth";
import LoadingIndicator from "components/LoadingIndicator";
import { useAuthContext } from "context/AuthContext";
import { uploadToCloudinary, deleteFromCloudinary } from "services/cloudinary";

const initialLinks = {
  facebookLink: "",
  instagramLink: "",
  tiktokLink: "",
  pinterestLink: "",
  twitterLink: "",
  webLink: "",
};

export default function EditProfile() {
  const [addLink, setAddLink] = useState(false);
  const [current, setCurrent] = useState("1");
  const [links, setLinks] = useState(initialLinks);
  const [loading, setLoading] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const [imgProgress, setImgProgress] = useState(0);
  const { toggle, setToggle, user } = useAuthContext();

  const onClick = (e) => {
    setCurrent(e.key);
  };

  useEffect(() => {
    setLinks({
      ...links,
      facebookLink: user?.facebookLink,
      instagramLink: user?.instagramLink,
      tiktokLink: user?.tiktokLink,
      pinterestLink: user?.pinterestLink,
      twitterLink: user?.twitterLink,
      webLink: user?.webLink,
    });
    if (links.webLink) {
      setAddLink(true);
    }
  }, [user]);

  const handleLinksChange = (e) => {
    setLinks((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  // handleSubmitLinks - No changes needed
  const handleSubmitLinks = async (e) => {
    e.preventDefault();
    const facebookRegex = /^(https?:\/\/)?(www\.)?facebook\.com\/.+$/i;
    const twitterRegex =
      /^(https?:\/\/)?(www\.)?twitter\.com\/(#!\/)?[a-zA-Z0-9_]+$/i;
    const instagramRegex =
      /^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9_]+\/?$/i;
    const tiktokRegex = /^(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@(.*?)\/?$/i;
    const pinterestRegex =
      /^(https?:\/\/)?(www\.)?pinterest\.com\/[a-zA-Z0-9_]+\/?\?actingBusinessId=\d+$/i;

    if (links.facebookLink !== "" && !facebookRegex.test(links.facebookLink)) {
      return window.toastify(
        "The link you provided does not appear to be associated with Facebook",
        "error"
      );
    }
    if (
      links.instagramLink !== "" &&
      !instagramRegex.test(links.instagramLink)
    ) {
      return window.toastify(
        "The link you provided does not appear to be associated with Instagram",
        "error"
      );
    }
    if (links.tiktokLink !== "" && !tiktokRegex.test(links.tiktokLink)) {
      return window.toastify(
        "The link you provided does not appear to be associated with TikTok",
        "error"
      );
    }
    if (
      links.pinterestLink !== "" &&
      !pinterestRegex.test(links.pinterestLink)
    ) {
      return window.toastify(
        "The link you provided does not appear to be associated with Pinterest",
        "error"
      );
    }
    if (links.twitterLink !== "" && !twitterRegex.test(links.twitterLink)) {
      return window.toastify(
        "The link you provided does not appear to be associated with Twitter",
        "error"
      );
    }

    setLoading(true);
    try {
      let { data } = await updateUser(user?._id, links);
      console.log(data);
      window.toastify(data.msg, "success");
      setToggle(!toggle);
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

  // Updated image upload handler for Cloudinary
  const handleImageChange = async (e) => {
    const image = e.target.files[0];
    let results = window.verifyImageSize(image);

    if (results) {
      setImgLoading(true);
      setImgProgress(20);

      try {
        // Delete old image if it exists and is from Cloudinary
        if (user?.image?.includes("cloudinary.com") && user?.imagePublicId) {
          await deleteFromCloudinary(user.imagePublicId);
        }

        setImgProgress(50);

        // Upload new image to Cloudinary
        const uploadResult = await uploadToCloudinary(image, "users");

        setImgProgress(80);

        // Update user profile with new image
        await uploadProfileImg(uploadResult.url, uploadResult.publicId);

        setImgProgress(100);
      } catch (error) {
        window.toastify(error.message, "error");
      } finally {
        setImgLoading(false);
        setImgProgress(0);
      }
    }
  };

  const uploadProfileImg = async (imageUrl, publicId) => {
    try {
      let { data } = await updateUser(user?._id, {
        image: imageUrl,
        imagePublicId: publicId, // Store publicId for future deletion
      });

      window.toastify(data.msg, "success");
      setToggle(!toggle);
    } catch (error) {
      let msg = "Some error occured";
      let { status, data } = error.response;
      if (status == 400 || status == 401 || status == 500 || status == 413) {
        msg = data.message || data.msg;
        window.toastify(msg, "error");
      }
    }
  };

  const items = [
    {
      label: "Personal Details",
      key: 1,
    },
    {
      label: "Change Password",
      key: 2,
    },
  ];

  return (
    <>
      <LoadingIndicator loading={loading} />

      <div
        className="container-fluid bg-info"
        id="edit-profile-section-dashboard"
      ></div>

      <div className="container-fluid" id="edit-profile">
        <div className="container px-3">
          <div className="row gx-4">
            <div className="col-12 col-lg-3">
              <div className="card rounded-1 p-3 py-4 border-0 shadow d-flex align-items-center justify-content-center">
                <div id="profileImage">
                  {imgLoading ? (
                    <div className="text-center">
                      <Progress
                        type="circle"
                        percent={Math.round(imgProgress)}
                      />
                    </div>
                  ) : (
                    <Avatar
                      size={{
                        xs: 80,
                        sm: 82,
                        md: 98,
                        lg: 100,
                        xl: 110,
                        xxl: 120,
                      }}
                      src={user?.image}
                      icon={<UserOutlined />}
                    />
                  )}
                  <label
                    className="btn btn-info rounded-circle p-2"
                    htmlFor="inputGroupFile01"
                  >
                    <CameraAltOutlinedIcon fontSize="small" />
                  </label>
                </div>
                <input
                  type="file"
                  className="form-control d-none"
                  id="inputGroupFile01"
                  name="image"
                  accept="image/png, image/jpeg"
                  onChange={handleImageChange}
                />
                <h6 className="mt-4">{user?.fullName}</h6>
                <p className="text-secondary">{user?.profession}</p>
              </div>

              {/* portfolio links - No changes needed */}
              <div className="card rounded-1 p-3 py-4 border-0 shadow mt-4">
                <div className="row">
                  <div className="col">
                    <h6 className="fw-bold ">Portfolio</h6>
                  </div>
                  {!addLink && (
                    <div className="col text-end">
                      <button
                        className="btn btn-sm btn-light px-3"
                        onClick={() => setAddLink(true)}
                      >
                        + Add
                      </button>
                    </div>
                  )}
                </div>
                <hr />
                <form onSubmit={handleSubmitLinks}>
                  <div className="row">
                    <div className="col-3 d-flex align-items-center">
                      <i
                        className="bx bxl-facebook-circle"
                        style={{ color: "#1974ec", fontSize: "xx-large" }}
                      ></i>
                    </div>
                    <div className="col-9">
                      <Input
                        placeholder="Add link"
                        name="facebookLink"
                        size="large"
                        onChange={handleLinksChange}
                        value={links?.facebookLink}
                      />
                    </div>
                  </div>
                  <div className="row mt-3">
                    <div className="col-3 d-flex align-items-center">
                      <i
                        className="bx bxl-instagram-alt"
                        style={{ color: "#f70667", fontSize: "xx-large" }}
                      ></i>
                    </div>
                    <div className="col-9">
                      <Input
                        placeholder="Add link"
                        name="instagramLink"
                        size="large"
                        onChange={handleLinksChange}
                        value={links?.instagramLink}
                      />
                    </div>
                  </div>
                  <div className="row mt-3">
                    <div className="col-3 d-flex align-items-center">
                      <i
                        className="bx bxl-tiktok"
                        style={{ color: "#000", fontSize: "xx-large" }}
                      ></i>
                    </div>
                    <div className="col-9">
                      <Input
                        placeholder="Add link"
                        name="tiktokLink"
                        size="large"
                        onChange={handleLinksChange}
                        value={links?.tiktokLink}
                      />
                    </div>
                  </div>
                  <div className="row mt-3">
                    <div className="col-3 d-flex align-items-center">
                      <i
                        className="bx bxl-pinterest"
                        style={{ color: "#df0022", fontSize: "xx-large" }}
                      ></i>
                    </div>
                    <div className="col-9">
                      <Input
                        placeholder="Add link"
                        name="pinterestLink"
                        size="large"
                        onChange={handleLinksChange}
                        value={links?.pinterestLink}
                      />
                    </div>
                  </div>
                  <div className="row mt-3">
                    <div className="col-3 d-flex align-items-center">
                      <i
                        className="bx bxl-twitter"
                        style={{ color: "#1c96e8", fontSize: "xx-large" }}
                      ></i>
                    </div>
                    <div className="col-9">
                      <Input
                        placeholder="Add link"
                        name="twitterLink"
                        size="large"
                        onChange={handleLinksChange}
                        value={links?.twitterLink}
                      />
                    </div>
                  </div>
                  {addLink && (
                    <div className="row mt-3">
                      <div className="col-3 d-flex align-items-center">
                        <i
                          className="bx bx-globe"
                          style={{ color: "#000", fontSize: "xx-large" }}
                        ></i>
                      </div>
                      <div className="col-9">
                        <Input
                          placeholder="Add link"
                          name="webLink"
                          size="large"
                          onChange={handleLinksChange}
                          value={links?.webLink}
                        />
                      </div>
                    </div>
                  )}
                  <div className="row mt-4">
                    <div className="col text-end">
                      <button className="button-stylling px-3 py-2 rounded bg-info border-0 ms-auto">
                        <span className="text">Update</span>
                        <span>Update</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            <div className="col-12 col-lg-9 mt-4 mt-lg-0">
              <div className="card rounded-1 px-3  border-0 shadow ">
                <Menu
                  onClick={onClick}
                  selectedKeys={[current]}
                  className="pt-1"
                  mode="horizontal"
                  items={items}
                />
                {current === "1" && <PersonalDetails />}
                {current === "2" && <ChangePassword />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
