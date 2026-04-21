// api/chat.js
export default async function (req, res) {
  // 1. 严格获取环境变量并清理空格
  const apiKey = (process.env.COZE_API_KEY || '').trim();
  const botId = (process.env.COZE_BOT_ID || '').trim();

  // 2. 预检：如果服务器没读到变量，直接拦截并告知前端
  if (!apiKey || !botId) {
    return res.status(200).json({ 
      error: "服务器未检测到环境变量", 
      detail: "请在 Vercel 后台确认 COZE_API_KEY 和 COZE_BOT_ID 已配置并 Redeploy" 
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '仅支持 POST 请求' });
  }

  try {
    const { message } = req.body;

    // 3. 调用 Coze V2 接口 (同步模式)
    const response = await fetch('https://api.coze.cn/open_api/v2/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bot_id: botId, // 确保这个字段名是 bot_id
        user: "web_user_fixed",
        query: message,
        stream: false
      })
    });

    const data = await response.json();
    if (data.conversation_id) {
  localStorage.setItem("cid", data.conversation_id);
}

    // 4. 解析 Coze 的返回结果
    if (data.code === 0 && data.messages) {
      // 在 messages 数组中寻找类型为 'answer' 的消息
      const answer = data.messages.find(m => m.type === 'answer');
      if (answer && answer.content) {
        return res.status(200).json({ content: answer.content });
      } else {
        return res.status(200).json({ error: "Bot未返回文字内容", detail: JSON.stringify(data) });
      }
    } else {
      // 这里会捕获你截图中的那个报错信息
      return res.status(200).json({ 
        error: "Coze 接口返回错误", 
        detail: data.msg || "未知错误" 
      });
    }

  } catch (err) {
    return res.status(500).json({ error: "服务器内部异常", details: err.message });
  }
}
