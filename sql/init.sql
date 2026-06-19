-- 求职助手数据库初始化脚本
-- 在 Supabase SQL Editor 中执行

-- 用户表（匿名，通过 device_id 识别）
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT UNIQUE NOT NULL,
  name TEXT,
  school TEXT,
  major TEXT,
  degree TEXT,
  phone TEXT,
  email TEXT,
  available_date TEXT,
  internship_duration TEXT,
  highlights TEXT,          -- 简历亮点文字
  email_template TEXT,      -- 邮件模板
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- JD 记录表
CREATE TABLE IF NOT EXISTS jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,              -- 对应 users.device_id
  original_text TEXT,                 -- 粘贴的文本
  image_url TEXT,                     -- 截图的存储 URL
  company TEXT,
  position TEXT,
  email TEXT,                         -- 提取的投递邮箱
  requirements JSONB,
  responsibilities JSONB,
  start_date TEXT,
  duration TEXT,
  -- AI 生成内容
  company_intro TEXT,
  match_points JSONB,                -- [{reason, detail}]
  email_highlight TEXT,               -- 邮件亮点段落
  -- 状态
  has_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_device_id ON users(device_id);
