class GameMemory {
    constructor(cards) {
        this.cardBlack = 'assets/card_blank.png'
        this.cardBackSide = 'assets/card_back_side.png'
        this.players = []
        this.cards = cards

        this.fsm = new StateMachine({
            init: 'creatingPlayer',
            transitions: [
                { name: 'running', from: 'creatingPlayer', to: 'start' },
                { name: 'flipingCard', from: 'start', to: 'playing' },
                { name: 'flipingCard', from: 'waiting', to: 'playing' },
                { name: 'waitingPlayer', from: 'playing', to: 'waiting' },
                { name: 'gameOver', from: 'playing', to: 'gameWin' },
                { name: 'gameOver', from: 'waiting', to: 'gameWin' },
            ],
            methods: {
                onRunning: () => {
                    console.log('Game running!')
                    this.createBoard()
                    this.changePlayer()
                },
                onFlipingCard: () => {
                    console.log('onFlipingCard!')
                },
                onWaitingPlayer: () => {
                    console.log('onWaitingPlayer!')
                },
                onGameOver: () => {
                    console.log('Game Over!')
                    showAlert(`O jogador ${this.currentPlayer.name} venceu!!!`)
                }
            }
        })
        this.initEvents()
    }

    changePlayer() {
        if (!this.currentPlayer || this.players.length === 1) {
            this.currentPlayer = this.players[0]
        } else {
            document.querySelector('#' + this.currentPlayer.isPlayingId).className = ''
            const playerId = this.currentPlayer.id
            const nextId = playerId + 1
            if (nextId < this.players.length) {
                this.currentPlayer = this.players[nextId]
            } else {
                this.currentPlayer = this.players[0]
            }
        }
        document.querySelector('#' + this.currentPlayer.isPlayingId).className = 'playing'
    }

    checkForWin(gameMemory) {
        const totalScore = gameMemory.players.reduce((acc, player) => {
            return acc + player.score.value
        }, 0)

        if (totalScore * 2 >= gameMemory.cards.length) {
            gameMemory.fsm.gameOver()
        }
    }

    checkForMatch(gameMemory) {
        const currentPlayer = gameMemory.currentPlayer
        const cardPrevious = currentPlayer.cardsChosen[0]
        const cardCurrent = currentPlayer.cardsChosen[1]

        const cardImgPrevious = document.querySelector(`#card_${cardPrevious.name}_${cardPrevious.id}`)
        const cardImgCurrent = document.querySelector(`#card_${cardCurrent.name}_${cardCurrent.id}`)

        if (cardPrevious.name === cardCurrent.name) {
            showNotification('Parabéns! Encontrou uma carta.');
            currentPlayer.score.value = currentPlayer.score.value + 1;
            document.querySelector('#' + currentPlayer.score.id).textContent = currentPlayer.score.value
            cardImgPrevious.setAttribute('src', this.cardBlack)
            cardImgCurrent.setAttribute('src', this.cardBlack)

            setTimeout(() => {
                gameMemory.checkForWin(this)
            }, 500)
        } else {
            setTimeout(() => {
                cardImgPrevious.setAttribute('src', this.cardBackSide)
                cardImgCurrent.setAttribute('src', this.cardBackSide)
                gameMemory.changePlayer()
            }, 500)
        }
        currentPlayer.cardsChosen = []
    }

    flipCard(selectedImageCard, gameMemory) {
        const imgUrl = selectedImageCard.getAttribute('src')
        if (imgUrl !== gameMemory.cardBackSide) {
            showNotification('Não pode virar esta carta.', ALERT_TYPE.waning)
            return
        }

        if (gameMemory.fsm.is('waiting') || gameMemory.fsm.is('start')) {
            gameMemory.fsm.flipingCard()
        } else {
            return
        }

        const cardId = selectedImageCard.getAttribute('data-id')
        const cardData = this.cards[cardId]
        const selectedCard = {
            id: cardId,
            name: cardData.name,
        }
        gameMemory.currentPlayer.cardsChosen.push(selectedCard)

        if (gameMemory.currentPlayer.cardsChosen.length === 2) {
            setTimeout(() => {
                gameMemory.checkForMatch(this)
            }, 500)
        } else if (gameMemory.currentPlayer.cardsChosen.length > 2) {
            gameMemory.currentPlayer.cardsChosen.pop()
            gameMemory.fsm.waitingPlayer()
            return;
        }

        selectedImageCard.setAttribute('src', cardData.img)
        gameMemory.fsm.waitingPlayer()
    }

    createBoard() {
        const cards = document.querySelector('.cards')

        for (let i = 0; i < this.cards.length; i++) {
            const card = document.createElement('img')
            const cardId = `card_${this.cards[i].name}_${i}`

            card.setAttribute('src', this.cardBackSide)
            card.setAttribute('data-id', i)
            card.setAttribute('id', cardId)
            card.addEventListener('click', (e) => {
                this.flipCard(e.target, this)
            })
            cards.appendChild(card)
        }
    }

    addPalyersHead(players) {
        players.innerHTML = ''

        const nameLabel = document.createElement('label')
        nameLabel.textContent = 'Nome'
        const scoreLabel = document.createElement('label')
        scoreLabel.textContent = 'Placar'
        scoreLabel.style = 'text-align: center'
        const emptyLabel = document.createElement('label')
        emptyLabel.textContent = ''
        emptyLabel.style = 'text-align: center'

        players.appendChild(nameLabel)
        players.appendChild(scoreLabel)
        players.appendChild(emptyLabel)
    }

    initEvents() {
        const form = document.querySelector('form')
        const newPlayerBtn = document.querySelector('#newPlayerBtn')
        const playerName = document.querySelector('#playerName')
        const removeAllPlayersBtn = document.querySelector('#removeAllPlayersBtn')
        const startGameBtn = document.querySelector('#startGameBtn')
        const restartGameBtn = document.querySelector('#restartGameBtn')
        const players = document.querySelector('.players')
        this.addPalyersHead(players)

        let playerCount = 0;

        newPlayerBtn.addEventListener('click', (e) => {
            const name = document.createElement('span')
            const score = document.createElement('span')
            const isPlaying = document.createElement('span')

            const playerNameValue = playerName.value || `Jogador ${++playerCount}`
            const playerFormatted = playerNameValue.replace(' ', '').toLowerCase()

            isPlaying.id = `playing_${playerFormatted}`
            name.textContent = playerNameValue
            score.textContent = 0
            score.id = `score_${playerFormatted}`
            score.style = 'text-align: center'

            this.players.push({
                id: this.players.length,
                name: playerNameValue,
                score: {
                    id: score.id,
                    value: 0,
                },
                isPlayingId: isPlaying.id,
                cardsChosen: []
            })

            players.appendChild(name)
            players.appendChild(score)
            players.appendChild(isPlaying)
        })

        removeAllPlayersBtn.addEventListener('click', (e) => {
            playerCount = 0;

            this.addPalyersHead(players)
            this.players = []
        })

        startGameBtn.addEventListener('click', (e) => {
            if (this.players.length < 1) {
                showAlert('Precisa de no mínimo 1 jogador para começar!')
                return
            }
            this.fsm.running()
            startGameBtn.disabled = true
            restartGameBtn.disabled = false
            newPlayerBtn.disabled = true
            removeAllPlayersBtn.disabled = true
            playerName.disabled = true
            form.reset()
        })
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new GameMemory(cardsData)
    document.querySelector('#restartGameBtn').addEventListener('click', () => {
        location.reload()
    })
})
