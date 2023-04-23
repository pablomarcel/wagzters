const express = require('express');
const neo4j = require('neo4j-driver');
const { v4: uuidv4 } = require('uuid');
const app = express();
const serverless = require('serverless-http');

app.use(express.json());


// Replace with your Neo4j Aura connection credentials
const driver = neo4j.driver(
    'neo4j+s://dd3f90d1.databases.neo4j.io',
    neo4j.auth.basic('neo4j', 'OWQoga9pbF-YcT1vGV27hxKGqJNqnhAtlPm2hst_uqQ')
);

// Create pet owner
app.post('/api/petowners', async (req, res) => {
    const { name, email } = req.body;

    const session = driver.session();
    try {
        const result = await session.writeTransaction(async (tx) => {
            const query = `
        CREATE (owner:PetOwner {id: $id, name: $name, email: $email})
        RETURN owner
      `;
            const params = { id: uuidv4(), name, email };
            const response = await tx.run(query, params);
            return response.records[0].get('owner').properties;
        });

        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while creating the pet owner.' });
    } finally {
        await session.close();
    }
});

// Add pet for pet owner
app.post('/api/petowners/:ownerId/pets', async (req, res) => {
    const ownerId = req.params.ownerId;
    const { name, breed, age } = req.body;

    const session = driver.session();
    try {
        const result = await session.writeTransaction(async (tx) => {
            const query = `
        MATCH (owner:PetOwner) WHERE owner.id = $ownerId
        CREATE (pet:Pet {id: $id, name: $name, breed: $breed, age: $age})-[:OWNED_BY]->(owner)
        RETURN pet
      `;
            const params = { id: uuidv4(), ownerId, name, breed, age };
            const response = await tx.run(query, params);
            return response.records[0].get('pet').properties;
        });

        res.status(201).json(result);
    } catch (error) {
        console.error(error); // Log the error to the console for more details
        res.status(500).json({ error: 'An error occurred while adding the pet.', details: error.message });
    } finally {
        await session.close();
    }
});


app.get('/api/petowners', async (req, res) => {
    const session = driver.session();
    try {
        const result = await session.run('MATCH (owner:PetOwner) RETURN owner');
        const owners = result.records.map(record => record.get('owner').properties);
        res.json(owners);
    } catch (error) {
        console.error('Error fetching pet owners', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        await session.close();
    }
});


const handler = serverless(app);
module.exports = { handler };
