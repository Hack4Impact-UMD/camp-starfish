import * as functions from "firebase-functions";
import { Change, EventContext } from "firebase-functions";
import { DocumentSnapshot } from "firebase-admin/firestore";
import { updateImage } from "../data/firestore/images";
import { isMarketingAllowed } from "@/utils/imageUtils";
import { adminDb } from "../config/firebaseAdminConfig";
import { Collection } from "../data/firestore/utils";
import { AlbumsSubcollection } from "@/data/firestore/utils";
import { ImageMetadata } from "@/types/albumTypes";

// Recalculate marketingAllowed when image tags change
const recalculateMarketingPermission = functions.firestore
  .document("albums/{albumId}/image_metadatas/{imageId}")
  .onWrite(async (change: Change<DocumentSnapshot>, context: EventContext) => {
    const albumId = context.params.albumId;
    const imageId = context.params.imageId;
    
    // Check if document was deleted
    if (!change.after.exists) {
      return; // Image was deleted, nothing to do
    }
    
    const beforeData = change.before.data();
    const afterData = change.after.data();
    
    if (!afterData) return;
    
    // Only recalculate if tags changed
    if (beforeData && JSON.stringify(beforeData.tags) === JSON.stringify(afterData.tags)) {
      return; // Tags unchanged, no need to recalculate
    }
    
    const marketingAllowed = isMarketingAllowed(afterData.tags);
    
    // Only update if marketingAllowed changed
    if (afterData.marketingAllowed !== marketingAllowed) {
      await updateImage(albumId, imageId, { marketingAllowed });
    }
  });

// Recalculate marketingAllowed for all images when camper photoPermissions change
const recalculateMarketingOnCamperUpdate = functions.firestore
  .document("campers/{camperId}")
  .onWrite(async (change: Change<DocumentSnapshot>, context: EventContext) => {
    const camperId = Number(context.params.camperId);
    
    // Check if document was deleted
    if (!change.after.exists) {
      return; // Camper was deleted, nothing to do
    }
    
    const beforeData = change.before.data();
    const afterData = change.after.data();
    
    if (!afterData) return;
    
    // Only recalculate if photoPermissions changed
    if (beforeData && beforeData.photoPermissions === afterData.photoPermissions) {
      return; // photoPermissions unchanged
    }
    
    // Find all images where this camper is tagged
    const albumsSnapshot = await adminDb.collection(Collection.ALBUMS).get();
    
    const updatePromises: Promise<void>[] = [];
    
    for (const albumDoc of albumsSnapshot.docs) {
      const imagesSnapshot = await albumDoc.ref
        .collection(AlbumsSubcollection.IMAGE_METADATAS)
        .get();
      
      for (const imageDoc of imagesSnapshot.docs) {
        const imageData = imageDoc.data() as ImageMetadata;
        
        // Check if camper is tagged in this image
        if (imageData.tags !== 'ALL') {
          const isTagged = [...imageData.tags.approved, ...imageData.tags.inReview]
            .some(camper => camper.id === camperId);
          
          if (isTagged) {
            // Recalculate marketingAllowed
            const marketingAllowed = isMarketingAllowed(imageData.tags);
            
            if (imageData.marketingAllowed !== marketingAllowed) {
              updatePromises.push(
                updateImage(albumDoc.id, imageDoc.id, { marketingAllowed })
              );
            }
          }
        }
      }
    }
    
    await Promise.all(updatePromises);
  });

export const imageMarketingCloudFunctions = {
  recalculateMarketingPermission,
  recalculateMarketingOnCamperUpdate
};
