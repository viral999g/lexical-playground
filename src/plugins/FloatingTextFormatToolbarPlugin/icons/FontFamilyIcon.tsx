import React from 'react';

const FontFamilyIcon = (props: React.SVGProps<SVGSVGElement>) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="10"
			height="10"
			viewBox="0 0 10 10"
			fill="none"
			{...props}
		>
			<path
				d="M1 3.02222V2.08648C1 1.49522 1.39871 1.02222 1.88746 1.02222H8.11254C8.60557 1.02222 9 1.50037 9 2.08648V3.02222"
				stroke="#343434"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M5 8.97778L5 0.977783"
				stroke="#343434"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M3 9.02222H7"
				stroke="#343434"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
};

export default React.memo(FontFamilyIcon);
