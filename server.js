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

app.get('/welcome', auth, async (req, res) => {
  const token = req.query.token || req.body.token
  if (token) {
    const user = await User.findOne({ token: token })
    res.status(200).send(`Welcome ${user.first_name} 🙌  `)
  } else {
    res.status(200).send(`Welcome  🙌  `)
  }
})

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

    // Create token with 3 parameters: payload, secretKey, options(expiresIn: '2h)
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: '2h',
      }
    )
    // Save user token
    user.token = token
    await user.save()
    // Return new user with token
    res.status(201).json(user)
  } catch (err) {
    console.log(err)
  }
})

app.post('/login', async (req, res) => {
  try {
    // Get user input
    const { email, password } = req.body

    // Validate user input
    if (!(email && password)) {
      res.status(400).send('All input is required')
    }
    // Validate if user exists in the database
    const user = await User.findOne({ email: email.toLowerCase() })

    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: '2h',
        }
      )

      // Save user token
      user.token = token
      await user.save()

      // Send user data along with token in the response
      res.status(200).json(user)
    }
    res.status(400).send('Invalid Credentials')
  } catch (err) {
    console.log(err)
  }
})

app.post('/logout', auth, async (req, res) => {
  try {
    // Get the user from the request object
    const user = req.user

    // Clear the user's token (logout)
    user.token = null

    // Send a success message
    res.status(200).json(user)
  } catch (err) {
    console.error(err)
    res.status(500).send(err.message)
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

app.use('*', (req, res) => {
  res.status(404).json({
    success: 'false',
    message: 'Page not found',
    error: {
      statusCode: 404,
      message: 'You reached a route that is not defined on this server',
    },
  })
})
