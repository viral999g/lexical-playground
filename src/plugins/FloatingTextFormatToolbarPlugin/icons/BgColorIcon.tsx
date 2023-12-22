import React from 'react';

const BgColorIcon = (props: React.SVGProps<SVGSVGElement>) => {
	return (
		<svg
			width="12"
			height="12"
			viewBox="0 0 12 12"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<g clipPath="url(#clip0_8341_19328)">
				<path
					d="M1.8853 7.77998L3.6153 9.50998C4.8303 10.725 5.2453 10.705 6.4453 9.50998L9.2303 6.72498C10.2003 5.75498 10.4453 5.10998 9.2303 3.89498L7.5003 2.16498C6.2053 0.869982 5.6403 1.19498 4.6703 2.16498L1.8853 4.94998C0.690298 6.14998 0.590298 6.48498 1.8853 7.77998Z"
					stroke="#343434"
					strokeWidth="0.8"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M9.59974 8.39501L9.26974 8.94001C8.80474 9.71501 9.16474 10.35 10.0697 10.35C10.9747 10.35 11.3347 9.71501 10.8697 8.94001L10.5397 8.39501C10.2797 7.96501 9.85474 7.96501 9.59974 8.39501Z"
					stroke="#343434"
					strokeWidth="0.6"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M1 6.11991C3.78 5.36491 6.71 5.33991 9.5 6.05491L9.75 6.11991"
					stroke="#343434"
					strokeWidth="0.8"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</g>
			<defs>
				<clipPath id="clip0_8341_19328">
					<rect width="12" height="12" fill="white" />
				</clipPath>
			</defs>
		</svg>
	);
};

export default BgColorIcon;
