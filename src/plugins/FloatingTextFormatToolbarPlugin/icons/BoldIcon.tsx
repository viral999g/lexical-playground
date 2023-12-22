import React from 'react';

const BoldIcon = ({ color }: { color?: string }) => {
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
				d="M5.75852 13V4.27273H9.25284C9.89489 4.27273 10.4304 4.3679 10.8594 4.55824C11.2884 4.74858 11.6108 5.01278 11.8267 5.35085C12.0426 5.68608 12.1506 6.07244 12.1506 6.50994C12.1506 6.85085 12.0824 7.15057 11.946 7.40909C11.8097 7.66477 11.6222 7.875 11.3835 8.03977C11.1477 8.2017 10.8778 8.31676 10.5739 8.38494V8.47017C10.9063 8.48437 11.2173 8.57812 11.5071 8.75142C11.7997 8.92472 12.0369 9.16761 12.2188 9.48011C12.4006 9.78977 12.4915 10.1591 12.4915 10.5881C12.4915 11.0511 12.3764 11.4645 12.1463 11.8281C11.919 12.1889 11.5824 12.4744 11.1364 12.6847C10.6903 12.8949 10.1406 13 9.48722 13H5.75852ZM7.60369 11.4915H9.10795C9.62216 11.4915 9.99716 11.3935 10.233 11.1974C10.4688 10.9986 10.5866 10.7344 10.5866 10.4048C10.5866 10.1634 10.5284 9.95028 10.4119 9.76562C10.2955 9.58097 10.1293 9.43608 9.91335 9.33097C9.70028 9.22585 9.44602 9.1733 9.15057 9.1733H7.60369V11.4915ZM7.60369 7.92472H8.97159C9.22443 7.92472 9.44886 7.88068 9.64489 7.79261C9.84375 7.7017 10 7.57386 10.1136 7.40909C10.2301 7.24432 10.2884 7.04688 10.2884 6.81676C10.2884 6.50142 10.1761 6.24716 9.9517 6.05398C9.73011 5.8608 9.41477 5.7642 9.00568 5.7642H7.60369V7.92472Z"
				fill={color ? color : '#4F4F58'}
			/>
		</svg>
	);
};

export default BoldIcon;
