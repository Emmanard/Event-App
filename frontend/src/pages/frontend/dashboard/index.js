import { Layout } from 'antd';
import './_dashboard.scss';
import React, { useState } from 'react';
import DashboardSidebar from 'components/dashboardSidebar'
import DashboardHeader from 'components/dashboardHeader'
import moment from 'moment';
import Routes from './Routes';

const { Content, Footer } = Layout;

const App = () => {
  const [navbarCollapsed, setNavbarCollapsed] = useState(false)
  const year = moment().year();

  return (
    <Layout id='dashborad-stylling'>
      {/* dashboard sidebar */}
      <DashboardSidebar collapsed={navbarCollapsed} />
      <Layout className='dashboard-content-layout'>
        {/* dashboard header */}
        <DashboardHeader collapsed={navbarCollapsed} setCollapsed={setNavbarCollapsed} />

        <Content
          style={{
            margin: '0',
          }}
        >
          <div
            style={{
              minHeight: "100vh",
              background: "white",
              borderRadius: "0 0 20px 20px",
            }}
          >
            {/* pages */}
            <Routes />
          </div>

          {/* dashboard footer */}
          <Footer
            style={{
              textAlign: 'center',
            }}
          >
            Copyright &copy; {year}. All rights reserved
          </Footer>
        </Content>
      </Layout>
    </Layout>
  );
};
export default App;