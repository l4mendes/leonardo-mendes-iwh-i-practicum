require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const port = 3000;

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY;
const HUBSPOT_API_URL = 'https://api.hubapi.com';
const CUSTOM_OBJECT_TYPE = '2-31278128';

app.get('/', async (req, res) => {
  try {
    // Define the search criteria
    const searchCriteria = {
      "filterGroups": [
        {
          "filters": [
            {
              "propertyName": "hs_createdate",
              "operator": "GT",
              "value": "0"
            }
          ]
        }
      ],
      "properties": ['name', 'bio', 'usage'],
    };

    // Fetch records using the Search API
    const response = await axios.post(`${HUBSPOT_API_URL}/crm/v3/objects/${CUSTOM_OBJECT_TYPE}/search`, searchCriteria, {
      headers: {
        Authorization: `Bearer ${HUBSPOT_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const customObjectRecords = response.data.results;
    console.log(customObjectRecords);

    // Render the homepage with the fetched records
    res.render('homepage', { customObjectRecords });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving custom objects and properties');
  }
});

app.get('/update-cobj', (req, res) => {
  res.render('updates', { title: 'Leonardo Mendes IWH I Practicum Update Object Form' });
});

app.post('/update-cobj', async (req, res) => {
  const { name, bio, usage } = req.body;
  try {
    await axios.post(`${HUBSPOT_API_URL}/crm/v3/objects/${CUSTOM_OBJECT_TYPE}`, {
      properties: { name, bio, usage }
    }, {
      headers: {
        Authorization: `Bearer ${HUBSPOT_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating custom object');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});