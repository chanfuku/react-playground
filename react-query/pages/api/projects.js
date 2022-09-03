// an endpoint for getting projects data
export default async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const pageSize = 10
  const projects = Array(pageSize)
    .fill(0)
    .map((_, i) => {
      const id = (page - 1) * pageSize + (i + 1)
      return {
        title: `これはタイトル${id}です。`,
        body: `これはコンテンツ${id}です。`,
        id,
      }
    })

  await new Promise(r => setTimeout(r, 1000))

  res.json({ projects, hasMore: page < 10 })
}
