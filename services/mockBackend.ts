
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

class BackendService {
  private currentUser: User | null = null;
  private mockPosts: Post[] = [];

  async login(email: string, password?: string): Promise<User> {
    if (USE_REAL_DB && supabase) {
      // Intento de login con Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: password || 'default_pass' 
      });

      if (authError) throw new Error(authError.message);

      // Cargar el perfil asociado
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*, circle:circles(target_id)')
        .eq('id', authData.user.id)
        .single();

      if (profileError) throw new Error("Profile not found");

      const user = this.mapDbUserToUser(profile);
      user.circleIds = profile.circle?.map((c: any) => c.target_id) || [];
      this.currentUser = user;
      return user;
    }
    
    // Fallback demo
    return this.register("User", "Demo", email, Religion.OTHER, Visibility.PUBLIC, "Spanish", "password");
  }

  async register(
    firstName: string, lastName: string, email: string, 
    religion: Religion, visibility: Visibility, language: Language,
    password?: string
  ): Promise<User> {
    
    if (USE_REAL_DB && supabase) {
      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: password || 'default_pass'
      });

      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error("Register failed");

      // 2. Crear perfil en tabla profiles
      const avatarUrl = `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random`;
      const { error: profileError } = await supabase.from('profiles').insert([{
        id: authData.user.id,
        email: email,
        first_name: firstName,
        last_name: lastName,
        religion: religion,
        visibility: visibility,
        language: language,
        avatar_url: avatarUrl,
        is_premium: false
      }]);

      if (profileError) throw new Error(profileError.message);

      const newUser: User = {
        id: authData.user.id,
        name: `${firstName} ${lastName}`,
        firstName, lastName, email, religion, visibility, language,
        dateOfBirth: '1990-01-01', nationality: 'Global', gender: 'N/A',
        avatarUrl, isPremium: false, circleIds: []
      };
      this.currentUser = newUser;
      return newUser;
    }

    // Mock local
    const mockUser: User = {
      id: `u${Date.now()}`,
      name: `${firstName} ${lastName}`,
      firstName, lastName, email, religion, visibility, language,
      dateOfBirth: '1990-01-01', nationality: 'Global', gender: 'N/A',
      avatarUrl: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random`,
      isPremium: false, circleIds: []
    };
    this.currentUser = mockUser;
    return mockUser;
  }

  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    if (this.currentUser && this.currentUser.id === userId) {
      this.currentUser = { ...this.currentUser, ...data };
      if (USE_REAL_DB && supabase) {
        const { error } = await supabase.from('profiles').update({
          avatar_url: data.avatarUrl,
          first_name: data.firstName,
          last_name: data.lastName,
          language: data.language
        }).eq('id', userId);
        if (error) console.error("Update DB error:", error);
      }
      return this.currentUser;
    }
    throw new Error("Unauthorized");
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
        const { data, error } = await supabase
          .from('posts')
          .select('*, comments(*)')
          .order('promotion_tier', { ascending: false })
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data) {
          return data.map((p: any) => this.mapDbPostToPost(p));
        }
      } catch (e) {
        console.error("DB Feed Error", e);
      }
    }
    return this.mockPosts;
  }

  async createPost(content: string, user: User, isMiracle: boolean, promotionTier: PromotionTier): Promise<Post> {
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

    if (USE_REAL_DB && supabase) {
      const { error } = await supabase.from('posts').insert([{
        id: newPost.id, 
        user_id: user.id, 
        author_name: user.name,
        author_religion: user.religion, 
        author_avatar_url: user.avatarUrl,
        content: newPost.content, 
        language: newPost.language,
        is_miracle: newPost.isMiracle, 
        promotion_tier: newPost.promotionTier
      }]);
      if (error) console.error("Create post error:", error);
    } else {
      this.mockPosts = [newPost, ...this.mockPosts];
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

  private mapDbUserToUser(data: any): User {
    return {
      id: data.id, 
      name: `${data.first_name} ${data.last_name}`,
      firstName: data.first_name, 
      lastName: data.last_name, 
      email: data.email,
      dateOfBirth: data.date_of_birth || '1990-01-01', 
      nationality: data.nationality || 'Global', 
      gender: data.gender || 'N/A',
      religion: data.religion as Religion, 
      visibility: data.visibility as Visibility, 
      language: data.language as Language,
      avatarUrl: data.avatar_url, 
      isPremium: data.is_premium || false, 
      circleIds: []
    };
  }

  private mapDbPostToPost(p: any): Post {
    return {
      id: p.id, 
      userId: p.user_id, 
      authorName: p.author_name,
      authorReligion: p.author_religion as Religion, 
      authorAvatarUrl: p.author_avatar_url,
      content: p.content, 
      language: p.language as Language,
      timestamp: new Date(p.created_at).getTime(),
      likes: p.likes || 0, 
      prayers: p.prayers || 0,
      isMiracle: p.is_miracle, 
      isAnswered: p.is_answered,
      promotionTier: p.promotion_tier as PromotionTier, 
      gifts: [],
      comments: p.comments?.map((c: any) => ({
        id: c.id, 
        userId: c.user_id, 
        authorName: c.author_name,
        authorAvatarUrl: c.author_avatar_url, 
        content: c.content,
        timestamp: new Date(c.created_at).getTime()
      })) || []
    };
  }

  async logout() { 
    if (USE_REAL_DB && supabase) await supabase.auth.signOut();
    this.currentUser = null; 
  }
}

export const mockBackend = new BackendService();
