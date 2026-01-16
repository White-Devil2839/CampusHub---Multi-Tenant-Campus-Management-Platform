const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
// Use dynamic import for node-fetch or rely on global fetch if Node 18+
// Node 18+ has global fetch. Assuming Node 18+.

const User = require('../models/User');
const Institution = require('../models/Institution');
const Club = require('../models/Club');
const ClubMembership = require('../models/ClubMembership');
require('dotenv').config({ path: '../.env' });

const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const API_URL = `http://localhost:${process.env.PORT || 5008}/api`;

const run = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected.');

        const timestamp = Date.now();
        const code = `TEST_INST_${timestamp}`;

        // 1. Create Institution
        console.log(`Creating Institution with code: ${code}`);
        const institution = await Institution.create({
            name: `Test Institution ${timestamp}`,
            code: code,
            domain: `test${timestamp}.edu`,
            logo: 'https://via.placeholder.com/150'
        });
        const institutionId = institution._id;

        // 2. Create Admin
        console.log('Creating Admin...');
        const admin = await User.create({
            name: 'Test Admin',
            email: `admin${timestamp}@test.com`,
            password: 'password123',
            role: 'ADMIN',
            institutionId: institutionId,
            isVerified: true
        });

        // 3. Create Student
        console.log('Creating Student...');
        const student = await User.create({
            name: 'Test Student',
            email: `student${timestamp}@test.com`,
            password: 'password123',
            role: 'STUDENT',
            institutionId: institutionId,
            isVerified: true
        });

        // 4. Create Club
        console.log('Creating Club...');
        const club = await Club.create({
            name: `Test Club ${timestamp}`,
            category: 'TECH',
            description: 'Test Description',
            institutionId: institutionId,
            approved: true
        });

        // 5. Create PENDING Request
        console.log('Creating Membership Request...');
        const membership = await ClubMembership.create({
            userId: student._id,
            clubId: club._id,
            institutionId: institutionId,
            status: 'PENDING',
            requestedRole: 'MEMBER'
        });

        // 6. Generate Admin Token
        const token = jwt.sign({ userId: admin._id }, JWT_SECRET, { expiresIn: '1h' });

        // 7. Make API Call to Approve
        const url = `${API_URL}/${code}/admin/requests/${membership._id}`;
        console.log(`Making PATCH request to: ${url}`);

        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: 'APPROVED' })
        });

        console.log(`Response Status: ${response.status}`);
        const data = await response.json();
        console.log('Response Body:', JSON.stringify(data, null, 2));

        if (response.status === 200) {
            console.log('✅ SUCCESS: Request approved successfully.');
        } else {
            console.error('❌ FAILURE: Request failed.');
            process.exit(1);
        }

        // Cleanup
        console.log('Cleaning up...');
        await ClubMembership.deleteMany({ institutionId });
        await Club.deleteMany({ institutionId });
        await User.deleteMany({ institutionId });
        await Institution.deleteMany({ _id: institutionId });
        console.log('Cleanup done.');

        process.exit(0);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

run();
