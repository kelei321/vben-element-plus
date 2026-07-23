import { afterEach, describe, expect, it } from 'vitest';

import { unmountGlobalLoading } from './loading';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('unmountGlobalLoading', () => {
  it('does nothing when the global loading element is absent', () => {
    expect(() => unmountGlobalLoading()).not.toThrow();
  });

  it('hides and removes global loading elements after the transition', () => {
    document.body.innerHTML = `
      <div id="__app-loading__"></div>
      <div data-app-loading="inject-head"></div>
      <div data-app-loading="inject-style"></div>
    `;

    const loadingElement = document.querySelector('#__app-loading__');

    unmountGlobalLoading();

    expect(loadingElement?.classList.contains('hidden')).toBe(true);

    loadingElement?.dispatchEvent(new Event('transitionend'));

    expect(document.querySelector('#__app-loading__')).toBeNull();
    expect(document.querySelectorAll('[data-app-loading^="inject"]')).toHaveLength(
      0,
    );
  });
});
