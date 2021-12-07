import * as express from "express"

function startServer() {
  const app = express()

  app.get("/", (_, res) => {
    res.send("Ok")
  })

  app.listen({port: 8081}, () =>
    console.log("Server ready at http://localhost:8081"),
  )
}

startServer()
