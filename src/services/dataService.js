import { db, auth } from '../firebaseConfig';
import { 
  collection, doc, getDocs, getDoc, setDoc, addDoc, updateDoc, deleteDoc, 
  query, where, increment
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, createUserWithEmailAndPassword 
} from 'firebase/auth';

const PROVINCES = ["الكل", "مأرب", "تعز", "عدن", "صنعاء"];

// localStorage key for favorites
const FAV_KEY = 'servess_favorites';
let localFavorites = JSON.parse(localStorage.getItem(FAV_KEY) || '[]');
const saveFavs = () => localStorage.setItem(FAV_KEY, JSON.stringify(localFavorites));

// In-memory caches to make details load instantly
const adCache = new Map();
const officeCache = new Map();

// Helper to compress image before uploading
const compressImage = (file, maxWidth = 800, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    if (!file.type.match(/image.*/)) {
      resolve(file);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (!blob) {
            resolve(file); // fallback
            return;
          }
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(compressedFile);
        }, 'image/jpeg', quality);
      };
      img.onerror = () => resolve(file); // fallback to original on error
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(file); // fallback
    reader.readAsDataURL(file);
  });
};

export const dataService = {
  // ImgBB Upload
  async uploadFile(file) {
    if (!file) return null;
    
    // ضغط الصورة تلقائياً قبل رفعها
    const compressedFile = await compressImage(file, 800, 0.8);
    
    // مفتاح API الخاص بـ ImgBB
    const IMGBB_API_KEY = "feb2c558d5d0ee49c783efcf4d532b32"; 
    
    const formData = new FormData();
    formData.append("image", compressedFile);

    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data && data.success) {
        return data.data.url; // الرابط المباشر للصورة
      } else {
        throw new Error("ImgBB Error: " + (data.error?.message || "فشل رفع الصورة"));
      }
    } catch (error) {
      console.error("ImgBB Upload Error:", error);
      throw error;
    }
  },

  // 1. Provinces
  async getProvinces() {
    return PROVINCES;
  },

  // 2. Ads
  async getAds(filter = {}) {
    let q = collection(db, 'ads');
    let constraints = [];
    
    if (filter.category && filter.category !== "الكل") {
      constraints.push(where("category", "==", filter.category));
    }
    if (filter.city && filter.city !== "الكل") {
      constraints.push(where("city", "==", filter.city));
    }
    if (filter.officeId) {
      constraints.push(where("officeId", "==", filter.officeId));
    }
    
    if (constraints.length > 0) {
       q = query(q, ...constraints);
    }
    
    const snapshot = await getDocs(q);
    let result = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    // Filter out ads from suspended offices
    try {
      const officesSnap = await getDocs(collection(db, 'offices'));
      const suspendedOfficeIds = new Set();
      officesSnap.forEach(doc => {
        if (doc.data().status === 'suspended') {
          suspendedOfficeIds.add(doc.id);
        }
      });
      result = result.filter(ad => !suspendedOfficeIds.has(ad.officeId));
    } catch (e) {
      console.error("Error filtering suspended offices:", e);
    }

    // Local fallback filter to guarantee accuracy
    if (filter.category && filter.category !== "الكل") {
      result = result.filter(ad => ad.category === filter.category);
    }
    if (filter.city && filter.city !== "الكل") {
      result = result.filter(ad => ad.city === filter.city);
    }

    // Populate cache
    result.forEach(ad => adCache.set(ad.id, ad));

    if (filter.searchQuery) {
      const sq = filter.searchQuery.toLowerCase();
      result = result.filter(ad => 
        ad.title?.toLowerCase().includes(sq) || 
        ad.description?.toLowerCase().includes(sq) || 
        ad.officeName?.toLowerCase().includes(sq) ||
        ad.category?.toLowerCase().includes(sq)
      );
    }

    if (filter.randomize) {
      result = result
        .map(v => ({ v, r: Math.random() }))
        .sort((a, b) => a.r - b.r)
        .map(({ v }) => v);
    }

    if (typeof filter.limit === 'number') {
      result = result.slice(0, filter.limit);
    }

    return result;
  },

  async getAdById(id) {
    if (adCache.has(id)) return adCache.get(id);
    
    const d = await getDoc(doc(db, 'ads', id));
    if (!d.exists()) throw new Error("الإعلان غير موجود");
    const ad = { id: d.id, ...d.data() };
    adCache.set(id, ad);
    return ad;
  },

  async addAd(adData) {
    const highlightsArray = adData.highlights ? (typeof adData.highlights === 'string' ? adData.highlights.split("\n").filter(h => h.trim() !== "") : adData.highlights) : [];
    
    const docRef = await addDoc(collection(db, 'ads'), {
      ...adData,
      highlights: highlightsArray,
      rating: 5.0,
      reviews: 0,
      createdAt: new Date().toISOString()
    });
    return { id: docRef.id, ...adData, highlights: highlightsArray };
  },

  async deleteAd(id) {
    await deleteDoc(doc(db, 'ads', id));
    return true;
  },

  async updateAd(id, adData) {
    const highlightsArray = adData.highlights ? (typeof adData.highlights === 'string' ? adData.highlights.split("\n").filter(h => h.trim() !== "") : adData.highlights) : [];
    
    const updatePayload = {
      ...adData,
      highlights: highlightsArray,
    };
    
    await updateDoc(doc(db, 'ads', id), updatePayload);
    return { id, ...updatePayload };
  },

  async incrementAdView(adId) {
    const d = await getDoc(doc(db, 'ads', adId));
    if (d.exists()) {
      await updateDoc(doc(db, 'ads', adId), { views: increment(1) });
      const officeId = d.data().officeId;
      if (officeId) {
         await updateDoc(doc(db, 'offices', officeId), { views: increment(1) });
      }
    }
    return true;
  },

  // 3. Offices
  async getOffices(filter = {}) {
    const snapshot = await getDocs(collection(db, 'offices'));
    let result = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    
    if (!filter.admin) {
      result = result.filter(office => office.status === 'active');
    }
    
    if (filter.city && filter.city !== "الكل") {
      result = result.filter(office => office.city === filter.city);
    }

    if (filter.searchQuery) {
      const sq = filter.searchQuery.toLowerCase();
      result = result.filter(office => 
        office.name?.toLowerCase().includes(sq) || 
        office.description?.toLowerCase().includes(sq)
      );
    }
    
    // Populate cache
    result.forEach(office => officeCache.set(office.id, office));
    
    return result;
  },

  async getOfficeById(id) {
    if (officeCache.has(id)) return officeCache.get(id);
    
    const d = await getDoc(doc(db, 'offices', id));
    if (!d.exists()) return null;
    const office = { id: d.id, ...d.data() };
    officeCache.set(id, office);
    return office;
  },

  async incrementOfficeView(officeId) {
    await updateDoc(doc(db, 'offices', officeId), { views: increment(1) });
    return true;
  },

  async incrementWhatsappClick(officeId) {
    if (officeId) {
      await updateDoc(doc(db, 'offices', officeId), { whatsappClicks: increment(1) });
    }
    return true;
  },

  async updateOfficeProfile(officeId, profileData) {
    if (profileData.name) {
      // Check if another office has the same name
      const q = query(collection(db, 'offices'), where("name", "==", profileData.name.trim()));
      const snapshot = await getDocs(q);
      const exists = snapshot.docs.some(doc => doc.id !== officeId);
      if (exists) {
        throw new Error("اسم المكتب مستخدم من قبل مكتب آخر، يرجى اختيار اسم مختلف.");
      }
    }

    const ref = doc(db, 'offices', officeId);
    await updateDoc(ref, profileData);
    const d = await getDoc(ref);
    return { id: d.id, ...d.data() };
  },

  async rateOffice(officeId, newStar) {
    const ref = doc(db, 'offices', officeId);
    const d = await getDoc(ref);
    if (!d.exists()) throw new Error("المكتب غير موجود");
    
    const oldRating = d.data().rating || 0;
    const previousRatingsCount = 10;
    const updatedRating = ((oldRating * previousRatingsCount) + newStar) / (previousRatingsCount + 1);
    
    await updateDoc(ref, { rating: Number(updatedRating.toFixed(1)) });
    const newData = await getDoc(ref);
    return { id: newData.id, ...newData.data() };
  },

  async getPromos() {
    return [];
  },

  async deleteOffice(officeId) {
    // 1. Delete all ads belonging to this office
    const q = query(collection(db, 'ads'), where('officeId', '==', officeId));
    const snapshot = await getDocs(q);
    
    // Create an array of delete promises for all ads
    const deletePromises = snapshot.docs.map(adDoc => deleteDoc(doc(db, 'ads', adDoc.id)));
    await Promise.all(deletePromises);

    // 2. Delete the office document
    await deleteDoc(doc(db, 'offices', officeId));
    
    // Clear the office from local cache
    officeCache.delete(officeId);
    
    return true;
  },

  async approveOffice(officeId) {
    await updateDoc(doc(db, 'offices', officeId), { status: 'active' });
    officeCache.delete(officeId);
    return true;
  },

  async suspendOffice(officeId) {
    await updateDoc(doc(db, 'offices', officeId), { status: 'suspended' });
    officeCache.delete(officeId);
    return true;
  },

  // 4. Auth
  async registerOffice(officeData) {
    // 0. Check if office name already exists
    const q = query(collection(db, 'offices'), where("name", "==", officeData.name.trim()));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      throw new Error("اسم المكتب موجود مسبقاً، يرجى اختيار اسم آخر.");
    }

    // 1. Create auth user
    const password = officeData.password || "123456";
    const userCredential = await createUserWithEmailAndPassword(auth, officeData.email, password);
    const user = userCredential.user;
    
    // 2. Create firestore doc with user.uid
    const newOffice = {
      name: officeData.name,
      email: officeData.email,
      phone: officeData.phone,
      city: officeData.city,
      street: officeData.street || "",
      description: officeData.description || "",
      status: "pending",
      rating: 0,
      views: 0,
      logo: "",
      services: []
    };
    await setDoc(doc(db, 'offices', user.uid), newOffice);
    return { id: user.uid, ...newOffice };
  },

  async loginOffice(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const d = await getDoc(doc(db, 'offices', user.uid));
    if (!d.exists()) {
      // If it's an admin account, allow login with default data even if doc doesn't exist
      if (user.email.toLowerCase().startsWith('admin')) {
        return {
          uid: user.uid,
          email: user.email,
          name: "مدير النظام",
          logo: "",
          city: "الكل",
          description: "حساب الإدارة",
          status: "active",
          role: "admin"
        };
      }
      throw new Error("بيانات المكتب غير موجودة في النظام.");
    }
    
    const officeData = d.data();
    return {
      uid: user.uid,
      email: user.email,
      name: officeData.name,
      logo: officeData.logo,
      city: officeData.city,
      description: officeData.description,
      status: officeData.status,
      role: officeData.role || (user.email.startsWith('admin') ? 'admin' : 'office')
    };
  },

  // 5. Favorites (Local Storage based)
  async getFavorites() {
    if (localFavorites.length === 0) return [];
    
    const snapshot = await getDocs(collection(db, 'ads'));
    const allAds = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    return allAds.filter(ad => localFavorites.includes(ad.id));
  },

  async toggleFavorite(adId) {
    if (localFavorites.includes(adId)) {
      localFavorites = localFavorites.filter(id => id !== adId);
      saveFavs();
      return false;
    } else {
      localFavorites.push(adId);
      saveFavs();
      return true;
    }
  },

  async isFavorite(adId) {
    return localFavorites.includes(adId);
  }
};
