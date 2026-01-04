
const express = require("express")
require("dotenv").config()
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const app = express()

app.use(express.json())


let refreshTokens = []
const users = []

app.post("/signup", async(req, res) => {
    try {
        const hashedpassword = await bcrypt.hash(req.body.password, 10)
        const user = {username: req.body.username, password: hashedpassword}
        users.push(user)
        res.status(201).send("you have been signed up")
    } catch (error) {
        res.status(404).send()   
    }
})

app.post("/token", (req, res) => {

    const refreshToken = req.body.token
    if(refreshToken == null) return res.sendStatus(401)
    if(!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if(err) return res.sendStatus(403)
        const accessToken = generateAccessToken({name: user.name})
    res.json({ accessToken: accessToken})
    })
})

app.delete("/logout", (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    res.sendStatus(204)
})

app.post("/login", async (req, res) => {
    const user_raw = users.find(user => user.username == req.body.username)
    // console.log(user_raw.username)
    // console.log(req.body.username)
    if (user_raw == null){
        return res.status(404).send("cannot find user")
    } try {
        if(await bcrypt.compare(req.body.password, user_raw.password)){
            const username = req.body.username
            const user = {name: username}
            const accessToken = generateAccessToken(user)
            const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
            refreshTokens.push(refreshToken)
            res.json({ accessToken: accessToken, refreshToken: refreshToken})
        } else {
            res.send("not allowed")
        }
    } catch (error) {
        console.log(error)
        res.status(500).send("this did not work") 
    }
})

function generateAccessToken(user){
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "15s"})
}

app.listen(4000)