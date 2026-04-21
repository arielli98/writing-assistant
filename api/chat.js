// api/chat.js
export default async function handler(req, res) {
  // 1. 检查环境变量是否配置
  const apiKey = process.env.COZE_API_KEY;
  const botId = process.env.COZE_BOT_ID;

  if (!apiKey || !botId) {
    console.error("缺少环境变量: 请确保在 Vercel 中配置了 COZE_API_KEY 和 COZE_BOT_ID");
    return res.status(500).json({ error: "服务器环境配置错误" });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: '仅支持 POST' });
  }

  try {
    const { message } = req.body;

    const cozeResponse = await fetch('https://api.coze.cn/v3/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bot_id: botId,
        user_id: "official_doc_user",
        stream: false,
        additional_messages: [
          { role: "user", content: message, content_type: "text" }
        ]
      })
    });

    const data = await cozeResponse.json();
    
    // 打印日志方便调试（在 Vercel Logs 中查看）
    console.log("Coze API 返回内容:", JSON.stringify(data));

    // 返回给前端
    return res.status(200).json(data);
  } catch (error) {
    console.error("后端请求发生异常:", error);
    return res.status(500).json({ error: "服务器内部异常", details: error.message });
  }
}
