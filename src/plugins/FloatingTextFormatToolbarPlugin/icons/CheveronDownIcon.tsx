import * as React from 'react';

function CheveronDownIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="8"
			height="8"
			viewBox="0 0 8 8"
			fill="none"
			{...props}
		>
			<path
				d="M6.5 2.75L4 5.25L1.5 2.75"
				stroke="#8F8F8F"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

export default React.memo(CheveronDownIcon);
