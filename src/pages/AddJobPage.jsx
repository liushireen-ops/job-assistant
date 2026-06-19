import React, { useState } from 'react';
import {
  Typography,
  Input,
  Upload,
  Button,
  message,
  Card,
  Alert,
  Space,
} from 'antd';
import { InboxOutlined, FileTextOutlined, PictureOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { parseJD } from '../services/aiApi';
import { createJob, getOrCreateUser } from '../services/supabase';
import { useApp } from '../context/AppContext';
import { imageToBase64 } from '../utils/helpers';

const { TextArea } = Input;
const { Dragger } = Upload;

export default function AddJobPage() {
  const navigate = useNavigate();
  const { state } = useApp();
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!text.trim() && !imageFile) {
      message.warning('请粘贴 JD 文本或上传截图');
      return;
    }
    setLoading(true);
    setError('');

    try {
      let input;
      if (imageFile) {
        const base64 = await imageToBase64(imageFile);
        input = { type: 'image', data: base64 };
      } else {
        input = text.trim();
      }

      await getOrCreateUser(state.deviceId);

      const userProfile = state.userProfile
        ? { highlights: state.userProfile.highlights }
        : null;
      const result = await parseJD(input, userProfile);

      const jobData = {
        user_id: state.deviceId,
        original_text: text.trim() || null,
        company: result.company || '',
        position: result.position || '',
        email: result.email || '',
        requirements: JSON.stringify(result.requirements || []),
        responsibilities: JSON.stringify(result.responsibilities || []),
        start_date: result.startDate || '',
        duration: result.duration || '',
        company_intro: result.companyIntro || '',
        match_points: JSON.stringify(result.matchPoints || []),
        email_highlight: result.emailHighlightParagraph || '',
      };

      const job = await createJob(jobData);
      message.success('JD 解析完成！');
      navigate(`/job/${job.id}`);
    } catch (err) {
      console.error('解析失败:', err);
      setError(err.message || '解析失败，请检查 API Key 和网络连接');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (file) => {
    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    return false;
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  return (
    <div>
      <Typography.Title level={3}>新增 JD</Typography.Title>

      {error && (
        <Alert
          type="error"
          message="解析出错"
          description={error}
          showIcon
          closable
          onClose={() => setError('')}
          style={{ marginBottom: 16 }}
        />
      )}

      <Card title="粘贴 JD 文本" style={{ marginBottom: 24 }}>
        <TextArea
          rows={6}
          placeholder="在此粘贴岗位描述文字..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={loading}
        />
      </Card>

      <Card title="或上传截图" style={{ marginBottom: 24 }}>
        {imagePreview ? (
          <div style={{ textAlign: 'center' }}>
            <img
              src={imagePreview}
              alt="JD 截图预览"
              style={{ maxWidth: '100%', maxHeight: 300, marginBottom: 12 }}
            />
            <br />
            <Button danger onClick={handleRemoveImage} disabled={loading}>
              移除图片
            </Button>
          </div>
        ) : (
          <Dragger
            accept="image/png,image/jpeg"
            showUploadList={false}
            beforeUpload={handleImageSelect}
            disabled={loading}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">拖拽截图到此处，或点击选择文件</p>
            <p className="ant-upload-hint">支持 PNG / JPG 格式</p>
          </Dragger>
        )}
      </Card>

      <Space direction="vertical" style={{ width: '100%' }}>
        <Button
          type="primary"
          size="large"
          block
          onClick={handleAnalyze}
          loading={loading}
          disabled={(!text.trim() && !imageFile) || loading}
          icon={imageFile ? <PictureOutlined /> : <FileTextOutlined />}
        >
          {loading ? 'AI 正在分析 JD...' : '🚀 开始分析'}
        </Button>
        {loading && (
          <Alert
            type="info"
            message="正在调用 DeepSeek API 解析 JD，请稍候..."
            showIcon
          />
        )}
      </Space>
    </div>
  );
}
