import type { PlatformBranding } from '../types/database';

const BRANDING_CACHE_KEY = 'platform_branding';

export function applyBranding(branding: PlatformBranding) {
  const root = document.documentElement;
  const map: Record<string, string | null> = {
    '--brand-primary': branding.primary_color,
    '--brand-secondary': branding.secondary_color,
    '--brand-accent': branding.accent_color,
    '--brand-danger': branding.danger_color,
    '--brand-warning': branding.warning_color,
    '--brand-success': branding.success_color,
  };

  Object.entries(map).forEach(([key, value]) => {
    if (value) root.style.setProperty(key, value);
  });

  if (branding.font_family) {
    root.style.setProperty('--brand-font', branding.font_family);
  }
  if (branding.heading_font) {
    root.style.setProperty('--brand-heading-font', branding.heading_font);
  }
  if (branding.custom_css) {
    injectCustomCss(branding.custom_css);
  }

  cacheBranding(branding);
  updateFavicon(branding.favicon_url);
}

export function cacheBranding(branding: PlatformBranding) {
  localStorage.setItem(BRANDING_CACHE_KEY, JSON.stringify(branding));
}

export function getCachedBranding(): PlatformBranding | null {
  const raw = localStorage.getItem(BRANDING_CACHE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PlatformBranding;
  } catch {
    return null;
  }
}

function injectCustomCss(css: string) {
  let styleEl = document.getElementById('branding-custom-css') as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'branding-custom-css';
    document.head.appendChild(styleEl);
  }
  styleEl.innerHTML = css;
}

function updateFavicon(url: string | null) {
  if (!url) return;
  let link: HTMLLinkElement | null = document.querySelector("link[rel='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = url;
}
