import React from 'react'
import Link from 'next/link'
import axios from 'axios'
import {
  useQuery,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { queryOptions } from '../lib/constant'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Example />
    </QueryClientProvider>
  )
}

async function fetchProjects(page = 0) {
  const { data } = await axios.get('/api/projects?page=' + page)
  return data
}

function Example() {
  const queryClient = useQueryClient()
  const [page, setPage] = React.useState(1)

  const { status, data, error, isFetching, isPreviousData } = useQuery(
    ['projects', page],
    () => fetchProjects(page),
    queryOptions,
  )

  const pageHandler = (page) => {
    // page数をkeepする。詳細から戻ってきた時に同じpage数を表示したいので。
    queryClient.setQueryData(['page'], page)
    setPage(page)
  }

  // Prefetch the next page!
  React.useEffect(() => {
    // 詳細から戻ってきた時に保持していたpage数を取り出す
    const page = queryClient.getQueryData(['page']) ?? 1
    setPage(page)
    if (data?.hasMore) {
      queryClient.prefetchQuery(
        ['projects', page + 1],
        () => fetchProjects(page + 1),
        queryOptions,
      )
    }
  }, [data, page, queryClient])

  return (
    <div>
      <div>
        この例では、
        <ul>
          <li>各ページのデータは通常のクエリとしてキャッシュされるため、前のページに移動する際には、キャッシュからデータを取得するため、瞬時に表示することが出来ます。
            一度目にフェッチしてから5分が経過している場合は、バックグラウンドで再フェッチを実行し、フレッシュなデータに差し替わります。</li>
          <li>各ページを表示時に、次のページのデータもフェッチします。そのため、次のページを表示する際はキャッシュからデータを取得するため、瞬時に表示することができます。</li>
        </ul>
      </div>
      {status === 'loading' ? (
        <div>Loading...</div>
      ) : status === 'error' ? (
        <div>Error: {error.message}</div>
      ) : (
        // `data` will either resolve to the latest page's data
        // or if fetching a new page, the last successful page's data
        <div>
          {data.projects.map((project) => (
            <p key={project.id}>
              <Link href={`/projects/${project.id}`}>
                <a>{project.title}</a>
              </Link>
            </p>
          ))}
        </div>
      )}
      <div>Current Page: {page}</div>
      <button
        onClick={() => pageHandler(Math.max(page - 1, 0))}
        disabled={page === 0}
      >
        Previous Page
      </button>{' '}
      <button
        onClick={() => {
          pageHandler(data?.hasMore ? page + 1 : page)
        }}
        disabled={isPreviousData || !data?.hasMore}
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
    </div>
  )
}
