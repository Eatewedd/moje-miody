import React, { useState } from 'react';
import { ShoppingBag, ChevronRight, CheckCircle, ShieldCheck, Truck, Info, X, MapPin, Smartphone, Box, Menu } from 'lucide-react';

// --- WŁASNY KOMPONENT IKONY (Plaster Miodu - zostawiłem jako dekorację w innych miejscach) ---
const HoneycombIcon = ({ size = 24, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 4l3.5 2v4l-3.5 2-3.5-2V6l3.5-2z" />
    <path d="M8.5 10l3.5 2v4l-3.5 2-3.5-2v-4l3.5-2z" />
    <path d="M15.5 10l3.5 2v4l-3.5 2-3.5-2v-4l3.5-2z" />
  </svg>
);

// --- DANE PRODUKTÓW ---
const PRODUCTS = [
  {
    id: 1,
    name: 'Miód z Maliną',
    price: 45.0,
    image: '/miod01.jpg',
    description: 'Naturalny miód wielokwiatowy z dodatkiem liofilizowanej maliny. Idealny balans słodyczy i lekkiej kwasowości.',
    weight: '430g',
    ingredients: 'Miód nektarowy wielokwiatowy 98%, malina liofilizowana 2%'
  },
  {
    id: 2,
    name: 'Miód z Imbirem i Cytryną',
    price: 45.0,
    image: '/miod02.jpg', 
    description: 'Miód z dodatkiem wyrazistego imbiru i orzeźwiającej cytryny. Doskonały wybór na chłodniejsze dni i wsparcie odporności.',
    weight: '430g',
    ingredients: 'Miód nektarowy wielokwiatowy 95%, cytryna liofilizowana 3%, imbir liofilizowany 2%'
  },
  {
    id: 3,
    name: 'Miód z Miętą i Czekoladą',
    price: 49.0,
    image: '/miod03.jpg', 
    description: 'Wyjątkowa kompozycja naturalnego miodu z orzeźwiającą miętą i prawdziwą czekoladą. Świetny dodatek do deserów.',
    weight: '430g',
    ingredients: 'Miód nektarowy wielokwiatowy 90%, prawdziwa czekolada 8%, mięta suszona 2%'
  }
];

const SHIPPING_COSTS = {
  pickup: 0.0,
  paczkomat: 15.0,
  kurier: 20.0
};

const DISPLAY_PHONE = '123 456 789';

export default function App() {
  // Nawigacja Główna
  const [activePage, setActivePage] = useState('shop'); // 'shop' | 'about'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Koszyk i Zamówienie
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('shop'); 
  
  // Formularz
  const [deliveryMethod, setDeliveryMethod] = useState('paczkomat');
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', address: '', city: '', zip: '', paczkomatCode: '', pickupMessage: '', acceptTerms: false
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);

  // --- LOGIKA KOSZYKA ---
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId) => setCart(prev => prev.filter(item => item.id !== productId));

  const updateQuantity = (productId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const currentShippingCost = SHIPPING_COSTS[deliveryMethod];

  // --- OBSŁUGA FORMULARZY ---
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const proceedToBlik = (e) => {
    e.preventDefault();
    setCheckoutStep('blik');
    window.scrollTo(0, 0);
  };

  // --- INTEGRACJA EMAIL ---
  const submitOrderToEmail = async () => {
    setIsProcessing(true); 
    
    let deliveryName = '';
    if(deliveryMethod === 'paczkomat') deliveryName = 'Paczkomat InPost';
    if(deliveryMethod === 'kurier') deliveryName = 'Kurier InPost';
    if(deliveryMethod === 'pickup') deliveryName = 'Odbiór osobisty';

    let emailBody = `Nowe zamówienie ze sklepu!\n\nKOSZYK:\n`;
    cart.forEach(item => {
      emailBody += `- ${item.quantity}x ${item.name} (${(item.price * item.quantity).toFixed(2)} zł)\n`;
    });
    
    emailBody += `\nDOSTAWA: ${deliveryName} (${currentShippingCost.toFixed(2)} zł)\n`;
    emailBody += `DO ZAPŁATY: ${(cartTotal + currentShippingCost).toFixed(2)} zł (Opłacone BLIKiem)\n\nDANE KLIENTA:\n`;
    emailBody += `Imię i nazwisko: ${formData.name}\nTelefon: ${formData.phone}\n`;
    
    if (deliveryMethod === 'paczkomat') {
      emailBody += `E-mail: ${formData.email}\nKod Paczkomatu: ${formData.paczkomatCode}\n`;
    } else if (deliveryMethod === 'kurier') {
      emailBody += `E-mail: ${formData.email}\nAdres uliczny: ${formData.address}\nKod pocztowy: ${formData.zip}\nMiasto: ${formData.city}\n`;
    } else {
      emailBody += `\nWiadomość o odbiorze: ${formData.pickupMessage}\n`;
    }

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: import.meta.env.VITE_WEB3FORMS_KEY,
          subject: `Nowe zamówienie od: ${formData.name} - ${(cartTotal + currentShippingCost).toFixed(2)} zł`,
          from_name: "Sklep Pasieka",
          message: emailBody,
        }),
      });

      if (response.ok) {
        setCheckoutStep('success');
        setCart([]);
      } else {
        alert("Wystąpił problem z wysłaniem zamówienia. Skontaktuj się z nami telefonicznie.");
      }
    } catch (error) {
      console.error(error);
      alert("Błąd połączenia. Spróbuj ponownie.");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- KOMPONENTY POMOCNICZE ---
  const ImageWithFallback = ({ src, alt, className }) => {
    const [imgSrc, setImgSrc] = useState(src);
    return (
      <img 
        src={imgSrc} 
        alt={alt} 
        className={className}
        onError={() => setImgSrc("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%231f2937'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%23fbbf24'%3EZdjęcie Miodu%3C/text%3E%3C/svg%3E")}
      />
    );
  };

  const handleNavClick = (page) => {
    setActivePage(page);
    setCheckoutStep('shop');
    setIsSidebarOpen(false);
    window.scrollTo(0,0);
  };

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900 selection:bg-amber-200">
      
      {/* NAVBAR */}
      <nav className="sticky top-0 z-40 bg-zinc-900 text-amber-50 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            {/* Przycisk Menu (Hamburger) */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 hover:bg-zinc-800 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <Menu size={24} />
            </button>

            {/* Logo z Pszczołą */}
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => handleNavClick('shop')}
            >
              <div className="w-10 h-10 bg-black rounded-full overflow-hidden flex items-center justify-center border border-zinc-800 shadow-sm">
                {/* Klasa object-contain pilnuje proporcji, więc pszczoła się nie rozciągnie */}
                <img src="/logo.jpg" alt="Logo Pasieki" className="w-full h-full object-contain" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold tracking-wider uppercase leading-none">Pasieka</h1>
                <p className="text-xs text-amber-500 tracking-widest uppercase mt-0.5">Nasze Pszczoły</p>
              </div>
            </div>
          </div>

          {activePage === 'shop' && checkoutStep === 'shop' && (
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 hover:bg-zinc-800 rounded-full transition-colors flex items-center gap-2"
            >
              <ShoppingBag className="text-amber-400" />
              <span className="hidden sm:inline-block text-sm font-medium">{cartTotal.toFixed(2)} zł</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-zinc-900 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {cartItemCount}
                </span>
              )}
            </button>
          )}
        </div>
      </nav>

      {/* GŁÓWNA ZAWARTOŚĆ */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 min-h-[70vh]">
        
        {/* WIDOK: O NAS */}
        {activePage === 'about' && (
          <div className="animate-in fade-in duration-500 max-w-3xl mx-auto py-8">
            <h2 className="text-3xl font-bold mb-6 text-zinc-900">O Naszej Pasiece</h2>
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-neutral-100 space-y-6 text-lg text-neutral-600 leading-relaxed">
              <p>
                Witaj w <strong>Pasiece Nasze Pszczoły</strong>! Jesteśmy małą, rodzinną pasieką, w której praca z pszczołami to nie tylko zajęcie, ale przede wszystkim wielka życiowa pasja. 
              </p>
              <p>
                Nasze ule stacjonują w spokojnej, zielonej okolicy m.in. na terenie Jakubowic Konińskich, z dala od zgiełku przemysłu. Dzięki temu nasze pszczoły mają doskonałe warunki do produkcji najwyższej jakości miodu.
              </p>
              <div className="flex justify-center my-8">
                <div className="w-32 h-32 bg-zinc-900 rounded-full overflow-hidden border-4 border-amber-100">
                   <img src="/logo.jpg" alt="Pszczoła" className="w-full h-full object-contain" />
                </div>
              </div>
              <p>
                Jako pasieka działająca w ramach <strong>Rolniczego Handlu Detalicznego (RHD)</strong>, stawiamy na 100% naturalność. Nasze miody nie są sztucznie podgrzewane ani filtrowane przemysłowo – trafiają do słoików prosto z ula, zachowując pełnię zdrowotnych właściwości i witamin.
              </p>
              <p>
                Z miłości do smaku tworzymy również unikalne kompozycje – łączymy nasz miód z naturalnymi dodatkami, takimi jak liofilizowana malina, imbir, cytryna czy prawdziwa czekolada. Spróbuj i przekonaj się sam!
              </p>
              <div className="pt-6 mt-6 border-t border-neutral-100 flex justify-center">
                <button 
                  onClick={() => handleNavClick('shop')}
                  className="px-8 py-3 bg-amber-500 text-zinc-900 font-bold rounded-xl hover:bg-amber-400 transition-colors"
                >
                  Przejdź do sklepu
                </button>
              </div>
            </div>
          </div>
        )}

        {/* WIDOK: SKLEP (Zarządza nim checkoutStep) */}
        {activePage === 'shop' && (
          <>
            {checkoutStep === 'shop' && (
              <div className="animate-in fade-in duration-500">
                <div className="bg-zinc-900 rounded-3xl p-6 sm:p-12 mb-8 sm:mb-12 text-center text-white relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600"></div>
                  <h2 className="text-2xl sm:text-5xl font-bold mb-2 sm:mb-4">Prawdziwy miód z naszej pasieki</h2>
                  
                  <p className="hidden sm:block max-w-2xl mx-auto text-zinc-400 text-lg sm:text-xl mb-8">
                    Tworzymy miody rzemieślnicze z pasją i szacunkiem do natury. Bez sztucznych dodatków, 
                    bez kompromisów. Prosto z ula na Twój stół.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-3 sm:gap-6 text-xs sm:text-sm text-zinc-300 mt-4 sm:mt-0">
                    <div className="flex items-center gap-2"><ShieldCheck className="text-amber-500" size={16} /> Gwarancja jakości</div>
                    <div className="flex items-center gap-2"><Truck className="text-amber-500" size={16} /> Paczkomat, Kurier lub Odbiór</div>
                    <div className="flex items-center gap-2"><HoneycombIcon className="text-amber-500" size={16} /> Produkt Polski</div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {PRODUCTS.map(product => (
                    <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
                      <div className="aspect-square bg-neutral-100 relative overflow-hidden">
                        <ImageWithFallback 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                      <div className="p-6 flex flex-col flex-grow">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-bold text-zinc-900">{product.name}</h3>
                          <span className="text-lg font-bold text-amber-600 whitespace-nowrap">{product.price.toFixed(2)} zł</span>
                        </div>
                        <p className="text-sm text-neutral-500 mb-4 flex-grow">{product.description}</p>
                        
                        <div className="text-xs text-neutral-400 mb-4 border-b border-neutral-100 pb-4 flex items-center gap-1.5">
                          <span>Waga netto: {product.weight}</span>
                          {product.ingredients && (
                            <div className="relative flex items-center group cursor-pointer">
                              <Info size={14} className="text-neutral-300 hover:text-amber-500 transition-colors" />
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-zinc-900 text-white text-[11px] leading-relaxed rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 text-center shadow-xl">
                                <span className="font-bold text-amber-400 block mb-1 uppercase tracking-wider text-[9px]">Skład:</span>
                                {product.ingredients}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900"></div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <button 
                          onClick={() => addToCart(product)}
                          className="w-full py-3 bg-zinc-900 text-white rounded-xl font-medium hover:bg-amber-500 hover:text-zinc-900 transition-colors duration-200"
                        >
                          Dodaj do koszyka
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Formularz Zamówienia */}
            {checkoutStep === 'form' && (
              <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <button 
                  onClick={() => setCheckoutStep('shop')}
                  className="text-neutral-500 hover:text-zinc-900 mb-6 flex items-center gap-2 text-sm font-medium"
                >
                  &larr; Wróć do sklepu
                </button>
                
                <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-6 sm:p-10">
                  <h2 className="text-2xl font-bold mb-8">Dane do zamówienia</h2>
                  
                  <form onSubmit={proceedToBlik} className="space-y-6">
                    <div className="mb-8">
                      <label className="block text-sm font-medium text-neutral-700 mb-3">Sposób dostawy</label>
                      <div className="grid sm:grid-cols-3 gap-3">
                        <button type="button" onClick={() => setDeliveryMethod('paczkomat')} className={`p-3 sm:p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all text-center ${deliveryMethod === 'paczkomat' ? 'border-amber-500 bg-amber-50 text-amber-900' : 'border-neutral-200 hover:border-neutral-300 text-neutral-600'}`}>
                          <Box className={deliveryMethod === 'paczkomat' ? 'text-amber-500' : 'text-neutral-400'} size={28} />
                          <div><div className="font-bold text-sm">Paczkomat</div><div className="text-xs opacity-80">{SHIPPING_COSTS.paczkomat.toFixed(2)} zł</div></div>
                        </button>
                        <button type="button" onClick={() => setDeliveryMethod('kurier')} className={`p-3 sm:p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all text-center ${deliveryMethod === 'kurier' ? 'border-amber-500 bg-amber-50 text-amber-900' : 'border-neutral-200 hover:border-neutral-300 text-neutral-600'}`}>
                          <Truck className={deliveryMethod === 'kurier' ? 'text-amber-500' : 'text-neutral-400'} size={28} />
                          <div><div className="font-bold text-sm">Kurier</div><div className="text-xs opacity-80">{SHIPPING_COSTS.kurier.toFixed(2)} zł</div></div>
                        </button>
                        <button type="button" onClick={() => setDeliveryMethod('pickup')} className={`p-3 sm:p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all text-center ${deliveryMethod === 'pickup' ? 'border-amber-500 bg-amber-50 text-amber-900' : 'border-neutral-200 hover:border-neutral-300 text-neutral-600'}`}>
                          <MapPin className={deliveryMethod === 'pickup' ? 'text-amber-500' : 'text-neutral-400'} size={28} />
                          <div><div className="font-bold text-sm leading-tight">Odbiór<br className="hidden sm:block"/> osobisty</div><div className="text-xs opacity-80 mt-0.5">Za darmo</div></div>
                        </button>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2 sm:col-span-2">
                        <label className="text-sm font-medium text-neutral-700">Imię i nazwisko</label>
                        <input required type="text" name="name" value={formData.name} onChange={handleFormChange} className="w-full p-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-700">Twój telefon</label>
                        <input required type="tel" name="phone" value={formData.phone} onChange={handleFormChange} className="w-full p-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all" />
                      </div>

                      {deliveryMethod === 'paczkomat' && (
                        <>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-700">Adres E-mail</label>
                            <input required type="email" name="email" value={formData.email} onChange={handleFormChange} className="w-full p-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all" />
                          </div>
                          <div className="space-y-2 sm:col-span-2">
                            <label className="text-sm font-medium text-neutral-700 flex items-center justify-between">
                              <span>Kod Paczkomatu (np. WAW123M)</span>
                              <a href="https://inpost.pl/znajdz-paczkomat" target="_blank" rel="noreferrer" className="text-xs text-amber-600 hover:underline">Znajdź kod</a>
                            </label>
                            <input required type="text" name="paczkomatCode" value={formData.paczkomatCode} onChange={handleFormChange} placeholder="Wpisz kod Paczkomatu" className="w-full p-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all uppercase" />
                          </div>
                        </>
                      )}

                      {deliveryMethod === 'kurier' && (
                        <>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-700">Adres E-mail</label>
                            <input required type="email" name="email" value={formData.email} onChange={handleFormChange} className="w-full p-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all" />
                          </div>
                          <div className="space-y-2 sm:col-span-2">
                            <label className="text-sm font-medium text-neutral-700">Ulica i numer domu/mieszkania</label>
                            <input required type="text" name="address" value={formData.address} onChange={handleFormChange} className="w-full p-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-700">Kod pocztowy</label>
                            <input required type="text" name="zip" value={formData.zip} onChange={handleFormChange} placeholder="00-000" className="w-full p-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-700">Miasto</label>
                            <input required type="text" name="city" value={formData.city} onChange={handleFormChange} className="w-full p-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all" />
                          </div>
                        </>
                      )}

                      {deliveryMethod === 'pickup' && (
                        <div className="space-y-2 sm:col-span-2 mt-2">
                          <label className="text-sm font-medium text-neutral-700">Kiedy chciałbyś odebrać miód?</label>
                          <textarea required name="pickupMessage" value={formData.pickupMessage} onChange={handleFormChange} rows="3" placeholder="Napisz, w jaki dzień i o której godzinie mniej więcej wpadniesz..." className="w-full p-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all resize-none" />
                        </div>
                      )}
                    </div>

                    <div className="mt-8 pt-8 border-t border-neutral-100">
                      <div className="bg-neutral-50 p-6 rounded-2xl mb-8">
                        <h3 className="font-bold text-lg mb-4">Podsumowanie</h3>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between text-neutral-600"><span>Wartość produktów:</span><span>{cartTotal.toFixed(2)} zł</span></div>
                          <div className="flex justify-between text-neutral-600">
                            <span>{deliveryMethod === 'paczkomat' && 'Paczkomat:'}{deliveryMethod === 'kurier' && 'Kurier:'}{deliveryMethod === 'pickup' && 'Odbiór osobisty:'}</span>
                            <span>{currentShippingCost > 0 ? `${currentShippingCost.toFixed(2)} zł` : 'Za darmo'}</span>
                          </div>
                          <div className="flex justify-between text-xl font-bold text-zinc-900 pt-3 border-t border-neutral-200"><span>Do zapłaty:</span><span>{(cartTotal + currentShippingCost).toFixed(2)} zł</span></div>
                        </div>
                      </div>

                      <div className="mb-8 flex items-start gap-3 bg-amber-50 p-4 rounded-xl border border-amber-100">
                        <input required type="checkbox" name="acceptTerms" id="terms" checked={formData.acceptTerms} onChange={handleFormChange} className="mt-1 w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500 cursor-pointer shrink-0" />
                        <label htmlFor="terms" className="text-sm text-neutral-700 leading-tight cursor-pointer">
                          Akceptuję <button type="button" onClick={() => setIsLegalModalOpen(true)} className="text-amber-600 font-bold hover:underline">Regulamin sklepu i Politykę Prywatności</button>. Wiem, że zamówienie wiąże się z obowiązkiem zapłaty. *
                        </label>
                      </div>

                      <button type="submit" className="w-full py-4 bg-zinc-900 text-white rounded-xl font-bold text-lg hover:bg-amber-500 hover:text-zinc-900 transition-colors duration-200 flex justify-center items-center gap-2">
                        Przejdź do płatności <ChevronRight size={20} />
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Płatność */}
            {checkoutStep === 'blik' && (
              <div className="max-w-xl mx-auto animate-in zoom-in-95 duration-500 mt-8 sm:mt-12">
                 <div className="bg-white rounded-3xl shadow-lg border border-neutral-100 overflow-hidden">
                    <div className="bg-zinc-900 p-8 text-center text-white">
                      <div className="flex justify-center mb-4"><div className="bg-white text-zinc-900 font-black text-2xl px-4 py-2 rounded flex items-center gap-2"><Smartphone size={24} /> BLIK na telefon</div></div>
                      <h2 className="text-lg font-medium text-neutral-400 mb-1">Kwota do zapłaty</h2>
                      <p className="text-4xl text-amber-400 font-bold">{(cartTotal + currentShippingCost).toFixed(2)} zł</p>
                    </div>
                    <div className="p-6 sm:p-10">
                      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 mb-8 text-neutral-800">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Info className="text-amber-500" /> Jak opłacić zamówienie?</h3>
                        <ol className="list-decimal pl-5 space-y-3 text-sm sm:text-base">
                          <li>Otwórz aplikację swojego banku na telefonie.</li>
                          <li>Wybierz opcję <strong>"Przelew na telefon BLIK"</strong>.</li>
                          <li>Jako odbiorcę wpisz numer: <strong className="text-lg whitespace-nowrap bg-white px-2 py-1 rounded border border-amber-200">{DISPLAY_PHONE}</strong></li>
                          <li>Przelej dokładną kwotę: <strong>{(cartTotal + currentShippingCost).toFixed(2)} zł</strong></li>
                          <li>W tytule przelewu wpisz swoje imię i nazwisko.</li>
                          <li>Po wykonaniu przelewu kliknij zielony przycisk poniżej!</li>
                        </ol>
                      </div>
                      <div className="space-y-4">
                        <button onClick={submitOrderToEmail} disabled={isProcessing} className="w-full py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-500 transition-colors duration-200 flex justify-center items-center gap-3 disabled:opacity-70 shadow-lg shadow-green-200/50">
                          {isProcessing ? <span className="animate-pulse">Wysyłanie zamówienia...</span> : <><CheckCircle size={20} /> Potwierdzam i wysyłam zamówienie</>}
                        </button>
                        <button onClick={() => setCheckoutStep('form')} disabled={isProcessing} className="w-full py-3 text-neutral-500 text-sm hover:text-zinc-900 transition-colors font-medium">Wróć do poprawy danych</button>
                      </div>
                    </div>
                 </div>
              </div>
            )}

            {/* Sukces */}
            {checkoutStep === 'success' && (
              <div className="max-w-md mx-auto text-center animate-in zoom-in-95 duration-700 mt-20">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={48} /></div>
                <h2 className="text-3xl font-bold mb-4">Zamówienie przyjęte!</h2>
                <p className="text-neutral-600 mb-8">Płatność BLIK weryfikujemy ręcznie. <br/>{deliveryMethod !== 'pickup' ? 'Szczegóły wysłaliśmy do pasieki. Niedługo bierzemy się za pakowanie pysznego miodu.' : 'Szczegóły wysłane! Skontaktujemy się z Tobą, żeby potwierdzić odbiór.'}</p>
                <button onClick={() => handleNavClick('shop')} className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-900 text-white rounded-xl font-medium hover:bg-amber-500 hover:text-zinc-900 transition-colors">Wróć do sklepu</button>
              </div>
            )}
          </>
        )}
      </main>

      {/* STOPKA */}
      <footer className="bg-zinc-900 text-neutral-400 py-12 mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left grid sm:grid-cols-2 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-white mb-4">
              <HoneycombIcon size={20} className="text-amber-500"/>
              <span className="font-bold uppercase tracking-wider">Pasieka Nasze Pszczoły</span>
            </div>
            <p className="text-sm">Rzemieślnicze wyroby prosto z natury. Uczciwe ceny, najwyższa jakość.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Kontakt</h4>
            <ul className="text-sm space-y-2">
              <li>{DISPLAY_PHONE}</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Płatności</h4>
            <p className="text-sm mb-2">Obsługujemy wyłącznie bezpieczne płatności BLIK na telefon.</p>
            <div className="inline-block bg-white text-zinc-900 font-bold text-xs px-2 py-1 rounded">BLIK na telefon</div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-zinc-800 text-xs text-neutral-500 text-center space-y-2">
          <p>Sprzedaż prowadzona w ramach Rolniczego Handlu Detalicznego (RHD).</p>
          <p>Pasieka Nasze Pszczoły - [Imię i Nazwisko Szwagra] | [Adres pasieki, np. Jakubowice Konińskie 123]</p>
          <p>Weterynaryjny Numer Identyfikacyjny (WNI): [Numer WNI]</p>
        </div>
      </footer>

      {/* KOSZYK (SIDEBAR Z PRAWEJ) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-6 border-b border-neutral-100">
              <h2 className="text-xl font-bold flex items-center gap-2"><ShoppingBag /> Twój koszyk</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="flex-grow overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-neutral-400 space-y-4"><ShoppingBag size={48} className="opacity-20" /><p>Koszyk jest pusty.</p></div>
              ) : (
                <div className="space-y-6">
                  {cart.map(item => (
                    <div key={item.id} className="flex gap-4 items-center">
                      <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl bg-neutral-100" />
                      <div className="flex-grow">
                        <h4 className="font-medium text-zinc-900 leading-tight mb-1">{item.name}</h4>
                        <div className="text-amber-600 font-bold text-sm mb-2">{item.price.toFixed(2)} zł</div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center bg-neutral-100 rounded-lg">
                            <button onClick={() => updateQuantity(item.id, -1)} className="px-3 py-1 hover:text-amber-600">-</button>
                            <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="px-3 py-1 hover:text-amber-600">+</button>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="text-xs text-neutral-400 hover:text-red-500 underline">Usuń</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {cart.length > 0 && (
              <div className="p-6 border-t border-neutral-100 bg-neutral-50">
                <div className="flex justify-between text-neutral-600 mb-2 text-sm"><span>Wartość koszyka:</span><span>{cartTotal.toFixed(2)} zł</span></div>
                <div className="flex justify-between font-bold text-xl text-zinc-900 mb-6"><span>Suma (bez dostawy):</span><span>{cartTotal.toFixed(2)} zł</span></div>
                <button onClick={() => { setIsCartOpen(false); handleNavClick('shop'); setCheckoutStep('form'); }} className="w-full py-4 bg-zinc-900 text-white rounded-xl font-bold hover:bg-amber-500 hover:text-zinc-900 transition-colors duration-200">Przejdź do kasy</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MENU NAWIGACYJNE (SIDEBAR Z LEWEJ) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[60] flex justify-start">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsSidebarOpen(false)}></div>
          <div className="relative w-4/5 max-w-sm bg-zinc-900 h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-300 text-white">
            
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black rounded-full overflow-hidden flex items-center justify-center border border-zinc-700">
                  <img src="/logo.jpg" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <span className="font-bold tracking-widest uppercase text-amber-500">Menu</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-zinc-400 hover:text-white rounded-full transition-colors"><X size={24} /></button>
            </div>

            <nav className="flex flex-col p-4 space-y-2 mt-4 flex-grow">
              <button 
                onClick={() => handleNavClick('shop')}
                className={`p-4 text-left rounded-xl text-lg font-medium transition-colors ${activePage === 'shop' ? 'bg-amber-500 text-zinc-900' : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'}`}
              >
                🍯 Sklep i Oferta
              </button>
              <button 
                onClick={() => handleNavClick('about')}
                className={`p-4 text-left rounded-xl text-lg font-medium transition-colors ${activePage === 'about' ? 'bg-amber-500 text-zinc-900' : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'}`}
              >
                🐝 O Naszej Pasiece
              </button>
              <button 
                onClick={() => { setIsSidebarOpen(false); window.scrollTo(0, document.body.scrollHeight); }}
                className="p-4 text-left rounded-xl text-lg font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                📞 Kontakt
              </button>
            </nav>

            <div className="p-6 text-xs text-zinc-500 border-t border-zinc-800">
              <p>Pasieka Nasze Pszczoły</p>
              <p>Rolniczy Handel Detaliczny</p>
            </div>
          </div>
        </div>
      )}
      
      {/* MODAL REGULAMINU I RODO */}
      {isLegalModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsLegalModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-neutral-100 shrink-0">
              <h3 className="text-xl font-bold">Regulamin i Polityka Prywatności</h3>
              <button onClick={() => setIsLegalModalOpen(false)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto text-sm text-neutral-600 space-y-6">
              <div>
                <h4 className="font-bold text-neutral-900 mb-2">CZĘŚĆ I: REGULAMIN SKLEPU</h4>
                <p className="mb-2"><strong>§ 1. Postanowienia ogólne</strong></p>
                <ol className="list-decimal pl-4 space-y-1 mb-4">
                  <li>Sprzedawcą miodu oraz Administratorem Danych Osobowych na stronie jest osoba fizyczna: [Imię i Nazwisko Szwagra], prowadząca działalność rolniczą w postaci pasieki "Nasze Pszczoły", zlokalizowanej pod adresem: [Adres pasieki, np. Jakubowice Konińskie 123].</li>
                  <li>Pasieka działa w ramach Rolniczego Handlu Detalicznego (RHD) i znajduje się pod nadzorem Powiatowego Lekarza Weterynarii. Weterynaryjny Numer Identyfikacyjny (WNI): [Numer WNI].</li>
                </ol>
                <p className="mb-2"><strong>§ 4. Prawo odstąpienia od umowy i Reklamacje</strong></p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Kupujący ma prawo odstąpić od umowy zawartej na odległość w terminie 14 dni bez podawania przyczyny.</li>
                  <li><strong>UWAGA:</strong> Prawo do odstąpienia nie przysługuje w przypadku produktów dostarczanych w zapieczętowanym opakowaniu (np. słoik miodu), których po otwarciu nie można zwrócić ze względu na ochronę zdrowia lub względy higieniczne.</li>
                </ol>
              </div>
              <div className="pt-4 border-t border-neutral-100">
                <h4 className="font-bold text-neutral-900 mb-2">CZĘŚĆ II: POLITYKA PRYWATNOŚCI (RODO)</h4>
                <p className="mb-2"><strong>§ 1. Kto przetwarza Twoje dane?</strong><br/>Administratorem Twoich danych osobowych przekazanych w formularzu zamówienia jest [Imię i Nazwisko Szwagra], [Adres].</p>
                <p className="mb-2"><strong>§ 2. Po co zbieramy Twoje dane?</strong><br/>Zbieramy Twoje dane wyłącznie w jednym celu: aby zrealizować Twoje zamówienie i wydać/wysłać Ci miód. Podstawą prawną jest niezbędność do wykonania umowy.</p>
                <p><strong>§ 3. Komu przekazujemy Twoje dane?</strong><br/>Nie sprzedajemy Twoich danych. Przekazujemy je wyłącznie podmiotom kurierskim w celu dostawy (jeśli dotyczy) oraz bezpiecznym kanałem e-mail do realizacji zamówienia.</p>
              </div>
            </div>
            <div className="p-6 border-t border-neutral-100 bg-neutral-50 shrink-0 rounded-b-2xl flex justify-end">
              <button onClick={() => setIsLegalModalOpen(false)} className="px-8 py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-amber-500 hover:text-zinc-900 transition-colors">Zamknij</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}