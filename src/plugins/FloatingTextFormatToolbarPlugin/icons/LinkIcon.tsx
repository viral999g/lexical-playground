import React from 'react';

type Props = {};

const LinkIcon = ({ color }: { color?: string }) => {
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
				d="M7.26562 10.7353L10.735 7.26587"
				stroke="#141416"
				strokeWidth="1.02787"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M8.42188 5.53115L8.6896 5.22122C9.23187 4.67903 9.96731 4.37446 10.7341 4.37451C11.501 4.37457 12.2364 4.67924 12.7786 5.22151C13.3208 5.76378 13.6253 6.49922 13.6253 7.26605C13.6252 8.03288 13.3205 8.76828 12.7783 9.31047L12.4695 9.57877"
				stroke="#141416"
				strokeWidth="1.02787"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M9.57917 12.4697L9.34961 12.7785C8.80101 13.321 8.06061 13.6253 7.28908 13.6253C6.51755 13.6253 5.77715 13.321 5.22855 12.7785C4.95815 12.5111 4.74347 12.1928 4.59696 11.8419C4.45044 11.4909 4.375 11.1145 4.375 10.7342C4.375 10.3539 4.45044 9.97741 4.59696 9.62649C4.74347 9.27558 4.95815 8.95721 5.22855 8.68984L5.53155 8.42212"
				stroke="#141416"
				strokeWidth="1.02787"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
};

export default LinkIcon;
