import React, { useEffect, useState } from 'react';
import { Typography, Input, Card, Empty, Button, Tag, Spin, Space } from 'antd';
import {
  PlusCircleOutlined,
  SearchOutlined,
  MailOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getJobs } from '../services/supabase';
import { useApp } from '../context/AppContext';
import { formatTime } from '../utils/helpers';

export default function HomePage() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    if (!state.deviceId) return;
    try {
      const jobs = await getJobs(state.deviceId);
      dispatch({ type: 'SET_JOBS', payload: jobs });
    } catch (err) {
      console.error('加载 JD 列表失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = state.jobs.filter((job) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (job.company || '').toLowerCase().includes(q) ||
      (job.position || '').toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <Typography.Title level={3} style={{ margin: 0 }}>
          JD 列表
        </Typography.Title>
        <Space>
          <Input
            placeholder="搜索公司或岗位..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 220 }}
            allowClear
          />
          <Button type="primary" icon={<PlusCircleOutlined />} onClick={() => navigate('/add')}>
            新增 JD
          </Button>
        </Space>
      </div>

      {filteredJobs.length === 0 ? (
        <Empty
          description={search ? '没有匹配的 JD 记录' : '还没有 JD 记录，点击右上角开始添加'}
          style={{ marginTop: 80 }}
        >
          {!search && (
            <Button type="primary" onClick={() => navigate('/add')}>
              去添加 JD
            </Button>
          )}
        </Empty>
      ) : (
        filteredJobs.map((job) => (
          <Card
            key={job.id}
            hoverable
            style={{ marginBottom: 12 }}
            onClick={() => navigate(`/job/${job.id}`)}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <div>
                <Typography.Text strong style={{ fontSize: 16 }}>
                  {job.company || '未知公司'} · {job.position || '未知岗位'}
                </Typography.Text>
                <div style={{ marginTop: 4 }}>
                  {job.email ? (
                    <Tag icon={<MailOutlined />} color="blue">
                      已提取邮箱
                    </Tag>
                  ) : (
                    <Tag>未提取到邮箱</Tag>
                  )}
                  {job.has_sent && <Tag color="green">已投递</Tag>}
                </div>
              </div>
              <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                <ClockCircleOutlined /> {formatTime(job.created_at)}
              </Typography.Text>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
