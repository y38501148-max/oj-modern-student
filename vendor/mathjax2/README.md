# MathJax 2.7.7 SVG bundle

Source: https://registry.npmjs.org/mathjax/-/mathjax-2.7.7.tgz

Archive SHA-256: `f0054315d40f7288b2373b23520677fd1132a405702dfca05ee6ebe5cd0a8677`

Unmodified upstream files, concatenated in this order:

- `MathJax.js`
- A generated `MathJax.Ajax.Preloading(...)` declaration for the combined configuration
- `config/TeX-AMS_SVG-full.js`
- SVG TeX font metadata and every font directory’s `Main.js`, then all remaining SVG TeX glyph tables, SVG autoload modules and the TeX extensions AMScd, bbox, boldsymbol, cancel, color, enclose, mathchoice, newcommand, unicode and verb (sorted by path; components already in the combined configuration excluded)

Bundled to render formulas through the VPN without CDN scripts or web fonts. Apache-2.0; see LICENSE.

Font `Main.js` files must precede glyph tables such as `BasicLatin.js`: they assign the font object, while glyph tables extend it. Loading `Main.js` afterwards discards those glyphs.

`src/math-layout.js` removes lazy font ranges after loading this complete bundle. Otherwise, a missing glyph such as a fullwidth comma can revisit an already loaded range and fail inside `findBlock`, instead of reaching the SVG missing-glyph fallback. Upstream bundle files remain unchanged.
