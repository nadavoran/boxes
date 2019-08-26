import React from "react";

import "./Box.css";

class Box extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			size: props.size,
			x:
				props.lastX != null
					? props.lastX
					: Math.max(
							0,
							Math.random() *
								(props.areaPos.right - props.areaPos.left) -
								props.size
					  ),
			y:
				props.lastY != null
					? props.lastY
					: Math.max(
							0,
							Math.random() * props.areaPos.bottom - props.size
					  )
		};
	}

	static getDerivedStateFromProps(props, state) {
		let newpos = null;
		let size = Math.min(state.size, props.maxSize);
		if (state.y + size > props.areaPos.bottom) {
			newpos = {
				y: props.areaPos.bottom - size
			};
		}
		if (state.x + size > props.areaPos.right - props.areaPos.left) {
			newpos = newpos || {};
			newpos.x = props.areaPos.right - props.areaPos.left - size;
		}
		if (state.size > size) {
			newpos = newpos || {};
			newpos.size = size;
		}
		return newpos;
	}
	componentDidMount() {
		this.updateBoxInStorage();
	}
	componentDidUpdate() {
		this.updateBoxInStorage();
	}
	componentWillUnmount() {
		let existingBoxes = JSON.parse(
			sessionStorage.getItem("existingBoxes") || "[]"
		);
		existingBoxes = existingBoxes.filter(box => {
			return box.id !== this.props.id;
		});
		sessionStorage.setItem("existingBoxes", JSON.stringify(existingBoxes));
	}

	updateBoxInStorage() {
		let existingBoxes = JSON.parse(
			sessionStorage.getItem("existingBoxes") || "[]"
		);
		let boxIndex = existingBoxes.findIndex(box => {
			return box.id === this.props.id;
		});
		let currenBox = this.getBoxData();
		if (boxIndex < 0) {
			existingBoxes.push(currenBox);
		} else {
			existingBoxes[boxIndex] = currenBox;
		}
		sessionStorage.setItem("existingBoxes", JSON.stringify(existingBoxes));
	}
	resize = event => {
		let size = Math.min(
			Math.max(20, this.state.size + event.deltaY / 2),
			this.props.maxSize
		);
		let diff = (this.state.size - size) / 2;
		document.body.style.cursor = event.deltaY > 0 ? "zoom-in" : "zoom-out";
		this.box.style.cursor = event.deltaY > 0 ? "zoom-in" : "zoom-out";
		this.setState(
			{
				size,
				x: Math.min(
					Math.max(0, this.state.x + diff),
					this.props.areaPos.right -
						this.props.areaPos.left -
						this.state.size
				),
				y: Math.min(
					Math.max(0, this.state.y + diff),
					this.props.areaPos.bottom - this.state.size
				)
			},
			() => {
				this.resizeTimeout && window.clearTimeout(this.resizeTimeout);
				this.resizeTimeout = window.setTimeout(this.resetResize, 50);
			}
		);
	};
	resetResize = () => {
		document.body.style.cursor = "";
		this.box && (this.box.style.cursor = "");
	};
	getBoxData = () => {
		return {
			id: this.props.id,
			size: this.state.size,
			color: this.props.color,
			lastX: this.state.x,
			lastY: this.state.y
		};
	};
	deleteBox = () => {
		// if (this.mooving) return;
		this.props.onDelete(this.getBoxData());
	};
	startMove = event => {
		document.addEventListener("mousemove", this.moveBox);
		document.addEventListener("mouseup", this.releaseBox);
		let pos = this.box.getBoundingClientRect();
		this.lastY = event.clientY;
		this.lastX = event.clientX;
		this.relative = {
			top: pos.top - event.clientY,
			bottom: event.clientY - pos.bottom,
			left: event.clientX - pos.left,
			right: pos.right - event.clientX
		};
		event.preventDefault();
	};
	moveBox = event => {
		let changeY = event.clientY - this.lastY;
		let changeX = event.clientX - this.lastX;
		this.mooving =
			this.mooving ||
			Math.max(Math.abs(changeY), Math.abs(changeY)) > 0.01;
		document.body.style.cursor = "grabbing";
		this.box.style.cursor = "grabbing";
		if (event.clientY + this.relative.top < this.props.areaPos.top) {
			this.setState({
				y: 0
			});
			return;
		}
		if (event.clientY - this.relative.bottom > this.props.areaPos.bottom) {
			this.setState({
				y: this.props.areaPos.bottom - this.state.size
			});
			return;
		}
		if (event.clientX - this.relative.left < this.props.areaPos.left) {
			this.setState({
				x: 0
			});
			return;
		}
		if (event.clientX + this.relative.right > this.props.areaPos.right) {
			this.setState({
				x:
					this.props.areaPos.right -
					this.props.areaPos.left -
					this.state.size
			});
			return;
		}
		// calculate the move based on the distance compare the a size of a level
		this.lastY = event.clientY;
		this.lastX = event.clientX;
		this.setState({
			y: this.state.y + changeY,
			x: this.state.x + changeX
		});
	};
	releaseBox = event => {
		event.preventDefault(true);
		document.removeEventListener("mousemove", this.moveBox);
		document.removeEventListener("mouseup", this.releaseBox);
		document.body.style.cursor = null;
		this.box.style.cursor = null;
		if (!this.mooving) {
			this.deleteBox();
		}
		this.mooving = false;
	};
	render() {
		let transform = `translate3d(${this.state.x}px, ${this.state.y}px, 10px)`;
		return (
			<div
				ref={r => (this.box = r)}
				className='box'
				style={{
					height: this.state.size + "px",
					width: this.state.size + "px",
					borderColor: this.props.color,
					// backgroundColor: this.props.color,
					transform
				}}
				onWheel={this.resize}
				onMouseDown={this.startMove}
				title={
					"Click the box to remove it or scroll to change size or drag to move"
				}
			></div>
		);
	}
}

export default Box;
