export default async function handler(req, res) {
  try {
    const { message } = req.body;

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

    let reply = "暂无回复";

    if (data && data.messages) {
      const msg = data.messages.find(m => m.type === "answer");
      if (msg) {
        reply = msg.content;
      }
    }

    res.status(200).json({ reply });

  } catch (err) {
    res.status(500).json({ reply: "服务器错误" });
  }
}
