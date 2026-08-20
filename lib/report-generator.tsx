import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { QurixPlusTemplate, QurixPlusReportData } from "@/components/pdf/QurixPlusTemplate"

/**
 * Scalable backend function to generate a fully hydrated HTML report.
 * This HTML is designed for headless browser rendering (like Puppeteer) or native printing.
 * 
 * @param userId - The ID of the user (for logging or fetching additional metadata if needed)
 * @param userData - The populated dynamic data (profile, history, trends)
 * @returns The final HTML string ready for PDF export
 */
export function generateUserReport(userId: string, userData: QurixPlusReportData): string {
  // We use React's renderToStaticMarkup to convert the JSX template into a raw HTML string.
  // This approach is much cleaner and scalable than string concatenation or old templating languages.
  const htmlContent = renderToStaticMarkup(
    <QurixPlusTemplate data={userData} />
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
