import axios from 'axios'
import { api } from './api.ts'

type UploadUrlDto = {
  image_key: string
  upload_url: string
  expires_in_seconds: number
}

type DownloadUrlDto = {
  downloadUrl: string
}

const requestUploadUrl = async (file: File) => {
  const { data } = await api.post<UploadUrlDto>('/s3/upload', {
    file_name: file.name,
    content_type: file.type,
    file_size_bytes: file.size,
  })
  return data
}

export const s3Api = {
  async uploadFile(file: File): Promise<string> {
    const { image_key, upload_url } = await requestUploadUrl(file)

    await axios.put(upload_url, file, {
      headers: { 'Content-Type': file.type },
      withCredentials: false,
    })

    return image_key
  },

  async getDownloadUrl(imageKey: string): Promise<string> {
    const { data } = await api.get<DownloadUrlDto>('/s3/download', {
      params: { key: imageKey },
    })
    return data.downloadUrl
  },

  async deleteFile(imageKey: string): Promise<void> {
    await api.delete('/s3/delete', { params: { key: imageKey } })
  },
}
