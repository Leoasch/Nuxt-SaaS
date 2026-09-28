export const MAX_IMAGE_SIZE = 5 * 1024 * 1024
export const MAX_IMAGES_PER_UPLOAD = 5
export const MAX_IMAGES_PER_PRODUCT = 10
export const ORGANIZATION_IMAGE_QUOTA = 100 * 1024 * 1024

const MULTIPART_OVERHEAD = 64 * 1024

export const maxUploadBytes = (files: number) => files * MAX_IMAGE_SIZE + MULTIPART_OVERHEAD
