# AI Founders Talk Brand Asset & Logo Provenance

This document records the provenance, licensing, geometry base, and modifications for the official brand logo and icon of **AI Founders Talk**.

---

## 1. Concept & Direction
- **Brand Identity**: AI Founders Talk (Trade Publication on AI, RevOps, and B2B Strategy)
- **Concept**: *"Founder Conversation + AI Insight"*
- **Visual Composition**:
  1. **Editorial Speech Bubble**: Symbolizing founder interviews, tactical revenue dialogue, executive discussions, and practitioner Q&As.
  2. **4-Point Sparkle / Star**: Symbolizing artificial intelligence synthesis, algorithmic clarity, and forward-looking data insights.
  3. **Rounded Squircle Container**: High-contrast slate-900 `#0f172a` container providing sharp legibility at 16x16px favicon sizes up to 512x512px app icon sizes.

---

## 2. Base Geometry & Source Library
- **Base Icon Library**: [Tabler Icons](https://tabler-icons.io/)
- **Base Icon Glyphs Adapted**:
  - `message-circle-2` / `message-dots` (Dialogue contour)
  - `sparkles` / `spark` (Four-point star geometry)
- **Source Repository**: `https://github.com/tabler/tabler-icons`
- **Release Version**: Tabler Icons v3.x
- **License**: **MIT License** (permits commercial use, modification, distribution, and private use, subject to the license notice).

---

## 3. Modifications Made
1. **Geometric Harmonization**: Aligned the conversational bubble contour with a centered 4-point AI spark star inside a single vector grid (`32x32` viewport).
2. **Squircle Framing**: Added a 8px-radius squircle bounding box for optimal display across dark and light headers, browser tabs, and bookmark bars.
3. **Contrast Tuning**: Layered subtle 18% white fill opacity within the conversation contour for depth when rendered over dark backgrounds.
4. **Scale Testing**: Optimized stroke widths (`1.75px` contour, `0.5px` star) to prevent anti-aliasing blur when downscaled to 16px favicon dimensions.

---

## 4. Applicable MIT License Notice

```text
MIT License

Copyright (c) 2020-2026 Paweł Kuna (Tabler Icons)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 5. Usage & Implementation
- Central React Component: `src/components/Logo.tsx`
- SVG Vector Assets:
  - `public/icon.svg`
  - `src/app/icon.svg` (Next.js automated icon generator)
- Display Points: Header (`src/components/Header.tsx`), Footer (`src/components/Footer.tsx`), JSON-LD Structured Data (`src/components/seo/JsonLd.tsx`), Metadata (`src/app/layout.tsx`).
- Date Added: September 2026
