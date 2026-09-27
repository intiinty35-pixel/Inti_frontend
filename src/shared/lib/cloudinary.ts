const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "rpixghm0";
const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;

export function cloudinaryImage(publicId: string, transforms = "f_auto,q_auto,c_fill") {
  return `${CLOUDINARY_BASE_URL}/${transforms}/${publicId}`;
}

