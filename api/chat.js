// api/chat.js
// 使用 Node.js 原生支持的 fetch (Node 18+)
export default async function (req, res) {
  // 1. 获取并清理变量
  const apiKey = (process.env.COZE_API_KEY || '').trim();
  const botId = (process.env.COZE_BOT_ID || '').trim();

  // 2. 检查变量（这个 log 会出现在 Vercel 控制台，方便我们最后确认）
  if (!apiKey || !botId) {
    console.error("检测到变量缺失！请确认 Redeploy 是否成功。");
    return res.status(200).json({ 
      error: "环境变量未注入", 
      tip: "请在 Vercel 后台点击 Deployments -> Redeploy" 
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '仅支持 POST 请求' });
  }

  try {
    const { message } = req.body;

    const cozeRes = await fetch('https://api.coze.cn/v3/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bot_id: botId,
        user_id: "user_" + Math.random().toString(36).slice(2),
        stream: false,
        additional_messages: [{ role: "user", content: message, content_type: "text" }]
      })
    });

    const data = await cozeRes.json();
    
    // 如果 Coze 报错（比如之前的 4101），我们直接把 Coze 的原始错误传给前端，方便调试
    if (data.code && data.code !== 0) {
      return res.status(200).json({ 
        error: "Coze API 报错", 
        detail: data.msg,
        code: data.code 
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: "服务器内部异常", details: err.message });
  }
}
