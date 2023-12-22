import React from 'react';

const ItalicsIcon = ({ color }: { color?: string }) => {
	return (
		<svg
			width="18"
			height="18"
			viewBox="0 0 18 18"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<rect width="18" height="18" fill="white" />
			<path
				d="M7.375 13L8.46591 6.45455H9.47159L8.38068 13H7.375ZM9.27557 5.34659C9.07955 5.34659 8.91051 5.27983 8.76847 5.14631C8.62926 5.01278 8.55966 4.85227 8.55966 4.66477C8.55966 4.47727 8.62926 4.31676 8.76847 4.18324C8.91051 4.04972 9.07955 3.98295 9.27557 3.98295C9.47159 3.98295 9.6392 4.04972 9.77841 4.18324C9.92045 4.31676 9.99148 4.47727 9.99148 4.66477C9.99148 4.85227 9.92045 5.01278 9.77841 5.14631C9.6392 5.27983 9.47159 5.34659 9.27557 5.34659Z"
				fill={color ? color : '#4F4F58'}
			/>
		</svg>
	);
};

export default ItalicsIcon;
