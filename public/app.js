const statusBadge = document.getElementById("status-badge");
const responseOutput = document.getElementById("response-output");
const buttons = document.querySelectorAll("button[data-url]");

async function callApi(method, url) {
  statusBadge.textContent = `Loading ${method} ${url}...`;
  statusBadge.className = "status-badge";

  try {
    const response = await fetch(url, { method });
    const contentType = response.headers.get("content-type") || "";

    let formattedBody;
    if (contentType.includes("application/json")) {
      const data = await response.json();
      formattedBody = JSON.stringify(data, null, 2);
    } else {
      formattedBody = await response.text();
    }

    statusBadge.textContent = `${response.status} ${response.statusText}`;
    statusBadge.className = response.ok ? "status-badge ok" : "status-badge err";
    responseOutput.textContent = formattedBody;
  } catch (error) {
    statusBadge.textContent = "Network Error";
    statusBadge.className = "status-badge err";
    responseOutput.textContent = `Request failed: ${error.message}`;
  }
}

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    callApi(button.dataset.method, button.dataset.url);
  });
});