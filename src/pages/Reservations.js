import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Button, Popconfirm, Tag, Space, Select } from 'antd';
import { DeleteOutlined, CheckOutlined } from '@ant-design/icons';
import {getBookings, cancelBooking, updateBookingStatus} from '../features/bookings/bookingsSlice';
import './reservations.css';

const Reservations = () => {
  const dispatch = useDispatch();
  const { list: reservations, loading } = useSelector(state => state.reservations);

  useEffect(() => {
    dispatch(getBookings());
  }, [dispatch]);

  const handleCancel = (id) => {
    dispatch(cancelBooking(id));
  };

  const handleStatusChange = (id, status) => {
    dispatch(updateBookingStatus({ id, status }));
  };

  const statusColor = (status) => {
    const colors = { pending: 'orange', approved: 'green', cancelled: 'red', completed: 'blue' };
    return colors[status] || 'default';
  };

  const columns = [
    { title: 'Booking ID', dataIndex: '_id', key: '_id', width: '12%', ellipsis: true },
    { title: 'User', dataIndex: ['userId', 'name'], key: 'user', width: '12%' },
    { title: 'Car', dataIndex: ['carId', 'carName'], key: 'car', width: '12%' },
    {
      title: 'Dates',
      key: 'dates',
      width: '12%',
      render: (_, record) => `${record.startDate?.substring(0, 10)} to ${record.endDate?.substring(0, 10)}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: '10%',
      render: (status) => <Tag color={statusColor(status)}>{status}</Tag>,
    },
    { title: 'Total Price', dataIndex: 'totalPrice', key: 'totalPrice', width: '10%' },
    {
      title: 'Actions',
      key: 'actions',
      width: '16%',
      render: (_, record) => (
        <Space>
          <Select
            defaultValue={record.status}
            style={{ width: 100 }}
            onChange={(val) => handleStatusChange(record._id, val)}
            options={[
              { label: 'Pending', value: 'pending' },
              { label: 'Approved', value: 'approved' },
              { label: 'Completed', value: 'completed' },
            ]}
          />
          <Popconfirm
            title="Cancel Booking"
            description="Are you sure?"
            onConfirm={() => handleCancel(record._id)}
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
    <div className="reservations-container">
      <h2>Reservations Management</h2>
      <Table
        columns={columns}
        dataSource={reservations.map(r => ({ ...r, key: r._id }))}
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1000 }}
      />
    </div>
  );
};

export default Reservations;
