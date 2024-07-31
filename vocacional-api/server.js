const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors()); 


const emails = [];
const responses = [];


const weightsMatrix = [
    [2, 3, 4, 1, 5, 3],
    [1, 4, 2, 5, 3, 4],
    [5, 2, 3, 4, 1, 3],
    [4, 1, 5, 2, 4, 2],
    [3, 5, 1, 3, 2, 4],
    [2, 4, 2, 5, 3, 1],
    [4, 3, 5, 2, 1, 4],
    [5, 1, 3, 4, 2, 3],
    [3, 4, 1, 5, 4, 2],
    [2, 5, 4, 1, 3, 4],
    [4, 2, 5, 3, 1, 5],
    [5, 3, 2, 4, 2, 3],
    [3, 4, 1, 5, 4, 1],
    [2, 5, 4, 1, 3, 2],
    [4, 2, 5, 3, 1, 4]
];


app.post('/register', (req, res) => {
    const { email } = req.body;
    if (!email) {
        console.error('Email não fornecido.');
        return res.status(400).send('Email é obrigatório.');
    }
    if (emails.includes(email)) {
        console.error('Email já registrado.');
        return res.status(400).send('Email já registrado.');
    }
    emails.push(email);
    res.status(201).send('Email registrado com sucesso.');
});


app.post('/submit', (req, res) => {
    const { email, answers } = req.body;
    if (!email || !answers || !Array.isArray(answers) || answers.length !== weightsMatrix.length) {
        console.error('Dados inválidos:', req.body);
        return res.status(400).send('Email e respostas são obrigatórios.');
    }
    if (!emails.includes(email)) {
        console.error('Email não registrado.');
        return res.status(400).send('Email não registrado.');
    }
    responses.push({ email, answers });
    res.status(201).send('Respostas enviadas com sucesso.');
});


app.post('/results', (req, res) => {
    const { email } = req.body;
    if (!email) {
        console.error('Email não fornecido.');
        return res.status(400).send('Email é obrigatório.');
    }

    const userResponses = responses.find(r => r.email === email);
    if (!userResponses) {
        console.error('Respostas não encontradas para este email.');
        return res.status(404).send('Respostas não encontradas para este email.');
    }

    const categories = ['Administração', 'Pedagogia', 'Programação', 'Medicina', 'Direito', 'Engenharia'];
    const numCategories = categories.length;
    const numQuestions = weightsMatrix.length;
    const minScore = 15;
    const maxScore = 75;

    const scores = Array(numCategories).fill(0);
    

    userResponses.answers.forEach((answer, index) => {
        weightsMatrix[index].forEach((weight, categoryIndex) => {
            scores[categoryIndex] += answer * weight;
        });
    });


    const maxPossibleScore = numQuestions * Math.max(...weightsMatrix.flat());
    const scaledScores = scores.map(score => {
        const proportion = (score / maxPossibleScore);
        return Math.max(minScore, Math.min(maxScore, Math.round(proportion * (maxScore - minScore) + minScore)));
    });


    const results = categories.map((category, index) => ({
        category,
        score: scaledScores[index]
    })).sort((a, b) => b.score - a.score);

    const topResults = results.slice(0, 2);

    res.status(200).json(topResults);
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
