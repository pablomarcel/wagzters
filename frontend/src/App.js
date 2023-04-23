import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  const [owners, setOwners] = useState([]);
  const [pets, setPets] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [petName, setPetName] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [petAge, setPetAge] = useState('');

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      const response = await axios.get('/api/petowners');
      setOwners(response.data);
    } catch (error) {
      console.error('Error fetching pet owners', error);
    }
  };

  const handleCreateOwner = async () => {
    try {
      const response = await axios.post('/api/petowners', {
        name: ownerName,
        email: ownerEmail,
      });
      console.log(response.data);
      setOwnerName('');
      setOwnerEmail('');
      fetchOwners();
    } catch (error) {
      console.error('Error creating pet owner', error);
    }
  };

  const handleAddPet = async () => {
    if (!selectedOwner) {
      alert('Please select a pet owner first');
      return;
    }
    try {
      const response = await axios.post(`/api/petowners/${selectedOwner}/pets`, {
        name: petName,
        breed: petBreed,
        age: petAge,
      });
      console.log(response.data);
      setPetName('');
      setPetBreed('');
      setPetAge('');
    } catch (error) {
      console.error('Error adding pet', error);
    }
  };

  return (
      <div className="container my-5">
        <div className="row">
          <div className="col-lg-6">
            <div className="card">
              <div className="card-header">
                <h2>Create Pet Owner</h2>
              </div>
              <div className="card-body">
                <form>
                  <div className="mb-3">
                    <label htmlFor="ownerName" className="form-label">Owner Name</label>
                    <input type="text" className="form-control" id="ownerName" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="ownerEmail" className="form-label">Owner Email</label>
                    <input type="email" className="form-control" id="ownerEmail" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} />
                  </div>
                  <button type="button" className="btn btn-primary" onClick={handleCreateOwner}>Create Owner</button>
                </form>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="card">
              <div className="card-header">
                <h2>Select Pet Owner and Add Pet</h2>
              </div>
              <div className="card-body">
                <form>
                  <div className="mb-3">
                    <label htmlFor="selectedOwner" className="form-label">Select Pet Owner</label>
                    <select className="form-select" id="selectedOwner" value={selectedOwner} onChange={(e) => setSelectedOwner(e.target.value)}>
                      <option key="default-owner" value="">Select owner</option>
                      {owners.map((owner) => (
                          <option key={owner.id} value={owner.id}>
                            {owner.name} ({owner.email})
                          </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="petName" className="form-label">Pet Name</label>
                    <input type="text" className="form-control" id="petName" value={petName} onChange={(e) => setPetName(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="petBreed" className="form-label">Pet Breed</label>
                    <input type="text" className="form-control" id="petBreed" value={petBreed} onChange={(e) => setPetBreed(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="petAge" className="form-label">Pet Age</label>
                    <input type="number" className="form-control" id="petAge" value={petAge} onChange={(e) => setPetAge(e.target.value)} />
                  </div>
                  <button type="button" className="btn btn-primary" onClick={handleAddPet} disabled={!selectedOwner}>Add Pet</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
  );

}

export default App;

