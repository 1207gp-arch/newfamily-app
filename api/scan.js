export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "POST만 허용돼요" });
    return;
  }
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "서버에 API 키가 설정되지 않았어요 (ANTHROPIC_API_KEY)" });
    return;
  }
  try {
    const { image, media_type, prompt } = req.body || {};
    if (!image) { res.status(400).json({ error: "이미지가 없어요" }); return; }

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: media_type || "image/jpeg", data: image } },
            { type: "text", text: prompt || "이 이미지의 내용을 JSON으로 추출해줘." },
          ],
        }],
      }),
    });

    const data = await r.json();
    res.status(r.status).json(data);
  } catch (err) {
    res.status(500).json({ error: String((err && err.message) || err) });
  }
}
