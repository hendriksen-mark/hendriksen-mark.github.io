const modules = import.meta.glob('./*.json', { eager: true });

const translations = Object.fromEntries(
  Object.entries(modules).map(([path, mod]) => {
    const langCode = path.replace('./', '').replace('.json', '');
    return [langCode, mod.default];
  }),
);

export default translations;
