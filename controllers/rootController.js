
require('dotenv').config();
const rootController = (req, res) => {

  res.status(200).json({ message: 'Welcome to the Elevateed API!',
    apiDocs:`http://localhost:${process.env.PORT}/api-docs/`
   })

}


module.exports = rootController