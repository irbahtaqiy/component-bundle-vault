# Component Bundle Vault

Full-auto UI component extractor buat designer yang bridging ke dev. Bukan sekedar copy HTML+class, tapi bundle lengkap: matched CSS, CSS variables, fonts, icon fonts, SVG, pseudo-elements/states, plus asset hints biar bisa dipake langsung di project lo.

## Fitur
- **Element Picker** - Klik elemen langsung dari halaman manapun
- **Matched CSS Extraction** - Cuma ambil rule yang beneran kepake ke element + child
- **CSS Variables Resolver** - Bawa `var(--...)` yang dipake + definisinya dari `:root/[data-theme]`
- **Font & Icon Detector** - Deteksi `font-family`, `@font-face`, Google/Bunny/Typekit link, Material Symbols/Font Awesome/Phosphor/Remix Icon
- **Inline SVG** - Kebawa otomatis kalo ada SVG
- **States & Pseudo** - Ambil `:hover`, `:focus-visible`, `:active`, `::before`, `::after` yang relevan
- **Live Preview** - Langsung keliatan hasil bundle
- **Assets Tab** - List "Butuh apa aja" biar lo tau harus nambahin apa
- **All-in-one Copy** - Copy HTML + `<style>` + asset hints dalam 1 klik
- **Vault (IndexedDB)** - Simpen bundle lengkap, search, load, delete

## Cara Install (Load Unpacked)

1. Download/clone folder `component-bundle-vault/`
2. Buka `chrome://extensions/`
3. Aktifin `Developer mode` (pojok kanan atas)
4. Klik `Load unpacked`
5. Pilih folder `component-bundle-vault/`
6. Pin extension nya kalo mau

## Cara Pake

1. Buka halaman yang mau lo extract komponen nya
2. Klik icon `Component Bundle Vault` -> Side Panel kebuka
3. Klik `Pick Element` -> Cursor jadi crosshair
4. Klik elemen yang lo pengenin (button/card/input/dll)
5. Tunggu sebentar, langsung muncul di tab `Preview`
6. Cek `Assets` buat liat font/icon/link yang perlu ditambahin ke project lo
7. Pindah ke `Code` -> `Copy All-in-one` atau simpen ke `Vault`

## Catatan & Keterbatasan

- **Cross-origin stylesheets** - Kalo CSS file nya di-block CORS, isi filenya gabisa dibaca. Solusinya udah di-fallback jadi munculin `<link>` nya di tab Assets.
- **Cross-origin iframe** - Gabisa extract full.
- **CSS-in-JS murni** - Kadang class random, hasilnya bisa perlu rapihin dikit.
- **Shadow DOM tertutup** - Tergantung setup
- **Etika** - Buat belajar, referensi, dan dipake di project lo sendiri

## Roadmap
- [ ] Better CSS-in-JS computed style merger
- [ ] Auto-generate minimal CSS
- [ ] Export as JSON/ZIP bundle
- [ ] Edit before save
- [ ] Light mode buat sidepanel
- [ ] Support Firefox
