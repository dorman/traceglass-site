import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  isJoinWaitlistHref,
  JoinWaitlistButton,
  WaitlistDialogProvider,
} from '@/components/custom/waitlist-dialog';

vi.mock('@/lib/api-client', () => ({
  apiFetch: vi.fn(async () => ({ ok: true })),
}));

beforeEach(() => {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal('ResizeObserver', ResizeObserverStub);
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

describe('waitlist dialog helpers', () => {
  it('recognizes join-waitlist hrefs', () => {
    expect(isJoinWaitlistHref('#join-waitlist')).toBe(true);
    expect(isJoinWaitlistHref('/waitlist')).toBe(false);
  });

  it('opens from Join the waitlist and closes on Escape', async () => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <WaitlistDialogProvider>
          <JoinWaitlistButton>Join the waitlist</JoinWaitlistButton>
        </WaitlistDialogProvider>,
      );
    });

    const trigger = container.querySelector('button');
    expect(trigger?.textContent).toContain('Join the waitlist');

    await act(async () => {
      trigger?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(document.body.textContent).toContain('local-first CI log triage');
    expect(document.body.textContent).toContain('when it publicly launches');
    expect(document.body.textContent).toContain('Your logs are never uploaded.');
    expect(document.body.textContent).toContain('WAITLIST');
    expect(document.body.textContent?.toLowerCase()).not.toContain('early access');
    expect(document.body.textContent?.toLowerCase()).not.toContain('mid-november');
    expect(document.body.textContent?.toLowerCase()).not.toContain('grammarly');
    expect(document.body.textContent).toContain('Join the waitlist');

    const consent = dialog?.querySelector('button[role="checkbox"]') as HTMLButtonElement | null;
    expect(consent).not.toBeNull();
    expect(consent?.getAttribute('aria-checked')).toBe('false');
    expect(consent?.getAttribute('data-state')).toBe('unchecked');

    // Check consent, close, reopen — consent must reset to unchecked.
    await act(async () => {
      consent?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(consent?.getAttribute('aria-checked')).toBe('true');

    await act(async () => {
      dialog?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
      );
    });

    await vi.waitFor(() => {
      expect(document.querySelector('[role="dialog"]')).toBeNull();
    });

    await act(async () => {
      trigger?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    const reopened = document.querySelector('[role="dialog"]');
    expect(reopened).not.toBeNull();
    const resetConsent = reopened?.querySelector(
      'button[role="checkbox"]',
    ) as HTMLButtonElement | null;
    expect(resetConsent?.getAttribute('aria-checked')).toBe('false');
    expect(resetConsent?.getAttribute('data-state')).toBe('unchecked');

    await act(async () => {
      root.unmount();
    });
  });
});
