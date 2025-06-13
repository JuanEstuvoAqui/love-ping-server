const express = require('express');
const fetch = require('node-fetch');
const { google } = require('google-auth-library');
const app = express();
app.use(express.json());

const SCOPES = ['https://www.googleapis.com/auth/firebase.messaging'];
const serviceAccount = JSON.parse(process.env.FIREBASE_JSON);
const projectId = serviceAccount.project_id;

const getAccessToken = async () => {
  const auth = new google.auth.GoogleAuth({
    credentials: serviceAccount,
    scopes: SCOPES,
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  return token.token;
};

app.post('/ping', async (req, res) => {
  const targetToken = req.body.token;
  if (!targetToken) return res.status(400).json({ error: 'Falta el token' });

  try {
    const accessToken = await getAccessToken();
    const response = await fetch(
      `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            token: targetToken,
            notification: {
              title: 'I love you <3',
              body: 'I am a bit busy right now. Will text ya later',
              imageUrl:'https://ik.imagekit.io/Dawnshard/hb.webp?updatedAt=1749770050959',
            },
          },
        }),
      }
    );

    const result = await response.json();
    res.status(200).json({ message: 'Ping enviado', result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Fallo al enviar notificación' });
  }
});

app.get('/', (_, res) => res.send('Servidor Love Ping listo 💘'));
app.listen(3000, () => console.log('🚀 Servidor activo en puerto 3000'));
