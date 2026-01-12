---
description: How to run browser tests using local WSL Chromium
---

In this WSL environment, the default Antigravity browser service may have connection issues. Use the locally installed Chromium instead.

1. Ensure any existing Chromium processes are closed:
   ```bash
   pkill -f chromium
   ```

2. Start the local Chromium with remote debugging enabled:
   ```bash
   DISPLAY=:0 /usr/bin/chromium-browser --remote-debugging-port=9222 &
   ```

3. Wait for the CDP port to become responsive:
   ```bash
   curl -s http://127.0.0.1:9222/json/version
   ```

4. Use the `browser_subagent` or other browser tools as usual. They will automatically connect to the existing session on port 9222.
