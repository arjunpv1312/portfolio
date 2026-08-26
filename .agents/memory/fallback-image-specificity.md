---
name: Fallback image specificity
description: Prevent hidden fallback elements from affecting layout when paired with a real image.
---

Fallback elements should not share the primary image class when that class can carry sizing or display overrides. A broad `display: ... !important` rule can override an inline hidden state, causing both elements to occupy the same layout and producing partial or duplicated imagery.

**Why:** CSS specificity can make an inline `display:none` ineffective when a later class rule uses `!important`; flex siblings may then split the available space and make the image look incorrectly cropped.

**How to apply:** Give the real image a targeted selector such as `img.<image-class>`, keep fallback sizing in its own class, and verify both normal-load and image-error states.