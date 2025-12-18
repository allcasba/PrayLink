
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, Post, Religion, Visibility, Language, GiftType, PromotionTier, PaymentMethod, Tithe, Comment } from '../types';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.VITE_SUPABASE_KEY || '';
const USE_REAL_DB = !!(SUPABASE_URL && SUPABASE_KEY);

let supabase: SupabaseClient | null = null;

if (USE_REAL_DB) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  } catch (e) {
    console.error("Failed to initialize Supabase:", e);
  }
}

const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Sarah Jenkins',
    firstName: 'Sarah',
    lastName: 'Jenkins',
    email: 'sarah@example.com',
    dateOfBirth: '1985-04-12',
    nationality: 'United States',
    gender: 'Female',
    religion: Religion.CHRISTIANITY,
    visibility: Visibility.PUBLIC,
    language: 'English',
    avatarUrl: 'https://picsum.photos/150/150?random=1',
    isPremium: true
  },
  {
    id: 'u2',
    name: 'Ahmed Hassan',
    firstName: 'Ahmed',
    lastName: 'Hassan',
    email: 'ahmed@example.com',
    dateOfBirth: '1990-08-23',
    nationality: 'Egypt',
    gender: 'Male',
    religion: Religion.ISLAM,
    visibility: Visibility.SAME_RELIGION,
    language: 'Arabic',
    avatarUrl: 'https://picsum.photos/150/150?random=2',
    isPremium: false
  },
  {
    id: 'u3',
    name: 'David Cohen',
    firstName: 'David',
    lastName: 'Cohen',
    email: 'david@example.com',
    dateOfBirth: '1982-11-05',
    nationality: 'Israel',
    gender: 'Male',
    religion: Religion.JUDAISM,
    visibility: Visibility.PUBLIC,
    language: 'Hebrew',
    avatarUrl: 'https://picsum.photos/150/150?random=3',
    isPremium: false
  }
];

const MOCK_POSTS: Post[] = [
  {
    id: 'p0',
    userId: 'u1',
    authorName: 'Sarah Jenkins',
    authorReligion: Religion.CHRISTIANITY,
    authorAvatarUrl: 'https://picsum.photos/150/150?random=1',
    content: 'Feeling blessed today! The community service went great.',
    language: 'English',
    timestamp: Date.now() - 3600000,
    likes: 12,
    prayers: 0,
    isMiracle: false,
    isAnswered: false,
    promotionTier: PromotionTier.NONE,
    gifts: [],
    comments: []
  },
  {
    id: 'p1',
    userId: 'u2',
    authorName: 'Ahmed Hassan',
    authorReligion: Religion.ISLAM,
    authorAvatarUrl: 'https://picsum.photos/150/150?random=2',
    content: 'Wishing peace and prosperity to all during this holy time.',
    language: 'Arabic',
    timestamp: Date.now() - 7200000,
    likes: 24,
    prayers: 0,
    isMiracle: false,
    isAnswered: false,
    promotionTier: PromotionTier.NONE,
    gifts: [],
    comments: []
  }
];

class BackendService {
  private mockUsers: User[] = [...MOCK_USERS];
  private mockPosts: Post[] = [...MOCK_POSTS];
  private tithes: Tithe[] = [];
  private currentUser: User | null = null;

  async login(email: string): Promise<User> {
    if (USE_REAL_DB && supabase) {
      const { data, error } = await supabase.from('profiles').select('*').eq('email', email).single();
      if (error || !data) throw new Error("User not found in database");
      
      const user: User = {
        id: data.id,
        name: `${data.first_name} ${data.last_name}`,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        dateOfBirth: data.date_of_birth,
        nationality: data.nationality,
        gender: data.gender,
        religion: data.religion as Religion,
        visibility: data.visibility as Visibility,
        language: data.language as Language,
        avatarUrl: data.avatar_url,
        isPremium: data.is_premium
      };
      this.currentUser = user;
      return user;
    } else {
      await new Promise(resolve => setTimeout(resolve, 800));
      const user = this.mockUsers.find(u => u.email === email);
      if (!user) throw new Error("User not found. Use sarah@example.com for demo.");
      this.currentUser = user;
      return user;
    }
  }

  async register(
    firstName: string, 
    lastName: string, 
    email: string, 
    religion: Religion, 
    visibility: Visibility, 
    language: Language,
    dateOfBirth: string,
    nationality: string,
    gender: string
  ): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newUser: User = {
      id: `u${Date.now()}`,
      name: `${firstName} ${lastName}`,
      firstName,
      lastName,
      email,
      dateOfBirth,
      nationality,
      gender,
      religion,
      visibility,
      language,
      avatarUrl: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random`,
      isPremium: false
    };
    this.mockUsers.push(newUser);
    this.currentUser = newUser;
    return newUser;
  }

  async getFeed(viewer: User): Promise<Post[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const now = Date.now();
    
    return this.mockPosts.filter(post => {
      // Logic for religion-based visibility
      const author = this.mockUsers.find(u => u.id === post.userId);
      if (!author) return true; // Author info fallback
      
      if (author.visibility === Visibility.SAME_RELIGION) {
        return author.religion === viewer.religion;
      }
      return true;
    }).sort((a, b) => b.timestamp - a.timestamp);
  }

  async createPost(content: string, user: User, isMiracle: boolean, promotionTier: PromotionTier): Promise<Post> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newPost: Post = {
      id: `p${Date.now()}`,
      userId: user.id,
      authorName: user.name,
      authorReligion: user.religion,
      authorAvatarUrl: user.avatarUrl,
      content,
      language: user.language,
      timestamp: Date.now(),
      likes: 0,
      prayers: 0,
      isMiracle,
      isAnswered: false,
      promotionTier,
      gifts: [],
      comments: []
    };
    this.mockPosts.unshift(newPost);
    return newPost;
  }

  async interactPost(postId: string, type: 'like' | 'pray'): Promise<void> {
    const post = this.mockPosts.find(p => p.id === postId);
    if (post) {
      if (type === 'pray') post.prayers += 1;
      else post.likes += 1;
    }
  }

  async addComment(postId: string, content: string, user: User): Promise<Comment> {
    const post = this.mockPosts.find(p => p.id === postId);
    if (!post) throw new Error("Post not found");

    const newComment: Comment = {
      id: `c${Date.now()}`,
      userId: user.id,
      authorName: user.name,
      authorAvatarUrl: user.avatarUrl,
      content,
      timestamp: Date.now()
    };
    
    post.comments.push(newComment);
    return newComment;
  }

  async sendGift(postId: string, giftType: GiftType, sender: User): Promise<void> {
    const post = this.mockPosts.find(p => p.id === postId);
    if (post) {
      post.gifts.push({
        type: giftType,
        senderName: sender.name,
        timestamp: Date.now()
      });
    }
  }

  async markAsAnswered(postId: string): Promise<void> {
    const post = this.mockPosts.find(p => p.id === postId);
    if (post) post.isAnswered = true;
  }

  async processTithe(userId: string, amount: number, method: PaymentMethod): Promise<Tithe> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const newTithe: Tithe = {
      id: `t-${Date.now()}`,
      userId,
      amount,
      currency: 'USD',
      method,
      timestamp: Date.now()
    };
    this.tithes.push(newTithe);
    return newTithe;
  }

  logout() {
    this.currentUser = null;
  }
}

export const mockBackend = new BackendService();
