// api/chat.js
export default async function (req, res) {
  // 1. 获取并清理环境变量
  const apiKey = (process.env.COZE_API_KEY || '').trim();
  const botId = (process.env.COZE_BOT_ID || '').trim();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '仅支持 POST 请求' });
  }

  // 2. 检查变量注入情况
  if (!apiKey || !botId) {
    return res.status(200).json({ 
      error: "服务器环境配置错误", 
      detail: "请检查 Vercel 变量名是否为 COZE_API_KEY 和 COZE_BOT_ID，并确保已 Redeploy" 
    });
  }

  try {
    // 接收当前消息 message 和 历史记录 history
    const { message, history = [] } = req.body;

    // 3. 调用 Coze V2 接口 (同步模式)
    const cozeRes = await fetch('https://api.coze.cn/open_api/v2/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bot_id: botId,
        user: "web_user_multi_turn",
        query: message,
        chat_history: history, // 将前端传来的数组传给 Coze
        stream: false
      })
    });

    const data = await cozeRes.json();

    // 4. 解析返回结果
    if (data.code === 0 && data.messages) {
      const answer = data.messages.find(m => m.type === 'answer');
      if (answer) {
        return res.status(200).json({ content: answer.content });
      } else {
        return res.status(200).json({ error: "未获取到 AI 回复内容" });
      }
    } else {
      return res.status(200).json({ error: "Coze 接口报错", detail: data.msg });
    }

  } catch (err) {
    return res.status(500).json({ error: "服务器内部异常", details: err.message });
  }
}
