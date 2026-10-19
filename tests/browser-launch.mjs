// Lance le navigateur des parcours Playwright. Par défaut : Microsoft Edge (comme avant).
// Autres environnements : PLAYWRIGHT_EXECUTABLE=/chemin/vers/chrome  ou  PLAYWRIGHT_CHANNEL=chrome
export function launch(chromium) {
  const executablePath = process.env.PLAYWRIGHT_EXECUTABLE;
  const channel =
    process.env.PLAYWRIGHT_CHANNEL ?? (executablePath ? undefined : "msedge");
  return chromium.launch({
    headless: true,
    // Permet à WebGL de fonctionner sans carte graphique (château 3D) dans les environnements sans GPU.
    args: ["--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
    ...(executablePath ? { executablePath } : {}),
    ...(channel ? { channel } : {}),
  });
}
