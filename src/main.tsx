import { Component, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';

(class Index extends Component<unknown> {
	public static readonly main = (): void => {
		const container = document.getElementById('root');
		if (!container) throw new Error("not found $('#root')");
		const root = createRoot(container);
		root.render(<Index />);
	};
	override render(): ReactNode {
		return <p>HELLO WORLD :D</p>;
	}
}).main();
