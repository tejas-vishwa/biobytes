import React from "react"
import { BespokeHealthReportTemplate, BespokeReportData } from "@/components/pdf/BespokeHealthReportTemplate"

/**
 * Scalable backend function to generate a fully hydrated HTML report.
 * This HTML is designed for headless browser rendering (like Puppeteer) or native printing.
 * 
 * @param userId - The ID of the user (for logging or fetching additional metadata if needed)
 * @param userData - The populated dynamic bespoke data schema
 * @returns The final HTML string ready for PDF export
 */
export async function generateUserReport(userId: string, userData: BespokeReportData): Promise<string> {
  // Dynamically import to bypass Next.js 14+ static analysis restrictions on react-dom/server in App Router
  const { renderToStaticMarkup } = await import("react-dom/server")
  
  // We use React's renderToStaticMarkup to convert the JSX template into a raw HTML string.
  const htmlContent = renderToStaticMarkup(
    <BespokeHealthReportTemplate data={userData} />
  )

  // Prepend the HTML5 doctype since renderToStaticMarkup only renders the HTML tags
  const printScript = `
    <script>
      window.onload = function() {
        setTimeout(function() {
          window.print();
        }, 500);
      };
    </script>
  </body>`
  
  return `<!DOCTYPE html>\n${htmlContent.replace('</body>', printScript)}`
}
