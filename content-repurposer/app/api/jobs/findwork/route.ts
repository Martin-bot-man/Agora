import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const search = url.searchParams.get("search") ?? "";
  const location = url.searchParams.get("location") ?? "";

  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (location) params.set("location", location);

  const endpoint = `https://remotive.com/api/remote-jobs?${params.toString()}`;

  const res = await fetch(endpoint, { cache: "no-store" });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
