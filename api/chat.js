export default async function handler(req, res) {
  try {
    // ✅ 强制只允许 POST
    if (req.method !== "POST") {
      return res.status(405).json({ reply: "只支持 POST 请求" });
    }

    // ✅ 彻底解决 body 为空问题（关键）
    let body = req.body;

    // Vercel 有时候 body 是 string
    if (typeof body === "string") {
      body = JSON.parse(body);
    }

    const message = body?.message;

    if (!message) {
      return res.status(400).json({ reply: "message 为空" });
    }

    // ✅ 请求 Coze
    const response = await fetch("https://api.coze.com/open_api/v2/chat", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.COZE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        bot_id: process.env.BOT_ID,
        user: "user_001",
        query: message,
        stream: false
      })
    });

    const data = await response.json();

    let reply = "暂无回复";

    if (data && data.messages) {
      const msg = data.messages.find(m => m.type === "answer");
      if (msg) {
        reply = msg.content;
      }
    }

    return res.status(200).json({ reply });

  } catch (error) {
    return res.status(500).json({
      reply: "后端报错: " + error.message
    });
  }
}
