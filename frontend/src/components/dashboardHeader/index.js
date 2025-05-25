import { Avatar, Input, Layout, Popover } from "antd";
import { useAuthContext } from "context/AuthContext";
import { UserOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import ProfileMenu from "components/Navbar/ProfileMenu";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import "./_dashboardHeader.scss";
import MenuIcon from "@mui/icons-material/Menu";
import EastRoundedIcon from "@mui/icons-material/EastRounded";

export default function Index({ collapsed, setCollapsed }) {
  const { user, isAuthenticated } = useAuthContext();
  const text = <span>{user?.firstName}</span>;
  return (
    <div
      className="py-3 bg-white position-sticky top-0 border-bottom border-2"
      style={{ zIndex: 6, left: 0, right: 0 }}
      id="dashboardHeader-section"
    >
      <div className="container px-4 px-sm-1 px-md-5">
        <ul className="nav d-flex h-100 justify-content-end align-items-center">
          <li className="nav-item me-auto d-flex">
            <button
              className="btn btn-link text-warning"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <EastRoundedIcon /> : <MenuIcon />}
            </button>
            <span className="d-none d-sm-inline">
              <Input
                size="large"
                variant="filled"
                placeholder="Search ..."
                prefix={<SearchOutlinedIcon className="text-secondary" />}
              />
            </span>
          </li>
          <li className="nav-item me-3">
            <a className="nav-link text-secondary">
              <NotificationsNoneOutlinedIcon />
            </a>
          </li>
          <li className="me-0 me-sm-2 me-md-0 ">
            {isAuthenticated ? (
              <Popover
                placement="bottomRight"
                title={text}
                content={<ProfileMenu />}
              >
                <Avatar
                  size="large"
                  style={{ cursor: "pointer" }}
                  src={user?.image}
                  icon={<UserOutlined />}
                />
              </Popover>
            ) : (
              <Link className="button-stylling-1 px-4" to="/auth/login">
                Login
              </Link>
            )}
          </li>
        </ul>
      </div>
    </div>
  );
}
