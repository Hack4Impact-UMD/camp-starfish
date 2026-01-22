import { ImageTags, PhotoPermissions } from "@/types/albumTypes";
import { CamperID } from "@/types/personTypes";

// Check if image can be used for marketing based on tags
// Returns true only if ALL tagged campers have PUBLIC photoPermissions
export function isMarketingAllowed(tags: ImageTags): boolean {
  if (tags === 'ALL') {
    return false; // Cannot assume marketing permission for ALL tag
  }
  
  const allTaggedCampers = [...tags.approved, ...tags.inReview];
  
  if (allTaggedCampers.length === 0) {
    return false; // No tagged campers means no marketing permission
  }
  
  return allTaggedCampers.every(camper => camper.photoPermissions === 'PUBLIC');
}

// Helper to determine if a camper's permission allows marketing
// export function camperAllowsMarketing(photoPermissions: PhotoPermissions): boolean {
//   return photoPermissions === 'PUBLIC';
// }
