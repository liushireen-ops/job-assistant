import React, { useEffect, useState } from 'react';
import {
  Typography,
  Card,
  Button,
  Tag,
  Spin,
  Empty,
  Divider,
  Space,
  Modal,
  Input,
  message,
  Alert,
} from 'antd';
import {
  ArrowLeftOutlined,
  MailOutlined,
  CopyOutlined,
  LinkOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobById, updateJob } from '../services/supabase';
import { generateEmail } from '../services/aiApi';
import { useApp } from '../context/AppContext';

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useApp();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emailModal, setEmailModal] = useState(false);
  const [emailContent, setEmailContent] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    try {
      const data = await getJobById(id);
      setJob(data);
    } catch (err) {
      console.error('加载 JD 详情失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateEmail = async () => {
    if (!state.userProfile || !state.userProfile.name) {
      message.warning('请先在设置页填写个人信息');
      navigate('/settings');
      return;
    }
    setEmailLoading(true);
    setEmailError('');
    try {
      const template = state.userProfile.email_template ||
        '尊敬的招聘团队，您好：\n\n我在小红书上看到贵团队的继任帖子，对 {岗位名称} 岗位非常感兴趣，特此投递简历。\n\n{个人亮点段落}\n\n我目前就读于 {学校}，{专业} 专业 {学历}，预计 {到岗时间} 到岗，可实习 {实习时长}。\n\n感谢您抽出时间阅读我的申请，期待您的回复！\n\n此致\n{姓名}\n{电话}\n{邮箱}';
      const content = await generateEmail(job, state.userProfile, template);
      setEmailContent(content);
      setEmailModal(true);
    } catch (err) {
      setEmailError(err.message);
    } finally {
      setEmailLoading(false);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailContent).then(() => {
      message.success('已复制到剪贴板');
    });
  };

  const handleMailTo = () => {
    const subject = encodeURIComponent(`${job.position} - ${state.userProfile?.name || ''} 应聘实习`);
    const body = encodeURIComponent(emailContent);
    window.location.href = `mailto:${job.email}?subject=${subject}&body=${body}`;
    // 记录投递状态
    updateJob(job.id, { has_sent: true });
    setJob({ ...job, has_sent: true });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!job) {
    return (
      <div>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')} style={{ marginBottom: 16 }}>
          返回列表
        </Button>
        <Empty description="JD 不存在或已被删除" />
      </div>
    );
  }

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')} style={{ marginBottom: 16 }}>
        返回列表
      </Button>

      {/* 头部信息 */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <Typography.Title level={3} style={{ margin: 0 }}>
              {(job.company || '未知公司') + ' · ' + (job.position || '未知岗位')}
            </Typography.Title>
            <div style={{ marginTop: 8 }}>
              {job.email ? (
                <Tag icon={<MailOutlined />} color="blue">
                  投递邮箱：{job.email}
                </Tag>
              ) : (
                <Tag>未提取到邮箱</Tag>
              )}
              {job.has_sent && (
                <Tag icon={<CheckCircleOutlined />} color="green">
                  已投递
                </Tag>
              )}
            </div>
          </div>
          {job.email && (
            <Button
              type="primary"
              icon={<MailOutlined />}
              size="large"
              onClick={handleGenerateEmail}
              loading={emailLoading}
            >
              撰写投递邮件
            </Button>
          )}
        </div>
      </Card>

      {/* 公司简介 */}
      {job.company_intro && (
        <Card title="公司简介" style={{ marginBottom: 16 }}>
          <Typography.Paragraph style={{ fontSize: 15 }}>
            {job.company_intro}
          </Typography.Paragraph>
        </Card>
      )}

      {/* 岗位职责 */}
      {job.responsibilities?.length > 0 && (
        <Card title="岗位职责" style={{ marginBottom: 16 }}>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {job.responsibilities.map((item, i) => (
              <li key={i} style={{ marginBottom: 8 }}>
                <Typography.Text>{item}</Typography.Text>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* 岗位要求 */}
      {job.requirements?.length > 0 && (
        <Card title="岗位要求" style={{ marginBottom: 16 }}>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {job.requirements.map((item, i) => (
              <li key={i} style={{ marginBottom: 8 }}>
                <Typography.Text>{item}</Typography.Text>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* 匹配点分析 */}
      {job.match_points?.length > 0 && (
        <Card title="匹配点分析" style={{ marginBottom: 16 }}>
          {job.match_points.map((point, i) => (
            <Card
              key={i}
              size="small"
              style={{ marginBottom: 8, background: '#f6ffed', border: '1px solid #b7eb8f' }}
            >
              <Typography.Text strong style={{ color: '#52c41a' }}>
                ✅ {point.reason}
              </Typography.Text>
              <br />
              <Typography.Text type="secondary">{point.detail}</Typography.Text>
            </Card>
          ))}
        </Card>
      )}

      {/* 原始 JD */}
      {job.original_text && (
        <Card title="原始 JD">
          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>
            {job.original_text}
          </pre>
        </Card>
      )}

      {/* 邮件预览 Modal */}
      <Modal
        title="邮件预览"
        open={emailModal}
        onCancel={() => setEmailModal(false)}
        width={700}
        footer={
          <Space>
            <Button icon={<CopyOutlined />} onClick={handleCopyEmail}>
              复制全文
            </Button>
            <Button type="primary" icon={<LinkOutlined />} onClick={handleMailTo}>
              打开邮件客户端
            </Button>
          </Space>
        }
      >
        {emailError && (
          <Alert type="error" message={emailError} style={{ marginBottom: 12 }} closable />
        )}
        <Input.TextArea
          rows={16}
          value={emailContent}
          onChange={(e) => setEmailContent(e.target.value)}
          style={{ fontFamily: 'inherit' }}
        />
      </Modal>
    </div>
  );
}
