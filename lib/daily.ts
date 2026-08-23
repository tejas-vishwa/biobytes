export async function createDailyRoom(appointmentId: string) {
  const apiKey = process.env.DAILY_API_KEY
  const domain = process.env.NEXT_PUBLIC_DAILY_DOMAIN

  if (!apiKey || !domain) {
    throw new Error("Missing Daily.co API key or domain in environment variables.")
  }

  const res = await fetch("https://api.daily.co/v1/rooms", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: `qurix-${appointmentId}`,
      privacy: "private",
      properties: {
        exp: Math.floor(Date.now() / 1000) + 7200, // 2hr expiry
        enable_chat: true,
        start_video_off: false,
        start_audio_off: false,
      },
    }),
  })
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create Daily room: ${res.statusText} - ${text}`);
  }

  return res.json()
}

export async function createDailyToken(roomName: string, userName: string, isOwner = false) {
  const apiKey = process.env.DAILY_API_KEY
  
  if (!apiKey) {
    throw new Error("Missing Daily.co API key in environment variables.")
  }

  const res = await fetch("https://api.daily.co/v1/meeting-tokens", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: {
        room_name: roomName,
        user_name: userName,
        is_owner: isOwner,
        exp: Math.floor(Date.now() / 1000) + 7200, // 2hr expiry
      },
    }),
  })

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create Daily token: ${res.statusText} - ${text}`);
  }

  return res.json()
}
