
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
  PUBLIC = 'Public',
  SAME_RELIGION = 'Same Religion Only'
}

export type Language = 'English' | 'Spanish' | 'French' | 'German' | 'Arabic' | 'Hebrew' | 'Hindi' | 'Portuguese';

export const SUPPORTED_LANGUAGES: Language[] = [
  'English', 'Spanish', 'French', 'German', 'Arabic', 'Hebrew', 'Hindi', 'Portuguese'
];

export const UI_TRANSLATIONS: Record<Language, Record<string, string>> = {
  'Spanish': {
    'welcome': 'Bienvenido a PrayLink',
    'slogan': 'Multiplica el poder de tu fe',
    'my_circle': 'Mi Círculo',
    'global_altar': 'Altar Global',
    'post_placeholder': '¿Qué milagro declaramos hoy?',
    'publish': 'Publicar',
    'miracle_call': 'Llamado a Milagro',
    'prayers': 'Oraciones',
    'praying': 'Orando',
    'add_circle': 'Agregar al Círculo',
    'in_circle': 'En tu Círculo',
    'daily_inspiration': 'Palabra Diaria',
    'give_offering': 'Dar Ofrenda',
    'spiritual_guide': 'Guía Espiritual',
    'logout': 'Cerrar Sesión',
    'loading_souls': 'Sintonizando almas...',
    'testimony': 'Testimonio',
    'miracle_seen': 'Milagros Vistos'
  },
  'English': {
    'welcome': 'Welcome to PrayLink',
    'slogan': 'Multiply the power of your faith',
    'my_circle': 'My Circle',
    'global_altar': 'Global Altar',
    'post_placeholder': 'What miracle are we declaring today?',
    'publish': 'Publish',
    'miracle_call': 'Call for Miracle',
    'prayers': 'Prayers',
    'praying': 'Praying',
    'add_circle': 'Add to Circle',
    'in_circle': 'In your Circle',
    'daily_inspiration': 'Daily Inspiration',
    'give_offering': 'Give Offering',
    'spiritual_guide': 'Spiritual Guide',
    'logout': 'Logout',
    'loading_souls': 'Tuning into souls...',
    'testimony': 'Testimony',
    'miracle_seen': 'Miracles Seen'
  },
  // Se pueden expandir los demás idiomas aquí...
  'French': { 'welcome': 'Bienvenue sur PrayLink' },
  'German': { 'welcome': 'Willkommen bei PrayLink' },
  'Arabic': { 'welcome': 'مرحبًا بك في PrayLink' },
  'Hebrew': { 'welcome': 'ברוך הבא ל-PrayLink' },
  'Hindi': { 'welcome': 'PrayLink में आपका स्वागत है' },
  'Portuguese': { 'welcome': 'Bem-vindo ao PrayLink' }
};

export interface User {
  id: string;
  name: string;
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
  circleIds?: string[]; // IDs de personas en su círculo
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
  likes: number;
  prayers: number;
  isMiracle: boolean;
  isAnswered?: boolean;
  promotionTier: PromotionTier;
  gifts: any[];
  comments: any[];
}

export enum PromotionTier {
  NONE = 'None',
  SILVER = 'Silver',
  GOLD = 'Gold',
  PLATINUM = 'Platinum'
}

export enum PaymentMethod {
  CREDIT_CARD = 'Credit Card',
  PAYPAL = 'PayPal'
}

export interface Tithe {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  timestamp: number;
}
