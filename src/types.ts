export interface UserProfile {
  uid: string;
  email: string;
  tokens: number;
  createdAt: string;
}

export type ThemePreset = "modern" | "editorial" | "cosmic" | "brutalist";

export interface WebSite {
  id: string;
  title: string;
  prompt: string;
  theme: ThemePreset;
  htmlContent: string;
  slug: string;
  customDomain?: string;
  domainStatus?: "unconfigured" | "pending" | "active";
  createdAt: string;
  ownerId: string;
}

export interface TokenTransaction {
  id: string;
  userId: string;
  type: "purchase" | "consumption";
  amount: number;
  description: string;
  timestamp: string;
}

export interface DnsRecord {
  id: string;
  type: "A" | "CNAME" | "TXT" | "MX";
  host: string;
  value: string;
  ttl: number;
}

export interface DomainRecord {
  id: string;
  domainName: string;
  ownerId: string;
  createdAt: string;
  expiresAt: string;
  tokenCost: number;
  linkedSiteId: string | null; // Mapped website landing page
  dnsRecords: DnsRecord[];
  status: "active" | "pending" | "expired";
}
