export async function getUsers () {
  const { data, error } = useFetch('/api/users')
  return data
}