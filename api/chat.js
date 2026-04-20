export default async function handler(req, res) {
  try {
    // ✅ 手动解析 body（关键！！）
    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body;

    const message = body?.message;

    if (!message) {
      return res.status(400).json({ reply: "没有收到 message" });
    }

    const response = await fetch("https://api.coze.com/open_api/v2/chat", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.COZE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        bot_id: process.env.BOT_ID,
        user: "user_001",
        query: message
      })
    });

    const data = await response.json();
console.log("coze返回：", JSON.stringify(data));
    let reply = "暂无回复";

    if (data.messages && data.messages.length > 0) {
      reply = data.messages[0].content;
    }

    res.status(200).json({ reply });

  } catch (err) {
    res.status(500).json({
      reply: "后端报错：" + err.message
    });
  }
}
