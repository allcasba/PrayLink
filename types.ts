
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
    'miracle_seen': 'Milagros Vistos',
    'see_original': 'Ver Original',
    'see_translation': 'Ver Traducción',
    'global_mantle': 'Manto de Oración Global',
    'voices_united': 'Voces Unidas',
    'no_posts': 'No hay publicaciones disponibles.',
    'retry': 'Reintentar Conexión',
    'explore_global': 'Explora el Altar Global para ver más publicaciones fuera de tu fe.',
    'auth_login_title': 'Entrar al Altar',
    'auth_register_title': 'Crear Cuenta Espiritual',
    'auth_email': 'Correo Electrónico',
    'auth_password': 'Contraseña',
    'auth_first_name': 'Nombre',
    'auth_last_name': 'Apellido',
    'auth_switch_to_register': '¿Nuevo en PrayLink? Regístrate aquí',
    'auth_switch_to_login': '¿Ya eres parte? Inicia sesión',
    'change_avatar': 'Cambiar Imagen',
    'avatar_url_label': 'URL de la nueva imagen',
    'save': 'Guardar',
    'cancel': 'Cancelar',
    'spiritual_edition': 'Edición',
    'landing_hero_title_1': 'Donde tu oración',
    'landing_hero_title_2': 'encuentra eco.',
    'landing_hero_subtitle': 'PrayLink conecta intenciones con miles de oradores.',
    'landing_cta_primary': 'PEDIR UN MILAGRO',
    'landing_cta_secondary': 'Ser un orador'
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
    'miracle_seen': 'Miracles Seen',
    'see_original': 'See Original',
    'see_translation': 'See Translation',
    'global_mantle': 'Global Prayer Mantle',
    'voices_united': 'Voices United',
    'no_posts': 'No posts available at this time.',
    'retry': 'Retry Connection',
    'explore_global': 'Explore the Global Altar to see posts outside your faith.',
    'auth_login_title': 'Enter the Altar',
    'auth_register_title': 'Create Spiritual Account',
    'auth_email': 'Email Address',
    'auth_password': 'Password',
    'auth_first_name': 'First Name',
    'auth_last_name': 'Last Name',
    'auth_switch_to_register': 'New to PrayLink? Register here',
    'auth_switch_to_login': 'Already part? Log in',
    'change_avatar': 'Change Image',
    'avatar_url_label': 'New image URL',
    'save': 'Save',
    'cancel': 'Cancel',
    'spiritual_edition': 'Edition',
    'landing_hero_title_1': 'Where your prayer',
    'landing_hero_title_2': 'finds echo.',
    'landing_hero_subtitle': 'PrayLink connects intentions with thousands of speakers.',
    'landing_cta_primary': 'REQUEST A MIRACLE',
    'landing_cta_secondary': 'Be a speaker'
  },
  'French': { 'welcome': 'Bienvenue sur PrayLink', 'slogan': 'Multipliez le pouvoir de votre foi' },
  'German': { 'welcome': 'Willkommen bei PrayLink', 'slogan': 'Vervielfachen Sie die Kraft Ihres Glaubens' },
  'Arabic': { 'welcome': 'مرحبًا بك في PrayLink', 'slogan': 'ضاعف قوة إيمانك' },
  'Hebrew': { 'welcome': 'ברוך הבא ל-PrayLink', 'slogan': 'הכפל את כוח האמונה שלך' },
  'Hindi': { 'welcome': 'PrayLink में आपका स्वागत है', 'slogan': 'अपने विश्वास की शक्ति बढ़ाएँ' },
  'Portuguese': { 'welcome': 'Bem-vindo ao PrayLink', 'slogan': 'Multiplique o poder da sua fé' }
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
  circleIds?: string[];
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
