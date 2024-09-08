import { Hono } from 'hono'
import { handle } from 'hono-remix-adapter'

const app = new Hono()
app.get('/hello', (c) => c.json('hello, world!'))

export default handle(app)
