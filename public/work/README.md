# Screenshots for the work gallery

Drop a screenshot in here, then set its filename on the matching entry in
`src/data/work.ts`:

```ts
image: "pinche-cafe.webp",
imageAlt: { en: "…", de: "…", es: "…" },
```

Until you do, the card draws a browser frame with the site's domain in it. That is a
deliberate design rather than a missing image, so the page is presentable with no
screenshots at all — add them when you have them, in any order.

## What to capture

- **The top of the landing page**, at a desktop width. The cards crop from the top,
  so anything below the first screenful is wasted bytes.
- **1600 × 1000** or larger, in a 8:5 ratio. The card displays it at 8:5 and crops
  the overflow, so a taller capture loses its bottom rather than squashing.
- **WebP** if you can (`.webp`), otherwise PNG. A landing-page screenshot at this size
  is usually 80–200 KB as WebP and three to four times that as PNG, and this page
  loads several of them.

## Taking them

On Windows, `Win + Shift + S` captures a region. Set the browser window to about
1600 px wide first, hide any cookie banner, and capture from just under the browser
chrome.

If you would rather automate it, ask and I will add a small script that opens each
URL and writes the files here at the right size — it needs a headless browser as a
dev dependency, which is why it is not in the repo already.

## Alt text

`imageAlt` is optional. Leave it out and the image is treated as decorative, which is
correct here: the project's name, summary and domain are all in the card as real text,
so a screenshot adds nothing a screen reader needs. Only write alt text if the image
shows something the surrounding text does not say.
