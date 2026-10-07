import photos from '../data/photos.json';

type Slot = Exclude<keyof typeof photos, '_readme'>;

/** Resolve a named photo slot to { src, alt, width, height }. Falls back to the labeled placeholder. */
export function photo(slot: Slot) {
  const p = photos[slot] as { src: string; w: number; h: number; alt: string };
  return {
    src: p.src || `/images/placeholders/${slot}.svg`,
    alt: p.alt,
    width: p.w,
    height: p.h,
  };
}
