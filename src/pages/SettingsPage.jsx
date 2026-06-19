import React, { useEffect, useState } from 'react';
import {
  Typography,
  Form,
  Input,
  Select,
  Button,
  Card,
  message,
  Spin,
} from 'antd';
import { DEFAULT_EMAIL_TEMPLATE, STORAGE_KEYS } from '../utils/constants';
import { getOrCreateUser, updateUserProfile } from '../services/supabase';
import { useApp } from '../context/AppContext';
import { getApiKey, setApiKey } from '../utils/helpers';

export default function SettingsPage() {
  const { state, dispatch } = useApp();
  const [userForm] = Form.useForm();
  const [template, setTemplate] = useState(DEFAULT_EMAIL_TEMPLATE);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    initSettings();
  }, [state.deviceId]);

  const initSettings = async () => {
    if (!state.deviceId) return;
    try {
      const user = await getOrCreateUser(state.deviceId);
      dispatch({ type: 'SET_USER_PROFILE', payload: user });

      if (user) {
        userForm.setFieldsValue({
          name: user.name || '',
          school: user.school || '',
          major: user.major || '',
          degree: user.degree || undefined,
          phone: user.phone || '',
          email: user.email || '',
          available_date: user.available_date || '',
          internship_duration: user.internship_duration || '',
          highlights: user.highlights || '',
        });
        if (user.email_template) {
          setTemplate(user.email_template);
        }
      }
    } catch (err) {
      console.error('加载用户信息失败:', err);
    } finally {
      setLoading(false);
    }

    const savedKey = getApiKey();
    if (savedKey) setApiKeyInput(savedKey);
  };

  const handleSaveUser = async (values) => {
    setSaving(true);
    try {
      const updated = await updateUserProfile(state.deviceId, values);
      dispatch({ type: 'SET_USER_PROFILE', payload: { ...state.userProfile, ...values } });
      message.success('个人信息已保存');
    } catch (err) {
      message.error('保存失败: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTemplate = async () => {
    setSaving(true);
    try {
      await updateUserProfile(state.deviceId, { email_template: template });
      dispatch({ type: 'SET_USER_PROFILE', payload: { ...state.userProfile, email_template: template } });
      message.success('邮件模板已保存');
    } catch (err) {
      message.error('保存失败: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveApiKey = () => {
    setApiKey(apiKeyInput);
    message.success('API Key 已保存');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Typography.Title level={3}>设置</Typography.Title>

      <Card title="DeepSeek API 配置" style={{ marginBottom: 24 }}>
        <Input.Password
          placeholder="输入你的 DeepSeek API Key"
          value={apiKeyInput}
          onChange={(e) => setApiKeyInput(e.target.value)}
          style={{ maxWidth: 400 }}
        />
        <Button type="primary" onClick={handleSaveApiKey} style={{ marginLeft: 12 }}>
          保存 Key
        </Button>
        <Typography.Paragraph type="secondary" style={{ marginTop: 8 }}>
          你的 API Key 仅存储在本地浏览器中，不会上传到任何服务器。
        </Typography.Paragraph>
      </Card>

      <Card title="个人信息" style={{ marginBottom: 24 }}>
        <Form
          form={userForm}
          layout="vertical"
          onFinish={handleSaveUser}
          style={{ maxWidth: 600 }}
        >
          <Form.Item name="name" label="姓名">
            <Input placeholder="张三" />
          </Form.Item>
          <Form.Item name="school" label="学校">
            <Input placeholder="北京大学" />
          </Form.Item>
          <Form.Item name="major" label="专业">
            <Input placeholder="计算机科学与技术" />
          </Form.Item>
          <Form.Item name="degree" label="学历">
            <Select
              placeholder="选择学历"
              options={[
                { label: '本科', value: '本科' },
                { label: '硕士', value: '硕士' },
                { label: '博士', value: '博士' },
              ]}
            />
          </Form.Item>
          <Form.Item name="phone" label="电话">
            <Input placeholder="138-0000-0000" />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input placeholder="zhangsan@example.com" />
          </Form.Item>
          <Form.Item name="available_date" label="预计到岗时间">
            <Input placeholder="2026年7月" />
          </Form.Item>
          <Form.Item name="internship_duration" label="可实习时长">
            <Input placeholder="3 个月" />
          </Form.Item>
          <Form.Item name="highlights" label="简历亮点">
            <Input.TextArea
              rows={4}
              placeholder="描述你的过往经历亮点，AI 将参考此信息生成匹配点分析和邮件亮点段落"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={saving}>
              保存个人信息
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="邮件模板">
        <Typography.Paragraph type="secondary">
          支持变量：{' '}
          <code>{'{岗位名称}'}</code> <code>{'{姓名}'}</code>{' '}
          <code>{'{学校}'}</code> <code>{'{专业}'}</code>{' '}
          <code>{'{学历}'}</code> <code>{'{到岗时间}'}</code>{' '}
          <code>{'{实习时长}'}</code> <code>{'{个人亮点段落}'}</code>{' '}
          <code>{'{电话}'}</code> <code>{'{邮箱}'}</code>
        </Typography.Paragraph>
        <Input.TextArea
          rows={12}
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
        />
        <Button type="primary" onClick={handleSaveTemplate} style={{ marginTop: 12 }} loading={saving}>
          保存模板
        </Button>
      </Card>
    </div>
  );
}
