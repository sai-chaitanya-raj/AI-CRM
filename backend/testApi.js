const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);
    const users = await User.find({});
    console.log("Found emails:", users.map(u => u.email));
    
    if (users.length > 0) {
        const email = users[0].email;
        console.log(`Testing password reset for ${email}...`);
        try {
            const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email })
            });
            const data = await res.json();
            console.log("Response:", data);
        } catch (err) {
            console.error("Fetch failed:", err);
        }
    }
    process.exit(0);
}

run();
