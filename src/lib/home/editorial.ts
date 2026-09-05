import { categoryImage, STORE_CATEGORIES } from "@/lib/catalog/categories";

export type HomeTile = {
  src: string;
  labelRu: string;
  labelEn: string;
  video?: string;
  wide?: boolean;
  category?: string;
};

export const HOME_HERO_PANELS: HomeTile[] = [
  { src: "/home/new.jpg", video: "/home/look-1.mp4", labelRu: "Новинки", labelEn: "New in" },
  { src: "/home/stride.jpg", video: "/home/look-2.mp4", labelRu: "Ботфорты", labelEn: "Knee boots" },
  { src: "/home/heels.jpg", video: "/home/look-3.mp4", labelRu: "Ботильоны", labelEn: "Ankle boots", category: "botilony" },
];

export const HOME_CATEGORY_TILES: HomeTile[] = STORE_CATEGORIES.map((item) => ({
  src: categoryImage(item.key),
  labelRu: item.ru,
  labelEn: item.en,
  category: item.key,
}));

export const HOME_LOOKS: HomeTile[] = [
  { src: "/home/editorial.jpg", video: "/home/look-3.mp4", labelRu: "Съёмка", labelEn: "Lookbook" },
  { src: "/home/studio.jpg", video: "/home/look-4.mp4", labelRu: "Студия", labelEn: "Studio" },
];
