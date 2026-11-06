// Inline SVG flags (trusted, static) drawn in a 3:2 box. No imports, so a landing page can use them
// without pulling either country's config into its bundle.

export const FLAG_IN =
  '<rect width="30" height="20" fill="#fff"/><rect width="30" height="6.67" fill="#FF9933"/><rect y="13.33" width="30" height="6.67" fill="#138808"/>' +
  '<circle cx="15" cy="10" r="2.6" fill="none" stroke="#000080" stroke-width="0.6"/><circle cx="15" cy="10" r="0.5" fill="#000080"/>';
export const FLAG_AE =
  '<rect width="30" height="20" fill="#fff"/><rect width="30" height="6.67" fill="#00732F"/><rect y="13.33" width="30" height="6.67" fill="#000"/>' +
  '<rect width="8" height="20" fill="#FF0000"/>';
