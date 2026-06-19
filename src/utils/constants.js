// 常量定义

export const DEFAULT_EMAIL_TEMPLATE = `尊敬的招聘团队，您好：

我在小红书上看到贵团队的继任帖子，对 {岗位名称} 岗位非常感兴趣，特此投递简历。

{个人亮点段落}

我目前就读于 {学校}，{专业} 专业 {学历}，预计 {到岗时间} 到岗，可实习 {实习时长}。

感谢您抽出时间阅读我的申请，期待您的回复！

此致
{姓名}
{电话}
{邮箱}`;

export const STORAGE_KEYS = {
  DEVICE_ID: 'job_assistant_device_id',
  API_KEY: 'job_assistant_deepseek_api_key',
};

export const ROUTES = {
  HOME: '/',
  ADD_JOB: '/add',
  JOB_DETAIL: '/job/:id',
  SETTINGS: '/settings',
};
