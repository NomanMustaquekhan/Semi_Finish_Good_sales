import { useState, useEffect } from 'react'

export default function useFetch(url, options) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetch(url, options)
      .then((r) => r.json())
      .then((json) => {
        if (mounted) setData(json)
      })
      .catch((err) => {
        if (mounted) setError(err)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => { mounted = false }
  }, [url])

  return { data, loading, error }
}
