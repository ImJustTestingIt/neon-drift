# Neon Drift

A self-contained JavaScript arcade game built with HTML canvas.

## Play

The public GitHub Pages build should be available at:

https://imjusttestingit.github.io/neon-drift/

You can also open `index.html` directly in a browser.

## Controls

- Move with WASD, arrow keys, mouse, or touch.
- Hold Space, Shift, mouse, or touch for overdrive.
- Press M to toggle sound.
- Press Ctrl + Shift + D or open `index.html#debug` to enable local diagnostics.
- Collect prism shards, pass through gates, and avoid drones.
- Open the hidden admin panel with `#admin` in the URL or Ctrl + Shift + A.

## Admin Secret

The admin passphrase is not committed to the repository. Set a GitHub Actions repository secret named `NEON_DRIFT_ADMIN_SECRET`, then run the Pages workflow. The deploy step publishes only a SHA-256 hash to `admin-config.js`.

There is no default admin password. The committed `admin-config.js` is only a fallback placeholder so local/direct runs do not 404 while loading the admin config script.

For local admin testing, replace the placeholder hash in an uncommitted local copy of `admin-config.js`:

```js
window.NeonDriftAdminConfig = { secretHash: "<sha256-of-your-passphrase>" };
```

Because this is a static GitHub Pages game, the admin panel is suitable for local game controls and lightweight moderation settings. Do not put truly sensitive server-side powers behind this client-only panel.

## Admin Actions

After unlocking the admin panel, these actions are available:

- Score multiplier: set scoring to 1x, 2x, 5x, or 10x.
- Best score: enter a value and save it as the local best score.
- God mode: toggle collision immunity.
- Refill boost: fill the overdrive meter.
- +10,000 score: add test score immediately.
- Save best: save the entered best score to local storage.
- Clear best: remove the locally stored best score.
- Restart run: restart gameplay immediately.
- Debug mode: toggle the local diagnostics overlay.

## Debugging Performance

Debug mode is local-only and does not send telemetry anywhere. Enable it with Ctrl + Shift + D, `#debug`, or the admin Debug mode action.

Debug mode shows:

- current FPS
- latest frame time
- worst observed frame time
- frame spike count
- gate-pass count
- latest gate-pass timing

It also writes browser console messages for frame spikes over 50 ms and for gate-pass timing. Those logs include local gameplay counters and object counts so gate, particle, audio, or drone pressure can be compared while reproducing lag.

The first audio context is warmed during the user start/pointer gesture so the first gate-pass sound does not create audio infrastructure in the same frame as the gate reward.

## Deploy Actions

The GitHub Pages workflow runs these steps:

1. Checkout: reads the current repository contents.
2. Generate admin config: hashes `NEON_DRIFT_ADMIN_SECRET` into `admin-config.js`, or writes the placeholder hash when no secret is configured.
3. Setup Pages: prepares the GitHub Pages deployment environment.
4. Upload artifact: uploads the static site files.
5. Deploy to GitHub Pages: publishes the uploaded artifact.

## Files

- `index.html`: complete game, styles, diagnostics overlay, and JavaScript.
- `admin.js`: hidden admin panel and game-control UI.
- `admin-config.js`: fallback admin config placeholder, overwritten by the Pages workflow when a secret is configured.
- `.github/workflows/pages.yml`: GitHub Pages deployment workflow.
- `.nojekyll`: serves the static game files exactly as written.
