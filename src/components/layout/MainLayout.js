import React ,{useState} from 'react'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { AiOutlineDashboard } from "react-icons/ai";
import { LuCarTaxiFront } from "react-icons/lu";
import { FaCar } from "react-icons/fa6";
import { Button, Layout, Menu, theme, BottomMenu } from 'antd';
import { useNavigate , Outlet} from 'react-router-dom';
import {useSelector, useDispatch} from 'react-redux';
import { logoutAdmin} from '../../features/auth/authSlice';
const { Header, Sider, Content } = Layout;



const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
   const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

   const authState = useSelector((state) => state.auth);
   const { admin, loading, error, isAuthenticated } = authState;
   const dispatch = useDispatch();
  const navigate = useNavigate();
  return (
    <Layout>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['']}
          onClick={({key}) => {
            if(key === "logout"){
              navigate("/login");
            }else{
              navigate(key)
            }
          }}
          
          items={[
            {
              key: '',
              icon: <AiOutlineDashboard className ="fs-4" />,
              label: 'Dashboard',
            },
            {
              key: 'bookings',
              icon: <LuCarTaxiFront className ="fs-4" />,
              label: 'bookings',
            },
            {
              key: 'cars list',
              icon: <UploadOutlined className ="fs-4" />,
              label: 'Cars List',
              children:[
                {
                  key:'cars',
                  label:'Cars',
                  icon:<FaCar className ="fs-4" />
                },
                {
                  key:'sells',
                  label:'Sells',
                  icon:<FaCar className ="fs-4" />
                },
                {
                  key:'add car',
                  label:'add car',
                  icon:<FaCar className ="fs-4" />
                }
              ]
            },
            {
              key: 'users',
              icon: <UserOutlined className ="fs-4" />,
              label: 'Users',
            }
          ]}
        />

        {/*bottom menu for logout */}
        <div className='bottom-menu'>
          <Menu
            theme="dark"
            mode="inline"
            onClick={({key}) => {
              if(key === "logout"){
                dispatch(logoutAdmin());
                if(!isAuthenticated){
                  navigate("/login");
                }
              }
            }}
            items={[
              {
                key: 'logout',
                icon: <UserOutlined className ="fs-4" />,
                label: 'Logout',
              }
            ]}
          />
        </div>
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout;