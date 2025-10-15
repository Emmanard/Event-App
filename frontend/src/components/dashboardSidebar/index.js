import React, { useEffect, useState } from 'react'
import { Layout, Menu } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import CottageOutlinedIcon from '@mui/icons-material/CottageOutlined';
import CelebrationOutlinedIcon from '@mui/icons-material/CelebrationOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import './_dashboardSidebar.scss';
import { useAuthContext } from 'context/AuthContext';

const { Sider } = Layout;

export default function Index({ collapsed }) {
    const navigate = useNavigate();
    const { user } = useAuthContext();
    const [selectedKey, setSelectedKey] = useState("/");
    const menuItemsOrganizer = [
        {
            icon: <CottageOutlinedIcon className={collapsed ? 'fs-5' : 'fs-4'} />,
            label: "Home",
            key: "/"
        },
        {
            icon: <PersonOutlineOutlinedIcon className={collapsed ? 'fs-5' : 'fs-4'} />,
            label: "Profile",
            key: "/dashboard/profile"
        },
        {
            icon: <CelebrationOutlinedIcon className={collapsed ? 'fs-5' : 'fs-4'} />,
            label: "Events",
            key: "/dashboard/events",
            children: [
                {
                    icon: <AddOutlinedIcon className={collapsed ? 'fs-5' : 'fs-4'} />,
                    label: "Add Event",
                    key: "/dashboard/events/add"
                },
                {
                    icon: <ListAltOutlinedIcon className={collapsed ? 'fs-5' : 'fs-4'} />,
                    label: "My Events",
                    key: "/dashboard/events/myEvents"
                }
            ]
        },
    ];

    const menuItemsAttandee = [
        {
            icon: <CottageOutlinedIcon className={collapsed ? 'fs-5' : 'fs-4'} />,
            label: "Home",
            key: "/"
        },
        {
            icon: <PersonOutlineOutlinedIcon className={collapsed ? 'fs-5' : 'fs-4'} />,
            label: "Profile",
            key: "/dashboard/profile"
        },
    ];

    const items =
        (Object.keys(user).length > 0 && user?.role === "organizer")
            ? menuItemsOrganizer?.map(data => ({
                key: data.key,
                icon: data.icon,
                label: data.label,
                children: data?.children?.map(child => ({
                    key: child.key,
                    label: child.label,
                    icon: child.icon
                }))
            }))
            : menuItemsAttandee?.map(data => ({
                key: data.key,
                icon: data.icon,
                label: data.label,
                children: data?.children?.map(child => ({
                    key: child.key,
                    label: child.label,
                    icon: child.icon
                }))
            }));

    const handleMenu = (item) => {
        navigate(item.key);
    }

    useEffect(() => {
        let currentPath = window.location.pathname;

        // Find the menu item that matches the current URL
        let selectedMenuItem =
            user?.role === "organizer"
                ? menuItemsOrganizer.find(item => {
                    if (item.key === "/") {
                        return currentPath === item.key;
                    } else {
                        return currentPath.startsWith(item.key);
                    }
                })
                : menuItemsAttandee.find(item => {
                    if (item.key === "/") {
                        return currentPath === item.key;
                    } else {
                        return currentPath.startsWith(item.key);
                    }
                });

        // If a menu item with children is selected, find the appropriate child item
        if (selectedMenuItem && selectedMenuItem.children && selectedMenuItem.children.length > 0) {
            let selectedChildItem = selectedMenuItem.children.find(child => currentPath.startsWith(child.key));
            setSelectedKey(selectedChildItem ? selectedChildItem.key : selectedMenuItem.key);
        } else {
            setSelectedKey(selectedMenuItem ? selectedMenuItem.key : "");
        }
    }, [selectedKey, window.location.pathname])


    // const handleMenu = (item) => {
    //     let selected = menuItems.filter(data => data.key == item.key);
    //     if (selected.length === 0) {
    //         selected = menuItems?.filter(data => {
    //             return data?.children?.filter(child => child.key == item.key)
    //         });
    //         console.log(selected);
    //     }
    //     navigate(selected?.length > 0 ? selected[0]?.key : "")

    // }
    return (
        <>
            <Sider
                breakpoint="md"
                // collapsedWidth="0"
                trigger={null}
                collapsible
                collapsed={collapsed}
                theme='light'
                width={250}
                className='d-none d-sm-block bg-warning dashboard-sidebar'
            >
                <div className={`text-center d-flex align-items-center justify-content-center border-bottom `} style={{ minHeight: 76.6, visibility: collapsed ? "hidden" : "visible" }}>
                    <Link className="navbar-brand event-wave-logo fs-2" to="/">EventWave</Link>
                </div>
                <Menu theme="light" mode="inline" className='bg-warning my-4' onClick={handleMenu} selectedKeys={selectedKey} defaultSelectedKeys={[1]} items={items} />
            </Sider>
            <Sider
                breakpoint="md"
                collapsedWidth="0"
                trigger={null}
                collapsible
                collapsed={collapsed}
                theme='light'
                className='d-block d-sm-none bg-warning dashboard-sidebar'
            >
                <div className={`text-center d-flex align-items-center justify-content-center border-bottom`} style={{ minHeight: 76.6, visibility: collapsed ? "hidden" : "visible" }}>
                    <Link className="navbar-brand event-wave-logo fs-2" to="/">EventWave</Link>
                </div>
                <Menu theme="light" mode="inline" className='bg-warning my-4' onClick={handleMenu} selectedKeys={selectedKey} defaultSelectedKeys={[1]} items={items} />
            </Sider>
        </>
    )
}
