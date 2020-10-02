'use strict';
const React = require('react');
const { useState, useEffect, useContext } = require('react');
const {Text, Color, Box, useStdin} = require('ink');
const useInterval = require('./useInterval')
const importJsx = require('import-jsx');

const EndScreen = importJsx('./EndScreen')

const fieldSize = 16
const fieldRow = [...new Array(fieldSize).keys()]

let foodItem = {
	x: Math.floor(Math.random() * fieldSize),
	y: Math.floor(Math.random() * fieldSize)
}
const ARROW_UP = "\u001B[A"
const ARROW_RIGHT = "\u001B[C"
const ARROW_LEFT = "\u001B[D"
const ARROW_DOWN = "\u001B[B"

const DIRECTION = {
	RIGHT: {x: 1, y: 0},
	LEFT: {x:-1, y: 0},
	TOP: {x:0, y: -1},
	BOTTOM: {x:0, y: 1},
}

function getItem(x, y, tail, head, direction) {

	if (foodItem.x === x && foodItem.y === y) {
		return <Text color='red'> &#10084; </Text>
	}
	if (x === head.x && y == head.y) {
		// console.log(direction);
		if (direction == DIRECTION.TOP) {
			return <Text color='#005cc5'> &#9650; </Text>
		}
		if (direction == DIRECTION.BOTTOM) {
			return <Text color='#005cc5'> &#9660; </Text>
		}
		if (direction == DIRECTION.LEFT) {
			return <Text color='#005cc5'> &#9668; </Text>
		}
		if (direction == DIRECTION.RIGHT) {
			return <Text color='#005cc5'> &#9658; </Text>
		}
		// return <Text color='blue'> + </Text>
	}
	for(const segment of tail) {
		if(segment.x === x && segment.y === y) {
			return <Text color='green'> &#10033; </Text>
		}
	}
}

function limitByField(k) {
	if (k >= fieldSize) {
		return 0
	}
	if (k < 0) {
		return fieldSize - 1
	}
	return k
}

function newSnakePosition(segments, direction, setScore, score) {
	const [head] = segments
	const newHead = {
	// return segments.map(segment => ({
		x: limitByField(head.x + direction.x),
		y: limitByField(head.y + direction.y)
	}
	if (collidesWithFood(newHead, foodItem)) {
		setScore(score + 1)
		foodItem = {
			x: Math.floor(Math.random() * fieldSize),
			y: Math.floor(Math.random() * fieldSize)
		}
		return [newHead, ...segments]
	}
	return [newHead, ...segments.slice(0, -1)]
}

function collidesWithFood(head, foodItem) {
	return head.x === foodItem.x && head.y === foodItem.y
}

const App = () => {
	const { stdin, setRawMode } = useStdin();
	const [ snakeSegments, setSnakeSegments ] = useState([
		{x: 8, y:8},
		{x: 8, y:7},
		{x: 8, y:6},
	])

	const [direction, setDirection] = useState(DIRECTION.LEFT)
	const [score, setScore] = useState(0)

	useEffect(() => {
		setRawMode(true)
		stdin.on('data', data => {
			const value = data.toString()
			if (value == ARROW_UP) {
				setDirection(DIRECTION.TOP)
			}
			if (value == ARROW_DOWN) {
				setDirection(DIRECTION.BOTTOM)
			}
			if (value == ARROW_LEFT) {
				setDirection(DIRECTION.LEFT)
			}
			if (value == ARROW_RIGHT) {
				setDirection(DIRECTION.RIGHT)
			}
		})
	}, [])

	const [head, ...tail] = snakeSegments

	const intersectsWithItSelf = tail.some(segment => segment.x == head.x && segment.y == head.y)

	useInterval(() => {
		setSnakeSegments(segments => newSnakePosition(segments, direction, setScore, score))
	}, intersectsWithItSelf ? null : 100)

	return (
		<Box flexDirection='column' alignItems='center'>
			<Text>
				<Text color='green'>Snake</Text> game
			</Text>
			{intersectsWithItSelf ? (
				<EndScreen size={fieldSize} />
			) : (
				<Box flexDirection='column'>
					{fieldRow.map((y) => (
						<Box key={y}>
							{fieldRow.map((x) => (
								<Box key={x}>{getItem(x, y, tail, head, direction) || (<Text> . </Text>)}</Box>
							))}
						</Box>
					))}
				</Box>

			)}
			<Box>
				<Text color='blue' bold={true}> </Text>
			</Box>
			<Box>
				<Text color='blue' bold={true}>Your score: {score}</Text>
			</Box>
		</Box>
	)

};

module.exports = App;
