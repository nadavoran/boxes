import React from "react";
import "./ColorInput.css";

function ColorInput({
	className = "",
	color = "#ebebeb",
	changeColor = () => {}
}) {
	return (
		<div
			className={"color-overlay " + className}
			style={{ backgroundColor: color }}
		>
			<input
				type='color'
				className='color-input'
				value={color}
				onChange={changeColor}
				style={{ backgroundColor: color }}
			/>
		</div>
	);
}

export default ColorInput;
