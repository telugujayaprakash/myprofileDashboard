const mongoose = require('mongoose')

const connect = () => {
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => {
            console.log('✅ DB Connected successfully...')
        }).catch((err) => {
            console.error('❌ DB Connection Failed', err)
        })
}


module.exports = connect
