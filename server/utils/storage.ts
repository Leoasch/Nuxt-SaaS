import type { Readable } from 'node:stream'
import {
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  ListObjectsV2Command,
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
    const status = error?.$metadata?.httpStatusCode

    // A key limited to objects (e.g. an R2 "Object Read & Write" token) can't query buckets, and the bucket
    // is created in the provider's dashboard. Listing one object still fails on a missing bucket or bad credentials.
    if (status === 403) {
      await s3.send(new ListObjectsV2Command({ Bucket: bucket, MaxKeys: 1 }))
      return
    }

    const isNotFound = status === 404 || error?.name === 'NotFound'

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

export async function getObjectWithMeta (key: string) {
  const response = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }))

  return {
    body: response.Body as Readable,
    contentType: response.ContentType,
    contentLength: response.ContentLength
  }
}

export async function deleteObject (key: string) {
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
}
