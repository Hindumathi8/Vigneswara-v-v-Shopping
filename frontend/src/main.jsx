import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
import logo from './assets/logo.jpeg';

const API_BASES = ['/api'];

const DEFAULT_TYPES = ['All Sarees','Silk Saree','Pattu Saree','Cotton Saree','Kanchi Pattu','Banarasi Saree','Wedding Saree','Party Wear Saree','Half Saree','Organza Saree','Georgette Saree','Chiffon Saree','Linen Saree','Designer Saree','Daily Wear Saree','Kalamkari Saree','Printed Saree','Embroidery Saree','Soft Silk Saree','Fancy Saree','Mysore Silk Saree','Paithani Saree','Bandhani Saree','Patola Saree','Sambalpuri Saree','Kerala Kasavu Saree','Tissue Saree','Tussar Silk Saree','Uppada Saree','Gadwal Saree','Dharmavaram Saree'];
const DEFAULT_SETTINGS = {
  shop_phone:'918639153979', owner_email:'Durgaprasadkonda@gmail.com', payment_phone:'918639153979', upi_id:'',
  shop_address:'Sanivarapupeta, Eluru, Andhra Pradesh - 534003',
  offers:[
    {title:'New Arrivals',text:'Fresh silk and pattu sarees now available',image:'https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=900&q=80'},
    {title:'Wedding Picks',text:'Special bridal colors and premium borders',image:'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80'},
    {title:'Premium Silk',text:'Festive sarees with elegant finish',image:'https://images.unsplash.com/photo-1618375520434-0b7d1f8f6d19?auto=format&fit=crop&w=900&q=80'},
    {title:'Free Delivery',text:'Available on selected saree orders',image:'https://images.unsplash.com/photo-1586880244386-8b3e34c8382c?auto=format&fit=crop&w=900&q=80'}
  ],
  hero_slides:[
    { img:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Kanchipuram_sarees_(7642282772).jpg', label:'Kanchipuram Collection' },
    { img:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Silk_saree.jpg', label:'Premium Silk Sarees' },
    { img:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Koorai_silk_saree_1.jpg', label:'Bridal Wedding Sarees' },
    { img:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Mysore_Silk_Saree.jpg', label:'Mysore Silk Sarees' },
    { img:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Banarasi_Silk_Saree.jpg', label:'Banarasi Silk Sarees' }
  ],
  featured_collections:[
    {type:'Silk Saree',label:'Silk Sarees',sub:'Timeless elegance',img:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Silk_saree.jpg'},
    {type:'Wedding Saree',label:'Wedding Sarees',sub:'For your big day',img:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Koorai_silk_saree_1.jpg'},
    {type:'Kanchi Pattu',label:'Kanchi Pattu',sub:'Temple classics',img:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Kanchipuram_sarees_(7642282772).jpg'},
    {type:'Cotton Saree',label:'Cotton Sarees',sub:'Daily comfort',img:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Silk_sarees.jpg'}
  ],
  discount_sections:[
    {slug:'new-arrival-discount',title:'New Arrival Discount',text:'Fresh arrivals with special launch pricing',image:'https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=900&q=80',discount_percent:10,filter_types:[],product_ids:[],products:[]},
    {slug:'wedding-picks',title:'Wedding Picks',text:'Pattu, Kanchivaram and wedding sarees for special days',image:'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80',discount_percent:12,filter_types:['Pattu Saree','Kanchi Pattu','Wedding Saree'],product_ids:[],products:[]},
    {slug:'premium-silk-discount',title:'Premium Silk Discount',text:'Offers on Kanchi, Banarasi and wedding silk sarees',image:'https://images.unsplash.com/photo-1618375520434-0b7d1f8f6d19?auto=format&fit=crop&w=900&q=80',discount_percent:15,filter_types:['Kanchi Pattu','Banarasi Saree','Pattu Saree','Wedding Saree'],product_ids:[],products:[]},
    {slug:'summer-discount',title:'Summer Discount',text:'Cool comfort offers for summer wear',image:'https://images.unsplash.com/photo-1586880244386-8b3e34c8382c?auto=format&fit=crop&w=900&q=80',discount_percent:8,filter_types:['Cotton Saree','Linen Saree'],product_ids:[],products:[]}
  ]
};
const SHOP_ADDRESS = 'Sanivarapupeta, Eluru, Andhra Pradesh - 534003';

const FALLBACK_PRODUCTS = [];

const HERO_SLIDES = [
  { img:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Kanchipuram_sarees_(7642282772).jpg', label:'Kanchipuram Collection' },
  { img:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Silk_saree.jpg', label:'Premium Silk Sarees' },
  { img:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Koorai_silk_saree_1.jpg', label:'Bridal Wedding Sarees' },
  { img:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Mysore_Silk_Saree.jpg', label:'Mysore Silk Sarees' },
  { img:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Banarasi_Silk_Saree.jpg', label:'Banarasi Silk Sarees' }
];

const TESTIMONIALS = [
  {name:'Priya Lakshmi',location:'Chennai',text:'Absolutely stunning silk sarees! The quality is exceptional and delivery was super fast. Got it within a week!',rating:5,saree:'Royal Maroon Silk Saree'},
  {name:'Sowmya Devi',location:'Hyderabad',text:'Ordered a Wedding Saree — it looked gorgeous! Place Order was easy and I got delivery tracking.',rating:5,saree:'Bridal Koorai Wedding Saree'},
  {name:'Anitha Rajan',location:'Coimbatore',text:'Best saree shop online! Authentic Kanchi pattu at such a good price. Delivered in just 5 days!',rating:5,saree:'Kanchipuram Temple Border Saree'},
  {name:'Meena Krishnan',location:'Bengaluru',text:'Vigneswara Sarees is my go-to! Premium quality and I could track my order the whole time.',rating:5,saree:'Mysore Zari Silk Saree'}
];

const TRUST_BADGES = [
  {icon:'✦',title:'100% Genuine',desc:'Authentic handpicked sarees'},
  {icon:'↩',title:'Easy Returns',desc:'7-day hassle-free returns'},
  {icon:'📦',title:'Order Tracking',desc:'Track your order anytime'},
  {icon:'🚚',title:'7-Day Delivery',desc:'Delivered within 1 week'}
];

const DELIVERY_DAYS = 7;

function apiImage(path){ return path?.startsWith('http')?path:`${API_BASES[0]}${path}`; }
function productImages(p){
  const imgs = Array.isArray(p.images) ? p.images : [];
  const all = [p.image, ...imgs].filter(Boolean);
  return [...new Set(all)];
}
async function apiFetch(path,options){
  let lastError;
  for(const base of API_BASES){
    try{ const r=await fetch(`${base}${path}`,options); if(r.ok||r.status<500)return r; }catch(e){lastError=e;}
  }
  throw lastError||new Error('Backend not connected');
}
function useWishlist(){
  const [wishlist,setWishlist]=useState(()=>{try{return JSON.parse(localStorage.getItem('vs_wishlist')||'[]');}catch{return [];}});
  const toggle=useCallback(id=>{setWishlist(prev=>{const next=prev.includes(id)?prev.filter(x=>x!==id):[...prev,id];localStorage.setItem('vs_wishlist',JSON.stringify(next));return next;});},[] );
  return [wishlist,toggle];
}

function getDeliveryDate(){
  const d=new Date();
  d.setDate(d.getDate()+DELIVERY_DAYS);
  return d.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
}

function makeUpiLinks({upi_id='', payment_phone='', amount=0, orderId=''}){
  const pa=(upi_id||'').trim();
  const pn='Vigneswara Sarees';
  const am=Number(amount||0).toFixed(2);
  const tn=`Vigneswara Sarees Order ${orderId?`#${orderId}`:''}`.trim();
  if(!pa){return {upi:'', phonepe:'', gpay:'', needsUpi:true};}
  const q=`pa=${encodeURIComponent(pa)}&pn=${encodeURIComponent(pn)}&am=${encodeURIComponent(am)}&cu=INR&tn=${encodeURIComponent(tn)}`;
  return {upi:`upi://pay?${q}`, phonepe:`phonepe://pay?${q}`, gpay:`tez://upi/pay?${q}`, needsUpi:false};
}

function App(){
  const [page,setPage]=useState('shop');
  const [products,setProducts]=useState([]);
  const [cart,setCart]=useState([]);
  const [token,setToken]=useState(localStorage.getItem('ownerToken')||'');
  const [toast,setToast]=useState({msg:'',type:'info'});
  const [selectedType,setSelectedType]=useState('All Sarees');
  const [sareeTypes,setSareeTypes]=useState(DEFAULT_TYPES);
  const [settings,setSettings]=useState(DEFAULT_SETTINGS);
  const [discountSections,setDiscountSections]=useState(DEFAULT_SETTINGS.discount_sections);
  const [theme,setTheme]=useState(localStorage.getItem('theme')||'light');
  const [wishlist,toggleWishlist]=useWishlist();
  const [showTop,setShowTop]=useState(false);
  const isAdmin=!!token;

  const show=(msg,type='info')=>{setToast({msg,type});setTimeout(()=>setToast({msg:'',type:'info'}),3500);};
  const load=()=>apiFetch('/products').then(r=>r.json()).then(setProducts).catch(()=>{setProducts(FALLBACK_PRODUCTS);show('Backend not connected. No owner products loaded.','warn');});
  const loadSettings=()=>apiFetch('/settings').then(r=>r.json()).then(setSettings).catch(()=>setSettings(DEFAULT_SETTINGS));
  const loadDiscountSections=()=>apiFetch('/discount-sections').then(r=>r.json()).then(setDiscountSections).catch(()=>setDiscountSections(DEFAULT_SETTINGS.discount_sections));
  useEffect(()=>{load();loadSettings();loadDiscountSections();apiFetch('/saree-types').then(r=>r.json()).then(t=>setSareeTypes(['All Sarees',...t])).catch(()=>{});},[]);
  useEffect(()=>{document.body.dataset.theme=theme;localStorage.setItem('theme',theme);},[theme]);
  useEffect(()=>{const h=()=>setShowTop(window.scrollY>500);window.addEventListener('scroll',h);return()=>window.removeEventListener('scroll',h);},[]);

  const pickType=(type)=>{setSelectedType(type);setPage('shop');setTimeout(()=>document.getElementById('collections')?.scrollIntoView({behavior:'smooth'}),50);};
  const cartCount=cart.reduce((s,i)=>s+i.qty,0);

  return <div className="app">
    {toast.msg&&<div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
    <Header page={page} setPage={setPage} cartCount={cartCount} isAdmin={isAdmin} setToken={setToken} sareeTypes={sareeTypes} pickType={pickType} products={products} theme={theme} setTheme={setTheme}/>
    {page==='shop'&&<Shop products={products} cart={cart} setCart={setCart} show={show} selectedType={selectedType} setSelectedType={setSelectedType} sareeTypes={sareeTypes} settings={settings} discountSections={discountSections} wishlist={wishlist} toggleWishlist={toggleWishlist} pickType={pickType}/>}
    {page==='wishlist'&&<WishlistPage products={products} wishlist={wishlist} toggleWishlist={toggleWishlist} setCart={setCart} show={show} setPage={setPage}/>}
    {page==='cart'&&<Cart cart={cart} setCart={setCart} show={show} setPage={setPage} settings={settings}/>}
    {page==='track'&&<TrackOrder/>}
    {page==='login'&&<Login setToken={setToken} setPage={setPage} show={show}/>}
    {page==='admin'&&(isAdmin?<Admin token={token} products={products} load={load} show={show} sareeTypes={sareeTypes} settings={settings} setSettings={setSettings} loadSettings={loadSettings} loadDiscountSections={loadDiscountSections}/>:<Login setToken={setToken} setPage={setPage} show={show}/>)}
    <Footer settings={settings} setPage={setPage}/>
    <AiHelpBot settings={settings}/>
    <a href={`https://wa.me/${settings.shop_phone}?text=Hi! I'm interested in your sarees.`} target="_blank" rel="noreferrer" className="waFloat" title="Chat on WhatsApp">
      <svg viewBox="0 0 32 32" fill="currentColor"><path d="M16 0C7.163 0 0 7.163 0 16c0 2.828.74 5.482 2.033 7.789L0 32l8.418-2.009A15.928 15.928 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.284 13.284 0 01-6.77-1.851l-.485-.288-5.002 1.195 1.218-4.878-.317-.503A13.259 13.259 0 012.667 16C2.667 8.637 8.637 2.667 16 2.667S29.333 8.637 29.333 16 23.363 29.333 16 29.333zm7.29-9.95c-.4-.2-2.364-1.166-2.73-1.299-.366-.133-.633-.2-.9.2-.266.4-1.033 1.299-1.266 1.566-.233.266-.466.3-.866.1-.4-.2-1.688-.622-3.215-1.984-1.188-1.06-1.99-2.369-2.223-2.769-.233-.4-.025-.616.175-.815.18-.179.4-.466.6-.7.2-.233.266-.4.4-.666.133-.267.066-.5-.033-.7-.1-.2-.9-2.168-1.233-2.967-.324-.782-.655-.676-.9-.688-.233-.012-.5-.015-.766-.015-.266 0-.7.1-1.066.5-.366.4-1.4 1.368-1.4 3.336 0 1.967 1.433 3.867 1.633 4.134.2.266 2.82 4.303 6.833 6.033.955.412 1.7.658 2.28.843.957.305 1.83.262 2.52.159.768-.115 2.364-.967 2.697-1.9.333-.934.333-1.734.233-1.9-.1-.167-.366-.267-.766-.467z"/></svg>
    </a>
    {showTop&&<button className="backTop" onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}>↑</button>}
  </div>
}

/* ── HEADER ── */
function Header({page,setPage,cartCount,isAdmin,setToken,sareeTypes,pickType,products,theme,setTheme}){
  const [open,setOpen]=useState(false);
  const [mob,setMob]=useState(false);
  const items=sareeTypes.map(type=>{const m=type==='All Sarees'?null:products.find(p=>p.saree_type===type);return{type,name:m?.name||(type==='All Sarees'?'View complete collection':`Explore ${type}`)};});
  useEffect(()=>{
    const openOwnerLogin=(e)=>{ if(e.ctrlKey && e.shiftKey && e.key.toLowerCase()==='o') setPage(isAdmin?'admin':'login'); };
    window.addEventListener('keydown',openOwnerLogin);
    return()=>window.removeEventListener('keydown',openOwnerLogin);
  },[isAdmin,setPage]);
  return <header className="topbar">
    <div className="brand" onClick={()=>setPage('shop')} onDoubleClick={()=>setPage(isAdmin?'admin':'login')} title="Vigneswara Sarees"><img src={logo}/><div><h1>VIGNESWARA SAREES</h1><p>Premium saree boutique</p></div></div>
    <button className="hamburger" onClick={()=>setMob(!mob)}>☰</button>
    <nav className={`navlinks ${mob?'open':''}`}>
      <button className={page==='shop'?'active':''} onClick={()=>{setPage('shop');setMob(false);}}>Home</button>
      <div className="shopDrop" onMouseEnter={()=>setOpen(true)} onMouseLeave={()=>setOpen(false)}>
        <button className="dropBtn" onClick={()=>setOpen(!open)}>Shop ▾</button>
        {open&&<div className="megaMenu">
          <div className="megaHead"><b>Shop by Saree Type</b><span>Curated for every occasion</span></div>
          <div className="megaGrid">{items.map(i=><button key={i.type} onClick={()=>{pickType(i.type);setOpen(false);setMob(false);}}><b>{i.type}</b><span>{i.name}</span></button>)}</div>
        </div>}
      </div>
      <button className={page==='track'?'active':''} onClick={()=>{setPage('track');setMob(false);}}>📦 Track Order</button>
      <button className={page==='wishlist'?'active':''} onClick={()=>{setPage('wishlist');setMob(false);}}>♡ Wishlist</button>
      <button className={page==='cart'?'active':''} onClick={()=>{setPage('cart');setMob(false);}}>Bag{cartCount>0&&<span className="cartBadge">{cartCount}</span>}</button>
      {isAdmin&&<button className={page==='admin'?'active':''} onClick={()=>{setPage('admin');setMob(false);}}>Owner Dashboard</button>}
      <button className="themeBtn" onClick={()=>setTheme(theme==='light'?'dark':'light')}>{theme==='light'?'☽':'☀'}</button>
      {isAdmin&&<button className="logoutBtn" onClick={()=>{localStorage.removeItem('ownerToken');setToken('');setPage('shop');}}>Logout</button>}
    </nav>
  </header>
}

/* ── HERO with SLIDESHOW ── */
function Hero({settings}){
  const slides=(settings?.hero_slides&&settings.hero_slides.length?settings.hero_slides:DEFAULT_SETTINGS.hero_slides)||HERO_SLIDES;
  const [slide,setSlide]=useState(0);
  const [fading,setFading]=useState(false);
  useEffect(()=>{
    const t=setInterval(()=>{
      setFading(true);
      setTimeout(()=>{setSlide(s=>(s+1)%slides.length);setFading(false);},400);
    },3500);
    return()=>clearInterval(t);
  },[slides.length]);
  const goTo=(i)=>{setFading(true);setTimeout(()=>{setSlide(i);setFading(false);},300);};
  return <section className="hero">
    <div className="heroText">
      <span className="tag">✦ Premium Saree Boutique</span>
      <h2>Elegance woven into<br/>every thread</h2>
      <p>Discover handpicked silk, pattu, cotton, wedding, and designer sarees — crafted for celebrations that matter. Delivered to your door within <strong>7 days</strong>.</p>
      <div className="heroBtns">
        <a href="#collections" className="heroBtn primary-btn">Explore Collection</a>
        <a href="#testimonials" className="heroBtn outline-btn">Customer Stories</a>
      </div>
      <div className="heroStats">
        <div><b>500+</b><span>Saree Styles</span></div><div className="hdiv"></div>
        <div><b>10K+</b><span>Happy Customers</span></div><div className="hdiv"></div>
        <div><b>7 Days</b><span>Delivery</span></div>
      </div>
    </div>
    <div className="heroMedia">
      <img src={slides[slide]?.img} className={fading?'fading':''} alt={slides[slide]?.label||'Saree slide'}/>
      <div className="slideLabel">{slides[slide]?.label}</div>
      <div className="slideDots">
        {slides.map((_,i)=><button key={i} className={`slideDot ${i===slide?'active':''}`} onClick={()=>goTo(i)}/>)}
      </div>
      <button className="slideArrow slideLeft" onClick={()=>goTo((slide-1+slides.length)%slides.length)}>‹</button>
      <button className="slideArrow slideRight" onClick={()=>goTo((slide+1)%slides.length)}>›</button>
    </div>
  </section>
}

function TrustBadges(){return <section className="trustRow">{TRUST_BADGES.map((b,i)=><div key={i} className="trustItem"><span className="trustIcon">{b.icon}</span><div><b>{b.title}</b><p>{b.desc}</p></div></div>)}</section>}

function offerMatchesSection(offer, section){
  const offerText=normalizeSearchText(`${offer?.title||''} ${offer?.text||''}`);
  const sectionText=normalizeSearchText(`${section?.title||''} ${section?.text||''} ${section?.slug||''}`);
  if(!offerText || !sectionText) return false;
  if(sectionText.includes('new')) return offerText.includes('new');
  if(sectionText.includes('wedding')) return offerText.includes('wedding');
  if(sectionText.includes('premium')) return offerText.includes('premium');
  if(sectionText.includes('summer')) return offerText.includes('summer');
  if(sectionText.includes('silk saree discount')) return offerText.includes('silk') && !offerText.includes('premium');
  return false;
}

function Offers({sections=[],offers=[],onOfferClick=null}){
  const savedOffers=(offers&&offers.length?offers:DEFAULT_SETTINGS.offers);
  const list=(sections&&sections.length?sections:DEFAULT_SETTINGS.discount_sections).map((section,i)=>{
    const matchedOffer=savedOffers.find(offer=>offerMatchesSection(offer,section));
    return {...section,image:section.image||matchedOffer?.image,title:section.title||matchedOffer?.title,text:section.text||matchedOffer?.text};
  });
  const icons=['🎁','💍','✨','🚚','🔥','🌸'];
  return <section className="offersSection">
    <div className="offersHead"><span>Special Offers</span><h2>Today's Saree Deals</h2><p>Best picks, festival offers and delivery benefits from Vigneswara Sarees.</p></div>
    <div className="promoRow">{list.map((o,i)=><button key={i} className="promoCard" onClick={()=>onOfferClick?.(o)} style={{cursor:onOfferClick?'pointer':'default'}}>
      <div className="promoImageWrap">{o.image?<img src={apiImage(o.image)} alt={o.title||'Offer'}/>:<div className="promoImageFallback">{icons[i%icons.length]}</div>}<span className="promoDiscountBadge">{o.discount_percent?`${o.discount_percent}% OFF`:'OFFER'}</span></div>
      <div className="promoIcon">{icons[i%icons.length]}</div>
      <span className="promoNum">0{i+1}</span>
      <b>{o.title}</b>
      <span>{o.text}</span>
      <small>Shop now →</small>
    </button>)}</div>
  </section>
}

function FeaturedCollections({pickType,settings}){
  const featured=(settings?.featured_collections&&settings.featured_collections.length?settings.featured_collections:DEFAULT_SETTINGS.featured_collections);
  return <section className="featuredSection">
    <div className="sectionHead"><span className="accentBar"></span><div><h2>Featured Collections</h2><p>Curated picks for every occasion</p></div></div>
    <div className="featuredGrid">{featured.map(f=><button key={f.type} className="featuredCard" onClick={()=>pickType(f.type)}><img src={f.img} alt={f.label}/><div className="featuredOverlay"><b>{f.label}</b><span>{f.sub}</span><small>Shop Now →</small></div></button>)}</div>
  </section>
}

function Testimonials(){
  const [active,setActive]=useState(0);
  useEffect(()=>{const t=setInterval(()=>setActive(a=>(a+1)%TESTIMONIALS.length),4500);return()=>clearInterval(t);},[]);
  return <section className="testimonialSection" id="testimonials">
    <div className="sectionHead" style={{justifyContent:'center',textAlign:'center'}}><span className="accentBar"></span><div><h2>What Our Customers Say</h2><p>Real stories from real shoppers</p></div></div>
    <div className="testimonialGrid">{TESTIMONIALS.map((t,i)=><div key={i} className={`testimonialCard ${i===active?'tActive':''}`}><div className="stars">{'★'.repeat(t.rating)}</div><p>"{t.text}"</p><div className="tAuthor"><div className="tAvatar">{t.name[0]}</div><div><b>{t.name}</b><small>{t.location} · {t.saree}</small></div></div></div>)}</div>
    <div className="testimonialDots">{TESTIMONIALS.map((_,i)=><button key={i} className={`dot ${i===active?'active':''}`} onClick={()=>setActive(i)}/>)}</div>
  </section>
}


function normalizeSearchText(value=''){
  return String(value).toLowerCase()
    .replace(/sarees/g,'saree')
    .replace(/kanchipuram|kanchee|kanchi pattu/g,'kanchi')
    .replace(/banarsi/g,'banarasi')
    .replace(/mysuru/g,'mysore')
    .replace(/pattu/g,'silk pattu')
    .replace(/[^a-z0-9\s]/g,' ')
    .replace(/\s+/g,' ')
    .trim();
}
const SEARCH_ALIASES={
  silk:['pattu','silk saree','soft silk','mysore silk','tussar silk'],
  pattu:['silk','kanchi','kanchipuram','dharmavaram','uppada','gadwal','Kanjivaram'],
  wedding:['bridal','marriage','koorai','pelli'],
  cotton:['daily wear','office wear','casual'],
  party:['party wear','fancy','designer'],
  banarasi:['banarsi','gold weave'],
  kanchi:['kanchipuram','kanchi pattu','temple border'],
  halfsaree:['half saree','langa voni','lehenga choli'],
  red:['maroon','crimson'],
  gold:['zari','golden']
};
function expandSearchQuery(query){
  const base=normalizeSearchText(query);
  const parts=new Set(base.split(' ').filter(Boolean));
  Object.entries(SEARCH_ALIASES).forEach(([key,vals])=>{
    if(base.includes(key)||vals.some(v=>base.includes(normalizeSearchText(v)))){
      parts.add(key); vals.forEach(v=>normalizeSearchText(v).split(' ').forEach(x=>parts.add(x)));
    }
  });
  return [...parts].filter(Boolean);
}
function editDistance(a,b){
  if(!a||!b) return Math.max(a.length,b.length);
  if(Math.abs(a.length-b.length)>2) return 3;
  const dp=Array.from({length:a.length+1},(_,i)=>Array(b.length+1).fill(0));
  for(let i=0;i<=a.length;i++)dp[i][0]=i;
  for(let j=0;j<=b.length;j++)dp[0][j]=j;
  for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)dp[i][j]=Math.min(dp[i-1][j]+1,dp[i][j-1]+1,dp[i-1][j-1]+(a[i-1]!==b[j-1]));
  return dp[a.length][b.length];
}
function getProductSearchScore(product, query){
  const q=normalizeSearchText(query);
  if(!q) return 1;
  const tokens=expandSearchQuery(q);
  const mainTokens=q.split(' ').filter(Boolean);
  const fields={
    name:normalizeSearchText(product.name),
    type:normalizeSearchText(product.saree_type),
    color:normalizeSearchText(product.color),
    description:normalizeSearchText(product.description),
    category:normalizeSearchText(product.category)
  };
  const combined=Object.values(fields).join(' ');
  const words=combined.split(' ');
  let score=0;
  if(fields.name===q) score+=500;
  if(fields.type===q) score+=420;
  if(fields.color===q) score+=220;
  if(fields.name.startsWith(q)) score+=260;
  if(fields.type.startsWith(q)) score+=220;
  if(fields.name.includes(q)) score+=180;
  if(fields.type.includes(q)) score+=160;
  if(fields.color.includes(q)) score+=90;
  if(combined.includes(q)) score+=70;
  for(const token of tokens){
    if(!token||token==='saree') continue;
    const primary=mainTokens.includes(token);
    const boost=primary?1.4:1;
    if(fields.name.split(' ').includes(token)) score+=Math.round(90*boost); else if(fields.name.includes(token)) score+=Math.round(60*boost);
    if(fields.type.split(' ').includes(token)) score+=Math.round(85*boost); else if(fields.type.includes(token)) score+=Math.round(55*boost);
    if(fields.color.split(' ').includes(token)) score+=Math.round(45*boost); else if(fields.color.includes(token)) score+=Math.round(28*boost);
    if(fields.description.includes(token)) score+=18;
    if(token.length>=4 && words.some(w=>editDistance(token,w)<=1)) score+=28;
  }
  return score;
}
/* ── SHOP ── */
function Shop({products,cart,setCart,show,selectedType,setSelectedType,sareeTypes,settings,discountSections,wishlist,toggleWishlist,pickType}){
  const [search,setSearch]=useState('');const [max,setMax]=useState('');const [sort,setSort]=useState('Newest');const [sel,setSel]=useState(null);
  const [activeDiscount,setActiveDiscount]=useState(null);
  const q=search.trim();
  
  const handleDiscountClick=(section)=>{
    setActiveDiscount(section);
    setSelectedType('All Sarees');
    setSearch('');
    setTimeout(()=>document.getElementById('collections')?.scrollIntoView({behavior:'smooth'}),50);
  };
  
  const filtered=useMemo(()=>{
    let baseProducts=products;
    if(activeDiscount){
      const sectionProducts=activeDiscount.products||[];
      const sectionIds=new Set((activeDiscount.product_ids||sectionProducts.map(p=>p.id)).map(id=>String(id)));
      const productsById=new Map(products.map(p=>[String(p.id),p]));
      baseProducts=sectionProducts.length
        ? sectionProducts.map(p=>({...productsById.get(String(p.id)),...p})).filter(p=>p.id)
        : products.filter(p=>sectionIds.has(String(p.id)));
      baseProducts=baseProducts.map(p=>p.discount_price?{...p,original_price:p.original_price||p.price,price:p.discount_price}:p);
    }
    let list=baseProducts
      .map(p=>({...p,_searchScore:getProductSearchScore(p,q)}))
      .filter(p=>(q || selectedType==='All Sarees'||p.saree_type===selectedType)&&(!q||p._searchScore>0)&&(!max||p.price<=Number(max)));
    if(q) list=[...list].sort((a,b)=>b._searchScore-a._searchScore || a.price-b.price);
    if(sort==='Low to High')list=[...list].sort((a,b)=>a.price-b.price);
    if(sort==='High to Low')list=[...list].sort((a,b)=>b.price-a.price);
    return list;
  },[products,q,selectedType,max,sort,activeDiscount]);
  const add=(p,qty=1)=>{setCart(prev=>{const ex=prev.find(i=>i.id===p.id);if(ex)return prev.map(i=>i.id===p.id?{...i,qty:i.qty+qty}:i);return[...prev,{...p,qty}];});show(`${p.name} added to bag ✓`,'success');};
  return <main>
    <div className="topSearchBar">
      <div className="filterInput"><span>⌕</span><input placeholder="Search exact saree name, type, color..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
    </div>
    {!q&&<Hero settings={settings}/>}
    {!q&&<TrustBadges/>}
    {!q&&<Offers sections={discountSections} offers={settings.offers} onOfferClick={handleDiscountClick}/>}
    {!q&&<FeaturedCollections pickType={pickType} settings={settings}/>}
    {q&&<div className="searchResultsHeader"><b>Search results for “{search}”</b><span>{filtered.length} sarees found</span></div>}
    {activeDiscount&&<div className="searchResultsHeader"><b>{activeDiscount.title}</b><span>{filtered.length} sarees found{activeDiscount.discount_percent?` · ${activeDiscount.discount_percent}% discount`:''}</span><button onClick={()=>setActiveDiscount(null)}>Show all sarees</button></div>}
    <div id="collections" className="sectionHead" style={{marginTop:32}}><span className="accentBar"></span><div><h2>{activeDiscount?.title||selectedType}</h2><p>{filtered.length} styles available</p></div></div>
    <div className="filters collectionFilters">
      <select value={selectedType} onChange={e=>{setActiveDiscount(null);setSelectedType(e.target.value);}}>{sareeTypes.map(t=><option key={t}>{t}</option>)}</select>
      <input type="number" placeholder="Max price ₹" value={max} onChange={e=>setMax(e.target.value)}/>
      <select value={sort} onChange={e=>setSort(e.target.value)}><option>Newest</option><option>Low to High</option><option>High to Low</option></select>
    </div>
    {filtered.length===0?<div className="emptyState"><span>🔍</span><h3>No sarees found</h3><p>Try a different search or filter</p><button onClick={()=>{setSearch('');setMax('');setActiveDiscount(null);setSelectedType('All Sarees');}}>Clear Filters</button></div>:
    <div className="grid">{filtered.map((p,i)=><Product key={p.id} p={p} add={add} index={i} openDetails={setSel} wishlist={wishlist} toggleWishlist={toggleWishlist}/>)}</div>}
    {sel&&<ProductDetail p={sel} add={add} close={()=>setSel(null)} wishlist={wishlist} toggleWishlist={toggleWishlist}/>}
    <Testimonials/>
  </main>
}

/* ── PRODUCT CARD ── */
function Product({p,add,index,openDetails,wishlist,toggleWishlist}){
  const isWished=wishlist.includes(p.id);
  const cover=productImages(p)[0]||p.image;
  return <article className="card" style={{animationDelay:`${Math.min(index*0.05,0.6)}s`}} onClick={()=>openDetails(p)}>
    <div className="imgBox">
      <img src={apiImage(cover)} onError={e=>{e.currentTarget.src=logo;}} alt={p.name}/>
      {productImages(p).length>1&&<span className="mediaBadge">📷 {productImages(p).length}</span>}
      {p.video&&<span className="videoBadge">▶ Video</span>}
      {p.badge&&<span className={`badge badge-${p.badge?.toLowerCase()}`}>{p.badge}</span>}
      <button className="quick" onClick={e=>{e.stopPropagation();add(p);}}>+ Quick Add</button>
      <button className={`wishBtn ${isWished?'wished':''}`} onClick={e=>{e.stopPropagation();toggleWishlist(p.id);}}>{isWished?'♥':'♡'}</button>
    </div>
    <span className="pill">{p.saree_type}</span>
    <h3>{p.name}</h3>
    <p className="desc">{p.description}</p>
    <div className="priceBlock">
      {p.original_price&&Number(p.original_price)>Number(p.price)&&<small className="oldPrice">₹{Number(p.original_price).toLocaleString('en-IN')}</small>}
      <span className="bigPrice">₹{Number(p.price).toLocaleString('en-IN')}</span>
      {p.discount_percent>0&&<small className="discountTag">{p.discount_percent}% OFF</small>}
      <small className="colorTag">{p.color}</small>
    </div>
    <p className="deliveryTag">🚚 {p.delivery} &nbsp;·&nbsp; 📅 Delivered by <b>{getDeliveryDate()}</b></p>
    <div className="cardActions">
      <button className="primary" onClick={e=>{e.stopPropagation();add(p);}}>Add to Bag</button>
      <button className="detailBtn" onClick={e=>{e.stopPropagation();openDetails(p);}}>View Details</button>
    </div>
  </article>
}

/* ── PRODUCT DETAIL ── */
function ProductDetail({p,add,close,wishlist,toggleWishlist}){
  const isWished=wishlist.includes(p.id);
  const [qty,setQty]=useState(1);
  const imgs=productImages(p);
  const [media,setMedia]=useState({type:'image',src:imgs[0]||p.image});
  const [pin,setPin]=useState('');const [pinMsg,setPinMsg]=useState('');
  const checkPin=()=>{setPinMsg(pin.length===6&&/^\d+$/.test(pin)?`✓ Delivery available — arrives by ${getDeliveryDate()}`:'Please enter a valid 6-digit pincode');};
  return <div className="detailOverlay" onClick={close}>
    <section className="detailModal" onClick={e=>e.stopPropagation()}>
      <button className="closeBtn" onClick={close}>✕</button>
      <div className="detailImage">
        {p.badge&&<span className={`badge badge-${p.badge?.toLowerCase()}`}>{p.badge}</span>}
        {media.type==='video'?<video controls src={apiImage(media.src)} />:<img src={apiImage(media.src)} onError={e=>{e.currentTarget.src=logo;}} alt={p.name}/>} 
        <div className="thumbStrip">
          {imgs.map((img,i)=><button key={img+i} className={media.src===img?'active':''} onClick={()=>setMedia({type:'image',src:img})}><img src={apiImage(img)} onError={e=>{e.currentTarget.src=logo;}} alt={`${p.name} ${i+1}`}/></button>)}
          {p.video&&<button className={media.type==='video'?'active':''} onClick={()=>setMedia({type:'video',src:p.video})}>▶</button>}
        </div>
      </div>
      <div className="detailInfo">
        <span className="pill">{p.saree_type}</span>
        <h2>{p.name}</h2>
        <div className="priceRow">
          {p.original_price&&Number(p.original_price)>Number(p.price)&&<span className="oldPrice">₹{Number(p.original_price).toLocaleString('en-IN')}</span>}
          <span className="bigPriceDetail">₹{Number(p.price).toLocaleString('en-IN')}</span>
          {p.discount_percent>0&&<span className="discountTag">{p.discount_percent}% OFF</span>}
          <button className={`wishBtnLg ${isWished?'wished':''}`} onClick={()=>toggleWishlist(p.id)}>{isWished?'♥ Wishlisted':'♡ Wishlist'}</button>
        </div>
        <div className="deliveryInfo">
          <div className="diBadge">🚚 {p.delivery}</div>
          <div className="diBadge">📅 Delivery by {getDeliveryDate()}</div>
        </div>
        <p className="detailDesc">{p.description||'Premium saree from VIGNESWARA SAREES collection.'}</p>
        <div className="detailSpecs">
          <div><b>Type</b><span>{p.saree_type}</span></div>
          <div><b>Size</b><span>{p.size}</span></div>
          <div><b>Color</b><span>{p.color}</span></div>
          <div><b>Delivery</b><span>Within {DELIVERY_DAYS} days</span></div>
        </div>
        <div className="pincodeRow"><input placeholder="Enter pincode to check delivery" value={pin} onChange={e=>setPin(e.target.value)} maxLength={6}/><button className="checkBtn" onClick={checkPin}>Check</button></div>
        {pinMsg&&<p className={`pincodeMsg ${pinMsg.startsWith('✓')?'ok':'bad'}`}>{pinMsg}</p>}
        <div className="qtyRow"><span>Qty:</span><button onClick={()=>setQty(q=>Math.max(1,q-1))}>−</button><span className="qtyNum">{qty}</span><button onClick={()=>setQty(q=>q+1)}>+</button></div>
        <button className="primary big" onClick={()=>{add(p,qty);close();}}>Add {qty>1?`${qty} `:''}to Bag</button>
        <button className="outline" onClick={close}>Continue Shopping</button>
      </div>
    </section>
  </div>
}

/* ── TRACK ORDER ── */
function TrackOrder(){
  const [phone,setPhone]=useState('');const [orders,setOrders]=useState(null);const [loading,setLoading]=useState(false);const [err,setErr]=useState('');
  const track=async()=>{
    if(!phone.trim())return setErr('Please enter your phone number');
    setLoading(true);setErr('');setOrders(null);
    try{
      const res=await apiFetch(`/orders/track?phone=${encodeURIComponent(phone.trim())}`);
      if(!res.ok){setErr('No orders found for this number.');setOrders([]);}
      else{const data=await res.json();setOrders(data);}
    }catch{setErr('Backend not connected. Please start the backend server.');}
    setLoading(false);
  };
  const steps=['Order Placed','Processing','Packed','Shipped','Out for Delivery','Delivered'];
  const getStep=(status)=>{
    const map={New:1,Processing:2,Packed:3,Shipped:4,'Out for Delivery':5,Delivered:6};
    return map[status]||1;
  };
  return <main>
    <div className="pageHeader"><h2>📦 Track Your Order</h2><p>Enter your phone number to see your orders</p></div>
    <div className="trackBox">
      <div className="trackInputRow">
        <input placeholder="Enter your phone number (e.g. 9876543210)" value={phone} onChange={e=>setPhone(e.target.value)} onKeyDown={e=>e.key==='Enter'&&track()}/>
        <button className="primary" onClick={track} disabled={loading}>{loading?'Searching…':'Track Order'}</button>
      </div>
      {err&&<p className="trackErr">{err}</p>}
      {orders&&orders.length===0&&!err&&<div className="emptyState"><span>📭</span><h3>No orders found</h3><p>No orders placed with this number yet.</p></div>}
      {orders&&orders.map(o=>{
        const step=getStep(o.status);
        const placed=new Date(o.created_at);
        const delivery=new Date(placed);delivery.setDate(delivery.getDate()+DELIVERY_DAYS);
        const deliveryStr=delivery.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
        return <div className="orderTrackCard" key={o.id}>
          <div className="otcTop">
            <div><span className="orderNum">Order #{o.id}</span><span className={`trackStatus st-${o.status?.toLowerCase().replace(/\s/g,'-')}`}>{o.status||'New'}</span></div>
            <div className="otcMeta"><b>{o.customer_name}</b> · ₹{Number(o.total).toLocaleString('en-IN')}</div>
            <div className="otcMeta">📅 Ordered: {placed.toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</div>
            <div className="otcMeta">🚚 Expected Delivery: <b>{deliveryStr}</b></div>
          </div>
          <div className="trackSteps">
            {steps.map((s,i)=><div key={i} className={`trackStep ${i<step?'done':''} ${i===step-1?'current':''}`}>
              <div className="trackDot">{i<step?'✓':i+1}</div>
              <span>{s}</span>
              {i<steps.length-1&&<div className={`trackLine ${i<step-1?'done':''}`}/>}
            </div>)}
          </div>
          {o.items&&<div className="otcItems"><b>Items:</b>{(typeof o.items==='string'?JSON.parse(o.items):o.items).map((it,i)=><span key={i}>{it.name} × {it.qty||1}</span>)}</div>}
        </div>;
      })}
    </div>
  </main>
}

/* ── WISHLIST ── */
function WishlistPage({products,wishlist,toggleWishlist,setCart,show,setPage}){
  const wished=products.filter(p=>wishlist.includes(p.id));
  const add=(p)=>{setCart(prev=>{const ex=prev.find(i=>i.id===p.id);if(ex)return prev.map(i=>i.id===p.id?{...i,qty:i.qty+1}:i);return[...prev,{...p,qty:1}];});show(`${p.name} added to bag ✓`,'success');};
  return <main>
    <div className="pageHeader"><h2>My Wishlist</h2><p>{wished.length} saved {wished.length===1?'saree':'sarees'}</p></div>
    {wished.length===0?<div className="emptyState"><span>♡</span><h3>Your wishlist is empty</h3><p>Save sarees you love for later</p><button onClick={()=>setPage('shop')}>Browse Sarees</button></div>:
    <div className="grid">{wished.map((p,i)=><article key={p.id} className="card" style={{animationDelay:`${i*0.05}s`}}>
      <div className="imgBox"><img src={apiImage(productImages(p)[0]||p.image)} onError={e=>{e.currentTarget.src=logo;}} alt={p.name}/><button className="wishBtn wished" onClick={()=>toggleWishlist(p.id)}>♥</button></div>
      <span className="pill">{p.saree_type}</span><h3>{p.name}</h3>
      <div className="priceBlock"><span className="bigPrice">₹{Number(p.price).toLocaleString('en-IN')}</span></div>
      <button className="primary" onClick={()=>add(p)}>Move to Bag</button>
    </article>)}</div>}
  </main>
}

/* ── CART ── */
function Cart({cart,setCart,show,setPage,settings}){
  const total=cart.reduce((s,p)=>s+Number(p.price)*p.qty,0);
  const [f,setF]=useState({customer_name:'',phone:'',street:'',village:'',city:'',pincode:'',payment_method:'Cash on Delivery'});
  const [confirmed,setConfirmed]=useState(null);
  const remove=i=>setCart(cart.filter((_,idx)=>idx!==i));
  const updateQty=(i,qty)=>{if(qty<1)return remove(i);setCart(cart.map((item,idx)=>idx===i?{...item,qty}:item));};

  const order=async()=>{
    if(!cart.length)return show('Your bag is empty','warn');
    if(!f.customer_name||!f.phone||!f.street||!f.village||!f.city||!f.pincode)return show('Name, phone, street, village, city & pincode required','warn');
    const items=cart.map(p=>({id:p.id,name:p.name,price:p.price,qty:p.qty,type:p.saree_type,color:p.color}));
    const fullAddress = `${f.street}, ${f.village}, ${f.city} - ${f.pincode}`;

    // Save to backend
    const res=await apiFetch('/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...f,address:fullAddress,payment_phone:settings.payment_phone||settings.shop_phone,upi_id:settings.upi_id||'',items,total})}).catch(()=>null);
    if(!res?.ok)return show('Order failed. Check backend.','error');
    const orderData=await res.json().catch(()=>({}));
    const orderId=orderData.order_id||'N/A';

    const deliveryDate=getDeliveryDate();
    const emailSent=!!orderData.email?.sent;
    const confirmedOrder = {id:orderId, customer_name:f.customer_name, phone:f.phone, address:fullAddress, payment_method:f.payment_method, payment_phone:settings.payment_phone||settings.shop_phone, upi_id:settings.upi_id||'', items, total, status:'New', deliveryDate, emailSent};
    setConfirmed(confirmedOrder);
    setCart([]);
    show(`✓ Order #${orderId} confirmed! ${emailSent?'Owner email sent.':'Order saved. Configure SMTP for owner email.'}`,'success');
  };

  if(confirmed){
    const steps=['Order Confirmed','Processing','Packed','Shipped','Out for Delivery','Delivered'];
    const payLinks=makeUpiLinks({upi_id:confirmed.upi_id,payment_phone:confirmed.payment_phone,amount:confirmed.total,orderId:confirmed.id});
    return <main className="cartPage">
      <div className="orderSuccessHero">
        <div className="successTick">✓</div>
        <p className="successMini">VIGNESWARA SAREES</p>
        <h2>Order Confirmed!</h2>
        <p>Thank you, <b>{confirmed.customer_name}</b>. Your order has been placed successfully. Tracking is ready below and order details are saved. Owner email sends when SMTP is configured.</p>
        <div className="successMetaGrid">
          <div><span>Order ID</span><b>#{confirmed.id}</b></div>
          <div><span>Total Amount</span><b>₹{confirmed.total.toLocaleString('en-IN')}</b></div>
          <div><span>Delivery By</span><b>{confirmed.deliveryDate}</b></div>
          <div><span>Mobile</span><b>{confirmed.phone}</b></div>
          <div><span>Payment</span><b>{confirmed.payment_method}</b></div>
        </div>
      </div>
      <section className="orderTrackCard flipTrack">
        <div className="otcTop">
          <div><span className="orderNum">Order #{confirmed.id}</span><span className="trackStatus st-new">Confirmed</span></div>
          <div className="otcMeta">📦 Your order tracking started. Owner can update status from Owner Dashboard.</div>
        </div>
        <div className="trackSteps">
          {steps.map((s,i)=><div key={i} className={`trackStep ${i===0?'done current':''}`}>
            <div className="trackDot">{i===0?'✓':i+1}</div>
            <span>{s}</span>
            {i<steps.length-1&&<div className="trackLine"/>}
          </div>)}
        </div>
        <div className="paymentSummary"><b>Payment Details:</b><span>{confirmed.payment_method}</span>{confirmed.payment_method!=='Cash on Delivery'&&<span>Pay to: +{confirmed.payment_phone}{confirmed.upi_id?` / ${confirmed.upi_id}`:''}</span>}{confirmed.payment_method!=='Cash on Delivery'&&<div className="payButtons">{payLinks.needsUpi?<small className="warnText">Owner UPI ID missing. Add UPI ID in Admin Settings to open PhonePe/GPay with amount.</small>:<><a className="payBtn" href={payLinks.phonepe}>PhonePe Pay ₹{confirmed.total.toLocaleString('en-IN')}</a><a className="payBtn" href={payLinks.gpay}>Google Pay</a><a className="payBtn" href={payLinks.upi}>Any UPI App</a></>}</div>}</div>
        <div className="otcItems"><b>Ordered Items:</b>{confirmed.items.map((it,i)=><span key={i}>{it.name} ({it.type}) × {it.qty} — ₹{(it.price*it.qty).toLocaleString('en-IN')}</span>)}</div>
        <div className="successActions">
          <button className="primary" onClick={()=>setPage('track')}>Track Order Anytime</button>
          <button className="outline" onClick={()=>setPage('shop')}>Continue Shopping</button>
        </div>
      </section>
    </main>
  }

  return <main className="cartPage">
    <div className="pageHeader"><h2>Your Bag</h2><p>{cart.length} {cart.length===1?'item':'items'}</p></div>
    <div className="two">
      <section className="panel">
        <h3>Items</h3>
        {cart.length===0&&<div className="emptyState"><span>🛍</span><h3>Your bag is empty</h3><p>Add some beautiful sarees!</p></div>}
        {cart.map((p,i)=><div className="cartItem" key={i}>
          <img src={apiImage(productImages(p)[0]||p.image)} onError={e=>{e.currentTarget.src=logo;}} alt={p.name}/>
          <div className="cartInfo"><b>{p.name}</b><p>{p.saree_type} · {p.color}</p><span className="bigPrice" style={{fontSize:22}}>₹{(Number(p.price)*p.qty).toLocaleString('en-IN')}</span></div>
          <div className="cartQty"><button onClick={()=>updateQty(i,p.qty-1)}>−</button><span>{p.qty}</span><button onClick={()=>updateQty(i,p.qty+1)}>+</button></div>
          <button className="removeBtn" onClick={()=>remove(i)}>✕</button>
        </div>)}
        {cart.length>0&&<>
          <div className="cartTotal"><b>Total</b><span className="bigPrice" style={{fontSize:28}}>₹{total.toLocaleString('en-IN')}</span></div>
          <div className="deliveryInfoBar">🚚 Free delivery &nbsp;·&nbsp; 📅 Estimated by <b>{getDeliveryDate()}</b></div>
        </>}
      </section>
      <section className="panel">
        <h3>Delivery Details</h3>
        <div className="orderForm">
          <input placeholder="Your full name" value={f.customer_name} onChange={e=>setF({...f,customer_name:e.target.value})}/>
          <input placeholder="Phone number" value={f.phone} onChange={e=>setF({...f,phone:e.target.value})}/>
          <input placeholder="Street / Door no / Landmark" value={f.street} onChange={e=>setF({...f,street:e.target.value})}/>
          <input placeholder="Village / Area" value={f.village} onChange={e=>setF({...f,village:e.target.value})}/>
          <input placeholder="City / Town" value={f.city} onChange={e=>setF({...f,city:e.target.value})}/>
          <input placeholder="Pincode" value={f.pincode} onChange={e=>setF({...f,pincode:e.target.value})}/>
          <div className="paymentBox">
            <b>Payment Method</b>
            <label><input type="radio" name="payment" checked={f.payment_method==='Cash on Delivery'} onChange={()=>setF({...f,payment_method:'Cash on Delivery'})}/> Cash on Delivery</label>
            <label><input type="radio" name="payment" checked={f.payment_method==='PhonePe / Google Pay / UPI'} onChange={()=>setF({...f,payment_method:'PhonePe / Google Pay / UPI'})}/> PhonePe / Google Pay / UPI</label>
            {f.payment_method==='PhonePe / Google Pay / UPI'&&<div className="upiInfo">Pay to owner: <b>+{settings.payment_phone||settings.shop_phone}</b>{settings.upi_id&&<span>UPI: <b>{settings.upi_id}</b></span>}<small>After Place Order, PhonePe / Google Pay payment buttons open with exact amount.</small>{!settings.upi_id&&<small className="warnText">Add owner UPI ID in Admin Settings for direct PhonePe/GPay payment link.</small>}</div>}
          </div>
        </div>
        <div className="orderNote">
          <span>📦</span>
          <p>Click Place Order to confirm your order. Address and payment details will go to owner email.</p>
        </div>
        <button className="primary big" onClick={order}>Place Order</button>
      </section>
    </div>
  </main>
}

/* ── LOGIN ── */
function Login({setToken,setPage,show}){
  const [u,setU]=useState('admin');const [p,setP]=useState('admin12345');const [status,setStatus]=useState('Checking backend...');const [showForgot,setShowForgot]=useState(false);const [resetEmail,setResetEmail]=useState('');const [resetLoading,setResetLoading]=useState(false);
  useEffect(()=>{apiFetch('/').then(r=>r.ok?setStatus('Backend connected'):setStatus('Backend not connected')).catch(()=>setStatus('Backend not connected'));},[]);
  const login=async(e)=>{e?.preventDefault();const res=await apiFetch('/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:u,password:p})}).catch(()=>null);if(!res)return show('Backend not connected.','error');const d=await res.json().catch(()=>({}));if(!res.ok)return show(d.message||'Login failed','error');localStorage.setItem('ownerToken',d.token);setToken(d.token);setPage('admin');show('Welcome back, Owner!','success');};
  const sendReset=async(e)=>{e?.preventDefault();if(!resetEmail.trim())return show('Please enter your owner email','warn');setResetLoading(true);const res=await apiFetch('/admin/forgot-password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:resetEmail})}).catch(()=>null);setResetLoading(false);if(!res)return show('Backend not connected','error');const d=await res.json().catch(()=>({}));if(res.ok){setU(d.username||'admin');setP(d.password||'admin12345');show(d.message||'Password reset to admin12345','success');setResetEmail('');setShowForgot(false);}else show(d.message||'Password reset failed','error');};
  if(showForgot){
    return <main className="center"><section className="login panel"><h2>Reset Password</h2><p>Enter your registered owner email to reset login password.</p><form onSubmit={sendReset}><input type="email" placeholder="Enter your owner email" value={resetEmail} onChange={e=>setResetEmail(e.target.value)} required/><button type="submit" className="primary" disabled={resetLoading}>{resetLoading?'Resetting...':'Reset to Default Password'}</button></form><button type="button" className="outline" style={{marginTop:'12px',width:'100%'}} onClick={()=>{setShowForgot(false);setResetEmail('');}}>← Back to Login</button><div style={{marginTop:'16px',padding:'12px',background:'var(--bg2)',borderRadius:'8px',fontSize:'13px',textAlign:'left'}}><b>How it works:</b><br/>1. Enter the registered owner email<br/>2. Password resets immediately to: admin12345<br/>3. Login with username: admin<br/>4. Change password in Owner Dashboard Settings</div></section></main>
  }
  return <main className="center"><section className="login panel"><img src={logo}/><h2>Owner Login</h2><p>Manage products, offers and view orders.</p><p className={status==='Backend connected'?'status ok':'status bad'}>{status}</p><form onSubmit={login}><input name="username" placeholder="Username" value={u} onChange={e=>setU(e.target.value)}/><input name="password" type="password" placeholder="Password" value={p} onChange={e=>setP(e.target.value)}/><button type="submit" className="primary">Login</button></form><div style={{marginTop:'12px',display:'flex',justifyContent:'space-between',alignItems:'center'}}><small>Default: admin / admin12345</small><button type="button" className="outline" style={{padding:'4px 12px',fontSize:'12px'}} onClick={()=>setShowForgot(true)}>Forgot Password?</button></div></section></main>
}

/* ── ADMIN ── */
function Admin({token,products,load,show,sareeTypes,settings,setSettings,loadSettings,loadDiscountSections}){
  const [tab,setTab]=useState('add');
  const cleanTypes=sareeTypes.filter(t=>t!=='All Sarees');
  const empty={name:'',price:'',category:'Sarees',saree_type:'Silk Saree',size:'Free Size',color:'',delivery:'Free delivery',description:'',images:[],video:null};
  const [form,setForm]=useState(empty);const [orders,setOrders]=useState([]);const [edit,setEdit]=useState(null);const [sf,setSf]=useState(settings);const [pw,setPw]=useState({current_password:'',new_password:'',confirm_password:''});
  useEffect(()=>setSf(settings),[settings]);

  const submit=async()=>{
    if(!form.name||!form.price||!form.saree_type||!form.color)return show('Name, price, saree type, color required','warn');
    if(!edit&&(!form.images||form.images.length===0))return show('Please upload at least one saree photo','warn');
    const fd=new FormData();
    Object.entries(form).forEach(([k,v])=>{
      if(k==='images'){(v||[]).forEach(file=>fd.append('images',file));}
      else if(v!==null)fd.append(k,v);
    });
    const res=await apiFetch(edit?`/products/${edit}`:'/products',{method:edit?'PUT':'POST',headers:{Authorization:`Bearer ${token}`},body:fd}).catch(()=>null);
    const d=await res?.json().catch(()=>({}));
    if(!res?.ok)return show(d?.message||'Login expired or backend issue','error');
    setForm(empty);setEdit(null);load();show(edit?'Product updated ✓':'Product added ✓','success');setTab('manage');
  };

  const del=async(id)=>{if(!confirm('Delete this product?'))return;const res=await apiFetch(`/products/${id}`,{method:'DELETE',headers:{Authorization:`Bearer ${token}`}});if(res.ok){load();show('Deleted','info');}else show('Delete failed','error');};
  const startEdit=p=>{setEdit(p.id);setForm({...empty,...p,images:[],video:null});setTab('add');window.scrollTo({top:0,behavior:'smooth'});};
  const loadOrders=async()=>{const r=await apiFetch('/orders',{headers:{Authorization:`Bearer ${token}`}});if(r.ok)setOrders(await r.json());else show('Orders load failed','error');};
  const updateOrderStatus=async(id,status)=>{
    const res=await apiFetch(`/orders/${id}/status`,{method:'PUT',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({status})}).catch(()=>null);
    if(res?.ok){loadOrders();show(`Order #${id} marked as ${status}`,'success');}else show('Status update failed','error');
  };
  const changeOffer=(i,key,val)=>setSf({...sf,offers:(sf.offers||[]).map((o,idx)=>idx===i?{...o,[key]:val}:o)});
  const changeHeroSlide=(i,key,val)=>setSf({...sf,hero_slides:(sf.hero_slides||DEFAULT_SETTINGS.hero_slides).map((o,idx)=>idx===i?{...o,[key]:val}:o)});
  const changeFeatured=(i,key,val)=>setSf({...sf,featured_collections:(sf.featured_collections||DEFAULT_SETTINGS.featured_collections).map((o,idx)=>idx===i?{...o,[key]:val}:o)});
  const changeDiscount=(i,key,val)=>setSf({...sf,discount_sections:(sf.discount_sections||DEFAULT_SETTINGS.discount_sections).map((o,idx)=>idx===i?{...o,[key]:val}:o)});
  const toggleDiscountProduct=(sectionIndex,productId)=>{
    const sections=sf.discount_sections||DEFAULT_SETTINGS.discount_sections;
    const section=sections[sectionIndex]||{};
    const ids=(section.product_ids||[]).map(id=>String(id));
    const next=ids.includes(String(productId))?ids.filter(id=>id!==String(productId)):[...ids,String(productId)];
    changeDiscount(sectionIndex,'product_ids',next.map(Number));
  };
  const saveSettings=async()=>{const res=await apiFetch('/settings',{method:'PUT',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify(sf)}).catch(()=>null);const d=await res?.json().catch(()=>({}));if(!res?.ok)return show(d?.message||'Settings save failed','error');setSettings(d);loadSettings();loadDiscountSections?.();show('Settings saved ✓','success');};
  const changePassword=async()=>{if(!pw.current_password||!pw.new_password)return show('Current and new password required','warn');if(pw.new_password!==pw.confirm_password)return show('New passwords do not match','warn');const res=await apiFetch('/admin/change-password',{method:'PUT',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({current_password:pw.current_password,new_password:pw.new_password})}).catch(()=>null);const d=await res?.json().catch(()=>({}));if(!res?.ok)return show(d?.message||'Password change failed','error');setPw({current_password:'',new_password:'',confirm_password:''});show('Admin password changed ✓','success');};

  return <main className="adminPage">
    <div className="pageHeader"><h2>Owner Dashboard</h2><p>Manage your store</p></div>
    <div className="adminTabs">
      {[['add',edit?'✎ Edit Product':'+ Add Product'],['manage',`📦 Products (${products.length})`],['orders','📋 Orders'],['settings','⚙ Settings']].map(([t,label])=><button key={t} className={tab===t?'active':''} onClick={()=>setTab(t)}>{label}</button>)}
    </div>

    {tab==='add'&&<section className="panel">
      <h3>{edit?'Edit Product':'Add New Product'}</h3>
      <div className="adminForm">
        <div className="formGroup"><label>Product Name *</label><input placeholder="e.g. Royal Maroon Silk Saree" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
        <div className="formGroup"><label>Price (₹) *</label><input type="number" placeholder="e.g. 1499" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/></div>
        <div className="formGroup"><label>Saree Type *</label><select value={form.saree_type} onChange={e=>setForm({...form,saree_type:e.target.value})}>{cleanTypes.map(t=><option key={t}>{t}</option>)}</select></div>
        <div className="formGroup"><label>Color *</label><input placeholder="e.g. Maroon & Gold" value={form.color} onChange={e=>setForm({...form,color:e.target.value})}/></div>
        <div className="formGroup"><label>Size</label><input placeholder="Free Size" value={form.size} onChange={e=>setForm({...form,size:e.target.value})}/></div>
        <div className="formGroup"><label>Delivery</label><input placeholder="Free delivery" value={form.delivery} onChange={e=>setForm({...form,delivery:e.target.value})}/></div>
        <div className="formGroup full"><label>Description</label><textarea placeholder="Describe the saree..." value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div>
        <div className="formGroup full"><label>Saree Photos {!edit&&'*'} <small>(select many photos or add one-by-one)</small></label><label className="upload"><span>{form.images?.length?`✓ ${form.images.length} photos selected`:edit?'Upload new photos (optional)':'Click to upload multiple photos'}</span><input type="file" accept="image/*" multiple onChange={e=>{const picked=Array.from(e.target.files||[]);setForm(prev=>({...prev,images:[...(prev.images||[]),...picked]}));e.target.value='';}}/></label>{form.images?.length>0&&<div className="photoPreviewGrid">{form.images.map((file,i)=><div className="photoPreview" key={file.name+i}><img src={URL.createObjectURL(file)} alt={`photo ${i+1}`}/><button type="button" onClick={()=>setForm(prev=>({...prev,images:prev.images.filter((_,idx)=>idx!==i)}))}>×</button></div>)}</div>}</div>
        <div className="formGroup full"><label>Product Video <small>(optional)</small></label><label className="upload"><span>{form.video?`✓ ${form.video.name}`:edit?'Upload new video (optional)':'Click to upload video'}</span><input type="file" accept="video/mp4,video/webm,video/quicktime,video/x-m4v" onChange={e=>setForm({...form,video:e.target.files[0]||null})}/></label></div>
        <div className="formGroup full formActions"><button className="primary" onClick={submit}>{edit?'Update Product':'+ Add Product'}</button>{edit&&<button className="outline" onClick={()=>{setEdit(null);setForm(empty);}}>Cancel</button>}</div>
      </div>
    </section>}

    {tab==='manage'&&<section className="panel">
      <h3>All Products ({products.length})</h3>
      {products.length===0&&<div className="emptyState"><span>📦</span><h3>No products yet</h3><button onClick={()=>setTab('add')}>Add First Product</button></div>}
      <div className="manageGrid">{products.map(p=><div className="manageCard" key={p.id}>
        <img src={apiImage(productImages(p)[0]||p.image)} onError={e=>{e.currentTarget.src=logo;}} alt={p.name}/>
        <div className="manageInfo"><b>{p.name}</b><p className="bigPrice" style={{fontSize:18}}>₹{Number(p.price).toLocaleString('en-IN')}</p><small>{p.saree_type} · {p.color}</small></div>
        <div className="manageActions"><button className="editBtn" onClick={()=>startEdit(p)}>✎ Edit</button><button className="delBtn" onClick={()=>del(p.id)}>✕ Delete</button></div>
      </div>)}</div>
    </section>}

    {tab==='orders'&&<section className="panel">
      <div className="ordersHead"><h3>Customer Orders</h3><button onClick={loadOrders}>↻ Refresh</button></div>
      {orders.length===0&&<div className="emptyState"><span>📋</span><h3>No orders yet</h3><p>Click Refresh to load orders</p></div>}
      {orders.map(o=>{
        const placed=new Date(o.created_at);const delivery=new Date(placed);delivery.setDate(delivery.getDate()+DELIVERY_DAYS);
        return <div className="orderCard" key={o.id}>
          <div className="orderTop"><span className="orderNum">Order #{o.id}</span><span className={`trackStatus st-${(o.status||'new').toLowerCase().replace(/\s/g,'-')}`}>{o.status||'New'}</span></div>
          <b>{o.customer_name}</b><p>📞 {o.phone}</p><p>📍 {o.address}</p><p>🏘️ {o.street||''} {o.village?`· ${o.village}`:''} {o.city?`· ${o.city}`:''} {o.pincode?`· ${o.pincode}`:''}</p><p>💳 {o.payment_method||'Cash on Delivery'}{o.payment_method==='PhonePe / Google Pay / UPI'?` · Pay to +${o.payment_phone||''}${o.upi_id?' · '+o.upi_id:''}`:''}</p>
          <p className="bigPrice" style={{fontSize:20,margin:'8px 0'}}>₹{Number(o.total).toLocaleString('en-IN')}</p>
          <p style={{fontSize:13,color:'var(--muted)'}}>🚚 Deliver by: <b>{delivery.toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</b></p>
          <small>{o.created_at}</small>
          <div className="statusBtns">
            {['New','Processing','Packed','Shipped','Out for Delivery','Delivered'].map(s=><button key={s} className={o.status===s?'statusActive':''} onClick={()=>updateOrderStatus(o.id,s)}>{s}</button>)}
          </div>
        </div>;
      })}
    </section>}

    {tab==='settings'&&<section className="panel">
      <h3>Shop Settings</h3>
      <div className="adminForm">
        <div className="formGroup full"><label>WhatsApp Number (with country code)</label><input placeholder="e.g. 918639153979" value={sf.shop_phone||''} onChange={e=>setSf({...sf,shop_phone:e.target.value})}/></div>
        <div className="formGroup full"><label>Owner Email for Order Notifications</label><input type="email" placeholder="Durgaprasadkonda@gmail.com" value={sf.owner_email||''} onChange={e=>setSf({...sf,owner_email:e.target.value})}/></div>
        <div className="formGroup full"><label>Payment Phone Number for PhonePe / Google Pay</label><input placeholder="e.g. 918639153979" value={sf.payment_phone||''} onChange={e=>setSf({...sf,payment_phone:e.target.value})}/></div>
        <div className="formGroup full"><label>UPI ID (optional)</label><input placeholder="e.g. owner@upi" value={sf.upi_id||''} onChange={e=>setSf({...sf,upi_id:e.target.value})}/></div>
        <div className="formGroup full"><label>Shop Address</label><input placeholder="Sanivarapupeta, Eluru, Andhra Pradesh - 534003" value={sf.shop_address||SHOP_ADDRESS} onChange={e=>setSf({...sf,shop_address:e.target.value})}/></div>
        <h3 className="settingsSubTitle">Offer / Discount Cards</h3>
        {(sf.offers||[]).map((o,i)=><React.Fragment key={i}>
          <div className="formGroup"><label>Offer {i+1} Title</label><input value={o.title} onChange={e=>changeOffer(i,'title',e.target.value)}/></div>
          <div className="formGroup"><label>Offer {i+1} Text</label><input value={o.text} onChange={e=>changeOffer(i,'text',e.target.value)}/></div>
          <div className="formGroup full"><label>Offer {i+1} Discount Image URL</label><input placeholder="Paste discount / offer image URL" value={o.image||''} onChange={e=>changeOffer(i,'image',e.target.value)}/>{o.image&&<img className="settingsOfferPreview" src={o.image} alt="Offer preview"/>}</div>
          <div className="formGroup full"><label>Offer {i+1} Saree Types to Show</label><small>Leave blank to show all sarees. Hold Ctrl to select multiple.</small><select multiple size={5} value={o.filter_types||[]} onChange={e=>changeOffer(i,'filter_types',Array.from(e.target.selectedOptions,option=>option.value))} style={{width:'100%',padding:8}}>{cleanTypes.map(t=><option key={t}>{t}</option>)}</select></div>
        </React.Fragment>)}
        <h3 className="settingsSubTitle">Discount Product Sections</h3>
        {(sf.discount_sections||DEFAULT_SETTINGS.discount_sections).map((section,i)=><div className="discountEditor full" key={section.slug||i}>
          <div className="discountEditorHead">
            <div><b>{section.title}</b><small>{section.slug}</small></div>
            <label><span>Discount %</span><input type="number" min="0" max="95" value={section.discount_percent||0} onChange={e=>changeDiscount(i,'discount_percent',e.target.value)}/></label>
          </div>
          <div className="adminForm compactForm">
            <div className="formGroup"><label>Section Title</label><input value={section.title||''} onChange={e=>changeDiscount(i,'title',e.target.value)}/></div>
            <div className="formGroup"><label>Section Text</label><input value={section.text||''} onChange={e=>changeDiscount(i,'text',e.target.value)}/></div>
            <div className="formGroup full"><label>Section Image URL</label><input placeholder="Paste discount section image URL" value={section.image||''} onChange={e=>changeDiscount(i,'image',e.target.value)}/>{section.image&&<img className="settingsOfferPreview" src={apiImage(section.image)} alt="Discount section preview"/>}</div>
            <div className="formGroup full"><label>Saree Types for this Discount</label><small>Example: Wedding Picks can include Pattu Saree, Kanchi Pattu and Wedding Saree.</small><select multiple size={6} value={section.filter_types||[]} onChange={e=>changeDiscount(i,'filter_types',Array.from(e.target.selectedOptions,option=>option.value))}>{cleanTypes.map(t=><option key={t}>{t}</option>)}</select></div>
            <div className="formGroup full"><label>Exact Products <small>(optional)</small></label><small>If you select products here, this section shows only those products. If empty, it uses the saree types above. New Arrival shows newest products when both are empty.</small><div className="productPickGrid">{products.map(p=>{
              const checked=(section.product_ids||[]).map(id=>String(id)).includes(String(p.id));
              return <label key={p.id} className={checked?'productPick checked':'productPick'}><input type="checkbox" checked={checked} onChange={()=>toggleDiscountProduct(i,p.id)}/><img src={apiImage(productImages(p)[0]||p.image)} onError={e=>{e.currentTarget.src=logo;}} alt={p.name}/><span>{p.name}</span><small>{p.saree_type}</small></label>;
            })}</div></div>
          </div>
        </div>)}
        <h3 className="settingsSubTitle">Homepage Sliding Pictures</h3>
        {(sf.hero_slides||DEFAULT_SETTINGS.hero_slides).map((o,i)=><React.Fragment key={`slide-${i}`}>
          <div className="formGroup"><label>Slide {i+1} Title</label><input value={o.label||''} onChange={e=>changeHeroSlide(i,'label',e.target.value)}/></div>
          <div className="formGroup full"><label>Slide {i+1} Image URL</label><input placeholder="Paste homepage slide image URL" value={o.img||''} onChange={e=>changeHeroSlide(i,'img',e.target.value)}/>{o.img&&<img className="settingsOfferPreview" src={o.img} alt="Slide preview"/>}</div>
        </React.Fragment>)}
        <h3 className="settingsSubTitle">Featured Collections Pictures</h3>
        {(sf.featured_collections||DEFAULT_SETTINGS.featured_collections).map((o,i)=><React.Fragment key={`featured-${i}`}>
          <div className="formGroup"><label>Collection {i+1} Saree Type</label><input value={o.type||''} onChange={e=>changeFeatured(i,'type',e.target.value)}/></div>
          <div className="formGroup"><label>Collection {i+1} Title</label><input value={o.label||''} onChange={e=>changeFeatured(i,'label',e.target.value)}/></div>
          <div className="formGroup"><label>Collection {i+1} Subtitle</label><input value={o.sub||''} onChange={e=>changeFeatured(i,'sub',e.target.value)}/></div>
          <div className="formGroup full"><label>Collection {i+1} Saree Image URL</label><input placeholder="Paste featured collection image URL" value={o.img||''} onChange={e=>changeFeatured(i,'img',e.target.value)}/>{o.img&&<img className="settingsOfferPreview" src={o.img} alt="Featured preview"/>}</div>
        </React.Fragment>)}
        <div className="formGroup full formActions"><button className="primary" onClick={saveSettings}>Save Settings</button></div>
      </div>
      <hr style={{margin:'24px 0',border:'0',borderTop:'1px solid var(--line)'}}/>
      <h3>Change Admin Password</h3>
      <div className="adminForm">
        <div className="formGroup"><label>Current Password</label><input type="password" value={pw.current_password} onChange={e=>setPw({...pw,current_password:e.target.value})}/></div>
        <div className="formGroup"><label>New Password</label><input type="password" value={pw.new_password} onChange={e=>setPw({...pw,new_password:e.target.value})}/></div>
        <div className="formGroup"><label>Confirm New Password</label><input type="password" value={pw.confirm_password} onChange={e=>setPw({...pw,confirm_password:e.target.value})}/></div>
        <div className="formGroup full formActions"><button className="primary" onClick={changePassword}>Change Password</button></div>
      </div>
    </section>}
  </main>
}


function AiHelpBot({settings}){
  const [open,setOpen]=useState(false);
  const [text,setText]=useState('');
  const [messages,setMessages]=useState([{from:'bot',text:'Hi 👋 I am Vigneswara Sarees help bot. Ask me about order process, payment, tracking, delivery or shop address.'}]);
  const reply=(raw)=>{
    const msg=raw.toLowerCase();
    if(msg.includes('order')||msg.includes('place')||msg.includes('buy')) return 'Order process: choose saree → click Add to Bag → open Bag → fill name, phone, street, village, city and pincode → select COD or UPI → click Place Order. Owner will get email notification.';
    if(msg.includes('payment')||msg.includes('phonepe')||msg.includes('google')||msg.includes('gpay')||msg.includes('upi')) return 'Payment options: Cash on Delivery or UPI. For online payment, select PhonePe / Google Pay / UPI and click payment button. It opens UPI app with amount. After paying, owner verifies payment before shipping.';
    if(msg.includes('track')||msg.includes('status')) return 'Tracking process: click Track Order in menu → enter your phone number → you can see order status like New, Processing, Packed, Shipped, Out for Delivery and Delivered.';
    if(msg.includes('delivery')||msg.includes('days')) return 'Delivery: Usually within 7 days. Exact status will show in Track Order page after owner updates it.';
    if(msg.includes('address')||msg.includes('shop')||msg.includes('location')) return `Shop address: ${settings.shop_address||SHOP_ADDRESS}`;
    if(msg.includes('return')||msg.includes('exchange')) return 'For returns or exchange, contact shop owner on WhatsApp with your order phone number and product details.';
    if(msg.includes('contact')||msg.includes('whatsapp')||msg.includes('phone')) return `You can contact Vigneswara Sarees on WhatsApp: +${settings.shop_phone}. Shop address: ${settings.shop_address||SHOP_ADDRESS}`;
    return 'I can help with order process, payment, tracking, delivery and shop address. Example: type “How to order?” or “How to pay online?”';
  };
  const send=()=>{
    const clean=text.trim();
    if(!clean) return;
    setMessages(prev=>[...prev,{from:'user',text:clean},{from:'bot',text:reply(clean)}]);
    setText('');
  };
  return <div className="aiBotWrap">
    {open&&<div className="aiBotPanel">
      <div className="aiBotHead"><b>🤖 Saree Help Bot</b><button onClick={()=>setOpen(false)}>×</button></div>
      <div className="aiBotMessages">{messages.map((m,i)=><div key={i} className={`aiMsg ${m.from}`}>{m.text}</div>)}</div>
      <div className="aiQuickBtns">
        <button onClick={()=>{setMessages(p=>[...p,{from:'user',text:'How to order?'},{from:'bot',text:reply('order')}])}}>Order process</button>
        <button onClick={()=>{setMessages(p=>[...p,{from:'user',text:'Payment help'},{from:'bot',text:reply('payment')}])}}>Payment</button>
        <button onClick={()=>{setMessages(p=>[...p,{from:'user',text:'Shop address'},{from:'bot',text:reply('address')}])}}>Address</button>
      </div>
      <div className="aiBotInput"><input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')send();}} placeholder="Ask order/payment doubt..."/><button onClick={send}>Send</button></div>
    </div>}
    <button className="aiBotFab" onClick={()=>setOpen(!open)}>🤖 Help</button>
  </div>
}

/* ── FOOTER ── */
function Footer({settings,setPage}){
  return <footer className="footer">
    <div className="footerBrand"><img src={logo}/><h3>VIGNESWARA SAREES</h3><p>Premium sarees for weddings, festivals and daily elegance. Delivered within 7 days across India.</p><a href={`https://wa.me/${settings.shop_phone}`} target="_blank" rel="noreferrer" className="footerWa">💬 Chat on WhatsApp</a></div>
    <div><b>Quick Links</b><ul><li><button onClick={()=>setPage('shop')}>Home</button></li><li><button onClick={()=>setPage('shop')}>Collections</button></li><li><button onClick={()=>setPage('track')}>Track Order</button></li><li><button onClick={()=>setPage('wishlist')}>Wishlist</button></li><li><button onClick={()=>setPage('cart')}>Bag</button></li></ul></div>
    <div><b>Collections</b><ul><li><span>Silk Sarees</span></li><li><span>Pattu Sarees</span></li><li><span>Cotton Sarees</span></li><li><span>Wedding Sarees</span></li><li><span>Designer Sarees</span></li></ul></div>
    <div><b>Contact & Delivery</b><p>📱 WhatsApp: +{settings.shop_phone}</p><p>📍 {settings.shop_address||SHOP_ADDRESS}</p><p>🚚 Delivery: Within 7 days</p><p>Order notifications go to owner email.</p><p>💳 UPI: PhonePe / Google Pay available</p><div className="trustMini"><span>✦ 100% Genuine</span><span>📦 Order Tracking</span><span>🚚 7-Day Delivery</span></div></div>
    <div className="footerBottom"><p>© 2025 Vigneswara Sarees. All rights reserved.</p></div>
  </footer>
}

createRoot(document.getElementById('root')).render(<App/>);
