import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, ChevronRight, ChevronLeft, CheckCircle, ShieldCheck, Truck, Info, X, MapPin, Smartphone, Box, Menu, Camera, AlertCircle, Copy, FileText, Tag, XCircle } from 'lucide-react';

// --- WŁASNY KOMPONENT IKONY (Plaster Miodu) ---
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
    labelMain: 'MIÓD',
    labelSub: 'Z MALINĄ',
    labelColor: 'text-[#c2185b]',
    price: 45.0,
    image: '/miod01.jpg',
    description: 'Naturalny miód wielokwiatowy z dodatkiem liofilizowanej maliny. Idealny balans słodyczy i lekkiej kwasowości.',
    weight: '430g',
    ingredients: 'Miód nektarowy wielokwiatowy 98%, malina liofilizowana 2%',
    isAvailable: true
  },
  {
    id: 2,
    name: 'Miód z Imbirem i Cytryną',
    labelMain: 'MIÓD',
    labelSub: 'Z IMBIREM I CYTRYNĄ',
    labelColor: 'text-[#e0a82e]',
    price: 45.0,
    image: '/miod02.jpg',
    description: 'Miód z dodatkiem wyrazistego imbiru i orzeźwiającej cytryny. Doskonały wybór na chłodniejsze dni i wsparcie odporności.',
    weight: '430g',
    ingredients: 'Miód nektarowy wielokwiatowy 95%, cytryna liofilizowana 3%, imbir liofilizowany 2%',
    isAvailable: false
  },
  {
    id: 3,
    name: 'Miód z Miętą i Czekoladą',
    labelMain: 'MIÓD',
    labelSub: 'Z MIĘTĄ I CZEKOLADĄ',
    labelColor: 'text-[#5d4037]',
    price: 49.0,
    image: '/miod03.jpg',
    description: 'Wyjątkowa kompozycja naturalnego miodu z orzeźwiającą miętą i prawdziwą czekoladą. Świetny dodatek do deserów.',
    weight: '430g',
    ingredients: 'Miód nektarowy wielokwiatowy 90%, prawdziwa czekolada 8%, mięta suszona 2%',
    isAvailable: true
  }
];

// --- KODY RABATOWE (Hardcoded na ten moment) ---
const PROMO_CODES = {
    'WIOSNA10': 0.10, // 10% zniżki
    // Można dodać więcej: 'STAŁYKLIENT': 0.15,
};


const SHIPPING_COSTS = {
  pickup: 0.0,
  paczkomat: 15.0,
  kurier: 20.0
};

// BEZPIECZNE POBIERANIE ZMIENNYCH ŚRODOWISKOWYCH
const getEnvVar = (key, fallback) => {
  try {
    // eslint-disable-next-line no-undef
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // eslint-disable-next-line no-undef
      return import.meta.env[key];
    }
  } catch (e) {
    // Ignoruj błędy
  }
  return fallback;
};

const DISPLAY_PHONE = getEnvVar('VITE_SELLER_PHONE', '123 456 789');
const DISPLAY_EMAIL = getEnvVar('VITE_SELLER_EMAIL', 'kontakt@pasieka.pl');
const SELLER_NAME = getEnvVar('VITE_SELLER_NAME', '[Imię i Nazwisko]');
const SELLER_ADDRESS = getEnvVar('VITE_SELLER_ADDRESS', '[Adres pasieki]');
const SELLER_CITY = getEnvVar('VITE_SELLER_CITY', '[Miejscowość]');
const SELLER_WNI = getEnvVar('VITE_SELLER_WNI', '[Numer WNI]');
const SITE_URL = getEnvVar('VITE_SITE_URL', 'naszepszczoly.pl');
const WEB3FORMS_KEY = getEnvVar('VITE_WEB3FORMS_KEY', '');

// Pusty stan formularza, by łatwo resetować dane
const initialFormData = {
  name: '', email: '', phone: '', address: '', city: '', zip: '', paczkomatCode: '', pickupMessage: '', acceptTerms: false
};

export default function App() {
  // Podstawowe stany nawigacji
  const [activePage, setActivePage] = useState('shop');
  const [checkoutStep, setCheckoutStep] = useState('shop');

  // Stany nakładek (overlays)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState(null);

  // --- HISTORY API INIT & POPSTATE ---
  const applyState = useCallback((state) => {
    setActivePage(state.page || 'shop');
    setCheckoutStep(state.step || 'shop');
    setIsCartOpen(state.overlay === 'cart');
    setIsSidebarOpen(state.overlay === 'menu');
    setIsLegalModalOpen(state.overlay === 'legal');
    setSelectedGalleryIndex(state.overlay === 'gallery' ? state.index : null);
  }, []);

  useEffect(() => {
    if (!window.history.state) {
      window.history.replaceState({ page: 'shop', step: 'shop' }, '');
    } else {
      applyState(window.history.state);
    }

    const handlePopState = (e) => {
      if (e.state) {
        applyState(e.state);
      } else {
        applyState({ page: 'shop', step: 'shop' });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [applyState]);

  // --- HELPERY NAWIGACJI ---
  const navigateTo = useCallback((page, step, replace = false) => {
    const newState = { page, step };
    if (replace) {
      window.history.replaceState(newState, '');
    } else {
      window.history.pushState(newState, '');
    }
    applyState(newState);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [applyState]);

  const openOverlay = useCallback((overlayName, extraData = {}) => {
    const newState = { page: activePage, step: checkoutStep, overlay: overlayName, ...extraData };
    window.history.pushState(newState, '');
    applyState(newState);
  }, [activePage, checkoutStep, applyState]);

  const replaceOverlayWithPage = useCallback((page, step) => {
    const newState = { page, step };
    window.history.replaceState(newState, '');
    applyState(newState);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [applyState]);

  const replaceOverlayWithOverlay = useCallback((overlayName) => {
    const newState = { page: activePage, step: checkoutStep, overlay: overlayName };
    window.history.replaceState(newState, '');
    applyState(newState);
  }, [activePage, checkoutStep, applyState]);

  const handleCloseOverlay = useCallback(() => {
    if (window.history.state?.overlay) {
      window.history.back();
    } else {
      applyState({ page: activePage, step: checkoutStep });
    }
  }, [activePage, checkoutStep, applyState]);

  // --- POZOSTAŁE STANY ---
  const [toast, setToast] = useState({ message: '', type: 'error', visible: false });
  const showToast = useCallback((message, type = 'error') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 4000);
  }, []);

  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('pasieka_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Błąd ładowania koszyka", error);
      return [];
    }
  });

  // --- STANY KODÓW PROMOCYJNYCH ---
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromoCode, setAppliedPromoCode] = useState(null);
  const [promoError, setPromoError] = useState('');


  useEffect(() => {
    try {
      localStorage.setItem('pasieka_cart', JSON.stringify(cart));
    } catch (error) {
      console.error("Błąd zapisu koszyka", error);
    }
  }, [cart]);

  // --- OCHRONA PRZED COFANIEM W CZASIE (STATE GUARD) ---
  useEffect(() => {
    // Jeżeli użytkownik wejdzie wstecz (lub przez link) na etap kasy, mając pusty koszyk
    if ((checkoutStep === 'form' || checkoutStep === 'blik') && cart.length === 0) {
      replaceOverlayWithPage('shop', 'shop');
    }
  }, [checkoutStep, cart.length, replaceOverlayWithPage]);

  const [deliveryMethod, setDeliveryMethod] = useState('paczkomat');
  const [formData, setFormData] = useState(initialFormData);
  const [isProcessing, setIsProcessing] = useState(false);

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [scale, setScale] = useState(1);
  const [pinchDist, setPinchDist] = useState(null);
  const [activeTooltipId, setActiveTooltipId] = useState(null);

  // --- LOGIKA KOSZYKA I KALKULACJE ---
  const addToCart = (product) => {
    if (!product.isAvailable) return;

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });

    showToast(`Dodano: ${product.name}`, 'success');

    if (!isCartOpen) {
      openOverlay('cart');
    }
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

  // --- LOGIKA KODÓW PROMOCYJNYCH ---
  const handleApplyPromoCode = (e) => {
      e.preventDefault();
      setPromoError('');
      const normalizedCode = promoCodeInput.trim().toUpperCase();

      if (!normalizedCode) {
          setPromoError('Wpisz kod rabatowy.');
          return;
      }

      if (PROMO_CODES.hasOwnProperty(normalizedCode)) {
          setAppliedPromoCode(normalizedCode);
          showToast('Kod rabatowy aktywowany!', 'success');
      } else {
          setPromoError('Kod jest nieprawidłowy lub wygasł.');
          setAppliedPromoCode(null);
      }
  };

  const removePromoCode = () => {
      setAppliedPromoCode(null);
      setPromoCodeInput('');
      showToast('Kod rabatowy usunięty.', 'info');
  }


  // --- GŁÓWNE KALKULACJE FINANSOWE ---
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const currentShippingCost = SHIPPING_COSTS[deliveryMethod];

  // Kalkulacja rabatu
  const discountPercentage = appliedPromoCode ? PROMO_CODES[appliedPromoCode] : 0;
  const discountAmount = cartTotal * discountPercentage;
  const discountedCartTotal = cartTotal - discountAmount;

  // Ostateczna kwota do zapłaty
  const finalToBePaid = discountedCartTotal + currentShippingCost;


  // --- OBSŁUGA FORMULARZY I UX MASKS ---
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    let formattedValue = value;

    if (name === 'phone') {
      const digits = value.replace(/\D/g, '');
      formattedValue = digits.replace(/(\d{3})(?=\d)/g, '$1 ').substring(0, 11);
    }
    else if (name === 'zip') {
      const digits = value.replace(/\D/g, '');
      if (digits.length > 2) {
        formattedValue = `${digits.substring(0, 2)}-${digits.substring(2, 5)}`;
      } else {
        formattedValue = digits;
      }
    }

    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : formattedValue }));
  };

  const proceedToBlik = (e) => {
    e.preventDefault();
    navigateTo('shop', 'blik');
  };

  const submitOrderToEmail = async () => {
    setIsProcessing(true);

    let deliveryName = '';
    if(deliveryMethod === 'paczkomat') deliveryName = 'Paczkomat InPost';
    if(deliveryMethod === 'kurier') deliveryName = 'Kurier InPost';
    if(deliveryMethod === 'pickup') deliveryName = 'Odbiór osobisty';

    let emailBody = `Nowe zamówienie ze sklepu!\n\nKOSZYK (Wartość: ${cartTotal.toFixed(2)} zł):\n`;
    cart.forEach(item => {
      emailBody += `- ${item.quantity}x ${item.name} (${(item.price * item.quantity).toFixed(2)} zł)\n`;
    });

    if (appliedPromoCode) {
        emailBody += `\nZASTOSOWANY KOD RABATOWY: ${appliedPromoCode} (-${discountAmount.toFixed(2)} zł)\n`;
        emailBody += `WARTOŚĆ KOSZYKA PO RABACIE: ${discountedCartTotal.toFixed(2)} zł\n`;
    }

    emailBody += `\nDOSTAWA: ${deliveryName} (${currentShippingCost.toFixed(2)} zł)\n`;
    emailBody += `DO ZAPŁATY (SUMA): ${finalToBePaid.toFixed(2)} zł (Opłacone BLIKiem)\n\nDANE KLIENTA:\n`;
    emailBody += `Imię i nazwisko: ${formData.name}\nTelefon: ${formData.phone}\n`;

    if (deliveryMethod === 'paczkomat') {
      emailBody += `E-mail: ${formData.email}\nKod Paczkomatu: ${formData.paczkomatCode}\n`;
    } else if (deliveryMethod === 'kurier') {
      emailBody += `E-mail: ${formData.email}\nAdres uliczny: ${formData.address}\nKod pocztowy: ${formData.zip}\nMiasto: ${formData.city}\n`;
    } else {
      emailBody += `\nWiadomość o odbiorze: ${formData.pickupMessage}\n`;
    }

    try {
      const apiKey = WEB3FORMS_KEY;
      if (!apiKey) {
        setTimeout(() => {
           setCart([]);
           setFormData(initialFormData); // HARD RESET formularza
           setAppliedPromoCode(null); // Reset kodu
           setPromoCodeInput('');
           setIsProcessing(false);
           navigateTo('shop', 'success', true);
        }, 1500);
        return;
      }

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: apiKey,
          subject: `Nowe zamówienie od: ${formData.name} - ${finalToBePaid.toFixed(2)} zł`,
          from_name: "Sklep Pasieka",
          message: emailBody,
        }),
      });

      if (response.ok) {
        setCart([]);
        setFormData(initialFormData); // HARD RESET formularza
        setAppliedPromoCode(null); // Reset kodu
        setPromoCodeInput('');
        navigateTo('shop', 'success', true);
      } else {
        showToast("Wystąpił problem z wysłaniem zamówienia. Skontaktuj się z nami telefonicznie.", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Błąd połączenia z serwerem. Sprawdź dostęp do internetu.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyPhone = () => {
    const textArea = document.createElement("textarea");
    textArea.value = DISPLAY_PHONE.replace(/\s/g, '');
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      showToast("Skopiowano numer telefonu!", "success");
    } catch (err) {
      showToast("Nie udało się skopiować automatycznie.", "error");
    }
    document.body.removeChild(textArea);
  };

  // --- LOGIKA GALERII ---
  const handlePrevImage = useCallback(() => {
    setScale(1);
    setSwipeOffset(0);
    setIsSwiping(false);
    const nextIdx = selectedGalleryIndex === 1 ? 12 : selectedGalleryIndex - 1;
    const newState = { page: activePage, step: checkoutStep, overlay: 'gallery', index: nextIdx };
    window.history.replaceState(newState, '');
    applyState(newState);
  }, [activePage, checkoutStep, selectedGalleryIndex, applyState]);

  const handleNextImage = useCallback(() => {
    setScale(1);
    setSwipeOffset(0);
    setIsSwiping(false);
    const nextIdx = selectedGalleryIndex === 12 ? 1 : selectedGalleryIndex + 1;
    const newState = { page: activePage, step: checkoutStep, overlay: 'gallery', index: nextIdx };
    window.history.replaceState(newState, '');
    applyState(newState);
  }, [activePage, checkoutStep, selectedGalleryIndex, applyState]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedGalleryIndex === null) return;
      if (e.key === 'ArrowLeft') handlePrevImage();
      if (e.key === 'ArrowRight') handleNextImage();
      if (e.key === 'Escape') handleCloseOverlay();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedGalleryIndex, handlePrevImage, handleNextImage, handleCloseOverlay]);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setPinchDist(dist);
      setIsSwiping(false);
      setTouchStart(null);
    } else if (e.touches.length === 1 && scale === 1) {
      setTouchEnd(null);
      setTouchStart(e.targetTouches[0].clientX);
      setIsSwiping(true);
      setSwipeOffset(0);
    }
  };

  const onTouchMove = (e) => {
    if (e.touches.length === 2 && pinchDist) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const newScale = Math.min(Math.max(1, dist / pinchDist), 5);
      setScale(newScale);
    } else if (e.touches.length === 1 && scale === 1 && isSwiping && touchStart !== null) {
      const currentX = e.targetTouches[0].clientX;
      setTouchEnd(currentX);
      setSwipeOffset(currentX - touchStart);
    }
  };

  const onTouchEnd = (e) => {
    if (e.touches.length < 2) {
      setPinchDist(null);
      setScale(1);
    }

    if (touchStart !== null && touchEnd !== null && scale === 1 && isSwiping) {
      const distance = touchStart - touchEnd;
      const isLeftSwipe = swipeOffset < -minSwipeDistance;
      const isRightSwipe = swipeOffset > minSwipeDistance;

      if (isLeftSwipe) {
        handleNextImage();
      } else if (isRightSwipe) {
        handlePrevImage();
      } else {
        setSwipeOffset(0);
        setIsSwiping(false);
      }

      setTouchStart(null);
      setTouchEnd(null);
    } else {
      setIsSwiping(false);
      setSwipeOffset(0);
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
        onError={() => setImgSrc("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%231f2937'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%23e0a82e'%3EZdjęcie Miodu%3C/text%3E%3C/svg%3E")}
      />
    );
  };

  const renderCheckoutProgressBar = (currentStep) => (
    <div className="max-w-2xl mx-auto mb-10 mt-4 px-4">
      <div className="flex items-center justify-between w-full">
        <div className={`flex flex-col items-center gap-2 ${currentStep === 'form' || currentStep === 'blik' ? 'text-black' : 'text-neutral-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStep === 'form' || currentStep === 'blik' ? 'bg-[#e0a82e] text-black shadow-md' : 'bg-neutral-200'}`}>1</div>
          <span className="text-xs font-bold uppercase tracking-wider hidden sm:block">Dane</span>
        </div>

        <div className={`flex-grow h-1 mx-2 sm:mx-4 rounded-full ${currentStep === 'blik' ? 'bg-[#e0a82e]' : 'bg-neutral-200'}`}></div>

        <div className={`flex flex-col items-center gap-2 ${currentStep === 'blik' ? 'text-black' : 'text-neutral-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStep === 'blik' ? 'bg-[#e0a82e] text-black shadow-md' : 'bg-neutral-200'}`}>2</div>
          <span className="text-xs font-bold uppercase tracking-wider hidden sm:block">Płatność</span>
        </div>

        <div className="flex-grow h-1 mx-2 sm:mx-4 rounded-full bg-neutral-200"></div>

        <div className="flex flex-col items-center gap-2 text-neutral-400">
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-neutral-200">3</div>
          <span className="text-xs font-bold uppercase tracking-wider hidden sm:block">Gotowe</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900 selection:bg-[#f2c351]">

      {/* UX: TOAST NOTIFICATIONS */}
      <div className={`fixed bottom-[160px] sm:bottom-12 left-1/2 -translate-x-1/2 z-[200] transition-all duration-300 pointer-events-none ${toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className={`flex items-center gap-3 px-6 py-4 rounded-full shadow-2xl text-white font-medium whitespace-nowrap ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600 border border-green-500/50'}`}>
          {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
          {toast.message}
        </div>
      </div>

      {/* NAVBAR */}
      <nav className="sticky top-0 z-40 bg-black text-[#e0a82e] shadow-md border-b border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => openOverlay('menu')}
              className="p-2 -ml-2 hover:bg-[#1a1a1a] rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[#e0a82e] shrink-0"
            >
              <Menu size={26} className="text-[#e0a82e]" />
            </button>

            <div
              className="flex items-center gap-3 sm:gap-5 cursor-pointer group"
              onClick={() => {
                 if (activePage !== 'shop' || checkoutStep !== 'shop') navigateTo('shop', 'shop');
              }}
            >
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-black rounded-full overflow-hidden flex items-center justify-center shrink-0">
                <img src="/logo.jpg" alt="Logo Pasieki" className="w-full h-full object-contain scale-[1.35] transition-transform duration-300 group-hover:scale-[1.45]" />
              </div>
              <div className="flex items-baseline mt-1">
                <span className="font-serif text-lg sm:text-3xl text-white leading-none tracking-wide whitespace-nowrap">Pasieka Nasze Pszczoły</span>
              </div>
            </div>
          </div>

          {/* Koszyk ikona */}
          {activePage === 'shop' && checkoutStep === 'shop' && (
            <button
              onClick={() => openOverlay('cart')}
              className="relative p-2 hover:bg-[#1a1a1a] rounded-full transition-colors flex items-center gap-2"
            >
              <ShoppingBag className="text-[#e0a82e]" size={24} />
              <span className="hidden sm:inline-block text-sm font-medium text-white">{cartTotal.toFixed(2)} zł</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#e0a82e] text-black text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
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
            <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-8 text-zinc-900 text-center">O Naszej Pasiece</h2>
            <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-neutral-100 space-y-6 text-lg text-neutral-600 leading-relaxed">
              <p>
                Pasieka „Nasze Pszczoły” to coś więcej niż miejsce, w którym powstaje miód. To historia pasji, szacunku do natury i pracy pszczół, które każdego dnia tworzą prawdziwe skarby prosto z ula.
              </p>
              <p>
                Nazwa naszej pasieki nie jest przypadkowa. „Nasze Pszczoły” podkreśla, że pszczoły są wspólnym dobrem – pracują dla przyrody, dla ludzi i dla przyszłych pokoleń. Dzięki ich niezwykłej pracy zapylane są rośliny, rozwija się natura, a my możemy cieszyć się naturalnymi produktami o wyjątkowym smaku i wartości.
              </p>
              <p>
                Pasieka powstała z pasji do pszczelarstwa i miłości do przyrody. To, co zaczęło się jako hobby, z czasem rozwinęło się w gospodarstwo pasieczne, w którym tradycyjne metody pracy łączą się z dbałością o najwyższą jakość. Każdy etap powstawania miodu – od pracy pszczół po moment, gdy trafia on do słoika – odbywa się z ogromną troską o naturę i autentyczność produktu.
              </p>

              <div className="flex justify-center my-10">
                <div className="w-40 h-40 bg-black rounded-full overflow-hidden border-4 border-[#e0a82e]/30 flex items-center justify-center shadow-lg">
                    <img src="/logo.jpg" alt="Pszczoła" className="w-full h-full object-contain scale-[1.3]" />
                </div>
              </div>

              <p>
                Nasze ule stacjonują w spokojnej, zielonej okolicy, z dala od zgiełku przemysłu. Dzięki temu nasze pszczoły mają doskonałe warunki do produkcji najwyższej jakości miodu.
              </p>
              <p>
                Nasze pszczoły zbierają nektar z czystych, bogatych w roślinność terenów. Dzięki temu powstają miody o wyjątkowym aromacie, naturalnej słodyczy i niepowtarzalnym charakterze. Każdy słoik to efekt pracy tysięcy pszczół oraz gwarancja prawdziwego, naturalnego produktu.
              </p>

              <div className="bg-[#e0a82e]/5 rounded-2xl p-6 sm:p-8 my-8 border border-[#e0a82e]/20">
                <h3 className="font-serif font-bold text-2xl text-black mb-4">W naszej ofercie znajdziesz:</h3>
                <ul className="list-disc pl-5 space-y-2 marker:text-[#e0a82e]">
                  <li>miody tradycyjne,</li>
                  <li>miody kremowane o delikatnej, aksamitnej konsystencji,</li>
                  <li>miody kremowane z dodatkiem owoców liofilizowanych,</li>
                  <li>pyłek pszczeli oraz inne wartościowe produkty pszczele.</li>
                </ul>
              </div>

              <p>
                Wierzymy, że prawdziwy miód nie potrzebuje kompromisów – tylko natury, czasu i pracy pszczół. Dlatego dbamy o dobro naszych rodzin pszczelich i zachowanie naturalnych metod pozyskiwania miodu, aby każdy słoik był w pełni autentyczny.
              </p>
              <p className="font-serif text-xl text-black font-bold text-center mt-8">
                Pasieka „Nasze Pszczoły” – naturalny smak, który zaczyna się w ulu.
              </p>

              <div className="pt-8 mt-8 border-t border-neutral-100 flex justify-center">
                <button
                  onClick={() => navigateTo('shop', 'shop')}
                  className="px-8 py-4 bg-[#e0a82e] text-black font-bold text-lg rounded-xl hover:bg-[#f2c351] transition-colors flex items-center gap-2 shadow-xl shadow-[#e0a82e]/20"
                >
                  <ShoppingBag size={20} /> Przejdź do sklepu
                </button>
              </div>
            </div>
          </div>
        )}

        {/* WIDOK: GALERIA */}
        {activePage === 'gallery' && (
          <div className="animate-in fade-in duration-500 max-w-5xl mx-auto py-8">
             <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-4 text-zinc-900 text-center">Galeria</h2>
             <p className="text-neutral-500 mb-10 text-center text-lg max-w-2xl mx-auto">
               Z życia naszej pasieki. Zobacz, jak powstaje Twój ulubiony miód i gdzie pracują nasze pszczoły.
             </p>

             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
               {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => {
                 const formattedNum = num < 10 ? `0${num}` : `${num}`;
                 const imagePath = `/galeria${formattedNum}.jpg`;

                 return (
                   <div key={num} className="aspect-square bg-zinc-100 rounded-2xl overflow-hidden relative shadow-sm border border-neutral-100 group">
                      <img
                        src={imagePath}
                        alt={`Z życia pasieki ${num}`}
                        className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-500"
                        onClick={() => openOverlay('gallery', { index: num })}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="hidden absolute inset-0 bg-zinc-100 flex-col items-center justify-center text-zinc-400 p-6 text-center border-2 border-dashed border-zinc-300 m-2 rounded-xl">
                        <Camera size={32} className="mb-2 opacity-50" />
                        <span className="text-sm font-medium text-zinc-500">Miejsce na Twoje zdjęcie</span>
                        <span className="text-xs mt-1">Zapisz plik jako:<br/><strong className="text-zinc-600">galeria{formattedNum}.jpg</strong><br/>w folderze public</span>
                      </div>
                   </div>
                 );
               })}
             </div>

             <div className="mt-12 flex justify-center">
                <button
                  onClick={() => navigateTo('shop', 'shop')}
                  className="px-8 py-3 bg-black text-white font-bold rounded-xl hover:bg-[#e0a82e] hover:text-black transition-colors"
                >
                  Wróć do sklepu
                </button>
             </div>
          </div>
        )}

        {/* WIDOK: SKLEP */}
        {activePage === 'shop' && (
          <>
            {checkoutStep === 'shop' && (
              <div className="animate-in fade-in duration-500">
                <div className="bg-black rounded-3xl p-8 sm:p-12 mb-8 sm:mb-12 text-center text-white relative overflow-hidden shadow-xl">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#b8861b] via-[#f2c351] to-[#b8861b]"></div>

                  <h2 className="text-3xl sm:text-5xl font-serif font-bold mb-4 sm:mb-6 tracking-wide">Prawdziwy miód z naszej pasieki</h2>

                  <p className="hidden sm:block max-w-2xl mx-auto text-zinc-400 text-lg sm:text-xl mb-8 font-light">
                    Tworzymy miody rzemieślnicze z pasją i szacunkiem do natury. Bez sztucznych dodatków,
                    bez kompromisów. Prosto z ula na Twój stół.
                  </p>

                  <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4 sm:gap-8 text-sm text-zinc-300 mt-6 sm:mt-0">
                    <div className="flex items-center gap-2"><ShieldCheck className="text-[#e0a82e]" size={18} /> Gwarancja jakości</div>
                    <div className="flex items-center gap-2"><Truck className="text-[#e0a82e]" size={18} /> Paczkomat, Kurier lub Odbiór</div>
                    <div className="flex items-center gap-2"><HoneycombIcon className="text-[#e0a82e]" size={18} /> Produkt Polski</div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {PRODUCTS.map(product => (
                    <div key={product.id} className="bg-white rounded-2xl shadow-md border border-neutral-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col group relative">

                      <div className={`aspect-square bg-neutral-100 relative overflow-hidden ${!product.isAvailable ? 'opacity-60 grayscale-[40%]' : ''}`}>
                        {!product.isAvailable && (
                          <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm text-[#e0a82e] text-xs font-bold px-4 py-2 rounded-full z-10 uppercase tracking-widest border border-[#e0a82e]/40 shadow-xl whitespace-nowrap">
                            Wyprzedane
                          </div>
                        )}
                        <ImageWithFallback
                          src={product.image}
                          alt={product.name}
                          className={`w-full h-full object-cover object-center transition-transform duration-500 ${product.isAvailable ? 'group-hover:scale-105' : ''}`}
                        />
                      </div>

                      <div className="p-6 flex flex-col flex-grow">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex flex-col">
                            <h3 className="text-3xl sm:text-4xl font-serif text-zinc-900 tracking-widest uppercase leading-none mb-1">
                              {product.labelMain}
                            </h3>
                            <span className={`text-xs sm:text-sm font-medium tracking-widest uppercase ${product.isAvailable ? product.labelColor : 'text-neutral-400'}`}>
                              {product.labelSub}
                            </span>
                          </div>
                          <span className={`text-xl font-bold whitespace-nowrap ml-4 px-3 py-1 rounded-lg h-fit ${product.isAvailable ? 'text-[#c28e1f] bg-[#e0a82e]/10' : 'text-neutral-500 bg-neutral-100'}`}>
                            {product.price.toFixed(2)} zł
                          </span>
                        </div>

                        <p className="text-sm text-neutral-500 mb-4 flex-grow leading-relaxed">{product.description}</p>

                        <div className="text-xs text-neutral-400 mb-5 border-b border-neutral-100 pb-5 flex items-center gap-1.5 relative">
                          <span>Waga netto: {product.weight}</span>
                          {product.ingredients && (
                            <div
                              className="relative flex items-center cursor-pointer group/tooltip"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveTooltipId(activeTooltipId === product.id ? null : product.id);
                              }}
                              onMouseLeave={() => setActiveTooltipId(null)}
                            >
                              <Info size={15} className={`transition-colors ${activeTooltipId === product.id ? 'text-[#c28e1f]' : 'text-[#e0a82e]'}`} />
                              <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-black text-white text-[11px] leading-relaxed rounded-xl transition-all duration-200 z-20 text-center shadow-xl ${activeTooltipId === product.id ? 'opacity-100 visible' : 'opacity-0 invisible lg:group-hover/tooltip:opacity-100 lg:group-hover/tooltip:visible'}`}>
                                <span className="font-bold text-[#e0a82e] block mb-1 uppercase tracking-wider text-[9px]">Skład:</span>
                                {product.ingredients}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                              </div>
                            </div>
                          )}
                        </div>

                        <button
                          disabled={!product.isAvailable}
                          onClick={() => addToCart(product)}
                          className={`w-full py-3.5 rounded-xl font-bold tracking-wide flex justify-center items-center gap-2 transition-colors duration-200 ${
                            product.isAvailable
                              ? 'bg-black text-white hover:bg-[#e0a82e] hover:text-black shadow-lg shadow-black/10'
                              : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                          }`}
                        >
                          {product.isAvailable ? (
                            <><ShoppingBag size={18} /> Do koszyka</>
                          ) : (
                            'Chwilowy brak'
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Formularz Zamówienia (KROK 2) */}
            {checkoutStep === 'form' && (
              <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                {renderCheckoutProgressBar('form')}

                <button
                  onClick={() => replaceOverlayWithPage('shop', 'shop')}
                  className="text-neutral-500 hover:text-black mb-6 flex items-center gap-2 text-sm font-medium transition-colors"
                >
                  &larr; Wróć do sklepu
                </button>

                <form onSubmit={proceedToBlik} className="relative">
                  <div className="grid lg:grid-cols-3 gap-8 items-start">

                    <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-neutral-100 p-6 sm:p-10">
                      <h2 className="text-2xl font-bold mb-8">Dane do zamówienia</h2>

                      <div className="mb-8">
                        <label className="block text-sm font-medium text-neutral-700 mb-3">Sposób dostawy</label>
                        <div className="grid sm:grid-cols-3 gap-3">
                          <button type="button" onClick={() => setDeliveryMethod('paczkomat')} className={`p-3 sm:p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all text-center ${deliveryMethod === 'paczkomat' ? 'border-[#e0a82e] bg-[#e0a82e]/10 text-[#5e420b]' : 'border-neutral-200 hover:border-neutral-300 text-neutral-600'}`}>
                            <Box className={deliveryMethod === 'paczkomat' ? 'text-[#e0a82e]' : 'text-neutral-400'} size={28} />
                            <div><div className="font-bold text-sm">Paczkomat</div><div className="text-xs opacity-80">{SHIPPING_COSTS.paczkomat.toFixed(2)} zł</div></div>
                          </button>
                          <button type="button" onClick={() => setDeliveryMethod('kurier')} className={`p-3 sm:p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all text-center ${deliveryMethod === 'kurier' ? 'border-[#e0a82e] bg-[#e0a82e]/10 text-[#5e420b]' : 'border-neutral-200 hover:border-neutral-300 text-neutral-600'}`}>
                            <Truck className={deliveryMethod === 'kurier' ? 'text-[#e0a82e]' : 'text-neutral-400'} size={28} />
                            <div><div className="font-bold text-sm">Kurier</div><div className="text-xs opacity-80">{SHIPPING_COSTS.kurier.toFixed(2)} zł</div></div>
                          </button>
                          <button type="button" onClick={() => setDeliveryMethod('pickup')} className={`p-3 sm:p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all text-center ${deliveryMethod === 'pickup' ? 'border-[#e0a82e] bg-[#e0a82e]/10 text-[#5e420b]' : 'border-neutral-200 hover:border-neutral-300 text-neutral-600'}`}>
                            <MapPin className={deliveryMethod === 'pickup' ? 'text-[#e0a82e]' : 'text-neutral-400'} size={28} />
                            <div><div className="font-bold text-sm leading-tight">Odbiór<br className="hidden sm:block"/> osobisty</div><div className="text-xs opacity-80 mt-0.5">Za darmo</div></div>
                          </button>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-6 relative min-h-[300px]">
                        <div className="space-y-2 sm:col-span-2">
                          <label className="text-sm font-medium text-neutral-700">Imię i nazwisko</label>
                          <input required type="text" name="name" value={formData.name} onChange={handleFormChange} className="w-full p-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-[#e0a82e] focus:border-[#e0a82e] outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-neutral-700">Twój telefon</label>
                          <input required inputMode="numeric" type="tel" name="phone" value={formData.phone} onChange={handleFormChange} placeholder="XXX XXX XXX" className="w-full p-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-[#e0a82e] focus:border-[#e0a82e] outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-neutral-700">Adres E-mail</label>
                          <input required type="email" name="email" value={formData.email} onChange={handleFormChange} className="w-full p-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-[#e0a82e] focus:border-[#e0a82e] outline-none transition-all" />
                        </div>

                        {deliveryMethod === 'paczkomat' && (
                          <div className="space-y-2 sm:col-span-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="text-sm font-medium text-neutral-700 flex items-center justify-between">
                              <span>Kod Paczkomatu (np. WAW123M)</span>
                              <a href="https://inpost.pl/znajdz-paczkomat" target="_blank" rel="noreferrer" className="text-xs text-[#c28e1f] hover:underline">Znajdź kod</a>
                            </label>
                            <input required type="text" name="paczkomatCode" value={formData.paczkomatCode} onChange={handleFormChange} placeholder="Wpisz kod Paczkomatu" className="w-full p-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-[#e0a82e] focus:border-[#e0a82e] outline-none transition-all uppercase" />
                          </div>
                        )}

                        {deliveryMethod === 'kurier' && (
                          <div className="sm:col-span-2 grid sm:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="space-y-2 sm:col-span-2">
                              <label className="text-sm font-medium text-neutral-700">Ulica i numer domu/mieszkania</label>
                              <input required type="text" name="address" value={formData.address} onChange={handleFormChange} className="w-full p-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-[#e0a82e] focus:border-[#e0a82e] outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-neutral-700">Kod pocztowy</label>
                              <input required inputMode="numeric" type="text" name="zip" value={formData.zip} onChange={handleFormChange} placeholder="XX-XXX" className="w-full p-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-[#e0a82e] focus:border-[#e0a82e] outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-neutral-700">Miasto</label>
                              <input required type="text" name="city" value={formData.city} onChange={handleFormChange} className="w-full p-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-[#e0a82e] focus:border-[#e0a82e] outline-none transition-all" />
                            </div>
                          </div>
                        )}

                        {deliveryMethod === 'pickup' && (
                          <div className="space-y-2 sm:col-span-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="text-sm font-medium text-neutral-700">Kiedy chciałbyś odebrać miód?</label>
                            <textarea required name="pickupMessage" value={formData.pickupMessage} onChange={handleFormChange} rows="3" placeholder="Napisz, w jaki dzień i o której godzinie mniej więcej wpadniesz..." className="w-full p-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-[#e0a82e] focus:border-[#e0a82e] outline-none transition-all resize-none" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="lg:col-span-1 lg:sticky lg:top-28 space-y-6">
                      <div className="bg-neutral-50 p-6 rounded-3xl border border-neutral-200 shadow-sm">
                        <h3 className="font-bold text-lg mb-6 pb-4 border-b border-neutral-200">Podsumowanie</h3>
                        <div className="space-y-4 text-sm mb-6">
                          <div className="flex justify-between text-neutral-600"><span>Wartość koszyka:</span><span className="font-medium">{cartTotal.toFixed(2)} zł</span></div>
                          {appliedPromoCode && (
                               <div className="flex justify-between text-red-600">
                                   <span>Naliczony rabat:</span>
                                   <span className="font-medium">-{discountAmount.toFixed(2)} zł</span>
                               </div>
                           )}
                          <div className="flex justify-between text-neutral-600">
                            <span>{deliveryMethod === 'paczkomat' && 'Paczkomat:'}{deliveryMethod === 'kurier' && 'Kurier:'}{deliveryMethod === 'pickup' && 'Odbiór osobisty:'}</span>
                            <span className="font-medium">{currentShippingCost > 0 ? `${currentShippingCost.toFixed(2)} zł` : 'Za darmo'}</span>
                          </div>
                          <div className="flex justify-between text-xl font-bold text-black pt-4 border-t border-neutral-200"><span>Do zapłaty:</span><span>{finalToBePaid.toFixed(2)} zł</span></div>
                        </div>

                        <div className="mb-6 flex items-start gap-3 bg-[#e0a82e]/10 p-4 rounded-xl border border-[#e0a82e]/30">
                          <input required type="checkbox" name="acceptTerms" id="terms" checked={formData.acceptTerms} onChange={handleFormChange} className="mt-1 w-5 h-5 rounded border-[#e0a82e]/50 text-[#e0a82e] focus:ring-[#e0a82e] cursor-pointer shrink-0" />
                          <label htmlFor="terms" className="text-xs text-neutral-700 leading-tight cursor-pointer">
                            Akceptuję <button type="button" onClick={() => openOverlay('legal')} className="text-[#c28e1f] font-bold hover:underline">Regulamin i RODO</button>. *
                          </label>
                        </div>

                        <button type="submit" className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-[#e0a82e] hover:text-black transition-colors duration-200 flex justify-center items-center gap-2 shadow-xl shadow-black/10">
                          Zamawiam i płacę <ChevronRight size={20} />
                        </button>
                      </div>
                    </div>

                  </div>
                </form>
              </div>
            )}

            {/* Płatność */}
            {checkoutStep === 'blik' && (
              <div className="max-w-xl mx-auto animate-in fade-in duration-500 mt-4 sm:mt-12">
                 {renderCheckoutProgressBar('blik')}

                 <div className="bg-white rounded-3xl shadow-xl border border-neutral-100 overflow-hidden">
                    <div className="bg-black p-8 text-center text-white relative">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#b8861b] via-[#f2c351] to-[#b8861b]"></div>
                      <div className="flex justify-center mb-4"><div className="bg-white text-black font-black text-2xl px-4 py-2 rounded flex items-center gap-2"><Smartphone size={24} /> BLIK na telefon</div></div>
                      <h2 className="text-lg font-medium text-neutral-400 mb-1">Kwota do zapłaty</h2>
                      <p className="text-4xl text-[#e0a82e] font-bold">{finalToBePaid.toFixed(2)} zł</p>
                    </div>
                    <div className="p-6 sm:p-10">
                      <div className="bg-[#e0a82e]/10 border border-[#e0a82e]/30 rounded-2xl p-6 mb-8 text-neutral-800 text-center">
                        <h3 className="font-bold text-lg mb-6 flex justify-center items-center gap-2"><Info className="text-[#e0a82e]" /> Zrób przelew na ten numer:</h3>

                        <button
                           type="button"
                           onClick={handleCopyPhone}
                           className="group flex flex-col sm:flex-row items-center justify-center gap-3 mx-auto mb-6 bg-white p-4 rounded-xl border border-[#e0a82e]/40 hover:border-[#e0a82e] hover:shadow-lg transition-all"
                           title="Kliknij, aby skopiować numer"
                        >
                          <span className="text-2xl font-black tracking-wider text-black">{DISPLAY_PHONE}</span>
                          <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#c28e1f] bg-[#e0a82e]/10 px-3 py-1.5 rounded-lg group-hover:bg-[#e0a82e] group-hover:text-black transition-colors">
                            <Copy size={14} /> Kopiuj numer
                          </span>
                        </button>

                        <p className="text-sm sm:text-base text-neutral-600 mb-2">W tytule przelewu wpisz: <strong className="text-black">{formData.name}</strong></p>
                        <p className="text-sm text-neutral-500">Po zleceniu przelewu w aplikacji banku, poinformuj nas o tym przyciskiem poniżej.</p>
                      </div>
                      <div className="space-y-4">
                        <button onClick={submitOrderToEmail} disabled={isProcessing} className="w-full py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-500 transition-colors duration-200 flex justify-center items-center gap-3 disabled:opacity-70 shadow-lg shadow-green-200/50">
                          {isProcessing ? <span className="animate-pulse">Wysyłanie zamówienia...</span> : <><CheckCircle size={20} /> Przelew wysłany, zamawiam!</>}
                        </button>
                        <button onClick={() => replaceOverlayWithPage('shop', 'form')} disabled={isProcessing} className="w-full py-3 text-neutral-500 text-sm hover:text-black transition-colors font-medium">Wróć do poprawy danych</button>
                      </div>
                    </div>
                 </div>
              </div>
            )}

            {/* Sukces */}
            {checkoutStep === 'success' && (
              <div className="max-w-md mx-auto text-center animate-in zoom-in-95 duration-700 mt-20">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={48} /></div>
                <h2 className="text-3xl font-serif font-bold mb-4">Zamówienie przyjęte!</h2>
                <p className="text-neutral-600 mb-8">Płatność BLIK weryfikujemy ręcznie. <br/>{deliveryMethod !== 'pickup' ? 'Szczegóły wysłaliśmy do pasieki. Niedługo bierzemy się za pakowanie pysznego miodu.' : 'Szczegóły wysłane! Skontaktujemy się z Tobą, żeby potwierdzić odbiór.'}</p>
                <button onClick={() => replaceOverlayWithPage('shop', 'shop')} className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white rounded-xl font-medium hover:bg-[#e0a82e] hover:text-black transition-colors shadow-xl">Wróć do sklepu</button>
              </div>
            )}
          </>
        )}
      </main>

      {/* STOPKA */}
      <footer className="bg-black text-neutral-400 py-12 mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left grid sm:grid-cols-2 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-white mb-4">
              <HoneycombIcon size={20} className="text-[#e0a82e]"/>
              <span className="font-serif font-bold tracking-wider text-xl">Pasieka Nasze Pszczoły</span>
            </div>
            <p className="text-sm">Rzemieślnicze wyroby prosto z natury. Uczciwe ceny, najwyższa jakość.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Kontakt</h4>
            <ul className="text-sm space-y-2">
              <li>{DISPLAY_PHONE}</li>
              <li>{DISPLAY_EMAIL}</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Płatności</h4>
            <p className="text-sm mb-2">Obsługujemy wyłącznie bezpieczne płatności BLIK na telefon.</p>
            <div className="inline-block bg-white text-black font-bold text-xs px-2 py-1 rounded">BLIK na telefon</div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-[#1a1a1a] text-xs text-neutral-500 text-center space-y-2">
          <p>Sprzedaż prowadzona w ramach Rolniczego Handlu Detalicznego (RHD).</p>
          <p>Pasieka Nasze Pszczoły - {SELLER_NAME} | {SELLER_ADDRESS}</p>
          <p>Weterynaryjny Numer Identyfikacyjny (WNI): {SELLER_WNI}</p>
        </div>
      </footer>

      {/* KOSZYK (SIDEBAR Z PRAWEJ) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={handleCloseOverlay}></div>
          <div className="relative w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-6 border-b border-neutral-100">
              <h2 className="text-xl font-bold flex items-center gap-2"><ShoppingBag /> Twój koszyk</h2>
              <button onClick={handleCloseOverlay} className="p-2 hover:bg-neutral-100 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="flex-grow overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-neutral-400 space-y-6">
                  <ShoppingBag size={64} className="opacity-20" />
                  <p className="text-lg">Twój koszyk jest pusty.</p>
                  <button
                    onClick={handleCloseOverlay}
                    className="px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-[#e0a82e] hover:text-black transition-colors shadow-lg"
                  >
                    Wróć do sklepu
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {cart.map(item => (
                    <div key={item.id} className="flex gap-4 items-center">
                      <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl bg-neutral-100" />
                      <div className="flex-grow">
                        <h4 className="font-serif font-bold text-black leading-tight mb-1 tracking-wide">{item.name}</h4>
                        <div className="text-[#c28e1f] font-bold text-sm mb-2">{item.price.toFixed(2)} zł</div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center bg-neutral-100 rounded-lg">
                            <button onClick={() => updateQuantity(item.id, -1)} className="px-3 py-1 hover:text-[#e0a82e]">-</button>
                            <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="px-3 py-1 hover:text-[#e0a82e]">+</button>
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
              <div className="p-6 border-t border-neutral-100 bg-neutral-50 relative">
                {/* SEKJA KODÓW RABATOWYCH W KOSZYKU */}
                <div className="mb-6">
                    {!appliedPromoCode ? (
                        <form onSubmit={handleApplyPromoCode} className="flex gap-2">
                            <div className="relative flex-grow">
                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                                <input
                                    type="text"
                                    value={promoCodeInput}
                                    onChange={(e) => setPromoCodeInput(e.target.value)}
                                    placeholder="Kod rabatowy"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-[#e0a82e] focus:border-[#e0a82e] outline-none transition-all text-sm uppercase"
                                />
                            </div>
                            <button type="submit" className="px-4 py-3 bg-neutral-800 text-white font-bold rounded-xl hover:bg-[#e0a82e] hover:text-black transition-colors text-sm shrink-0">
                                Użyj
                            </button>
                        </form>
                    ) : (
                        <div className="flex items-center justify-between bg-green-50 border border-green-200 p-3 rounded-xl text-green-700">
                             <div className="flex items-center gap-2 font-bold text-sm">
                                <Tag size={18} /> Aktywny rabat (-{(discountPercentage*100).toFixed(0)}%)
                             </div>
                             <button onClick={removePromoCode} className="text-neutral-400 hover:text-red-500 transition-colors p-1">
                                 <XCircle size={20} />
                             </button>
                        </div>
                    )}
                    {promoError && <p className="text-red-500 text-xs mt-2 ml-2 font-medium">{promoError}</p>}
                </div>

                <div className="flex justify-between text-neutral-600 mb-2 text-sm"><span>Wartość koszyka:</span><span>{cartTotal.toFixed(2)} zł</span></div>
                {appliedPromoCode && (
                    <div className="flex justify-between text-red-600 mb-2 text-sm font-medium">
                        <span>Naliczony rabat:</span>
                        <span>-{discountAmount.toFixed(2)} zł</span>
                    </div>
                )}
                <div className="flex justify-between font-bold text-xl text-black mb-6"><span>Suma (bez dostawy):</span><span>{discountedCartTotal.toFixed(2)} zł</span></div>
                <button onClick={() => replaceOverlayWithPage('shop', 'form')} className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-[#e0a82e] hover:text-black transition-colors duration-200 shadow-xl shadow-black/10">Przejdź do kasy</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MENU NAWIGACYJNE (SIDEBAR Z LEWEJ) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[60] flex justify-start">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={handleCloseOverlay}></div>
          <div className="relative w-4/5 max-w-sm bg-black h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-300 text-white">

            <div className="p-6 border-b border-[#1a1a1a] flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-black rounded-full overflow-hidden flex items-center justify-center shrink-0">
                  <img src="/logo.jpg" alt="Logo" className="w-full h-full object-contain scale-[1.35]" />
                </div>
                <span className="font-bold tracking-widest uppercase text-[#e0a82e]">Menu</span>
              </div>
              <button onClick={handleCloseOverlay} className="p-2 text-zinc-400 hover:text-white rounded-full transition-colors"><X size={24} /></button>
            </div>

            <nav className="flex flex-col p-4 space-y-2 mt-4 flex-grow">
              <button
                onClick={() => replaceOverlayWithPage('shop', 'shop')}
                className={`p-4 text-left rounded-xl text-lg font-medium transition-colors flex items-center gap-3 ${activePage === 'shop' ? 'bg-[#e0a82e] text-black' : 'text-zinc-300 hover:bg-[#1a1a1a] hover:text-white'}`}
              >
                <ShoppingBag size={20} /> Sklep i Oferta
              </button>
              <button
                onClick={() => replaceOverlayWithPage('about', 'shop')}
                className={`p-4 text-left rounded-xl text-lg font-medium transition-colors flex items-center gap-3 ${activePage === 'about' ? 'bg-[#e0a82e] text-black' : 'text-zinc-300 hover:bg-[#1a1a1a] hover:text-white'}`}
              >
                <Info size={20} /> O Naszej Pasiece
              </button>
              <button
                onClick={() => replaceOverlayWithPage('gallery', 'shop')}
                className={`p-4 text-left rounded-xl text-lg font-medium transition-colors flex items-center gap-3 ${activePage === 'gallery' ? 'bg-[#e0a82e] text-black' : 'text-zinc-300 hover:bg-[#1a1a1a] hover:text-white'}`}
              >
                <Camera size={20} /> Galeria
              </button>
              <button
                onClick={() => {
                  handleCloseOverlay();
                  setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
                }}
                className="p-4 text-left rounded-xl text-lg font-medium text-zinc-300 hover:bg-[#1a1a1a] hover:text-white transition-colors flex items-center gap-3"
              >
                <Smartphone size={20} /> Kontakt
              </button>
              <button
                onClick={() => replaceOverlayWithOverlay('legal')}
                className="p-4 text-left rounded-xl text-lg font-medium text-zinc-300 hover:bg-[#1a1a1a] hover:text-white transition-colors flex items-center gap-3"
              >
                <FileText size={20} /> Regulamin i RODO
              </button>
            </nav>

            <div className="p-6 text-xs text-zinc-500 border-t border-[#1a1a1a]">
              <p className="font-serif">Pasieka Nasze Pszczoły</p>
              <p>Rolniczy Handel Detaliczny</p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL REGULAMINU I RODO */}
      {isLegalModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={handleCloseOverlay}></div>
          <div className="relative bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-neutral-100 shrink-0">
              <h3 className="text-xl font-bold text-zinc-900 font-serif">Regulamin i Polityka Prywatności</h3>
              <button onClick={handleCloseOverlay} className="p-2 hover:bg-neutral-100 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto text-sm text-neutral-600 space-y-6">

              <div>
                <h4 className="font-bold text-zinc-900 mb-2 font-serif text-lg">CZĘŚĆ I: REGULAMIN SKLEPU</h4>

                <p className="font-bold mt-4 mb-2 text-zinc-800">§ 1. Postanowienia ogólne</p>
                <ol className="list-decimal pl-4 space-y-1 mb-4">
                  <li>Sprzedawcą miodu oraz Administratorem Danych Osobowych na stronie {SITE_URL} jest osoba fizyczna: {SELLER_NAME}, prowadząca działalność rolniczą w postaci pasieki "Nasze Pszczoły", zlokalizowanej pod adresem: {SELLER_ADDRESS}.</li>
                  <li>Pasieka działa w ramach Rolniczego Handlu Detalicznego (RHD) i znajduje się pod nadzorem Powiatowego Lekarza Weterynarii w {SELLER_CITY}. Weterynaryjny Numer Identyfikacyjny (WNI): {SELLER_WNI}.</li>
                  <li>Kontakt ze Sprzedawcą możliwy jest pod adresem e-mail: {DISPLAY_EMAIL} lub numerem telefonu: {DISPLAY_PHONE}.</li>
                </ol>

                <p className="font-bold mt-4 mb-2 text-zinc-800">§ 2. Zamówienia i Płatności</p>
                <ol className="list-decimal pl-4 space-y-1 mb-4">
                  <li>Strona umożliwia zakup produktów pszczelich pochodzących wyłącznie z własnej pasieki Sprzedawcy.</li>
                  <li>Ceny podane na stronie są cenami końcowymi (brutto) i zawierają wszystkie koszty z wyjątkiem kosztów dostawy.</li>
                  <li>Płatność za zamówienie realizowana jest z góry, wyłącznie za pomocą systemu BLIK (przelew na telefon lub kod BLIK) na podane przez Sprzedawcę dane.</li>
                  <li>Zamówienie zostaje przyjęte do realizacji po zaksięgowaniu wpłaty.</li>
                </ol>

                <p className="font-bold mt-4 mb-2 text-zinc-800">§ 3. Dostawa</p>
                <ol className="list-decimal pl-4 space-y-1 mb-4">
                  <li>Wysyłka produktów realizowana jest za pośrednictwem firm kurierskich lub paczkomatów na adres wskazany przez Kupującego.</li>
                  <li>Koszt dostawy doliczany jest do sumy zamówienia i podany jest przed jego finalizacją.</li>
                  <li>Czas przygotowania paczki do wysyłki wynosi zazwyczaj od 2 do 5 dni roboczych.</li>
                </ol>

                <p className="font-bold mt-4 mb-2 text-zinc-800">§ 4. Prawo odstąpienia od umowy i Reklamacje</p>
                <ol className="list-decimal pl-4 space-y-1 mb-4">
                  <li>Zgodnie z Ustawą o prawach konsumenta, Kupujący ma prawo odstąpić od umowy zawartej na odległość w terminie 14 dni bez podawania przyczyny.</li>
                  <li><strong>UWAGA:</strong> Prawo do odstąpienia od umowy nie przysługuje w przypadku produktów, które ulegają szybkiemu zepsuciu lub w przypadku towarów dostarczanych w zapieczętowanym opakowaniu, których po otwarciu nie można zwrócić ze względu na ochronę zdrowia lub względów higienicznych (np. otwarty słoik miodu).</li>
                  <li>Aby zwrócić fabrycznie zamknięty produkt lub złożyć reklamację (np. stłuczony słoik w transporcie), Kupujący powinien skontaktować się ze Sprzedawcą mailowo: {DISPLAY_EMAIL}.</li>
                </ol>
              </div>

              <div className="pt-4 border-t border-neutral-100">
                <h4 className="font-bold text-zinc-900 mb-2 font-serif text-lg">CZĘŚĆ II: POLITYKA PRYWATNOŚCI (RODO)</h4>

                <p className="mb-2"><strong className="text-zinc-800">§ 1. Kto przetwarza Twoje dane?</strong><br/>Administratorem Twoich danych osobowych przekazanych w formularzu zamówienia jest {SELLER_NAME}, {SELLER_ADDRESS}.</p>

                <p className="mb-2"><strong className="text-zinc-800">§ 2. Po co zbieramy Twoje dane i na jakiej podstawie?</strong><br/>Zbieramy Twoje dane (imię, nazwisko, adres wysyłki, numer telefonu, adres e-mail) wyłącznie w jednym celu: aby zrealizować Twoje zamówienie i wysłać Ci miód. Podstawą prawną przetwarzania jest art. 6 ust. 1 lit. b RODO (niezbędność do wykonania umowy, której stroną jest osoba, której dane dotyczą).</p>

                <p className="mb-2"><strong className="text-zinc-800">§ 3. Komu przekazujemy Twoje dane?</strong><br/>Nie sprzedajemy Twoich danych i nie używamy ich do wysyłania reklam. Twoje dane przekazujemy wyłącznie podmiotom, które pomagają nam dostarczyć Ci zamówienie, tj.:</p>
                <ul className="list-disc pl-5 space-y-1 mb-4 marker:text-amber-500">
                  <li>Firmom kurierskim (np. InPost, DPD) w celu wygenerowania etykiety nadawczej.</li>
                  <li>Operatorom płatności (w celu przetworzenia płatności BLIK).</li>
                </ul>

                <p className="mb-2"><strong className="text-zinc-800">§ 4. Jak długo przechowujemy dane?</strong><br/>Twoje dane przechowujemy tylko tak długo, jak to konieczne do zrealizowania zamówienia, rozpatrzenia ewentualnych reklamacji oraz spełnienia obowiązków podatkowych i księgowych nałożonych przez polskie prawo.</p>

                <p className="mb-2"><strong className="text-zinc-800">§ 5. Twoje prawa</strong><br/>Masz prawo do:</p>
                <ul className="list-disc pl-5 space-y-1 mb-4 marker:text-amber-500">
                  <li>dostępu do swoich danych,</li>
                  <li>sprostowania swoich danych,</li>
                  <li>usunięcia danych ("prawo do bycia zapomnianym") - chyba że prawo nakazuje nam je trzymać np. do celów podatkowych,</li>
                  <li>ograniczenia przetwarzania,</li>
                  <li>wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (PUODO).</li>
                </ul>

                <p className="mb-2"><strong className="text-zinc-800">§ 6. Ciasteczka (Cookies)</strong><br/>Nasza strona jest prosta i przyjazna użytkownikom. Nie używamy zaawansowanych mechanizmów śledzących, takich jak Google Analytics czy Facebook Pixel. Wykorzystujemy jedynie pamięć podręczną Twojej przeglądarki do prawidłowego działania koszyka zakupowego (są to dane niezbędne do technicznego działania strony).</p>
              </div>

            </div>
            <div className="p-6 border-t border-neutral-100 bg-neutral-50 shrink-0 rounded-b-2xl flex justify-end">
              <button onClick={handleCloseOverlay} className="px-8 py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-amber-500 hover:text-zinc-900 transition-colors">Zamknij</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL GALERII (LIGHTBOX) Z NAWIGACJĄ I SWIPEM */}
      {selectedGalleryIndex !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 touch-none"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div
            className="absolute inset-0 bg-black/95 backdrop-blur-md transition-opacity cursor-zoom-out"
            onClick={handleCloseOverlay}
          ></div>

          <button
            onClick={handleCloseOverlay}
            className="absolute top-4 right-4 sm:top-8 sm:right-8 p-2 text-zinc-400 hover:text-white bg-black/50 hover:bg-black rounded-full transition-all z-10"
          >
            <X size={32} />
          </button>

          {/* Przycisk Wstecz */}
          <button
            onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
            className="absolute left-4 sm:left-8 p-2 text-zinc-400 hover:text-[#e0a82e] bg-black/50 hover:bg-black rounded-full transition-all z-10 hidden sm:block"
          >
            <ChevronLeft size={48} strokeWidth={1.5} />
          </button>

          {/* Przycisk Dalej */}
          <button
            onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
            className="absolute right-4 sm:right-8 p-2 text-zinc-400 hover:text-[#e0a82e] bg-black/50 hover:bg-black rounded-full transition-all z-10 hidden sm:block"
          >
            <ChevronRight size={48} strokeWidth={1.5} />
          </button>

          <div className="relative w-full h-full max-h-[90vh] flex items-center justify-center animate-in zoom-in-95 duration-300 pointer-events-none select-none">
            <img
              key={selectedGalleryIndex}
              src={`/galeria${selectedGalleryIndex < 10 ? `0${selectedGalleryIndex}` : selectedGalleryIndex}.jpg`}
              alt={`Powiększenie z galerii ${selectedGalleryIndex}`}
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl pointer-events-auto select-none origin-center"
              draggable="false"
              style={{
                transform: `translateX(${swipeOffset}px) scale(${scale})`,
                transition: (isSwiping || pinchDist) ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.3s ease-out',
                opacity: isSwiping ? Math.max(0.4, 1 - Math.abs(swipeOffset) / (window.innerWidth || 400)) : 1
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="hidden absolute inset-0 flex-col items-center justify-center text-zinc-500">
              <Camera size={48} className="mb-4 opacity-50" />
              <p>Brak zdjęcia</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}