import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Forward the request to the actual API
    const response = await fetch("https://api.phish.directory/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    // Return the same status code and data
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("API proxy error:", error)
    return NextResponse.json({ message: "Failed to process request" }, { status: 500 })
  }
}

