import { getApiKey } from '../utils/helpers';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

/**
 * 调用 DeepSeek API（兼容 OpenAI 格式）
 */
async function callDeepSeek(messages, model = 'deepseek-chat') {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('请先在设置页配置 DeepSeek API Key');
  }

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.3,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API 调用失败: ${response.status} - ${error}`);
  }

  const result = await response.json();
  const content = result.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('API 返回内容为空');
  }
  return content;
}

/**
 * 解析 JD：提取关键信息 + 生成面试速查内容
 * 支持文本和图片（base64）
 */
export async function parseJD(input, userProfile) {
  const systemPrompt = `你是一个求职助手 AI。你的任务是从用户提供的 JD 信息中提取关键字段并以 JSON 格式返回。

请返回以下 JSON 格式（不要包含任何其他文字）：
{
  "company": "公司名称",
  "position": "岗位名称",
  "email": "投递邮箱（如果有，没有则返回空字符串）",
  "requirements": ["要求1", "要求2"],
  "responsibilities": ["职责1", "职责2"],
  "startDate": "到岗时间要求（如果有）",
  "duration": "实习时长要求（如果有）",
  "companyIntro": "一句话公司介绍（50字以内）",
  "matchPoints": [
    {"reason": "匹配点简要说明", "detail": "详细分析，结合用户简历亮点"}
  ],
  "emailHighlightParagraph": "2-4 句邮件正文中用的个人亮点段落，结合 JD 和用户简历亮点生成"
}`;

  const userMessages = [];

  if (typeof input === 'string') {
    userMessages.push({ type: 'text', text: `请解析以下 JD 信息：\n\n${input}` });
  } else if (input.type === 'image') {
    userMessages.push({
      type: 'text',
      text: '请识别这张图片中的文字，然后解析 JD 信息。',
    });
    userMessages.push({
      type: 'image_url',
      image_url: { url: input.data },
    });
  }

  if (userProfile?.highlights) {
    userMessages.push({
      type: 'text',
      text: `用户的简历亮点信息（用于生成匹配点分析和邮件亮点段落）：\n${userProfile.highlights}`,
    });
  }

  const content = await callDeepSeek([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessages },
  ]);

  const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
  const jsonStr = jsonMatch ? jsonMatch[1] : content;
  return JSON.parse(jsonStr.trim());
}

/**
 * 生成投递邮件
 */
export async function generateEmail(job, userProfile, template) {
  const systemPrompt = `你是一个求职助手 AI。请根据用户模板和变量信息生成一封完整的求职邮件正文。

用户提供的模板如下（其中 {变量名} 是需要替换的占位符）：
${template}

请直接返回完整的邮件正文，不要包含额外说明。注意：
- 将 {岗位名称} {姓名} {学校} {专业} {学历} {到岗时间} {实习时长} {电话} {邮箱} 替换为实际值
- 将 {个人亮点段落} 替换为 AI 根据 JD 和用户简历亮点动态生成的 2-4 句亮点描述
- 保持原文格式和语气`;

  const content = await callDeepSeek([
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: `岗位名称：${job.position}
姓名：${userProfile.name}
学校：${userProfile.school}
专业：${userProfile.major}
学历：${userProfile.degree}
到岗时间：${userProfile.available_date}
实习时长：${userProfile.internship_duration}
电话：${userProfile.phone}
邮箱：${userProfile.email}
简历亮点：${userProfile.highlights || ''}
JD 内容：${job.original_text || ''}`,
    },
  ]);

  return content;
}
