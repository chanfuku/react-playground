// an endpoint for getting projects data
export default async (req, res) => {
  const id = parseInt(req.query.id) || 0
  const project = {
    title: `これはタイトル${id}です。`,
    body: `これはコンテンツ${id}です。`,
    id,
  }

  await new Promise(r => setTimeout(r, 1000))

  res.json(project)
}
