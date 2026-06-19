import { getApiKey } from '../utils/helpers';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * 通用请求封装
 */
async function request(method, path, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      apiKey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase 请求失败: ${res.status} - ${err}`);
  }
  return res.json();
}

/**
 * 获取或创建用户
 */
export async function getOrCreateUser(deviceId) {
  const existing = await request('GET', `/users?device_id=eq.${deviceId}&select=*`);
  if (existing?.length > 0) return existing[0];

  const data = await request('POST', '/users', { device_id: deviceId });
  return data?.[0] || data;
}

/**
 * 更新用户预设信息
 */
export async function updateUserProfile(deviceId, profile) {
  const data = await request('PATCH', `/users?device_id=eq.${deviceId}`, profile);
  return data;
}

/**
 * 获取所有 JD（按创建时间倒序）
 */
export async function getJobs(deviceId) {
  return request('GET', `/jobs?user_id=eq.${deviceId}&order=created_at.desc&select=*`);
}

/**
 * 获取单个 JD 详情
 */
export async function getJobById(jobId) {
  const data = await request('GET', `/jobs?id=eq.${jobId}&select=*`);
  return data?.[0] || null;
}

/**
 * 创建 JD 记录
 */
export async function createJob(jobData) {
  const data = await request('POST', '/jobs', jobData);
  return data?.[0] || data;
}

/**
 * 更新 JD 记录
 */
export async function updateJob(jobId, updates) {
  const data = await request('PATCH', `/jobs?id=eq.${jobId}`, updates);
  return data;
}
