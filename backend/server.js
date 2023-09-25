require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

// Генерация JWT токена
function generateToken(user) {
  return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
}

// Аутентификация через GitHub
app.get('/login', (req, res) => {
  const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.GITHUB_REDIRECT_URI}`;

  res.redirect(redirectUrl);
});

// Обработка колбэка от GitHub
app.get('/callback', async (req, res) => {
  try {
    const { code } = req.query;

    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    if (tokenResponse.data.error) {
      throw new Error(tokenResponse.data.error);
    }

    const accessToken = tokenResponse.data.access_token;

    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `token ${accessToken}`,
      },
    });

    const user = {
      id: userResponse.data.id,
      login: userResponse.data.login,
    };

    const token = generateToken(user);

    res.redirect(`${process.env.CLIENT_URL}/login?token=${token}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});