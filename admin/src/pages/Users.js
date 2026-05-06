import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Button, Popconfirm, Space } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { getUsers, deleteUser } from '../features/users/usersSlice';
import './users.css';

const Users = () => {
  const dispatch = useDispatch();
  const { list: users, loading } = useSelector(state => state.users);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch]);

  const handleDelete = (id) => {
    dispatch(deleteUser(id));
  };

  const columns = [
    { title: 'ID', dataIndex: '_id', key: '_id', width: '10%', ellipsis: true },
    { title: 'Name', dataIndex: 'name', key: 'name', width: '15%' },
    { title: 'Email', dataIndex: 'email', key: 'email', width: '20%', ellipsis: true },
    { title: 'Role', dataIndex: 'role', key: 'role', width: '10%' },
    {
      title: 'Actions',
      key: 'actions',
      width: '15%',
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="Delete User"
            description="Are you sure you want to delete this user?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="users-container">
      <h2>Users Management</h2>
      <Table
        columns={columns}
        dataSource={users.map(u => ({ ...u, key: u._id }))}
        loading={loading}
        rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default Users;
