const express = require('express');
const neo4j = require('neo4j-driver');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Replace with your Neo4j Aura connection credentials

const driver = neo4j.driver(
    'neo4j://your-neo4j-instance-uri',
    neo4j.auth.basic('your-username', 'your-password')
);

// Create pet owner

app.post('/api/petowners', async (req, res) => {
    const { name, email } = req.body;

    const session = driver.session();
    try {
        const result = await session.writeTransaction(async (tx) => {
            const query = `
        CREATE (owner:PetOwner {name: $name, email: $email})
        RETURN owner
      `;
            const params = { name, email };
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
        MATCH (owner:PetOwner) WHERE id(owner) = toInteger($ownerId)
        CREATE (pet:Pet {name: $name, breed: $breed, age: $age})-[:OWNED_BY]->(owner)
        RETURN pet
      `;
            const params = { ownerId, name, breed, age };
            const response = await tx.run(query, params);
            return response.records[0].get('pet').properties;
        });

        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while adding the pet.' });
    } finally {
        await session.close();
    }
});

app.listen(port, () => {
    console.log(`Puppy Social Network backend listening at http://localhost:${port}`);
});
