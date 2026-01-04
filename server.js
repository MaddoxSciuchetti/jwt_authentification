const express = require("express")
require("dotenv").config()
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const app = express()

app.use(express.json())


const posts = [
    {
        username: "Kyle",
        password: "",
        title: "Post1"
    },
    {
        username: "Jim",
        passsword: "",
        title: "Post2"
    },

    {
        username: "maddox",
        title:"this is only for him"
    }
]


app.get("/posts", authentificationToken, (req, res) => {
    res.json(posts.filter(post => post.username === req.user.name))
})

function authentificationToken(req, res, next) {

    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]
    if(token == null) return res.status(401).send({error: "unauthorized"})

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) return res.status(403).send({ error: "forbidden"})
        req.user = user
        next()
    })
}


app.listen(3000)