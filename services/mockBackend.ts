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
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: password || 'default_pass' 
      });

      if (authError) throw new Error(authError.message);

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*, circles:circles(target_id)')
        .eq('id', authData.user.id)
        .single();

      if (profileError) throw new Error("Profile not found in database. Ensure SQL schema is applied.");

      const user = this.mapDbUserToUser(profile);
      user.circleIds = profile.circles?.map((c: any) => c.target_id) || [];
      this.currentUser = user;
      return user;
    }
    
    return this.register("Demo", "User", email, Religion.OTHER, Visibility.PUBLIC, "English", "password");
  }

  async register(
    firstName: string, lastName: string, email: string, 
    religion: Religion, visibility: Visibility, language: Language,
    password?: string, avatarUrl?: string
  ): Promise<User> {
    
    if (USE_REAL_DB && supabase) {
      // 1. Registro en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: password || 'default_pass',
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            religion: religion,
            visibility: visibility,
            language: language,
            avatar_url: avatarUrl
          }
        }
      });

      if (authError) {
        // Manejar error de contraseña común/comprometida
        if (authError.message.includes("compromised")) {
          throw new Error("Security check: This password is too common. Please use a stronger, unique password.");
        }
        throw new Error(authError.message);
      }
      
      if (!authData.user) throw new Error("User creation failed on Auth provider.");

      const userId = authData.user.id;
      
      // 2. Verificación y espera de sincronización del perfil
      // Aumentamos los reintentos y el tiempo ya que el trigger AFTER INSERT puede tener latencia
      let profile = null;
      let lastError = null;

      for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 800)); // 800ms entre intentos
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (data && !error) {
          profile = data;
          break;
        }
        lastError = error;
      }

      if (!profile) {
        console.error("Profile sync error:", lastError);
        throw new Error("Registration partially successful, but profile sync failed. Please try logging in manually.");
      }

      const newUser = this.mapDbUserToUser(profile);
      this.currentUser = newUser;
      return newUser;
    }

    // Fallback Mock
    const mockUser: User = {
      id: `u${Date.now()}`,
      name: `${firstName} ${lastName}`,
      firstName, lastName, email, religion, visibility, language,
      dateOfBirth: '1990-01-01', nationality: 'Global', gender: 'N/A',
      avatarUrl: avatarUrl || `https://ui-avatars.com/api/?name=${firstName}+${lastName}`,
      isPremium: false, circleIds: []
    };
    this.currentUser = mockUser;
    return mockUser;
  }

  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    if (this.currentUser && this.currentUser.id === userId) {
      if (USE_REAL_DB && supabase) {
        const dbUpdate: any = {};
        if (data.avatarUrl) dbUpdate.avatar_url = data.avatarUrl;
        if (data.firstName) dbUpdate.first_name = data.firstName;
        if (data.lastName) dbUpdate.last_name = data.lastName;
        if (data.language) dbUpdate.language = data.language;
        if (data.religion) dbUpdate.religion = data.religion;

        const { error } = await supabase.from('profiles').update(dbUpdate).eq('id', userId);
        if (error) throw new Error("Update failed.");
      }
      this.currentUser = { ...this.currentUser, ...data };
      if (data.firstName || data.lastName) {
        this.currentUser.name = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
      }
      return this.currentUser;
    }
    throw new Error("Unauthorized.");
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
        if (data) return data.map((p: any) => this.mapDbPostToPost(p));
      } catch (e) {
        console.error("Feed error:", e);
      }
    }
    return this.mockPosts;
  }

  async createPost(content: string, user: User, isMiracle: boolean, promotionTier: PromotionTier): Promise<Post> {
    const postId = `p${Date.now()}`;
    const newPost: Post = {
      id: postId, userId: user.id, authorName: user.name, authorReligion: user.religion, 
      authorAvatarUrl: user.avatarUrl, content, language: user.language, 
      timestamp: Date.now(), likes: 0, prayers: 0, isMiracle, isAnswered: false,
      promotionTier, gifts: [], comments: []
    };
    if (USE_REAL_DB && supabase) {
      const { error } = await supabase.from('posts').insert([{
        id: newPost.id, user_id: user.id, author_name: user.name, author_religion: user.religion, 
        author_avatar_url: user.avatarUrl, content: newPost.content, language: newPost.language,
        is_miracle: newPost.isMiracle, promotion_tier: newPost.promotionTier
      }]);
      if (error) console.error("Post creation error:", error);
    } else {
      this.mockPosts = [newPost, ...this.mockPosts];
    }
    return newPost;
  }

  async interactPost(postId: string, type: 'like' | 'pray') {
    if (USE_REAL_DB && supabase) {
      await supabase.rpc('increment_counter', { row_id: postId, column_name: type === 'like' ? 'likes' : 'prayers' });
    }
  }

  async toggleCircle(targetId: string): Promise<string[]> {
    if (!this.currentUser) return [];
    const currentCircle = this.currentUser.circleIds || [];
    const isAdding = !currentCircle.includes(targetId);
    if (USE_REAL_DB && supabase) {
      if (isAdding) {
        await supabase.from('circles').insert([{ user_id: this.currentUser.id, target_id: targetId }]);
        this.currentUser.circleIds = [...currentCircle, targetId];
      } else {
        await supabase.from('circles').delete().eq('user_id', this.currentUser.id).eq('target_id', targetId);
        this.currentUser.circleIds = currentCircle.filter(id => id !== targetId);
      }
    }
    return this.currentUser.circleIds || [];
  }

  async processTithe(userId: string, amount: number, method: PaymentMethod): Promise<Tithe> {
    const tithe: Tithe = {
      id: `t${Date.now()}`,
      userId,
      amount,
      currency: 'USD',
      method,
      timestamp: Date.now()
    };

    if (USE_REAL_DB && supabase) {
      const { error } = await supabase.from('tithes').insert([{
        id: tithe.id,
        user_id: userId,
        amount: amount,
        currency: 'USD',
        method: method,
        created_at: new Date(tithe.timestamp).toISOString()
      }]);
      
      if (error) console.error("Tithe error:", error);
      
      const { error: upgradeError } = await supabase
        .from('profiles')
        .update({ is_premium: true })
        .eq('id', userId);
        
      if (upgradeError) console.error("Upgrade error:", upgradeError);
    }
    
    if (this.currentUser && this.currentUser.id === userId) {
      this.currentUser.isPremium = true;
    }

    return tithe;
  }

  private mapDbUserToUser(data: any): User {
    return {
      id: data.id, name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Faithful',
      firstName: data.first_name || '', lastName: data.last_name || '', email: data.email,
      dateOfBirth: data.date_of_birth || '1990-01-01', nationality: data.nationality || 'Global', gender: data.gender || 'N/A',
      religion: (data.religion as Religion) || Religion.OTHER, visibility: (data.visibility as Visibility) || Visibility.PUBLIC, 
      language: (data.language as Language) || 'English',
      avatarUrl: data.avatar_url || `https://ui-avatars.com/api/?name=${data.email}`, isPremium: data.is_premium || false, 
      circleIds: []
    };
  }

  private mapDbPostToPost(p: any): Post {
    return {
      id: p.id, userId: p.user_id, authorName: p.author_name, authorReligion: (p.author_religion as Religion) || Religion.OTHER, 
      authorAvatarUrl: p.author_avatar_url, content: p.content, language: (p.language as Language) || 'English',
      timestamp: new Date(p.created_at).getTime(), likes: p.likes || 0, prayers: p.prayers || 0,
      isMiracle: p.is_miracle || false, isAnswered: p.is_answered || false,
      promotionTier: (p.promotion_tier as PromotionTier) || PromotionTier.NONE, gifts: [],
      comments: p.comments?.map((c: any) => ({
        id: c.id, userId: c.user_id, authorName: c.author_name, authorAvatarUrl: c.author_avatar_url, content: c.content,
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