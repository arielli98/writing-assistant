export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return Response.json({
        reply: "请输入内容"
      });
    }

    const response = await fetch("https://api.coze.com/open_api/v2/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.COZE_API_TOKEN}`
      },
      body: JSON.stringify({
        bot_id: process.env.COZE_BOT_ID, // 👈 用环境变量（更安全）
        user: "user_123",
        query: message,
        stream: false
      })
    });

    // 👉 防止接口直接报错（不是200）
    if (!response.ok) {
      const text = await response.text();
      console.error("❌ Coze HTTP错误:", text);

      return Response.json({
        reply: "接口错误：" + text
      });
    }

    const data = await response.json();

    console.log("✅ Coze返回:", JSON.stringify(data));

    // 👉 兼容各种返回结构（核心）
    const reply =
      data?.messages?.find((m: any) => m.type === "answer")?.content ||
      data?.messages?.[0]?.content ||
      data?.output ||
      data?.data?.content ||
      data?.choices?.[0]?.message?.content ||
      "AI无返回";

    return Response.json({
      reply
    });

  } catch (err: any) {
    console.error("🔥 后端报错:", err);

    return Response.json({
      reply: "后端报错：" + (err.message || "未知错误")
    });
  }
}
