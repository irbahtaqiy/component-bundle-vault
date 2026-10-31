# Component Bundle Vault

Extract UI components from any webpage into a clean, reusable bundle — HTML, CSS, CSS variables, fonts, icon fonts, SVGs, and pseudo-states. Runs as an unpacked Chrome Extension (Manifest V3) with a Side Panel.

![Component Bundle Vault](https://img.shields.io/badge/Chrome%20Extension-MV3-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## ✨ Features

- **One-click extraction** - Pick any element on the page with a visual overlay
- **Smart CSS matching** - Captures styles from matching CSS rules (including pseudo-states like `:hover`, `:focus`, `::before`, `::after`)
- **CSS Variables** - Detects and collects used CSS custom properties
- **Fonts & Icon Fonts** - Finds `@font-face` rules and linked font/icon font stylesheets
- **SVGs** - Extracts inline SVGs within the component
- **Live Preview** - See the extracted component rendered instantly in the side panel
- **Assets Panel** - View all required assets (fonts, variables, links) at a glance
- **Clean Code Output** - Get HTML, bundled CSS, or an all-in-one ready-to-paste snippet
- **Local Vault** - Save, load, copy, or delete bundles locally with Dexie (offline-first)
- **Safe & CSP-friendly** - All scripts run locally, no external CDN dependencies

## 🚀 Installation

1. Clone this repository
```bash
git clone https://github.com/irbahtaqiy/component-bundle-vault.git
cd component-bundle-vault
```

2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (top-right)
4. Click **Load unpacked** and select the cloned folder
5. Click the extension icon to open the Side Panel

## 📖 Usage

1. Open any webpage (not `chrome://`, `edge://`, or extension pages)
2. Click the **Component Bundle Vault** icon → Side Panel opens
3. Click **Pick Element** → crosshair overlay appears
4. Hover and click the element you want to extract (press `ESC` to cancel)
5. Switch between tabs:
   - **Preview** - Live rendered component
   - **Assets** - CSS variables, fonts, icon fonts, CDN links, inline SVGs
   - **Code** - Copy HTML, CSS bundle, or All-in-one
   - **Raw Inspect** - Full JSON bundle for debugging
   - **Vault** - Save/load your extracted components

## 🛠️ Tech Stack

- **Manifest V3** - Chrome Extension
- **Side Panel API** - Native side panel UI
- **chrome.scripting** - Inject picker/extractor in `MAIN` world
- **postMessage Bridge** - Safe bundle transfer avoiding extension context issues
- **Dexie.js** - Local IndexedDB storage for the vault
- **Vanilla JS/CSS** - No frameworks, lightweight and fast

## 🔒 Permissions

- `activeTab` - Access current tab
- `scripting` - Inject scripts to extract components
- `sidePanel` - Open side panel UI
- `storage` - Store data locally
- `tabs` - Query active tab
- `<all_urls>` - Run on any webpage

## 📝 Notes

- Works best on regular websites with styles in stylesheets
- Some dynamically injected styles may not be fully captured
- All data stays local in your browser

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.
