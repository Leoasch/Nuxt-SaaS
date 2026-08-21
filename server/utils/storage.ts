import type { Readable } from 'node:stream'
import {
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3'

const config = useRuntimeConfig()

const bucket = config.s3Bucket

export const s3 = new S3Client({
  endpoint: config.s3Endpoint,
  region: config.s3Region,
  forcePathStyle: true,
  credentials: {
    accessKeyId: config.s3AccessKeyId,
    secretAccessKey: config.s3SecretAccessKey
  }
})

export async function ensureBucket () {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: bucket }))
  } catch (error: any) {
    const isNotFound = error?.$metadata?.httpStatusCode === 404 || error?.name === 'NotFound'

    if (!isNotFound) {
      throw error
    }

    await s3.send(new CreateBucketCommand({ Bucket: bucket }))
  }
}

export async function uploadObject (key: string, body: Buffer, contentType: string) {
  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType
  }))
}

export async function getObject (key: string): Promise<Readable> {
  const response = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }))

  return response.Body as Readable
}

export async function deleteObject (key: string) {
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
}
