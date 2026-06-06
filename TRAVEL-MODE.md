# TRAVEL-MODE.md

## Always-On Dashboard (Travel Mode)

To access your Krysalis OS from anywhere in the world (e.g. via Tailscale), you need the Next.js server to run continuously in the background, even when you close the terminal.

Since you are on Windows, the easiest way to do this is using PM2, a production process manager for Node.js.

### Step 1: Install PM2

Open a terminal as Administrator and run:

```powershell
npm install -g pm2
```

### Step 2: Start the Dashboard

Navigate to your Krysalis OS directory and start it with PM2:

```powershell
cd "C:\Users\bolus\OneDrive\Desktop\Krysalis OS"
pm2 start npm --name "krysalis-os" -- run start
```

*(Note: ensure you have built the project with `npm run build` first).*

### Step 3: Save and Set Up Startup Script

To ensure it restarts if your computer reboots:

```powershell
npm install -g pm2-windows-startup
pm2-startup install
pm2 save
```

### Step 4: Access via Tailscale

1. Ensure Tailscale is installed and connected on this machine.
2. Get your Tailscale IP (e.g., `100.x.x.x`).
3. From any other device on your Tailscale network (your phone, a laptop on the road), simply visit `http://100.x.x.x:3000`.

You now have a portable agentic OS command center available anywhere.
