export interface SampleScreenshot {
  id: string;
  title: string;
  category: string;
  width: number;
  height: number;
  dataUrl: string;
}

// Generate realistic UI screenshots directly as crisp SVG Data URIs
function createDataUriFromSvg(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
}

export const SAMPLE_SCREENSHOTS: SampleScreenshot[] = [
  {
    id: 'saas-dashboard',
    title: 'CloudFlow Analytics Dashboard',
    category: 'Web App',
    width: 1200,
    height: 750,
    dataUrl: createDataUriFromSvg(`
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="750" viewBox="0 0 1200 750" fill="none">
  <!-- Background -->
  <rect width="1200" height="750" fill="#0F172A"/>
  
  <!-- Sidebar -->
  <rect x="0" y="0" width="220" height="750" fill="#1E293B"/>
  <rect x="24" y="24" width="32" height="32" rx="8" fill="#3B82F6"/>
  <text x="68" y="45" fill="#F8FAFC" font-family="sans-serif" font-weight="bold" font-size="16">CloudFlow</text>
  
  <!-- Sidebar Nav items -->
  <rect x="16" y="80" width="188" height="38" rx="6" fill="#334155"/>
  <circle cx="36" cy="99" r="6" fill="#60A5FA"/>
  <text x="52" y="104" fill="#FFFFFF" font-family="sans-serif" font-size="13" font-weight="500">Dashboard</text>
  
  <rect x="16" y="126" width="188" height="38" rx="6" fill="transparent"/>
  <circle cx="36" cy="145" r="6" fill="#64748B"/>
  <text x="52" y="150" fill="#94A3B8" font-family="sans-serif" font-size="13">Deployments</text>

  <rect x="16" y="172" width="188" height="38" rx="6" fill="transparent"/>
  <circle cx="36" cy="191" r="6" fill="#64748B"/>
  <text x="52" y="196" fill="#94A3B8" font-family="sans-serif" font-size="13">Team &amp; Access</text>

  <rect x="16" y="218" width="188" height="38" rx="6" fill="transparent"/>
  <circle cx="36" cy="237" r="6" fill="#64748B"/>
  <text x="52" y="242" fill="#94A3B8" font-family="sans-serif" font-size="13">Settings</text>

  <!-- User profile footer in sidebar -->
  <rect x="16" y="680" width="188" height="50" rx="8" fill="#0F172A"/>
  <circle cx="42" cy="705" r="16" fill="#6366F1"/>
  <text x="68" y="702" fill="#F1F5F9" font-family="sans-serif" font-size="12" font-weight="600">Sarah Connor</text>
  <text x="68" y="718" fill="#64748B" font-family="sans-serif" font-size="10">Admin</text>

  <!-- Top Navigation Header -->
  <rect x="220" y="0" width="980" height="70" fill="#1E293B" stroke="#334155" stroke-width="1"/>
  <text x="250" y="42" fill="#F8FAFC" font-family="sans-serif" font-size="20" font-weight="bold">Overview &amp; Telemetry</text>
  
  <!-- Search input -->
  <rect x="680" y="18" width="240" height="36" rx="8" fill="#0F172A" stroke="#334155"/>
  <text x="700" y="41" fill="#64748B" font-family="sans-serif" font-size="12">Search clusters, services...</text>

  <!-- Upgrade button -->
  <rect x="940" y="18" width="110" height="36" rx="8" fill="#2563EB"/>
  <text x="965" y="41" fill="#FFFFFF" font-family="sans-serif" font-size="12" font-weight="600">Upgrade</text>
  <circle cx="1160" cy="36" r="18" fill="#F43F5E"/>

  <!-- Main Content Area -->
  <!-- Stat Cards Row -->
  <rect x="250" y="96" width="215" height="105" rx="10" fill="#1E293B" stroke="#334155"/>
  <text x="270" y="125" fill="#94A3B8" font-family="sans-serif" font-size="12">Total Requests</text>
  <text x="270" y="158" fill="#F8FAFC" font-family="sans-serif" font-size="24" font-weight="bold">4.28M</text>
  <rect x="270" y="172" width="70" height="16" rx="4" fill="#065F46"/>
  <text x="276" y="184" fill="#34D399" font-family="sans-serif" font-size="10">+18.4% today</text>

  <rect x="495" y="96" width="215" height="105" rx="10" fill="#1E293B" stroke="#334155"/>
  <text x="515" y="125" fill="#94A3B8" font-family="sans-serif" font-size="12">Avg Latency</text>
  <text x="515" y="158" fill="#F8FAFC" font-family="sans-serif" font-size="24" font-weight="bold">42 ms</text>
  <rect x="515" y="172" width="60" height="16" rx="4" fill="#1E3A8A"/>
  <text x="521" y="184" fill="#60A5FA" font-family="sans-serif" font-size="10">Optimal</text>

  <rect x="740" y="96" width="215" height="105" rx="10" fill="#1E293B" stroke="#334155"/>
  <text x="760" y="125" fill="#94A3B8" font-family="sans-serif" font-size="12">Success Rate</text>
  <text x="760" y="158" fill="#F8FAFC" font-family="sans-serif" font-size="24" font-weight="bold">99.98%</text>
  <rect x="760" y="172" width="80" height="16" rx="4" fill="#065F46"/>
  <text x="766" y="184" fill="#34D399" font-family="sans-serif" font-size="10">Healthy</text>

  <rect x="985" y="96" width="185" height="105" rx="10" fill="#1E293B" stroke="#334155"/>
  <text x="1005" y="125" fill="#94A3B8" font-family="sans-serif" font-size="12">Active Nodes</text>
  <text x="1005" y="158" fill="#F8FAFC" font-family="sans-serif" font-size="24" font-weight="bold">64 / 64</text>
  <rect x="1005" y="172" width="70" height="16" rx="4" fill="#334155"/>
  <text x="1011" y="184" fill="#CBD5E1" font-family="sans-serif" font-size="10">All online</text>

  <!-- Big Chart Card -->
  <rect x="250" y="225" width="620" height="300" rx="12" fill="#1E293B" stroke="#334155"/>
  <text x="275" y="258" fill="#F8FAFC" font-family="sans-serif" font-size="16" font-weight="600">Throughput &amp; Bandwidth (24h)</text>
  <!-- Chart graphic simulation -->
  <path d="M 275 470 C 350 420, 420 480, 500 390 C 580 300, 650 360, 720 320 C 780 280, 820 310, 840 290" fill="none" stroke="#3B82F6" stroke-width="3"/>
  <rect x="275" y="485" width="570" height="1" fill="#334155"/>

  <!-- Right Panel / Incident Activity -->
  <rect x="895" y="225" width="275" height="300" rx="12" fill="#1E293B" stroke="#334155"/>
  <text x="915" y="258" fill="#F8FAFC" font-family="sans-serif" font-size="16" font-weight="600">Recent Events</text>
  
  <circle cx="930" cy="295" r="5" fill="#10B981"/>
  <text x="945" y="300" fill="#F1F5F9" font-family="sans-serif" font-size="12" font-weight="500">Auto-scaling triggered</text>
  <text x="945" y="315" fill="#64748B" font-family="sans-serif" font-size="10">2 mins ago · us-east-1</text>

  <circle cx="930" cy="355" r="5" fill="#3B82F6"/>
  <text x="945" y="360" fill="#F1F5F9" font-family="sans-serif" font-size="12" font-weight="500">Build #482 deployed</text>
  <text x="945" y="375" fill="#64748B" font-family="sans-serif" font-size="10">18 mins ago · main branch</text>

  <circle cx="930" cy="415" r="5" fill="#F59E0B"/>
  <text x="945" y="420" fill="#F1F5F9" font-family="sans-serif" font-size="12" font-weight="500">SSL certificate rotated</text>
  <text x="945" y="435" fill="#64748B" font-family="sans-serif" font-size="10">1 hr ago · letsencrypt</text>

  <!-- Bottom Table Card -->
  <rect x="250" y="545" width="920" height="175" rx="12" fill="#1E293B" stroke="#334155"/>
  <text x="275" y="578" fill="#F8FAFC" font-family="sans-serif" font-size="15" font-weight="600">Active Service Deployments</text>
  <!-- Table Header -->
  <rect x="275" y="595" width="870" height="30" rx="4" fill="#0F172A"/>
  <text x="290" y="615" fill="#64748B" font-family="sans-serif" font-size="11" font-weight="bold">SERVICE NAME</text>
  <text x="500" y="615" fill="#64748B" font-family="sans-serif" font-size="11" font-weight="bold">VERSION</text>
  <text x="700" y="615" fill="#64748B" font-family="sans-serif" font-size="11" font-weight="bold">HEALTH</text>
  <text x="950" y="615" fill="#64748B" font-family="sans-serif" font-size="11" font-weight="bold">UPTIME</text>

  <!-- Table Row 1 -->
  <text x="290" y="650" fill="#F1F5F9" font-family="sans-serif" font-size="12" font-weight="500">api-gateway-v2</text>
  <text x="500" y="650" fill="#94A3B8" font-family="sans-serif" font-size="12">v2.14.0</text>
  <text x="700" y="650" fill="#34D399" font-family="sans-serif" font-size="12">Passing 100%</text>
  <text x="950" y="650" fill="#CBD5E1" font-family="sans-serif" font-size="12">99.99%</text>

  <!-- Table Row 2 -->
  <text x="290" y="690" fill="#F1F5F9" font-family="sans-serif" font-size="12" font-weight="500">auth-service-worker</text>
  <text x="500" y="690" fill="#94A3B8" font-family="sans-serif" font-size="12">v1.8.9</text>
  <text x="700" y="690" fill="#34D399" font-family="sans-serif" font-size="12">Passing 100%</text>
  <text x="950" y="690" fill="#CBD5E1" font-family="sans-serif" font-size="12">99.95%</text>
</svg>
`),
  },
  {
    id: 'landing-hero',
    title: 'SaaS Product Landing Page',
    category: 'Marketing',
    width: 1200,
    height: 750,
    dataUrl: createDataUriFromSvg(`
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="750" viewBox="0 0 1200 750" fill="none">
  <!-- Clean white background -->
  <rect width="1200" height="750" fill="#FFFFFF"/>

  <!-- Top Navbar -->
  <rect x="0" y="0" width="1200" height="80" fill="#FFFFFF" stroke="#F1F5F9" stroke-width="1"/>
  <rect x="80" y="24" width="32" height="32" rx="8" fill="#4F46E5"/>
  <text x="124" y="46" fill="#0F172A" font-family="sans-serif" font-weight="800" font-size="18">StudioSync</text>
  
  <!-- Nav Links -->
  <text x="420" y="46" fill="#475569" font-family="sans-serif" font-size="14" font-weight="500">Products</text>
  <text x="520" y="46" fill="#475569" font-family="sans-serif" font-size="14" font-weight="500">Solutions</text>
  <text x="620" y="46" fill="#475569" font-family="sans-serif" font-size="14" font-weight="500">Pricing</text>
  <text x="710" y="46" fill="#475569" font-family="sans-serif" font-size="14" font-weight="500">Resources</text>

  <!-- Nav Action Buttons -->
  <rect x="940" y="22" width="80" height="36" rx="6" fill="#F8FAFC" stroke="#E2E8F0"/>
  <text x="962" y="45" fill="#334155" font-family="sans-serif" font-size="13" font-weight="600">Sign In</text>

  <rect x="1035" y="22" width="105" height="36" rx="6" fill="#4F46E5"/>
  <text x="1052" y="45" fill="#FFFFFF" font-family="sans-serif" font-size="13" font-weight="600">Get Started</text>

  <!-- Hero Section -->
  <!-- Announcement badge -->
  <rect x="80" y="140" width="260" height="30" rx="15" fill="#EEF2FF" stroke="#C7D2FE"/>
  <circle cx="95" cy="155" r="5" fill="#4F46E5"/>
  <text x="110" y="160" fill="#4338CA" font-family="sans-serif" font-size="12" font-weight="600">Version 3.0 is live · Explore updates</text>

  <!-- Hero Headline -->
  <text x="80" y="230" fill="#0F172A" font-family="sans-serif" font-size="44" font-weight="800" letter-spacing="-1">The collaborative engine for</text>
  <text x="80" y="285" fill="#4F46E5" font-family="sans-serif" font-size="44" font-weight="800" letter-spacing="-1">high-velocity design teams.</text>

  <!-- Hero Paragraph -->
  <text x="80" y="340" fill="#64748B" font-family="sans-serif" font-size="16" line-height="24">Empower designers, engineers, and product managers to prototype, test,</text>
  <text x="80" y="365" fill="#64748B" font-family="sans-serif" font-size="16">and ship pixel-perfect experiences at scale without bottlenecks.</text>

  <!-- CTA Buttons -->
  <rect x="80" y="410" width="170" height="48" rx="8" fill="#4F46E5"/>
  <text x="115" y="440" fill="#FFFFFF" font-family="sans-serif" font-size="15" font-weight="600">Start Free Trial</text>

  <rect x="265" y="410" width="150" height="48" rx="8" fill="#FFFFFF" stroke="#D1D5DB"/>
  <text x="305" y="440" fill="#374151" font-family="sans-serif" font-size="15" font-weight="600">Book Demo</text>

  <!-- Social proof -->
  <text x="80" y="520" fill="#94A3B8" font-family="sans-serif" font-size="12" font-weight="600">TRUSTED BY TEAMS WORLDWIDE</text>
  <rect x="80" y="540" width="80" height="24" rx="4" fill="#F1F5F9"/>
  <rect x="180" y="540" width="80" height="24" rx="4" fill="#F1F5F9"/>
  <rect x="280" y="540" width="80" height="24" rx="4" fill="#F1F5F9"/>
  <rect x="380" y="540" width="80" height="24" rx="4" fill="#F1F5F9"/>

  <!-- Hero Image Card / Illustration Mockup -->
  <rect x="620" y="140" width="500" height="440" rx="16" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2"/>
  <rect x="640" y="160" width="460" height="40" rx="8" fill="#FFFFFF" stroke="#E2E8F0"/>
  <circle cx="660" cy="180" r="5" fill="#EF4444"/>
  <circle cx="675" cy="180" r="5" fill="#F59E0B"/>
  <circle cx="690" cy="180" r="5" fill="#10B981"/>
  <rect x="710" y="170" width="220" height="20" rx="4" fill="#F1F5F9"/>

  <!-- Mockup Graphic Elements -->
  <rect x="640" y="215" width="215" height="160" rx="10" fill="#EEF2FF"/>
  <circle cx="747" cy="275" r="28" fill="#818CF8"/>
  <rect x="665" y="325" width="165" height="14" rx="4" fill="#4F46E5"/>
  <rect x="685" y="347" width="125" height="10" rx="4" fill="#C7D2FE"/>

  <rect x="870" y="215" width="230" height="160" rx="10" fill="#F0FDF4"/>
  <circle cx="985" cy="275" r="28" fill="#34D399"/>
  <rect x="895" y="325" width="180" height="14" rx="4" fill="#059669"/>
  <rect x="915" y="347" width="140" height="10" rx="4" fill="#A7F3D0"/>

  <rect x="640" y="390" width="460" height="165" rx="10" fill="#FFFFFF" stroke="#E2E8F0"/>
  <text x="665" y="425" fill="#0F172A" font-family="sans-serif" font-size="14" font-weight="bold">Live Team Collaboration</text>
  <rect x="665" y="445" width="300" height="12" rx="3" fill="#E2E8F0"/>
  <rect x="665" y="465" width="220" height="12" rx="3" fill="#E2E8F0"/>
  <circle cx="1030" cy="455" r="16" fill="#EC4899"/>
  <circle cx="1060" cy="455" r="16" fill="#8B5CF6"/>
</svg>
`),
  },
  {
    id: 'mobile-app',
    title: 'Mobile Commerce & Profile UI',
    category: 'Mobile Screen',
    width: 420,
    height: 840,
    dataUrl: createDataUriFromSvg(`
<svg xmlns="http://www.w3.org/2000/svg" width="420" height="840" viewBox="0 0 420 840" fill="none">
  <!-- Mobile screen container -->
  <rect width="420" height="840" rx="36" fill="#F8FAFC" stroke="#0F172A" stroke-width="4"/>
  
  <!-- Status Bar -->
  <text x="32" y="32" fill="#0F172A" font-family="sans-serif" font-size="12" font-weight="600">9:41</text>
  <rect x="170" y="16" width="80" height="18" rx="9" fill="#0F172A"/>

  <!-- Top App Bar -->
  <circle cx="44" cy="74" r="18" fill="#FFFFFF" stroke="#E2E8F0"/>
  <text x="145" y="80" fill="#0F172A" font-family="sans-serif" font-size="16" font-weight="bold">Explore Shop</text>
  <circle cx="376" cy="74" r="18" fill="#FFFFFF" stroke="#E2E8F0"/>

  <!-- Search Input -->
  <rect x="24" y="112" width="372" height="46" rx="12" fill="#FFFFFF" stroke="#E2E8F0"/>
  <circle cx="48" cy="135" r="7" fill="#94A3B8"/>
  <text x="68" y="140" fill="#94A3B8" font-family="sans-serif" font-size="13">Search sneakers, apparel...</text>

  <!-- Category chips -->
  <rect x="24" y="174" width="76" height="32" rx="16" fill="#0F172A"/>
  <text x="44" y="194" fill="#FFFFFF" font-family="sans-serif" font-size="12" font-weight="600">All</text>

  <rect x="108" y="174" width="84" height="32" rx="16" fill="#FFFFFF" stroke="#E2E8F0"/>
  <text x="126" y="194" fill="#475569" font-family="sans-serif" font-size="12">Running</text>

  <rect x="200" y="174" width="94" height="32" rx="16" fill="#FFFFFF" stroke="#E2E8F0"/>
  <text x="218" y="194" fill="#475569" font-family="sans-serif" font-size="12">Lifestyle</text>

  <rect x="302" y="174" width="94" height="32" rx="16" fill="#FFFFFF" stroke="#E2E8F0"/>
  <text x="320" y="194" fill="#475569" font-family="sans-serif" font-size="12">Outdoor</text>

  <!-- Banner Card -->
  <rect x="24" y="222" width="372" height="150" rx="16" fill="#4F46E5"/>
  <text x="44" y="260" fill="#FFFFFF" font-family="sans-serif" font-size="20" font-weight="bold">Summer Drop</text>
  <text x="44" y="285" fill="#E0E7FF" font-family="sans-serif" font-size="13">Get up to 35% off on select gear.</text>
  <rect x="44" y="305" width="105" height="34" rx="8" fill="#FFFFFF"/>
  <text x="65" y="327" fill="#4F46E5" font-family="sans-serif" font-size="12" font-weight="bold">Shop Now</text>

  <!-- Section Title -->
  <text x="24" y="405" fill="#0F172A" font-family="sans-serif" font-size="16" font-weight="bold">Featured Products</text>
  <text x="350" y="405" fill="#4F46E5" font-family="sans-serif" font-size="12" font-weight="600">See all</text>

  <!-- Product Card 1 -->
  <rect x="24" y="425" width="176" height="240" rx="14" fill="#FFFFFF" stroke="#E2E8F0"/>
  <rect x="36" y="437" width="152" height="120" rx="10" fill="#F1F5F9"/>
  <circle cx="112" cy="497" r="28" fill="#CBD5E1"/>
  <text x="36" y="582" fill="#0F172A" font-family="sans-serif" font-size="13" font-weight="600">Apex Runner V2</text>
  <text x="36" y="602" fill="#64748B" font-family="sans-serif" font-size="11">Lightweight knit</text>
  <text x="36" y="628" fill="#0F172A" font-family="sans-serif" font-size="14" font-weight="bold">$149</text>
  <circle cx="172" cy="622" r="14" fill="#0F172A"/>

  <!-- Product Card 2 -->
  <rect x="220" y="425" width="176" height="240" rx="14" fill="#FFFFFF" stroke="#E2E8F0"/>
  <rect x="232" y="437" width="152" height="120" rx="10" fill="#F1F5F9"/>
  <circle cx="308" cy="497" r="28" fill="#CBD5E1"/>
  <text x="232" y="582" fill="#0F172A" font-family="sans-serif" font-size="13" font-weight="600">Trail Matrix Pro</text>
  <text x="232" y="602" fill="#64748B" font-family="sans-serif" font-size="11">Waterproof sole</text>
  <text x="232" y="628" fill="#0F172A" font-family="sans-serif" font-size="14" font-weight="bold">$189</text>
  <circle cx="368" cy="622" r="14" fill="#0F172A"/>

  <!-- Bottom Navigation Bar -->
  <rect x="0" y="755" width="420" height="85" fill="#FFFFFF" stroke="#E2E8F0"/>
  <circle cx="56" cy="785" r="12" fill="#0F172A"/>
  <circle cx="148" cy="785" r="12" fill="#94A3B8"/>
  <circle cx="240" cy="785" r="12" fill="#94A3B8"/>
  <circle cx="332" cy="785" r="12" fill="#94A3B8"/>
  <rect x="140" y="828" width="140" height="4" rx="2" fill="#0F172A"/>
</svg>
`),
  },
];
