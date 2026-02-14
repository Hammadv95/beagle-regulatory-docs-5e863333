

## Change Page Background to Match Logo

The Beagle logo image has a white background, but the Home page uses `bg-secondary` (a warm beige/cream). This creates a visible contrast where the logo's white rectangle stands out against the page.

### Plan

Update the Home page's outer container background from `bg-secondary` to `bg-white` (or `bg-card` / `bg-background`) so the page background seamlessly matches the logo's white background, eliminating the visual mismatch.

### Technical Details

**File: `src/pages/Home.tsx` (line 8)**
- Change `bg-secondary` to `bg-white` on the outer `div`
- This makes the entire page background white, matching the logo image's background so the logo blends in seamlessly

