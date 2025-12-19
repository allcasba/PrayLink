
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, Post, Religion, Visibility, Language, PromotionTier, PaymentMethod, Tithe } from '../types';

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

const INITIAL_POSTS: Post[] = [
  {
    id: 'seed-1',
    userId: 'u-system',
    authorName: 'Guía Espiritual',
    authorReligion: Religion.OTHER,
    authorAvatarUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=100&h=100&fit=crop',
    content: 'Bienvenido al Altar Global. Que este espacio sea de bendición para tu vida y la de tus seres queridos.',
    language: 'Spanish',
    timestamp: Date.now() - 3600000,
    likes: 124,
    prayers: 89,
    isMiracle: false,
    promotionTier: PromotionTier.GOLD,
    gifts: [],
    comments: []
  },
  {
    id: 'seed-2',
    userId: 'u-system-2',
    authorName: 'Maria Gracia',
    authorReligion: Religion.CHRISTIANITY,
    authorAvatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    content: 'Pido oración por la salud de mi abuela que se encuentra en recuperación quirúrgica. Gracias hermanos.',
    language: 'Spanish',
    timestamp: Date.now() - 1800000,
    likes: 45,
    prayers: 230,
    isMiracle: true,
    promotionTier: PromotionTier.PLATINUM,
    gifts: [],
    comments: []
  }
];

class BackendService {
  private currentUser: User | null = null;
  private mockPosts: Post[] = [...INITIAL_POSTS];

  async login(email: string): Promise<User> {
    if (USE_REAL_DB && supabase) {
      const { data, error } = await supabase.from('profiles').select('*, circle:circles(target_id)').eq('email', email).single();
      if (error || !data) throw new Error("Usuario no encontrado.");
      const user = this.mapDbUserToUser(data);
      user.circleIds = data.circle?.map((c: any) => c.target_id) || [];
      this.currentUser = user;
      return user;
    }
    return this.register("Usuario", "Demo", email, Religion.OTHER, Visibility.PUBLIC, "Spanish");
  }

  async register(
    firstName: string, lastName: string, email: string, 
    religion: Religion, visibility: Visibility, language: Language
  ): Promise<User> {
    const newUser: User = {
      id: `u${Date.now()}`,
      name: `${firstName} ${lastName}`,
      firstName, lastName, email, religion, visibility, language,
      dateOfBirth: '1990-01-01', nationality: 'Global', gender: 'N/A',
      avatarUrl: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random`,
      isPremium: false, circleIds: []
    };

    if (USE_REAL_DB && supabase) {
      await supabase.from('profiles').upsert([{
        id: newUser.id, email: newUser.email, first_name: newUser.firstName,
        last_name: newUser.lastName, religion: newUser.religion,
        visibility: newUser.visibility, language: newUser.language,
        avatar_url: newUser.avatarUrl
      }]);
    }
    this.currentUser = newUser;
    return newUser;
  }

  async toggleCircle(targetId: string): Promise<string[]> {
    if (!this.currentUser) return [];
    const isAdding = !this.currentUser.circleIds?.includes(targetId);

    if (USE_REAL_DB && supabase) {
      if (isAdding) {
        await supabase.from('circles').insert([{ user_id: this.currentUser.id, target_id: targetId }]);
        this.currentUser.circleIds = [...(this.currentUser.circleIds || []), targetId];
      } else {
        await supabase.from('circles').delete().eq('user_id', this.currentUser.id).eq('target_id', targetId);
        this.currentUser.circleIds = (this.currentUser.circleIds || []).filter(id => id !== targetId);
      }
    } else {
      if (isAdding) {
        this.currentUser.circleIds = [...(this.currentUser.circleIds || []), targetId];
      } else {
        this.currentUser.circleIds = (this.currentUser.circleIds || []).filter(id => id !== targetId);
      }
    }
    return this.currentUser.circleIds || [];
  }

  async getFeed(viewer: User): Promise<Post[]> {
    if (USE_REAL_DB && supabase) {
      try {
        const { data } = await supabase.from('posts').select('*, comments(*)').order('promotion_tier', { ascending: false }).order('created_at', { ascending: false });
        if (data && data.length > 0) {
          const dbPosts = data.map((p: any) => this.mapDbPostToPost(p));
          // Mezclamos con los posts locales nuevos que aún no estén en el fetch
          const localOnly = this.mockPosts.filter(mp => !dbPosts.some(dp => dp.id === mp.id));
          return [...localOnly, ...dbPosts];
        }
      } catch (e) {
        console.error("DB Feed Error", e);
      }
    }
    return this.mockPosts;
  }

  async createPost(content: string, user: User, isMiracle: boolean, promotionTier: PromotionTier): Promise<Post> {
    const newPost: Post = {
      id: `p${Date.now()}`, userId: user.id, authorName: user.name,
      authorReligion: user.religion, authorAvatarUrl: user.avatarUrl,
      content, language: user.language, timestamp: Date.now(),
      likes: 0, prayers: 0, isMiracle, isAnswered: false,
      promotionTier, gifts: [], comments: []
    };

    // Añadir a la lista local inmediatamente
    this.mockPosts = [newPost, ...this.mockPosts];

    if (USE_REAL_DB && supabase) {
      await supabase.from('posts').insert([{
        id: newPost.id, user_id: user.id, author_name: user.name,
        author_religion: user.religion, author_avatar_url: user.avatarUrl,
        content: newPost.content, language: newPost.language,
        is_miracle: newPost.isMiracle, promotion_tier: newPost.promotionTier
      }]);
    }
    return newPost;
  }

  async processTithe(userId: string, amount: number, method: PaymentMethod): Promise<Tithe> {
    const tithe: Tithe = { id: `t${Date.now()}`, userId, amount, currency: 'USD', method, timestamp: Date.now() };
    if (USE_REAL_DB && supabase) {
      await supabase.from('tithes').insert([{ id: tithe.id, user_id: userId, amount, method }]);
      if (amount >= 9.99) await supabase.from('profiles').update({ is_premium: true }).eq('id', userId);
    }
    if (this.currentUser && amount >= 9.99) this.currentUser.isPremium = true;
    return tithe;
  }

  async interactPost(postId: string, type: 'like' | 'pray') {
    if (USE_REAL_DB && supabase) {
      await supabase.rpc('increment_counter', { row_id: postId, column_name: type === 'like' ? 'likes' : 'prayers' });
    }
    const post = this.mockPosts.find(p => p.id === postId);
    if (post) {
      if (type === 'like') post.likes++;
      else post.prayers++;
    }
  }

  async addComment(postId: string, content: string, user: User) {
    const comment = { id: String(Date.now()), userId: user.id, authorName: user.name, authorAvatarUrl: user.avatarUrl, content, timestamp: Date.now() };
    if (USE_REAL_DB && supabase) {
      await supabase.from('comments').insert([{ post_id: postId, user_id: user.id, author_name: user.name, author_avatar_url: user.avatarUrl, content }]);
    }
    const post = this.mockPosts.find(p => p.id === postId);
    if (post) post.comments = [...(post.comments || []), comment];
    return comment;
  }

  private mapDbUserToUser(data: any): User {
    return {
      id: data.id, name: `${data.first_name} ${data.last_name}`,
      firstName: data.first_name, lastName: data.last_name, email: data.email,
      dateOfBirth: data.date_of_birth, nationality: data.nationality, gender: data.gender,
      religion: data.religion, visibility: data.visibility, language: data.language,
      avatarUrl: data.avatar_url, isPremium: data.is_premium, circleIds: []
    };
  }

  private mapDbPostToPost(p: any): Post {
    return {
      id: p.id, userId: p.user_id, authorName: p.author_name,
      authorReligion: p.author_religion, authorAvatarUrl: p.author_avatar_url,
      content: p.content, language: p.language,
      timestamp: new Date(p.created_at).getTime(),
      likes: p.likes || 0, prayers: p.prayers || 0,
      isMiracle: p.is_miracle, isAnswered: p.is_answered,
      promotionTier: p.promotion_tier, gifts: [],
      comments: p.comments?.map((c: any) => ({
        id: c.id, userId: c.user_id, authorName: c.author_name,
        authorAvatarUrl: c.author_avatar_url, content: c.content,
        timestamp: new Date(c.created_at).getTime()
      })) || []
    };
  }

  logout() { this.currentUser = null; }
}

export const mockBackend = new BackendService();
