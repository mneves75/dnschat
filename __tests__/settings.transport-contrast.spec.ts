/**
 * Regression guard for the transport-test button contrast bug.
 *
 * Bug: the "Test Selected Preference" button and the Native/UDP/TCP force pills
 * rendered their label with `color: palette.userBubble` — the SAME systemBlue as
 * the LiquidGlassWrapper "interactive" fill — making the text invisible/illegible
 * (see Settings screenshot, blue-on-blue). The fix uses the dedicated
 * `palette.bubbleTextOnBlue` (#FFFFFF) token instead.
 *
 * Hermetic source-policy test (preferred per project memory): it inspects the
 * source rather than booting the GlassSettings render tree, which pollutes the
 * shared Platform.OS mock under `jest --runInBand`.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const SOURCE = readFileSync(
  join(__dirname, '..', 'src', 'navigation', 'screens', 'GlassSettings.tsx'),
  'utf8',
);

describe('Settings transport-test button contrast', () => {
  it('does not reintroduce the blue-on-blue label (color: palette.userBubble on the transport buttons)', () => {
    // The exact buggy snippet that shipped before the fix.
    expect(SOURCE).not.toContain('<Text style={{ color: palette.userBubble }}>');
  });

  it('renders the primary test button label with the white-on-blue token', () => {
    expect(SOURCE).toContain('styles.transportTestButtonText');
    const block = SOURCE.slice(SOURCE.indexOf('styles.transportTestButtonText'));
    expect(block.slice(0, 160)).toContain('palette.bubbleTextOnBlue');
  });

  it('renders the force-transport pill labels with the white-on-blue token', () => {
    expect(SOURCE).toContain('styles.transportForceButtonText');
    const block = SOURCE.slice(SOURCE.indexOf('styles.transportForceButtonText'));
    expect(block.slice(0, 160)).toContain('palette.bubbleTextOnBlue');
  });
});
