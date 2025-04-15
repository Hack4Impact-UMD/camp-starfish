export async function getAlbumById(
    transaction: Transaction,
    db: Firestore,
    id: string
  ): Promise<Album> {
    try {
      const doc = db.collection(ALBUMS_COLLECTION).doc(id);
      const snap = await transaction.get(doc);
      if (!snap.exists) throw new Error(`No album found with id "${id}"`);
      return snap.data() as Album;
    } catch (e) {
      throw new Error(`getAlbumById failed: ${e}`);
    }
  }
  
  export async function createAlbum(
    transaction: Transaction,
    db: Firestore,
    album: Album
  ): Promise<void> {
    try {
      const doc = db.collection(ALBUMS_COLLECTION).doc(album.id);
      transaction.set(doc, album);
    } catch (e) {
      throw new Error(`createAlbum failed: ${e}`);
    }
  }
  
  export async function updateAlbum(
    transaction: Transaction,
    db: Firestore,
    id: string,
    updates: Partial<Album>
  ): Promise<void> {
    try {
      const doc = db.collection(ALBUMS_COLLECTION).doc(id);
      const snap = await transaction.get(doc);
      if (!snap.exists) throw new Error(`No album found with id "${id}"`);
      transaction.update(doc, updates);
    } catch (e) {
      throw new Error(`updateAlbum failed: ${e}`);
    }
  }
  
  export async function deleteAlbum(
    transaction: Transaction,
    db: Firestore,
    id: string
  ): Promise<void> {
    try {
      const doc = db.collection(ALBUMS_COLLECTION).doc(id);
      const snap = await transaction.get(doc);
      if (!snap.exists) throw new Error(`No album found with id "${id}"`);
      transaction.delete(doc);
    } catch (e) {
      throw new Error(`deleteAlbum failed: ${e}`);
    }
  }
  