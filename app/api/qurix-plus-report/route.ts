import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    const templatePath = path.join(process.cwd(), "app", "api", "qurix-plus-report", "template.html")
    let html = fs.readFileSync(templatePath, "utf-8")

    // Inject a small script to automatically trigger the print dialog when the page loads
    const printScript = `
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 500);
        };
      </script>
    </body>`
    
    html = html.replace('</body>', printScript)

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
      },
    })
  } catch (error) {
    console.error("Failed to load QURIX Plus template", error)
    return new NextResponse("Error loading report template", { status: 500 })
  }
}
