import React from "react";
import { Box } from "./";
import { ColorInput } from "./shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faUndo } from "@fortawesome/free-solid-svg-icons";

import "./Board.css";

class Board extends React.Component {
	constructor(props) {
		super(props);
		let byColor = new Map();
		let defaultBox = {
			id: 1,
			size: 100,
			color: "#3498db"
		};
		let historyBoxes = JSON.parse(
			sessionStorage.getItem("historyBoxes") || "[]"
		);
		let existingBoxes = JSON.parse(
			sessionStorage.getItem("existingBoxes") || "[]"
		);
		if (!existingBoxes.length) {
			existingBoxes.push(defaultBox);
		}
		existingBoxes.forEach(item => {
			if (byColor.get(item.color)) {
				byColor.set(item.color, byColor.get(item.color) + 1);
			} else {
				byColor.set(item.color, 1);
			}
		});
		this.state = {
			existings: existingBoxes || [defaultBox],
			nextColor: "#3498db",
			nextSize: 80,
			areaPos: {
				top: 0,
				bottom: window.innerHeight - 2,
				left: 250,
				right: window.innerWidth
			},
			maxSize: Math.min(window.innerWidth - 2, window.innerHeight - 2),
			byColor,
			history: historyBoxes || []
		};
	}
	componentDidMount() {
		window.addEventListener("resize", () => {
			this.barAreaDebounce && window.clearTimeout(this.barAreaDebounce);
			this.barAreaDebounce = window.setTimeout(this.updateBarsArea, 200);
		});
		this.updateBarsArea();
		sessionStorage.setItem(
			"historyBoxes",
			JSON.stringify(this.state.history)
		);
	}
	componentDidUpdate() {
		sessionStorage.setItem(
			"historyBoxes",
			JSON.stringify(this.state.history)
		);
	}
	updateBarsArea = () => {
		// if we want to change chart size need to upda the diff
		let pos = this.mainArea.getBoundingClientRect();
		// if (this.state.areaPos.top !== pos.top) {
		this.setState({
			maxSize: Math.floor(
				Math.min(
					this.mainArea.offsetWidth - 2,
					this.mainArea.offsetHeight - 2
				)
			),
			areaPos: {
				top: pos.top,
				bottom: pos.bottom - 2,
				left: pos.left,
				right: pos.right
			}
		});
		// }
	};
	setBoxMax = () => {
		this.setState({
			maxSize: Math.floor(
				Math.min(this.mainArea.offsetWidth, this.mainArea.offsetHeight)
			)
		});
	};
	changeColor = event => {
		this.setState({
			nextColor: event.target.value
		});
	};
	changeSize = event => {
		this.setState({
			nextSize: Math.min(
				Math.max(20, event.target.value),
				this.state.maxSize
			)
		});
	};
	createBox = () => {
		let boxData = {
			size: this.state.nextSize,
			color: this.state.nextColor,
			id: this.state.existings.length + this.state.history.length + 1
		};
		let byColor = new Map(this.state.byColor);
		if (!byColor.has(boxData.color)) {
			byColor.set(boxData.color, 1);
		} else {
			// byColor.set(boxData.color,byColor.get(boxData.color).counter++;
			byColor.set(boxData.color, byColor.get(boxData.color) + 1);
		}
		let existings = [...this.state.existings];
		existings.push(boxData);
		this.setState({
			existings,
			byColor
		});
	};
	deleteBox = box => {
		let history = [...this.state.history];
		history.splice(0, 0, box);
		let existings = this.state.existings.filter(item => {
			return item.id !== box.id;
		});
		let byColorCount = this.state.byColor.get(box.color);
		let byColor = new Map(this.state.byColor);
		if (--byColorCount) {
			byColor.set(box.color, byColorCount);
		} else {
			byColor.delete(box.color);
		}
		this.setState({
			history,
			existings,
			byColor
		});
	};
	reviveBox = event => {
		let boxId = event.currentTarget.getAttribute("name");
		let boxIndex = this.state.history.findIndex(item => {
			return item.id === 1 * boxId;
		});
		let existings = [...this.state.existings];
		let boxData = this.state.history[boxIndex];
		existings.push(boxData);
		let history = [...this.state.history];
		history.splice(boxIndex, 1);
		let byColor = new Map(this.state.byColor);
		if (!byColor.has(boxData.color)) {
			byColor.set(boxData.color, 1);
		} else {
			// byColor.set(boxData.color,byColor.get(boxData.color).counter++;
			byColor.set(boxData.color, byColor.get(boxData.color) + 1);
		}
		console.log(JSON.stringify(this.state.history[boxIndex]));
		this.setState({
			history,
			existings,
			byColor
		});
	};
	shrink = () => {
		console.log("Shrink");
		this.setState(
			{
				shrink: !this.state.shrink
			},
			this.updateBarsArea
		);
	};
	resetBoard = () => {
		let byColor = new Map();
		let defaultBox = {
			id: 1,
			size: 100,
			color: "#3498db"
		};
		byColor.set(defaultBox.color, 1);
		this.setState({
			existings: [defaultBox],
			nextColor: "#3498db",
			nextSize: 80,
			byColor,
			history: []
		});
	};
	renderColors() {
		let res = [];

		// fix color name and limit height

		this.state.byColor.forEach((counter, color) => {
			res.push(
				<div
					key={"color-" + color}
					className='panel-item'
					style={{ color: color }}
					title={`${counter} boxes with ${color} color`}
				>
					<ColorInput
						className='color-input'
						disabled
						changeColor={this.changeColor}
						color={color}
					/>
					<div>{counter}</div>
				</div>
			);
		});
		return res;
	}
	render() {
		return (
			<div className='board-container'>
				<div
					ref={r => (this.leftPanel = r)}
					className={`left-panel ${
						this.state.shrink ? "shrink" : ""
					} ${this.state.shrinking ? "shrinking" : ""}`}
				>
					<button className='shrink-btn' onClick={this.shrink}>
						<FontAwesomeIcon icon={faChevronLeft} />
					</button>

					<div className='panel-item top'>
						<ColorInput
							className='color-input'
							disabled
							changeColor={this.changeColor}
							color={this.state.nextColor}
						/>
						<input
							type='number'
							className='next-size'
							value={this.state.nextSize}
							onChange={this.changeSize}
						/>
					</div>
					<button
						className='create-box row-btn'
						onClick={this.createBox}
					>
						Create Box
					</button>
					<div className='panel-area existings'>
						<h4>Colors</h4>
						<div className='scroll-area'>{this.renderColors()}</div>
					</div>
					<div className='panel-area history'>
						<h4>History</h4>
						<div className='scroll-area'>
							{this.state.history.map(box => {
								return (
									<div
										key={"history" + box.id}
										className='panel-item history'
										name={box.id}
										style={{ color: box.color }}
										onClick={this.reviveBox}
										title={`Click to revive box`}
									>
										<div
											className='history-box-id'
											name={box.id}
										>
											Box {box.id}
										</div>
										{/* <div name={box.id}>{box.color}</div> */}
										<div
											className='history-box-size'
											name={box.id}
										>
											{box.size}
										</div>
										{/* <span
											// name={box.id}
											className='revive-item'
											// onClick={this.reviveBox}
										> */}
										<FontAwesomeIcon
											icon={faUndo}
											// name={box.id}
											readOnly
											className='revive-item'
											// onClick={this.reviveBox}
										/>
										{/* </span> */}
									</div>
								);
							})}
						</div>
					</div>
					<button
						className='reset-btn row-btn'
						onClick={this.resetBoard}
					>
						Reset
					</button>
				</div>
				<div ref={r => (this.mainArea = r)} className='main-area'>
					{this.state.existings.map(box => {
						return (
							<Box
								key={"box" + box.id}
								id={box.id}
								color={box.color}
								size={box.size}
								lastX={box.lastX}
								lastY={box.lastY}
								areaPos={this.state.areaPos}
								maxSize={this.state.maxSize}
								onDelete={this.deleteBox}
							/>
						);
					})}
				</div>
			</div>
		);
	}
}

export default Board;
