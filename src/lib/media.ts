import { collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface MediaAsset {
  id: string;
  ownerId: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'script' | 'prompt' | 'document';
  url: string;
  thumbnailUrl?: string;
  sizeBytes?: number;
  tags: string[];
  isFavorite: boolean;
  folder: string;
  createdAt: number;
  aiModel?: string;
  notes?: string;
  metadata?: any;
}

export const createAsset = async (ownerId: string, assetData: Omit<MediaAsset, 'id' | 'ownerId' | 'createdAt'>): Promise<MediaAsset> => {
  const assetsRef = collection(db, 'mediaLibrary');
  const newAssetRef = doc(assetsRef);
  const now = Date.now();
  
  const asset: MediaAsset = {
    id: newAssetRef.id,
    ownerId,
    createdAt: now,
    ...assetData
  };
  
  await setDoc(newAssetRef, {
    ...asset,
    createdAt: serverTimestamp(),
  });
  
  return asset;
};

export const updateAsset = async (assetId: string, updates: Partial<MediaAsset>) => {
  const assetRef = doc(db, 'mediaLibrary', assetId);
  await updateDoc(assetRef, updates);
};

export const deleteAsset = async (assetId: string) => {
  await deleteDoc(doc(db, 'mediaLibrary', assetId));
};

export const subscribeToAssets = (userId: string, folder: string | null, callback: (assets: MediaAsset[]) => void) => {
  const assetsRef = collection(db, 'mediaLibrary');
  let q;
  if (folder) {
    q = query(assetsRef, where('ownerId', '==', userId), where('folder', '==', folder), orderBy('createdAt', 'desc'));
  } else {
    q = query(assetsRef, where('ownerId', '==', userId), orderBy('createdAt', 'desc'));
  }
  
  return onSnapshot(q, (snapshot) => {
    const assets: MediaAsset[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      assets.push({
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : data.createdAt,
      } as MediaAsset);
    });
    callback(assets);
  });
};
