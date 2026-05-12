import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

export async function POST(req: NextRequest) {
  const { url } = (await req.json()) as { url?: string };
  if (!url?.includes("instagram.com")) {
    return NextResponse.json({ error: "URL Instagram invalid." }, { status: 400 });
  }

  const projectRoot = process.cwd();
  // Use indirect concatenation to prevent Turbopack from statically tracing the .venv symlink
  const venvDir = [".venv", "bin", "python"].join(path.sep);
  const pythonBin = path.join(projectRoot, venvDir);
  const script = path.join(projectRoot, "scripts", "transcribe_reel.py");

  const transcript = await new Promise<string>((resolve, reject) => {
    const proc = spawn(pythonBin, [script, url], { timeout: 120_000 });
    let out = "";
    let err = "";
    proc.stdout.on("data", (d: Buffer) => { out += d.toString(); });
    proc.stderr.on("data", (d: Buffer) => { err += d.toString(); });
    proc.on("close", (code) => {
      if (code === 0) resolve(out.trim());
      else reject(new Error(err.trim() || `Exit ${code}`));
    });
    proc.on("error", reject);
  }).catch((e: Error) => {
    throw new Error(e.message);
  });

  return NextResponse.json({ transcript });
}
