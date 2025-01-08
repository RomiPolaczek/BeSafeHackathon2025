import ducks from '../data/duckData.js';

// Get all ducks
const getAllDucks = (req, res) => {
    res.status(200).json({ ducks });
};

// Get a random duck
const getRandomDuck = (req, res) => {
    const randomIndex = Math.floor(Math.random() * ducks.length);
    res.status(200).json(ducks[randomIndex]);
};

// Get a single duck
const getSingleDuck = (req, res) => {
    const id = parseInt(req.params.id, 10);
    const duck = ducks.find(d => d.id === id);

    if (!duck) {
        return res.status(404).json({ mssg: "Duck not found" });
    }
    res.status(200).json({ duck });
};

// Create a new duck
const createDuck = (req, res) => {
    const { name, color, imageUrl } = req.body;
    const newDuck = {
        id: ducks.length ? ducks[ducks.length - 1].id + 1 : 1,
        name,
        color,
        imageUrl
    };
    ducks.push(newDuck);
    res.status(201).json({ duck: newDuck });
};

// Delete a duck
const deleteDuck = (req, res) => {
    const id = parseInt(req.params.id, 10);
    const duckIndex = ducks.findIndex(d => d.id === id);

    if (duckIndex === -1) {
        return res.status(404).json({ mssg: "Duck not found" });
    }

    const [deletedDuck] = ducks.splice(duckIndex, 1);
    res.status(200).json({ duck: deletedDuck });
};

// Update a duck
const updateDuck = (req, res) => {
    const id = parseInt(req.params.id, 10);
    const duckIndex = ducks.findIndex(d => d.id === id);

    if (duckIndex === -1) {
        return res.status(404).json({ mssg: "Duck not found" });
    }

    const updatedDuck = { ...ducks[duckIndex], ...req.body };
    ducks[duckIndex] = updatedDuck;
    res.status(200).json({ duck: updatedDuck });
};

export {
    getAllDucks,
    getRandomDuck,
    getSingleDuck,
    createDuck,
    deleteDuck,
    updateDuck
};
