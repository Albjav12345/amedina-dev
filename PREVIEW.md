# Preview from another device

On the PC with the repository, run:

```powershell
npm run dev:lan
```

This starts Vite on port 5173 and prints the available network addresses. The local API stays on loopback and Vite proxies `/api` requests to it. Code changes reload automatically, and saving the content workbook updates the preview too.

For a laptop on another network, connect both devices to the same Tailscale network and open the PC's Tailscale address:

- Website: <http://100.80.199.3:5173/>
- Stack: <http://100.80.199.3:5173/stack>

An alternative private entry is configured with Tailscale Serve at <http://100.80.199.3:8080/>. It forwards TCP to the local development server and remains available while Tailscale and the server are running. It does not require opening a router port.

To configure this entry again:

```powershell
& 'C:/Program Files/Tailscale/tailscale.exe' serve --bg --tcp=8080 tcp://127.0.0.1:5173
```

To remove only this entry:

```powershell
& 'C:/Program Files/Tailscale/tailscale.exe' serve --tcp=8080 off
```

Keep the PC awake, Tailscale connected, and the development command running. Stop it with Ctrl+C. This serves the local working copy without pushing to GitHub or deploying to Vercel. Use the address printed by the command if the PC's Tailscale IP changes.

If it does not connect, check that the laptop can reach the PC in Tailscale and that Windows Firewall permits Node.js on the Tailscale interface for TCP port 5173. No router port forwarding is needed.

`npm run dev` continues to bind to 127.0.0.1 by default for a preview limited to this PC.
