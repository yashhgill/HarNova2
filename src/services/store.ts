import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser,
  signInAnonymously
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  getDocFromServer,
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc,
  deleteDoc
} from 'firebase/firestore';

import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, WebSite, TokenTransaction, ThemePreset } from '../types';

// Detect if Firebase setup is actively provisioned
export const isFirebaseActive = !!(firebaseConfig && firebaseConfig.projectId && firebaseConfig.projectId !== "");

export let app: any = null;
export let db: any = null;
export let auth: any = null;

if (isFirebaseActive) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    auth = getAuth(app);
    console.log("Firebase initialized successfully with config:", firebaseConfig.projectId);
  } catch (err) {
    console.error("Failed to initialize Firebase SDK:", err);
  }
} else {
  console.log("Using LocalStorage fallback storage since Firebase credentials are not configured yet.");
}

// Error handlers as required by the Firebase Integration Skill
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || "anonymous_local",
      email: auth?.currentUser?.email || "anonymous@harnova.local",
      emailVerified: auth?.currentUser?.emailVerified || false,
      isAnonymous: auth?.currentUser?.isAnonymous || true,
    },
    operationType,
    path
  };
  console.error('Firestore Error Details: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Bootstrap connections validation (from Firebase Skill)
if (isFirebaseActive && db) {
  const testConnection = async () => {
    try {
      await getDocFromServer(doc(db, 'test_harnova', 'connection'));
      console.log("Firestore connection test passed!");
    } catch (error) {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.error("Please check your Firebase configuration or dynamic networking.");
      }
    }
  };
  testConnection();
}

// IN-MEMORY & LOCAL STORAGE FALLBACK STORAGE IMPLEMENTATION
// This preserves all user credentials, tokens, websites, and domain registrations locally
const LOCAL_STORAGE_KEYS = {
  USER: "harnova_fallback_user",
  WEBSITES: "harnova_fallback_websites",
  TRANSACTIONS: "harnova_fallback_transactions"
};

// Initial state helpers
const getFallbackUser = (): UserProfile | null => {
  const u = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
  return u ? JSON.parse(u) : null;
};

const saveFallbackUser = (user: UserProfile | null) => {
  if (user) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
  }
};

const getFallbackWebsites = (): WebSite[] => {
  const w = localStorage.getItem(LOCAL_STORAGE_KEYS.WEBSITES);
  return w ? JSON.parse(w) : [];
};

const saveFallbackWebsites = (sites: WebSite[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEYS.WEBSITES, JSON.stringify(sites));
};

const getFallbackTransactions = (): TokenTransaction[] => {
  const t = localStorage.getItem(LOCAL_STORAGE_KEYS.TRANSACTIONS);
  return t ? JSON.parse(t) : [
    {
      id: "tx-init",
      userId: "local-user",
      type: "purchase",
      amount: 30,
      description: "Welcome Starting Balance Bonus",
      timestamp: new Date().toISOString()
    }
  ];
};

const saveFallbackTransactions = (txs: TokenTransaction[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
};

// Publish generated web documents to the Express backend so they are viewable live at /site/{id}
export async function publishToCDN(site: WebSite): Promise<string> {
  try {
    const res = await fetch("/api/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(site)
    });
    const data = await res.json();
    return site.id;
  } catch (e) {
    console.error("Hosting Publish Error:", e);
    return site.id;
  }
}

// THE HARNOVA STORE IMPLEMENTATION
export class HarNovaStore {
  static isFirebaseEnabled = isFirebaseActive;

  // Real Google Sign-In
  static async signInWithGoogle(): Promise<{ uid: string; email: string }> {
    if (isFirebaseActive && auth) {
      const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Look up profile, if none exists, create!
      let profile = await this.getUserProfile(user.uid);
      if (!profile) {
        profile = await this.createUserProfile(user.uid, user.email || "harnova.builder@gmail.com");
      }
      return { uid: profile.uid, email: profile.email };
    } else {
      // Elegant Sandbox Mock for responsive local sandbox mode
      const mockUid = "goog-sandbox-user";
      const mockEmail = "google.sandbox@gmail.com";
      const profile = await this.createUserProfile(mockUid, mockEmail);
      return { uid: profile.uid, email: profile.email };
    }
  }

  // Real Email/Password SignUp
  static async signUpWithEmail(email: string, password: string): Promise<{ uid: string; email: string }> {
    if (isFirebaseActive && auth) {
      try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;
        let profile = await this.getUserProfile(user.uid);
        if (!profile) {
          profile = await this.createUserProfile(user.uid, user.email || email);
        }
        return { uid: profile.uid, email: profile.email };
      } catch (err: any) {
        console.error("Firebase SignUp error details:", err);
        throw new Error(err.message || "Failed to create account with email.");
      }
    } else {
      const mockUid = "user-" + email.replace(/[^a-zA-Z0-9]/g, "").substring(0, 10);
      let profile = await this.getUserProfile(mockUid);
      if (!profile) {
        profile = await this.createUserProfile(mockUid, email);
      }
      return { uid: profile.uid, email: profile.email };
    }
  }

  // Real Email/Password SignIn
  static async signInWithEmail(email: string, password: string): Promise<{ uid: string; email: string }> {
    if (isFirebaseActive && auth) {
      try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const user = result.user;
        let profile = await this.getUserProfile(user.uid);
        if (!profile) {
          profile = await this.createUserProfile(user.uid, user.email || email);
        }
        return { uid: profile.uid, email: profile.email };
      } catch (err: any) {
        console.error("Firebase SignIn error details:", err);
        throw new Error(err.message || "Failed to sign in with email.");
      }
    } else {
      const mockUid = "user-" + email.replace(/[^a-zA-Z0-9]/g, "").substring(0, 10);
      let profile = await this.getUserProfile(mockUid);
      if (!profile) {
        profile = await this.createUserProfile(mockUid, email);
      }
      return { uid: profile.uid, email: profile.email };
    }
  }

  // Real Anonymous Sandbox Session
  static async signInAnonymously(): Promise<{ uid: string; email: string }> {
    if (isFirebaseActive && auth) {
      try {
        const result = await signInAnonymously(auth);
        const user = result.user;
        let profile = await this.getUserProfile(user.uid);
        if (!profile) {
          profile = await this.createUserProfile(user.uid, "anonymous@harnova.local");
        }
        return { uid: profile.uid, email: profile.email };
      } catch (err: any) {
        console.error("Firebase Anonymous error details:", err);
        throw new Error(err.message || "Failed to start anonymous sandbox session.");
      }
    } else {
      return { uid: "sandbox-user", email: "harnova.builder@gmail.com" };
    }
  }

  // Real Sign Out 
  static async logout(): Promise<void> {
    if (isFirebaseActive && auth) {
      const { signOut } = await import('firebase/auth');
      await signOut(auth);
    }
  }
  
  // High-performance API Generation Client
  static async generateAISite(
    prompt: string, 
    theme: ThemePreset, 
    customName: string,
    colorPalette?: string,
    typography?: string,
    layout?: string,
    activeSections?: string[],
    efficiencyMode?: string
  ): Promise<{ title: string, htmlContent: string, metaDescription: string }> {
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt, 
          theme, 
          customName,
          colorPalette,
          typography,
          layout,
          activeSections,
          efficiencyMode
        })
      });
      if (!response.ok) {
        throw new Error("Generation failure inside Express route.");
      }
      return await response.json();
    } catch (e) {
      console.error("AI Generation Endpoint Failed, using responsive mockup:", e);
      throw e;
    }
  }

  // Get active session profile (Auth + Firestore synced)
  static async getUserProfile(uid: string): Promise<UserProfile | null> {
    if (isFirebaseActive && db) {
      try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return docSnap.data() as UserProfile;
        }
        return null;
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `users/${uid}`);
        return null;
      }
    } else {
      const lu = getFallbackUser();
      if (lu && lu.uid === uid) {
        return lu;
      }
      // Automake local profile on request
      const newUser: UserProfile = {
        uid: uid,
        email: "harnova.builder@gmail.com",
        tokens: 30,
        createdAt: new Date().toISOString()
      };
      saveFallbackUser(newUser);
      return newUser;
    }
  }

  // Record user profiles securely
  static async createUserProfile(uid: string, email: string): Promise<UserProfile> {
    const profile: UserProfile = {
      uid,
      email,
      tokens: 30, // Starting tokens balance for any user!
      createdAt: new Date().toISOString()
    };

    if (isFirebaseActive && db) {
      try {
        await setDoc(doc(db, "users", uid), profile);
        return profile;
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
        return profile;
      }
    } else {
      saveFallbackUser(profile);
      // Reset local listings with starting transaction
      const initTx: TokenTransaction = {
        id: "tx-init-" + uid,
        userId: uid,
        type: "purchase",
        amount: 30,
        description: "Welcome Starting Balance Bonus",
        timestamp: new Date().toISOString()
      };
      saveFallbackTransactions([initTx]);
      saveFallbackWebsites([]);
      return profile;
    }
  }

  // Buy token packs & log purchase
  static async purchaseTokens(uid: string, quantity: number, packageName: string): Promise<UserProfile | null> {
    const currentProfile = await this.getUserProfile(uid);
    if (!currentProfile) return null;

    const updatedProfile = {
      ...currentProfile,
      tokens: currentProfile.tokens + quantity
    };

    // Log the credit purchase
    const transaction: TokenTransaction = {
      id: "tx-buy-" + Math.random().toString(36).substring(2, 11),
      userId: uid,
      type: "purchase",
      amount: quantity,
      description: `Bought ${packageName}`,
      timestamp: new Date().toISOString()
    };

    if (isFirebaseActive && db) {
      try {
        await setDoc(doc(db, "users", uid), updatedProfile);
        await setDoc(doc(db, "transactions", transaction.id), transaction);
        return updatedProfile;
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
        return null;
      }
    } else {
      saveFallbackUser(updatedProfile);
      const txs = getFallbackTransactions();
      saveFallbackTransactions([transaction, ...txs]);
      return updatedProfile;
    }
  }

  // Deduct tokens when building a page
  static async consumeTokenForBuild(uid: string, siteName: string, amount: number = 1): Promise<UserProfile | null> {
    const currentProfile = await this.getUserProfile(uid);
    if (!currentProfile) return null;
    if (currentProfile.tokens < amount) {
      throw new Error(`Insufficient tokens! This luxury build requires ${amount} tokens, but you only have ${currentProfile.tokens}.`);
    }

    const updatedProfile = {
      ...currentProfile,
      tokens: currentProfile.tokens - amount
    };

    const transaction: TokenTransaction = {
      id: "tx-use-" + Math.random().toString(36).substring(2, 11),
      userId: uid,
      type: "consumption",
      amount: amount,
      description: `AI Built: ${siteName} (${amount} fuel tokens)`,
      timestamp: new Date().toISOString()
    };

    if (isFirebaseActive && db) {
      try {
        await setDoc(doc(db, "users", uid), updatedProfile);
        await setDoc(doc(db, "transactions", transaction.id), transaction);
        return updatedProfile;
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
        return null;
      }
    } else {
      saveFallbackUser(updatedProfile);
      const txs = getFallbackTransactions();
      saveFallbackTransactions([transaction, ...txs]);
      return updatedProfile;
    }
  }

  // Fetch all transactions for ledger
  static async getTransactions(uid: string): Promise<TokenTransaction[]> {
    if (isFirebaseActive && db) {
      try {
        const q = query(collection(db, "transactions"), where("userId", "==", uid));
        const querySnapshot = await getDocs(q);
        const txs: TokenTransaction[] = [];
        querySnapshot.forEach((doc) => {
          txs.push(doc.data() as TokenTransaction);
        });
        return txs.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, "transactions");
        return [];
      }
    } else {
      return getFallbackTransactions().filter(t => t.userId === uid);
    }
  }

  // Fetch user personal websites
  static async getUserWebsites(uid: string): Promise<WebSite[]> {
    if (isFirebaseActive && db) {
      try {
        const q = query(collection(db, "websites"), where("ownerId", "==", uid));
        const querySnapshot = await getDocs(q);
        const sites: WebSite[] = [];
        querySnapshot.forEach((doc) => {
          sites.push(doc.data() as WebSite);
        });
        
        // Sync custom state memory mapping inside server live
        for (const site of sites) {
          await publishToCDN(site);
        }

        return sites.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, "websites");
        return [];
      }
    } else {
      const sites = getFallbackWebsites().filter(s => s.ownerId === uid);
      // Sync local sandbox documents to Express so iframe preview works instantly
      for (const site of sites) {
        await publishToCDN(site);
      }
      return sites;
    }
  }

  // Create a new webpage
  static async createWebsite(uid: string, siteData: Omit<WebSite, "ownerId" | "createdAt" | "id">): Promise<WebSite> {
    const newSite: WebSite = {
      ...siteData,
      id: "site-" + Math.random().toString(36).substring(2, 9),
      ownerId: uid,
      createdAt: new Date().toISOString()
    };

    if (isFirebaseActive && db) {
      try {
        await setDoc(doc(db, "websites", newSite.id), newSite);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `websites/${newSite.id}`);
      }
    } else {
      const sites = getFallbackWebsites();
      saveFallbackWebsites([newSite, ...sites]);
    }

    // Publish to Server Hosting instantly
    await publishToCDN(newSite);
    return newSite;
  }

  // Save webpage changes
  static async updateWebsite(site: WebSite): Promise<void> {
    if (isFirebaseActive && db) {
      try {
        await setDoc(doc(db, "websites", site.id), site);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `websites/${site.id}`);
      }
    } else {
      const sites = getFallbackWebsites();
      const index = sites.findIndex(s => s.id === site.id);
      if (index !== -1) {
        sites[index] = site;
        saveFallbackWebsites(sites);
      }
    }

    // Update Server Hosting instantly
    await publishToCDN(site);
  }

  // Remove website from server-hosting and directory
  static async deleteWebsite(siteId: string, uid: string): Promise<void> {
    if (isFirebaseActive && db) {
      try {
        await deleteDoc(doc(db, "websites", siteId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `websites/${siteId}`);
      }
    } else {
      const sites = getFallbackWebsites();
      const filtered = sites.filter(s => s.id !== siteId && s.ownerId === uid);
      saveFallbackWebsites(filtered);
    }
  }
}
