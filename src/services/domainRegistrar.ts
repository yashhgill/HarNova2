import { 
  isFirebaseActive, 
  db, 
  HarNovaStore 
} from "./store";
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc 
} from "firebase/firestore";
import { DomainRecord, DnsRecord } from "../types";

const LOCAL_DOMAINS_KEY = "harnova_fallback_domains";

const getFallbackDomains = (): DomainRecord[] => {
  const d = localStorage.getItem(LOCAL_DOMAINS_KEY);
  return d ? JSON.parse(d) : [];
};

const saveFallbackDomains = (domains: DomainRecord[]) => {
  localStorage.setItem(LOCAL_DOMAINS_KEY, JSON.stringify(domains));
};

// Available popular TLDs for registrar search
export interface SearchedDomain {
  domainName: string;
  isAvailable: boolean;
  tokenCost: number;
  reason?: string;
}

export class DomainRegistrar {
  /**
   * Search for custom domain availability across popular global TLDs
   */
  static async searchDomainAvailability(queryText: string): Promise<SearchedDomain[]> {
    // Clean query text
    const cleanQuery = queryText.toLowerCase().trim().replace(/[^a-z0-9.-]/g, "");
    if (!cleanQuery) return [];

    let rawName = cleanQuery;
    let tld = "";

    const parts = cleanQuery.split(".");
    if (parts.length > 1) {
      tld = parts[parts.length - 1];
      rawName = parts.slice(0, parts.length - 1).join("");
    }

    if (!rawName) return [];

    const popularTlds = [
      { extension: "com", cost: 5 },
      { extension: "net", cost: 4 },
      { extension: "tech", cost: 3 },
      { extension: "ai", cost: 12 },
      { extension: "dev", cost: 6 },
      { extension: "io", cost: 10 }
    ];

    // Determine availability based on some deterministic formula to feel consistent
    const checkAvailability = (name: string, ext: string): boolean => {
      // Extremely popular words are simulated as registered
      const banned = ["google", "apple", "microsoft", "amazon", "facebook", "portfolio", "admin", "ai", "openai"];
      if (banned.includes(name)) return false;
      
      // Short names (<3 letters) are registered
      if (name.length < 3) return false;

      // Deterministic pseudo-random string-based flag
      const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) + ext.charCodeAt(0);
      return hash % 7 !== 0; // 85% of domains are available
    };

    if (tld && popularTlds.some(t => t.extension === tld)) {
      // User explicitly searched for a specific domain
      const targetTld = popularTlds.find(t => t.extension === tld)!;
      const isAvailable = checkAvailability(rawName, tld);
      
      const results: SearchedDomain[] = [
        {
          domainName: `${rawName}.${tld}`,
          isAvailable,
          tokenCost: targetTld.cost,
          reason: isAvailable ? undefined : "This premium domain is already registered by another organization."
        }
      ];

      // Add other suggestions
      popularTlds.forEach(suggest => {
        if (suggest.extension !== tld) {
          const avail = checkAvailability(rawName, suggest.extension);
          results.push({
            domainName: `${rawName}.${suggest.extension}`,
            isAvailable: avail,
            tokenCost: suggest.cost
          });
        }
      });

      return results;
    } else {
      // Default query list
      return popularTlds.map(tldInfo => {
        const dName = `${rawName}.${tldInfo.extension}`;
        const avail = checkAvailability(rawName, tldInfo.extension);
        return {
          domainName: dName,
          isAvailable: avail,
          tokenCost: tldInfo.cost
        };
      });
    }
  }

  /**
   * Retrieves all custom domains owned by a user
   */
  static async getUserDomains(uid: string): Promise<DomainRecord[]> {
    if (isFirebaseActive && db) {
      try {
        const q = query(collection(db, "domains"), where("ownerId", "==", uid));
        const querySnapshot = await getDocs(q);
        const domains: DomainRecord[] = [];
        querySnapshot.forEach((doc) => {
          domains.push(doc.data() as DomainRecord);
        });
        return domains.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } catch (err) {
        console.error("Firebase getUserDomains failed, falling back:", err);
        return getFallbackDomains().filter(d => d.ownerId === uid);
      }
    } else {
      return getFallbackDomains().filter(d => d.ownerId === uid);
    }
  }

  /**
   * Register a brand new domain name. Deducts appropriate tokens relative to the TLD cost.
   */
  static async registerDomain(uid: string, domainName: string, tokenCost: number): Promise<DomainRecord> {
    const userProfile = await HarNovaStore.getUserProfile(uid);
    if (!userProfile) {
      throw new Error("Unable to identify active user session profile.");
    }

    if (userProfile.tokens < tokenCost) {
      throw new Error(`Insufficient tokens! You need ${tokenCost} tokens to buy ${domainName}.`);
    }

    // Deduct user tokens by making a purchase of negative tokens or updating token logic
    // Let's call consumer or custom purchase methods
    const updatedProfile = await HarNovaStore.purchaseTokens(uid, -tokenCost, `Registrar: Registered ${domainName}`);
    if (!updatedProfile) {
      throw new Error("Domain billing clearance transaction failed.");
    }

    const defaultDns: DnsRecord[] = [
      {
        id: "dns-a-" + Math.random().toString(36).substring(2, 6),
        type: "A",
        host: "@",
        value: "76.76.21.21", // HarNova primary edge cluster IP
        ttl: 3600
      },
      {
        id: "dns-cname-" + Math.random().toString(36).substring(2, 6),
        type: "CNAME",
        host: "www",
        value: "cname.harnova.link",
        ttl: 3600
      }
    ];

    const newDomain: DomainRecord = {
      id: "dom-" + Math.random().toString(36).substring(2, 9),
      domainName,
      ownerId: uid,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year expiration
      tokenCost,
      linkedSiteId: null,
      dnsRecords: defaultDns,
      status: "active"
    };

    if (isFirebaseActive && db) {
      try {
        await setDoc(doc(db, "domains", newDomain.id), newDomain);
      } catch (err) {
        console.error("Firebase store domain failed, using fallback:", err);
        const list = getFallbackDomains();
        saveFallbackDomains([newDomain, ...list]);
      }
    } else {
      const list = getFallbackDomains();
      saveFallbackDomains([newDomain, ...list]);
    }

    return newDomain;
  }

  /**
   * Update the DNS workspace records for an owned custom domain
   */
  static async updateDnsRecords(uid: string, domainId: string, records: DnsRecord[]): Promise<void> {
    if (isFirebaseActive && db) {
      try {
        const docRef = doc(db, "domains", domainId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const dom = docSnap.data() as DomainRecord;
          if (dom.ownerId === uid) {
            dom.dnsRecords = records;
            await setDoc(docRef, dom);
            return;
          }
        }
        throw new Error("Domain record not found or permission denied.");
      } catch (err: any) {
        console.error("Firebase updateDnsRecords failed, falling back:", err);
        // Fallback
        const list = getFallbackDomains();
        const idx = list.findIndex(d => d.id === domainId && d.ownerId === uid);
        if (idx !== -1) {
          list[idx].dnsRecords = records;
          saveFallbackDomains(list);
        }
      }
    } else {
      const list = getFallbackDomains();
      const idx = list.findIndex(d => d.id === domainId && d.ownerId === uid);
      if (idx !== -1) {
        list[idx].dnsRecords = records;
        saveFallbackDomains(list);
      } else {
        throw new Error("Local fallback domain record not found.");
      }
    }
  }

  /**
   * Link or map a registered domain name directly to a HarNova landing page
   */
  static async linkDomainToSite(uid: string, domainId: string, siteId: string | null): Promise<DomainRecord> {
    let targetDomain: DomainRecord | null = null;

    if (isFirebaseActive && db) {
      try {
        const docRef = doc(db, "domains", domainId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const dom = docSnap.data() as DomainRecord;
          if (dom.ownerId === uid) {
            dom.linkedSiteId = siteId;
            await setDoc(docRef, dom);
            targetDomain = dom;
          }
        }
      } catch (err) {
        console.error("Firebase linkDomainToSite failed, using local:", err);
      }
    }

    if (!targetDomain) {
      const list = getFallbackDomains();
      const idx = list.findIndex(d => d.id === domainId && d.ownerId === uid);
      if (idx !== -1) {
        list[idx].linkedSiteId = siteId;
        saveFallbackDomains(list);
        targetDomain = list[idx];
      }
    }

    if (!targetDomain) {
      throw new Error("Domain registration record not found.");
    }

    // Now update the mapped landing page model
    if (siteId) {
      try {
        const userSites = await HarNovaStore.getUserWebsites(uid);
        const mappedSite = userSites.find(s => s.id === siteId);
        if (mappedSite) {
          mappedSite.customDomain = targetDomain.domainName;
          mappedSite.domainStatus = "active";
          await HarNovaStore.updateWebsite(mappedSite);
        }
      } catch (e) {
        console.error("Failed to map landing page customDomain variables:", e);
      }
    }

    return targetDomain;
  }

  /**
   * Remove a managed custom domain from the user registrar directory
   */
  static async deleteDomain(uid: string, domainId: string): Promise<void> {
    let linkedSiteId: string | null = null;
    let domainName = "";

    if (isFirebaseActive && db) {
      try {
        const docRef = doc(db, "domains", domainId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const dom = docSnap.data() as DomainRecord;
          if (dom.ownerId === uid) {
            linkedSiteId = dom.linkedSiteId;
            domainName = dom.domainName;
            await deleteDoc(docRef);
          }
        }
      } catch (err) {
        console.error("Firebase deleteDomain failed, falling back:", err);
      }
    }

    const list = getFallbackDomains();
    const idx = list.findIndex(d => d.id === domainId && d.ownerId === uid);
    if (idx !== -1) {
      linkedSiteId = list[idx].linkedSiteId;
      domainName = list[idx].domainName;
      list.splice(idx, 1);
      saveFallbackDomains(list);
    }

    // If there is a website linking to this domain, decouple it
    if (linkedSiteId && domainName) {
      try {
        const userSites = await HarNovaStore.getUserWebsites(uid);
        const site = userSites.find(s => s.id === linkedSiteId);
        if (site && site.customDomain === domainName) {
          delete site.customDomain;
          site.domainStatus = "unconfigured";
          await HarNovaStore.updateWebsite(site);
        }
      } catch (err) {
        console.error("Failed to decouple domain link from website:", err);
      }
    }
  }
}
