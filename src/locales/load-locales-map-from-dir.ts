type LocaleImport = () => Promise<unknown>;

type LocaleMessageImport = () => Promise<{
  default: Record<string, unknown>;
}>;

function loadLocalesMapFromDir(
  regexp: RegExp,
  modules: Record<string, LocaleImport>,
): Record<string, LocaleMessageImport> {
  const localeFiles: Record<string, Record<string, LocaleImport>> = {};
  const localesMap: Record<string, LocaleMessageImport> = {};

  for (const [path, importLocale] of Object.entries(modules)) {
    const match = path.match(regexp);
    const locale = match?.[1];
    const fileName = match?.[2];

    if (locale && fileName) {
      localeFiles[locale] ??= {};
      localeFiles[locale][fileName] = importLocale;
    }
  }

  for (const [locale, files] of Object.entries(localeFiles)) {
    localesMap[locale] = async () => {
      const messages: Record<string, unknown> = {};

      for (const [fileName, importLocale] of Object.entries(files)) {
        const localeModule = (await importLocale()) as { default?: unknown };
        messages[fileName] = localeModule.default;
      }

      return { default: messages };
    };
  }

  return localesMap;
}

export { loadLocalesMapFromDir };
