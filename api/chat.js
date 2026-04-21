// api/chat.js (V2 同步版本)
export default async function (req, res) {
  const apiKey = (process.env.COZE_API_KEY || '').trim();
  const botId = (process.env.COZE_BOT_ID || '').trim();

  if (req.method !== 'POST') return res.status(405).json({ error: '仅支持 POST' });

  try {
    const { message } = req.body;

    const cozeRes = await fetch('https://api.coze.cn/open_api/v2/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Host': 'api.coze.cn',
        'Connection': 'keep-alive'
      },
      body: JSON.stringify({
        bot_id: botId,
        user: "web_user",
        query: message, // V2 接口使用 query 字段
        stream: false
      })
    });

    const data = await cozeRes.json();

    // V2 接口的内容提取逻辑
    if (data.code === 0) {
      // 找到回答消息
      const answerMessage = data.messages.find(m => m.type === 'answer');
      const content = answerMessage ? answerMessage.content : "Bot 没说话，请检查 Bot 配置";
      return res.status(200).json({ content });
    } else {
      return res.status(200).json({ error: data.msg });
    }

  } catch (err) {
    return res.status(500).json({ error: "请求发生错误", details: err.message });
  }
}
