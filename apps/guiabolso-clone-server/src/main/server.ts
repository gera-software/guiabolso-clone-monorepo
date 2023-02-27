require('dotenv').config()
import { MongoHelper } from '@/external/repositories/mongodb/helper'

MongoHelper.connect(process.env.MONGO_URL ?? '')
  .then(async () => {
    const app = (await import('./config/app')).default
    const port = process.env.PORT || 5000
    app.listen(port, () => {
      console.log('Server running at ' + port)
    })
  })
  .catch(console.error)