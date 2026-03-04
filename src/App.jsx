import React, { useState, useEffect } from 'react';
import { ShoppingBag, ChevronRight, CheckCircle, ShieldCheck, Leaf, Truck, Info, X } from 'lucide-react';

// --- DANE PRODUKTÓW ---
const PRODUCTS = [
  {
    id: 1,
    name: 'Miód z Maliną',
    price: 45.0,
    image: '/miod01.jpg', // Dodaj / na początku dla pewności
    description: 'Naturalny miód wielokwiatowy z dodatkiem liofilizowanej maliny. Idealny balans słodyczy i lekkiej kwasowości.',
    weight: '430g'
  },
  {
    id: 2,
    name: 'Miód z Imbirem i Cytryną',
    price: 45.0,
    image: '/miod02.jpg', 
    description: 'Miód z dodatkiem wyrazistego imbiru i orzeźwiającej cytryny. Doskonały wybór na chłodniejsze dni i wsparcie odporności.',
    weight: '430g'
  },
  {
    id: 3,
    name: 'Miód z Miętą i Czekoladą',
    price: 49.0,
    image: '/miod03.jpg', 
    description: 'Wyjątkowa kompozycja naturalnego miodu z orzeźwiającą miętą i prawdziwą czekoladą. Świetny dodatek do deserów.',
    weight: '430g'
  }
];
const SHIPPING_COST = 15.0;

export default function App() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('shop'); // shop -> form -> blik -> success
  
  // Formularz zamówienia
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip: ''
  });
  const [blikCode, setBlikCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

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

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

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

  // --- OBSŁUGA FORMULARZY ---
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const proceedToBlik = (e) => {
    e.preventDefault();
    setCheckoutStep('blik');
    window.scrollTo(0, 0);
  };

  const processBlikPayment = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    // Symulacja połączenia z API płatności (np. PayU/Przelewy24)
    setTimeout(() => {
      setIsProcessing(false);
      setCheckoutStep('success');
      setCart([]);
    }, 2500);
  };

  // --- KOMPONENTY POMOCNICZE ---
  const ImageWithFallback = ({ src, alt, className }) => {
    const [imgSrc, setImgSrc] = useState(src);
    return (
      <img 
        src={imgSrc} 
        alt={alt} 
        className={className}
        onError={() => {
          // Fallback w razie braku pliku w folderze
          setImgSrc("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%231f2937'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%23fbbf24'%3EZdjęcie Miodu%3C/text%3E%3C/svg%3E");
        }}
      />
    );
  };

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900 selection:bg-amber-200">
      
      {/* NAVBAR */}
      <nav className="sticky top-0 z-40 bg-zinc-900 text-amber-50 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setCheckoutStep('shop')}
          >
            <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-zinc-900 font-bold group-hover:bg-amber-400 transition-colors">
              <Leaf size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wider uppercase">Pasieka</h1>
              <p className="text-xs text-amber-500 tracking-widest uppercase">Nasze Pszczoły</p>
            </div>
          </div>

          {checkoutStep === 'shop' && (
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* WIDOK 1: SKLEP */}
        {checkoutStep === 'shop' && (
          <div className="animate-in fade-in duration-500">
            {/* Hero Section */}
            <div className="bg-zinc-900 rounded-3xl p-8 sm:p-12 mb-12 text-center text-white relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600"></div>
              <h2 className="text-3xl sm:text-5xl font-bold mb-4">Prawdziwy miód z naszej pasieki</h2>
              <p className="max-w-2xl mx-auto text-zinc-400 text-lg sm:text-xl mb-8">
                Tworzymy miody rzemieślnicze z pasją i szacunkiem do natury. Bez sztucznych dodatków, 
                bez kompromisów. Prosto z ula na Twój stół.
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-sm text-zinc-300">
                <div className="flex items-center gap-2"><ShieldCheck className="text-amber-500" size={18} /> Gwarancja jakości</div>
                <div className="flex items-center gap-2"><Truck className="text-amber-500" size={18} /> Szybka wysyłka</div>
                <div className="flex items-center gap-2"><Leaf className="text-amber-500" size={18} /> Produkt Polski</div>
              </div>
            </div>

            {/* Produkty */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
                    <div className="text-xs text-neutral-400 mb-4 border-b border-neutral-100 pb-4">
                      Waga netto: {product.weight}
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

            {/* Zasady biznesu */}
            <div className="mt-16 bg-neutral-100 rounded-2xl p-8 text-center max-w-3xl mx-auto">
              <h3 className="text-xl font-bold mb-4">Dlaczego warto nam zaufać?</h3>
              <p className="text-neutral-600 mb-6">
                Prowadzimy uczciwy biznes. Nie znajdziesz u nas fałszywych promocji ani ukrytych kosztów. 
                Cena, którą widzisz, jest ceną ostateczną za produkt. Płatność realizujemy wyłącznie za pośrednictwem 
                bezpiecznego systemu BLIK, aby zapewnić Ci maksymalną wygodę i bezpieczeństwo.
              </p>
            </div>
          </div>
        )}

        {/* WIDOK 2: FORMULARZ ZAMÓWIENIA */}
        {checkoutStep === 'form' && (
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button 
              onClick={() => setCheckoutStep('shop')}
              className="text-neutral-500 hover:text-zinc-900 mb-6 flex items-center gap-2 text-sm font-medium"
            >
              &larr; Wróć do sklepu
            </button>
            
            <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-6 sm:p-10">
              <h2 className="text-2xl font-bold mb-8">Dane do wysyłki</h2>
              
              <form onSubmit={proceedToBlik} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">Imię i nazwisko</label>
                    <input required type="text" name="name" value={formData.name} onChange={handleFormChange} className="w-full p-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">Telefon</label>
                    <input required type="tel" name="phone" value={formData.phone} onChange={handleFormChange} className="w-full p-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium text-neutral-700">Adres E-mail</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleFormChange} className="w-full p-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium text-neutral-700">Ulica i numer domu/mieszkania (lub kod Paczkomatu)</label>
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
                </div>

                <div className="mt-8 pt-8 border-t border-neutral-100">
                  <div className="bg-neutral-50 p-6 rounded-2xl mb-8">
                    <h3 className="font-bold text-lg mb-4">Podsumowanie</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between text-neutral-600">
                        <span>Wartość produktów:</span>
                        <span>{cartTotal.toFixed(2)} zł</span>
                      </div>
                      <div className="flex justify-between text-neutral-600">
                        <span>Wysyłka (Kurier/Paczkomat):</span>
                        <span>{SHIPPING_COST.toFixed(2)} zł</span>
                      </div>
                      <div className="flex justify-between text-xl font-bold text-zinc-900 pt-3 border-t border-neutral-200">
                        <span>Do zapłaty:</span>
                        <span>{(cartTotal + SHIPPING_COST).toFixed(2)} zł</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-4 bg-zinc-900 text-white rounded-xl font-bold text-lg hover:bg-amber-500 hover:text-zinc-900 transition-colors duration-200 flex justify-center items-center gap-2"
                  >
                    Przejdź do płatności BLIK <ChevronRight size={20} />
                  </button>
                  <p className="text-center text-xs text-neutral-400 mt-4 flex items-center justify-center gap-1">
                    <Info size={14} /> Twoje dane są bezpieczne. Płatność realizowana przez operatora BLIK.
                  </p>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* WIDOK 3: PŁATNOŚĆ BLIK */}
        {checkoutStep === 'blik' && (
          <div className="max-w-md mx-auto animate-in zoom-in-95 duration-500 mt-12">
             <div className="bg-white rounded-3xl shadow-lg border border-neutral-100 overflow-hidden">
                <div className="bg-zinc-900 p-8 text-center text-white">
                  <div className="flex justify-center mb-4">
                    {/* Zastępcze logo BLIK */}
                    <div className="bg-white text-zinc-900 font-black text-3xl px-4 py-2 rounded">BLIK</div>
                  </div>
                  <h2 className="text-xl font-bold mb-1">Kwota do zapłaty</h2>
                  <p className="text-4xl text-amber-400 font-bold">{(cartTotal + SHIPPING_COST).toFixed(2)} zł</p>
                </div>
                
                <form onSubmit={processBlikPayment} className="p-8 space-y-6">
                  <div className="text-center">
                    <label className="block text-sm font-medium text-neutral-600 mb-4">Wpisz 6-cyfrowy kod z aplikacji banku</label>
                    <input 
                      required 
                      type="text" 
                      maxLength="6"
                      pattern="\d{6}"
                      value={blikCode}
                      onChange={(e) => setBlikCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full text-center text-4xl tracking-[0.5em] p-4 rounded-xl border-2 border-neutral-200 focus:border-amber-500 focus:ring-0 outline-none transition-colors" 
                      placeholder="000000"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={blikCode.length !== 6 || isProcessing}
                    className="w-full py-4 bg-zinc-900 text-white rounded-xl font-bold text-lg hover:bg-amber-500 hover:text-zinc-900 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                  >
                    {isProcessing ? (
                      <span className="animate-pulse">Oczekiwanie na potwierdzenie...</span>
                    ) : (
                      'Kupuję i płacę'
                    )}
                  </button>
                  <button 
                    type="button"
                    disabled={isProcessing}
                    onClick={() => setCheckoutStep('form')}
                    className="w-full py-2 text-neutral-500 text-sm hover:text-zinc-900 transition-colors"
                  >
                    Anuluj i wróć
                  </button>
                </form>
             </div>
          </div>
        )}

        {/* WIDOK 4: SUKCES */}
        {checkoutStep === 'success' && (
          <div className="max-w-md mx-auto text-center animate-in zoom-in-95 duration-700 mt-20">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={48} />
            </div>
            <h2 className="text-3xl font-bold mb-4">Dziękujemy za zamówienie!</h2>
            <p className="text-neutral-600 mb-8">
              Płatność BLIK została potwierdzona. <br/>
              Wkrótce otrzymasz maila z potwierdzeniem, a my bierzemy się za pakowanie pysznego miodu.
            </p>
            <button 
              onClick={() => {
                setCheckoutStep('shop');
                setBlikCode('');
              }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-900 text-white rounded-xl font-medium hover:bg-amber-500 hover:text-zinc-900 transition-colors"
            >
              Wróć na stronę główną
            </button>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-zinc-900 text-neutral-400 py-12 mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left grid sm:grid-cols-2 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-white mb-4">
              <Leaf size={18} className="text-amber-500"/>
              <span className="font-bold uppercase tracking-wider">Pasieka Nasze Pszczoły</span>
            </div>
            <p className="text-sm">Rzemieślnicze wyroby prosto z natury. Uczciwe ceny, najwyższa jakość.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Kontakt</h4>
            <ul className="text-sm space-y-2">
              <li>kontakt@naszepszczoly.pl</li>
              <li>+48 123 456 789</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Płatności</h4>
            <p className="text-sm mb-2">Obsługujemy wyłącznie bezpieczne płatności BLIK.</p>
            <div className="inline-block bg-white text-zinc-900 font-bold text-xs px-2 py-1 rounded">BLIK</div>
          </div>
        </div>
      </footer>

      {/* KOSZYK (SIDEBAR) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsCartOpen(false)}
          ></div>
          <div className="relative w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-6 border-b border-neutral-100">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShoppingBag /> Twój koszyk
              </h2>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-neutral-400 space-y-4">
                  <ShoppingBag size={48} className="opacity-20" />
                  <p>Koszyk jest pusty.</p>
                </div>
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
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-xs text-neutral-400 hover:text-red-500 underline"
                          >
                            Usuń
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-neutral-100 bg-neutral-50">
                <div className="flex justify-between text-neutral-600 mb-2 text-sm">
                  <span>Wartość koszyka:</span>
                  <span>{cartTotal.toFixed(2)} zł</span>
                </div>
                <div className="flex justify-between font-bold text-xl text-zinc-900 mb-6">
                  <span>Suma (bez dostawy):</span>
                  <span>{cartTotal.toFixed(2)} zł</span>
                </div>
                <button 
                  onClick={() => {
                    setIsCartOpen(false);
                    setCheckoutStep('form');
                    window.scrollTo(0, 0);
                  }}
                  className="w-full py-4 bg-zinc-900 text-white rounded-xl font-bold hover:bg-amber-500 hover:text-zinc-900 transition-colors duration-200"
                >
                  Przejdź do kasy
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
    </div>
  );
}