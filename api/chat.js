export async function POST(req) {
  const { message } = await req.json();

  try {
    const res = await fetch("https://api.coze.com/open_api/v2/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.COZE_API_TOKEN}`
      },
      body: JSON.stringify({
        bot_id: "7628532944344563752",
        user: "user_123",
        query: message,
        stream: false
      })
    });

    const data = await res.json();

    console.log("Coze返回：", data);

    return Response.json({
      reply:
        data?.messages?.[0]?.content ||
        data?.messages?.find(m => m.type === "answer")?.content ||
        "AI无返回"
    });

  } catch (err) {
    console.error("报错：", err);

    return Response.json({
      reply: "报错：" + err.message
    });
  }
}
