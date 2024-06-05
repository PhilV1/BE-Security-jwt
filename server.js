import express from 'express'
import 'dotenv/config'
import connectDB from './database/connectDB.js'
import User from './models/User.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import auth from './middleware/auth.js'

const PORT = process.env.API_PORT
const app = express()
app.use(express.json())

app.post('/register', async (req, res) => {
  try {
    // Get user input
    const { first_name, last_name, email, password } = req.body

    // Validate user input
    if (!(email && password && first_name && last_name)) {
      res.status(400).send(req.body)
    }

    // Check if user already exists
    const oldUser = await User.findOne({ email: email.toLowerCase() })
    if (oldUser) {
      return res.status(409).send('User Already Exists. Please Login.')
    }

    // Encrypt user password
    const encryptedPassword = await bcrypt.hash(password, 10)

    // Create user in the database
    const user = await User.create({
      first_name,
      last_name,
      email: email.toLowerCase(), // Sanitize: convert email to lowercase
      password: encryptedPassword,
    })

    // // Create token
    // const token = jwt.sign(
    //   { user_id: user._id, email },
    //   process.env.TOKEN_KEY,
    //   {
    //     expiresIn: '2h',
    //   }
    // )
    // // Save user token
    // user.token = token

    // Return new user with token
    res.status(201).json(user)
  } catch (err) {
    console.log(err)
  }
})

const startServer = async () => {
  await connectDB(process.env.MONGO_URL)
  console.log('Der server ist mit der Datenbank verbunden!')
  //
  app.listen(PORT, () => {
    console.log(`Listining on ${PORT} `)
  })
}
startServer()
