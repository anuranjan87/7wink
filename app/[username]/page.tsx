import { getWebsiteContent, trackVisit } from "@/lib/website-actions";
import { notFound } from "next/navigation";
import IframeWithLinkHandler from "@/components/IframeWithLinkHandler";

interface PageProps {
  params: {
    username: string;
  };
}

export default async function UserWebsitePage({ params }: PageProps) {
  const { username } = params;

  try {
    const content = await getWebsiteContent(username);

    if (!content || !content.html) {
      return notFound();
    }

    await trackVisit(username);

    // Define the forceLink script
    const forceLinkScript = `
      <script>
        document.addEventListener('DOMContentLoaded', function () {
          document.querySelectorAll('a[href]').forEach(link => {
            link.addEventListener('click', function (e) {
              e.preventDefault();
              window.parent.postMessage({ openLink: this.href }, '*');
            });
          });
        });
      </script>
    `.trim();

    // Helper to safely inject scripts before </body>
    const injectIntoHtml = (html: string, injection: string): string => {
      return html.includes("</body>")
        ? html.replace("</body>", `${injection}\n</body>`)
        : html + injection;
    };

    let finalHtml = content.html;

    // Inject data script
    if (content.data) {
      finalHtml = injectIntoHtml(finalHtml, `<script>${content.data}</script>`);
    }

    // Inject main script logic
    if (content.script) {
      finalHtml = injectIntoHtml(finalHtml, `<script>${content.script}</script>`);
    }

    // Inject forceLink handler
    finalHtml = injectIntoHtml(finalHtml, forceLinkScript);

    return <IframeWithLinkHandler content={finalHtml} />;
  } catch (error) {
    console.error("Error loading user website:", error);
    return notFound();
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { username } = params;

  return {
    title: `${username}'s Website`,
    description: `Website for ${username}`,
  };
}
