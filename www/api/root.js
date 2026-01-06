const {app} = await import('./native/app.js');

export const root = {
    path: (app.isDesktop() ? import.meta.url.split('/api/root.js')[0]: '')
};
