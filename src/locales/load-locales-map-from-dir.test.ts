import { describe, expect, it, vi } from 'vitest';

import { loadLocalesMapFromDir } from './load-locales-map-from-dir';

describe('loadLocalesMapFromDir', () => {
  it('groups locale files by language and loads their default exports', async () => {
    const loadCommon = vi.fn(async () => ({
      default: { confirm: 'Confirm' },
    }));
    const loadPage = vi.fn(async () => ({
      default: { title: 'Dashboard' },
    }));

    const localesMap = loadLocalesMapFromDir(
      /\.\/langs\/([^/]+)\/(.*)\.json$/,
      {
        './langs/en-US/common.json': loadCommon,
        './langs/en-US/page.json': loadPage,
      },
    );

    await expect(localesMap['en-US']?.()).resolves.toEqual({
      default: {
        common: { confirm: 'Confirm' },
        page: { title: 'Dashboard' },
      },
    });
    expect(loadCommon).toHaveBeenCalledTimes(1);
    expect(loadPage).toHaveBeenCalledTimes(1);
  });

  it('ignores files that do not match the locale directory pattern', () => {
    const localesMap = loadLocalesMapFromDir(
      /\.\/langs\/([^/]+)\/(.*)\.json$/,
      {
        './other/common.json': async () => ({ default: {} }),
      },
    );

    expect(localesMap).toEqual({});
  });
});
