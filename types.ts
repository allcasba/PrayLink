export enum Religion {
  CHRISTIANITY = 'Christianity',
  ISLAM = 'Islam',
  JUDAISM = 'Judaism',
  HINDUISM = 'Hinduism',
  BUDDHISM = 'Buddhism',
  SIKHISM = 'Sikhism',
  AGNOSTIC = 'Agnostic',
  ATHEIST = 'Atheist',
  OTHER = 'Other'
}

export enum Visibility {
  PUBLIC = 'Public', // Visible to everyone
  SAME_RELIGION = 'Same Religion Only' // Visible only to users of the same religion
}

export type Language = 'English' | 'Spanish' | 'French' | 'German' | 'Arabic' | 'Hebrew' | 'Hindi' | 'Portuguese';

export const SUPPORTED_LANGUAGES: Language[] = [
  'English', 
  'Spanish', 
  'French', 
  'German', 
  'Arabic', 
  'Hebrew', 
  'Hindi', 
  'Portuguese'
];

export enum GiftType {
  CANDLE = 'Candle',
  FLOWER = 'Flower',
  DOVE = 'Dove'
}

export interface Gift {
  type: GiftType;
  senderName: string;
  timestamp: number;
}

export enum PromotionTier {
  NONE = 'None',
  SILVER = 'Silver',     // Low cost, local visibility
  GOLD = 'Gold',         // Medium cost, regional visibility
  PLATINUM = 'Platinum'  // High cost, global visibility
}

export enum PaymentMethod {
  CREDIT_CARD = 'Credit Card',
  PAYPAL = 'PayPal',
  CRYPTO = 'Cryptocurrency',
  APPLE_PAY = 'Apple Pay'
}

export interface Tithe {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  timestamp: number;
}

export interface User {
  id: string;
  name: string; // Display Name (First + Last)
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  nationality: string;
  gender: string;
  religion: Religion;
  visibility: Visibility;
  language: Language;
  avatarUrl: string;
  isPremium: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  authorName: string;
  authorAvatarUrl: string;
  content: string;
  timestamp: number;
}

export interface Post {
  id: string;
  userId: string;
  authorName: string;
  authorReligion: Religion;
  authorAvatarUrl: string;
  content: string;
  language: Language;
  timestamp: number;
  likes: number; // Used for general posts
  prayers: number; // Used for miracle requests
  isMiracle: boolean;
  isAnswered?: boolean; // True if the miracle/prayer was answered (Testimony)
  promotionTier: PromotionTier; // Replaces isPromoted boolean
  promotionExpiresAt?: number; // Timestamp when promotion ends
  gifts: Gift[];
  comments: Comment[];
}
