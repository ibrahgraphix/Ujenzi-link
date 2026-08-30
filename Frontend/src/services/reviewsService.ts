import { Review } from '../types';
import { MOCK_REVIEWS } from '../data/mockData';

const STORAGE_KEY = 'ujenzi_reviews_v1';

function getFromStorage<T>(key: string, defaultData: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(item);
  } catch {
    return defaultData;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to save data to ${key}`, err);
  }
}

export async function getReviews(providerId?: string): Promise<Review[]> {
  const reviews = getFromStorage<Review[]>(STORAGE_KEY, MOCK_REVIEWS);
  if (providerId) {
    return reviews.filter((r) => r.providerId === providerId);
  }
  return reviews;
}

export async function addReview(review: Omit<Review, 'id' | 'date'>): Promise<Review> {
  const reviews = getFromStorage<Review[]>(STORAGE_KEY, MOCK_REVIEWS);
  const newRev: Review = {
    ...review,
    id: `rev-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
  };
  reviews.unshift(newRev);
  saveToStorage(STORAGE_KEY, reviews);
  return newRev;
}
