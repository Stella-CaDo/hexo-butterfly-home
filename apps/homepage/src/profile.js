import settings from '../profile.json';
export const profile = Object.freeze(settings.profile);
export const siteLinks = Object.freeze(settings.siteLinks);
export const socialLinks = Object.freeze(settings.socialLinks);
export const asset = path => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
