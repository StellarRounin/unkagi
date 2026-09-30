import { getBangs, type KagiBang } from "./bangs";
import "./global.css";

function noSearchDefaultPageRender() {
  const app = document.querySelector<HTMLDivElement>("#app")!;

  app.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
      <div class="content-container">
        <h1>Unk*gi</h1>
        <p>Use the Kagi !bangs in any search engine. Add the following URL as a custom search engine to your browser. Enables <a href="https://help.kagi.com/kagi/features/bangs.html" target="_blank">all of Kagi's bangs</a> (also used by Helium Browser).</p>

        <div class="url-container">
          <input
            type="text"
            class="url-input"
            value="https://unkagi.link?q=%s"
            readonly
          />

          <button class="copy-button">
            <img src="/clipboard.svg" alt="Copy" />
          </button>
        </div>
      </div>

      <footer class="footer">
        <a href="https://github.com/StellarRounin/unkagi" target="_blank">github</a>
      </footer>
    </div>
  `;

  const copyButton =
    app.querySelector<HTMLButtonElement>(".copy-button")!;

  const copyIcon = copyButton.querySelector("img")!;

  const urlInput =
    app.querySelector<HTMLInputElement>(".url-input")!;

  copyButton.addEventListener("click", async () => {
    await navigator.clipboard.writeText(urlInput.value);

    copyIcon.src = "/clipboard-check.svg";

    setTimeout(() => {
      copyIcon.src = "/clipboard.svg";
    }, 2000);
  });
}

function getBangUrl(
  bang: KagiBang,
  query: string,
): string {
  const encodedQuery = encodeURIComponent(query)
    .replace(/%2F/g, "/");

  return bang.u.replaceAll("{{{s}}}", encodedQuery);
}

async function main() {
  const bangs = await getBangs();

  const LS_DEFAULT_BANG =
    localStorage.getItem("default-bang") ?? "g";

  const defaultBang =
    bangs.find((bang) => bang.t === LS_DEFAULT_BANG);

  function getBangRedirectUrl() {
    const url = new URL(window.location.href);

    const query =
      url.searchParams.get("q")?.trim() ?? "";

    if (!query) {
      noSearchDefaultPageRender();
      return null;
    }

    const match = query.match(/!(\S+)/i);

    const bangCandidate =
      match?.[1]?.toLowerCase();

    let selectedBang =
      bangs.find(
        (bang) =>
          bang.t === bangCandidate ||
          bang.ts?.includes(bangCandidate ?? ""),
      );

    // Si no existe el bang solicitado, usar el default
    selectedBang ??= defaultBang;

    // Remove the first bang from the query
    const cleanQuery =
      query.replace(/!\S+\s*/i, "").trim();

    if (!selectedBang) {
      return null;
    }

    // !gh → abrir github.com
    if (cleanQuery === "") {
      return `https://${selectedBang.d}`;
    }

    return getBangUrl(selectedBang, cleanQuery);
  }

  function doRedirect() {
    const searchUrl = getBangRedirectUrl();

    if (!searchUrl) {
      return;
    }

    window.location.replace(searchUrl);
  }

  doRedirect();
}

main().catch((error) => {
  console.error("Failed to initialize UnKagi:", error);
});
