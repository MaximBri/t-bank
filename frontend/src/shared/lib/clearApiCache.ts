export const clearApiCache = async () => {
  if (typeof caches === 'undefined') return
  try {
    await caches.delete('api-cache')
  } catch (error) {
    console.error(error)
  }
}
