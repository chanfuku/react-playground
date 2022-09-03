import React from 'react'
import Link from 'next/link'
import { useRouter } from "next/router";
import axios from 'axios'
import {
  useQuery,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { queryOptions } from '../../lib/constant';

const queryClient = new QueryClient()

export default function Project(){
  return (
    <QueryClientProvider client={queryClient}>
      <Link href="/">
        <a>ホーム</a>
      </Link>
      <Content />
    </QueryClientProvider>
  )
}

async function fetchProject(id = 0) {
  const { data } = await axios.get('/api/project/' + id)
  return data
}

function Content() {
  const queryClient = useQueryClient()
  const [id, setId] = React.useState(0)
  const router = useRouter()
  const query = router.query

  const { status, data, error, isFetching, isPreviousData } = useQuery(
    ['project', id],
    () => fetchProject(id),
    // The query will not execute until the id exists
    { ...queryOptions, enabled: id !== 0 },
  )

  const handleNextPrev = (id) => {
    setId(id)
    router.push({
      pathname: `/projects/${id}`,
    })
  }

  // Prefetch the next page!
  React.useEffect(() => {
    const { id } = query
    if (!id) return

    const numId = isNaN(id) ? 0 : Number(id)
    setId(numId)
    queryClient.prefetchQuery(
      ['project', numId + 1],
      () => fetchProject(numId + 1),
      queryOptions,
    )
  }, [query])

  return (
    <>
     {status === 'loading' ? (
        <div>Loading...</div>
      ) : status === 'error' ? (
        <div>Error: {error.message}</div>
      ) : (
        // `data` will either resolve to the latest page's data
        // or if fetching a new page, the last successful page's data
        <div>
          <p><strong>タイトル</strong>: {data.title}</p>
          <p><strong>内容</strong>: {data.body}</p>
        </div>
      )}
      <div>Current Id: {id}</div>
      
      <button
        onClick={() => handleNextPrev(Math.max(id - 1, 0))}
        disabled={id === 1}
      >
        Previous Page
      </button>{' '}
      <button
        onClick={() => handleNextPrev(id + 1)}
        disabled={isPreviousData}
      >
        Next Page
      </button>
      {
        // Since the last page's data potentially sticks around between page requests,
        // we can use `isFetching` to show a background loading
        // indicator since our `status === 'loading'` state won't be triggered
        isFetching ? <span> Loading...</span> : null
      }{' '}
      <ReactQueryDevtools initialIsOpen />
    </>
  )
}
